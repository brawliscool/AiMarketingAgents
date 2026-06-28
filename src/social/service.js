import { createHash, randomBytes, randomUUID } from "node:crypto";
import { localSocialStore } from "./store.js";
import { normalizePlatform, platformProfiles, supportedPlatforms } from "./types.js";

function credentialsFor(platform) {
  const profile = platformProfiles[platform];
  return {
    clientId: process.env[profile.env.clientId] || "",
    clientSecret: process.env[profile.env.clientSecret] || "",
    redirectUri: process.env[profile.env.redirectUri] || "",
  };
}

function redactToken(token) {
  if (!token) return null;
  return createHash("sha256").update(token).digest("hex").slice(0, 12);
}

function base64Url(buffer) {
  return Buffer.from(buffer).toString("base64url");
}

function pkceChallenge(verifier) {
  return createHash("sha256").update(verifier).digest("base64url");
}

function cleanProviderValue(value, maxLength = 250) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, maxLength);
}

function publicIntegration(platform, raw) {
  const profile = platformProfiles[platform];
  const creds = credentialsFor(platform);
  const expiresAt = raw?.expiresAt || null;
  const needsReconnect = expiresAt ? Date.parse(expiresAt) <= Date.now() : false;

  return {
    platform,
    name: profile.name,
    description: profile.description,
    configured: Boolean(creds.clientId && creds.clientSecret && creds.redirectUri),
    status: raw ? (needsReconnect ? "needs_reconnect" : "connected") : "disconnected",
    lastSyncAt: raw?.lastSyncAt || null,
    scopes: raw?.scopes || profile.scopes,
    expiresAt,
    username: raw?.username || null,
    tokenFingerprint: raw?.tokenFingerprint || null,
    analytics: raw?.analytics || { reach: 0, queued: 0, errors: 0 },
  };
}

function authUrlFor(platform, state, codeVerifier) {
  const profile = platformProfiles[platform];
  const creds = credentialsFor(platform);
  if (!creds.clientId || !creds.clientSecret || !creds.redirectUri) {
    const missing = Object.entries(profile.env)
      .filter(([, key]) => !process.env[key])
      .map(([, key]) => key);
    const error = new Error(`Missing OAuth configuration for ${profile.name}`);
    error.status = 503;
    error.missing = missing;
    throw error;
  }

  const url = new URL(profile.authUrl);
  url.searchParams.set("client_id", creds.clientId);
  url.searchParams.set("redirect_uri", creds.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  url.searchParams.set("scope", profile.scopes.join(" "));
  if (platform === "reddit") url.searchParams.set("duration", "permanent");
  if (platform === "x") {
    url.searchParams.set("code_challenge", pkceChallenge(codeVerifier));
    url.searchParams.set("code_challenge_method", "S256");
  }
  return url.toString();
}

async function exchangeCode(platform, code, stateRecord) {
  const profile = platformProfiles[platform];
  const creds = credentialsFor(platform);
  const safeCode = cleanProviderValue(code, 2_000);
  if (!safeCode) {
    const error = new Error("Missing authorization code");
    error.status = 400;
    throw error;
  }

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", safeCode);
  body.set("redirect_uri", creds.redirectUri);

  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  if (platform === "reddit") {
    headers.Authorization = `Basic ${Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64")}`;
  } else {
    body.set(platform === "tiktok" ? "client_key" : "client_id", creds.clientId);
    body.set("client_secret", creds.clientSecret);
    if (platform === "x") {
      body.set("code_verifier", stateRecord.codeVerifier || "");
    }
  }

  const response = await fetch(profile.tokenUrl, { method: "POST", headers, body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error_description || data?.error || data?.message || "Token exchange failed");
    error.status = response.status === 429 ? 429 : 502;
    throw error;
  }
  return data;
}

export const socialService = {
  supportedPlatforms,
  getAllStatus() {
    const integrations = localSocialStore.list();
    return supportedPlatforms.map((platform) => publicIntegration(platform, integrations[platform]));
  },
  getStatus(platform) {
    return publicIntegration(platform, localSocialStore.get(platform));
  },
  connect(platform) {
    const state = base64Url(randomBytes(32));
    const codeVerifier = platform === "x" ? base64Url(randomBytes(32)) : null;
    localSocialStore.saveState(state, { platform, codeVerifier });
    return { authUrl: authUrlFor(platform, state, codeVerifier), state };
  },
  async callback(platform, { code, state }) {
    const safeState = cleanProviderValue(state, 128);
    if (!safeState) {
      const error = new Error("Missing OAuth state");
      error.status = 400;
      throw error;
    }

    const stateRecord = localSocialStore.consumeState(safeState);
    if (!stateRecord || stateRecord.platform !== platform || Date.now() - stateRecord.createdAt > 10 * 60 * 1000) {
      const error = new Error("Invalid or expired OAuth state");
      error.status = 400;
      throw error;
    }

    const token = await exchangeCode(platform, code, stateRecord);
    const accessToken = cleanProviderValue(token.access_token || token.data?.access_token, 4_096);
    if (!accessToken) {
      const error = new Error("OAuth provider did not return an access token");
      error.status = 502;
      throw error;
    }

    const now = Date.now();
    const expiresIn = Math.max(60, Math.min(Number(token.expires_in || token.data?.expires_in || 3600), 60 * 60 * 24 * 90));
    return localSocialStore.save(platform, {
      accessToken,
      refreshToken: cleanProviderValue(token.refresh_token || token.data?.refresh_token, 4_096) || null,
      expiresAt: new Date(now + expiresIn * 1000).toISOString(),
      scopes: token.scope ? String(token.scope).split(/[,\s]+/).filter(Boolean).slice(0, 50) : platformProfiles[platform].scopes,
      username: cleanProviderValue(token.username || token.user_name || token.data?.open_id || `${platform}_account`, 160),
      tokenFingerprint: redactToken(accessToken),
      lastSyncAt: new Date().toISOString(),
      analytics: { reach: 0, queued: 0, errors: 0 },
    });
  },
  disconnect(platform) {
    localSocialStore.disconnect(platform);
    return { ok: true };
  },
  refresh(platform) {
    const existing = localSocialStore.get(platform);
    if (!existing?.refreshToken) {
      const error = new Error("No refresh token is available for this platform");
      error.status = 409;
      throw error;
    }
    return localSocialStore.save(platform, {
      ...existing,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      lastSyncAt: new Date().toISOString(),
    });
  },
  publish(platform, payload) {
    const integration = localSocialStore.get(platform);
    if (!integration) {
      return {
        success: false,
        platform,
        externalId: null,
        status: "not_connected",
        errors: [`${platformProfiles[platform].name} is not connected`],
      };
    }
    return {
      success: true,
      platform,
      externalId: `${platform}_${randomUUID()}`,
      status: payload.scheduledAt ? "scheduled" : "queued",
      errors: [],
    };
  },
  getProfile(platform) {
    return this.getStatus(platform);
  },
  getPermissions(platform) {
    return this.getStatus(platform).scopes;
  },
};

export function parsePlatformOrThrow(platform) {
  const normalized = normalizePlatform(platform);
  if (!normalized) {
    const error = new Error("Unsupported platform");
    error.status = 404;
    throw error;
  }
  return normalized;
}

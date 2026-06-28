import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { withSupabase } from "@supabase/server";
import { parsePlatformOrThrow, socialService } from "./src/social/service.js";

const root = process.cwd();
const distDir = resolve(root, "dist");
const envPath = resolve(root, ".env.local");
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";
const MAX_JSON_BODY_BYTES = 128_000;
const MAX_PUBLISH_BODY_BYTES = 32_000;
const API_WINDOW_MS = 60_000;
const API_MAX_REQUESTS = 90;
const AGENT_MAX_REQUESTS = 12;

function loadEnvFile() {
  if (!existsSync(envPath)) {
    return {};
  }

  const raw = readFileSync(envPath, "utf8");
  return raw.split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return acc;
    const index = trimmed.indexOf("=");
    if (index === -1) return acc;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^[']|[']$/g, "").replace(/^["]|["]$/g, "");
    if (/^[A-Z0-9_]+$/i.test(key)) acc[key] = value;
    return acc;
  }, {});
}

const env = loadEnvFile();
for (const [key, value] of Object.entries(env)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
}

if (!process.env.SUPABASE_PUBLISHABLE_KEY && process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  process.env.SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || "";
const openAiCompatibleBaseUrl = normalizeTrustedBaseUrl(
  process.env.OPENAI_COMPATIBLE_BASE_URL || "https://api.openai.com/v1",
  "https://api.openai.com/v1",
);
const metaGraphApiBaseUrl = normalizeTrustedBaseUrl(
  process.env.META_GRAPH_API_BASE_URL || "https://graph.facebook.com/v25.0",
  "https://graph.facebook.com/v25.0",
);

const allowedOrigins = new Set([
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  ...(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const rateBuckets = new Map();

function normalizeTrustedBaseUrl(value, fallback) {
  try {
    const parsed = new URL(value);
    const isLocal = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
    if (parsed.protocol !== "https:" && !(isLocal && parsed.protocol === "http:")) return fallback;
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://i.pravatar.cc",
      "connect-src 'self' http://127.0.0.1:8787 http://localhost:8787",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join("; "),
  );
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Max-Age", "600");
}

function sendJson(req, res, status, payload) {
  setSecurityHeaders(res);
  setCorsHeaders(req, res);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function sendMethodNotAllowed(req, res, allowed) {
  setSecurityHeaders(res);
  setCorsHeaders(req, res);
  res.writeHead(405, {
    "Content-Type": "application/json; charset=utf-8",
    Allow: allowed.join(", "),
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify({ error: "Method not allowed" }));
}

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}

function checkRateLimit(req, scope, limit) {
  const key = `${scope}:${clientIp(req)}`;
  const now = Date.now();
  const bucket = rateBuckets.get(key) || { resetAt: now + API_WINDOW_MS, count: 0 };
  if (bucket.resetAt <= now) {
    bucket.resetAt = now + API_WINDOW_MS;
    bucket.count = 0;
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  return bucket.count <= limit;
}

function readRawBody(req, limit = MAX_JSON_BODY_BYTES) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    let received = 0;

    req.on("data", (chunk) => {
      received += chunk.length;
      if (received > limit) {
        rejectBody(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("error", rejectBody);
    req.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf8")));
  });
}

async function readJsonBody(req, limit = MAX_JSON_BODY_BYTES) {
  const contentType = String(req.headers["content-type"] || "");
  if (contentType && !contentType.includes("application/json")) {
    throw new Error("Content-Type must be application/json");
  }

  const rawBody = await readRawBody(req, limit);
  if (!rawBody.trim()) return {};

  try {
    const parsed = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid JSON body");
    }
    return parsed;
  } catch {
    throw new Error("Invalid JSON body");
  }
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function requiredString(body, key, maxLength = 500) {
  return cleanText(body?.[key], maxLength);
}

function boundedStringList(value, maxItems, maxItemLength) {
  const source = Array.isArray(value) ? value : cleanText(value, maxItems * maxItemLength).split(/\s+/);
  return source
    .map((item) => cleanText(String(item), maxItemLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function isSafeAccountId(value) {
  return /^[\w.@:-]{1,128}$/.test(value);
}

function isSafeModelName(value) {
  return /^[a-zA-Z0-9._:/-]{1,96}$/.test(value);
}

function credentialFingerprint(value) {
  if (!value) return null;
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function validateAgentRunPayload(body) {
  const modelName = requiredString(body, "modelName", 96);
  const prompt = requiredString(body, "prompt", 8_000);
  const platforms = requiredString(body, "platforms", 300);
  const modelApiKey = requiredString(body, "modelApiKey", 4_096);
  const socialPlatform = requiredString(body, "socialPlatform", 40);
  const socialAccountId = requiredString(body, "socialAccountId", 128);
  const socialApiKey = requiredString(body, "socialApiKey", 4_096);
  const publishLive = Boolean(body?.publishLive);

  const missing = [];
  const invalid = [];
  if (!modelName) missing.push("modelName");
  if (!prompt) missing.push("prompt");
  if (!platforms) missing.push("platforms");
  if (!modelApiKey) missing.push("modelApiKey");
  if (modelName && !isSafeModelName(modelName)) invalid.push("modelName");
  if (publishLive && !socialPlatform) missing.push("socialPlatform");
  if (publishLive && !socialAccountId) missing.push("socialAccountId");
  if (publishLive && !socialApiKey) missing.push("socialApiKey");
  if (socialAccountId && !isSafeAccountId(socialAccountId)) invalid.push("socialAccountId");

  return {
    missing,
    invalid,
    values: {
      modelName,
      prompt,
      platforms,
      postingSchedule: requiredString(body, "postingSchedule", 500),
      thingsToAvoid: requiredString(body, "thingsToAvoid", 1_500),
      modelApiKey,
      socialPlatform,
      socialAccountId,
      socialApiKey,
      publishLive,
    },
  };
}

function normalizePublishPayload(body) {
  const mediaUrls = boundedStringList(body?.mediaUrls, 8, 500).filter((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:";
    } catch {
      return false;
    }
  });

  return {
    text: requiredString(body, "text", 5_000),
    title: requiredString(body, "title", 280),
    hashtags: boundedStringList(body?.hashtags, 25, 64),
    mediaUrls,
    videoUrl: requiredString(body, "videoUrl", 500),
    imageUrl: requiredString(body, "imageUrl", 500),
    subreddit: requiredString(body, "subreddit", 80).replace(/^r\//i, ""),
    scheduledAt: requiredString(body, "scheduledAt", 80),
    campaignId: requiredString(body, "campaignId", 120),
    agentId: requiredString(body, "agentId", 120),
  };
}

async function fetchJsonWithTimeout(url, options, timeoutMs = 20_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  } finally {
    clearTimeout(timeout);
  }
}

async function generateAgentDraft(values) {
  const { response, data } = await fetchJsonWithTimeout(`${openAiCompatibleBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${values.modelApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: values.modelName,
      messages: [
        {
          role: "system",
          content:
            "You are a marketing agent. Return concise, publish-ready social content and a short execution note. Never include secrets, passwords, API keys, or private credentials in the output.",
        },
        {
          role: "user",
          content: [
            `Prompt: ${values.prompt}`,
            `Target platforms: ${values.platforms}`,
            values.postingSchedule ? `Posting schedule: ${values.postingSchedule}` : "",
            values.thingsToAvoid ? `Avoid: ${values.thingsToAvoid}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: response.status === 401 ? "Model provider rejected the API key." : "Model provider request failed.",
    };
  }

  return {
    ok: true,
    content: cleanText(data?.choices?.[0]?.message?.content || "", 10_000),
    model: cleanText(data?.model || values.modelName, 120),
    usage: data?.usage || null,
  };
}

function normalizePlatform(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function publishToFacebookPage(values, draftContent) {
  const endpoint = `${metaGraphApiBaseUrl}/${encodeURIComponent(values.socialAccountId)}/feed`;
  const body = new URLSearchParams({
    access_token: values.socialApiKey,
    message: draftContent,
  });

  const { response, data } = await fetchJsonWithTimeout(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    return {
      ok: false,
      status: "publish_failed",
      providerStatus: response.status,
      error: data?.error?.type || "Facebook Page publish failed",
    };
  }

  return {
    ok: true,
    status: "published",
    providerPostId: cleanText(data?.id || "", 160) || null,
  };
}

async function publishDraft(values, draftContent) {
  const normalizedPlatform = normalizePlatform(values.socialPlatform);

  if (!values.publishLive) {
    return {
      ok: true,
      status: "draft_ready",
      liveAttempted: false,
      note: "Live publishing is off. The agent generated content only.",
    };
  }

  if (!values.socialApiKey) {
    return {
      ok: false,
      status: "oauth_or_api_token_required",
      liveAttempted: false,
      note: "Live posting requires an official platform API token.",
    };
  }

  if (normalizedPlatform === "facebook" || normalizedPlatform === "facebookpage") {
    return publishToFacebookPage(values, draftContent);
  }

  return {
    ok: false,
    status: "adapter_not_available",
    liveAttempted: false,
    note: `${values.socialPlatform} access was received, but a live publishing adapter has not been added for that platform yet.`,
  };
}

function buildPublishingResult(values, publishResult) {
  return {
    platform: values.socialPlatform || "draft_only",
    accountId: values.socialAccountId || null,
    requestedPlatforms: values.platforms,
    accessMethod: values.socialApiKey ? "api_token" : "none",
    liveRequested: values.publishLive,
    credentialFingerprint: values.socialApiKey ? credentialFingerprint(values.socialApiKey) : null,
    canPublishAutomatically: Boolean(values.socialApiKey && values.socialAccountId),
    status: publishResult.status,
    providerStatus: publishResult.providerStatus,
    providerPostId: publishResult.providerPostId,
    note: publishResult.note || (publishResult.ok ? "Publishing step completed." : publishResult.error),
  };
}

async function handleAgentRun(req, res) {
  if (req.method !== "POST") {
    sendMethodNotAllowed(req, res, ["POST"]);
    return;
  }
  if (!checkRateLimit(req, "agents", AGENT_MAX_REQUESTS)) {
    sendJson(req, res, 429, { error: "Too many agent requests. Try again shortly." });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req, MAX_JSON_BODY_BYTES);
  } catch (error) {
    sendJson(req, res, 400, { error: error instanceof Error ? error.message : "Invalid request body" });
    return;
  }

  const { missing, invalid, values } = validateAgentRunPayload(body);
  if (missing.length > 0 || invalid.length > 0) {
    sendJson(req, res, 400, { error: "Invalid request", missing, invalid });
    return;
  }

  const draft = await generateAgentDraft(values);
  if (!draft.ok) {
    sendJson(req, res, 502, {
      error: draft.error,
      providerStatus: draft.status,
      runId: randomUUID(),
    });
    return;
  }

  const publishResult = await publishDraft(values, draft.content);

  sendJson(req, res, 200, {
    ok: publishResult.ok,
    runId: randomUUID(),
    model: draft.model,
    draft: draft.content,
    usage: draft.usage,
    publishing: buildPublishingResult(values, publishResult),
    secrets: {
      modelApiKey: "received_redacted",
      socialApiKey: values.socialApiKey ? "received_redacted" : "not_provided",
    },
  });
}

async function handleIntegrationRoutes(req, res, url) {
  if (!checkRateLimit(req, "integrations", API_MAX_REQUESTS)) {
    sendJson(req, res, 429, { error: "Too many integration requests. Try again shortly." });
    return true;
  }

  if (url.pathname === "/api/integrations/status") {
    if (req.method !== "GET") return sendMethodNotAllowed(req, res, ["GET"]);
    sendJson(req, res, 200, {
      integrations: socialService.getAllStatus(),
      scheduler: {
        modes: ["immediate", "scheduled", "recurring", "queue", "retry"],
        pendingQueue: 0,
      },
    });
    return true;
  }

  const match = url.pathname.match(/^\/api\/integrations\/([^/]+)\/(auth|callback|disconnect|refresh|publish)$/);
  if (!match) return false;

  let platform;
  try {
    platform = parsePlatformOrThrow(match[1]);
  } catch (error) {
    sendJson(req, res, error.status || 400, { error: error.message });
    return true;
  }

  const action = match[2];
  try {
    if (action === "auth") {
      if (req.method !== "GET") return sendMethodNotAllowed(req, res, ["GET"]);
      sendJson(req, res, 200, socialService.connect(platform));
      return true;
    }

    if (action === "callback") {
      if (req.method !== "GET") return sendMethodNotAllowed(req, res, ["GET"]);
      const integration = await socialService.callback(platform, {
        code: url.searchParams.get("code"),
        state: url.searchParams.get("state"),
      });
      sendJson(req, res, 200, { ok: true, integration: socialService.getStatus(platform), savedAt: integration.updatedAt });
      return true;
    }

    if (action === "disconnect") {
      if (req.method !== "POST") return sendMethodNotAllowed(req, res, ["POST"]);
      sendJson(req, res, 200, socialService.disconnect(platform));
      return true;
    }

    if (action === "refresh") {
      if (req.method !== "POST") return sendMethodNotAllowed(req, res, ["POST"]);
      socialService.refresh(platform);
      sendJson(req, res, 200, { ok: true, integration: socialService.getStatus(platform) });
      return true;
    }

    if (action === "publish") {
      if (req.method !== "POST") return sendMethodNotAllowed(req, res, ["POST"]);
      const body = await readJsonBody(req, MAX_PUBLISH_BODY_BYTES);
      const result = socialService.publish(platform, normalizePublishPayload(body));
      sendJson(req, res, result.success ? 202 : 409, result);
      return true;
    }
  } catch (error) {
    sendJson(req, res, error.status || 500, {
      error: error.message || "Integration request failed",
      missing: error.missing || undefined,
    });
    return true;
  }

  return false;
}

const supabaseTodosHandler = withSupabase({ auth: "secret" }, async (req, ctx) => {
  if (req.method === "GET") {
    const { data, error } = await ctx.supabaseAdmin
      .from("todos")
      .select("id,name,title,created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return Response.json({ error: "Supabase query failed", code: error.code }, { status: 500 });
    }

    return Response.json(data ?? []);
  }

  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    const name = cleanText(body?.name, 120);

    if (!name) {
      return Response.json({ error: "Missing required field: name" }, { status: 400 });
    }

    const { data, error } = await ctx.supabaseAdmin
      .from("todos")
      .insert({ name })
      .select("id,name,title,created_at")
      .single();

    if (error) {
      return Response.json({ error: "Supabase insert failed", code: error.code }, { status: 500 });
    }

    return Response.json(data, { status: 201 });
  }

  if (req.method === "DELETE") {
    const url = new URL(req.url);
    const id = cleanText(url.searchParams.get("id"), 128);

    if (!id || !/^[\w-]{1,128}$/.test(id)) {
      return Response.json({ error: "Missing or invalid query param: id" }, { status: 400 });
    }

    const { error } = await ctx.supabaseAdmin.from("todos").delete().eq("id", id);

    if (error) {
      return Response.json({ error: "Supabase delete failed", code: error.code }, { status: 500 });
    }

    return Response.json({ ok: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "GET, POST, DELETE" } });
});

async function forwardSupabaseTodos(req, res, url) {
  if (!["GET", "POST", "DELETE"].includes(req.method)) {
    sendMethodNotAllowed(req, res, ["GET", "POST", "DELETE"]);
    return;
  }
  if (!supabaseUrl || !supabaseSecretKey) {
    sendJson(req, res, 503, { error: "Supabase is not configured" });
    return;
  }

  const headers = new Headers({
    apikey: supabaseSecretKey,
    Authorization: `Bearer ${supabaseSecretKey}`,
  });
  const init = { method: req.method, headers };
  if (req.method === "POST") {
    headers.set("Content-Type", "application/json");
    init.body = await readRawBody(req, MAX_JSON_BODY_BYTES);
  }

  const authRequest = new Request(url.toString(), init);
  const response = await supabaseTodosHandler(authRequest);
  const body = await response.text();

  setSecurityHeaders(res);
  setCorsHeaders(req, res);
  const responseHeaders = {
    "Content-Type": response.headers.get("content-type") || "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
  const allowHeader = response.headers.get("allow");
  if (allowHeader) responseHeaders.Allow = allowHeader;
  res.writeHead(response.status, responseHeaders);
  res.end(body);
}

function safeStaticPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) return null;
  const requestedPath = decoded === "/" ? "/index.html" : decoded;
  const fullPath = resolve(distDir, `.${requestedPath}`);
  if (fullPath !== distDir && !fullPath.startsWith(`${distDir}${sep}`)) return null;
  return fullPath;
}

function serveStatic(req, res, url) {
  const fullPath = safeStaticPath(url.pathname);
  setSecurityHeaders(res);
  setCorsHeaders(req, res);

  if (!fullPath) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  if (!existsSync(fullPath)) {
    const indexPath = resolve(distDir, "index.html");
    if (existsSync(indexPath)) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      createReadStream(indexPath).pipe(res);
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  try {
    if (!statSync(fullPath).isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const ext = extname(fullPath);
  const isHtml = ext === ".html";
  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": isHtml ? "no-store" : "public, max-age=31536000, immutable",
  });
  createReadStream(fullPath).pipe(res);
}

createServer((req, res) => {
  setSecurityHeaders(res);
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  if (url.pathname.startsWith("/api/") && !checkRateLimit(req, "api", API_MAX_REQUESTS)) {
    sendJson(req, res, 429, { error: "Too many requests. Try again shortly." });
    return;
  }

  if (url.pathname === "/api/todos") {
    forwardSupabaseTodos(req, res, url).catch((error) => {
      sendJson(req, res, 500, { error: error instanceof Error ? error.message : "Unknown Supabase error" });
    });
    return;
  }

  if (url.pathname === "/api/agents/run") {
    handleAgentRun(req, res).catch((error) => {
      sendJson(req, res, 500, { error: error instanceof Error ? error.message : "Unknown agent run error" });
    });
    return;
  }

  if (url.pathname.startsWith("/api/integrations")) {
    handleIntegrationRoutes(req, res, url).catch((error) => {
      sendJson(req, res, 500, { error: error instanceof Error ? error.message : "Unknown integration error" });
    });
    return;
  }

  if (url.pathname === "/api/health") {
    sendJson(req, res, 200, {
      ok: true,
      supabaseConfigured: Boolean(supabaseUrl && supabaseSecretKey),
      agentRunEndpoint: "/api/agents/run",
      integrationsEndpoint: "/api/integrations/status",
    });
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(req, res, 404, { error: "Not found" });
    return;
  }

  serveStatic(req, res, url);
}).listen(PORT, HOST, () => {
  console.log(`Backend listening on http://${HOST}:${PORT}`);
});

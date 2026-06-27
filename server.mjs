import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { withSupabase } from "@supabase/server";
import { parsePlatformOrThrow, socialService } from "./src/social/service.js";

const root = process.cwd();
const distDir = resolve(root, "dist");
const envPath = resolve(root, ".env.local");

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
    acc[trimmed.slice(0, index)] = trimmed.slice(index + 1);
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

const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseSecretKey = env.SUPABASE_SECRET_KEY;
const openAiCompatibleBaseUrl = process.env.OPENAI_COMPATIBLE_BASE_URL || env.OPENAI_COMPATIBLE_BASE_URL || "https://api.openai.com/v1";
const metaGraphApiBaseUrl = process.env.META_GRAPH_API_BASE_URL || env.META_GRAPH_API_BASE_URL || "https://graph.facebook.com/v25.0";

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

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

function sendJson(res, status, payload) {
  setCorsHeaders(res);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let rawBody = "";
    req.on("data", (chunk) => {
      rawBody += chunk;
      if (rawBody.length > 1_000_000) {
        req.destroy(new Error("Request body too large"));
      }
    });
    req.on("error", rejectBody);
    req.on("end", () => {
      if (!rawBody.trim()) {
        resolveBody({});
        return;
      }

      try {
        resolveBody(JSON.parse(rawBody));
      } catch {
        rejectBody(new Error("Invalid JSON body"));
      }
    });
  });
}

function requiredString(body, key) {
  const value = body?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function credentialFingerprint(value) {
  if (!value) return null;
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function validateAgentRunPayload(body) {
  const modelName = requiredString(body, "modelName");
  const prompt = requiredString(body, "prompt");
  const platforms = requiredString(body, "platforms");
  const modelApiKey = requiredString(body, "modelApiKey");
  const socialPlatform = requiredString(body, "socialPlatform");
  const socialAccountId = requiredString(body, "socialAccountId");
  const socialApiKey = requiredString(body, "socialApiKey");
  const socialLogin = requiredString(body, "socialLogin");
  const socialPassword = requiredString(body, "socialPassword");
  const publishLive = Boolean(body?.publishLive);

  const missing = [];
  if (!modelName) missing.push("modelName");
  if (!prompt) missing.push("prompt");
  if (!platforms) missing.push("platforms");
  if (!modelApiKey) missing.push("modelApiKey");
  if (!socialPlatform) missing.push("socialPlatform");
  if (!socialAccountId) missing.push("socialAccountId");
  if (!socialApiKey && !(socialLogin && socialPassword)) {
    missing.push("socialApiKey or socialLogin+socialPassword");
  }

  return {
    missing,
    values: {
      modelName,
      prompt,
      platforms,
      postingSchedule: requiredString(body, "postingSchedule"),
      thingsToAvoid: requiredString(body, "thingsToAvoid"),
      modelApiKey,
      socialPlatform,
      socialAccountId,
      socialApiKey,
      socialLogin,
      socialPassword,
      publishLive,
    },
  };
}

function normalizePublishPayload(body) {
  return {
    text: requiredString(body, "text"),
    title: requiredString(body, "title"),
    hashtags: Array.isArray(body?.hashtags)
      ? body.hashtags.map(String).filter(Boolean)
      : requiredString(body, "hashtags").split(/\s+/).filter(Boolean),
    mediaUrls: Array.isArray(body?.mediaUrls) ? body.mediaUrls.map(String).filter(Boolean) : [],
    videoUrl: requiredString(body, "videoUrl"),
    imageUrl: requiredString(body, "imageUrl"),
    subreddit: requiredString(body, "subreddit"),
    scheduledAt: requiredString(body, "scheduledAt"),
    campaignId: requiredString(body, "campaignId"),
    agentId: requiredString(body, "agentId"),
  };
}

async function generateAgentDraft(values) {
  const response = await fetch(`${openAiCompatibleBaseUrl.replace(/\/$/, "")}/chat/completions`, {
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
            "You are a marketing agent. Return concise, publish-ready social content and a short execution note.",
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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: response.status === 401
        ? "Model provider rejected the API key."
        : data?.error?.type || data?.error?.code || data?.message || "Model provider request failed",
    };
  }

  return {
    ok: true,
    content: data?.choices?.[0]?.message?.content || "",
    model: data?.model || values.modelName,
    usage: data?.usage || null,
  };
}

function normalizePlatform(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function publishToFacebookPage(values, draftContent) {
  const endpoint = `${metaGraphApiBaseUrl.replace(/\/$/, "")}/${encodeURIComponent(values.socialAccountId)}/feed`;
  const body = new URLSearchParams({
    access_token: values.socialApiKey,
    message: draftContent,
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      status: "publish_failed",
      providerStatus: response.status,
      error: data?.error?.message || data?.error?.type || "Facebook Page publish failed",
    };
  }

  return {
    ok: true,
    status: "published",
    providerPostId: data?.id || null,
  };
}

async function publishDraft(values, draftContent) {
  const normalizedPlatform = normalizePlatform(values.socialPlatform);

  if (!values.publishLive) {
    return {
      ok: true,
      status: "draft_ready",
      liveAttempted: false,
      note: "Live publishing is off. The agent generated content and verified publishing access only.",
    };
  }

  if (!values.socialApiKey) {
    return {
      ok: false,
      status: "oauth_or_api_token_required",
      liveAttempted: false,
      note: "Live posting requires an official platform API token. Username and password are accepted for gating, but not used for automated login.",
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
  const accessMethod = values.socialApiKey ? "api_token" : "login_credentials";

  return {
    platform: values.socialPlatform,
    accountId: values.socialAccountId,
    requestedPlatforms: values.platforms,
    accessMethod,
    liveRequested: values.publishLive,
    credentialFingerprint: credentialFingerprint(values.socialApiKey || `${values.socialLogin}:${values.socialPassword}`),
    canPublishAutomatically: Boolean(values.socialApiKey && values.socialAccountId),
    status: publishResult.status,
    providerStatus: publishResult.providerStatus,
    providerPostId: publishResult.providerPostId,
    note: publishResult.note || (publishResult.ok ? "Publishing step completed." : publishResult.error),
  };
}

async function handleAgentRun(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: error instanceof Error ? error.message : "Invalid request body" });
    return;
  }

  const { missing, values } = validateAgentRunPayload(body);
  if (missing.length > 0) {
    sendJson(res, 400, { error: "Missing required fields", missing });
    return;
  }

  const draft = await generateAgentDraft(values);
  if (!draft.ok) {
    sendJson(res, 502, {
      error: draft.error,
      providerStatus: draft.status,
      runId: randomUUID(),
    });
    return;
  }

  const publishResult = await publishDraft(values, draft.content);

  sendJson(res, 200, {
    ok: publishResult.ok,
    runId: randomUUID(),
    model: draft.model,
    draft: draft.content,
    usage: draft.usage,
    publishing: buildPublishingResult(values, publishResult),
    secrets: {
      modelApiKey: "received_redacted",
      socialApiKey: values.socialApiKey ? "received_redacted" : "not_provided",
      socialLogin: values.socialLogin ? "received_redacted" : "not_provided",
      socialPassword: values.socialPassword ? "received_redacted" : "not_provided",
    },
  });
}

async function handleIntegrationRoutes(req, res, url) {
  if (url.pathname === "/api/integrations/status") {
    if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });
    return sendJson(res, 200, {
      integrations: socialService.getAllStatus(),
      scheduler: {
        modes: ["immediate", "scheduled", "recurring", "queue", "retry"],
        pendingQueue: 0,
      },
    });
  }

  const match = url.pathname.match(/^\/api\/integrations\/([^/]+)\/(auth|callback|disconnect|refresh|publish)$/);
  if (!match) return false;

  let platform;
  try {
    platform = parsePlatformOrThrow(match[1]);
  } catch (error) {
    return sendJson(res, error.status || 400, { error: error.message });
  }

  const action = match[2];
  try {
    if (action === "auth") {
      if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });
      const result = socialService.connect(platform);
      return sendJson(res, 200, result);
    }

    if (action === "callback") {
      if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });
      const integration = await socialService.callback(platform, {
        code: url.searchParams.get("code"),
        state: url.searchParams.get("state"),
      });
      return sendJson(res, 200, { ok: true, integration: socialService.getStatus(platform), savedAt: integration.updatedAt });
    }

    if (action === "disconnect") {
      if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });
      return sendJson(res, 200, socialService.disconnect(platform));
    }

    if (action === "refresh") {
      if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });
      socialService.refresh(platform);
      return sendJson(res, 200, { ok: true, integration: socialService.getStatus(platform) });
    }

    if (action === "publish") {
      if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });
      const body = await readJsonBody(req);
      const result = socialService.publish(platform, normalizePublishPayload(body));
      return sendJson(res, result.success ? 202 : 409, result);
    }
  } catch (error) {
    return sendJson(res, error.status || 500, {
      error: error.message || "Integration request failed",
      missing: error.missing || undefined,
    });
  }

  return false;
}

const supabaseTodosHandler = withSupabase({ auth: "secret" }, async (req, ctx) => {
  if (req.method === "GET") {
    const { data, error } = await ctx.supabaseAdmin
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message, code: error.code }, { status: 500 });
    }

    return Response.json(data ?? []);
  }

  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return Response.json({ error: "Missing required field: name" }, { status: 400 });
    }

    const { data, error } = await ctx.supabaseAdmin
      .from("todos")
      .insert({ name })
      .select("*")
      .single();

    if (error) {
      return Response.json({ error: error.message, code: error.code }, { status: 500 });
    }

    return Response.json(data, { status: 201 });
  }

  if (req.method === "DELETE") {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing required query param: id" }, { status: 400 });
    }

    const { error } = await ctx.supabaseAdmin.from("todos").delete().eq("id", id);

    if (error) {
      return Response.json({ error: error.message, code: error.code }, { status: 500 });
    }

    return Response.json({ ok: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
});

createServer((req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, "http://127.0.0.1:8787");

  if (url.pathname === "/api/todos") {
    const authRequest = new Request(url.toString(), {
      method: req.method,
      headers: {
        apikey: supabaseSecretKey || "",
        Authorization: supabaseSecretKey ? `Bearer ${supabaseSecretKey}` : "",
      },
    });

    supabaseTodosHandler(authRequest)
      .then(async (response) => {
        const body = await response.text();
        res.writeHead(response.status, {
          "Content-Type": response.headers.get("content-type") || "application/json",
          "Cache-Control": "no-store",
        });
        res.end(body);
      })
      .catch((error) => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }));
    });
    return;
  }

  if (url.pathname === "/api/agents/run") {
    handleAgentRun(req, res).catch((error) => {
      sendJson(res, 500, { error: error instanceof Error ? error.message : "Unknown agent run error" });
    });
    return;
  }

  if (url.pathname.startsWith("/api/integrations")) {
    handleIntegrationRoutes(req, res, url).catch((error) => {
      sendJson(res, 500, { error: error instanceof Error ? error.message : "Unknown integration error" });
    });
    return;
  }

  if (url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      supabaseConfigured: Boolean(supabaseUrl && supabaseSecretKey),
      agentRunEndpoint: "/api/agents/run",
      integrationsEndpoint: "/api/integrations/status",
    });
    return;
  }

  const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
  const fullPath = join(distDir, filePath);

  if (!existsSync(fullPath)) {
    const indexPath = join(distDir, "index.html");
    if (existsSync(indexPath)) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      createReadStream(indexPath).pipe(res);
      return;
    }
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const ext = extname(fullPath);
  res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
  createReadStream(fullPath).pipe(res);
}).listen(8787, "127.0.0.1", () => {
  console.log("Backend listening on http://127.0.0.1:8787");
});

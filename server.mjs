import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { withSupabase } from "@supabase/server";

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
  const socialApiKey = requiredString(body, "socialApiKey");
  const socialLogin = requiredString(body, "socialLogin");
  const socialPassword = requiredString(body, "socialPassword");

  const missing = [];
  if (!modelName) missing.push("modelName");
  if (!prompt) missing.push("prompt");
  if (!platforms) missing.push("platforms");
  if (!modelApiKey) missing.push("modelApiKey");
  if (!socialPlatform) missing.push("socialPlatform");
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
      socialApiKey,
      socialLogin,
      socialPassword,
    },
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

function buildPublishingResult(values) {
  const accessMethod = values.socialApiKey ? "api_token" : "login_credentials";

  return {
    platform: values.socialPlatform,
    requestedPlatforms: values.platforms,
    accessMethod,
    credentialFingerprint: credentialFingerprint(values.socialApiKey || `${values.socialLogin}:${values.socialPassword}`),
    canPublishAutomatically: Boolean(values.socialApiKey),
    status: values.socialApiKey
      ? "ready_for_platform_api"
      : "credentials_received_manual_or_oauth_required",
    note: values.socialApiKey
      ? "Platform access token was provided. Add the platform-specific API adapter next to publish live."
      : "Login credentials were provided but live social posting should use official OAuth/API access instead of automated password login.",
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

  sendJson(res, 200, {
    ok: true,
    runId: randomUUID(),
    model: draft.model,
    draft: draft.content,
    usage: draft.usage,
    publishing: buildPublishingResult(values),
    secrets: {
      modelApiKey: "received_redacted",
      socialApiKey: values.socialApiKey ? "received_redacted" : "not_provided",
      socialLogin: values.socialLogin ? "received_redacted" : "not_provided",
      socialPassword: values.socialPassword ? "received_redacted" : "not_provided",
    },
  });
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

  if (url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      supabaseConfigured: Boolean(supabaseUrl && supabaseSecretKey),
      agentRunEndpoint: "/api/agents/run",
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

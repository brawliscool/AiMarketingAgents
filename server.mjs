import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
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
const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseSecretKey = env.SUPABASE_SECRET_KEY;

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
  const url = new URL(req.url, "http://127.0.0.1:8787");

  if (url.pathname === "/api/todos") {
    const authRequest = new Request(url.toString(), {
      method: "GET",
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

  if (url.pathname === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(JSON.stringify({ ok: true }));
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

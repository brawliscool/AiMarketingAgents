import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const storePath = resolve(process.cwd(), ".data", "content-approval-queue.json");
const TABLE_NAME = "content_approval_queue";

function emptyStore() {
  return { items: [] };
}

function normalizeStore(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return emptyStore();
  const items = Array.isArray(value.items) ? value.items.filter((item) => item && typeof item === "object") : [];
  return { items: items.slice(0, 400) };
}

function readLocalStore() {
  if (!existsSync(storePath)) return emptyStore();
  try {
    const parsed = JSON.parse(readFileSync(storePath, "utf8"));
    return normalizeStore(parsed);
  } catch {
    return emptyStore();
  }
}

function writeLocalStore(nextStore) {
  const normalized = normalizeStore(nextStore);
  mkdirSync(dirname(storePath), { recursive: true, mode: 0o700 });
  const tempPath = `${storePath}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tempPath, JSON.stringify(normalized, null, 2), { mode: 0o600 });
  renameSync(tempPath, storePath);
  try {
    chmodSync(storePath, 0o600);
  } catch {
    // Best effort across filesystems.
  }
}

function createLocalAdapter() {
  return {
    mode: "local",
    async list() {
      return readLocalStore().items.slice();
    },
    async upsert(item) {
      const store = readLocalStore();
      const nextItems = [item, ...store.items.filter((existing) => existing.id !== item.id)].slice(0, 400);
      writeLocalStore({ items: nextItems });
      return item;
    },
  };
}

function createSupabaseAdapter(supabaseUrl, supabaseSecretKey) {
  if (!supabaseUrl || !supabaseSecretKey) return null;
  const client = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "hiveai-content-approval-queue" } },
  });

  return {
    mode: "supabase",
    async list() {
      const { data, error } = await client
        .from(TABLE_NAME)
        .select("payload, updated_at")
        .order("updated_at", { ascending: false })
        .limit(400);
      if (error) throw error;
      return (data || []).map((row) => row.payload).filter(Boolean);
    },
    async upsert(item) {
      const payload = {
        id: item.id,
        payload: item,
        updated_at: item.updatedAt,
      };
      const { error } = await client.from(TABLE_NAME).upsert(payload, { onConflict: "id" });
      if (error) throw error;
      return item;
    },
  };
}

export function createApprovalStore({ supabaseUrl = "", supabaseSecretKey = "" } = {}) {
  const local = createLocalAdapter();
  const supabase = createSupabaseAdapter(supabaseUrl, supabaseSecretKey);
  let fallbackReason = "";

  async function withFallback(operation, failSafe) {
    if (!supabase) return operation(local);
    try {
      return await operation(supabase);
    } catch (error) {
      fallbackReason = error?.message || "Supabase unavailable";
      return failSafe(local);
    }
  }

  return {
    async listItems() {
      return withFallback(
        (adapter) => adapter.list(),
        (adapter) => adapter.list(),
      );
    },
    async saveItem(item) {
      return withFallback(
        (adapter) => adapter.upsert(item),
        (adapter) => adapter.upsert(item),
      );
    },
    mode() {
      if (!supabase) return "local";
      return fallbackReason ? "local_fallback" : "supabase";
    },
    fallbackReason() {
      return fallbackReason;
    },
  };
}

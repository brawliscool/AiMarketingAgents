import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const storePath = resolve(process.cwd(), ".data", "social-integrations.json");
const STATE_TTL_MS = 10 * 60 * 1000;

function emptyStore() {
  return { integrations: {}, oauthStates: {}, drafts: [], queue: [], activity: [] };
}

function plainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeStore(value) {
  const store = { ...emptyStore(), ...plainObject(value) };
  store.integrations = plainObject(store.integrations);
  store.oauthStates = plainObject(store.oauthStates);
  store.drafts = Array.isArray(store.drafts) ? store.drafts.slice(0, 100) : [];
  store.queue = Array.isArray(store.queue) ? store.queue.slice(0, 100) : [];
  store.activity = Array.isArray(store.activity) ? store.activity.slice(0, 100) : [];
  return store;
}

function pruneExpiredStates(store) {
  const now = Date.now();
  for (const [state, record] of Object.entries(store.oauthStates)) {
    if (!record?.createdAt || now - record.createdAt > STATE_TTL_MS) {
      delete store.oauthStates[state];
    }
  }
}

function readStore() {
  if (!existsSync(storePath)) return emptyStore();
  try {
    const parsed = JSON.parse(readFileSync(storePath, "utf8"));
    const store = normalizeStore(parsed);
    pruneExpiredStates(store);
    return store;
  } catch {
    return emptyStore();
  }
}

function writeStore(nextStore) {
  const store = normalizeStore(nextStore);
  pruneExpiredStates(store);
  mkdirSync(dirname(storePath), { recursive: true, mode: 0o700 });
  const tempPath = `${storePath}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tempPath, JSON.stringify(store, null, 2), { mode: 0o600 });
  renameSync(tempPath, storePath);
  try {
    chmodSync(storePath, 0o600);
  } catch {
    // Best-effort on platforms that do not support chmod semantics.
  }
}

function assertSafeState(state) {
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(state || "")) {
    throw new Error("Invalid OAuth state");
  }
}

export const localSocialStore = {
  list() {
    return readStore().integrations;
  },
  get(platform) {
    return readStore().integrations[platform] || null;
  },
  save(platform, integration) {
    const store = readStore();
    store.integrations[platform] = { ...integration, updatedAt: new Date().toISOString() };
    store.activity.unshift({
      id: randomUUID(),
      platform,
      event: "connected",
      createdAt: new Date().toISOString(),
    });
    store.activity = store.activity.slice(0, 100);
    writeStore(store);
    return store.integrations[platform];
  },
  disconnect(platform) {
    const store = readStore();
    delete store.integrations[platform];
    store.activity.unshift({
      id: randomUUID(),
      platform,
      event: "disconnected",
      createdAt: new Date().toISOString(),
    });
    store.activity = store.activity.slice(0, 100);
    writeStore(store);
  },
  saveState(state, value) {
    assertSafeState(state);
    const store = readStore();
    store.oauthStates[state] = { ...value, createdAt: Date.now() };
    writeStore(store);
  },
  consumeState(state) {
    assertSafeState(state);
    const store = readStore();
    const value = store.oauthStates[state] || null;
    delete store.oauthStates[state];
    writeStore(store);
    return value;
  },
  addDraft(draft) {
    const store = readStore();
    const saved = { id: randomUUID(), ...draft, createdAt: new Date().toISOString() };
    store.drafts.unshift(saved);
    store.drafts = store.drafts.slice(0, 100);
    writeStore(store);
    return saved;
  },
  addQueueItem(item) {
    const store = readStore();
    const saved = { id: randomUUID(), attempts: 0, ...item, createdAt: new Date().toISOString() };
    store.queue.unshift(saved);
    store.queue = store.queue.slice(0, 100);
    writeStore(store);
    return saved;
  },
  activity() {
    return readStore().activity.slice(0, 12);
  },
};

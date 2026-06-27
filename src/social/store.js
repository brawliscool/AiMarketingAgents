import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const storePath = resolve(process.cwd(), ".data", "social-integrations.json");

function emptyStore() {
  return { integrations: {}, oauthStates: {}, drafts: [], queue: [], activity: [] };
}

function readStore() {
  if (!existsSync(storePath)) return emptyStore();
  try {
    return { ...emptyStore(), ...JSON.parse(readFileSync(storePath, "utf8")) };
  } catch {
    return emptyStore();
  }
}

function writeStore(nextStore) {
  mkdirSync(dirname(storePath), { recursive: true });
  writeFileSync(storePath, JSON.stringify(nextStore, null, 2));
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
      id: crypto.randomUUID(),
      platform,
      event: "connected",
      createdAt: new Date().toISOString(),
    });
    writeStore(store);
    return store.integrations[platform];
  },
  disconnect(platform) {
    const store = readStore();
    delete store.integrations[platform];
    store.activity.unshift({
      id: crypto.randomUUID(),
      platform,
      event: "disconnected",
      createdAt: new Date().toISOString(),
    });
    writeStore(store);
  },
  saveState(state, value) {
    const store = readStore();
    store.oauthStates[state] = { ...value, createdAt: Date.now() };
    writeStore(store);
  },
  consumeState(state) {
    const store = readStore();
    const value = store.oauthStates[state] || null;
    delete store.oauthStates[state];
    writeStore(store);
    return value;
  },
  addDraft(draft) {
    const store = readStore();
    const saved = { id: crypto.randomUUID(), ...draft, createdAt: new Date().toISOString() };
    store.drafts.unshift(saved);
    writeStore(store);
    return saved;
  },
  addQueueItem(item) {
    const store = readStore();
    const saved = { id: crypto.randomUUID(), attempts: 0, ...item, createdAt: new Date().toISOString() };
    store.queue.unshift(saved);
    writeStore(store);
    return saved;
  },
  activity() {
    return readStore().activity.slice(0, 12);
  },
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const LS_CONVERSATIONS = "hiveai.teamChat.conversations";
const LS_MESSAGES = "hiveai.teamChat.messages";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota/private mode failures.
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function normalizeConversation(row) {
  return {
    id: row.id,
    title: row.title || "AI Team Chat",
    summary: row.summary || "",
    selectedAgents: row.selected_agents || row.selectedAgents || [],
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}

function normalizeMessage(row) {
  return {
    id: row.id,
    conversationId: row.conversation_id || row.conversationId,
    sender: row.sender,
    agentId: row.agent_id || row.agentId || null,
    agentName: row.agent_name || row.agentName || null,
    role: row.role || null,
    message: row.message || "",
    confidence: row.confidence ?? null,
    suggestedActions: row.suggested_actions || row.suggestedActions || [],
    createdAt: row.created_at || row.createdAt,
  };
}

export function createLocalConversation(fields = {}) {
  const now = new Date().toISOString();
  const conversation = {
    id: crypto.randomUUID(),
    title: fields.title || "AI Team Chat",
    summary: fields.summary || "",
    selectedAgents: fields.selectedAgents || [],
    createdAt: now,
    updatedAt: now,
  };
  writeJson(LS_CONVERSATIONS, [conversation, ...readJson(LS_CONVERSATIONS, [])]);
  return conversation;
}

export function readLocalConversations() {
  return readJson(LS_CONVERSATIONS, []);
}

export function readLocalMessages(conversationId) {
  return readJson(LS_MESSAGES, []).filter((message) => message.conversationId === conversationId);
}

export function saveLocalMessage(message) {
  const row = {
    id: message.id || crypto.randomUUID(),
    conversationId: message.conversationId,
    sender: message.sender,
    agentId: message.agentId || null,
    agentName: message.agentName || null,
    role: message.role || null,
    message: message.message,
    confidence: message.confidence ?? null,
    suggestedActions: message.suggestedActions || [],
    createdAt: message.createdAt || new Date().toISOString(),
  };
  writeJson(LS_MESSAGES, [...readJson(LS_MESSAGES, []), row]);
  touchLocalConversation(row.conversationId);
  return row;
}

export function clearLocalConversation(conversationId) {
  writeJson(LS_MESSAGES, readJson(LS_MESSAGES, []).filter((message) => message.conversationId !== conversationId));
  touchLocalConversation(conversationId);
}

function touchLocalConversation(conversationId) {
  const now = new Date().toISOString();
  writeJson(LS_CONVERSATIONS, readJson(LS_CONVERSATIONS, []).map((conversation) => (
    conversation.id === conversationId ? { ...conversation, updatedAt: now } : conversation
  )));
}

export async function loadTeamChat() {
  try {
    const { response, data } = await apiRequest("/api/team-chat/conversations");
    if (response.ok) {
      const conversations = Array.isArray(data?.data) ? data.data.map(normalizeConversation) : [];
      return { persistence: "supabase", conversations };
    }
  } catch {
    // Fall through to local fallback.
  }
  return { persistence: "localStorage", conversations: readLocalConversations() };
}

export async function createConversation(fields) {
  try {
    const { response, data } = await apiRequest("/api/team-chat/conversations", {
      method: "POST",
      body: JSON.stringify({
        title: fields.title,
        summary: fields.summary,
        selected_agents: fields.selectedAgents,
      }),
    });
    if (response.ok) {
      return { persistence: "supabase", conversation: normalizeConversation(data) };
    }
  } catch {
    // Fall through to local fallback.
  }
  return { persistence: "localStorage", conversation: createLocalConversation(fields) };
}

export async function loadMessages(conversationId, persistence) {
  if (persistence === "supabase") {
    try {
      const { response, data } = await apiRequest(`/api/team-chat/messages?conversation_id=${encodeURIComponent(conversationId)}`);
      if (response.ok) {
        return Array.isArray(data?.data) ? data.data.map(normalizeMessage) : [];
      }
    } catch {
      // Fall through to local messages.
    }
  }
  return readLocalMessages(conversationId);
}

export async function saveMessage(message, persistence) {
  if (persistence === "supabase") {
    try {
      const { response, data } = await apiRequest("/api/team-chat/messages", {
        method: "POST",
        body: JSON.stringify({
          conversation_id: message.conversationId,
          sender: message.sender,
          agent_id: message.agentId,
          agent_name: message.agentName,
          role: message.role,
          message: message.message,
          confidence: message.confidence,
          suggested_actions: message.suggestedActions,
        }),
      });
      if (response.ok) return normalizeMessage(data);
    } catch {
      // Fall through to local fallback.
    }
  }
  return saveLocalMessage(message);
}

export async function clearConversation(conversationId, persistence) {
  if (persistence === "supabase") {
    try {
      const { response } = await apiRequest(`/api/team-chat/messages?conversation_id=${encodeURIComponent(conversationId)}`, {
        method: "DELETE",
      });
      if (response.ok) return;
    } catch {
      // Fall through to local fallback.
    }
  }
  clearLocalConversation(conversationId);
}

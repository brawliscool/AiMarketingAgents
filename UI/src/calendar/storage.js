import {
  CALENDAR_CAMPAIGNS_KEY,
  CALENDAR_STORAGE_KEY,
  DEFAULT_CAMPAIGNS,
  seedEvents,
} from "./constants.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function normalizeEvent(row) {
  return {
    id: row.id,
    title: row.title || "",
    platform: row.platform,
    campaignId: row.campaign_id ?? row.campaignId ?? "",
    campaignName: row.campaign_name ?? row.campaignName ?? "",
    agentId: row.agent_id ?? row.agentId ?? "",
    scheduledAt: row.scheduled_at ?? row.scheduledAt,
    status: row.status || "draft",
    notes: row.notes || "",
    contentPreview: row.content_preview ?? row.contentPreview ?? "",
    recurring: row.recurring ?? null,
  };
}

function toDbPayload(event) {
  return {
    id: event.id,
    title: event.title,
    platform: event.platform,
    campaign_id: event.campaignId,
    campaign_name: event.campaignName,
    agent_id: event.agentId,
    scheduled_at: event.scheduledAt,
    status: event.status,
    notes: event.notes,
    content_preview: event.contentPreview,
    recurring: event.recurring,
  };
}

function readLocalEvents() {
  try {
    const raw = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (!raw) return seedEvents();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : seedEvents();
  } catch {
    return seedEvents();
  }
}

function writeLocalEvents(events) {
  localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
}

export function readLocalCampaigns() {
  try {
    const raw = localStorage.getItem(CALENDAR_CAMPAIGNS_KEY);
    if (!raw) return DEFAULT_CAMPAIGNS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_CAMPAIGNS;
  } catch {
    return DEFAULT_CAMPAIGNS;
  }
}

export function writeLocalCampaigns(campaigns) {
  localStorage.setItem(CALENDAR_CAMPAIGNS_KEY, JSON.stringify(campaigns));
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export async function loadCalendarData() {
  try {
    const { response, data } = await apiRequest("/api/calendar/events");
    if (response.ok) {
      const events = Array.isArray(data) ? data.map(normalizeEvent) : [];
      return {
        events: events.length ? events : seedEvents(),
        persistence: "supabase",
        campaigns: readLocalCampaigns(),
      };
    }
    if (response.status === 503) {
      return {
        events: readLocalEvents(),
        persistence: "local",
        campaigns: readLocalCampaigns(),
      };
    }
  } catch {
    // fall through to local
  }

  return {
    events: readLocalEvents(),
    persistence: "local",
    campaigns: readLocalCampaigns(),
  };
}

export async function persistEvents(events, persistence) {
  if (persistence === "supabase") {
    const { response, data } = await apiRequest("/api/calendar/events/sync", {
      method: "POST",
      body: JSON.stringify({ events: events.map(toDbPayload) }),
    });
    if (!response.ok) {
      throw new Error(data?.error || "Failed to sync calendar to Supabase");
    }
    return;
  }
  writeLocalEvents(events);
}

export async function upsertEvent(event, persistence) {
  if (persistence === "supabase") {
    const method = event._isNew ? "POST" : "PUT";
    const path = event._isNew ? "/api/calendar/events" : `/api/calendar/events?id=${encodeURIComponent(event.id)}`;
    const { response, data } = await apiRequest(path, {
      method,
      body: JSON.stringify(toDbPayload(event)),
    });
    if (!response.ok) {
      throw new Error(data?.error || "Failed to save event");
    }
    return normalizeEvent(data);
  }

  const current = readLocalEvents();
  const index = current.findIndex((e) => e.id === event.id);
  const next = { ...event };
  delete next._isNew;
  if (index === -1) current.push(next);
  else current[index] = next;
  writeLocalEvents(current);
  return next;
}

export async function deleteEvent(eventId, persistence) {
  if (persistence === "supabase") {
    const { response, data } = await apiRequest(`/api/calendar/events?id=${encodeURIComponent(eventId)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(data?.error || "Failed to delete event");
    }
    return;
  }

  const current = readLocalEvents().filter((e) => e.id !== eventId);
  writeLocalEvents(current);
}

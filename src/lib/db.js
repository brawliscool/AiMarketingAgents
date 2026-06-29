/**
 * HiveAI database layer — thin wrapper around @supabase/supabase-js.
 *
 * Consumed exclusively by server.mjs (Node.js backend).
 * Never import this file from React/browser code — it uses the secret key.
 *
 * Usage:
 *   import { db } from './src/lib/db.js';
 *   const { data, error } = await db.campaigns.list(workspaceId);
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || "";

let _client = null;

function getClient() {
  if (!_client) {
    if (!supabaseUrl || !supabaseKey) {
      throw new DbError("Supabase is not configured (missing SUPABASE_URL or SUPABASE_SECRET_KEY)", 503);
    }
    _client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }
  return _client;
}

export class DbError extends Error {
  constructor(message, status = 500, code = null) {
    super(message);
    this.name = "DbError";
    this.status = status;
    this.code = code;
  }
}

function handleSupabaseError(error, context) {
  if (!error) return;
  const status = error.code === "23505" ? 409 : error.code === "23503" ? 422 : 500;
  throw new DbError(`${context}: ${error.message}`, status, error.code);
}

const PAGE_LIMIT = 100;

// ── workspaces ──────────────────────────────────────────────────────────────

async function workspacesUpsertDefault() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("workspaces")
    .upsert({ slug: "default", name: "HiveAI Workspace", settings: {} }, { onConflict: "slug", ignoreDuplicates: true })
    .select("id,name,slug,description,settings,created_at,updated_at")
    .single();
  handleSupabaseError(error, "workspaces.upsertDefault");
  return data;
}

async function workspacesGet(id) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("id,name,slug,description,settings,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();
  handleSupabaseError(error, "workspaces.get");
  return data;
}

async function workspacesGetBySlug(slug) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("id,name,slug,description,settings,created_at,updated_at")
    .eq("slug", slug)
    .maybeSingle();
  handleSupabaseError(error, "workspaces.getBySlug");
  return data;
}

async function workspacesUpdate(id, fields) {
  const supabase = getClient();
  const allowed = ["name", "description", "settings"];
  const patch = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));
  const { data, error } = await supabase
    .from("workspaces")
    .update(patch)
    .eq("id", id)
    .select("id,name,slug,description,settings,created_at,updated_at")
    .single();
  handleSupabaseError(error, "workspaces.update");
  return data;
}

// ── brand_profiles ───────────────────────────────────────────────────────────

async function brandProfilesList(workspaceId) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("brand_profiles")
    .select("id,workspace_id,name,voice,offer,hashtags,competitors,avatar,campaign_goal,extra,created_at,updated_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(PAGE_LIMIT);
  handleSupabaseError(error, "brand_profiles.list");
  return data ?? [];
}

async function brandProfilesGet(id, workspaceId) {
  const supabase = getClient();
  const query = supabase
    .from("brand_profiles")
    .select("id,workspace_id,name,voice,offer,hashtags,competitors,avatar,campaign_goal,extra,created_at,updated_at")
    .eq("id", id);
  if (workspaceId) query.eq("workspace_id", workspaceId);
  const { data, error } = await query.maybeSingle();
  handleSupabaseError(error, "brand_profiles.get");
  return data;
}

async function brandProfilesCreate(workspaceId, fields) {
  const supabase = getClient();
  const row = {
    workspace_id: workspaceId,
    name: fields.name,
    voice: fields.voice ?? null,
    offer: fields.offer ?? null,
    hashtags: Array.isArray(fields.hashtags) ? fields.hashtags : [],
    competitors: fields.competitors ?? null,
    avatar: fields.avatar ?? null,
    campaign_goal: fields.campaign_goal ?? null,
    extra: fields.extra ?? {},
  };
  const { data, error } = await supabase
    .from("brand_profiles")
    .insert(row)
    .select("id,workspace_id,name,voice,offer,hashtags,competitors,avatar,campaign_goal,extra,created_at,updated_at")
    .single();
  handleSupabaseError(error, "brand_profiles.create");
  return data;
}

async function brandProfilesUpdate(id, workspaceId, fields) {
  const supabase = getClient();
  const allowed = ["name", "voice", "offer", "hashtags", "competitors", "avatar", "campaign_goal", "extra"];
  const patch = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));
  const { data, error } = await supabase
    .from("brand_profiles")
    .update(patch)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select("id,workspace_id,name,voice,offer,hashtags,competitors,avatar,campaign_goal,extra,created_at,updated_at")
    .single();
  handleSupabaseError(error, "brand_profiles.update");
  return data;
}

async function brandProfilesDelete(id, workspaceId) {
  const supabase = getClient();
  const { error } = await supabase
    .from("brand_profiles")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  handleSupabaseError(error, "brand_profiles.delete");
}

// ── campaigns ─────────────────────────────────────────────────────────────────

async function campaignsList(workspaceId) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("id,workspace_id,title,subtitle,type,status,owner,launch_date,meta,created_at,updated_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(PAGE_LIMIT);
  handleSupabaseError(error, "campaigns.list");
  return data ?? [];
}

async function campaignsGet(id, workspaceId) {
  const supabase = getClient();
  const query = supabase
    .from("campaigns")
    .select("id,workspace_id,title,subtitle,type,status,owner,launch_date,meta,created_at,updated_at")
    .eq("id", id);
  if (workspaceId) query.eq("workspace_id", workspaceId);
  const { data, error } = await query.maybeSingle();
  handleSupabaseError(error, "campaigns.get");
  return data;
}

async function campaignsCreate(workspaceId, fields) {
  const supabase = getClient();
  const row = {
    workspace_id: workspaceId,
    title: fields.title,
    subtitle: fields.subtitle ?? null,
    type: fields.type ?? null,
    status: fields.status ?? "draft",
    owner: fields.owner ?? null,
    launch_date: fields.launch_date ?? null,
    meta: fields.meta ?? {},
  };
  const { data, error } = await supabase
    .from("campaigns")
    .insert(row)
    .select("id,workspace_id,title,subtitle,type,status,owner,launch_date,meta,created_at,updated_at")
    .single();
  handleSupabaseError(error, "campaigns.create");
  return data;
}

async function campaignsUpdate(id, workspaceId, fields) {
  const supabase = getClient();
  const allowed = ["title", "subtitle", "type", "status", "owner", "launch_date", "meta"];
  const patch = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));
  const { data, error } = await supabase
    .from("campaigns")
    .update(patch)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select("id,workspace_id,title,subtitle,type,status,owner,launch_date,meta,created_at,updated_at")
    .single();
  handleSupabaseError(error, "campaigns.update");
  return data;
}

async function campaignsDelete(id, workspaceId) {
  const supabase = getClient();
  const { error } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  handleSupabaseError(error, "campaigns.delete");
}

// ── draft_posts ────────────────────────────────────────────────────────────────

async function draftPostsList(workspaceId, filters = {}) {
  const supabase = getClient();
  let query = supabase
    .from("draft_posts")
    .select("id,workspace_id,campaign_id,platform,text,title,hashtags,media_urls,agent_id,status,created_at,updated_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(PAGE_LIMIT);
  if (filters.campaign_id) query = query.eq("campaign_id", filters.campaign_id);
  if (filters.platform) query = query.eq("platform", filters.platform);
  if (filters.status) query = query.eq("status", filters.status);
  const { data, error } = await query;
  handleSupabaseError(error, "draft_posts.list");
  return data ?? [];
}

async function draftPostsGet(id, workspaceId) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("draft_posts")
    .select("id,workspace_id,campaign_id,platform,text,title,hashtags,media_urls,agent_id,status,created_at,updated_at")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  handleSupabaseError(error, "draft_posts.get");
  return data;
}

async function draftPostsCreate(workspaceId, fields) {
  const supabase = getClient();
  const row = {
    workspace_id: workspaceId,
    campaign_id: fields.campaign_id ?? null,
    platform: fields.platform,
    text: fields.text,
    title: fields.title ?? null,
    hashtags: Array.isArray(fields.hashtags) ? fields.hashtags : [],
    media_urls: Array.isArray(fields.media_urls) ? fields.media_urls : [],
    agent_id: fields.agent_id ?? null,
    status: fields.status ?? "draft",
  };
  const { data, error } = await supabase
    .from("draft_posts")
    .insert(row)
    .select("id,workspace_id,campaign_id,platform,text,title,hashtags,media_urls,agent_id,status,created_at,updated_at")
    .single();
  handleSupabaseError(error, "draft_posts.create");
  return data;
}

async function draftPostsUpdate(id, workspaceId, fields) {
  const supabase = getClient();
  const allowed = ["campaign_id", "platform", "text", "title", "hashtags", "media_urls", "agent_id", "status"];
  const patch = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));
  const { data, error } = await supabase
    .from("draft_posts")
    .update(patch)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select("id,workspace_id,campaign_id,platform,text,title,hashtags,media_urls,agent_id,status,created_at,updated_at")
    .single();
  handleSupabaseError(error, "draft_posts.update");
  return data;
}

async function draftPostsDelete(id, workspaceId) {
  const supabase = getClient();
  const { error } = await supabase
    .from("draft_posts")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  handleSupabaseError(error, "draft_posts.delete");
}

// ── scheduled_posts ───────────────────────────────────────────────────────────

async function scheduledPostsList(workspaceId, filters = {}) {
  const supabase = getClient();
  let query = supabase
    .from("scheduled_posts")
    .select("id,workspace_id,campaign_id,draft_post_id,platform,text,title,hashtags,media_urls,subreddit,scheduled_at,published_at,provider_post_id,status,agent_id,created_at,updated_at")
    .eq("workspace_id", workspaceId)
    .order("scheduled_at", { ascending: true })
    .limit(PAGE_LIMIT);
  if (filters.campaign_id) query = query.eq("campaign_id", filters.campaign_id);
  if (filters.status) query = query.eq("status", filters.status);
  const { data, error } = await query;
  handleSupabaseError(error, "scheduled_posts.list");
  return data ?? [];
}

async function scheduledPostsGet(id, workspaceId) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("scheduled_posts")
    .select("id,workspace_id,campaign_id,draft_post_id,platform,text,title,hashtags,media_urls,subreddit,scheduled_at,published_at,provider_post_id,status,agent_id,created_at,updated_at")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  handleSupabaseError(error, "scheduled_posts.get");
  return data;
}

async function scheduledPostsCreate(workspaceId, fields) {
  const supabase = getClient();
  const row = {
    workspace_id: workspaceId,
    campaign_id: fields.campaign_id ?? null,
    draft_post_id: fields.draft_post_id ?? null,
    platform: fields.platform,
    text: fields.text,
    title: fields.title ?? null,
    hashtags: Array.isArray(fields.hashtags) ? fields.hashtags : [],
    media_urls: Array.isArray(fields.media_urls) ? fields.media_urls : [],
    subreddit: fields.subreddit ?? null,
    scheduled_at: fields.scheduled_at,
    status: fields.status ?? "queued",
    agent_id: fields.agent_id ?? null,
  };
  const { data, error } = await supabase
    .from("scheduled_posts")
    .insert(row)
    .select("id,workspace_id,campaign_id,draft_post_id,platform,text,title,hashtags,media_urls,subreddit,scheduled_at,published_at,provider_post_id,status,agent_id,created_at,updated_at")
    .single();
  handleSupabaseError(error, "scheduled_posts.create");
  return data;
}

async function scheduledPostsUpdate(id, workspaceId, fields) {
  const supabase = getClient();
  const allowed = ["campaign_id", "draft_post_id", "platform", "text", "title", "hashtags", "media_urls",
                   "subreddit", "scheduled_at", "published_at", "provider_post_id", "status", "agent_id"];
  const patch = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));
  const { data, error } = await supabase
    .from("scheduled_posts")
    .update(patch)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select("id,workspace_id,campaign_id,draft_post_id,platform,text,title,hashtags,media_urls,subreddit,scheduled_at,published_at,provider_post_id,status,agent_id,created_at,updated_at")
    .single();
  handleSupabaseError(error, "scheduled_posts.update");
  return data;
}

async function scheduledPostsDelete(id, workspaceId) {
  const supabase = getClient();
  const { error } = await supabase
    .from("scheduled_posts")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  handleSupabaseError(error, "scheduled_posts.delete");
}

// ── agent_runs ────────────────────────────────────────────────────────────────

async function agentRunsList(workspaceId, filters = {}) {
  const supabase = getClient();
  let query = supabase
    .from("agent_runs")
    .select("id,workspace_id,campaign_id,run_id,agent_name,model,prompt,platforms,draft_content,status,publish_status,usage,error,created_at,updated_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(PAGE_LIMIT);
  if (filters.campaign_id) query = query.eq("campaign_id", filters.campaign_id);
  if (filters.status) query = query.eq("status", filters.status);
  const { data, error } = await query;
  handleSupabaseError(error, "agent_runs.list");
  return data ?? [];
}

async function agentRunsGet(id, workspaceId) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("agent_runs")
    .select("id,workspace_id,campaign_id,run_id,agent_name,model,prompt,platforms,draft_content,status,publish_status,usage,error,created_at,updated_at")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  handleSupabaseError(error, "agent_runs.get");
  return data;
}

async function agentRunsCreate(workspaceId, fields) {
  const supabase = getClient();
  const row = {
    workspace_id: workspaceId,
    campaign_id: fields.campaign_id ?? null,
    run_id: fields.run_id ?? null,
    agent_name: fields.agent_name ?? null,
    model: fields.model ?? null,
    prompt: fields.prompt ?? null,
    platforms: fields.platforms ?? null,
    draft_content: fields.draft_content ?? null,
    status: fields.status ?? "pending",
    publish_status: fields.publish_status ?? null,
    usage: fields.usage ?? null,
    error: fields.error ?? null,
  };
  const { data, error } = await supabase
    .from("agent_runs")
    .insert(row)
    .select("id,workspace_id,campaign_id,run_id,agent_name,model,prompt,platforms,draft_content,status,publish_status,usage,error,created_at,updated_at")
    .single();
  handleSupabaseError(error, "agent_runs.create");
  return data;
}

async function agentRunsUpdate(id, workspaceId, fields) {
  const supabase = getClient();
  const allowed = ["campaign_id", "agent_name", "model", "prompt", "platforms", "draft_content",
                   "status", "publish_status", "usage", "error"];
  const patch = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));
  const { data, error } = await supabase
    .from("agent_runs")
    .update(patch)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select("id,workspace_id,campaign_id,run_id,agent_name,model,prompt,platforms,draft_content,status,publish_status,usage,error,created_at,updated_at")
    .single();
  handleSupabaseError(error, "agent_runs.update");
  return data;
}

async function agentRunsDelete(id, workspaceId) {
  const supabase = getClient();
  const { error } = await supabase
    .from("agent_runs")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  handleSupabaseError(error, "agent_runs.delete");
}

// ── public API ────────────────────────────────────────────────────────────────

export const db = {
  workspaces: {
    upsertDefault: workspacesUpsertDefault,
    get: workspacesGet,
    getBySlug: workspacesGetBySlug,
    update: workspacesUpdate,
  },
  brandProfiles: {
    list: brandProfilesList,
    get: brandProfilesGet,
    create: brandProfilesCreate,
    update: brandProfilesUpdate,
    delete: brandProfilesDelete,
  },
  campaigns: {
    list: campaignsList,
    get: campaignsGet,
    create: campaignsCreate,
    update: campaignsUpdate,
    delete: campaignsDelete,
  },
  draftPosts: {
    list: draftPostsList,
    get: draftPostsGet,
    create: draftPostsCreate,
    update: draftPostsUpdate,
    delete: draftPostsDelete,
  },
  scheduledPosts: {
    list: scheduledPostsList,
    get: scheduledPostsGet,
    create: scheduledPostsCreate,
    update: scheduledPostsUpdate,
    delete: scheduledPostsDelete,
  },
  agentRuns: {
    list: agentRunsList,
    get: agentRunsGet,
    create: agentRunsCreate,
    update: agentRunsUpdate,
    delete: agentRunsDelete,
  },
};

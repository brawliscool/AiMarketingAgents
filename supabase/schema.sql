-- HiveAI Supabase Schema
-- Run this in your Supabase project: SQL Editor → New Query → paste and run.
-- All tables are RLS-ready. Enable RLS and add policies as needed.

-- Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- workspaces
-- ============================================================
create table if not exists workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 200),
  slug        text unique not null check (char_length(slug) between 1 and 80),
  description text check (char_length(description) <= 1000),
  settings    jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists workspaces_slug_idx on workspaces (slug);

-- ============================================================
-- brand_profiles
-- ============================================================
create table if not exists brand_profiles (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 200),
  voice         text check (char_length(voice) <= 500),
  offer         text check (char_length(offer) <= 500),
  hashtags      text[] not null default '{}',
  competitors   text check (char_length(competitors) <= 1000),
  avatar        text check (char_length(avatar) <= 500),
  campaign_goal text check (char_length(campaign_goal) <= 500),
  extra         jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists brand_profiles_workspace_idx on brand_profiles (workspace_id);

-- ============================================================
-- campaigns
-- ============================================================
create table if not exists campaigns (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  subtitle     text check (char_length(subtitle) <= 400),
  type         text check (char_length(type) <= 80),
  status       text not null default 'draft'
               check (status in ('draft', 'ready', 'active', 'paused', 'completed', 'archived')),
  owner        text check (char_length(owner) <= 120),
  launch_date  date,
  meta         jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists campaigns_workspace_idx on campaigns (workspace_id);
create index if not exists campaigns_status_idx on campaigns (status);
create index if not exists campaigns_launch_date_idx on campaigns (launch_date);

-- ============================================================
-- draft_posts
-- ============================================================
create table if not exists draft_posts (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  campaign_id   uuid references campaigns (id) on delete set null,
  platform      text not null check (char_length(platform) <= 40),
  text          text not null check (char_length(text) between 1 and 5000),
  title         text check (char_length(title) <= 280),
  hashtags      text[] not null default '{}',
  media_urls    text[] not null default '{}',
  agent_id      text check (char_length(agent_id) <= 120),
  status        text not null default 'draft'
                check (status in ('draft', 'review', 'approved', 'rejected', 'published')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists draft_posts_workspace_idx on draft_posts (workspace_id);
create index if not exists draft_posts_campaign_idx on draft_posts (campaign_id);
create index if not exists draft_posts_status_idx on draft_posts (status);
create index if not exists draft_posts_platform_idx on draft_posts (platform);

-- ============================================================
-- scheduled_posts
-- ============================================================
create table if not exists scheduled_posts (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references workspaces (id) on delete cascade,
  campaign_id     uuid references campaigns (id) on delete set null,
  draft_post_id   uuid references draft_posts (id) on delete set null,
  platform        text not null check (char_length(platform) <= 40),
  text            text not null check (char_length(text) between 1 and 5000),
  title           text check (char_length(title) <= 280),
  hashtags        text[] not null default '{}',
  media_urls      text[] not null default '{}',
  subreddit       text check (char_length(subreddit) <= 80),
  scheduled_at    timestamptz not null,
  published_at    timestamptz,
  provider_post_id text check (char_length(provider_post_id) <= 200),
  status          text not null default 'queued'
                  check (status in ('queued', 'publishing', 'published', 'failed', 'cancelled')),
  agent_id        text check (char_length(agent_id) <= 120),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists scheduled_posts_workspace_idx on scheduled_posts (workspace_id);
create index if not exists scheduled_posts_campaign_idx on scheduled_posts (campaign_id);
create index if not exists scheduled_posts_scheduled_at_idx on scheduled_posts (scheduled_at);
create index if not exists scheduled_posts_status_idx on scheduled_posts (status);

-- ============================================================
-- agent_runs
-- ============================================================
create table if not exists agent_runs (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  campaign_id   uuid references campaigns (id) on delete set null,
  run_id        text unique check (char_length(run_id) <= 128),
  agent_name    text check (char_length(agent_name) <= 120),
  model         text check (char_length(model) <= 120),
  prompt        text check (char_length(prompt) <= 8000),
  platforms     text check (char_length(platforms) <= 300),
  draft_content text check (char_length(draft_content) <= 10000),
  status        text not null default 'pending'
                check (status in ('pending', 'running', 'completed', 'failed')),
  publish_status text check (char_length(publish_status) <= 80),
  usage         jsonb,
  error         text check (char_length(error) <= 2000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists agent_runs_workspace_idx on agent_runs (workspace_id);
create index if not exists agent_runs_campaign_idx on agent_runs (campaign_id);
create index if not exists agent_runs_status_idx on agent_runs (status);
create index if not exists agent_runs_run_id_idx on agent_runs (run_id);

-- ============================================================
-- updated_at trigger function (reuse for all tables)
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger workspaces_updated_at
  before update on workspaces
  for each row execute function set_updated_at();

create or replace trigger brand_profiles_updated_at
  before update on brand_profiles
  for each row execute function set_updated_at();

create or replace trigger campaigns_updated_at
  before update on campaigns
  for each row execute function set_updated_at();

create or replace trigger draft_posts_updated_at
  before update on draft_posts
  for each row execute function set_updated_at();

create or replace trigger scheduled_posts_updated_at
  before update on scheduled_posts
  for each row execute function set_updated_at();

create or replace trigger agent_runs_updated_at
  before update on agent_runs
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security (RLS) stubs — enable and add policies
-- when you add Supabase Auth.
-- ============================================================
-- alter table workspaces enable row level security;
-- alter table brand_profiles enable row level security;
-- alter table campaigns enable row level security;
-- alter table draft_posts enable row level security;
-- alter table scheduled_posts enable row level security;
-- alter table agent_runs enable row level security;

-- Example policy (run after enabling RLS):
-- create policy "workspace members can read their own workspace"
--   on workspaces for select using (auth.uid() = owner_id);

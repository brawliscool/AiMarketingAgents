-- Marketing calendar events for HiveAI
create extension if not exists "pgcrypto";

create table if not exists public.marketing_calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  platform text not null check (platform in ('facebook', 'instagram', 'tiktok', 'x', 'reddit', 'linkedin', 'youtube')),
  campaign_id text,
  campaign_name text,
  agent_id text,
  scheduled_at timestamptz not null,
  status text not null default 'draft' check (status in ('draft', 'ready', 'scheduled', 'posted', 'failed')),
  notes text,
  content_preview text,
  recurring jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_calendar_events_scheduled_at_idx
  on public.marketing_calendar_events (scheduled_at);

alter table public.marketing_calendar_events enable row level security;

-- Backend uses service role; no public policies required for this demo API.

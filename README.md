# HiveAI

HiveAI is a premium AI marketing dashboard for small businesses, creators, and growing brands. The app presents a coordinated workspace for planning, creating, scheduling, and reviewing marketing activity from one interface.

## Live Demo

- Website: [https://brawliscool.github.io/AiMarketingAgents/](https://brawliscool.github.io/AiMarketingAgents/)
- Repository: [https://github.com/brawliscool/AiMarketingAgents](https://github.com/brawliscool/AiMarketingAgents)

## Overview

The product is designed to feel like a complete marketing operations console rather than a collection of disconnected tools. It combines a command center, agent views, campaign planning, calendar scheduling, analytics, and settings into one cohesive experience.

## Key Capabilities

- AI-assisted marketing strategy and execution
- Content planning and campaign coordination
- Calendar-based scheduling workflow
- Agent-style task breakdowns for marketing roles
- Analytics and performance tracking views
- Social integration support for X.com, TikTok, Instagram, and Reddit
- Secure backend OAuth foundation with local JSON token storage
- Publish workspace for drafts, scheduling payloads, and agent handoff
- Lightweight settings and workspace preferences

## Target Users

This project is aimed at teams and individuals who need consistent marketing output without managing a full in-house department.

- Local service businesses
- Restaurants and hospitality brands
- Real estate professionals
- E-commerce stores
- Creators and personal brands
- Startups and small agencies

## Product Structure

The UI is organized around a few core areas:

- Command center for the main dashboard
- Briefs for campaign direction
- Agents for specialized workflows
- Campaigns for launch planning
- Experiments for testing ideas
- Calendar for scheduling
- Insights for performance review
- Integrations for connected services
- Settings for workspace preferences

## Tech Stack

- React 19
- Vite
- Framer Motion
- Phosphor Icons

## Getting Started

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Run the backend

```bash
npm run backend
```

The backend listens on `http://127.0.0.1:8787` and exposes:

- `GET /api/health` - backend health and configuration check
- `POST /api/agents/run` - runs the Agent builder through an OpenAI-compatible chat endpoint
- `GET /api/integrations/status` - returns public integration state
- `GET /api/integrations/:platform/auth` - starts backend-only OAuth
- `GET /api/integrations/:platform/callback` - validates state and exchanges authorization codes
- `POST /api/integrations/:platform/disconnect` - removes local token state
- `POST /api/integrations/:platform/refresh` - refreshes local token metadata when refresh tokens exist
- `POST /api/integrations/:platform/publish` - accepts a normalized publishing payload
- `GET /api/approval/queue` - returns content items, owner dashboard metrics, and persistence mode
- `POST /api/approval/items` - creates a content item and starts the full approval workflow
- `POST /api/approval/items/:id/actions` - supports `approve`, `reject`, `send_back`, `edit`, `regenerate`, and related actions
- `POST /api/approval/items/:id/publish` - publishes approved content to selected social integrations

The Agent builder sends the user's model API key and official social publishing token to this endpoint for the current run only. The backend redacts secrets in responses and requires a social platform, platform account/page ID, and API/access token before it will run a posting-capable agent.

By default, generated content is queued for approval before publication. The approval pipeline is:

Research Agent -> Content Writer -> SEO Review -> Brand Voice Review -> Compliance Check -> Owner Approval -> Scheduled -> Published

When owner approval is complete, `POST /api/approval/items/:id/publish` can publish to selected connected platforms. Platform username/password collection is intentionally unsupported; use official OAuth or provider-issued API tokens instead.

Optional backend environment:

```bash
OPENAI_COMPATIBLE_BASE_URL=https://api.openai.com/v1
META_GRAPH_API_BASE_URL=https://graph.facebook.com/v25.0
BACKEND_ADMIN_KEY=generate-at-least-32-random-characters
TRUST_PROXY_HEADERS=false
ENABLE_HSTS=false
```

Privileged local-development endpoints (`/api/todos` and `/api/integrations/*`) are available only to loopback requests by default. If you expose the backend beyond localhost, set a strong `BACKEND_ADMIN_KEY` and send it as `Authorization: Bearer <key>` or `X-Backend-Admin-Key`; otherwise these endpoints fail closed. Only set `TRUST_PROXY_HEADERS=true` when a trusted reverse proxy controls `X-Forwarded-For`, and enable `ENABLE_HSTS=true` only behind HTTPS.

### OAuth setup

Copy `.env.example` to `.env.local`, then fill in the platform credentials you want to test. Missing credentials fail gracefully: the Integrations page still renders and the backend returns a setup error from the auth endpoint.

Required variables:

- `X_CLIENT_ID`, `X_CLIENT_SECRET`, `X_REDIRECT_URI`
- `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI`
- `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET`, `INSTAGRAM_REDIRECT_URI`
- `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_REDIRECT_URI`

Developer portals:

- X developer portal: [https://developer.x.com/](https://developer.x.com/)
- TikTok developers: [https://developers.tiktok.com/](https://developers.tiktok.com/)
- Meta for Developers: [https://developers.facebook.com/](https://developers.facebook.com/)
- Reddit apps: [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)

### Testing integrations

1. Start the backend with `npm run backend`.
2. Start the frontend with `npm run dev`.
3. Open Integrations and connect a configured platform.
4. Use Publish Workspace to create a normalized payload with `text`, `title`, `hashtags`, `mediaUrls`, `videoUrl`, `imageUrl`, `subreddit`, `scheduledAt`, `campaignId`, and `agentId`.

Tokens are stored in `.data/social-integrations.json` for local development only, behind localhost/admin-key access controls. Replace `src/social/store.js` with a Supabase-backed adapter with per-user ownership, RLS, and encrypted token storage before production persistence is ready.

### Supabase configuration

#### Environment variables

| Variable | Side | Purpose |
|---|---|---|
| `SUPABASE_URL` | Backend only | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Backend only | Service role key — **never expose to the frontend** |
| `VITE_SUPABASE_URL` | Frontend (public) | Supabase project URL for browser client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend (public) | Anon/publishable key for browser client |

Copy `.env.example` to `.env.local` and fill in your Supabase project values. Backend variables are read at server startup and are never sent to the browser. `VITE_*` variables are embedded into the frontend bundle at build time and are publicly visible — use only the anon/publishable key there, never the service role key.

#### Running the SQL migration

1. Open your Supabase project → **SQL Editor → New query**.
2. Paste the contents of `supabase/schema.sql` and run it.
3. The migration creates six tables (`workspaces`, `brand_profiles`, `campaigns`, `draft_posts`, `scheduled_posts`, `agent_runs`) with UUID primary keys, foreign keys, `created_at`/`updated_at` timestamps, and indexes on commonly queried fields.
4. RLS stubs are included at the bottom of the file — uncomment and extend them when you add Supabase Auth.

#### Data API endpoints

The backend exposes CRUD endpoints under `/api/data/` (privileged — localhost or `BACKEND_ADMIN_KEY` required):

| Resource | Endpoint |
|---|---|
| Brand profiles | `/api/data/brand-profiles` |
| Campaigns | `/api/data/campaigns` |
| Draft posts | `/api/data/draft-posts` |
| Scheduled posts | `/api/data/scheduled-posts` |
| Agent runs | `/api/data/agent-runs` |

Each endpoint supports `GET` (list), `POST` (create), `GET /:id`, `PATCH /:id`, and `DELETE /:id`.

#### Local fallback behavior

When Supabase is not configured or the backend is unreachable, the frontend automatically falls back to `localStorage`. Data written to localStorage is keyed under `hiveai.*` and is available on subsequent page loads. A small badge in the UI indicates which storage layer is in use (`Supabase` vs `localStorage`). Once the backend comes back online, reload the page to re-sync from Supabase.

### Security notes

- Never commit `.env.local` or `.data/social-integrations.json`.
- Do not expose `SUPABASE_SECRET_KEY` or local JSON-backed integration endpoints without `BACKEND_ADMIN_KEY`.
- OAuth state is generated server-side and consumed once during callback validation.
- Access tokens are redacted from API responses; only fingerprints and metadata are returned.
- State-changing API requests require trusted origins and `Content-Type: application/json`.
- Live provider publishing should use each platform's official API terms and review requirements.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Project Layout

- `UI/` - entire frontend application
- `UI/src/main.jsx` - application UI, routing state, and interactive behavior
- `UI/src/styles.css` - visual system, responsive layout, and motion styling
- `UI/public/` - static assets
- `UI/dist/` - production build output
- `src/social/` - backend social integration service
- `src/lib/db.js` - backend database layer (Supabase CRUD operations, server-only)
- `supabase/schema.sql` - SQL migration for all six tables
- `server.mjs` - Node HTTP backend with API routes

## Notes

- Settings are stored locally in the browser via `localStorage`.
- Campaign and other entity data persists to Supabase when available; falls back to `localStorage` when the backend is unreachable.
- Agent runs are automatically recorded after each successful agent execution.
- The app is optimized for a dark, premium SaaS presentation.
- `SUPABASE_SECRET_KEY` is consumed only by the Node backend and is never exposed to the browser.

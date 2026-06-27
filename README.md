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

The Agent builder sends the user's model API key and social publishing access to this endpoint for the current run only. The backend redacts secrets in responses and requires a social platform, platform account/page ID, and either a social API/access token or login credentials before it will run a posting-capable agent.

By default, the endpoint generates a draft and verifies publishing access without posting live. When `publishLive` is enabled, the backend can publish text posts to a Facebook Page through the Meta Graph API using a Page ID and Page access token. Instagram, TikTok, and other channels still need their own official OAuth/API adapters before live posting is enabled for those platforms. Username/password values are accepted as access proof for the builder gate but are not used for automated social login.

Optional backend environment:

```bash
OPENAI_COMPATIBLE_BASE_URL=https://api.openai.com/v1
META_GRAPH_API_BASE_URL=https://graph.facebook.com/v25.0
```

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

Tokens are stored in `.data/social-integrations.json` for local development. Replace `src/social/store.js` with a Supabase-backed adapter when production persistence is ready.

### Supabase configuration

The existing Supabase demo endpoint still uses `SUPABASE_URL` and `SUPABASE_SECRET_KEY` on the backend. Public browser clients should only use `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

### Security notes

- Never commit `.env.local` or `.data/social-integrations.json`.
- OAuth state is generated server-side and consumed once during callback validation.
- Access tokens are redacted from API responses; only fingerprints and metadata are returned.
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

- `src/main.jsx` - application UI, routing state, and interactive behavior
- `src/styles.css` - visual system, responsive layout, and motion styling
- `public/` - static assets
- `dist/` - production build output

## Notes

- The current frontend is intentionally polished and minimal in scope.
- Settings are stored locally in the browser.
- The app is optimized for a dark, premium SaaS presentation.

## Status

This repository currently focuses on the frontend experience and product presentation layer.

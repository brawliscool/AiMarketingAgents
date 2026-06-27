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

The Agent builder sends the user's model API key and social publishing access to this endpoint for the current run only. The backend redacts secrets in responses and requires either a social API/access token or login credentials before it will run a posting-capable agent. Live social publishing still needs platform-specific OAuth/API adapters for Instagram, Facebook, TikTok, and other channels.

Optional backend environment:

```bash
OPENAI_COMPATIBLE_BASE_URL=https://api.openai.com/v1
```

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

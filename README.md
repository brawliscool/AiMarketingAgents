# MarketAI

MarketAI is an AI-powered marketing SaaS designed to act like a complete digital marketing department for small businesses, creators, local service companies, and growing brands.

Instead of asking the user to manually create every post, write every caption, schedule content, answer comments, review analytics, and manage ads, MarketAI gives the user a coordinated team of specialized AI marketing agents that work together from one dashboard.

The goal is simple:

> Give businesses an always-on marketing team that can plan, create, publish, engage, analyze, and improve their marketing with minimal manual work.

## Live Frontend

**Website:** https://brawliscool.github.io/AiMarketingAgents/

**Repository:** https://github.com/brawliscool/AiMarketingAgents

## Product Vision

Most small businesses know they need consistent marketing, but they often lack the time, staff, skills, or budget to manage multiple social platforms properly.

MarketAI is intended to replace a fragmented stack of freelancers, scheduling tools, caption generators, analytics dashboards, and ad tools with one coordinated AI system.

The platform should feel less like a collection of disconnected AI features and more like hiring a complete marketing department.

The user provides information about their business, brand, services, audience, goals, offers, and preferred platforms. MarketAI then creates a strategy and assigns work to the appropriate agents.

## Core Value Proposition

MarketAI helps users:

- Build a marketing strategy around their goals
- Generate branded posts, captions, blogs, threads, images, and short-form videos
- Schedule and publish content across connected social accounts
- Respond to comments and direct messages
- Track performance across platforms
- Identify winning topics, formats, and campaigns
- Improve future content based on real results
- Run and optimize paid advertising campaigns
- Maintain consistent brand voice and visual identity

## Target Customers

The initial target market includes:

- Local service businesses
- Restaurants and food businesses
- Auto shops, tire shops, detailers, and dealerships
- Realtors and property professionals
- Gyms, trainers, and wellness businesses
- Home-service companies
- E-commerce stores
- Independent creators
- Personal brands
- Small agencies
- Startups without a full marketing team

The ideal early customer is a business owner who understands that marketing matters but does not have enough time to create and manage content consistently.

## The AI Marketing Team

MarketAI is built around specialized agents. Each agent has a defined responsibility, access to shared brand context, and a clear role in the workflow.

### Marketing Director

The Marketing Director coordinates the entire team.

Responsibilities:

- Reviews the user’s goals and business information
- Builds weekly and monthly marketing strategies
- Assigns work to other agents
- Approves campaigns before publishing when required
- Sets content priorities
- Detects weak performance and changes direction
- Produces executive summaries and recommendations

### Content Writer

The Content Writer handles written marketing material.

Responsibilities:

- Social captions
- Blog posts
- Threads
- Email copy
- Ad copy
- Video scripts
- Hooks and calls to action
- Landing-page copy
- Content repurposing

### Video Creator

The Video Creator produces short-form video concepts and assets.

Responsibilities:

- Reels, Shorts, and TikTok concepts
- Script generation
- Scene planning
- Voice-over copy
- Subtitle generation
- Video templates
- Product and service promos
- Turning long content into short clips

### Social Media Manager

The Social Media Manager manages publishing and platform activity.

Responsibilities:

- Creates the content calendar
- Schedules approved content
- Publishes posts
- Adjusts content for each platform
- Maintains posting frequency
- Recommends optimal posting times
- Prevents duplicate or repetitive content

### Community Manager

The Community Manager handles audience engagement.

Responsibilities:

- Replies to comments
- Drafts direct-message responses
- Flags sensitive conversations for the user
- Identifies potential leads
- Detects common customer questions
- Maintains the brand’s tone while responding

### Analytics Agent

The Analytics Agent turns performance data into useful decisions.

Responsibilities:

- Tracks reach, engagement, followers, clicks, leads, and sales
- Compares campaigns and content types
- Identifies top-performing hooks and topics
- Detects declining performance
- Produces weekly reports
- Recommends future experiments

### SEO Agent

The SEO Agent improves discoverability.

Responsibilities:

- Finds keywords and content opportunities
- Optimizes blogs and landing pages
- Creates metadata and content briefs
- Identifies local SEO opportunities
- Suggests search-driven social content
- Tracks ranking and traffic opportunities

### Advertising Agent

The Advertising Agent manages paid growth.

Responsibilities:

- Creates ad concepts and copy
- Builds campaign variations
- Recommends audiences
- Manages budgets and pacing
- Tests creative variations
- Pauses weak ads
- Increases spend on winning ads within user-defined limits

### Brand Guardian

The Brand Guardian protects consistency and quality.

Responsibilities:

- Stores brand voice and style rules
- Reviews content before publishing
- Enforces banned words and claims
- Checks tone, colors, logos, and messaging
- Prevents unsafe, misleading, or off-brand content
- Maintains approval requirements

## How the Platform Should Work

### 1. Business Onboarding

The user creates an account and completes a guided setup process.

The onboarding flow should collect:

- Business name
- Industry
- Website
- Products or services
- Service area
- Target audience
- Main business goals
- Current offers
- Brand tone
- Brand colors
- Logo and media assets
- Competitors
- Connected social accounts
- Posting preferences
- Approval settings
- Monthly marketing or advertising budget

MarketAI uses this information to create a permanent Brand Brain for the user.

### 2. Brand Brain

The Brand Brain is the shared source of truth used by every agent.

It should contain:

- Business facts
- Products and services
- Target customers
- Brand voice
- Visual guidelines
- Offers and pricing
- Frequently asked questions
- Approved claims
- Restricted topics
- Competitor references
- Past content
- User feedback
- High-performing content patterns

The Brand Brain should update over time as the platform learns from approvals, edits, customer engagement, and performance data.

### 3. Strategy Generation

The Marketing Director creates a strategy based on the user’s goals.

Examples:

- Increase local awareness
- Generate more booked appointments
- Grow an email list
- Launch a new product
- Increase website traffic
- Generate leads
- Improve follower growth
- Promote a seasonal offer

The strategy should include content pillars, platform priorities, posting frequency, campaign ideas, and measurable goals.

### 4. Content Production

Agents collaborate to create the content.

Example workflow:

1. Marketing Director requests a campaign for a tire shop.
2. SEO Agent identifies common seasonal tire searches.
3. Content Writer produces hooks and captions.
4. Video Creator creates a 20-second video concept.
5. Brand Guardian reviews tone and claims.
6. Social Media Manager adapts and schedules the campaign.
7. Community Manager prepares responses for likely questions.
8. Analytics Agent tracks results after publishing.

### 5. Approval Modes

Users should be able to choose how much control the agents have.

#### Manual Approval

Nothing publishes until the user approves it.

#### Assisted Autopilot

Low-risk content can publish automatically, while ads, promotions, and sensitive posts require approval.

#### Full Autopilot

Agents can create, publish, engage, and optimize within rules defined by the user.

Every action should be visible in an activity log and reversible where platform APIs allow it.

### 6. Publishing and Engagement

The platform should connect to supported social networks through official APIs.

Potential integrations include:

- Facebook
- Instagram
- TikTok
- YouTube
- X
- LinkedIn
- Pinterest
- Google Business Profile

The platform should also support integrations for websites, email marketing, analytics, and advertising platforms.

### 7. Learning Loop

MarketAI should improve continuously.

After content is published, the Analytics Agent collects results. The Marketing Director then updates the plan based on what worked.

Examples:

- Create more videos using a successful hook
- Stop posting topics that repeatedly underperform
- Change posting times
- Adapt successful TikTok content into Reels and Shorts
- Increase ad budget on winning campaigns
- Use common comments as future content ideas

## Main Product Areas

### Dashboard

The dashboard gives the user a clear overview of the entire marketing operation.

It should show:

- Current reach and engagement
- Follower growth
- Website clicks
- Leads or sales
- Upcoming content
- Top-performing posts
- Agent activity
- Pending approvals
- Campaign status
- Marketing Director recommendations

### Strategy

A workspace for goals, content pillars, campaign plans, audiences, offers, and agent recommendations.

### Content Calendar

A visual calendar that shows drafts, approvals, scheduled posts, campaigns, and published content.

### Content Studio

A workspace for creating and editing:

- Posts
- Captions
- Images
- Videos
- Blogs
- Emails
- Advertisements

### Inbox

A unified inbox for comments, mentions, and direct messages from connected platforms.

### Analytics

A cross-platform analytics area with plain-language explanations instead of only raw charts.

### Ads Manager

A simplified workspace for creating, approving, monitoring, and optimizing paid campaigns.

### Agents

A control center where users can view each agent, its current tasks, permissions, recent decisions, and performance.

### Brand Settings

The home of the Brand Brain, including voice, assets, audience, offers, competitors, legal restrictions, and approval rules.

### Integrations

A page for connecting social platforms, websites, analytics, advertising accounts, email providers, cloud storage, and customer-management systems.

## MVP Scope

The first usable version should remain focused.

### MVP Features

- User authentication
- Business onboarding
- Brand profile and Brand Brain
- Marketing Director strategy generation
- Caption and post generation
- Image-generation workflow
- Basic short-form video scripts and storyboards
- Content calendar
- Manual content approval
- Scheduling for a limited set of platforms
- Agent activity feed
- Basic analytics dashboard
- Weekly performance summary
- Billing and plan management

### Recommended Initial Platform Integrations

To reduce complexity, the MVP should launch with a small number of integrations rather than every social network.

A practical starting set could be:

- Instagram
- Facebook
- LinkedIn or Google Business Profile

Additional platforms can be added after the publishing and permissions system is reliable.

## Features After MVP

Future versions may include:

- Full video generation and editing
- Automated comment and DM responses
- Lead detection inside the inbox
- Paid-ad creation and optimization
- Competitor monitoring
- Trend detection
- Influencer discovery
- Automated landing-page creation
- Email marketing automation
- CRM integrations
- Multi-location business management
- Agency client workspaces
- White-label accounts
- Team collaboration
- Approval chains
- Mobile applications
- Marketplace for agent templates and industry playbooks

## Safety, Control, and Trust

Because MarketAI can act on public accounts, user control is critical.

The platform should include:

- Permission levels for each agent
- Approval requirements by action type
- Spending limits for ads
- Full action history
- Clear explanations for agent decisions
- Emergency pause button
- Content and platform policy checks
- Brand-safety rules
- Sensitive-topic detection
- Human handoff for uncertain messages
- Secure handling of platform access tokens

Agents should never be able to exceed the permissions, budgets, or publishing rules established by the user.

## Business Model

MarketAI should use a recurring SaaS subscription model.

Possible pricing structure:

### Starter

For individuals and very small businesses.

- Limited connected accounts
- Core content agents
- Monthly content allowance
- Manual approval
- Basic analytics

### Growth

For businesses that need consistent multi-platform marketing.

- More connected accounts
- Video and SEO agents
- Higher content limits
- Assisted autopilot
- Advanced analytics
- Inbox and engagement tools

### Pro

For growing brands and teams.

- Full agent team
- More automation
- Advertising tools
- Multiple users
- Custom workflows
- Priority generation
- Deeper integrations

### Agency

For agencies managing multiple clients.

- Multiple client workspaces
- Team roles
- White labeling
- Client approval portals
- Usage controls
- Consolidated billing

Additional revenue may come from usage-based video generation, advertising management, premium integrations, and extra workspaces.

## Competitive Advantage

MarketAI should not compete as another basic caption generator.

Its advantage is the coordinated multi-agent system.

Each agent has a specialty, but they share context and collaborate. This creates a more complete product than isolated tools that only generate text, schedule posts, or show analytics.

The strongest differentiators should be:

- One coordinated AI marketing department
- Persistent business and brand memory
- Cross-platform execution
- Approval and permission controls
- Continuous improvement from real results
- Clear explanations of what the agents are doing
- Industry-specific marketing playbooks

## Suggested Technical Architecture

The current repository contains the frontend concept and static interface. A production version will require a full application architecture.

### Frontend

Recommended options:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Accessible component primitives
- Responsive desktop and mobile layouts

### Backend

Recommended capabilities:

- API server or Next.js server functions
- PostgreSQL database
- Background task queue
- Scheduled jobs
- Webhook processing
- Secure OAuth token storage
- Agent orchestration service
- Media-processing pipeline
- Usage metering
- Subscription billing

### AI Layer

The AI system should support:

- Agent role prompts
- Shared business context
- Tool permissions
- Structured outputs
- Long-running task state
- Human approvals
- Evaluation and retry logic
- Model routing by task
- Content policy checks
- Cost and token tracking

### Storage

The platform will need storage for:

- Logos and brand assets
- Generated images and videos
- Draft content
- Published content
- Analytics snapshots
- Approval history
- Agent actions
- Platform credentials and tokens

### Integrations

Integrations should be implemented through official APIs and OAuth wherever possible.

## Suggested Core Data Models

Potential major entities include:

- User
- Organization
- Workspace
- BrandProfile
- SocialAccount
- Agent
- AgentPermission
- Goal
- Strategy
- Campaign
- ContentItem
- MediaAsset
- Approval
- ScheduledPost
- Conversation
- Lead
- AnalyticsSnapshot
- AgentRun
- Notification
- Subscription
- UsageRecord

## Development Roadmap

### Phase 1: Product Foundation

- Finalize brand and product positioning
- Convert the static frontend into an application
- Add authentication and database
- Build onboarding
- Create Brand Brain storage

### Phase 2: Content MVP

- Add Marketing Director
- Add Content Writer
- Build content-generation workflows
- Add approvals
- Build the content calendar

### Phase 3: Publishing

- Add OAuth integrations
- Add scheduling and publishing
- Store publishing status and errors
- Build retry and failure handling

### Phase 4: Analytics and Learning

- Import post analytics
- Build performance reports
- Create recommendations
- Feed successful patterns back into future planning

### Phase 5: Engagement and Ads

- Add unified inbox
- Add Community Manager
- Add lead detection
- Add Advertising Agent and budget controls

### Phase 6: Scale

- Agency workspaces
- Collaboration and roles
- Additional integrations
- Mobile app
- Industry templates
- White-label options

## Current Frontend

The current frontend includes:

- Premium dark SaaS visual direction
- Responsive landing-page layout
- AI agent network
- Product dashboard preview
- Agent activity and analytics concepts
- Content calendar preview
- Desktop, tablet, and mobile support
- Interactive demo modal and interface feedback
- Taste Skill design direction documented in `DESIGN.md`

The interface is currently a frontend concept. Authentication, live agents, social publishing, analytics connections, database storage, and billing still need to be implemented.

## Design Principles

The product should feel:

- Powerful without being overwhelming
- Premium without being decorative
- Automated without hiding user control
- Technical without requiring technical knowledge
- Clear about what is real, scheduled, pending, or sample data

The interface should always show what each agent is doing and why.

## Success Metrics

Important product metrics may include:

- Time from signup to first approved campaign
- Percentage of users who connect a social account
- Weekly published content per workspace
- Approval rate of generated content
- Amount of user editing required
- Engagement improvement over time
- Leads or sales attributed to campaigns
- User retention
- Expansion from Starter to Growth or Pro
- Agent actions completed without intervention

## Long-Term Goal

The long-term goal is for MarketAI to become the operating system for small-business marketing.

A user should be able to describe their business, connect their accounts, choose their goals, and then manage a capable AI marketing department from one place.

MarketAI should not remove the owner from the process. It should remove repetitive work while keeping strategy, approvals, budgets, and brand identity under the owner’s control.

## Repository Status

This project is currently in the frontend and product-planning stage.

Contributions should preserve the product vision, responsive design quality, user control, and clear separation between sample UI data and real connected data.

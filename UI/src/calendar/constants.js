import {
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  RedditLogo,
  TiktokLogo,
  XLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";

export const CALENDAR_STORAGE_KEY = "hiveai.marketingCalendar";
export const CALENDAR_CAMPAIGNS_KEY = "hiveai.marketingCampaigns";

export const EVENT_STATUSES = ["draft", "ready", "scheduled", "posted", "failed"];

export const STATUS_LABELS = {
  draft: "Draft",
  ready: "Ready",
  scheduled: "Scheduled",
  posted: "Posted",
  failed: "Failed",
};

export const PLATFORMS = {
  facebook: { id: "facebook", name: "Facebook", color: "#1877F2", icon: FacebookLogo },
  instagram: { id: "instagram", name: "Instagram", color: "#E4405F", icon: InstagramLogo },
  tiktok: { id: "tiktok", name: "TikTok", color: "#25F4EE", icon: TiktokLogo },
  x: { id: "x", name: "X", color: "#c6f0ff", icon: XLogo },
  reddit: { id: "reddit", name: "Reddit", color: "#FF4500", icon: RedditLogo },
  linkedin: { id: "linkedin", name: "LinkedIn", color: "#0A66C2", icon: LinkedinLogo },
  youtube: { id: "youtube", name: "YouTube", color: "#FF0000", icon: YoutubeLogo },
};

export const PLATFORM_IDS = Object.keys(PLATFORMS);

export const RECURRING_FREQUENCIES = ["daily", "weekly", "monthly"];

export const DEFAULT_AGENTS = [
  { id: "director", name: "Marketing Director" },
  { id: "writer", name: "Content Writer" },
  { id: "social", name: "Social Media Manager" },
  { id: "analytics", name: "Analytics Agent" },
  { id: "video", name: "Video Creator" },
  { id: "seo", name: "SEO Specialist" },
];

export const DEFAULT_CAMPAIGNS = [
  { id: "launch-001", name: "Creator-led retargeting", color: "#1b8cff" },
  { id: "lifecycle-002", name: "Onboarding nurture refresh", color: "#56b6ff" },
  { id: "founder-003", name: "Founder note sequence", color: "#7c5cff" },
  { id: "evergreen-004", name: "Evergreen awareness", color: "#3dd68c" },
];

export const MAX_POSTS_PER_PLATFORM_PER_DAY = 3;
export const MAX_POSTS_PER_DAY_TOTAL = 8;

export const OPTIMAL_POST_HOURS = {
  facebook: [9, 12, 17],
  instagram: [11, 14, 19],
  tiktok: [10, 15, 20],
  x: [8, 12, 18],
  reddit: [10, 13, 21],
  linkedin: [8, 10, 17],
  youtube: [14, 17, 20],
};

export const CONTENT_TEMPLATES = [
  { title: "Behind-the-scenes product moment", preview: "Quick peek at what the team shipped this week — real progress, no fluff." },
  { title: "Customer win spotlight", preview: "How one customer turned a 15-minute workflow into a full campaign launch." },
  { title: "Tip carousel hook", preview: "3 mistakes killing your reach (and what to do instead)." },
  { title: "Founder POV thread", preview: "What we learned after 30 days of testing hooks across channels." },
  { title: "Short-form video script", preview: "Hook: Stop posting without a calendar. Problem: Random timing kills momentum..." },
  { title: "Community question", preview: "What's the one marketing task you wish an agent handled end-to-end?" },
];

export function createEventId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function seedEvents(referenceDate = new Date()) {
  const base = new Date(referenceDate);
  base.setHours(0, 0, 0, 0);

  const dayOffset = (n, hour, minute = 0) => {
    const d = new Date(base);
    d.setDate(d.getDate() + n);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: createEventId(),
      title: "Launch creator-led retargeting",
      platform: "instagram",
      campaignId: "launch-001",
      campaignName: "Creator-led retargeting",
      agentId: "social",
      scheduledAt: dayOffset(1, 11, 0),
      status: "scheduled",
      notes: "Pair with UGC clip from last sprint.",
      contentPreview: "Your audience is already warm — here's the creative that converts scrolls into consults.",
      recurring: null,
    },
    {
      id: createEventId(),
      title: "LinkedIn founder note",
      platform: "linkedin",
      campaignId: "founder-003",
      campaignName: "Founder note sequence",
      agentId: "director",
      scheduledAt: dayOffset(2, 10, 30),
      status: "ready",
      notes: "Keep tone direct, one CTA.",
      contentPreview: "We stopped guessing posting times and let agents coordinate the week. Here's what changed.",
      recurring: null,
    },
    {
      id: createEventId(),
      title: "TikTok hook test",
      platform: "tiktok",
      campaignId: "launch-001",
      campaignName: "Creator-led retargeting",
      agentId: "video",
      scheduledAt: dayOffset(3, 15, 0),
      status: "draft",
      notes: "A/B test opening line.",
      contentPreview: "POV: your marketing calendar finally runs itself.",
      recurring: null,
    },
    {
      id: createEventId(),
      title: "X thread — weekly wins",
      platform: "x",
      campaignId: "evergreen-004",
      campaignName: "Evergreen awareness",
      agentId: "writer",
      scheduledAt: dayOffset(5, 12, 0),
      status: "scheduled",
      notes: "",
      contentPreview: "5 things we shipped this week that actually moved pipeline (thread).",
      recurring: {
        enabled: true,
        frequency: "weekly",
        interval: 1,
        endDate: null,
      },
    },
    {
      id: createEventId(),
      title: "Reddit AMA teaser",
      platform: "reddit",
      campaignId: "evergreen-004",
      campaignName: "Evergreen awareness",
      agentId: "social",
      scheduledAt: dayOffset(7, 13, 0),
      status: "draft",
      notes: "Post in relevant subreddit after mod approval.",
      contentPreview: "We're hosting a small AMA on how AI agents coordinate marketing — what should we cover?",
      recurring: null,
    },
  ];
}

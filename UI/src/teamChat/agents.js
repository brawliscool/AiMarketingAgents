import {
  CalendarBlank,
  ChartLineUp,
  Command,
  ImageSquare,
  MagnifyingGlass,
  Megaphone,
  PenNib,
  PresentationChart,
  TrendUp,
  VideoCamera,
} from "@phosphor-icons/react";

export const TEAM_AGENTS = [
  {
    id: "marketing-director",
    name: "Marketing Director",
    role: "Strategy lead",
    icon: Command,
    status: "Coordinating",
    personality: "Decisive, structured, and focused on the next best move.",
    specialty: "Turns goals into strategy and assigns next steps.",
  },
  {
    id: "research-agent",
    name: "Research Agent",
    role: "Audience and market research",
    icon: MagnifyingGlass,
    status: "Scanning",
    personality: "Curious, evidence-minded, and careful about assumptions.",
    specialty: "Finds audience pain points, competitor angles, and market insights.",
  },
  {
    id: "copywriter",
    name: "Copywriter",
    role: "Conversion copy",
    icon: PenNib,
    status: "Drafting",
    personality: "Punchy, clear, and direct-response oriented.",
    specialty: "Writes captions, hooks, emails, and ad copy.",
  },
  {
    id: "seo-agent",
    name: "SEO Agent",
    role: "Search growth",
    icon: TrendUp,
    status: "Optimizing",
    personality: "Practical, keyword-aware, and intent-led.",
    specialty: "Suggests keywords, blog ideas, and search improvements.",
  },
  {
    id: "designer",
    name: "Designer",
    role: "Creative direction",
    icon: ImageSquare,
    status: "Concepting",
    personality: "Visual, brand-sensitive, and detail-focused.",
    specialty: "Suggests visuals, brand style, image prompts, and creative direction.",
  },
  {
    id: "video-agent",
    name: "Video Agent",
    role: "Short-form video",
    icon: VideoCamera,
    status: "Storyboarding",
    personality: "Fast-paced, hook-driven, and platform-native.",
    specialty: "Creates video scripts, shot lists, hooks, and captions.",
  },
  {
    id: "analytics-agent",
    name: "Analytics Agent",
    role: "Performance optimization",
    icon: ChartLineUp,
    status: "Reviewing",
    personality: "Measured, skeptical, and metric-literate.",
    specialty: "Reviews performance metrics and recommends optimizations.",
  },
  {
    id: "sales-agent",
    name: "Sales Agent",
    role: "Lead conversion",
    icon: PresentationChart,
    status: "Handling leads",
    personality: "Empathetic, objection-aware, and action-oriented.",
    specialty: "Handles lead replies, objections, follow-ups, and booking suggestions.",
  },
  {
    id: "calendar-agent",
    name: "Calendar Agent",
    role: "Content planning",
    icon: CalendarBlank,
    status: "Scheduling",
    personality: "Organized, sequencing-focused, and realistic about capacity.",
    specialty: "Turns ideas into scheduled content plans.",
  },
];

export const QUICK_ACTIONS = [
  { label: "Build campaign", prompt: "Build a campaign strategy for our next launch.", icon: Megaphone },
  { label: "Generate posts", prompt: "Generate a batch of social posts for this campaign.", icon: PenNib },
  { label: "Create calendar", prompt: "Create a 2-week content calendar for this idea.", icon: CalendarBlank },
  { label: "Review analytics", prompt: "Review these performance notes and recommend optimizations.", icon: ChartLineUp },
  { label: "Write ad copy", prompt: "Write ad copy variations with hooks and CTAs.", icon: PresentationChart },
  { label: "Create video script", prompt: "Create a short-form video script with shots, hook, and caption.", icon: VideoCamera },
];

export function findAgentById(agentId) {
  return TEAM_AGENTS.find((agent) => agent.id === agentId);
}

export function findMentionedAgents(message) {
  const normalized = message.toLowerCase();
  return TEAM_AGENTS.filter((agent) => {
    const compactName = agent.name.toLowerCase().replace(/\s+/g, "");
    return normalized.includes(`@${agent.id}`) || normalized.includes(`@${agent.name.toLowerCase()}`) || normalized.includes(`@${compactName}`);
  });
}

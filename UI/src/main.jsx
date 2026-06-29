import React, { useEffect, useId, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Bell,
  CalendarBlank,
  ChartLineUp,
  CheckCircle,
  Clock,
  Command,
  ClipboardText,
  Eye,
  FloppyDisk,
  Flask,
  GearSix,
  Hash,
  HouseLine,
  InstagramLogo,
  Lightning,
  List,
  MagnifyingGlass,
  Megaphone,
  PaperPlaneTilt,
  PlugsConnected,
  Plus,
  Play,
  RedditLogo,
  ShieldCheck,
  SquaresFour,
  Storefront,
  Square,
  Target,
  TiktokLogo,
  TrendUp,
  UploadSimple,
  UsersThree,
  VideoCamera,
  Warning,
  XLogo,
} from "@phosphor-icons/react";
import { ContentApprovalQueue } from "./components/ContentApprovalQueue";
import "./styles.css";
import { MarketingCalendarPage } from "./components/calendar/MarketingCalendarPage.jsx";
import { TeamChatPage } from "./components/TeamChatPage.jsx";

function LogoMark() {
  const uid = useId();
  const blueId = `${uid}-blue`;
  const grayId = `${uid}-gray`;
  const coreId = `${uid}-core`;
  const haloId = `${uid}-halo`;
  const shadowId = `${uid}-shadow`;

  return (
    <svg className="brand-mark" viewBox="0 0 128 128" aria-hidden="true">
      <defs>
        <linearGradient id={blueId} x1="18" y1="16" x2="110" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6bb6ff" />
          <stop offset="0.55" stopColor="#1f87ff" />
          <stop offset="1" stopColor="#0a5fdc" />
        </linearGradient>
        <linearGradient id={grayId} x1="26" y1="18" x2="96" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9ea1ad" />
          <stop offset="1" stopColor="#585d68" />
        </linearGradient>
        <linearGradient id={coreId} x1="50" y1="44" x2="78" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#bfc3cb" />
          <stop offset="1" stopColor="#666a76" />
        </linearGradient>
        <radialGradient id={haloId} cx="50%" cy="48%" r="48%">
          <stop offset="0" stopColor="#56b6ff" stopOpacity="0.32" />
          <stop offset="0.6" stopColor="#1b8cff" stopOpacity="0.14" />
          <stop offset="1" stopColor="#1b8cff" stopOpacity="0" />
        </radialGradient>
        <filter id={shadowId} x="-28%" y="-28%" width="156%" height="156%">
          <feDropShadow dx="0" dy="10" stdDeviation="7" floodColor="#000000" floodOpacity=".36" />
        </filter>
      </defs>
      <circle cx="64" cy="64" r="58" fill={`url(#${haloId})`} />
      <circle cx="64" cy="64" r="42" fill="rgba(255,255,255,0.025)" stroke="rgba(139, 201, 255, 0.18)" strokeWidth="1.5" />
      <g filter={`url(#${shadowId})`} transform="translate(5 4) scale(.92)">
        <rect x="32" y="22" width="19" height="56" rx="4" transform="rotate(56 41.5 50)" fill={`url(#${grayId})`} />
        <rect x="77" y="22" width="19" height="56" rx="4" transform="rotate(-56 86.5 50)" fill={`url(#${blueId})`} />
        <rect x="18" y="53" width="19" height="56" rx="4" transform="rotate(0 27.5 81)" fill={`url(#${grayId})`} />
        <rect x="91" y="53" width="19" height="56" rx="4" transform="rotate(0 100.5 81)" fill={`url(#${blueId})`} />
        <rect x="28" y="87" width="19" height="56" rx="4" transform="rotate(56 37.5 115)" fill={`url(#${grayId})`} />
        <rect x="81" y="87" width="19" height="56" rx="4" transform="rotate(-56 90.5 115)" fill={`url(#${blueId})`} />
        <path d="M64 46c11 0 20 9 20 20s-9 20-20 20-20-9-20-20 9-20 20-20Z" fill={`url(#${coreId})`} />
        <path d="M59 63c-4-8-6-15-2-18 2-2 7-2 9 0 4 3 2 10-2 18" fill="#4c4f59" opacity=".95" />
        <rect x="57" y="84" width="14" height="13" rx="6" fill={`url(#${grayId})`} />
        <rect x="53" y="97" width="22" height="10" rx="5" fill={`url(#${blueId})`} />
        <path d="M61 27c-4 2-7 6-8 11" fill="none" stroke="#d5d8df" strokeWidth="3.25" strokeLinecap="round" />
        <path d="M67 27c4 2 7 6 8 11" fill="none" stroke="#d5d8df" strokeWidth="3.25" strokeLinecap="round" />
        <circle cx="58" cy="58" r="2.2" fill="#0e0f14" />
        <circle cx="70" cy="58" r="2.2" fill="#0e0f14" />
      </g>
    </svg>
  );
}

const spring = { type: "spring", stiffness: 110, damping: 20, mass: 0.8 };
const fastSpring = { type: "spring", stiffness: 360, damping: 28, mass: 0.7 };

const pageVariants = {
  initial: { opacity: 0, y: 18, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { ...spring, staggerChildren: 0.08 } },
  exit: { opacity: 0, y: -10, filter: "blur(8px)", transition: { duration: 0.18 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0, transition: spring },
};

const navItems = [
  ["Command center", HouseLine],
  ["AI Team Chat", UsersThree],
  ["Briefs", Command],
  ["Agents", UsersThree],
  ["Campaigns", PaperPlaneTilt],
  ["Experiments", Flask],
  ["Calendar", CalendarBlank],
  ["Insights", ChartLineUp],
  ["Integrations", PlugsConnected],
  ["Settings", GearSix],
];

const agents = [
  ["Audience Cartographer", "Segment research", "47.2%", "intent lift", Command],
  ["Copy Pressure Tester", "Landing pages", "18", "variants queued", SquaresFour],
  ["Offer Forecaster", "Promo calendar", "$12.8k", "forecast", TrendUp],
  ["Retention Analyst", "Email & lifecycle", "7", "cohorts live", UsersThree],
];

const metrics = [
  ["Lead quality", "64.8", "+8.1 pts", "M30 102 L48 86 L62 93 L80 64 L96 77 L114 51 L132 59 L150 37 L170 71 L190 44 L208 52 L226 24 L246 61"],
  ["CAC pressure", "31.4", "-4.7 pts", "M30 95 L48 72 L65 83 L83 56 L102 67 L121 39 L139 46 L158 29 L177 44 L196 22 L214 50 L234 31 L246 57"],
  ["Pipeline velocity", "22.6", "+3.9 pts", "M30 100 L50 87 L68 93 L88 58 L106 74 L126 50 L145 61 L166 42 L184 55 L205 36 L226 47 L246 29"],
];

const launches = [
  ["Jun 27", "Launch creator-led retargeting", "Paid social", "Ready", "Mara Voss"],
  ["Jun 29", "Refresh onboarding nurture", "Lifecycle", "Needs review", "Ilya Ren"],
  ["Jul 02", "Test founder note sequence", "Email", "Drafting", "Theo Kline"],
];

const briefBuilderFields = [
  { id: "modelName", label: "Model name", required: true },
  { id: "prompt", label: "Prompt", required: true, wide: true, multiline: true },
  { id: "platforms", label: "Platforms", required: true },
  { id: "postingSchedule", label: "Posting schedule" },
  { id: "thingsToAvoid", label: "Things to avoid", wide: true, multiline: true },
  { id: "modelApiKey", label: "AI model API key", required: true, wide: true, type: "password" },
];

const publishingAccessFields = [
  { id: "socialPlatform", label: "Social platform", required: true },
  { id: "socialAccountId", label: "Platform account or page ID", required: true },
  { id: "socialApiKey", label: "Official platform API key or access token", type: "password", required: true },
];

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8787";

function useIntegrationStatus() {
  const [state, setState] = useState({ loading: true, integrations: [], error: "", scheduler: null });

  const refresh = async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await fetch(`${apiBaseUrl}/api/integrations/status`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Could not load integrations");
      setState({
        loading: false,
        integrations: data.integrations || [],
        scheduler: data.scheduler || null,
        error: "",
      });
    } catch (error) {
      setState({ loading: false, integrations: [], scheduler: null, error: error instanceof Error ? error.message : "Could not load integrations" });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { ...state, refresh };
}

// ── Generic Supabase-backed data hook with localStorage fallback ──────────────

const LS_KEYS = {
  campaigns: "hiveai.campaigns",
  brandProfiles: "hiveai.brandProfiles",
  draftPosts: "hiveai.draftPosts",
  scheduledPosts: "hiveai.scheduledPosts",
  agentRuns: "hiveai.agentRuns",
};

function lsRead(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function lsWrite(key, data) {
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch { /* ignore quota errors */ }
}

function lsAdd(key, item) {
  const list = lsRead(key);
  const newItem = { ...item, id: item.id || crypto.randomUUID(), created_at: item.created_at || new Date().toISOString(), updated_at: new Date().toISOString() };
  lsWrite(key, [newItem, ...list]);
  return newItem;
}

function lsUpdate(key, id, patch) {
  const list = lsRead(key);
  const updated = list.map((item) => item.id === id ? { ...item, ...patch, updated_at: new Date().toISOString() } : item);
  lsWrite(key, updated);
  return updated.find((item) => item.id === id) || null;
}

function lsRemove(key, id) {
  const list = lsRead(key);
  lsWrite(key, list.filter((item) => item.id !== id));
}

function useApiData(endpoint, lsKey) {
  const [state, setState] = useState({ loading: true, data: [], error: "", source: "loading" });

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await fetch(`${apiBaseUrl}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json().catch(() => ({}));
      const rows = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
      setState({ loading: false, data: rows, error: "", source: "supabase" });
    } catch {
      const fallback = lsRead(lsKey);
      setState({ loading: false, data: fallback, error: "", source: "localStorage" });
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (fields) => {
    try {
      const res = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const row = await res.json();
      setState((s) => ({ ...s, data: [row, ...s.data], source: "supabase" }));
      return row;
    } catch {
      const row = lsAdd(lsKey, fields);
      setState((s) => ({ ...s, data: [row, ...s.data], source: "localStorage" }));
      return row;
    }
  };

  const update = async (id, patch) => {
    try {
      const res = await fetch(`${apiBaseUrl}${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const row = await res.json();
      setState((s) => ({ ...s, data: s.data.map((item) => item.id === id ? row : item) }));
      return row;
    } catch {
      const row = lsUpdate(lsKey, id, patch);
      setState((s) => ({ ...s, data: s.data.map((item) => item.id === id ? (row || item) : item) }));
      return row;
    }
  };

  const remove = async (id) => {
    try {
      await fetch(`${apiBaseUrl}${endpoint}/${id}`, { method: "DELETE" });
    } catch { /* best-effort */ }
    lsRemove(lsKey, id);
    setState((s) => ({ ...s, data: s.data.filter((item) => item.id !== id) }));
  };

  return { ...state, reload: load, create, update, remove };
}

function useCampaigns() {
  return useApiData("/api/data/campaigns", LS_KEYS.campaigns);
}

function useAgentRuns() {
  return useApiData("/api/data/agent-runs", LS_KEYS.agentRuns);
}

// ── CampaignsPage ──────────────────────────────────────────────────────────────

const CAMPAIGN_STATUSES = ["draft", "ready", "active", "paused", "completed", "archived"];

const STATUS_COLORS = {
  draft: "#9ea1ad",
  ready: "#6bb6ff",
  active: "#56ffb0",
  paused: "#ffb84a",
  completed: "#b16cff",
  archived: "#585d68",
};

function CampaignStatusBadge({ status }) {
  return (
    <span
      style={{
        background: `${STATUS_COLORS[status] || STATUS_COLORS.draft}22`,
        color: STATUS_COLORS[status] || STATUS_COLORS.draft,
        border: `1px solid ${STATUS_COLORS[status] || STATUS_COLORS.draft}44`,
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

function CampaignsPage() {
  const { loading, data: campaigns, error, source, create, update, remove } = useCampaigns();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", type: "", status: "draft", owner: "", launch_date: "" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setForm({ title: "", subtitle: "", type: "", status: "draft", owner: "", launch_date: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (campaign) => {
    setForm({
      title: campaign.title || "",
      subtitle: campaign.subtitle || "",
      type: campaign.type || "",
      status: campaign.status || "draft",
      owner: campaign.owner || "",
      launch_date: campaign.launch_date || "",
    });
    setEditingId(campaign.id);
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await update(editingId, form);
      } else {
        await create(form);
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="agents-page">
      <MotionPanel className="panel agents-hero">
        <div>
          <div className="section-kicker">Campaigns</div>
          <h1>Campaigns</h1>
          <p>Plan, track, and manage your marketing campaigns. Data persists to Supabase when available, or localStorage as a fallback.</p>
        </div>
        <div className="agents-summary">
          <strong>{campaigns.filter((c) => c.status === "active").length}</strong>
          <span>active</span>
        </div>
      </MotionPanel>

      <MotionPanel className="panel agents-board">
        <div className="panel-title">
          <h2>All campaigns</h2>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {source === "localStorage" && <span style={{ color: "#ffb84a", fontSize: "0.7rem" }}>localStorage</span>}
            {source === "supabase" && <span style={{ color: "#56ffb0", fontSize: "0.7rem" }}>Supabase</span>}
            <button
              type="button"
              className="primary-button"
              style={{ padding: "4px 12px", fontSize: "0.8rem" }}
              onClick={() => { setShowForm(true); setEditingId(null); }}
            >
              <Plus size={14} /> New
            </button>
          </span>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.form
              className="panel"
              style={{ padding: "1rem", marginBottom: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleSubmit}
            >
              <div className="builder-form-grid" style={{ marginBottom: "0.75rem" }}>
                <label className="builder-field wide">
                  <span>Title *</span>
                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
                </label>
                <label className="builder-field wide">
                  <span>Subtitle</span>
                  <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} />
                </label>
                <label className="builder-field">
                  <span>Type</span>
                  <input value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} placeholder="Paid social, Email…" />
                </label>
                <label className="builder-field">
                  <span>Owner</span>
                  <input value={form.owner} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))} />
                </label>
                <label className="builder-field">
                  <span>Launch date</span>
                  <input type="date" value={form.launch_date} onChange={(e) => setForm((f) => ({ ...f, launch_date: e.target.value }))} />
                </label>
                <label className="builder-field">
                  <span>Status</span>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "6px 8px" }}>
                    {CAMPAIGN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="primary-button" disabled={saving} style={{ padding: "6px 16px" }}>
                  {saving ? "Saving…" : editingId ? "Save changes" : "Create campaign"}
                </button>
                <button type="button" className="secondary-button" onClick={resetForm} style={{ padding: "6px 16px" }}>Cancel</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", opacity: 0.5 }}>Loading campaigns…</div>
        ) : error ? (
          <div style={{ padding: "1rem", color: "#ff6b6b", background: "rgba(255,100,100,0.08)", borderRadius: 8 }}>{error}</div>
        ) : campaigns.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", opacity: 0.5 }}>
            <PaperPlaneTilt size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
            <p>No campaigns yet. Create your first one above.</p>
          </div>
        ) : (
          <motion.div className="agents-list" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
            {campaigns.map((campaign, index) => (
              <motion.article
                className="agent-entry"
                key={campaign.id}
                style={{ "--index": index }}
                variants={itemVariants}
                whileHover={{ y: -3, borderColor: "rgba(177, 108, 255, 0.34)" }}
                layout
              >
                <div className="agent-entry-icon" style={{ background: `${STATUS_COLORS[campaign.status] || STATUS_COLORS.draft}22` }}>
                  <PaperPlaneTilt size={22} style={{ color: STATUS_COLORS[campaign.status] || STATUS_COLORS.draft }} />
                </div>
                <div className="agent-entry-copy">
                  <div className="agent-entry-top">
                    <div className="agent-entry-name">
                      <h3>{campaign.title}</h3>
                      <CampaignStatusBadge status={campaign.status} />
                    </div>
                    <div className="agent-entry-actions">
                      <button type="button" className="agent-action start" onClick={() => openEdit(campaign)}>Edit</button>
                      <button type="button" className="agent-action stop" onClick={() => remove(campaign.id)}>Delete</button>
                    </div>
                  </div>
                  <div className="agent-activity">
                    {campaign.subtitle && <span>{campaign.subtitle}</span>}
                    {campaign.type && <span style={{ opacity: 0.6 }}> · {campaign.type}</span>}
                    {campaign.owner && <span style={{ opacity: 0.5 }}> · {campaign.owner}</span>}
                    {campaign.launch_date && <span style={{ opacity: 0.5 }}> · {campaign.launch_date}</span>}
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </MotionPanel>
    </div>
  );
}

function statusLabel(status) {
  if (status === "connected") return "Connected";
  if (status === "needs_reconnect") return "Needs Reconnect";
  return "Disconnected";
}

const liveAgentCards = [
  ["Research Agent", "Finding audience pain points", "Running", 72, Target],
  ["Content Agent", "Writing TikTok and Facebook post ideas", "Review", 58, ClipboardText],
  ["Video Agent", "Drafting short-form video scripts", "Running", 44, VideoCamera],
  ["Ad Agent", "Testing hooks and offers", "Queued", 26, Megaphone],
  ["Calendar Agent", "Scheduling content for the week", "Done", 100, CalendarBlank],
];

const memoryCards = [
  ["Brand voice", "Clear, motivating, low-hype", Command],
  ["Offer details", "$49 intro consult with trainer roadmap", Storefront],
  ["Saved hashtags", "#StrengthForBusyPeople #FitAfterWork", Hash],
  ["Competitors", "Local gyms, boutique pilates, online coaches", ChartLineUp],
  ["Customer avatar", "Time-starved professional, age 28-44", UsersThree],
  ["Current campaign goal", "Convert local leads into consult bookings", Target],
];

const socialPlatforms = {
  x: { name: "X.com", icon: XLogo, color: "#c6f0ff" },
  tiktok: { name: "TikTok", icon: TiktokLogo, color: "#9ff7e9" },
  instagram: { name: "Instagram", icon: InstagramLogo, color: "#ffc0dd" },
  reddit: { name: "Reddit", icon: RedditLogo, color: "#ffb48a" },
};

const publishInitialValues = {
  text: "",
  title: "",
  hashtags: "",
  mediaUrls: "",
  videoUrl: "",
  imageUrl: "",
  subreddit: "",
  scheduledAt: "",
  campaignId: "launch-001",
  agentId: "marketing-director",
};

const publishingAgents = [
  "Research Agent",
  "Writer Agent",
  "SEO Agent",
  "Video Agent",
  "Marketing Director",
  "Calendar Agent",
];

function MagneticButton({ className, children, ...props }) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(useTransform(pointerX, [-1, 1], [-8, 8]), fastSpring);
  const y = useSpring(useTransform(pointerY, [-1, 1], [-5, 5]), fastSpring);

  return (
    <motion.button
      className={className}
      style={{ x, y }}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.965, y: 1 }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
        pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function MotionPanel({ className, children, delay = 0, ...props }) {
  return (
    <motion.section
      className={className}
      variants={itemVariants}
      transition={{ ...spring, delay }}
      whileHover={{ y: -4, transition: fastSpring }}
      layout
      {...props}
    >
      {children}
    </motion.section>
  );
}

function Sparkline({ path, compact = false }) {
  return (
    <svg className={compact ? "sparkline compact" : "sparkline"} viewBox="0 0 276 126" aria-hidden="true">
      <path className="spark-fill" d={`${path} L246 126 L30 126 Z`} />
      <motion.path
        className="spark-stroke"
        d={path}
        initial={{ pathLength: 0, opacity: 0.35 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

function Sidebar({ currentPage, onNavigate }) {
  return (
    <motion.aside className="sidebar" aria-label="Workspace navigation" initial={{ x: -22, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={spring}>
      <a className="brand" href="/" aria-label="HiveAI home">
        <LogoMark />
        HiveAI
      </a>

      <nav className="side-nav">
        {navItems.map(([label, Icon]) => (
          <motion.a
            layout
            className={currentPage === label ? "side-link active" : "side-link"}
            href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
            key={label}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(label);
            }}
          >
            {currentPage === label && <motion.span className="active-rail" layoutId="active-rail" transition={spring} />}
            <Icon size={18} />
            <span>{label}</span>
          </motion.a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="profile-card">
          <div className="workspace-avatar" aria-hidden="true">HW</div>
          <div>
            <strong>HiveAI Workspace</strong>
            <span>Business accounts</span>
          </div>
        </div>
        <div className="system-card">
          <span className="status-light" />
          <div>
            <strong>System status</strong>
            <span>All systems nominal</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

function PageShell({ title, subtitle }) {
  return (
    <MotionPanel className="panel page-shell">
      <div className="section-kicker">{title}</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </MotionPanel>
  );
}

const agentRosterSeed = [
  {
    id: "director",
    name: "Marketing Director",
    role: "Strategy, prioritization, and handoffs",
    icon: Command,
    active: true,
    activeActivity: "Mapping the next launch angle and assigning the work.",
    idleActivity: "Waiting for a new brief before resuming strategy.",
  },
  {
    id: "writer",
    name: "Content Writer",
    role: "Copy, posts, and launch sequences",
    icon: ClipboardText,
    active: true,
    activeActivity: "Writing a launch sequence for the new product.",
    idleActivity: "Paused while waiting for the next prompt.",
  },
  {
    id: "social",
    name: "Social Media Manager",
    role: "Posting schedule and channel timing",
    icon: PaperPlaneTilt,
    active: true,
    activeActivity: "Scheduling posts for this week’s campaign.",
    idleActivity: "Standing by for the next content batch.",
  },
  {
    id: "analytics",
    name: "Analytics Agent",
    role: "Performance review and insight tracking",
    icon: ChartLineUp,
    active: true,
    activeActivity: "Analyzing campaign performance and trends.",
    idleActivity: "Idle while it waits for fresh data.",
  },
  {
    id: "video",
    name: "Video Creator",
    role: "Short-form script and edit support",
    icon: VideoCamera,
    active: false,
    activeActivity: "Drafting a short-form video hook and shot list.",
    idleActivity: "Waiting for script notes and asset approval.",
  },
  {
    id: "seo",
    name: "SEO Specialist",
    role: "Search opportunities and content gaps",
    icon: Target,
    active: false,
    activeActivity: "Reviewing page structure and ranking opportunities.",
    idleActivity: "Idle and ready to pick up the next keyword set.",
  },
];

function AgentsPage({ roster, onSetAgentActive }) {
  const activeCount = roster.filter((agent) => agent.active).length;

  return (
    <div className="agents-page">
      <MotionPanel className="panel agents-hero">
        <div>
          <div className="section-kicker">Agents</div>
          <h1>Agents</h1>
          <p>Start or stop each agent, see what it is doing, and watch the active ones glow green.</p>
        </div>
        <div className="agents-summary">
          <strong>{activeCount}</strong>
          <span>active now</span>
        </div>
      </MotionPanel>

      <MotionPanel className="panel agents-board">
        <div className="panel-title">
          <h2>Live agent roster</h2>
          <span>Realtime</span>
        </div>

        <motion.div className="agents-list" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
          {roster.map((agent, index) => {
            const Icon = agent.icon;
            const isActive = agent.active;

            return (
              <motion.article
                className={isActive ? "agent-entry active" : "agent-entry"}
                key={agent.id}
                style={{ "--index": index }}
                variants={itemVariants}
                whileHover={{ y: -3, borderColor: "rgba(177, 108, 255, 0.34)" }}
                layout
              >
                <span className={isActive ? "agent-led active" : "agent-led inactive"} aria-hidden="true" />
                <div className="agent-entry-icon">
                  <Icon size={22} />
                </div>

                <div className="agent-entry-copy">
                  <div className="agent-entry-top">
                    <div className="agent-entry-name">
                      <h3>{agent.name}</h3>
                      <span className={isActive ? "agent-state active" : "agent-state inactive"}>{isActive ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="agent-entry-actions">
                      <button
                        type="button"
                        className="agent-action stop"
                        onClick={() => onSetAgentActive(agent.id, false)}
                        disabled={!isActive}
                        aria-disabled={!isActive}
                      >
                        <Square size={14} weight="fill" />
                        Stop
                      </button>
                      <button
                        type="button"
                        className="agent-action start"
                        onClick={() => onSetAgentActive(agent.id, true)}
                        disabled={isActive}
                        aria-disabled={isActive}
                      >
                        <Play size={14} weight="fill" />
                        Start
                      </button>
                    </div>
                  </div>
                  <p className="agent-role">{agent.role}</p>
                  <div className="agent-activity">{isActive ? agent.activeActivity : agent.idleActivity}</div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </MotionPanel>
    </div>
  );
}

function BriefsPage() {
  const [briefValues, setBriefValues] = useState(() =>
    Object.fromEntries(briefBuilderFields.map((field) => [field.id, ""])),
  );
  const [publishingAccessValues, setPublishingAccessValues] = useState(() =>
    Object.fromEntries(publishingAccessFields.map((field) => [field.id, ""])),
  );
  const [agentRunState, setAgentRunState] = useState({
    status: "idle",
    message: "",
    result: null,
  });
  const [publishLive, setPublishLive] = useState(false);
  const requiredFieldsComplete = briefBuilderFields
    .filter((field) => field.required)
    .every((field) => briefValues[field.id].trim().length > 0);
  const socialPlatformSelected = publishingAccessValues.socialPlatform.trim().length > 0;
  const socialAccountSelected = publishingAccessValues.socialAccountId.trim().length > 0;
  const hasSocialApiAccess = publishingAccessValues.socialApiKey.trim().length > 0;
  const publishingAccessComplete = socialPlatformSelected && socialAccountSelected && hasSocialApiAccess;
  const builderReady = requiredFieldsComplete && publishingAccessComplete;

  const updateBriefField = (fieldId, value) => {
    setBriefValues((currentValues) => ({
      ...currentValues,
      [fieldId]: value,
    }));
  };

  const updatePublishingAccessField = (fieldId, value) => {
    setPublishingAccessValues((currentValues) => ({
      ...currentValues,
      [fieldId]: value,
    }));
  };

  const runAgent = async () => {
    if (!builderReady || agentRunState.status === "running") {
      return;
    }

    setAgentRunState({
      status: "running",
      message: "Running agent through backend...",
      result: null,
    });

    try {
      const response = await fetch(`${apiBaseUrl}/api/agents/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...briefValues,
          ...publishingAccessValues,
          publishLive,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Agent run failed");
      }

      const runStatus = data?.ok === false ? "partial" : "complete";
      setAgentRunState({
        status: runStatus,
        message: data?.ok === false ? "Draft generated; publishing needs attention" : "Agent run completed",
        result: data,
      });

      // Persist agent run — best-effort, errors silently fall back to localStorage
      const runRecord = {
        run_id: data?.runId || null,
        model: data?.model || briefValues.modelName || null,
        prompt: briefValues.prompt || null,
        platforms: briefValues.platforms || null,
        draft_content: data?.draft || null,
        status: "completed",
        publish_status: data?.publishing?.status || null,
        usage: data?.usage || null,
      };
      try {
        const saveRes = await fetch(`${apiBaseUrl}/api/data/agent-runs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(runRecord),
        });
        if (!saveRes.ok) throw new Error("save failed");
      } catch {
        lsAdd(LS_KEYS.agentRuns, runRecord);
      }
    } catch (error) {
      setAgentRunState({
        status: "error",
        message: error instanceof Error ? error.message : "Agent run failed",
        result: null,
      });
    }
  };

  return (
    <div className="briefs-page">
      <motion.section className="briefs-hero panel" variants={itemVariants}>
        <div className="briefs-hero-copy">
          <span className="electric-kicker">Mission control</span>
          <h1>Agent Builder</h1>
          <p>Build your HiveAI marketing agents, give them a mission, and watch what each agent is working on in real time.</p>
          <div className="hero-actions">
            <MagneticButton className="primary-button large" type="button">
              <Plus size={20} />
              Create agent brief
            </MagneticButton>
            <MagneticButton className="secondary-button large" type="button">
              <UsersThree size={20} />
              View live agents
            </MagneticButton>
          </div>
        </div>

        <div className="briefs-radar" aria-hidden="true">
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
          <div>
            <strong>5</strong>
            <small>agents online</small>
          </div>
        </div>
      </motion.section>

      <div className="briefs-dashboard-grid">
        <MotionPanel className="panel builder-card">
          <div className="panel-title">
            <h2>Agent builder</h2>
            <span>Draft</span>
          </div>
          <div className="builder-form-grid">
            {briefBuilderFields.map((field) => (
              <motion.label
                className={field.wide ? "builder-field wide" : "builder-field"}
                key={field.id}
                whileHover={{ y: -2, borderColor: "rgba(177, 108, 255, 0.34)" }}
              >
                <span>{field.label}</span>
                {field.multiline ? (
                  <textarea
                    aria-label={field.label}
                    value={briefValues[field.id]}
                    onChange={(event) => updateBriefField(field.id, event.target.value)}
                    rows={2}
                  />
                ) : (
                  <input
                    aria-label={field.label}
                    type={field.type || "text"}
                    value={briefValues[field.id]}
                    onChange={(event) => updateBriefField(field.id, event.target.value)}
                    autoComplete={field.type === "password" ? "off" : undefined}
                  />
                )}
              </motion.label>
            ))}
          </div>
          <div className="publishing-access-block">
            <div className="builder-subtitle">
              <strong>Publishing access</strong>
              <span>Required before agents can post</span>
            </div>
            <div className="builder-form-grid access-grid">
              {publishingAccessFields.map((field) => (
                <motion.label
                  className="builder-field"
                  key={field.id}
                  whileHover={{ y: -2, borderColor: "rgba(177, 108, 255, 0.34)" }}
                >
                  <span>{field.label}</span>
                  <input
                    aria-label={field.label}
                    type={field.type || "text"}
                    value={publishingAccessValues[field.id]}
                    onChange={(event) => updatePublishingAccessField(field.id, event.target.value)}
                    autoComplete={field.type === "password" ? "off" : undefined}
                  />
                </motion.label>
              ))}
            </div>
            <label className="publish-toggle">
              <input
                type="checkbox"
                checked={publishLive}
                onChange={(event) => setPublishLive(event.target.checked)}
              />
              <span>
                <strong>Publish live after generation</strong>
                <small>Uses official API/token adapters when available</small>
              </span>
            </label>
          </div>
          <div className="builder-footer">
            <div className={builderReady ? "builder-check complete" : "builder-check"}>
              <CheckCircle size={20} weight="fill" />
              {builderReady
                ? "Ready to hand off and post"
                : publishingAccessComplete
                  ? "Complete model fields to hand off"
                  : "Add an official social API token to post"}
            </div>
            <MagneticButton
              className={builderReady ? "primary-button" : "secondary-button"}
              type="button"
              onClick={runAgent}
              disabled={!builderReady || agentRunState.status === "running"}
            >
              <Play size={18} weight="fill" />
              {agentRunState.status === "running" ? "Running agent" : "Run first agent"}
            </MagneticButton>
          </div>
          {agentRunState.status !== "idle" && (
            <div className={`agent-run-result ${agentRunState.status}`}>
              <div className="agent-run-head">
                <strong>{agentRunState.message}</strong>
                {agentRunState.result?.runId && <span>{agentRunState.result.runId.slice(0, 8)}</span>}
              </div>
              {agentRunState.result?.draft && <p>{agentRunState.result.draft}</p>}
              {agentRunState.result?.publishing && (
                <div className="agent-run-meta">
                  <span>{agentRunState.result.publishing.platform}</span>
                  <span>{agentRunState.result.publishing.status}</span>
                </div>
              )}
            </div>
          )}
        </MotionPanel>

        <MotionPanel className="panel live-workspace">
          <div className="panel-title">
            <h2>Live Agent Workspace</h2>
            <span>Realtime</span>
          </div>
          <div className="live-agent-grid">
            {liveAgentCards.map(([name, task, status, progress, Icon], index) => (
              <motion.article
                className="live-agent-card"
                key={name}
                style={{ "--index": index }}
                variants={itemVariants}
                whileHover={{ y: -3, borderColor: "rgba(177, 108, 255, 0.36)" }}
                layout
              >
                <div className="live-agent-head">
                  <span className="agent-icon small">
                    <Icon size={19} />
                  </span>
                  <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>
                </div>
                <h3>{name}</h3>
                <p>{task}</p>
                <div className="progress-meta">
                  <span>Progress</span>
                  <strong>{progress}%</strong>
                </div>
                <div className="agent-progress" aria-hidden="true">
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress / 100 }}
                    transition={{ duration: 0.9, delay: 0.1 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </motion.article>
            ))}
          </div>
        </MotionPanel>
      </div>

      <MotionPanel className="panel memory-panel">
        <div className="panel-title">
          <h2>Agent Memory / Instructions</h2>
          <span>Saved context</span>
        </div>
        <div className="memory-grid">
          {memoryCards.map(([title, copy, Icon]) => (
            <motion.article className="memory-card" key={title} whileHover={{ y: -3, backgroundColor: "rgba(177, 108, 255, 0.045)" }}>
              <Icon size={22} weight="duotone" />
              <div>
                <strong>{title}</strong>
                <span>{copy}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </MotionPanel>
    </div>
  );
}

const defaultSettings = {
  notifications: true,
  compactMode: false,
  autoRun: true,
  weeklyDigest: false,
};

function SettingsPage({ settings, onToggle, onSelect }) {
  const { integrations, refresh } = useIntegrationStatus();

  const refreshPlatform = async (platform) => {
    await fetch(`${apiBaseUrl}/api/integrations/${platform}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    refresh();
  };

  const disconnectPlatform = async (platform) => {
    await fetch(`${apiBaseUrl}/api/integrations/${platform}/disconnect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    refresh();
  };

  return (
    <MotionPanel className="panel settings-panel">
      <div className="settings-header">
        <div>
          <div className="section-kicker">Settings</div>
          <h1>Settings</h1>
          <p>A lightweight settings page with real saved preferences.</p>
        </div>
        <div className="settings-summary">
          <strong>{settings.notifications ? "Live" : "Muted"}</strong>
          <span>Notification state</span>
        </div>
      </div>

      <div className="settings-grid">
        <section className="settings-group">
          <h2>Workspace</h2>
          <label className="settings-row">
            <div>
              <strong>Compact mode</strong>
              <span>Reduce panel spacing and tighten the workspace.</span>
            </div>
            <button
              type="button"
              className={settings.compactMode ? "toggle on" : "toggle"}
              aria-pressed={settings.compactMode}
              onClick={() => onToggle("compactMode")}
            >
              <span />
            </button>
          </label>
          <label className="settings-row">
            <div>
              <strong>Auto-run agents</strong>
              <span>Keep the primary action focused on execution.</span>
            </div>
            <button
              type="button"
              className={settings.autoRun ? "toggle on" : "toggle"}
              aria-pressed={settings.autoRun}
              onClick={() => onToggle("autoRun")}
            >
              <span />
            </button>
          </label>
        </section>

        <section className="settings-group">
          <h2>Alerts</h2>
          <label className="settings-row">
            <div>
              <strong>Notifications</strong>
              <span>Show the channel warning in the workspace.</span>
            </div>
            <button
              type="button"
              className={settings.notifications ? "toggle on" : "toggle"}
              aria-pressed={settings.notifications}
              onClick={() => onToggle("notifications")}
            >
              <span />
            </button>
          </label>
          <label className="settings-row">
            <div>
              <strong>Weekly digest</strong>
              <span>Send a compact summary at the end of the week.</span>
            </div>
            <button
              type="button"
              className={settings.weeklyDigest ? "toggle on" : "toggle"}
              aria-pressed={settings.weeklyDigest}
              onClick={() => onToggle("weeklyDigest")}
            >
              <span />
            </button>
          </label>
        </section>

        <section className="settings-group">
          <h2>Brand tone</h2>
          <div className="segmented" role="tablist" aria-label="Brand tone">
            {["Focused", "Balanced", "Bold"].map((option) => (
              <button
                key={option}
                type="button"
                className={settings.tone === option ? "segment active" : "segment"}
                aria-pressed={settings.tone === option}
                onClick={() => onSelect("tone", option)}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="settings-note">Saved locally. These controls are wired to actual app state, not placeholders.</p>
        </section>

        <section className="settings-group integration-settings">
          <h2>Connected accounts</h2>
          {integrations.map((integration) => (
            <div className="settings-row integration-setting-row" key={integration.platform}>
              <div>
                <strong>{integration.name}</strong>
                <span>{statusLabel(integration.status)} - expires {integration.expiresAt ? new Date(integration.expiresAt).toLocaleDateString() : "after OAuth setup"}</span>
                <small>{integration.scopes.join(", ")}</small>
              </div>
              <div className="settings-mini-actions">
                <button type="button" onClick={() => refreshPlatform(integration.platform)}>Refresh</button>
                <button type="button" onClick={() => disconnectPlatform(integration.platform)}>Disconnect</button>
                <button type="button" onClick={refresh}>Sync now</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </MotionPanel>
  );
}

function PublishWorkspace({ integrations, onRefresh }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState(["x"]);
  const [values, setValues] = useState(publishInitialValues);
  const [drafts, setDrafts] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const togglePlatform = (platform) => {
    setSelectedPlatforms((current) =>
      current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform],
    );
  };

  const updateValue = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const saveDraft = () => {
    setDrafts((current) => [{ id: crypto.randomUUID(), ...values, platforms: selectedPlatforms, createdAt: new Date().toLocaleString() }, ...current].slice(0, 5));
    setResult({ status: "draft_saved", platforms: selectedPlatforms });
  };

  const publish = async () => {
    setError("");
    setResult(null);
    const payload = {
      ...values,
      mediaUrls: values.mediaUrls.split(/\s+/).filter(Boolean),
      hashtags: values.hashtags.split(/\s+/).filter(Boolean),
    };

    try {
      const responses = await Promise.all(selectedPlatforms.map(async (platform) => {
        const response = await fetch(`${apiBaseUrl}/api/integrations/${platform}/publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        return { platform, ok: response.ok, ...data };
      }));
      setResult({ status: "publish_complete", responses });
      onRefresh();
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Publishing failed");
    }
  };

  return (
    <MotionPanel className="panel publish-workspace">
      <div className="panel-title">
        <h2>Publish workspace</h2>
        <span>Agents ready</span>
      </div>

      <div className="platform-picker" aria-label="Publishing platforms">
        {integrations.map((integration) => {
          const meta = socialPlatforms[integration.platform];
          const Icon = meta?.icon || PlugsConnected;
          const selected = selectedPlatforms.includes(integration.platform);
          return (
            <button
              key={integration.platform}
              type="button"
              className={selected ? "platform-toggle active" : "platform-toggle"}
              onClick={() => togglePlatform(integration.platform)}
              style={{ "--platform-color": meta?.color || "var(--electric-hot)" }}
            >
              <Icon size={18} />
              <span>{integration.name}</span>
              <small>{statusLabel(integration.status)}</small>
            </button>
          );
        })}
      </div>

      <div className="publish-grid">
        {[
          ["text", "Text", true],
          ["title", "Title"],
          ["hashtags", "Hashtags"],
          ["mediaUrls", "Media URLs"],
          ["videoUrl", "Video URL"],
          ["imageUrl", "Image URL"],
          ["subreddit", "Subreddit"],
          ["scheduledAt", "Schedule"],
          ["campaignId", "Campaign"],
          ["agentId", "Agent"],
        ].map(([key, label, multiline]) => (
          <label className={multiline ? "builder-field wide" : "builder-field"} key={key}>
            <span>{label}</span>
            {multiline ? (
              <textarea value={values[key]} onChange={(event) => updateValue(key, event.target.value)} rows={3} />
            ) : (
              <input type={key === "scheduledAt" ? "datetime-local" : "text"} value={values[key]} onChange={(event) => updateValue(key, event.target.value)} />
            )}
          </label>
        ))}
      </div>

      <div className="agent-publish-strip">
        {publishingAgents.map((agent) => (
          <span key={agent}><ShieldCheck size={14} />{agent}</span>
        ))}
      </div>

      <div className="builder-footer publish-actions">
        <div className="builder-check complete">
          <CheckCircle size={20} weight="fill" />
          Shared social service normalizes agent payloads
        </div>
        <div className="publish-button-row">
          <MagneticButton className="secondary-button" type="button"><Lightning size={17} />Generate</MagneticButton>
          <MagneticButton className="secondary-button" type="button" onClick={saveDraft}><FloppyDisk size={17} />Save Draft</MagneticButton>
          <MagneticButton className="secondary-button" type="button"><PaperPlaneTilt size={17} />Send To Agents</MagneticButton>
          <MagneticButton className="secondary-button" type="button"><Eye size={17} />Preview</MagneticButton>
          <MagneticButton className="primary-button" type="button" onClick={publish}><UploadSimple size={17} />Publish</MagneticButton>
        </div>
      </div>

      {(result || error) && (
        <div className={error ? "publish-result error" : "publish-result"}>
          <strong>{error || result.status}</strong>
          {result?.responses?.map((item) => (
            <span key={item.platform}>{socialPlatforms[item.platform]?.name}: {item.status || item.error}</span>
          ))}
        </div>
      )}

      <div className="draft-history">
        <strong>Draft history</strong>
        {drafts.length === 0 ? <span>No drafts saved yet.</span> : drafts.map((draft) => <span key={draft.id}>{draft.createdAt} - {draft.platforms.join(", ")}</span>)}
      </div>
    </MotionPanel>
  );
}

function IntegrationsPage() {
  const { loading, integrations, scheduler, error, refresh } = useIntegrationStatus();
  const connectedCount = integrations.filter((integration) => integration.status === "connected").length;

  const connect = async (platform) => {
    const response = await fetch(`${apiBaseUrl}/api/integrations/${platform}/auth`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      window.dispatchEvent(new CustomEvent("hiveai-toast", { detail: data.error || "Connection setup failed" }));
      return;
    }
    window.location.href = data.authUrl;
  };

  const disconnect = async (platform) => {
    await fetch(`${apiBaseUrl}/api/integrations/${platform}/disconnect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    refresh();
  };

  return (
    <motion.div className="integrations-page" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
      <MotionPanel className="panel integrations-hero">
        <div>
          <span className="section-kicker">Account hub</span>
          <h1>Social integrations</h1>
          <p>Connect X.com, TikTok, Instagram, and Reddit so HiveAI agents can publish, schedule, and report from one secure backend.</p>
        </div>
        <div className="integration-summary">
          <strong>{connectedCount} / {integrations.length || 4}</strong>
          <span>accounts connected</span>
        </div>
      </MotionPanel>

      <MotionPanel className="panel integrations-panel">
        <div className="panel-title">
          <h2>OAuth accounts</h2>
          <span>{loading ? "Checking" : "OAuth ready"}</span>
        </div>
        {error && <div className="publish-result error"><strong>{error}</strong></div>}
        <div className="integration-grid">
          {integrations.map((integration, index) => {
            const meta = socialPlatforms[integration.platform];
            const Icon = meta?.icon || PlugsConnected;
            return (
            <motion.article className="integration-card rich" key={integration.platform} variants={itemVariants} style={{ "--index": index, "--platform-color": meta?.color || "var(--electric-hot)" }}>
              <div className="integration-icon platform-logo">
                <Icon size={22} />
              </div>
              <div className="integration-copy">
                <strong>{integration.name}</strong>
                <span>{integration.description}</span>
              </div>
              <span className={`integration-status ${integration.status}`}>
                {statusLabel(integration.status)}
              </span>
              <div className="integration-details">
                <span><Clock size={14} />Last sync: {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString() : "Never"}</span>
                <span><UserBadge />Account: {integration.username || "Not connected"}</span>
                <span>Token expiration: {integration.expiresAt ? new Date(integration.expiresAt).toLocaleString() : "Not issued"}</span>
                <span>Permissions: {integration.scopes.join(", ")}</span>
              </div>
              <div className="analytics-preview">
                <span>Reach {integration.analytics.reach}</span>
                <span>Queued {integration.analytics.queued}</span>
                <span>Errors {integration.analytics.errors}</span>
              </div>
              <div className="integration-action-group">
                <MagneticButton className="secondary-button integration-action" type="button" onClick={() => connect(integration.platform)}>
                  <PlugsConnected size={17} />
                  {integration.status === "needs_reconnect" ? "Reconnect" : "Connect"}
                </MagneticButton>
                <MagneticButton className="secondary-button integration-action" type="button" onClick={() => disconnect(integration.platform)} disabled={integration.status === "disconnected"}>
                  Disconnect
                </MagneticButton>
              </div>
            </motion.article>
            );
          })}
        </div>
      </MotionPanel>

      <ContentApprovalQueue integrations={integrations} onRefreshIntegrations={refresh} />

      <MotionPanel className="panel scheduler-panel">
        <div className="panel-title">
          <h2>Scheduler architecture</h2>
          <span>Future database ready</span>
        </div>
        <div className="scheduler-grid">
          {(scheduler?.modes || ["immediate", "scheduled", "recurring", "queue", "retry"]).map((mode) => (
            <span key={mode}>{mode}</span>
          ))}
        </div>
      </MotionPanel>
    </motion.div>
  );
}

function UserBadge() {
  return <UsersThree size={14} />;
}

function Topbar() {
  return (
    <header className="topbar">
      <button className="mobile-menu" type="button" aria-label="Open navigation">
        <List size={23} />
      </button>
      <a className="mobile-brand" href="/" aria-label="HiveAI home">
        <LogoMark />
        HiveAI
      </a>
      <span className="date-select">Thursday, Jun 26</span>
      <div className="top-actions">
        <MagneticButton className="icon-button" type="button" aria-label="Search">
          <MagnifyingGlass size={20} />
        </MagneticButton>
        <MagneticButton className="icon-button" type="button" aria-label="Notifications">
          <Bell size={20} />
        </MagneticButton>
        <MagneticButton className="icon-button desktop-only" type="button" aria-label="Open apps">
          <SquaresFour size={20} />
        </MagneticButton>
        <MagneticButton className="primary-button" type="button">
          <Lightning size={17} weight="fill" />
          Run agents
        </MagneticButton>
      </div>
    </header>
  );
}

function AgentList({ compact = false }) {
  return (
    <motion.section className={compact ? "agent-panel compact-panel" : "agent-panel"} aria-label="Active agents" variants={itemVariants} layout>
      <div className="panel-title">
        <h2>Active agents</h2>
        <span>Live</span>
      </div>
      <motion.div className="agent-list" variants={{ animate: { transition: { staggerChildren: 0.075 } } }}>
        {agents.map(([name, channel, value, label, Icon], index) => (
          <motion.article className="agent-row" style={{ "--index": index }} key={name} variants={itemVariants} whileHover={{ x: 5, borderColor: "rgba(177, 108, 255, 0.38)" }} layout>
            <div className="agent-icon">
              <Icon size={21} />
            </div>
            <div className="agent-copy">
              <strong>{name}</strong>
              <span>{compact ? label : channel}</span>
            </div>
            {!compact && (
              <div className="agent-value">
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            )}
            <span className="dot" />
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}

function SignalBoard() {
  return (
    <MotionPanel className="panel signal-board">
      <div className="section-kicker">
        <ChartLineUp size={16} />
        Signal board
      </div>
      <div className="metric-grid">
        {metrics.map(([label, value, delta, path]) => (
          <motion.article className="metric-card" key={label} whileHover={{ backgroundColor: "rgba(177, 108, 255, 0.04)" }} layout>
            <span>{label}</span>
            <strong>{value}</strong>
            <small className={delta.startsWith("+") ? "good" : "down"}>{delta}</small>
            <Sparkline path={path} />
          </motion.article>
        ))}
      </div>
    </MotionPanel>
  );
}

function ProductMock() {
  return (
    <motion.div className="product-mock product-mock-image" aria-hidden="true" whileHover={{ rotateX: 2, rotateY: -4, scale: 1.015 }} transition={fastSpring}>
      <img
        src={`${import.meta.env.BASE_URL}hiveai-dashboard-preview.png`}
        alt=""
        className="product-mock-shot"
        loading="lazy"
        decoding="async"
      />
    </motion.div>
  );
}

function CurrentBrief() {
  return (
    <MotionPanel className="panel brief-panel">
      <div className="brief-copy">
        <div className="section-kicker">
          <Command size={16} />
          Current brief
        </div>
        <h2>Convert trial users who imported contacts but skipped first send.</h2>
        <p>The strongest path is a short operator-led sequence: one specific outcome, one screenshot, one calendar hold.</p>
        <div className="brief-actions">
          <MagneticButton className="secondary-button" type="button">Open brief</MagneticButton>
          <div className="avatar-stack" aria-label="Brief collaborators">
            {[32, 47, 56].map((id) => (
              <img key={id} src={`https://i.pravatar.cc/80?img=${id}`} alt="" />
            ))}
            <span>+2</span>
          </div>
        </div>
      </div>
      <ProductMock />
    </MotionPanel>
  );
}

function Launches() {
  return (
    <MotionPanel className="panel launch-panel">
      <div className="section-kicker">
        <CalendarBlank size={16} />
        Next launches
      </div>
      <div className="launch-table">
        <div className="launch-head">
          <span>Date</span>
          <span>Campaign</span>
          <span>Channel</span>
          <span>Status</span>
          <span>Owner</span>
        </div>
        {launches.map(([date, title, channel, status, owner], index) => (
          <motion.article className="launch-row" key={title} whileHover={{ x: 5 }} layout>
            <time>{date}</time>
            <div className="campaign-cell">
              <span className="thumb" style={{ "--index": index }} />
              <strong>{title}</strong>
            </div>
            <span>{channel}</span>
            <small className={status === "Ready" ? "ready" : status === "Needs review" ? "review" : "draft"}>{status}</small>
            <img src={`https://i.pravatar.cc/80?img=${18 + index}`} alt={owner} />
          </motion.article>
        ))}
      </div>
      <MagneticButton className="text-link" type="button">View all launches</MagneticButton>
    </MotionPanel>
  );
}

function BottomCards() {
  return (
    <div className="bottom-grid">
      <MotionPanel className="panel revenue-card">
        <TrendUp size={26} weight="duotone" />
        <span>Revenue influenced</span>
        <strong>$84,620</strong>
        <p>Based on active briefs, list fatigue, and channel fit.</p>
        <Sparkline path="M30 106 L49 94 L69 98 L88 78 L108 92 L127 76 L147 55 L166 70 L186 42 L205 63 L225 47 L246 69" compact />
      </MotionPanel>
      <MotionPanel className="panel state-card">
        <motion.span className="check-ring" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
          <CheckCircle size={42} />
        </motion.span>
        <strong>Clean state</strong>
        <p>All core agents responded within 240 ms.</p>
      </MotionPanel>
      <MotionPanel className="panel loading-card preview-image-card" aria-label="Loading preview">
        <div className="section-kicker">Loading preview</div>
        <img
          src={`${import.meta.env.BASE_URL}hiveai-dashboard-preview.png`}
          alt="HiveAI Marketing Agents dashboard preview"
          loading="lazy"
          decoding="async"
        />
      </MotionPanel>
    </div>
  );
}

function WarningBar() {
  return (
    <motion.section className="warning-bar" role="status" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.28 }}>
      <Warning size={23} />
      <strong>Channel warning</strong>
      <span>LinkedIn connector needs a fresh token before scheduling.</span>
      <MagneticButton type="button">Reconnect</MagneticButton>
    </motion.section>
  );
}

function SupabaseStatus() {
  const [state, setState] = useState({
    loading: true,
    connected: false,
    error: "",
    rows: [],
  });

  useEffect(() => {
    let alive = true;

    async function loadTodos() {
      try {
        const response = await fetch("/api/todos");
        const payload = await response.json();

        if (!alive) {
          return;
        }

        if (!response.ok) {
          setState({
            loading: false,
            connected: false,
            error: payload?.error || `Request failed with status ${response.status}`,
            rows: [],
          });
          return;
        }

        setState({
          loading: false,
          connected: true,
          error: "",
          rows: Array.isArray(payload) ? payload : [],
        });
      } catch (err) {
        if (!alive) {
          return;
        }

        setState({
          loading: false,
          connected: false,
          error: err instanceof Error ? err.message : "Unknown Supabase error",
          rows: [],
        });
      }
    }

    loadTodos();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <MotionPanel className="panel supabase-panel">
      <div className="panel-title">
        <h2>Supabase backend</h2>
        <span>{state.loading ? "Checking" : state.connected ? "Live" : "Not ready"}</span>
      </div>
      {state.loading ? (
        <p className="supabase-copy">Connecting to the backend and reading the `todos` table.</p>
      ) : state.connected ? (
        <>
          <p className="supabase-copy">Connected. Showing the first {state.rows.length} rows from `todos`.</p>
          <div className="supabase-list">
            {state.rows.length === 0 ? (
              <div className="supabase-empty">No rows returned from `todos`.</div>
            ) : (
              state.rows.map((row) => (
                <div className="supabase-row" key={row.id ?? row.name ?? JSON.stringify(row)}>
                  <strong>{row.name ?? row.title ?? "Untitled row"}</strong>
                  <span>{row.id ? `ID ${row.id}` : "No id field"}</span>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <p className="supabase-copy">The app could not reach Supabase.</p>
          <div className="supabase-error">{state.error}</div>
        </>
      )}
    </MotionPanel>
  );
}

function MobileSummary() {
  return (
    <MotionPanel className="mobile-signal panel">
      <div className="panel-title">
        <h2>Signal board</h2>
        <span>Open</span>
      </div>
      {metrics.map(([label, value, delta]) => (
        <div className="mobile-metric" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          <small className={delta.startsWith("+") ? "good" : "down"}>{delta}</small>
        </div>
      ))}
    </MotionPanel>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState("Command center");
  const [roster, setRoster] = useState(agentRosterSeed);
  const [settings, setSettings] = useState(() => {
    if (typeof window === "undefined") return { ...defaultSettings, tone: "Focused" };
    try {
      const stored = window.localStorage.getItem("aiMarketingAgents.settings");
      return stored ? { ...defaultSettings, tone: "Focused", ...JSON.parse(stored) } : { ...defaultSettings, tone: "Focused" };
    } catch {
      return { ...defaultSettings, tone: "Focused" };
    }
  });

  useEffect(() => {
    window.localStorage.setItem("aiMarketingAgents.settings", JSON.stringify(settings));
    document.body.dataset.compact = settings.compactMode ? "true" : "false";
    document.body.dataset.tone = settings.tone.toLowerCase();
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const toggleSetting = (key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  const setAgentActive = (id, nextActive) => {
    setRoster((current) =>
      current.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              active: nextActive,
            }
          : agent,
      ),
    );
  };

  const pageContent = {
    "Command center": (
      <>
        <motion.div className="hero-layout" variants={{ animate: { transition: { staggerChildren: 0.1 } } }}>
          <motion.section className="hero-copy" variants={itemVariants}>
            <span className="electric-kicker">Live command center</span>
            <h1>Marketing agents, on task</h1>
            <p>Coordinated research, copy testing, and lifecycle execution from one focused operator view.</p>
            <div className="hero-actions">
              <MagneticButton className="primary-button large" type="button">
                <Plus size={20} />
                Build new brief
              </MagneticButton>
              <MagneticButton className="secondary-button large" type="button" onClick={() => setCurrentPage("Calendar")}>
                <CalendarBlank size={20} />
                Open calendar
              </MagneticButton>
            </div>
            <div className="nominal">
              <span className="status-light" />
              All systems nominal
            </div>
          </motion.section>
          <AgentList />
        </motion.div>

        <motion.div className="desktop-grid" variants={{ animate: { transition: { staggerChildren: 0.09 } } }}>
          <SignalBoard />
          <CurrentBrief />
          <SupabaseStatus />
          <Launches />
          <BottomCards />
        </motion.div>

        <MobileSummary />
        {settings.notifications && <WarningBar />}
      </>
    ),
    "AI Team Chat": <TeamChatPage />,
    Briefs: <BriefsPage />,
    Agents: <AgentsPage roster={roster} onSetAgentActive={setAgentActive} />,
    Campaigns: <CampaignsPage />,
    Experiments: <PageShell title="Experiments" subtitle="A lightweight experiments page." />,
    Calendar: <MarketingCalendarPage />,
    Insights: <PageShell title="Insights" subtitle="A lightweight insights page." />,
    Integrations: <IntegrationsPage />,
    Settings: <SettingsPage settings={settings} onToggle={toggleSetting} onSelect={updateSetting} />,
  };

  return (
    <main className={settings.compactMode ? "app-shell compact" : "app-shell"}>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <section className="workspace">
        <Topbar />
        <AnimatePresence mode="wait">
          <motion.div
            className="page-stage"
            key={currentPage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
          >
            {pageContent[currentPage]}
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);

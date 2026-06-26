import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  CalendarBlank,
  ChartLineUp,
  CheckCircle,
  Command,
  DotsThree,
  Flask,
  GearSix,
  HouseLine,
  Lightning,
  List,
  MagnifyingGlass,
  Megaphone,
  PaperPlaneTilt,
  PlugsConnected,
  Plus,
  SquaresFour,
  TrendUp,
  UsersThree,
  Warning,
} from "@phosphor-icons/react";
import "./styles.css";

const navItems = [
  ["Command center", HouseLine],
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

function Sparkline({ path, compact = false }) {
  return (
    <svg className={compact ? "sparkline compact" : "sparkline"} viewBox="0 0 276 126" aria-hidden="true">
      <path className="spark-fill" d={`${path} L246 126 L30 126 Z`} />
      <path className="spark-stroke" d={path} />
    </svg>
  );
}

function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="sidebar" aria-label="Workspace navigation">
      <a className="brand" href="/" aria-label="AiMarketingAgents home">
        <span className="brand-mark">
          <Lightning size={19} weight="fill" />
        </span>
        AiMarketingAgents
      </a>

      <nav className="side-nav">
        {navItems.map(([label, Icon]) => (
          <a
            className={currentPage === label ? "side-link active" : "side-link"}
            href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
            key={label}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(label);
            }}
          >
            <Icon size={18} />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="profile-card">
          <img src="https://i.pravatar.cc/80?img=12" alt="Alex Morgan" />
          <div>
            <strong>Alex Morgan</strong>
            <span>Growth Lead</span>
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
    </aside>
  );
}

function PageShell({ title, subtitle }) {
  return (
    <section className="panel page-shell">
      <div className="section-kicker">{title}</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <button className="mobile-menu" type="button" aria-label="Open navigation">
        <List size={23} />
      </button>
      <a className="mobile-brand" href="/" aria-label="AiMarketingAgents home">
        <span className="brand-mark">
          <Lightning size={17} weight="fill" />
        </span>
        AiMarketingAgents
      </a>
      <span className="date-select">Thursday, Jun 26</span>
      <div className="top-actions">
        <button className="icon-button" type="button" aria-label="Search">
          <MagnifyingGlass size={20} />
        </button>
        <button className="icon-button" type="button" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <button className="icon-button desktop-only" type="button" aria-label="Open apps">
          <SquaresFour size={20} />
        </button>
        <button className="primary-button" type="button">
          <Lightning size={17} weight="fill" />
          Run agents
        </button>
      </div>
    </header>
  );
}

function AgentList({ compact = false }) {
  return (
    <section className={compact ? "agent-panel compact-panel" : "agent-panel"} aria-label="Active agents">
      <div className="panel-title">
        <h2>Active agents</h2>
        <span>Live</span>
      </div>
      <div className="agent-list">
        {agents.map(([name, channel, value, label, Icon], index) => (
          <article className="agent-row" style={{ "--index": index }} key={name}>
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
          </article>
        ))}
      </div>
    </section>
  );
}

function SignalBoard() {
  return (
    <section className="panel signal-board">
      <div className="section-kicker">
        <ChartLineUp size={16} />
        Signal board
      </div>
      <div className="metric-grid">
        {metrics.map(([label, value, delta, path]) => (
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small className={delta.startsWith("+") ? "good" : "down"}>{delta}</small>
            <Sparkline path={path} />
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductMock() {
  return (
    <div className="product-mock" aria-hidden="true">
      <div className="mock-screen back" />
      <div className="mock-screen front">
        <span />
        <span />
        <span />
        <div className="mock-chart" />
      </div>
    </div>
  );
}

function CurrentBrief() {
  return (
    <section className="panel brief-panel">
      <div className="brief-copy">
        <div className="section-kicker">
          <Command size={16} />
          Current brief
        </div>
        <h2>Convert trial users who imported contacts but skipped first send.</h2>
        <p>The strongest path is a short operator-led sequence: one specific outcome, one screenshot, one calendar hold.</p>
        <div className="brief-actions">
          <button className="secondary-button" type="button">Open brief</button>
          <div className="avatar-stack" aria-label="Brief collaborators">
            {[32, 47, 56].map((id) => (
              <img key={id} src={`https://i.pravatar.cc/80?img=${id}`} alt="" />
            ))}
            <span>+2</span>
          </div>
        </div>
      </div>
      <ProductMock />
    </section>
  );
}

function Launches() {
  return (
    <section className="panel launch-panel">
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
          <article className="launch-row" key={title}>
            <time>{date}</time>
            <div className="campaign-cell">
              <span className="thumb" style={{ "--index": index }} />
              <strong>{title}</strong>
            </div>
            <span>{channel}</span>
            <small className={status === "Ready" ? "ready" : status === "Needs review" ? "review" : "draft"}>{status}</small>
            <img src={`https://i.pravatar.cc/80?img=${18 + index}`} alt={owner} />
          </article>
        ))}
      </div>
      <button className="text-link" type="button">View all launches</button>
    </section>
  );
}

function BottomCards() {
  return (
    <div className="bottom-grid">
      <section className="panel revenue-card">
        <TrendUp size={26} weight="duotone" />
        <span>Revenue influenced</span>
        <strong>$84,620</strong>
        <p>Based on active briefs, list fatigue, and channel fit.</p>
        <Sparkline path="M30 106 L49 94 L69 98 L88 78 L108 92 L127 76 L147 55 L166 70 L186 42 L205 63 L225 47 L246 69" compact />
      </section>
      <section className="panel state-card">
        <span className="check-ring">
          <CheckCircle size={42} />
        </span>
        <strong>Clean state</strong>
        <p>All core agents responded within 240 ms.</p>
      </section>
      <section className="panel loading-card" aria-label="Loading preview">
        <div className="section-kicker">Loading preview</div>
        <span />
        <span />
        <span />
      </section>
    </div>
  );
}

function WarningBar() {
  return (
    <section className="warning-bar" role="status">
      <Warning size={23} />
      <strong>Channel warning</strong>
      <span>LinkedIn connector needs a fresh token before scheduling.</span>
      <button type="button">Reconnect</button>
    </section>
  );
}

function MobileSummary() {
  return (
    <section className="mobile-signal panel">
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
    </section>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState("Command center");

  const pageContent = {
    "Command center": (
      <>
        <div className="hero-layout">
          <section className="hero-copy">
            <span className="purple-kicker">Live command center</span>
            <h1>Marketing agents, on task</h1>
            <p>Coordinated research, copy testing, and lifecycle execution from one focused operator view.</p>
            <div className="hero-actions">
              <button className="primary-button large" type="button">
                <Plus size={20} />
                Build new brief
              </button>
              <button className="secondary-button large" type="button">
                <CalendarBlank size={20} />
                Open calendar
              </button>
            </div>
            <div className="nominal">
              <span className="status-light" />
              All systems nominal
            </div>
          </section>
          <AgentList />
        </div>

        <div className="desktop-grid">
          <SignalBoard />
          <CurrentBrief />
          <Launches />
          <BottomCards />
        </div>

        <MobileSummary />
        <WarningBar />
      </>
    ),
    Briefs: <PageShell title="Briefs" subtitle="A lightweight briefs page." />,
    Agents: <PageShell title="Agents" subtitle="A lightweight agents page." />,
    Campaigns: <PageShell title="Campaigns" subtitle="A lightweight campaigns page." />,
    Experiments: <PageShell title="Experiments" subtitle="A lightweight experiments page." />,
    Calendar: <PageShell title="Calendar" subtitle="A lightweight calendar page." />,
    Insights: <PageShell title="Insights" subtitle="A lightweight insights page." />,
    Integrations: <PageShell title="Integrations" subtitle="A lightweight integrations page." />,
    Settings: <PageShell title="Settings" subtitle="A lightweight settings page." />,
  };

  return (
    <main className="app-shell">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <section className="workspace">
        <Topbar />
        <div className="page-stage" key={currentPage}>
          {pageContent[currentPage]}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);

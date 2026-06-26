import React, { useState } from "react";
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
  Command,
  Flask,
  GearSix,
  HouseLine,
  Lightning,
  List,
  MagnifyingGlass,
  PaperPlaneTilt,
  PlugsConnected,
  Plus,
  SquaresFour,
  TrendUp,
  UsersThree,
  Warning,
} from "@phosphor-icons/react";
import "./styles.css";

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
      <a className="brand" href="/" aria-label="AiMarketingAgents home">
        <span className="brand-mark">
          <Lightning size={19} weight="fill" />
        </span>
        AiMarketingAgents
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
    <motion.div className="product-mock" aria-hidden="true" whileHover={{ rotateX: 2, rotateY: -4, scale: 1.015 }} transition={fastSpring}>
      <motion.div className="mock-screen back" animate={{ y: [0, 5, 0], rotate: [-8, -10, -8] }} transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="mock-screen front" animate={{ y: [0, -6, 0], rotate: [7, 5, 7] }} transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}>
        <span />
        <span />
        <span />
        <div className="mock-chart" />
      </motion.div>
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
      <MotionPanel className="panel loading-card" aria-label="Loading preview">
        <div className="section-kicker">Loading preview</div>
        <span />
        <span />
        <span />
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

  const pageContent = {
    "Command center": (
      <>
        <motion.div className="hero-layout" variants={{ animate: { transition: { staggerChildren: 0.1 } } }}>
          <motion.section className="hero-copy" variants={itemVariants}>
            <span className="purple-kicker">Live command center</span>
            <h1>Marketing agents, on task</h1>
            <p>Coordinated research, copy testing, and lifecycle execution from one focused operator view.</p>
            <div className="hero-actions">
              <MagneticButton className="primary-button large" type="button">
                <Plus size={20} />
                Build new brief
              </MagneticButton>
              <MagneticButton className="secondary-button large" type="button">
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
          <Launches />
          <BottomCards />
        </motion.div>

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

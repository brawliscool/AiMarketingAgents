import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarBlank,
  Lightning,
  List,
  Plus,
  SquaresFour,
} from "@phosphor-icons/react";
import { formatMonthYear, formatShortDate } from "../../calendar/dateUtils.js";

function ToolbarButton({ active, children, ...props }) {
  return (
    <motion.button
      type="button"
      className={active ? "mc-toolbar-btn active" : "mc-toolbar-btn"}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function CalendarToolbar({
  view,
  setView,
  cursorDate,
  selectedDate,
  onPrev,
  onNext,
  onToday,
  onCreate,
  onGenerateWeek,
  onGenerateMonth,
  onAutoFill,
  saving,
  persistence,
}) {
  const title = view === "day"
    ? formatShortDate(selectedDate)
    : formatMonthYear(cursorDate);

  return (
    <div className="mc-toolbar">
      <div className="mc-toolbar-left">
        <div className="section-kicker">
          <CalendarBlank size={16} />
          AI Marketing Calendar
        </div>
        <h1>{title}</h1>
        <p>Schedule, drag, and generate content across every channel — synced via {persistence === "supabase" ? "Supabase" : "localStorage"}.</p>
      </div>

      <div className="mc-toolbar-controls">
        <div className="mc-nav-group">
          <ToolbarButton onClick={onPrev} aria-label="Previous">
            <ArrowLeft size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={onToday}>Today</ToolbarButton>
          <ToolbarButton onClick={onNext} aria-label="Next">
            <ArrowRight size={16} />
          </ToolbarButton>
        </div>

        <div className="mc-view-group">
          <ToolbarButton active={view === "month"} onClick={() => setView("month")}>
            <SquaresFour size={16} />
            Month
          </ToolbarButton>
          <ToolbarButton active={view === "week"} onClick={() => setView("week")}>
            <CalendarBlank size={16} />
            Week
          </ToolbarButton>
          <ToolbarButton active={view === "day"} onClick={() => setView("day")}>
            <List size={16} />
            Day
          </ToolbarButton>
        </div>

        <div className="mc-ai-group">
          <ToolbarButton onClick={onGenerateWeek} disabled={saving}>
            <Lightning size={16} />
            Generate This Week
          </ToolbarButton>
          <ToolbarButton onClick={onGenerateMonth} disabled={saving}>
            <Lightning size={16} />
            Generate This Month
          </ToolbarButton>
          <ToolbarButton onClick={onAutoFill} disabled={saving}>
            Auto-fill empty days
          </ToolbarButton>
        </div>

        <motion.button
          type="button"
          className="primary-button"
          onClick={onCreate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          New post
        </motion.button>
      </div>
    </div>
  );
}

import React from "react";
import { motion } from "framer-motion";
import { PLATFORMS, STATUS_LABELS } from "../../calendar/constants.js";
import { formatTime } from "../../calendar/dateUtils.js";

export function EventChip({
  event,
  compact = false,
  draggable = true,
  onSelect,
  onDragStart,
  onDragEnd,
}) {
  const platform = PLATFORMS[event.platform];
  const PlatformIcon = platform?.icon;

  return (
    <motion.button
      type="button"
      className={`mc-event-chip${compact ? " compact" : ""}`}
      style={{ "--platform-color": platform?.color || "#1b8cff" }}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/event-id", event.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(event.id);
      }}
      onDragEnd={() => onDragEnd?.()}
      onClick={() => onSelect?.(event)}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <span className="mc-event-chip-bar" aria-hidden="true" />
      <span className="mc-event-chip-main">
        <span className="mc-event-chip-title">{event.title}</span>
        {!compact && (
          <span className="mc-event-chip-meta">
            {PlatformIcon && <PlatformIcon size={12} weight="fill" />}
            {formatTime(event.scheduledAt)}
            <span className={`mc-status-pill status-${event.status}`}>{STATUS_LABELS[event.status]}</span>
          </span>
        )}
      </span>
    </motion.button>
  );
}

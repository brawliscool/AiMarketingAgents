import React from "react";
import { motion } from "framer-motion";
import { eventsForDay, formatShortDate, formatTime } from "../../calendar/dateUtils.js";
import { PLATFORMS, STATUS_LABELS } from "../../calendar/constants.js";
import { EventChip } from "./EventChip.jsx";

export function DayView({
  selectedDate,
  events,
  onSelectEvent,
  onDropOnSlot,
  draggingEventId,
  onDragStart,
  onDragEnd,
}) {
  const dayEvents = eventsForDay(events, selectedDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, hour) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/event-id");
    if (eventId) onDropOnSlot(eventId, selectedDate, hour);
  };

  return (
    <div className="mc-day-view">
      <div className="mc-day-view-header">
        <h3>{formatShortDate(selectedDate)}</h3>
        <span>{dayEvents.length} scheduled</span>
      </div>

      <div className="mc-day-agenda">
        {hours.map((hour) => {
          const hourEvents = dayEvents.filter((e) => new Date(e.scheduledAt).getHours() === hour);
          return (
            <div className="mc-agenda-row" key={hour}>
              <time className="mc-agenda-time">
                {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </time>
              <motion.div
                className={["mc-agenda-slot", draggingEventId && "drop-target"].filter(Boolean).join(" ")}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, hour)}
              >
                {hourEvents.length === 0 ? (
                  <span className="mc-agenda-empty">—</span>
                ) : (
                  hourEvents.map((event) => {
                    const platform = PLATFORMS[event.platform];
                    const PlatformIcon = platform?.icon;
                    return (
                      <article key={event.id} className="mc-agenda-card">
                        <div className="mc-agenda-card-head">
                          <EventChip
                            event={event}
                            onSelect={onSelectEvent}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                          />
                          <span className={`mc-status-pill status-${event.status}`}>{STATUS_LABELS[event.status]}</span>
                        </div>
                        <div className="mc-agenda-card-meta">
                          {PlatformIcon && <PlatformIcon size={14} weight="fill" style={{ color: platform.color }} />}
                          <span>{platform.name}</span>
                          <span>{event.campaignName}</span>
                          <span>{formatTime(event.scheduledAt)}</span>
                        </div>
                        {event.contentPreview && (
                          <p className="mc-agenda-preview">{event.contentPreview}</p>
                        )}
                      </article>
                    );
                  })
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

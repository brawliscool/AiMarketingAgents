import React from "react";
import { motion } from "framer-motion";
import { getMonthGrid, eventsForDay, isToday, isSameDay, formatMonthYear } from "../../calendar/dateUtils.js";
import { EventChip } from "./EventChip.jsx";

export function MonthView({
  cursorDate,
  selectedDate,
  events,
  onSelectDate,
  onSelectEvent,
  onDropOnDate,
  draggingEventId,
  onDragStart,
  onDragEnd,
}) {
  const cells = getMonthGrid(cursorDate);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, date) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/event-id");
    if (eventId) onDropOnDate(eventId, date);
  };

  return (
    <div className="mc-month-view">
      <div className="mc-month-label" aria-live="polite">{formatMonthYear(cursorDate)}</div>
      <div className="mc-month-grid" role="grid" aria-label="Monthly calendar">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div className="mc-dow" key={day}>{day}</div>
        ))}
        {cells.map((cell) => {
          const dayEvents = eventsForDay(events, cell.date);
          const selected = isSameDay(cell.date, selectedDate);
          const today = isToday(cell.date);

          return (
            <motion.div
              key={cell.date.toISOString()}
              role="gridcell"
              className={[
                "mc-day-cell",
                !cell.inMonth && "muted",
                selected && "selected",
                today && "today",
                draggingEventId && "drop-target",
              ].filter(Boolean).join(" ")}
              onClick={() => onSelectDate(cell.date)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, cell.date)}
              whileHover={{ y: -1 }}
            >
              <div className="mc-day-head">
                <span className="mc-day-number">{cell.date.getDate()}</span>
                {dayEvents.length > 0 && <span className="mc-day-count">{dayEvents.length}</span>}
              </div>
              <div className="mc-day-events">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventChip
                    key={event.id}
                    event={event}
                    compact
                    onSelect={onSelectEvent}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <span className="mc-more-events">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

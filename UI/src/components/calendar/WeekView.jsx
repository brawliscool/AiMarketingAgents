import React from "react";
import { motion } from "framer-motion";
import { getWeekDays, getHourSlots, eventsForDay, formatShortDate, isToday, isSameDay } from "../../calendar/dateUtils.js";
import { EventChip } from "./EventChip.jsx";

export function WeekView({
  cursorDate,
  selectedDate,
  events,
  onSelectDate,
  onSelectEvent,
  onDropOnSlot,
  draggingEventId,
  onDragStart,
  onDragEnd,
}) {
  const days = getWeekDays(cursorDate);
  const hours = getHourSlots().filter((h) => h >= 7 && h <= 21);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, date, hour) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/event-id");
    if (eventId) onDropOnSlot(eventId, date, hour);
  };

  return (
    <div className="mc-week-view">
      <div className="mc-week-header">
        <div className="mc-week-time-gutter" />
        {days.map((day) => (
          <button
            key={day.toISOString()}
            type="button"
            className={[
              "mc-week-day-head",
              isToday(day) && "today",
              isSameDay(day, selectedDate) && "selected",
            ].filter(Boolean).join(" ")}
            onClick={() => onSelectDate(day)}
          >
            <span>{formatShortDate(day)}</span>
          </button>
        ))}
      </div>
      <div className="mc-week-body">
        {hours.map((hour) => (
          <div className="mc-week-row" key={hour}>
            <div className="mc-week-time">{hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</div>
            {days.map((day) => {
              const slotEvents = eventsForDay(events, day).filter(
                (e) => new Date(e.scheduledAt).getHours() === hour,
              );
              return (
                <motion.div
                  key={`${day.toISOString()}-${hour}`}
                  className={["mc-week-slot", draggingEventId && "drop-target"].filter(Boolean).join(" ")}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, day, hour)}
                  whileHover={{ backgroundColor: "rgba(86, 182, 255, 0.04)" }}
                >
                  {slotEvents.map((event) => (
                    <EventChip
                      key={event.id}
                      event={event}
                      compact
                      onSelect={onSelectEvent}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                    />
                  ))}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

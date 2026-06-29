import React from "react";
import { motion } from "framer-motion";
import { useMarketingCalendar } from "../../calendar/useMarketingCalendar.js";
import { CalendarSidebar } from "./CalendarSidebar.jsx";
import { CalendarToolbar } from "./CalendarToolbar.jsx";
import { DayView } from "./DayView.jsx";
import { EventEditor } from "./EventEditor.jsx";
import { MonthView } from "./MonthView.jsx";
import { WeekView } from "./WeekView.jsx";
import "../../styles/calendar.css";

const itemVariants = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 110, damping: 20, mass: 0.8 } },
};

export function MarketingCalendarPage() {
  const calendar = useMarketingCalendar();

  const handleSelectEvent = (event) => {
    calendar.setEditingEvent({ ...event, _isNew: false });
  };

  const handleDropOnDate = (eventId, date) => {
    calendar.rescheduleEvent(eventId, date);
    calendar.setDraggingEventId(null);
  };

  const handleDropOnSlot = (eventId, date, hour) => {
    calendar.rescheduleEvent(eventId, date, hour);
    calendar.setDraggingEventId(null);
  };

  if (calendar.loading) {
    return (
      <motion.section className="mc-page" variants={itemVariants} initial="initial" animate="animate">
        <div className="panel mc-loading-panel">
          <div className="section-kicker">Calendar</div>
          <h1>Loading schedule…</h1>
          <p>Reading your marketing calendar from {calendar.persistence === "supabase" ? "Supabase" : "local storage"}.</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="mc-page"
      variants={{ animate: { transition: { staggerChildren: 0.06 } } }}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={itemVariants}>
        <CalendarToolbar
          view={calendar.view}
          setView={calendar.setView}
          cursorDate={calendar.cursorDate}
          selectedDate={calendar.selectedDate}
          onPrev={calendar.navigatePrev}
          onNext={calendar.navigateNext}
          onToday={calendar.goToToday}
          onCreate={() => calendar.createEvent()}
          onGenerateWeek={calendar.runGenerateWeek}
          onGenerateMonth={calendar.runGenerateMonth}
          onAutoFill={calendar.runAutoFill}
          saving={calendar.saving}
          persistence={calendar.persistence}
        />
      </motion.div>

      {calendar.error && (
        <motion.div className="mc-error-banner" variants={itemVariants} role="alert">
          {calendar.error}
        </motion.div>
      )}

      <div className="mc-layout">
        <motion.div className="mc-main panel" variants={itemVariants}>
          {calendar.view === "month" && (
            <MonthView
              cursorDate={calendar.cursorDate}
              selectedDate={calendar.selectedDate}
              events={calendar.visibleEvents}
              onSelectDate={calendar.setSelectedDate}
              onSelectEvent={handleSelectEvent}
              onDropOnDate={handleDropOnDate}
              draggingEventId={calendar.draggingEventId}
              onDragStart={calendar.setDraggingEventId}
              onDragEnd={() => calendar.setDraggingEventId(null)}
            />
          )}
          {calendar.view === "week" && (
            <WeekView
              cursorDate={calendar.cursorDate}
              selectedDate={calendar.selectedDate}
              events={calendar.visibleEvents}
              onSelectDate={(date) => {
                calendar.setSelectedDate(date);
                calendar.setView("day");
              }}
              onSelectEvent={handleSelectEvent}
              onDropOnSlot={handleDropOnSlot}
              draggingEventId={calendar.draggingEventId}
              onDragStart={calendar.setDraggingEventId}
              onDragEnd={() => calendar.setDraggingEventId(null)}
            />
          )}
          {calendar.view === "day" && (
            <DayView
              selectedDate={calendar.selectedDate}
              events={calendar.visibleEvents}
              onSelectEvent={handleSelectEvent}
              onDropOnSlot={handleDropOnSlot}
              draggingEventId={calendar.draggingEventId}
              onDragStart={calendar.setDraggingEventId}
              onDragEnd={() => calendar.setDraggingEventId(null)}
            />
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <CalendarSidebar
            upcomingEvents={calendar.upcomingEvents}
            campaigns={calendar.campaigns}
            postingWarnings={calendar.postingWarnings}
            varietySuggestions={calendar.varietySuggestions}
            aiMessage={calendar.aiMessage}
            persistence={calendar.persistence}
          />
        </motion.div>
      </div>

      {calendar.editingEvent && (
        <EventEditor
          event={calendar.editingEvent}
          campaigns={calendar.campaigns}
          allEvents={calendar.events}
          onSave={calendar.saveEvent}
          onDelete={calendar.removeEvent}
          onClose={() => calendar.setEditingEvent(null)}
          saving={calendar.saving}
        />
      )}
    </motion.section>
  );
}

export default MarketingCalendarPage;

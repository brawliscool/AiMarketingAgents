import { useCallback, useEffect, useMemo, useState } from "react";
import {
  analyzePostingLoad,
  expandRecurringEvents,
  generateForEmptyDays,
  generateThisMonth,
  generateThisWeek,
  suggestContentVariety,
} from "./ai.js";
import { createEventId } from "./constants.js";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  eventsInRange,
  moveEventToDate,
  moveEventToDateTime,
  startOfMonth,
  startOfWeek,
} from "./dateUtils.js";
import { deleteEvent, loadCalendarData, persistEvents, upsertEvent } from "./storage.js";

export function useMarketingCalendar() {
  const [events, setEvents] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [persistence, setPersistence] = useState("local");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("month");
  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [editingEvent, setEditingEvent] = useState(null);
  const [draggingEventId, setDraggingEventId] = useState(null);
  const [aiMessage, setAiMessage] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await loadCalendarData();
      setEvents(data.events);
      setCampaigns(data.campaigns);
      setPersistence(data.persistence);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load calendar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const expandedEvents = useMemo(() => {
    const horizon = addMonths(cursorDate, 3);
    return expandRecurringEvents(events, horizon);
  }, [events, cursorDate]);

  const visibleRange = useMemo(() => {
    if (view === "day") {
      return { start: selectedDate, end: selectedDate };
    }
    if (view === "week") {
      return { start: startOfWeek(cursorDate, 1), end: endOfWeek(cursorDate, 1) };
    }
    return { start: startOfMonth(cursorDate), end: endOfMonth(cursorDate) };
  }, [view, cursorDate, selectedDate]);

  const visibleEvents = useMemo(
    () => eventsInRange(expandedEvents, visibleRange.start, visibleRange.end),
    [expandedEvents, visibleRange],
  );

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return expandedEvents
      .filter((e) => new Date(e.scheduledAt) >= now && e.status !== "posted")
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
      .slice(0, 8);
  }, [expandedEvents]);

  const postingWarnings = useMemo(
    () => analyzePostingLoad(expandedEvents, visibleRange.start, visibleRange.end),
    [expandedEvents, visibleRange],
  );

  const varietySuggestions = useMemo(
    () => suggestContentVariety(expandedEvents, visibleRange.start, visibleRange.end),
    [expandedEvents, visibleRange],
  );

  const commitEvents = useCallback(async (nextEvents) => {
    setSaving(true);
    setError("");
    try {
      await persistEvents(nextEvents, persistence);
      setEvents(nextEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [persistence]);

  const saveEvent = useCallback(async (event) => {
    setSaving(true);
    setError("");
    try {
      const saved = await upsertEvent(event, persistence);
      setEvents((current) => {
        const index = current.findIndex((e) => e.id === saved.id);
        if (index === -1) return [...current, saved];
        const next = [...current];
        next[index] = saved;
        return next;
      });
      setEditingEvent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save event");
    } finally {
      setSaving(false);
    }
  }, [persistence]);

  const removeEvent = useCallback(async (eventId) => {
    setSaving(true);
    setError("");
    try {
      await deleteEvent(eventId, persistence);
      setEvents((current) => current.filter((e) => e.id !== eventId));
      setEditingEvent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete event");
    } finally {
      setSaving(false);
    }
  }, [persistence]);

  const rescheduleEvent = useCallback(async (eventId, targetDate, hour = null) => {
    const event = expandedEvents.find((e) => e.id === eventId);
    if (!event) return;
    const updated = hour != null
      ? moveEventToDateTime(event, targetDate, hour)
      : moveEventToDate(event, targetDate);
    await saveEvent(updated);
  }, [expandedEvents, saveEvent]);

  const createEvent = useCallback((partial = {}) => {
    const base = new Date(selectedDate);
    base.setHours(10, 0, 0, 0);
    const campaign = campaigns[0];
    setEditingEvent({
      id: createEventId(),
      title: "",
      platform: "instagram",
      campaignId: campaign?.id || "",
      campaignName: campaign?.name || "",
      agentId: "social",
      scheduledAt: base.toISOString(),
      status: "draft",
      notes: "",
      contentPreview: "",
      recurring: null,
      _isNew: true,
      ...partial,
    });
  }, [campaigns, selectedDate]);

  const mergeGenerated = useCallback(async (generated, message) => {
    if (!generated.length) {
      setAiMessage("No new slots needed — your calendar already has coverage.");
      return;
    }
    const next = [...events, ...generated];
    await commitEvents(next);
    setAiMessage(message || `Added ${generated.length} AI-drafted posts.`);
  }, [events, commitEvents]);

  const runGenerateWeek = useCallback(async () => {
    const generated = generateThisWeek(events, cursorDate);
    await mergeGenerated(generated, `Generated ${generated.length} posts for this week.`);
  }, [events, cursorDate, mergeGenerated]);

  const runGenerateMonth = useCallback(async () => {
    const generated = generateThisMonth(events, cursorDate);
    await mergeGenerated(generated, `Filled ${generated.length} empty days this month.`);
  }, [events, cursorDate, mergeGenerated]);

  const runAutoFill = useCallback(async () => {
    const generated = generateForEmptyDays(events, visibleRange.start, visibleRange.end);
    await mergeGenerated(generated, `Auto-filled ${generated.length} empty days in view.`);
  }, [events, visibleRange, mergeGenerated]);

  const navigatePrev = useCallback(() => {
    if (view === "day") {
      setCursorDate((d) => addDays(d, -1));
      setSelectedDate((d) => addDays(d, -1));
    } else if (view === "week") {
      setCursorDate((d) => addDays(d, -7));
    } else {
      setCursorDate((d) => addMonths(d, -1));
    }
  }, [view]);

  const navigateNext = useCallback(() => {
    if (view === "day") {
      setCursorDate((d) => addDays(d, 1));
      setSelectedDate((d) => addDays(d, 1));
    } else if (view === "week") {
      setCursorDate((d) => addDays(d, 7));
    } else {
      setCursorDate((d) => addMonths(d, 1));
    }
  }, [view]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCursorDate(today);
    setSelectedDate(today);
  }, []);

  return {
    events: expandedEvents,
    rawEvents: events,
    campaigns,
    persistence,
    loading,
    saving,
    error,
    view,
    setView,
    cursorDate,
    selectedDate,
    setSelectedDate,
    visibleEvents,
    upcomingEvents,
    postingWarnings,
    varietySuggestions,
    editingEvent,
    setEditingEvent,
    draggingEventId,
    setDraggingEventId,
    aiMessage,
    setAiMessage,
    refresh,
    saveEvent,
    removeEvent,
    rescheduleEvent,
    createEvent,
    runGenerateWeek,
    runGenerateMonth,
    runAutoFill,
    navigatePrev,
    navigateNext,
    goToToday,
  };
}

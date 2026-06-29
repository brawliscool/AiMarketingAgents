const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function isSameDay(a, b) {
  const left = new Date(a);
  const right = new Date(b);
  return (
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
  );
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

export function formatMonthYear(date) {
  const d = new Date(date);
  return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(date) {
  const d = new Date(date);
  return `${DOW_LABELS[d.getDay()]}, ${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
}

export function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatDateTimeLocal(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function parseDateTimeLocal(value) {
  if (!value) return new Date().toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function startOfWeek(date, weekStartsOn = 1) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  return addDays(d, -diff);
}

export function endOfWeek(date, weekStartsOn = 1) {
  return endOfDay(addDays(startOfWeek(date, weekStartsOn), 6));
}

export function startOfMonth(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(date) {
  const d = new Date(date);
  return endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function getMonthGrid(date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, 1);
  const cells = [];

  let cursor = new Date(gridStart);
  while (cursor <= monthEnd || cells.length % 7 !== 0) {
    cells.push({
      date: new Date(cursor),
      inMonth: cursor.getMonth() === monthStart.getMonth(),
    });
    cursor = addDays(cursor, 1);
    if (cells.length >= 42) break;
  }

  while (cells.length < 42) {
    cells.push({
      date: new Date(cursor),
      inMonth: false,
    });
    cursor = addDays(cursor, 1);
  }

  return cells;
}

export function getWeekDays(date) {
  const start = startOfWeek(date, 1);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getHourSlots() {
  return Array.from({ length: 24 }, (_, hour) => hour);
}

export function toDateKey(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function eventsForDay(events, day) {
  return events
    .filter((event) => isSameDay(event.scheduledAt, day))
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
}

export function eventsInRange(events, start, end) {
  const startMs = startOfDay(start).getTime();
  const endMs = endOfDay(end).getTime();
  return events
    .filter((event) => {
      const t = new Date(event.scheduledAt).getTime();
      return t >= startMs && t <= endMs;
    })
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
}

export function moveEventToDate(event, targetDate, preserveTime = true) {
  const current = new Date(event.scheduledAt);
  const target = new Date(targetDate);
  if (preserveTime) {
    target.setHours(current.getHours(), current.getMinutes(), 0, 0);
  }
  return { ...event, scheduledAt: target.toISOString(), status: event.status === "posted" ? "posted" : "scheduled" };
}

export function moveEventToDateTime(event, targetDate, hour) {
  const target = new Date(targetDate);
  target.setHours(hour, 0, 0, 0);
  return { ...event, scheduledAt: target.toISOString(), status: event.status === "posted" ? "posted" : "scheduled" };
}

export { DOW_LABELS, MONTH_LABELS };

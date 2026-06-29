import {
  CONTENT_TEMPLATES,
  DEFAULT_AGENTS,
  DEFAULT_CAMPAIGNS,
  MAX_POSTS_PER_DAY_TOTAL,
  MAX_POSTS_PER_PLATFORM_PER_DAY,
  OPTIMAL_POST_HOURS,
  PLATFORM_IDS,
  PLATFORMS,
  createEventId,
} from "./constants.js";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  eventsForDay,
  eventsInRange,
  isSameDay,
  startOfDay,
  startOfWeek,
} from "./dateUtils.js";

function countPostsOnDay(events, day, platform = null) {
  return eventsForDay(events, day).filter((e) => !platform || e.platform === platform).length;
}

export function analyzePostingLoad(events, rangeStart, rangeEnd) {
  const warnings = [];
  const inRange = eventsInRange(events, rangeStart, rangeEnd);
  const dayMap = new Map();

  for (const event of inRange) {
    const key = startOfDay(event.scheduledAt).toISOString();
    if (!dayMap.has(key)) dayMap.set(key, { total: 0, platforms: {} });
    const bucket = dayMap.get(key);
    bucket.total += 1;
    bucket.platforms[event.platform] = (bucket.platforms[event.platform] || 0) + 1;
  }

  for (const [dayKey, bucket] of dayMap) {
    if (bucket.total > MAX_POSTS_PER_DAY_TOTAL) {
      warnings.push({
        type: "over-posting",
        day: dayKey,
        message: `${bucket.total} posts scheduled — consider spreading across more days (max ${MAX_POSTS_PER_DAY_TOTAL}/day).`,
      });
    }
    for (const [platform, count] of Object.entries(bucket.platforms)) {
      if (count > MAX_POSTS_PER_PLATFORM_PER_DAY) {
        warnings.push({
          type: "platform-overload",
          day: dayKey,
          platform,
          message: `${PLATFORMS[platform]?.name || platform}: ${count} posts on one day.`,
        });
      }
    }
  }

  return warnings;
}

export function suggestBestTimes(platform, events, day) {
  const hours = OPTIMAL_POST_HOURS[platform] || [10, 14, 18];
  const dayEvents = eventsForDay(events, day);
  const takenHours = new Set(dayEvents.filter((e) => e.platform === platform).map((e) => new Date(e.scheduledAt).getHours()));

  return hours
    .filter((h) => !takenHours.has(h))
    .map((hour) => ({
      hour,
      label: `${hour > 12 ? hour - 12 : hour || 12}:00 ${hour >= 12 ? "PM" : "AM"}`,
      score: hours.indexOf(hour) === 0 ? "Best" : "Good",
    }));
}

export function suggestContentVariety(events, rangeStart, rangeEnd) {
  const inRange = eventsInRange(events, rangeStart, rangeEnd);
  const platformCounts = {};
  const statusCounts = {};

  for (const id of PLATFORM_IDS) platformCounts[id] = 0;
  for (const event of inRange) {
    platformCounts[event.platform] = (platformCounts[event.platform] || 0) + 1;
    statusCounts[event.status] = (statusCounts[event.status] || 0) + 1;
  }

  const underused = PLATFORM_IDS
    .map((id) => ({ platform: id, count: platformCounts[id] || 0 }))
    .sort((a, b) => a.count - b.count);

  const suggestions = [];
  if (underused[0]?.count === 0) {
    suggestions.push({
      type: "variety",
      message: `No ${PLATFORMS[underused[0].platform].name} posts this period — add one for channel balance.`,
      platform: underused[0].platform,
    });
  } else if (underused[0] && underused[underused.length - 1].count - underused[0].count >= 3) {
    suggestions.push({
      type: "variety",
      message: `${PLATFORMS[underused[0].platform].name} is underrepresented vs other channels.`,
      platform: underused[0].platform,
    });
  }

  const draftRatio = inRange.length ? (statusCounts.draft || 0) / inRange.length : 0;
  if (draftRatio > 0.5 && inRange.length >= 3) {
    suggestions.push({
      type: "readiness",
      message: "Over half of posts are still drafts — review and mark ready before the week starts.",
    });
  }

  return suggestions;
}

function pickTemplate(index) {
  return CONTENT_TEMPLATES[index % CONTENT_TEMPLATES.length];
}

function findOpenSlot(events, day, platform) {
  const hours = OPTIMAL_POST_HOURS[platform] || [10, 14, 18];
  const dayEvents = eventsForDay(events, day);

  for (const hour of hours) {
    const platformCount = dayEvents.filter((e) => e.platform === platform && new Date(e.scheduledAt).getHours() === hour).length;
    if (platformCount === 0 && countPostsOnDay(events, day) < MAX_POSTS_PER_DAY_TOTAL) {
      const slot = new Date(day);
      slot.setHours(hour, 0, 0, 0);
      if (countPostsOnDay(events, day, platform) < MAX_POSTS_PER_PLATFORM_PER_DAY) {
        return slot;
      }
    }
  }
  return null;
}

function buildDraftEvent(day, platform, templateIndex, campaign, agent) {
  const template = pickTemplate(templateIndex);
  const hours = OPTIMAL_POST_HOURS[platform] || [10, 14, 18];
  const hour = hours[templateIndex % hours.length];
  const scheduled = new Date(day);
  scheduled.setHours(hour, 0, 0, 0);

  return {
    id: createEventId(),
    title: `${PLATFORMS[platform].name}: ${template.title}`,
    platform,
    campaignId: campaign.id,
    campaignName: campaign.name,
    agentId: agent.id,
    scheduledAt: scheduled.toISOString(),
    status: "draft",
    notes: "AI-generated placeholder — review before scheduling.",
    contentPreview: template.preview,
    recurring: null,
  };
}

export function generateForEmptyDays(existingEvents, rangeStart, rangeEnd) {
  const generated = [];
  const allEvents = [...existingEvents, ...generated];
  let cursor = startOfDay(rangeStart);
  const end = startOfDay(rangeEnd);
  let templateIndex = 0;

  while (cursor <= end) {
    const dayEvents = eventsForDay(allEvents, cursor);
    if (dayEvents.length === 0) {
      const platform = PLATFORM_IDS[templateIndex % PLATFORM_IDS.length];
      const campaign = DEFAULT_CAMPAIGNS[templateIndex % DEFAULT_CAMPAIGNS.length];
      const agent = DEFAULT_AGENTS[templateIndex % DEFAULT_AGENTS.length];
      const slot = findOpenSlot(allEvents, cursor, platform) || (() => {
        const d = new Date(cursor);
        d.setHours(10, 0, 0, 0);
        return d;
      })();

      if (countPostsOnDay(allEvents, cursor) < MAX_POSTS_PER_DAY_TOTAL) {
        const event = buildDraftEvent(slot, platform, templateIndex, campaign, agent);
        event.scheduledAt = slot.toISOString();
        generated.push(event);
        allEvents.push(event);
      }
    }
    cursor = addDays(cursor, 1);
    templateIndex += 1;
  }

  return generated;
}

export function generateThisWeek(existingEvents, referenceDate = new Date()) {
  const start = startOfWeek(referenceDate, 1);
  const end = endOfWeek(referenceDate, 1);
  const generated = [];
  const allEvents = [...existingEvents];
  let cursor = startOfDay(start);
  let templateIndex = 0;

  while (cursor <= end) {
    const dayEvents = eventsForDay(allEvents, cursor);
    const targetPosts = cursor.getDay() === 0 || cursor.getDay() === 6 ? 1 : 2;

    if (dayEvents.length < targetPosts) {
      for (let i = dayEvents.length; i < targetPosts; i += 1) {
        const platform = PLATFORM_IDS[(templateIndex + i) % PLATFORM_IDS.length];
        if (countPostsOnDay(allEvents, cursor, platform) >= MAX_POSTS_PER_PLATFORM_PER_DAY) continue;
        if (countPostsOnDay(allEvents, cursor) >= MAX_POSTS_PER_DAY_TOTAL) break;

        const slot = findOpenSlot(allEvents, cursor, platform);
        if (!slot) continue;

        const campaign = DEFAULT_CAMPAIGNS[(templateIndex + i) % DEFAULT_CAMPAIGNS.length];
        const agent = DEFAULT_AGENTS[(templateIndex + i) % DEFAULT_AGENTS.length];
        const event = buildDraftEvent(slot, platform, templateIndex + i, campaign, agent);
        event.scheduledAt = slot.toISOString();
        generated.push(event);
        allEvents.push(event);
      }
    }
    cursor = addDays(cursor, 1);
    templateIndex += 1;
  }

  return generated;
}

export function generateThisMonth(existingEvents, referenceDate = new Date()) {
  const start = startOfDay(referenceDate);
  start.setDate(1);
  const end = endOfMonth(referenceDate);
  return generateForEmptyDays(existingEvents, start, end);
}

export function expandRecurringEvents(events, rangeEnd, maxInstances = 52) {
  const expanded = [...events];
  const masters = events.filter((e) => e.recurring?.enabled);

  for (const master of masters) {
    const existingChildren = events.filter((e) => e.recurring?.parentId === master.id);
    if (existingChildren.length >= maxInstances) continue;

    let cursor = addDays(new Date(master.scheduledAt), 1);
    const freq = master.recurring.frequency || "weekly";
    const interval = master.recurring.interval || 1;
    let created = existingChildren.length;

    while (cursor <= rangeEnd && created < maxInstances) {
      const endDate = master.recurring.endDate ? new Date(master.recurring.endDate) : null;
      if (endDate && cursor > endDate) break;

      const exists = expanded.some((e) => isSameDay(e.scheduledAt, cursor) && e.recurring?.parentId === master.id);
      if (!exists) {
        const instance = {
          ...master,
          id: createEventId(),
          scheduledAt: (() => {
            const d = new Date(cursor);
            const m = new Date(master.scheduledAt);
            d.setHours(m.getHours(), m.getMinutes(), 0, 0);
            return d.toISOString();
          })(),
          status: "scheduled",
          recurring: {
            ...master.recurring,
            enabled: false,
            parentId: master.id,
          },
        };
        expanded.push(instance);
        created += 1;
      }

      if (freq === "daily") cursor = addDays(cursor, interval);
      else if (freq === "weekly") cursor = addDays(cursor, 7 * interval);
      else cursor = addDays(cursor, 30 * interval);
    }
  }

  return expanded;
}

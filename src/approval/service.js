import { randomUUID } from "node:crypto";

export const workflowStages = [
  "Research Agent",
  "Content Writer",
  "SEO Review",
  "Brand Voice Review",
  "Compliance Check",
  "Owner Approval",
  "Scheduled",
  "Published",
];

export const approvalStatuses = ["Pending", "Running", "Needs Changes", "Approved", "Rejected", "Failed"];

const defaultAssignments = {
  "Research Agent": "Research Agent",
  "Content Writer": "Content Writer",
  "SEO Review": "SEO Specialist",
  "Brand Voice Review": "Brand Guardian",
  "Compliance Check": "Compliance Agent",
  "Owner Approval": "Owner",
  Scheduled: "Calendar Agent",
  Published: "Publishing Agent",
};

function nowIso() {
  return new Date().toISOString();
}

function cleanText(value, maxLength = 6000) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, maxLength);
}

function cleanList(value, maxItems = 30, itemLen = 120) {
  const source = Array.isArray(value) ? value : String(value || "").split(/\s+/);
  return source
    .map((item) => cleanText(item, itemLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function normalizeVersion(version, fallbackLabel = "Initial") {
  return {
    id: cleanText(version?.id, 80) || randomUUID(),
    label: cleanText(version?.label, 120) || fallbackLabel,
    content: cleanText(version?.content, 12_000),
    createdAt: cleanText(version?.createdAt, 120) || nowIso(),
    createdBy: cleanText(version?.createdBy, 120) || "system",
  };
}

function createStage(stageName, index) {
  const running = index === 0;
  return {
    stage: stageName,
    status: running ? "Running" : "Pending",
    timestamp: running ? nowIso() : null,
    assignedAgent: defaultAssignments[stageName] || "Unassigned",
    notes: "",
    passFail: running ? "In Progress" : "Pending",
  };
}

function analyzeContent(text, hashtags) {
  const safeText = cleanText(text, 12_000);
  const normalized = safeText.toLowerCase();
  const hashTags = cleanList(hashtags, 40, 70);
  const checks = [];

  const grammarIssues = [];
  if (/\s{2,}/.test(safeText)) grammarIssues.push("Contains repeated spaces.");
  if (/\bi\b/.test(safeText)) grammarIssues.push("Lowercase standalone 'i' found.");
  if (!/[.!?]$/.test(safeText) && safeText.length > 20) grammarIssues.push("Content does not end with clear punctuation.");
  checks.push({ key: "grammarIssues", title: "Grammar issues", issues: grammarIssues });

  const brandIssues = [];
  ["guaranteed", "cheap", "overnight", "no effort"].forEach((term) => {
    if (normalized.includes(term)) brandIssues.push(`Potentially off-brand phrase: "${term}"`);
  });
  checks.push({ key: "brandInconsistencies", title: "Brand inconsistencies", issues: brandIssues });

  const ctaDetected = /(book|join|start|try|learn more|shop|subscribe|get started|schedule)/i.test(safeText);
  checks.push({
    key: "missingCta",
    title: "Missing CTA",
    issues: ctaDetected ? [] : ["No clear call-to-action detected."],
  });

  const firstSentence = safeText.split(/[.!?]/)[0] || "";
  const weakHook = [];
  if (firstSentence.length > 110) weakHook.push("Opening hook is too long.");
  if (!/[!?]/.test(firstSentence) && !/\d/.test(firstSentence)) weakHook.push("Opening line may need a stronger hook.");
  checks.push({ key: "weakHooks", title: "Weak hooks", issues: weakHook });

  const seoOpportunities = [];
  if (safeText.length < 120) seoOpportunities.push("Expand body copy for richer ranking signals.");
  if (!/(benefit|outcome|strategy|guide|tips|best)/i.test(safeText)) seoOpportunities.push("Add benefit-focused keywords.");
  checks.push({ key: "seoOpportunities", title: "SEO opportunities", issues: seoOpportunities });

  const hashtagIssues = [];
  if (hashTags.length < 3) hashtagIssues.push("Add at least 3 hashtags.");
  checks.push({ key: "missingHashtags", title: "Missing hashtags", issues: hashtagIssues });

  const missingKeywords = [];
  ["hiveai", "marketing", "automation"].forEach((keyword) => {
    if (!normalized.includes(keyword)) missingKeywords.push(`Missing keyword: ${keyword}`);
  });
  checks.push({ key: "missingKeywords", title: "Missing keywords", issues: missingKeywords });

  return checks;
}

function summarizeDashboard(items) {
  const today = new Date().toISOString().slice(0, 10);
  const isToday = (value) => String(value || "").startsWith(today);
  let pendingApprovals = 0;
  let approvedToday = 0;
  let rejectedToday = 0;
  let scheduledToday = 0;

  for (const item of items) {
    const owner = item.workflow?.find((stage) => stage.stage === "Owner Approval");
    const scheduled = item.workflow?.find((stage) => stage.stage === "Scheduled");
    if (owner && ["Running", "Pending", "Needs Changes"].includes(owner.status)) pendingApprovals += 1;
    if (owner?.status === "Approved" && isToday(owner.timestamp)) approvedToday += 1;
    if (item.overallStatus === "Rejected" && isToday(item.updatedAt)) rejectedToday += 1;
    if (scheduled?.status === "Approved" && isToday(scheduled.timestamp)) scheduledToday += 1;
  }

  return { pendingApprovals, approvedToday, rejectedToday, scheduledToday };
}

function sanitizeContentPayload(payload) {
  return {
    text: cleanText(payload?.text, 10_000),
    title: cleanText(payload?.title, 280),
    hashtags: cleanList(payload?.hashtags, 30, 60),
    mediaUrls: cleanList(payload?.mediaUrls, 12, 600),
    videoUrl: cleanText(payload?.videoUrl, 600),
    imageUrl: cleanText(payload?.imageUrl, 600),
    subreddit: cleanText(payload?.subreddit, 80),
    scheduledAt: cleanText(payload?.scheduledAt, 80),
    campaignId: cleanText(payload?.campaignId, 120),
    agentId: cleanText(payload?.agentId, 120) || "Content Writer",
  };
}

function normalizeItem(item) {
  const workflow = workflowStages.map((stage, index) => {
    const existing = (item.workflow || []).find((entry) => entry?.stage === stage);
    if (!existing) return createStage(stage, index);
    return {
      stage,
      status: approvalStatuses.includes(existing.status) ? existing.status : "Pending",
      timestamp: cleanText(existing.timestamp, 120) || null,
      assignedAgent: cleanText(existing.assignedAgent, 120) || defaultAssignments[stage] || "Unassigned",
      notes: cleanText(existing.notes, 1_000),
      passFail: cleanText(existing.passFail, 40) || "Pending",
    };
  });

  return {
    id: cleanText(item.id, 80) || randomUUID(),
    title: cleanText(item.title, 280),
    content: sanitizeContentPayload(item.content || {}),
    versions: (Array.isArray(item.versions) ? item.versions : []).map((version, index) =>
      normalizeVersion(version, `Version ${index + 1}`),
    ),
    workflow,
    currentStageIndex: Math.max(0, Math.min(Number(item.currentStageIndex || 0), workflowStages.length - 1)),
    overallStatus: cleanText(item.overallStatus, 40) || "Pending",
    history: Array.isArray(item.history) ? item.history.slice(0, 200) : [],
    checks: Array.isArray(item.checks) ? item.checks : analyzeContent(item.content?.text || "", item.content?.hashtags || []),
    createdAt: cleanText(item.createdAt, 120) || nowIso(),
    updatedAt: cleanText(item.updatedAt, 120) || nowIso(),
  };
}

function pushHistory(item, action, actor, notes = "") {
  item.history.unshift({
    id: randomUUID(),
    action,
    actor: cleanText(actor, 120) || "system",
    notes: cleanText(notes, 1_000),
    timestamp: nowIso(),
  });
  item.history = item.history.slice(0, 300);
}

function currentStage(item) {
  return item.workflow[item.currentStageIndex];
}

export function createApprovalQueueService(store) {
  return {
    async list() {
      const items = (await store.listItems()).map((item) => normalizeItem(item));
      items.sort((left, right) => (left.updatedAt < right.updatedAt ? 1 : -1));
      return {
        items,
        dashboard: summarizeDashboard(items),
        persistenceMode: store.mode(),
        fallbackReason: store.fallbackReason(),
      };
    },
    async get(itemId) {
      const items = await store.listItems();
      const found = items.find((item) => item.id === itemId);
      return found ? normalizeItem(found) : null;
    },
    async create(input) {
      const content = sanitizeContentPayload(input.content || {});
      const initialVersion = normalizeVersion({
        label: "Initial",
        content: content.text,
        createdBy: content.agentId || "Content Writer",
      });
      const item = normalizeItem({
        id: randomUUID(),
        title: content.title || `Content ${new Date().toLocaleDateString()}`,
        content,
        versions: [initialVersion],
        workflow: workflowStages.map((stage, index) => createStage(stage, index)),
        currentStageIndex: 0,
        overallStatus: "Pending",
        history: [],
        checks: analyzeContent(content.text, content.hashtags),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      pushHistory(item, "created", item.content.agentId || "Content Writer", "Submitted to approval queue");
      await store.saveItem(item);
      return item;
    },
    async applyAction(itemId, actionInput = {}) {
      const item = await this.get(itemId);
      if (!item) return null;
      const action = cleanText(actionInput.action, 60).toLowerCase();
      const actor = cleanText(actionInput.actor, 120) || "Owner";
      const notes = cleanText(actionInput.notes, 1_000);
      const stage = currentStage(item);
      const timestamp = nowIso();

      if (action === "edit") {
        const nextText = cleanText(actionInput.content, 12_000);
        if (nextText) {
          item.content.text = nextText;
          item.versions.unshift(normalizeVersion({
            label: actionInput.label || `Edited ${new Date().toLocaleTimeString()}`,
            content: nextText,
            createdBy: actor,
            createdAt: timestamp,
          }));
          stage.notes = notes || "Content edited";
          stage.timestamp = timestamp;
          item.checks = analyzeContent(item.content.text, item.content.hashtags);
          pushHistory(item, "edit", actor, notes || "Content updated.");
        }
      } else if (action === "regenerate") {
        const regenerated = cleanText(actionInput.content, 12_000) || `${item.content.text}\n\n(Alternative regenerated variant)`;
        item.versions.unshift(normalizeVersion({
          label: actionInput.label || `Regenerated ${new Date().toLocaleTimeString()}`,
          content: regenerated,
          createdBy: actor,
          createdAt: timestamp,
        }));
        item.content.text = regenerated;
        stage.status = "Running";
        stage.notes = notes || "Regenerated by agent";
        stage.passFail = "In Progress";
        stage.timestamp = timestamp;
        item.overallStatus = "Running";
        item.checks = analyzeContent(item.content.text, item.content.hashtags);
        pushHistory(item, "regenerate", actor, notes || "Created regenerated version.");
      } else if (action === "approve") {
        stage.status = "Approved";
        stage.timestamp = timestamp;
        stage.notes = notes || "Approved";
        stage.passFail = "Pass";
        pushHistory(item, "approve", actor, notes || `Approved ${stage.stage}`);

        if (item.currentStageIndex < workflowStages.length - 1) {
          item.currentStageIndex += 1;
          const next = currentStage(item);
          next.status = "Running";
          next.timestamp = timestamp;
          next.notes = "";
          next.passFail = "In Progress";
        }
        item.overallStatus = item.currentStageIndex >= workflowStages.length - 1 ? "Approved" : "Running";
      } else if (action === "reject") {
        stage.status = "Rejected";
        stage.timestamp = timestamp;
        stage.notes = notes || "Rejected";
        stage.passFail = "Fail";
        item.overallStatus = "Rejected";
        pushHistory(item, "reject", actor, notes || `Rejected at ${stage.stage}`);
      } else if (action === "send_back") {
        stage.status = "Needs Changes";
        stage.timestamp = timestamp;
        stage.notes = notes || "Needs revision";
        stage.passFail = "Fail";
        item.overallStatus = "Needs Changes";
        if (item.currentStageIndex > 0) {
          item.currentStageIndex -= 1;
          const previous = currentStage(item);
          previous.status = "Running";
          previous.timestamp = timestamp;
          previous.passFail = "In Progress";
          previous.notes = `Sent back by ${actor}`;
        }
        pushHistory(item, "send_back", actor, notes || "Returned to previous stage.");
      } else if (action === "fail") {
        stage.status = "Failed";
        stage.timestamp = timestamp;
        stage.notes = notes || "Failed quality checks";
        stage.passFail = "Fail";
        item.overallStatus = "Failed";
        pushHistory(item, "fail", actor, notes || "Marked as failed.");
      } else if (action === "assign") {
        stage.assignedAgent = cleanText(actionInput.assignedAgent, 120) || stage.assignedAgent;
        stage.timestamp = timestamp;
        stage.notes = notes || `Assigned to ${stage.assignedAgent}`;
        pushHistory(item, "assign", actor, stage.notes);
      } else if (action === "publish") {
        const scheduled = item.workflow.find((entry) => entry.stage === "Scheduled");
        const published = item.workflow.find((entry) => entry.stage === "Published");
        if (scheduled) {
          scheduled.status = "Approved";
          scheduled.timestamp = timestamp;
          scheduled.passFail = "Pass";
          scheduled.notes = notes || "Scheduled and queued for publish.";
        }
        if (published) {
          published.status = "Approved";
          published.timestamp = timestamp;
          published.passFail = "Pass";
          published.notes = notes || "Published successfully.";
        }
        item.currentStageIndex = workflowStages.length - 1;
        item.overallStatus = "Published";
        pushHistory(item, "publish", actor, notes || "Content published.");
      }

      item.updatedAt = timestamp;
      await store.saveItem(item);
      return item;
    },
  };
}

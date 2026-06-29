import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowsClockwise,
  ArrowsLeftRight,
  CalendarBlank,
  CheckCircle,
  Eye,
  FloppyDisk,
  PaperPlaneTilt,
  PencilSimple,
  ProhibitInset,
  Warning,
  XCircle,
} from "@phosphor-icons/react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8787";
const cacheKey = "hiveai.approval.queue.cache.v1";

const initialValues = {
  text: "",
  title: "",
  hashtags: "",
  mediaUrls: "",
  videoUrl: "",
  imageUrl: "",
  subreddit: "",
  scheduledAt: "",
  campaignId: "launch-001",
  agentId: "content-writer",
};

function safeParseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function formatDate(value) {
  if (!value) return "—";
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? "—" : new Date(timestamp).toLocaleString();
}

function workflowClass(status) {
  return String(status || "").toLowerCase().replace(/\s+/g, "-");
}

export function ContentApprovalQueue({ integrations, onRefreshIntegrations }) {
  const [values, setValues] = useState(initialValues);
  const [selectedPlatforms, setSelectedPlatforms] = useState(() =>
    integrations.filter((item) => item.status === "connected").map((item) => item.platform).slice(0, 1),
  );
  const [queue, setQueue] = useState(() => {
    if (typeof window === "undefined") return { items: [], dashboard: {} };
    return safeParseJson(window.localStorage.getItem(cacheKey), { items: [], dashboard: {} });
  });
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editContent, setEditContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showCompare, setShowCompare] = useState(true);

  const selectedItem = useMemo(
    () => queue.items.find((item) => item.id === selectedId) || queue.items[0] || null,
    [queue.items, selectedId],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(cacheKey, JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    setSelectedPlatforms((current) => (current.length > 0 ? current : integrations.slice(0, 1).map((item) => item.platform)));
  }, [integrations]);

  useEffect(() => {
    setEditContent(selectedItem?.content?.text || "");
  }, [selectedItem?.id]);

  async function refreshQueue() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/approval/queue`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Could not load approval queue");
      setQueue(data);
      if (!selectedId && data.items?.length > 0) {
        setSelectedId(data.items[0].id);
      }
    } catch (queueError) {
      setError(queueError instanceof Error ? queueError.message : "Could not load approval queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshQueue();
  }, []);

  async function submitForApproval() {
    setError("");
    const payload = {
      ...values,
      hashtags: values.hashtags.split(/\s+/).filter(Boolean),
      mediaUrls: values.mediaUrls.split(/\s+/).filter(Boolean),
    };
    try {
      const response = await fetch(`${apiBaseUrl}/api/approval/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Failed to submit for approval");
      await refreshQueue();
      setSelectedId(data.item?.id || null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Submission failed");
    }
  }

  async function runAction(action, extra = {}) {
    if (!selectedItem) return;
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/approval/items/${selectedItem.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, actor: "Owner", ...extra }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Action failed");
      await refreshQueue();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed");
    }
  }

  async function publishItem() {
    if (!selectedItem) return;
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/approval/items/${selectedItem.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor: "Owner", platforms: selectedPlatforms }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Publish failed");
      await refreshQueue();
      onRefreshIntegrations?.();
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Publish failed");
    }
  }

  return (
    <section className="panel approval-panel">
      <div className="panel-title">
        <h2>Content approval queue</h2>
        <span>{loading ? "Loading" : "Workflow live"}</span>
      </div>

      <div className="approval-dashboard">
        <article>
          <strong>{queue.dashboard?.pendingApprovals || 0}</strong>
          <span>Pending approvals</span>
        </article>
        <article>
          <strong>{queue.dashboard?.approvedToday || 0}</strong>
          <span>Approved today</span>
        </article>
        <article>
          <strong>{queue.dashboard?.rejectedToday || 0}</strong>
          <span>Rejected today</span>
        </article>
        <article>
          <strong>{queue.dashboard?.scheduledToday || 0}</strong>
          <span>Scheduled today</span>
        </article>
      </div>

      <div className="publish-grid">
        {[
          ["text", "Text", true],
          ["title", "Title"],
          ["hashtags", "Hashtags"],
          ["mediaUrls", "Media URLs"],
          ["videoUrl", "Video URL"],
          ["imageUrl", "Image URL"],
          ["subreddit", "Subreddit"],
          ["scheduledAt", "Schedule"],
          ["campaignId", "Campaign"],
          ["agentId", "Agent"],
        ].map(([key, label, multiline]) => (
          <label className={multiline ? "builder-field wide" : "builder-field"} key={key}>
            <span>{label}</span>
            {multiline ? (
              <textarea value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} rows={3} />
            ) : (
              <input
                type={key === "scheduledAt" ? "datetime-local" : "text"}
                value={values[key]}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
              />
            )}
          </label>
        ))}
      </div>

      <div className="builder-footer publish-actions">
        <div className="builder-check complete">
          <CheckCircle size={20} weight="fill" />
          Queue enforces research → review → owner approval before publish
        </div>
        <div className="publish-button-row">
          <button className="secondary-button" type="button" onClick={refreshQueue}><ArrowsClockwise size={17} />Refresh</button>
          <button className="primary-button" type="button" onClick={submitForApproval}><FloppyDisk size={17} />Submit for approval</button>
        </div>
      </div>

      <div className="approval-layout">
        <aside className="approval-item-list">
          {queue.items.length === 0 && <div className="publish-result"><strong>No content in queue yet.</strong></div>}
          {queue.items.map((item) => (
            <button key={item.id} type="button" className={selectedItem?.id === item.id ? "approval-item active" : "approval-item"} onClick={() => setSelectedId(item.id)}>
              <strong>{item.title || "Untitled content"}</strong>
              <span>{item.overallStatus}</span>
              <small>{formatDate(item.updatedAt)}</small>
            </button>
          ))}
        </aside>

        {selectedItem && (
          <div className="approval-detail">
            <div className="approval-head">
              <div>
                <h3>{selectedItem.title || "Untitled content"}</h3>
                <span>Current stage: {selectedItem.workflow?.[selectedItem.currentStageIndex]?.stage || "—"}</span>
              </div>
              <div className="publish-button-row">
                <button className="secondary-button" type="button" onClick={() => runAction("approve", { notes: "Approved by owner dashboard." })}><CheckCircle size={16} />Approve</button>
                <button className="secondary-button" type="button" onClick={() => runAction("reject", { notes: "Rejected by owner." })}><XCircle size={16} />Reject</button>
                <button className="secondary-button" type="button" onClick={() => runAction("send_back", { notes: "Needs another iteration." })}><ProhibitInset size={16} />Send back</button>
                <button className="primary-button" type="button" onClick={publishItem}><PaperPlaneTilt size={16} />Publish</button>
              </div>
            </div>

            <div className="approval-actions">
              <button type="button" className="secondary-button" onClick={() => setShowPreview((value) => !value)}><Eye size={16} />Preview</button>
              <button type="button" className="secondary-button" onClick={() => runAction("edit", { content: editContent, notes: "Edited in owner dashboard." })}><PencilSimple size={16} />Edit</button>
              <button type="button" className="secondary-button" onClick={() => runAction("regenerate", { content: `${editContent}\n\nTry a stronger hook and CTA.` })}><ArrowsClockwise size={16} />Regenerate</button>
              <button type="button" className="secondary-button" onClick={() => setShowCompare((value) => !value)}><ArrowsLeftRight size={16} />Compare versions</button>
            </div>

            {showPreview && (
              <article className="publish-result">
                <strong>Preview</strong>
                <span>{selectedItem.content?.text || "No preview content available."}</span>
              </article>
            )}

            <label className="builder-field wide">
              <span>Edit content</span>
              <textarea value={editContent} onChange={(event) => setEditContent(event.target.value)} rows={5} />
            </label>

            {showCompare && (
              <div className="approval-version-compare">
                {(selectedItem.versions || []).slice(0, 2).map((version) => (
                  <article key={version.id}>
                    <strong>{version.label}</strong>
                    <small>{formatDate(version.createdAt)} · {version.createdBy}</small>
                    <p>{version.content || "No content snapshot."}</p>
                  </article>
                ))}
              </div>
            )}

            <div className="workflow-grid">
              {(selectedItem.workflow || []).map((stage) => (
                <article key={stage.stage} className={`workflow-stage ${workflowClass(stage.status)}`}>
                  <h4>{stage.stage}</h4>
                  <span>Status: {stage.status}</span>
                  <span>Timestamp: {formatDate(stage.timestamp)}</span>
                  <span>Assigned: {stage.assignedAgent || "Unassigned"}</span>
                  <span>Pass/Fail: {stage.passFail || "Pending"}</span>
                  <p>{stage.notes || "No notes yet."}</p>
                </article>
              ))}
            </div>

            <div className="approval-ai-checks">
              {(selectedItem.checks || []).map((check) => (
                <article key={check.key} className={check.issues?.length ? "has-issues" : "clear"}>
                  <div>
                    {check.issues?.length ? <Warning size={16} /> : <CheckCircle size={16} />}
                    <strong>{check.title}</strong>
                  </div>
                  {check.issues?.length ? (
                    <ul>
                      {check.issues.map((issue) => <li key={issue}>{issue}</li>)}
                    </ul>
                  ) : (
                    <p>No issues detected.</p>
                  )}
                </article>
              ))}
            </div>

            <div className="draft-history">
              <strong>Approval history</strong>
              {(selectedItem.history || []).slice(0, 8).map((entry) => (
                <span key={entry.id}>
                  {formatDate(entry.timestamp)} · {entry.actor} · {entry.action}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <div className="publish-result error"><strong>{error}</strong></div>}
      <div className="approval-meta">
        <span><CalendarBlank size={14} />Persistence: {queue.persistenceMode || "local"}</span>
      </div>
    </section>
  );
}

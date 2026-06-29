import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "@phosphor-icons/react";
import {
  DEFAULT_AGENTS,
  EVENT_STATUSES,
  PLATFORM_IDS,
  PLATFORMS,
  RECURRING_FREQUENCIES,
  STATUS_LABELS,
} from "../../calendar/constants.js";
import { formatDateTimeLocal, parseDateTimeLocal } from "../../calendar/dateUtils.js";
import { suggestBestTimes } from "../../calendar/ai.js";

export function EventEditor({
  event,
  campaigns,
  allEvents,
  onSave,
  onDelete,
  onClose,
  saving,
}) {
  const [draft, setDraft] = useState(event);

  useEffect(() => {
    setDraft(event);
  }, [event]);

  if (!draft) return null;

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const bestTimes = suggestBestTimes(draft.platform, allEvents, new Date(draft.scheduledAt));

  const handleCampaignChange = (campaignId) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    update("campaignId", campaignId);
    update("campaignName", campaign?.name || "");
  };

  return (
    <AnimatePresence>
      <motion.div
        className="mc-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="mc-modal"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mc-event-editor-title"
        >
          <div className="mc-modal-header">
            <div>
              <div className="section-kicker">Schedule post</div>
              <h2 id="mc-event-editor-title">{draft._isNew ? "New post" : "Edit post"}</h2>
            </div>
            <button type="button" className="mc-icon-button" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="mc-form-grid">
            <label className="mc-field wide">
              <span>Title</span>
              <input
                value={draft.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Post title"
              />
            </label>

            <label className="mc-field">
              <span>Platform</span>
              <select value={draft.platform} onChange={(e) => update("platform", e.target.value)}>
                {PLATFORM_IDS.map((id) => (
                  <option key={id} value={id}>{PLATFORMS[id].name}</option>
                ))}
              </select>
            </label>

            <label className="mc-field">
              <span>Status</span>
              <select value={draft.status} onChange={(e) => update("status", e.target.value)}>
                {EVENT_STATUSES.map((status) => (
                  <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                ))}
              </select>
            </label>

            <label className="mc-field">
              <span>Campaign</span>
              <select value={draft.campaignId} onChange={(e) => handleCampaignChange(e.target.value)}>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                ))}
              </select>
            </label>

            <label className="mc-field">
              <span>Assigned agent</span>
              <select value={draft.agentId} onChange={(e) => update("agentId", e.target.value)}>
                {DEFAULT_AGENTS.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </label>

            <label className="mc-field wide">
              <span>Scheduled date & time</span>
              <input
                type="datetime-local"
                value={formatDateTimeLocal(draft.scheduledAt)}
                onChange={(e) => update("scheduledAt", parseDateTimeLocal(e.target.value))}
              />
            </label>

            {bestTimes.length > 0 && (
              <div className="mc-field wide mc-suggested-times">
                <span>Suggested posting times</span>
                <div className="mc-time-chips">
                  {bestTimes.map((slot) => (
                    <button
                      key={slot.hour}
                      type="button"
                      className="mc-time-chip"
                      onClick={() => {
                        const d = new Date(draft.scheduledAt);
                        d.setHours(slot.hour, 0, 0, 0);
                        update("scheduledAt", d.toISOString());
                      }}
                    >
                      {slot.label}
                      <small>{slot.score}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="mc-field wide">
              <span>Notes</span>
              <textarea
                rows={3}
                value={draft.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Internal notes for the team"
              />
            </label>

            <label className="mc-field wide">
              <span>Generated content preview</span>
              <textarea
                rows={4}
                value={draft.contentPreview}
                onChange={(e) => update("contentPreview", e.target.value)}
                placeholder="Draft copy or AI-generated preview"
              />
            </label>

            <fieldset className="mc-field wide mc-recurring">
              <legend>Recurring schedule</legend>
              <label className="mc-checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(draft.recurring?.enabled)}
                  onChange={(e) => update("recurring", e.target.checked
                    ? { enabled: true, frequency: "weekly", interval: 1, endDate: null }
                    : null)}
                />
                Repeat this post
              </label>
              {draft.recurring?.enabled && (
                <div className="mc-recurring-grid">
                  <label>
                    <span>Frequency</span>
                    <select
                      value={draft.recurring.frequency}
                      onChange={(e) => update("recurring", { ...draft.recurring, frequency: e.target.value })}
                    >
                      {RECURRING_FREQUENCIES.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Every</span>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={draft.recurring.interval}
                      onChange={(e) => update("recurring", { ...draft.recurring, interval: Number(e.target.value) || 1 })}
                    />
                  </label>
                  <label>
                    <span>End date</span>
                    <input
                      type="date"
                      value={draft.recurring.endDate || ""}
                      onChange={(e) => update("recurring", { ...draft.recurring, endDate: e.target.value || null })}
                    />
                  </label>
                </div>
              )}
            </fieldset>
          </div>

          <div className="mc-modal-actions">
            {!draft._isNew && (
              <button type="button" className="mc-danger-button" onClick={() => onDelete(draft.id)} disabled={saving}>
                Delete
              </button>
            )}
            <div className="mc-modal-actions-right">
              <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
              <button
                type="button"
                className="primary-button"
                disabled={saving || !draft.title.trim()}
                onClick={() => onSave(draft)}
              >
                {saving ? "Saving…" : "Save post"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

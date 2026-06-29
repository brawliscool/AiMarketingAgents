import React from "react";
import { motion } from "framer-motion";
import { CalendarBlank, Clock, Lightning, PaperPlaneTilt, Warning } from "@phosphor-icons/react";
import { PLATFORMS, STATUS_LABELS } from "../../calendar/constants.js";
import { formatShortDate, formatTime } from "../../calendar/dateUtils.js";

function Panel({ className, children }) {
  return (
    <motion.section className={className} layout whileHover={{ y: -2 }}>
      {children}
    </motion.section>
  );
}

export function CalendarSidebar({
  upcomingEvents,
  campaigns,
  postingWarnings,
  varietySuggestions,
  aiMessage,
  persistence,
}) {
  const campaignStats = campaigns.map((campaign) => ({
    ...campaign,
    count: upcomingEvents.filter((e) => e.campaignId === campaign.id).length,
  }));

  return (
    <aside className="mc-sidebar">
      <Panel className="panel mc-side-panel">
        <div className="panel-title">
          <h2><Clock size={16} /> Upcoming posts</h2>
          <span>{upcomingEvents.length}</span>
        </div>
        <div className="mc-upcoming-list">
          {upcomingEvents.length === 0 ? (
            <p className="mc-empty-copy">No upcoming posts. Use AI generate or add a new post.</p>
          ) : (
            upcomingEvents.map((event) => {
              const platform = PLATFORMS[event.platform];
              const PlatformIcon = platform?.icon;
              return (
                <article key={event.id} className="mc-upcoming-item" style={{ "--platform-color": platform?.color }}>
                  <span className="mc-upcoming-bar" />
                  <div>
                    <strong>{event.title}</strong>
                    <div className="mc-upcoming-meta">
                      {PlatformIcon && <PlatformIcon size={12} weight="fill" />}
                      <span>{formatShortDate(event.scheduledAt)}</span>
                      <span>{formatTime(event.scheduledAt)}</span>
                      <span className={`mc-status-pill status-${event.status}`}>{STATUS_LABELS[event.status]}</span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </Panel>

      <Panel className="panel mc-side-panel">
        <div className="panel-title">
          <h2><PaperPlaneTilt size={16} /> Scheduled campaigns</h2>
          <span>Active</span>
        </div>
        <div className="mc-campaign-list">
          {campaignStats.map((campaign) => (
            <div key={campaign.id} className="mc-campaign-item">
              <span className="mc-campaign-swatch" style={{ background: campaign.color }} />
              <div>
                <strong>{campaign.name}</strong>
                <span>{campaign.count} upcoming</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="panel mc-side-panel mc-ai-panel">
        <div className="panel-title">
          <h2><Lightning size={16} /> AI insights</h2>
          <span>{persistence === "supabase" ? "Cloud" : "Local"}</span>
        </div>

        {aiMessage && <p className="mc-ai-message">{aiMessage}</p>}

        {(postingWarnings.length > 0 || varietySuggestions.length > 0) ? (
          <ul className="mc-insight-list">
            {postingWarnings.map((warning, index) => (
              <li key={`warn-${index}`} className="mc-insight warning">
                <Warning size={14} />
                {warning.message}
              </li>
            ))}
            {varietySuggestions.map((suggestion, index) => (
              <li key={`variety-${index}`} className="mc-insight">
                <CalendarBlank size={14} />
                {suggestion.message}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mc-empty-copy">Posting load looks balanced for this period.</p>
        )}

        <div className="mc-platform-legend">
          <span className="mc-legend-title">Platforms</span>
          <div className="mc-legend-grid">
            {Object.values(PLATFORMS).map((platform) => {
              const Icon = platform.icon;
              return (
                <span key={platform.id} className="mc-legend-item" style={{ "--platform-color": platform.color }}>
                  <Icon size={14} weight="fill" />
                  {platform.name}
                </span>
              );
            })}
          </div>
        </div>
      </Panel>
    </aside>
  );
}

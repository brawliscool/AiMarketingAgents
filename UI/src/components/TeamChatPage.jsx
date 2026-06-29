import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowClockwise,
  At,
  DownloadSimple,
  FloppyDisk,
  PaperPlaneTilt,
  Sparkle,
  Trash,
} from "@phosphor-icons/react";
import { QUICK_ACTIONS, TEAM_AGENTS, findMentionedAgents } from "../teamChat/agents.js";
import {
  clearConversation,
  createConversation,
  loadMessages,
  loadTeamChat,
  saveMessage,
} from "../teamChat/storage.js";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8787";

const spring = { type: "spring", stiffness: 120, damping: 22, mass: 0.8 };

function nowIso() {
  return new Date().toISOString();
}

function formatTime(value) {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
  } catch {
    return "";
  }
}

function exportMarkdown(messages) {
  const lines = [
    "# HiveAI AI Team Chat",
    "",
    `Exported: ${new Date().toLocaleString()}`,
    "",
    ...messages.map((message) => {
      const speaker = message.sender === "user" ? "User" : `${message.agentName || "Agent"} (${message.role || "Agent"})`;
      return `## ${speaker} - ${new Date(message.createdAt).toLocaleString()}\n\n${message.message}`;
    }),
  ];
  const blob = new Blob([lines.join("\n\n")], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `hiveai-team-chat-${new Date().toISOString().slice(0, 10)}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function AgentAvatar({ agent }) {
  const Icon = agent.icon;
  return (
    <span className="team-agent-avatar" aria-hidden="true">
      <Icon size={18} weight="duotone" />
    </span>
  );
}

function TypingDots({ agents }) {
  if (!agents.length) return null;
  return (
    <motion.div className="team-typing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
      <div className="typing-stack">
        {agents.slice(0, 3).map((agent) => <AgentAvatar agent={agent} key={agent.id} />)}
      </div>
      <span>{agents.map((agent) => agent.name).join(", ")} typing</span>
      <i />
      <i />
      <i />
    </motion.div>
  );
}

function MentionAutocomplete({ query, onPick }) {
  const matches = TEAM_AGENTS.filter((agent) => agent.name.toLowerCase().includes(query.toLowerCase()) || agent.id.includes(query.toLowerCase())).slice(0, 5);
  if (!query && matches.length === 0) return null;
  return (
    <motion.div className="mention-menu" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
      {matches.map((agent) => (
        <button type="button" key={agent.id} onClick={() => onPick(agent)}>
          <AgentAvatar agent={agent} />
          <span>@{agent.name}</span>
          <small>{agent.role}</small>
        </button>
      ))}
    </motion.div>
  );
}

function MessageBubble({ message }) {
  const agent = TEAM_AGENTS.find((item) => item.id === message.agentId);
  const isUser = message.sender === "user";
  return (
    <motion.article
      className={isUser ? "team-message user" : "team-message agent"}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring}
      layout
    >
      {!isUser && agent && <AgentAvatar agent={agent} />}
      <div className="team-message-card">
        <div className="team-message-meta">
          <strong>{isUser ? "You" : message.agentName}</strong>
          {!isUser && <span>{message.role}</span>}
          <time>{formatTime(message.createdAt)}</time>
        </div>
        <p>{message.message}</p>
        {!isUser && message.suggestedActions?.length > 0 && (
          <div className="message-actions">
            {message.suggestedActions.slice(0, 3).map((action) => <span key={action}>{action}</span>)}
          </div>
        )}
      </div>
    </motion.article>
  );
}

export function TeamChatPage() {
  const [persistence, setPersistence] = useState("loading");
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState(() => TEAM_AGENTS.map((agent) => agent.id));
  const [composer, setComposer] = useState("");
  const [running, setRunning] = useState(false);
  const [typingAgents, setTypingAgents] = useState([]);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  const mentionMatch = composer.match(/@([\w-]*)$/);
  const mentionedAgents = useMemo(() => findMentionedAgents(composer), [composer]);

  useEffect(() => {
    let alive = true;
    async function boot() {
      const loaded = await loadTeamChat();
      if (!alive) return;
      setPersistence(loaded.persistence);
      const existing = loaded.conversations[0];
      const next = existing || (await createConversation({ title: "AI Team Chat", selectedAgents })).conversation;
      if (!alive) return;
      setConversation(next);
      const loadedMessages = await loadMessages(next.id, loaded.persistence);
      setMessages(loadedMessages);
    }
    boot();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typingAgents]);

  const visibleAgents = TEAM_AGENTS.filter((agent) => selectedAgents.includes(agent.id));

  const toggleAgent = (agentId) => {
    setSelectedAgents((current) => (
      current.includes(agentId) ? current.filter((id) => id !== agentId) : [...current, agentId]
    ));
  };

  const submitMessage = async (overrideText) => {
    const text = (overrideText || composer).trim();
    if (!text || running || !conversation) return;
    setError("");
    setComposer("");
    setRunning(true);

    const userMessage = {
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      sender: "user",
      message: text,
      createdAt: nowIso(),
    };
    setMessages((current) => [...current, userMessage]);
    await saveMessage(userMessage, persistence);

    const targeted = findMentionedAgents(text);
    const initialTyping = targeted.length ? targeted : visibleAgents.slice(0, text.toLowerCase().includes("team") ? 4 : 2);
    setTypingAgents(initialTyping);

    try {
      const response = await fetch(`${apiBaseUrl}/api/team-chat/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          selectedAgents,
          workspaceContext: {
            name: "HiveAI Workspace",
            persistence,
          },
          brandProfileContext: {
            voice: "Premium, practical, business-focused",
            assumptions: "Use explicit assumptions when brand data is missing.",
          },
          campaignContext: {
            activePage: "AI Team Chat",
          },
          chatHistory: messages.slice(-12).map((message) => ({
            sender: message.sender,
            agentId: message.agentId,
            message: message.message,
          })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Team chat request failed");
      const agentMessages = (data.responses || []).map((item) => ({
        id: crypto.randomUUID(),
        conversationId: conversation.id,
        sender: "agent",
        agentId: item.agentId,
        agentName: item.agentName,
        role: item.role,
        message: item.message,
        suggestedActions: item.suggestedActions || [],
        confidence: item.confidence ?? null,
        createdAt: nowIso(),
      }));
      for (const item of agentMessages) {
        await saveMessage(item, persistence);
      }
      setMessages((current) => [...current, ...agentMessages]);
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : "Team chat failed");
    } finally {
      setTypingAgents([]);
      setRunning(false);
    }
  };

  const clearChat = async () => {
    if (!conversation) return;
    await clearConversation(conversation.id, persistence);
    setMessages([]);
  };

  const pickMention = (agent) => {
    setComposer((current) => current.replace(/@[\w-]*$/, `@${agent.name} `));
  };

  return (
    <div className="team-chat-page">
      <motion.section className="panel team-chat-hero" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <span className="section-kicker"><Sparkle size={16} /> AI Team Chat</span>
          <h1>Talk to your marketing team in one workspace.</h1>
          <p>Message the whole team, @mention a specialist, or use quick actions to coordinate strategy, content, creative, scheduling, sales, and analytics.</p>
        </div>
        <div className="team-chat-status">
          <strong>{visibleAgents.length}</strong>
          <span>agents selected</span>
          <small>{persistence === "supabase" ? "Supabase persistence" : persistence === "loading" ? "Loading storage" : "localStorage fallback"}</small>
        </div>
      </motion.section>

      <div className="team-chat-layout">
        <motion.aside className="panel team-roster" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }}>
          <div className="panel-title">
            <h2>Agent roster</h2>
            <span>Specialists</span>
          </div>
          <div className="team-agent-list">
            {TEAM_AGENTS.map((agent) => (
              <button
                type="button"
                className={selectedAgents.includes(agent.id) ? "team-agent-card active" : "team-agent-card"}
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
              >
                <AgentAvatar agent={agent} />
                <span>
                  <strong>{agent.name}</strong>
                  <small>{agent.role}</small>
                </span>
                <em>{agent.status}</em>
              </button>
            ))}
          </div>
        </motion.aside>

        <motion.section className="panel team-thread-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <div className="team-thread-toolbar">
            <div>
              <h2>Team conversation</h2>
              <span>{mentionedAgents.length ? `Mentioning ${mentionedAgents.map((agent) => agent.name).join(", ")}` : "Whole team routing enabled"}</span>
            </div>
            <div className="team-thread-actions">
              <button type="button" onClick={clearChat}><Trash size={15} /> Clear</button>
              <button type="button" onClick={() => exportMarkdown(messages)}><DownloadSimple size={15} /> Export</button>
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("hiveai-toast", { detail: "Chat history is saved automatically." }))}><FloppyDisk size={15} /> Save</button>
            </div>
          </div>

          <div className="team-thread" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="team-empty">
                <Sparkle size={34} />
                <strong>Start with a goal or @mention a specialist.</strong>
                <span>Try “Build a campaign for a new offer” or “@Copywriter write three hooks.”</span>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((message) => <MessageBubble message={message} key={message.id} />)}
              </AnimatePresence>
            )}
            <AnimatePresence>
              <TypingDots agents={typingAgents} />
            </AnimatePresence>
          </div>

          {error && <div className="team-chat-error">{error}</div>}

          <div className="team-composer-wrap">
            <AnimatePresence>
              {mentionMatch && <MentionAutocomplete query={mentionMatch[1]} onPick={pickMention} />}
            </AnimatePresence>
            <div className="team-composer">
              <At size={20} />
              <textarea
                value={composer}
                onChange={(event) => setComposer(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submitMessage();
                  }
                }}
                placeholder="Message the team or type @Copywriter, @SEO Agent, @Calendar Agent..."
                rows={2}
              />
              <button type="button" onClick={() => submitMessage()} disabled={running || !composer.trim()}>
                {running ? <ArrowClockwise size={18} className="spin" /> : <PaperPlaneTilt size={18} weight="fill" />}
                Send
              </button>
            </div>
          </div>
        </motion.section>

        <motion.aside className="panel team-actions-panel" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}>
          <div className="panel-title">
            <h2>Suggested actions</h2>
            <span>Fast starts</span>
          </div>
          <div className="quick-action-list">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button type="button" key={action.label} onClick={() => submitMessage(action.prompt)}>
                  <Icon size={18} />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
          <div className="team-guidance">
            <strong>Routing rules</strong>
            <span>@mentions go to one specialist.</span>
            <span>Strategy routes to Marketing Director.</span>
            <span>Performance requests require supplied metrics.</span>
            <span>Assumptions are marked when context is missing.</span>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

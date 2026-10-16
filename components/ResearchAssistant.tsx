"use client";

import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Cpu,
  LoaderCircle,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { navigation } from "@/components/navigation";
import {
  type EvidenceCard,
  buildResearchReply,
  knowledgeStats,
  needsPrivateData,
  retrieveEvidence,
} from "@/lib/assistant-knowledge";
import {
  checkLocalAI,
  interruptLocalAI,
  loadLocalAI,
  streamLocalReply,
  unloadLocalAI,
} from "@/lib/assistant-engine";

type Props = {
  open: boolean;
  onClose: () => void;
  section: string;
  onNavigate: (section: string) => void;
  returnFocusRef?: { current: HTMLElement | null };
};
type Mode = "research" | "ai";
type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  evidence: EvidenceCard[];
  mode: Mode;
  status: "pending" | "complete" | "stopped";
  note?: string;
};
type Capability = Awaited<ReturnType<typeof checkLocalAI>>;

const contextualPrompts: Record<string, string> = {
  overview: "What are the three highest-confidence opportunities?",
  methodology:
    "Explain SEOasis’s methodology and how I would apply it to clients.",
  technical: "Which technical findings should I validate first, and why?",
  keywords: "Which search intents are commercially relevant to SEOasis?",
  collections: "How should I prioritize a Shopify client’s collection pages?",
  onpage: "Which on-page improvements are supported by the evidence?",
  architecture: "Where could internal links strengthen the commercial journey?",
  schema: "Which schema types were observed, and what needs validation?",
  aeo: "What can we assess about AI visibility without inventing metrics?",
  content: "How should content support the client’s commercial pages?",
  authority: "What authority-building work would you prioritize?",
  community: "How does SEOasis approach Reddit and community visibility?",
  shopping: "What would I check in a client’s Google Merchant Center?",
  cro: "How would revenue data change SEO prioritization?",
  competitors: "How does SEOasis’s positioning compare with competitors?",
  roadmap: "Summarize the first 90 days and the dependencies.",
  measurement: "What should I report weekly, monthly, and every 90 days?",
  backlog: "Which backlog opportunities should I prioritize first?",
  sources: "How do I distinguish observed findings from assumptions?",
  interview: "Help me explain this workspace to Mike in one minute.",
};

function InlineText({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : /^\[\d+\]$/.test(part) ? (
      <span className="assistant-inline-ref" key={i}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function AnswerBody({ content }: { content: string }) {
  return (
    <div className="assistant-answer-body">
      {content.split(/\n\s*\n/).map((block, i) => {
        const lines = block.trim().split("\n");
        if (!block.trim()) return null;
        if (lines.every((line) => /^\s*[-•*]\s/.test(line))) {
          return (
            <ul key={i}>
              {lines.map((line, index) => (
                <li key={index}>
                  <InlineText text={line.replace(/^\s*[-•*]\s+/, "")} />
                </li>
              ))}
            </ul>
          );
        }
        if (lines.every((line) => /^\s*\d+[.)]\s/.test(line))) {
          return (
            <ol key={i}>
              {lines.map((line, index) => (
                <li key={index}>
                  <InlineText text={line.replace(/^\s*\d+[.)]\s+/, "")} />
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i}>
            {lines.map((line, index) => (
              <span key={index}>
                {index > 0 && <br />}
                {/^#{1,4}\s/.test(line) ? (
                  <strong>{line.replace(/^#{1,4}\s+/, "")}</strong>
                ) : (
                  <InlineText text={line} />
                )}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function EvidenceCards({
  cards,
  onNavigate,
}: {
  cards: EvidenceCard[];
  onNavigate: (section: string) => void;
}) {
  if (!cards.length) return null;
  return (
    <details className="assistant-evidence">
      <summary>
        <span>
          <BookOpen size={14} /> Evidence used
          <span className="assistant-evidence-count">{cards.length}</span>
        </span>
        <ChevronDown size={14} className="assistant-details-chevron" />
      </summary>
      <div className="assistant-evidence-list">
        {cards.map((card, index) => {
          const target = navigation.find((item) => item.id === card.section);
          const type = card.classification.includes("REQUIRES")
            ? "requires"
            : card.classification.toLowerCase();
          return (
            <article className="assistant-evidence-card" key={card.id}>
              <div className="assistant-evidence-title">
                <span className="assistant-evidence-number">{index + 1}</span>
                <h4>{card.title}</h4>
              </div>
              <div className="assistant-evidence-meta">
                <span className={`assistant-classification ${type}`}>
                  {card.classification}
                </span>
                <span>{card.confidence} confidence</span>
              </div>
              <p className="assistant-evidence-excerpt">
                {card.content.length > 650
                  ? `${card.content.slice(0, 650).trimEnd()}…`
                  : card.content}
              </p>
              {target && (
                <button
                  type="button"
                  className="assistant-section-link"
                  onClick={() => onNavigate(card.section)}
                >
                  Open {target.short} <ArrowRight size={12} />
                </button>
              )}
              {card.sources.length > 0 && (
                <div className="assistant-source-list">
                  {card.sources.map((source) => (
                    <a
                      href={source.url}
                      key={source.id}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={source.note}
                    >
                      <span>
                        <strong>{source.title}</strong>
                        <small>Accessed {source.accessedAt}</small>
                      </span>
                      <ArrowUpRight size={13} />
                    </a>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </details>
  );
}

export default function ResearchAssistant({
  open,
  onClose,
  section,
  onNavigate,
  returnFocusRef,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [capability, setCapability] = useState<Capability | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState({ progress: 0, text: "" });
  const [modelError, setModelError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const sequence = useRef(0);
  const run = useRef(0);
  const loadRun = useRef(0);
  const followThread = useRef(true);
  const busyRef = useRef(false);
  const mounted = useRef(true);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const sectionLabel =
    navigation.find((item) => item.id === section)?.short || "Overview";

  const stopResponse = useCallback(() => {
    if (!busyRef.current) return;
    run.current += 1;
    interruptLocalAI();
    busyRef.current = false;
    setBusy(false);
    setMessages((current) =>
      current.map((message) =>
        message.status === "pending"
          ? {
              ...message,
              status: "stopped",
              content:
                message.content ||
                "Response stopped. You can ask again when ready.",
            }
          : message,
      ),
    );
    setAnnouncement("Response stopped.");
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      run.current += 1;
      interruptLocalAI();
    };
  }, []);

  useEffect(() => {
    if (!open) {
      stopResponse();
      return;
    }
    const previousFocus =
      returnFocusRef?.current || (document.activeElement as HTMLElement | null);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 40);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), summary, [tabindex="0"]',
        ) || [],
      ).filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first) {
        event.preventDefault();
        dialogRef.current?.focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialogRef.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialogRef.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      window.requestAnimationFrame(() => {
        if (previousFocus?.isConnected) previousFocus.focus();
      });
    };
  }, [open, stopResponse, returnFocusRef]);

  useEffect(() => {
    if (!open || capability) return;
    let active = true;
    checkLocalAI()
      .then((result) => {
        if (active) setCapability(result);
      })
      .catch(() => {
        if (active)
          setCapability({
            supported: false,
            reason:
              "Local AI is unavailable in this browser. Source-based research still works.",
            model: "Local model",
            downloadLabel: "About 500 MB",
          });
      });
    return () => {
      active = false;
    };
  }, [open, capability]);

  useEffect(() => {
    if (open && threadRef.current) {
      if (messages.length === 0) {
        threadRef.current.scrollTop = 0;
      } else if (followThread.current) {
        threadRef.current.scrollTop = threadRef.current.scrollHeight;
      }
    }
  }, [open, messages, busy]);

  async function enableAI() {
    if (modelLoading || !capability?.supported) return;
    if (modelReady) {
      setAiEnabled(true);
      setAnnouncement("Switched to local AI.");
      return;
    }
    const currentLoad = ++loadRun.current;
    setModelLoading(true);
    setModelError("");
    setLoadProgress({ progress: 0, text: "Preparing the local model…" });
    setAnnouncement(
      "Downloading the local AI model. You can continue using source-based research.",
    );
    try {
      await loadLocalAI((progress) => {
        if (mounted.current && loadRun.current === currentLoad)
          setLoadProgress(progress);
      });
      if (!mounted.current || loadRun.current !== currentLoad) return;
      setModelReady(true);
      setAiEnabled(true);
      setAnnouncement("Local AI is ready. Replies will run on this device.");
    } catch {
      if (!mounted.current || loadRun.current !== currentLoad) return;
      setModelError(
        "The local model could not load. You can retry, or continue with source-based research.",
      );
      setAnnouncement(
        "Local AI could not load. Source-based research remains available.",
      );
    } finally {
      if (mounted.current && loadRun.current === currentLoad)
        setModelLoading(false);
    }
  }

  function useResearch() {
    stopResponse();
    setAiEnabled(false);
    setAnnouncement("Switched to source-based research.");
  }

  async function releaseModel() {
    loadRun.current += 1;
    stopResponse();
    setAiEnabled(false);
    setModelReady(false);
    setModelLoading(false);
    setModelError("");
    await unloadLocalAI().catch(() => undefined);
    setAnnouncement(
      "Local model released. Source-based research remains available.",
    );
  }

  async function ask(question: string) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || busyRef.current) return;
    const currentRun = ++run.current;
    busyRef.current = true;
    followThread.current = true;
    setBusy(true);
    setDraft("");
    const previousQuestion = [...messages]
      .reverse()
      .find((message) => message.role === "user")?.content;
    const evidence = retrieveEvidence(cleanQuestion, section, previousQuestion);
    const mode: Mode =
      aiEnabled && evidence.length > 0 && !needsPrivateData(cleanQuestion)
        ? "ai"
        : "research";
    const assistantId = ++sequence.current;
    const userMessage: Message = {
      id: ++sequence.current,
      role: "user",
      content: cleanQuestion,
      evidence: [],
      mode: "research",
      status: "complete",
    };
    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        evidence,
        mode,
        status: "pending",
      },
    ]);
    setAnnouncement(
      mode === "ai"
        ? "Local AI is preparing a grounded reply."
        : "Looking up workspace evidence.",
    );
    const update = (patch: Partial<Message>) => {
      if (run.current !== currentRun || !mounted.current) return;
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId ? { ...message, ...patch } : message,
        ),
      );
    };
    try {
      const content =
        mode === "ai"
          ? await streamLocalReply({
              question: cleanQuestion,
              evidence,
              history: messages
                .filter((message) => message.status === "complete")
                .slice(-8)
                .map(({ role, content }) => ({ role, content })),
              onToken: (text) => update({ content: text }),
            })
          : buildResearchReply(cleanQuestion, evidence);
      update({ content, status: "complete" });
      if (run.current === currentRun)
        setAnnouncement(
          "Reply ready. Supporting evidence is available below the response.",
        );
    } catch {
      update({
        content: buildResearchReply(cleanQuestion, evidence),
        mode: "research",
        status: "complete",
        note: "Local AI was interrupted by a device or model error. A source-based summary is shown instead.",
      });
      if (run.current === currentRun) {
        setAiEnabled(false);
        setModelReady(false);
        setModelError(
          "Local AI paused after a model error. Enable it again to retry.",
        );
        setAnnouncement(
          "Local AI is unavailable. A source-based reply is ready.",
        );
      }
    } finally {
      if (run.current === currentRun && mounted.current) {
        busyRef.current = false;
        setBusy(false);
        inputRef.current?.focus();
      }
    }
  }

  function navigateToEvidence(target: string) {
    onNavigate(target);
    onClose();
  }

  if (!open) return null;
  const percent = Math.max(
    0,
    Math.min(100, Math.round(loadProgress.progress * 100)),
  );

  return (
    <div className="assistant-overlay">
      <div
        className="assistant-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        id="workspace-assistant"
        ref={dialogRef}
        className="assistant-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-title"
        aria-describedby="assistant-description"
        tabIndex={-1}
      >
        <header className="assistant-header">
          <span className="assistant-mark">
            <Sparkles size={20} strokeWidth={1.7} />
          </span>
          <div>
            <p className="assistant-eyebrow">SEOASIS / CLIENT WORKSPACE</p>
            <h2 id="assistant-title">Workspace assistant</h2>
          </div>
          <button
            type="button"
            className="assistant-icon-button"
            onClick={onClose}
            aria-label="Close workspace assistant"
            title="Close (Escape)"
          >
            <X size={20} />
          </button>
        </header>

        <div className="assistant-mode-bar">
          <span className={`assistant-mode ${aiEnabled ? "is-ai" : ""}`}>
            <span />{" "}
            {aiEnabled
              ? "Local AI · verify sources"
              : "Research · source-based"}
          </span>
          {messages.length > 0 && (
            <button
              type="button"
              className="assistant-clear"
              onClick={() => {
                stopResponse();
                setMessages([]);
                setAnnouncement("Conversation cleared.");
                inputRef.current?.focus();
              }}
            >
              <RotateCcw size={12} /> Clear
            </button>
          )}
        </div>

        <div className="assistant-model-panel">
          <div className="assistant-model-heading">
            <span className="assistant-model-icon">
              <Cpu size={17} />
            </span>
            <div>
              <strong>
                {aiEnabled
                  ? "AI is running on this device"
                  : modelReady
                    ? "AI model ready on this device"
                    : "Free AI, on your own device"}
              </strong>
              <p>
                {aiEnabled
                  ? "No API key. No per-message charges."
                  : modelReady
                    ? "Ready when you want a generated reply."
                    : "~500 MB first download · WebGPU required"}
              </p>
            </div>
            {aiEnabled ? (
              <button
                type="button"
                className="assistant-ai-button is-ready"
                onClick={useResearch}
                title="Switch to source-based research; keep the model ready"
              >
                <Check size={12} /> Use research
              </button>
            ) : (
              <button
                type="button"
                className="assistant-ai-button"
                disabled={!capability?.supported || modelLoading}
                onClick={enableAI}
              >
                {modelLoading ? (
                  <>
                    <LoaderCircle size={12} className="assistant-spin" />{" "}
                    {percent}%
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />{" "}
                    {modelReady ? "Use local AI" : "Enable free AI"}
                  </>
                )}
              </button>
            )}
          </div>
          {modelLoading ? (
            <div className="assistant-download">
              <div
                className="assistant-progress"
                role="progressbar"
                aria-label="Local model download"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <span style={{ width: `${percent}%` }} />
              </div>
              <p>{loadProgress.text || "Downloading model files…"}</p>
              <small>
                Research chat remains available while the model loads.
              </small>
              <button
                type="button"
                className="assistant-release-model"
                onClick={releaseModel}
              >
                Cancel download
              </button>
            </div>
          ) : (
            <details className="assistant-model-info">
              <summary>
                <CircleHelp size={12} />{" "}
                {capability && !capability.supported
                  ? "About this browser"
                  : "How free AI works"}
                <ChevronDown size={11} />
              </summary>
              <p>
                {capability && !capability.supported
                  ? `${capability.reason || "This browser does not support local AI."} `
                  : ""}
                {capability?.downloadLabel || "About 500 MB on first use"}.
                First setup can take a few minutes. Local AI needs a compatible
                WebGPU browser and enough device memory. Replies run in your
                browser; questions and workspace research are not sent to an AI
                API. Public hosts serve the model files, which your browser may
                cache. This is retrieval over the workspace research, not a
                model trained on private client accounts.
              </p>
              {modelReady && (
                <button
                  type="button"
                  className="assistant-release-model"
                  onClick={releaseModel}
                >
                  Release model from device memory
                </button>
              )}
            </details>
          )}
          {modelError && (
            <p className="assistant-model-error" role="status">
              {modelError}
            </p>
          )}
          {capability && !capability.supported && !modelError && (
            <p className="assistant-browser-note">
              Local AI is unavailable in this browser. Source-based research
              works here.
            </p>
          )}
        </div>

        <div
          className="assistant-thread"
          ref={threadRef}
          onScroll={() => {
            const thread = threadRef.current;
            if (thread)
              followThread.current =
                thread.scrollHeight - thread.scrollTop - thread.clientHeight <
                80;
          }}
        >
          {messages.length === 0 ? (
            <div className="assistant-welcome">
              <div className="assistant-welcome-icon">
                <BookOpen size={25} strokeWidth={1.5} />
                <span>
                  <Sparkles size={12} />
                </span>
              </div>
              <p className="assistant-eyebrow">FROM EVIDENCE TO ACTION</p>
              <h3>
                Ask the evidence.
                <br />
                Shape the next move.
              </h3>
              <p id="assistant-description">
                Discuss the research, compare opportunities, or prepare for a
                client conversation. Answers include the workspace evidence used
                for review.
              </p>
              <div className="assistant-knowledge-stat">
                <ShieldCheck size={13} />
                <span>
                  {knowledgeStats.records.toLocaleString()} research records ·{" "}
                  {knowledgeStats.sources.toLocaleString()} sources
                </span>
              </div>
              <div className="assistant-starters">
                <p>START WITH {sectionLabel.toUpperCase()}</p>
                <button
                  type="button"
                  onClick={() =>
                    ask(
                      contextualPrompts[section] || contextualPrompts.overview,
                    )
                  }
                >
                  <span>
                    {contextualPrompts[section] || contextualPrompts.overview}
                  </span>
                  <ArrowUpRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => ask("What should I prioritize first?")}
                >
                  <span>What should I prioritize first?</span>
                  <ArrowUpRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => ask("What requires client data?")}
                >
                  <span>What requires client data?</span>
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <p className="assistant-scope-note">
                SEOasis is the agency example. Shopify, revenue, and feed
                frameworks are for its client accounts. Live performance
                requires connected internal data.
              </p>
            </div>
          ) : (
            <div className="assistant-conversation" aria-label="Conversation">
              <p id="assistant-description" className="assistant-context-note">
                <BookOpen size={12} /> Grounded in workspace research ·{" "}
                {sectionLabel}
              </p>
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`assistant-message is-${message.role}`}
                  aria-label={
                    message.role === "user"
                      ? "Your question"
                      : "Assistant response"
                  }
                >
                  {message.role === "user" ? (
                    <p className="assistant-user-message">{message.content}</p>
                  ) : (
                    <>
                      <div className="assistant-answer-label">
                        <span>
                          <Sparkles size={13} />
                        </span>
                        <strong>
                          {message.mode === "ai"
                            ? "Local AI"
                            : "Workspace research"}
                        </strong>
                        <small>
                          {message.mode === "ai" ? "AI DRAFT" : "SOURCE-BASED"}
                        </small>
                      </div>
                      {message.content ? (
                        <AnswerBody content={message.content} />
                      ) : (
                        <div className="assistant-thinking">
                          <LoaderCircle size={14} className="assistant-spin" />
                          <span>
                            {message.mode === "ai"
                              ? "Connecting the evidence…"
                              : "Finding relevant evidence…"}
                          </span>
                        </div>
                      )}
                      {message.note && (
                        <p className="assistant-fallback-note">
                          {message.note}
                        </p>
                      )}
                      {message.status !== "pending" && (
                        <>
                          <EvidenceCards
                            cards={message.evidence}
                            onNavigate={navigateToEvidence}
                          />
                          <p className="assistant-answer-footnote">
                            {message.status === "stopped"
                              ? "Response stopped · "
                              : ""}
                            {message.mode === "ai"
                              ? "AI draft. Check the cited records before making a decision."
                              : "Source-based summary. Findings retain their original evidence classification."}
                          </p>
                        </>
                      )}
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="assistant-composer-area">
          {messages.length > 0 && !busy && (
            <div
              className="assistant-follow-ups"
              aria-label="Suggested follow-up questions"
            >
              <button
                type="button"
                onClick={() => ask("What requires client data?")}
              >
                What needs internal data?
              </button>
              <button
                type="button"
                onClick={() => ask("Explain SEOasis methodology")}
              >
                Explain the methodology
              </button>
            </div>
          )}
          <form
            className="assistant-composer"
            onSubmit={(event) => {
              event.preventDefault();
              ask(draft);
            }}
          >
            <label className="assistant-sr-only" htmlFor="assistant-question">
              Ask about workspace research
            </label>
            <textarea
              id="assistant-question"
              ref={inputRef}
              value={draft}
              rows={2}
              maxLength={2000}
              placeholder="Ask about the research or the next best action…"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  if (!busy) ask(draft);
                }
              }}
            />
            <div className="assistant-composer-bottom">
              <span>
                <MessageSquareText size={11} />{" "}
                {busy
                  ? "Preparing your reply"
                  : "Enter to send · Shift + Enter for a new line"}
              </span>
              {busy ? (
                <button
                  type="button"
                  className="assistant-send is-stop"
                  onClick={stopResponse}
                  aria-label="Stop response"
                >
                  <Square size={13} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="assistant-send"
                  disabled={!draft.trim()}
                  aria-label="Send question"
                >
                  <ArrowUp size={18} />
                </button>
              )}
            </div>
          </form>
          <p className="assistant-session-note">
            Session only · public research · no live account connection
          </p>
        </div>
        <p
          className="assistant-sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {announcement}
        </p>
      </div>
    </div>
  );
}

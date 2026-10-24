"use client";

import { chatbotTitle, faqData, initialGreeting } from "@/resources/faqChatbot";
import Image from "next/image";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { FaX } from "react-icons/fa6";
import { HiArrowRight, HiChevronDown, HiChevronUp } from "react-icons/hi2";
import styles from "./FaqChatbot.module.scss";

// ── Constants ────────────────────────────────────────────────────────────────

const SESSION_LIMIT = 8;
const MSG_MAX_CHARS = 300;
const LINKEDIN_URL = "https://www.linkedin.com/in/erick-mahecha/";
const EMAIL = "santiagomahecha2328@gmail.com";

// Deliberately NOT sessionStorage: sessionStorage survives an F5/reload
// within the same tab, so once the greeting had shown once, it silently
// never showed again for the rest of that browser session — read as the
// bubble "sometimes" not firing. FaqChatbot lives in the root layout, which
// Next.js's App Router never remounts on client-side navigation between
// routes, so a plain module-level flag already does the right thing on its
// own: it resets to `false` whenever this module is freshly evaluated —
// which only happens on a real document load (first visit or reload) — and
// stays `true` for the rest of that document's lifetime otherwise. Same
// fix as IntroLoader's session-persistence bug.
let greetingShownThisPageLoad = false;

// ── Types ─────────────────────────────────────────────────────────────────────

interface ActiveView {
  question: string;
  answer: string;
}

// ── Module-level sub-components (NEVER inside FaqChatbot body) ───────────────

interface SuggestedQuestionsProps {
  exclude?: string;
  collapsed: boolean;
  onToggle: () => void;
  onSelect: (question: string) => void;
  disabled: boolean;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  exclude,
  collapsed,
  onToggle,
  onSelect,
  disabled,
}) => {
  const questions = faqData.filter((faq) => faq.question !== exclude);

  return (
    <div className={styles.suggestedWrapper}>
      <button
        type="button"
        className={styles.suggestedToggle}
        onClick={onToggle}
        aria-expanded={!collapsed}
      >
        <span>Suggested questions</span>
        <span className={styles.iconXs}>{collapsed ? <HiChevronDown /> : <HiChevronUp />}</span>
      </button>

      {!collapsed && (
        <div className={styles.questionsList}>
          {questions.map((faq) => (
            <button
              key={faq.id}
              type="button"
              className={styles.questionButton}
              onClick={() => onSelect(faq.question)}
              disabled={disabled}
            >
              {faq.question}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface InputAreaProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  isLimited: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
  isLimited,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit();
  };

  return (
    <div className={styles.inputArea}>
      {isLimited ? (
        <span className={`${styles.textS} ${styles.weak} ${styles.limitNote}`}>
          You&apos;ve reached the message limit for this session.{" "}
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
            reach out directly!
          </a>
        </span>
      ) : (
        <div className={styles.inputRow}>
          <input
            className={styles.textInput}
            type="text"
            placeholder="Ask me anything about Erick..."
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, MSG_MAX_CHARS))}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            maxLength={MSG_MAX_CHARS}
            aria-label="Type your question"
          />
          <button
            type="button"
            className={styles.sendButton}
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
          >
            <span className={styles.iconS}>
              <HiArrowRight />
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

// ── Markdown parser (module-level pure function) ──────────────────────────────

/**
 * Allow only http(s), mailto and same-origin relative link targets.
 *
 * The href below is parsed out of the model's reply, and that reply is shaped by
 * visitor input — a crafted message can try to talk Gemini into emitting
 * `[text](javascript:...)`. React does not sanitise href, and the CSP carries
 * 'unsafe-inline' in script-src, which does not block javascript: URLs either.
 * Impact is confined to the sender's own session (replies are never stored or
 * shown to another visitor), so this is self-XSS rather than a way to reach
 * someone else — but the sink costs nothing to close.
 */
function safeHref(raw: string): string | null {
  const url = raw.trim();
  // Relative, but not protocol-relative (`//evil.example` would leave the origin).
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:" || protocol === "mailto:" ? url : null;
  } catch {
    return null;
  }
}

function parseAnswerText(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  return lines.map((line, lIdx) => {
    const lineParts: React.ReactNode[] = [];
    let idx = 0;
    const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    let match: RegExpExecArray | null;

    // biome-ignore lint/suspicious/noAssignInExpressions: idiomatic RegExp.exec loop; kept as-is because this parser was security-hardened and refactoring it is out of scope
    while ((match = regex.exec(line)) !== null) {
      const matchText = match[0];
      const matchIdx = match.index;
      if (matchIdx > idx) lineParts.push(line.substring(idx, matchIdx));

      if (matchText.startsWith("**") && matchText.endsWith("**")) {
        lineParts.push(<strong key={matchIdx}>{matchText.slice(2, -2)}</strong>);
      } else if (matchText.startsWith("[") && matchText.includes("](")) {
        const label = matchText.substring(1, matchText.indexOf("]("));
        const url = matchText.substring(matchText.indexOf("](") + 2, matchText.length - 1);
        const href = safeHref(url);
        lineParts.push(
          href ? (
            <a
              key={matchIdx}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {label}
            </a>
          ) : (
            // Unsupported scheme: keep the visible label, drop the link.
            <span key={matchIdx}>{label}</span>
          ),
        );
      }
      idx = regex.lastIndex;
    }

    if (idx < line.length) lineParts.push(line.substring(idx));

    return (
      <span
        key={lIdx}
        style={{ display: "block", minHeight: line.trim() === "" ? "8px" : "unset" }}
      >
        {lineParts}
      </span>
    );
  });
}

// ── Main component ────────────────────────────────────────────────────────────

export const FaqChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView | null>(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionsCollapsed, setSuggestionsCollapsed] = useState(true);
  const [showBubble, setShowBubble] = useState(false);
  const [msgCount, setMsgCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Number(sessionStorage.getItem("chatbot_msg_count") ?? "0");
    }
    return 0;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const isLimited = msgCount >= SESSION_LIMIT;

  // Auto scroll to top on view change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [activeView, isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Proactive greeting bubble logic
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (greetingShownThisPageLoad || isOpen) return;

    const delayTimer = setTimeout(() => {
      if (!isOpen && !greetingShownThisPageLoad) {
        setShowBubble(true);
        greetingShownThisPageLoad = true;
      }
    }, 2500);

    return () => clearTimeout(delayTimer);
  }, [isOpen]);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!showBubble) return;

    const dismissTimer = setTimeout(() => {
      setShowBubble(false);
    }, 8000);

    return () => clearTimeout(dismissTimer);
  }, [showBubble]);

  // Close bubble if chat opens
  useEffect(() => {
    if (isOpen) {
      setShowBubble(false);
      greetingShownThisPageLoad = true;
    }
  }, [isOpen]);

  // ── API call ────────────────────────────────────────────────────────────────

  const askGemini = async (question: string) => {
    if (isLimited || isLoading || !question.trim()) return;

    // Collapse suggestions when a question is asked
    setSuggestionsCollapsed(true);
    setIsLoading(true);
    setActiveView({ question, answer: "" });

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });

      if (res.status === 429) {
        setActiveView({
          question,
          answer: `You've reached the message limit for this session. Feel free to reach out directly!\n\n• [Email](mailto:${EMAIL})\n• [LinkedIn](${LINKEDIN_URL})`,
        });
        setMsgCount(SESSION_LIMIT);
        sessionStorage.setItem("chatbot_msg_count", String(SESSION_LIMIT));
        return;
      }

      const data = await res.json();

      if (data.error || !data.reply) {
        setActiveView({
          question,
          answer: `Something went wrong on my end. You can reach Erick directly at:\n\n• [Email](mailto:${EMAIL})\n• [LinkedIn](${LINKEDIN_URL})`,
        });
        return;
      }

      const newCount = msgCount + 1;
      setMsgCount(newCount);
      sessionStorage.setItem("chatbot_msg_count", String(newCount));
      setActiveView({ question, answer: data.reply });
    } catch {
      setActiveView({
        question,
        answer: `Something went wrong on my end. You can reach Erick directly at:\n\n• [Email](mailto:${EMAIL})\n• [LinkedIn](${LINKEDIN_URL})`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitInput = () => {
    const q = inputText.trim();
    if (!q) return;
    setInputText("");
    askGemini(q);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div ref={wrapperRef} className={styles.chatbotWrapper}>
      {/* Chatbot Panel */}
      {isOpen && (
        <div ref={containerRef} className={styles.chatbotContainer}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.brand}>
              <Image
                src="/images/chatbot/chatbot-icon.webp"
                alt="ErickBot"
                width={32}
                height={32}
                className={styles.headerIcon}
              />
              <div className={styles.brandText}>
                <h4 className={styles.title}>{chatbotTitle}</h4>
                <span className={`${styles.textXs} ${styles.weak}`}>Powered by AI</span>
              </div>
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close Chatbot"
            >
              <span className={styles.iconS}>
                <FaX />
              </span>
            </button>
          </div>

          {/* Content Area */}
          <div ref={messagesContainerRef} className={styles.messagesContainer}>
            {activeView === null ? (
              /* ── Home screen ── */
              <div className={styles.thread}>
                <div className={styles.lineStart}>
                  <div className={`${styles.bubble} ${styles.botBubble}`}>
                    <span className={`${styles.textM} ${styles.strong}`}>{initialGreeting}</span>
                  </div>
                </div>

                <SuggestedQuestions
                  collapsed={suggestionsCollapsed}
                  onToggle={() => setSuggestionsCollapsed((c) => !c)}
                  onSelect={(q) => askGemini(q)}
                  disabled={isLimited || isLoading}
                />
              </div>
            ) : (
              /* ── Active Q&A screen ── */
              <div className={styles.thread}>
                {/* User question */}
                <div className={styles.lineEnd}>
                  <div className={`${styles.bubble} ${styles.userBubble}`}>
                    {/* Blanco Titanio on the solid Cobalto fill, not the
                        Cobalto used for brand text on the page background. */}
                    <span className={`${styles.textM} ${styles.onSolid}`}>
                      {activeView.question}
                    </span>
                  </div>
                </div>

                {/* Bot answer / loading */}
                <div className={styles.lineStart}>
                  <div className={`${styles.bubble} ${styles.botBubble}`}>
                    {isLoading ? (
                      <span className={`${styles.textM} ${styles.weak} ${styles.typing}`}>
                        ErickBot is typing…
                      </span>
                    ) : (
                      <span className={`${styles.textM} ${styles.strong}`}>
                        {parseAnswerText(activeView.answer)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Suggested questions (collapsed by default after answering) */}
                {!isLoading && (
                  <SuggestedQuestions
                    exclude={activeView.question}
                    collapsed={suggestionsCollapsed}
                    onToggle={() => setSuggestionsCollapsed((c) => !c)}
                    onSelect={(q) => askGemini(q)}
                    disabled={isLimited || isLoading}
                  />
                )}
              </div>
            )}
          </div>

          {/* Input area — always visible at bottom */}
          <InputArea
            value={inputText}
            onChange={setInputText}
            onSubmit={handleSubmitInput}
            disabled={isLoading}
            isLimited={isLimited}
          />
        </div>
      )}

      {/* Proactive Greeting Bubble */}
      {showBubble && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: pointer shortcut only; the same action (open chat) is reachable via the keyboard-accessible "Toggle ErickBot" button, and the close control inside is a real button
        <div
          className={styles.greetingBubble}
          onClick={() => {
            setIsOpen(true);
            setShowBubble(false);
          }}
        >
          <div className={styles.greetingContent}>
            <span className={`${styles.textS} ${styles.strong}`}>
              👋 Curious about my work? Ask ErickBot!
            </span>
          </div>
          <button
            type="button"
            className={styles.bubbleCloseButton}
            onClick={(e) => {
              e.stopPropagation();
              setShowBubble(false);
            }}
            aria-label="Close greeting"
          >
            <span className={styles.iconXs}>
              <FaX />
            </span>
          </button>
          <div className={styles.bubbleTip} />
        </div>
      )}

      {/* Floating Toggle Button */}
      <div ref={triggerRef} className={styles.floatingButton}>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle ErickBot"
        >
          {isOpen ? (
            <span className={styles.iconM}>
              <FaX />
            </span>
          ) : (
            <Image
              src="/images/chatbot/chatbot-icon.webp"
              alt="ErickBot"
              width={64}
              height={64}
              className={styles.avatarIcon}
            />
          )}
        </button>
      </div>
    </div>
  );
};

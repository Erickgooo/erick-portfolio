"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./DecodeText.module.scss";
import { scrambleFrame } from "./decode";
import { whenIntroDone } from "./intro";

interface DecodeTextProps {
  value: string;
  /** "view": once, when 60% visible (after the intro). "manual": every time `active` turns true. */
  trigger?: "view" | "manual";
  active?: boolean;
  duration?: number;
  className?: string;
}

/**
 * Mono metric that "decodes" into place. The real value stays in the DOM and is
 * what assistive tech reads; the scramble runs in an aria-hidden overlay written
 * directly to the DOM (no React re-render per frame). No aria-live. The overlay is
 * always emptied at the end, so the visible result is the exact source string.
 */
export function DecodeText({
  value,
  trigger = "view",
  active = false,
  duration = 600,
  className,
}: DecodeTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const fxRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  const [running, setRunning] = useState(false);

  const run = useCallback(() => {
    const fx = fxRef.current;
    if (!fx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(frameRef.current);
    const start = performance.now();
    setRunning(true);
    const tick = (now: number) => {
      const p = (now - start) / duration;
      if (p >= 1) {
        fx.textContent = "";
        setRunning(false);
        return;
      }
      fx.textContent = scrambleFrame(value, p, Math.random);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [value, duration]);

  useEffect(() => {
    if (trigger !== "view") return;
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          whenIntroDone().then(run);
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [trigger, run]);

  useEffect(() => {
    if (trigger === "manual" && active) run();
  }, [trigger, active, run]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  return (
    <span
      ref={rootRef}
      className={`${styles.root} ${className ?? ""}`}
      data-running={running ? "" : undefined}
    >
      <span className={styles.value}>{value}</span>
      <span ref={fxRef} className={styles.fx} aria-hidden="true" />
    </span>
  );
}

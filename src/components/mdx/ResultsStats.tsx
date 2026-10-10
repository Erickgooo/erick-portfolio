"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ResultsStats.module.scss";

interface Stat {
  value: string;
  label: string;
}

interface ResultsStatsProps {
  /**
   * Pass stats as a pipe-separated string: "110K|views|2411|likes|98|comments"
   * Each pair is value|label
   */
  data: string;
  title?: string;
}

// Parse a pipe-separated string: "110K|views|2411|likes|98|comments"
function parseStats(data: string): Stat[] {
  const parts = data.split("|").map((s) => s.trim());
  const result: Stat[] = [];
  for (let i = 0; i + 1 < parts.length; i += 2) {
    result.push({ value: parts[i], label: parts[i + 1] });
  }
  return result;
}

// Parse a display value like "110K", "2.3M", "338K+", "2,411", "390.6K", and support leading symbol like "$"
function parseValue(raw: string): { numericPart: number; suffix: string; prefix: string } {
  const str = raw.trim();
  const hasDollar = str.startsWith("$");
  const cleanStr = hasDollar ? str.slice(1) : str;
  const match = cleanStr.match(/^([\d,\.]+)([KkMmBb+%]*)(.*)$/);
  if (!match) return { numericPart: 0, suffix: str, prefix: "" };
  const rawNum = match[1].replace(/,/g, "");
  const numericPart = Number.parseFloat(rawNum) || 0;
  const suffix = (match[2] + match[3]).trim();
  return { numericPart, suffix, prefix: hasDollar ? "$" : "" };
}

function formatNumber(n: number): string {
  const floored = Math.floor(Math.abs(n));
  return floored.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatFinal(numericPart: number): string {
  if (numericPart % 1 !== 0) {
    const fixed = numericPart.toFixed(2); // Keep 2 decimal places for currencies/ratios if fractional
    const [int, dec] = fixed.split(".");
    const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formatted}.${dec}`;
  }
  return formatNumber(numericPart);
}

function AnimatedStat({ stat }: { stat: Stat }) {
  const { numericPart, suffix, prefix } = parseValue(stat.value);
  const [displayed, setDisplayed] = useState(0);
  const [done, setDone] = useState(false);
  const rafRef = useRef<number | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !startedRef.current) {
          startedRef.current = true;
          observer.disconnect();

          const duration = 1300;
          const start = performance.now();

          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - (1 - progress) ** 3;
            setDisplayed(eased * numericPart);
            if (progress < 1) {
              rafRef.current = requestAnimationFrame(tick);
            } else {
              setDisplayed(numericPart);
              setDone(true);
              rafRef.current = null;
            }
          }

          rafRef.current = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const displayStr = done ? formatFinal(numericPart) : formatNumber(displayed);

  return (
    <div className={styles.statInner}>
      <div className={styles.value}>
        <span ref={spanRef} suppressHydrationWarning>
          {prefix}
          {displayStr}
          {done ? suffix : ""}
        </span>
      </div>
      <div className={styles.label}>{stat.label}</div>
    </div>
  );
}

export function ResultsStats({ data, title }: ResultsStatsProps) {
  const stats = parseStats(data);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Both start false: until the track has been measured, and wherever the
  // stats fit, there is nowhere to scroll to and no arrow is shown.
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    function checkScroll() {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 2);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    }

    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, []);

  function scrollByDir(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 220 : -220, behavior: "smooth" });
  }

  return (
    <div className={styles.root}>
      {title && <p className={styles.title}>{title}</p>}
      <div className={styles.carouselWrapper}>
        {/* An arrow that leads nowhere is not shown at all, rather than shown faded. */}
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={() => scrollByDir("left")}
          aria-label="Scroll left"
          hidden={!canScrollLeft}
        >
          ‹
        </button>
        <div className={styles.track} ref={scrollRef}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.stat}>
              {i > 0 && <div className={styles.divider} />}
              <AnimatedStat stat={stat} />
            </div>
          ))}
        </div>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={() => scrollByDir("right")}
          aria-label="Scroll right"
          hidden={!canScrollRight}
        >
          ›
        </button>
      </div>
    </div>
  );
}

"use client";

import { scrollBehavior } from "@/utils/scrollBehavior";
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
    // The row glides to its next stats, unless the visitor asked for less motion.
    el.scrollBy({ left: dir === "right" ? 220 : -220, behavior: scrollBehavior() });
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
              {/* The figure as the project wrote it, there from the server: nothing counts up to it. */}
              <div className={styles.statInner}>
                <div className={styles.value}>{stat.value}</div>
                <div className={styles.label}>{stat.label}</div>
              </div>
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

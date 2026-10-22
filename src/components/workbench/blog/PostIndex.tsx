"use client";

// Workbench, post: the "On this page" index in the margin (desktop). The
// headings come from the MDX source, so nothing is scanned from the page.
//
// The rule from the previous index (src/components/blog/OnThisPage.tsx): a
// section is current once its heading crosses a line 150 px below the top,
// and once the page is scrolled to the bottom the last section is current,
// because a short last section can never reach that line.
import { type CSSProperties, useEffect, useState } from "react";
import type { OutlineItem } from "../prose/source";
import styles from "./blog.module.scss";

const ACTIVE_OFFSET = 150;
const BOTTOM_EPSILON = 2;

export function PostIndex({ items }: { items: OutlineItem[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    let anchors: number[] = [];

    const measure = () => {
      anchors = items.map((item) => {
        const el = document.getElementById(item.id);
        return el ? el.getBoundingClientRect().top + window.scrollY : Number.POSITIVE_INFINITY;
      });
    };

    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max - y <= BOTTOM_EPSILON) {
        setActive(items.length - 1);
        return;
      }
      let current = 0;
      anchors.forEach((top, i) => {
        if (top - ACTIVE_OFFSET <= y) current = i;
      });
      setActive(current);
    };

    const remeasure = () => {
      measure();
      update();
    };

    remeasure();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", remeasure);
    // Images, embeds and webfonts land after mount and move every heading.
    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", remeasure);
      ro.disconnect();
    };
  }, [items]);

  return (
    <nav className={styles.index} aria-label="On this page">
      <p className={styles.indexHead}>On this page</p>
      <ol className={styles.indexList} style={{ "--at": active } as CSSProperties}>
        {items.map((item, i) => (
          <li key={item.id} className={item.level === 3 ? styles.indexSub : undefined}>
            <a
              href={`#${item.id}`}
              className={styles.indexLink}
              aria-current={i === active ? "location" : undefined}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

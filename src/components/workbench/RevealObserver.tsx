"use client";

// Workbench: one IntersectionObserver for every scroll reveal on the page.
// Elements carry [data-reveal]; when they enter the viewport they get [data-in]
// and play on their own time (not scrubbed by scroll). Each Workbench page
// mounts its own, so a client navigation back to the page scans it again.
import { useEffect } from "react";

export function RevealObserver() {
  useEffect(() => {
    const items = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])"),
    );
    if (!("IntersectionObserver" in window)) {
      for (const el of items) el.dataset.in = "";
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = "";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    for (const el of items) io.observe(el);
    return () => io.disconnect();
  }, []);

  return null;
}

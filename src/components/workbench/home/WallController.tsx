"use client";

// Workbench: advances the tool wall's active group with scroll on
// desktop by writing [data-active] on the section; CSS does the rest.
import { useEffect, useRef } from "react";

const GROUPS = 4;

export function WallController() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = ref.current?.closest("section");
    const track = section?.querySelector<HTMLElement>("[data-track]") ?? section;
    if (!section || !track) return;

    const desk = window.matchMedia("(min-width: 1024px)");
    let frame = 0;
    let last = "";

    const update = () => {
      frame = 0;
      if (!desk.matches) {
        if (last !== "phone") section.dataset.active = "phone";
        last = "phone";
        return;
      }
      const box = track.getBoundingClientRect();
      const travel = Math.max(1, box.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -box.top / travel));
      // Nothing is lit until the wall is well into view.
      const entered = box.top < window.innerHeight * 0.35;
      const active = entered ? Math.min(GROUPS - 1, Math.floor(progress * GROUPS)) : -1;
      const next = String(active);
      if (next !== last) {
        section.dataset.active = next;
        last = next;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    desk.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      desk.removeEventListener("change", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <span ref={ref} hidden />;
}

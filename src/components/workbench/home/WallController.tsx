"use client";

// Workbench: advances the tool wall's active group with scroll on
// desktop by writing [data-active] on the section; CSS does the rest.
// It also fetches the wall's logos ahead of the scroll (see below).
import { useEffect, useRef } from "react";

const GROUPS = 4;

export function WallController() {
  const ref = useRef<HTMLSpanElement>(null);

  // The logos are lazy in the markup, so the browser asks for them only when
  // the wall is about a screen away, and on a phone network a quick scroll
  // reaches the tiles before they arrive. Once the page has loaded (on the
  // Home the intro still covers it), fetch them all; the tiles then take them
  // from the cache. Nothing changes before load, so the first screen is not
  // slowed, and Save-Data keeps the plain lazy loading.
  useEffect(() => {
    const section = ref.current?.closest("section");
    if (!section) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    if (connection?.saveData) return;

    // Safari has no requestIdleCallback.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const held: HTMLImageElement[] = [];
    let idle = 0;
    let timer = 0;
    const warm = () => {
      const urls = new Set(Array.from(section.querySelectorAll("img"), (img) => img.src));
      for (const url of urls) {
        const img = new Image();
        img.decoding = "async";
        img.src = url;
        held.push(img);
      }
    };
    const schedule = () => {
      if (hasIdle) idle = window.requestIdleCallback(warm, { timeout: 2000 });
      else timer = window.setTimeout(warm, 200);
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (idle) window.cancelIdleCallback(idle);
      if (timer) clearTimeout(timer);
      held.length = 0;
    };
  }, []);

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

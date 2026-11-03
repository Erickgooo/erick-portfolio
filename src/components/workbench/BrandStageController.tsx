"use client";

// Workbench: drives the brand stage (BrandStage). On pinned desktop (from
// 1024 px, motion allowed) it turns the scroll through the section's track
// into the brand on stage: [data-active] on the section, data-state on each
// panel (before, active, after; CSS moves them), `inert` on the panels off
// stage, aria-current on the rail; a rail button scrolls to its brand. Its
// figure counts up as a brand takes the stage. Elsewhere (phones) each card's
// figure counts up as the card reaches the screen. With reduced motion it
// does nothing: every panel shows, still, with its final figure.
import { useEffect, useRef } from "react";

const PINNED = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const REDUCED = "(prefers-reduced-motion: reduce)";
const COUNT_MS = 900;

/** "35,000+" -> ["", 35000, "+", grouped]; "146/146" -> ["", 146, "/146"]. */
function parse(value: string) {
  const m = value.match(/^(.*?)(\d[\d,]*)(.*)$/);
  if (!m) return null;
  return {
    prefix: m[1],
    target: Number(m[2].replace(/,/g, "")),
    suffix: m[3],
    grouped: m[2].includes(","),
  };
}

function counter(el: HTMLElement) {
  const out = el.querySelector<HTMLElement>("[data-count-text]");
  const value = el.dataset.count ?? "";
  const p = parse(value);
  let frame = 0;
  const write = (v: number) => {
    if (!out || !p) return;
    const n = Math.round(v);
    const text = p.grouped ? n.toLocaleString("en-US") : String(n);
    out.textContent = `${p.prefix}${text}${p.suffix}`;
  };
  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  return {
    zero() {
      stop();
      write(0);
    },
    final() {
      stop();
      if (out) out.textContent = value;
    },
    run() {
      if (!out || !p) return;
      stop();
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / COUNT_MS);
        write(p.target * (1 - (1 - t) ** 3));
        if (t < 1) frame = requestAnimationFrame(step);
        else {
          frame = 0;
          out.textContent = value;
        }
      };
      frame = requestAnimationFrame(step);
    },
  };
}

export function BrandStageController({ count }: { count: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = ref.current?.closest("section");
    const track = section?.querySelector<HTMLElement>("[data-track]");
    if (!section || !track) return;
    const panels = Array.from(section.querySelectorAll<HTMLElement>("[data-panel]"));
    const rail = Array.from(section.querySelectorAll<HTMLButtonElement>("[data-rail]"));
    const counters = panels.map((p) => {
      const el = p.querySelector<HTMLElement>("[data-count]");
      return el ? counter(el) : null;
    });

    const pinnedMq = window.matchMedia(PINNED);
    const reducedMq = window.matchMedia(REDUCED);
    let frame = 0;
    let active = -1;
    let counted = -1;
    let io: IntersectionObserver | null = null;

    const travel = () => Math.max(1, track.offsetHeight - window.innerHeight);
    const trackTop = () => track.getBoundingClientRect().top + window.scrollY;

    const show = (next: number) => {
      active = next;
      section.dataset.active = String(next);
      panels.forEach((p, i) => {
        p.dataset.state = i < next ? "before" : i === next ? "active" : "after";
        p.inert = i !== next;
      });
      rail.forEach((b, i) => {
        if (i === next) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
    };

    const update = () => {
      frame = 0;
      if (!pinnedMq.matches) return;
      const box = track.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -box.top / travel()));
      const next = Math.min(count - 1, Math.floor(progress * count));
      if (next !== active) show(next);
      // The figure counts once its brand is on stage and the stage is on screen.
      const onScreen = box.top < window.innerHeight * 0.6 && box.bottom > window.innerHeight * 0.4;
      if (onScreen && counted !== active) {
        counted = active;
        counters.forEach((c, i) => (i === active ? c?.run() : c?.zero()));
      } else if (!onScreen && counted !== -1) {
        counted = -1;
        for (const c of counters) c?.zero();
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // A rail button scrolls to the middle of its brand's stretch of the track.
    const onRail = (e: Event) => {
      const i = Number((e.currentTarget as HTMLElement).dataset.rail);
      const top = trackTop() + travel() * ((i + 0.5) / count);
      window.scrollTo({ top, behavior: "smooth" });
    };

    const setup = () => {
      io?.disconnect();
      io = null;
      active = -1;
      counted = -1;
      if (reducedMq.matches) {
        // Still: every panel, every final figure, nothing inert.
        for (const p of panels) {
          p.inert = false;
          p.dataset.state = "active";
        }
        for (const c of counters) c?.final();
        return;
      }
      if (pinnedMq.matches) {
        for (const c of counters) c?.zero();
        update();
        return;
      }
      // Phones: every card is reachable; its figure counts as it arrives.
      for (const p of panels) {
        p.inert = false;
        p.dataset.state = "active";
      }
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const i = panels.indexOf(entry.target as HTMLElement);
            if (entry.isIntersecting) {
              counters[i]?.run();
              io?.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.5 },
      );
      panels.forEach((p, i) => {
        const box = p.getBoundingClientRect();
        if (box.top < window.innerHeight && box.bottom > 0) counters[i]?.final();
        else {
          counters[i]?.zero();
          io?.observe(p);
        }
      });
    };

    setup();
    for (const b of rail) b.addEventListener("click", onRail);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    pinnedMq.addEventListener("change", setup);
    reducedMq.addEventListener("change", setup);
    return () => {
      for (const b of rail) b.removeEventListener("click", onRail);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      pinnedMq.removeEventListener("change", setup);
      reducedMq.removeEventListener("change", setup);
      io?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      for (const c of counters) c?.final();
    };
  }, [count]);

  return <span ref={ref} hidden />;
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import styles from "./IntroLoader.module.scss";

// Fase A (0-2s): trazo del monograma. Fase B (2-4s, en paralelo C): resplandor
// + wordmark. Fase D (4-5s): fade out del overlay. 2000 + 2000 + 1000 = 5000ms.
const DRAW_MS = 2000;
const GLOW_MS = 2000;
const HOLD_MS = DRAW_MS + GLOW_MS;
const FADE_MS = 1000;
// Hard backstop: whatever happens (a backgrounded tab throttling timers, a
// slow device, etc.), never let the overlay block the page longer than this.
const MAX_LIFETIME_MS = 6500;

// Deliberately NOT sessionStorage: sessionStorage survives an F5/reload within
// the same tab, so it was suppressing the intro on reload — the opposite of
// what's wanted. IntroLoader lives in the root layout, which Next.js's App
// Router never remounts on client-side navigation between routes (only the
// route's own page content swaps out), so a plain module-level variable
// already does the right thing on its own: it resets to `false` whenever
// this module is freshly evaluated — which only happens on a real document
// load (first visit or reload) — and simply stays `true` for the rest of
// that document's lifetime, through any amount of internal SPA navigation.
let hasPlayedThisPageLoad = false;

// This initializer also runs during SSR, where `document`/`window` don't
// exist. Only `hidden` is checked here — `document.hasFocus()` can
// transiently report false during a page's initial load even for a normal,
// foreground visit (window focus can settle a beat after visibility does),
// and since this decision is a one-shot read with no retry, a false negative
// there would permanently skip the intro for the whole session.
const isTabHidden = () => typeof document !== "undefined" && document.hidden;

// Same monogram geometry as src/resources/EMIcon.tsx (angular "EM" + Cobalto
// node, per Manual de Marca Sección 2.1) but rendered with stroke+fill so the
// intro can trace it, rather than the shared static fill-only icon used
// everywhere else (nav, footer, 404, watermarks).
const MARK_PATH =
  "M 923,1062 L 710,1275 L 771,1337 L 984,1124 Z M 771,710 L 710,771 L 923,986 L 985,924 Z M 1562,546 L 1439,546 L 1062,923 L 1123,985 Z M 354,546 L 354,1501 L 1022,1501 L 943,1422 L 482,1421 L 483,1067 L 841,1067 L 884,1025 L 840,979 L 484,980 L 482,644 L 781,643 L 1023,885 L 1084,823 L 808,546 Z M 1693,543 L 1148,1088 L 1122,1063 L 1061,1124 L 1198,1262 L 1564,898 L 1565,1501 L 1693,1501 Z";
const NODE_PATH = "M 1022,960 L 960,1024 L 1024,1087 L 1086,1022 Z";

export const IntroLoader = () => {
  // usePathname() (not window.location.pathname) specifically because it
  // resolves to the same value during the server render and the client
  // hydration render. window.location doesn't exist on the server at all,
  // so checking it directly made the server always render nothing while
  // the client immediately wanted to render the overlay — a guaranteed
  // hydration mismatch on every single load, which surfaced as a flash of
  // the real page underneath before the intro caught up and covered it.
  const pathname = usePathname();

  // Captured once at first render (a lazy initializer is only ever a *read*,
  // so it stays consistent even under React Strict Mode's dev double-render).
  // Skipping outright when the tab starts hidden also matters here: if the
  // page was opened in a background tab, there is no "catching up" on a
  // missed intro later without it feeling broken, so we just don't show it.
  const [shouldShow] = useState(() => {
    const alreadyPlayed = hasPlayedThisPageLoad;
    const isHome = pathname === "/";
    const hidden = isTabHidden();
    const result = !alreadyPlayed && isHome && !hidden;
    // Left in permanently (not a temp debug log): this is the one decision
    // in the whole component that's genuinely hard to inspect after the
    // fact — by the time you'd check the DOM, the overlay has already
    // mounted, played, or been skipped. Cheap, and answers "why didn't it
    // show" in one line instead of another investigation.
    if (typeof window !== "undefined") {
      console.info("[IntroLoader] shouldShow:", result, {
        alreadyPlayedThisPageLoad: alreadyPlayed,
        pathname,
        isHomeRoute: isHome,
        tabHiddenAtMount: hidden,
      });
    }
    return result;
  });
  const [phase, setPhase] = useState<"pending" | "entering" | "leaving" | "done">(
    shouldShow ? "pending" : "done",
  );
  const markPathRef = useRef<SVGPathElement>(null);
  const nodePathRef = useRef<SVGPathElement>(null);
  const wordmarkRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!shouldShow) return;

    hasPlayedThisPageLoad = true;

    // Deliberately NOT gated behind prefers-reduced-motion: this is a brand
    // reveal the site owner wants every visitor to see regardless of that
    // OS/browser preference (a conscious call, made after confirming via
    // [IntroLoader] diagnostics below that respecting it was the actual
    // cause of the animation not appearing on a real desktop machine).
    console.info("[IntroLoader] playing:", { holdMs: HOLD_MS, fadeMs: FADE_MS });

    // double rAF so the "entering" class change is picked up as a transition, not the initial state
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setPhase("entering")));

    // The stroke-draw / glow / wordmark timeline runs via the Web Animations
    // API rather than static CSS keyframes: stroke-dasharray needs the path's
    // *actual* rendered length (getTotalLength()), which can only be measured
    // at runtime, not hardcoded for a multi-subpath shape like this one.
    const animations: Animation[] = [];
    const markPath = markPathRef.current;
    const nodePath = nodePathRef.current;
    const wordmark = wordmarkRef.current;

    if (markPath && nodePath && wordmark) {
      const markLength = markPath.getTotalLength();
      const nodeLength = nodePath.getTotalLength();
      console.info("[IntroLoader] path lengths:", { markLength, nodeLength });
      markPath.style.strokeDasharray = `${markLength}`;
      nodePath.style.strokeDasharray = `${nodeLength}`;

      const drawEasing = "cubic-bezier(0.65, 0, 0.35, 1)";
      const glowEasing = "ease-out";

      // Fase A — trazo del contorno completo (0–2s).
      animations.push(
        markPath.animate([{ strokeDashoffset: markLength }, { strokeDashoffset: 0 }], {
          duration: DRAW_MS,
          easing: drawEasing,
          fill: "forwards",
        }),
      );
      // The small node traces quickly near the end of the main stroke,
      // as if it's the last thing the pen lands on.
      animations.push(
        nodePath.animate([{ strokeDashoffset: nodeLength }, { strokeDashoffset: 0 }], {
          duration: DRAW_MS * 0.5,
          delay: DRAW_MS * 0.5,
          easing: drawEasing,
          fill: "forwards",
        }),
      );
      // Fase B — resplandor Cobalto de baja intensidad (Manual Sección 5.3,
      // "Glow Border"): sube y se asienta, nunca satura. Corre en paralelo
      // al trazo (arranca en t=0) para que el contorno ya se vea con un
      // brillo tenue mientras se dibuja, y crece una vez completo.
      animations.push(
        markPath.animate(
          [
            { fillOpacity: 0, filter: "drop-shadow(0 0 0 rgba(45, 91, 255, 0))" },
            {
              fillOpacity: 1,
              filter:
                "drop-shadow(0 0 8px rgba(45, 91, 255, 0.55)) drop-shadow(0 0 18px rgba(45, 91, 255, 0.25))",
              offset: 0.5,
            },
            {
              fillOpacity: 1,
              filter: "drop-shadow(0 0 3px rgba(45, 91, 255, 0.2))",
            },
          ],
          { duration: GLOW_MS, delay: DRAW_MS, easing: glowEasing, fill: "forwards" },
        ),
      );
      animations.push(
        nodePath.animate(
          [
            { fillOpacity: 0.4, filter: "drop-shadow(0 0 0 rgba(45, 91, 255, 0))" },
            {
              fillOpacity: 1,
              filter:
                "drop-shadow(0 0 10px rgba(45, 91, 255, 0.7)) drop-shadow(0 0 20px rgba(45, 91, 255, 0.3))",
              offset: 0.5,
            },
            {
              fillOpacity: 1,
              filter: "drop-shadow(0 0 4px rgba(45, 91, 255, 0.25))",
            },
          ],
          { duration: GLOW_MS, delay: DRAW_MS, easing: glowEasing, fill: "forwards" },
        ),
      );
      // Fase C — wordmark, en paralelo a B.
      animations.push(
        wordmark.animate(
          [
            { opacity: 0, transform: "translateY(8px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 700,
            delay: DRAW_MS,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "forwards",
          },
        ),
      );
    } else {
      console.warn("[IntroLoader] refs not ready, animation skipped:", {
        markPath: !!markPath,
        nodePath: !!nodePath,
        wordmark: !!wordmark,
      });
    }

    const leaveTimer = setTimeout(() => setPhase("leaving"), HOLD_MS);
    const doneTimer = setTimeout(() => setPhase("done"), HOLD_MS + FADE_MS);

    // Background tabs (and unfocused windows) throttle/pause rAF and
    // setTimeout, so switching away mid-intro can otherwise get it stuck
    // showing the overlay — and, worse, blocking clicks on everything under
    // it — for a long time. The moment that happens, just skip to the end.
    //
    // The bail is debounced rather than immediate: a real desktop page load
    // can fire a transient `blur` (and sometimes a matching `visibilitychange`)
    // a moment after mount — browser chrome/OS focus settling, not the user
    // actually switching away — and reacting to that instantly cut the intro
    // short a couple of seconds in on desktop specifically. Waiting briefly
    // for focus to genuinely NOT return distinguishes a real tab-switch from
    // that transient blip, the same class of race the mount-time hasFocus()
    // check above was rewritten to avoid.
    const bail = () => setPhase("done");
    let bailTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleBail = () => {
      if (bailTimer) return;
      bailTimer = setTimeout(() => {
        bailTimer = null;
        bail();
      }, 400);
    };
    const cancelScheduledBail = () => {
      if (bailTimer) {
        clearTimeout(bailTimer);
        bailTimer = null;
      }
    };
    const onVisibilityChange = () => {
      if (document.hidden) scheduleBail();
      else cancelScheduledBail();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", scheduleBail);
    window.addEventListener("focus", cancelScheduledBail);

    // Absolute backstop independent of the above, in case of any other edge case.
    const maxTimer = setTimeout(bail, MAX_LIFETIME_MS);

    return () => {
      cancelAnimationFrame(raf);
      for (const a of animations) a.cancel();
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
      clearTimeout(maxTimer);
      cancelScheduledBail();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", scheduleBail);
      window.removeEventListener("focus", cancelScheduledBail);
    };
  }, [shouldShow]);

  useEffect(() => {
    if (phase === "entering" || phase === "pending") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className={`${styles.overlay} ${phase === "leaving" ? styles.leaving : ""} ${
        phase === "entering" ? styles.entering : ""
      }`}
      aria-hidden="true"
    >
      <div className={styles.mark}>
        <span className={styles.icon}>
          <svg
            viewBox="314 503 1419 1038"
            width="1em"
            height="1em"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              ref={markPathRef}
              className={styles.markPath}
              d={MARK_PATH}
              fill="#F4F5F7"
              fillOpacity={0}
              stroke="#F4F5F7"
              strokeWidth={36}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              ref={nodePathRef}
              className={styles.nodePath}
              d={NODE_PATH}
              fill="#2D5BFF"
              fillOpacity={0.4}
              stroke="#2D5BFF"
              strokeWidth={24}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <span className={styles.flash} />
        </span>
        <span ref={wordmarkRef} className={styles.wordmark}>
          Erick Mahecha
        </span>
      </div>
    </div>
  );
};

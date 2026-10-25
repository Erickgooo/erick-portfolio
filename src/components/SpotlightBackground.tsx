"use client";

import { useEffect, useRef } from "react";
import styles from "./SpotlightBackground.module.scss";
import { whenIntroLeaves } from "./workbench/scenes/intro";

/** How long after the last scroll event the glow counts the page as still. */
const STILL_MS = 400;

interface SpotlightBackgroundProps {
  glowRadius?: number;
  glowColor?: string;
}

// A cursor/finger-following glow — the dot grid used to live here too, but
// as a position: fixed layer it stayed visually anchored to the viewport
// while the page scrolled underneath it, which on mobile (where scrolling
// itself is a touch gesture, so the glow tracked the scrolling finger) read
// as the dots being stuck to the screen rather than part of the page. The
// dots now live as a plain, non-fixed CSS background on the page body (see
// layout.tsx) so they scroll naturally with content. Only this glow — a
// small, genuinely viewport-anchored highlight — stays fixed and JS-tracked.
//
// The glow is a circle of twice its radius, painted once and moved with a
// transform, so following the pointer repaints nothing. It eases towards the
// pointer and stops once it is there (within half a pixel); the next move
// starts it again. With reduced motion it jumps straight to the pointer.
//
// It is ambience, never the thing that moves (pulido de animaciones,
// 2026-10-25): it stays dark until the site intro has lifted, then fades in
// (data-on), and it dims while the page scrolls (data-calm), when the
// sections' entrances are what moves. Both are opacity on the wrapper's own
// layer, set as attributes (the glow's style is only its position).
export function SpotlightBackground({
  glowRadius = 260,
  glowColor = "ui-glow",
}: SpotlightBackgroundProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const stopWaiting = whenIntroLeaves(() => wrap.setAttribute("data-on", ""), { gone: true });

    let still = 0;
    const onScroll = () => {
      if (!still) wrap.setAttribute("data-calm", "");
      else window.clearTimeout(still);
      still = window.setTimeout(() => {
        still = 0;
        wrap.removeAttribute("data-calm");
      }, STILL_MS);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      stopWaiting();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(still);
    };
  }, []);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    // The glow starts centred (its CSS); `current` is where it is drawn.
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...target };
    let frame = 0;

    const draw = () => {
      glow.style.transform = `translate3d(${current.x - glowRadius}px, ${current.y - glowRadius}px, 0)`;
    };

    const step = () => {
      frame = 0;
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      if (reduced.matches || (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5)) {
        current.x = target.x;
        current.y = target.y;
        draw();
        return;
      }
      current.x += dx * 0.08;
      current.y += dy * 0.08;
      draw();
      frame = requestAnimationFrame(step);
    };

    const follow = (x: number, y: number) => {
      target.x = x;
      target.y = y;
      if (!frame) frame = requestAnimationFrame(step);
    };

    const handleMouseMove = (e: MouseEvent) => follow(e.clientX, e.clientY);
    // Touch devices have no cursor, so the glow follows the finger instead —
    // same idea as mousemove, just driven by touchstart/touchmove. Without
    // this, the glow would never move past its initial spot on a phone,
    // leaving it frozen at the same spot while the page scrolls underneath it.
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) follow(touch.clientX, touch.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouchMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [glowRadius]);

  return (
    <div
      ref={wrapRef}
      className={styles.spotlightWrapper}
      style={
        {
          "--glow-radius": `${glowRadius}px`,
          "--glow-color": `var(--${glowColor})`,
        } as React.CSSProperties
      }
    >
      <div ref={glowRef} className={styles.glow} />
    </div>
  );
}

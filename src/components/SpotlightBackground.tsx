"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./SpotlightBackground.module.scss";

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
export function SpotlightBackground({
  glowRadius = 260,
  glowColor = "scheme-brand-600-15",
}: SpotlightBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | undefined>(undefined);
  const wakeRef = useRef<() => void>(() => {});
  const pathname = usePathname();

  useEffect(() => {
    target.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    current.current = { ...target.current };

    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      wake();
    };
    // Touch devices have no cursor, so the reveal follows the finger instead —
    // same idea as mousemove, just driven by touchstart/touchmove. Without
    // this, --x/--y would never move past its initial value on a phone,
    // leaving the reveal frozen at the same spot while the page scrolls
    // underneath it.
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) target.current = { x: touch.clientX, y: touch.clientY };
      wake();
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouchMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // The loop runs only while the glow is still catching up: a resting pointer
    // (and a phone nobody is touching) costs no frames at all.
    const loop = () => {
      frameRef.current = undefined;
      const dx = target.current.x - current.current.x;
      const dy = target.current.y - current.current.y;
      const settled = Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1;
      current.current.x = settled ? target.current.x : current.current.x + dx * 0.08;
      current.current.y = settled ? target.current.y : current.current.y + dy * 0.08;
      const x = `${current.current.x}px`;
      const y = `${current.current.y}px`;
      // The page-wide layer sits behind the content, so the home film (an opaque,
      // viewport-pinned stage) carries its own glow layer and gets the same position.
      const film = document.querySelector<HTMLElement>("[data-spotlight-target]");
      for (const el of [containerRef.current, film]) {
        if (!el) continue;
        el.style.setProperty("--x", x);
        el.style.setProperty("--y", y);
      }
      if (!settled) wake();
    };
    const wake = () => {
      if (frameRef.current === undefined) frameRef.current = requestAnimationFrame(loop);
    };
    wakeRef.current = wake;
    wake();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
    };
  }, []);

  // A page that brings its own glow layer (the home film) mounts after the loop
  // may have gone idle: one more pass hands it the current position.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger, not an input
  useEffect(() => {
    wakeRef.current();
  }, [pathname]);

  return (
    <div
      ref={containerRef}
      className={styles.spotlightWrapper}
      data-spotlight=""
      style={
        {
          "--glow-radius": `${glowRadius}px`,
          "--glow-color": `var(--${glowColor})`,
        } as React.CSSProperties
      }
    >
      <div className={styles.glow} />
    </div>
  );
}

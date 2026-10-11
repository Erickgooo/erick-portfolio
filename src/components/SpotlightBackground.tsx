"use client";

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

  useEffect(() => {
    target.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    current.current = { ...target.current };

    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    // Touch devices have no cursor, so the reveal follows the finger instead —
    // same idea as mousemove, just driven by touchstart/touchmove. Without
    // this, --x/--y would never move past its initial value on a phone,
    // leaving the reveal frozen at the same spot while the page scrolls
    // underneath it.
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) target.current = { x: touch.clientX, y: touch.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouchMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    const loop = () => {
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      if (containerRef.current) {
        containerRef.current.style.setProperty("--x", `${current.current.x}px`);
        containerRef.current.style.setProperty("--y", `${current.current.y}px`);
      }
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.spotlightWrapper}
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

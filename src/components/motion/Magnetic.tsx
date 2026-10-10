"use client";

import { type ReactNode, useEffect, useRef } from "react";
import styles from "./Magnetic.module.scss";

function enabled(): boolean {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    document.documentElement.dataset.fx !== "lite"
  );
}

/** Pulls its child up to `strength` px toward the pointer (fine pointers, full tier only). */
export function Magnetic({ children, strength = 6 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled()) return;
    let rect = el.getBoundingClientRect();
    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onEnter = () => {
      rect = el.getBoundingClientRect();
      el.style.transition = "transform 80ms linear";
    };
    const onMove = (e: PointerEvent) => {
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      x = Math.max(-1, Math.min(1, dx)) * strength;
      y = Math.max(-1, Math.min(1, dy)) * strength;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      el.style.transition = "transform var(--dur-s) var(--ease-out)";
      if (!frame) frame = requestAnimationFrame(apply);
    };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <span ref={ref} className={styles.magnetic}>
      {children}
    </span>
  );
}

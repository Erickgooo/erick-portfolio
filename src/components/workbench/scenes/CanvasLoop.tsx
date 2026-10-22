"use client";

// Workbench scenes: a canvas that draws a loop with requestAnimationFrame,
// only while it is started (start.ts), on screen and in a visible tab. Its
// clock pauses with it and resumes where it stopped. The backing store
// follows the element's size at devicePixelRatio capped at 2. With reduced
// motion it draws one still frame (at `stillAt`) and never loops.
//
// `className` and `style` go on an aria-hidden wrapper that gives the canvas
// its box (the canvas fills it); the page reserves that size. A canvas is
// never an LCP candidate.
// `draw` must clear what it needs: the context is not cleared for it.
//
//   <CanvasLoop draw={drawBits} afterIntro className={s.layer} />
import { type CSSProperties, useEffect, useRef } from "react";
import { prefersReducedMotion, watchScene } from "./start";

export type Frame = {
  /** Seconds the loop has run (paused time excluded). */
  t: number;
  /** Seconds since the previous frame, capped at 0.1. */
  dt: number;
  /** Size in CSS pixels; the context is already scaled by `dpr`. */
  w: number;
  h: number;
  dpr: number;
  /** The site's dark theme is on. */
  dark: boolean;
};

export type Draw = (ctx: CanvasRenderingContext2D, frame: Frame) => void;

export function CanvasLoop({
  draw,
  afterIntro = false,
  threshold = 0.1,
  paused = false,
  stillAt = 0,
  className,
  style,
  onStart,
}: {
  draw: Draw;
  afterIntro?: boolean;
  threshold?: number;
  /** Pause from outside (the clock stops too). */
  paused?: boolean;
  /** The time, in seconds, of the frame drawn with reduced motion. */
  stillAt?: number;
  className?: string;
  style?: CSSProperties;
  /** Called once when the loop first starts (e.g. to set a CSS entrance). */
  onStart?: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const pausedRef = useRef(paused);
  const kick = useRef<() => void>(() => {});
  const onStartRef = useRef(onStart);
  onStartRef.current = onStart;

  useEffect(() => {
    pausedRef.current = paused;
    kick.current();
  }, [paused]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let dpr = 1;
    let t = stillAt;
    let last = 0;
    let frame = 0;
    let live = false;
    let started = false;

    const paint = (dt: number) => {
      if (!w || !h) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      drawRef.current(ctx, { t, dt, w, h, dpr, dark });
    };

    const loop = (now: number) => {
      frame = 0;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      t += dt;
      paint(dt);
      if (live && !pausedRef.current) frame = requestAnimationFrame(loop);
    };

    const sync = () => {
      const run = live && !pausedRef.current && !reduced;
      if (run && !frame) {
        last = 0;
        frame = requestAnimationFrame(loop);
      } else if (!run && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    kick.current = sync;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const box = canvas.getBoundingClientRect();
      w = box.width;
      h = box.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      // Without a running loop, keep the current frame on screen.
      if (started && !frame) paint(0);
    };
    const sizes = new ResizeObserver(resize);
    sizes.observe(canvas);
    resize();

    // A theme switch repaints a paused or still canvas.
    const theme = new MutationObserver(() => {
      if (started && !frame) paint(0);
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const unwatch = watchScene(canvas, { afterIntro, threshold }, (state) => {
      if (state.started && !started) {
        started = true;
        onStartRef.current?.();
        paint(0);
      }
      live = state.live;
      sync();
    });

    return () => {
      unwatch();
      sizes.disconnect();
      theme.disconnect();
      if (frame) cancelAnimationFrame(frame);
      kick.current = () => {};
    };
  }, [afterIntro, threshold, stillAt]);

  return (
    <span className={className} style={style} aria-hidden="true">
      <canvas ref={ref} style={{ display: "block", width: "100%", height: "100%" }} />
    </span>
  );
}

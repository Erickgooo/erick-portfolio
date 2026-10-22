"use client";

// Home, scene (type 3): the hero's ambient layer, a canvas behind the bench.
// A few quiet marks around the objects (sober, 2026-10-22): rings, dots,
// squares and short strokes, drawn in line, never tilted. As the site intro
// fades the layer rises into place, then each mark drifts on its own slow
// loop. It draws nothing else: the page dots and the pointer glow show
// through everywhere around the marks. It holds behind the intro like the bench (start.ts),
// runs only on screen, and with reduced motion it is one still frame.
import { useCallback, useRef } from "react";
import { CanvasLoop, type Frame } from "../scenes/CanvasLoop";
import styles from "./ambient.module.scss";

type Kind = "square" | "dot" | "ring" | "dash";
type Bit = {
  x: number;
  y: number;
  size: number;
  kind: Kind;
  accent: boolean;
  ax: number;
  ay: number;
  period: number;
  phase: number;
};

// A fixed seed, so the layer looks the same on every visit and in every frame capture.
function makeBits(count: number): Bit[] {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const kinds: Kind[] = ["ring", "dot", "square", "dash", "dot", "ring"];
  const bits: Bit[] = [];
  while (bits.length < count) {
    const x = rnd();
    const y = rnd();
    // Keep the middle of the bench clear: the marks live around the objects.
    const dx = (x - 0.5) / 0.38;
    const dy = (y - 0.5) / 0.36;
    if (dx * dx + dy * dy < 1) continue;
    const kind = kinds[Math.floor(rnd() * kinds.length)];
    bits.push({
      x,
      y,
      kind,
      size: kind === "dash" ? 14 + rnd() * 10 : kind === "dot" ? 3 + rnd() * 3 : 7 + rnd() * 7,
      accent: rnd() < 0.3,
      ax: 2 + rnd() * 4,
      ay: 3 + rnd() * 6,
      period: 6 + rnd() * 4.5,
      phase: rnd() * Math.PI * 2,
    });
  }
  return bits;
}

const BITS = makeBits(22);

function colour(bit: Bit, dark: boolean) {
  if (bit.accent) return "#2d5bff";
  return dark ? "rgba(245, 245, 247, 0.32)" : "rgba(19, 19, 22, 0.28)";
}

export function BenchAmbient() {
  const box = useRef<HTMLDivElement>(null);
  const onStart = useCallback(() => {
    box.current?.setAttribute("data-on", "");
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, f: Frame) => {
    const { w, h, t, dark } = f;
    ctx.clearRect(0, 0, w, h);
    // Fewer marks on a small layer (phones), never crowded.
    const count = Math.max(10, Math.min(BITS.length, Math.round((w * h) / 30000)));
    const unit = Math.max(0.75, Math.min(1.25, w / 640));
    ctx.lineWidth = 1.25;
    for (let i = 0; i < count; i++) {
      const bit = BITS[i];
      const a = (t / bit.period) * Math.PI * 2 + bit.phase;
      const x = bit.x * w + Math.cos(a * 0.7) * bit.ax * unit;
      const y = bit.y * h + Math.sin(a) * bit.ay * unit;
      const s = bit.size * unit;
      const c = colour(bit, dark);
      ctx.fillStyle = c;
      ctx.strokeStyle = c;
      if (bit.kind === "dot") {
        ctx.beginPath();
        ctx.arc(x, y, s / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (bit.kind === "ring") {
        ctx.beginPath();
        ctx.arc(x, y, s / 2, 0, Math.PI * 2);
        ctx.stroke();
      } else if (bit.kind === "square") {
        ctx.strokeRect(x - s / 2 + 0.5, y - s / 2 + 0.5, s, s);
      } else {
        ctx.beginPath();
        ctx.moveTo(x - s / 2, y);
        ctx.lineTo(x + s / 2, y);
        ctx.stroke();
      }
    }
  }, []);

  return (
    <div ref={box} className={styles.ambient}>
      <CanvasLoop draw={draw} afterIntro onStart={onStart} className={styles.canvas} />
    </div>
  );
}

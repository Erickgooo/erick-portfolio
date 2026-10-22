"use client";

// Home, scene (type 3): the hero's ambient layer, a canvas behind the bench.
// Cut-paper bits from the workbench (squares, dots, diamonds, tape, eyelets)
// in the brand's colours. As the site intro fades the layer rises into
// place, then each bit floats on its own slow loop. It draws nothing else:
// the page dots and the pointer glow show through everywhere around the bits.
// It holds behind the intro like the bench (start.ts), runs only on screen,
// and with reduced motion it is one still frame.
import { useCallback, useRef } from "react";
import { CanvasLoop, type Frame } from "../scenes/CanvasLoop";
import styles from "./ambient.module.scss";

type Kind = "square" | "dot" | "diamond" | "tape" | "ring";
type Bit = {
  x: number;
  y: number;
  size: number;
  kind: Kind;
  tone: 0 | 1 | 2 | 3;
  rot: number;
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
  const kinds: Kind[] = ["square", "dot", "diamond", "tape", "ring", "dot", "square", "diamond"];
  const bits: Bit[] = [];
  while (bits.length < count) {
    const x = rnd();
    const y = rnd();
    // Keep the middle of the bench clear: the bits live around the objects.
    const dx = (x - 0.5) / 0.36;
    const dy = (y - 0.5) / 0.34;
    if (dx * dx + dy * dy < 1) continue;
    const kind = kinds[Math.floor(rnd() * kinds.length)];
    bits.push({
      x,
      y,
      kind,
      size: kind === "tape" ? 20 + rnd() * 14 : kind === "dot" ? 4 + rnd() * 5 : 8 + rnd() * 9,
      tone: Math.floor(rnd() * 4) as Bit["tone"],
      rot: rnd() * Math.PI,
      ax: 2 + rnd() * 5,
      ay: 4 + rnd() * 8,
      period: 5 + rnd() * 4.5,
      phase: rnd() * Math.PI * 2,
    });
  }
  return bits;
}

const BITS = makeBits(36);

// cobalt, tape (a light cobalt), ink or white, and the light cobalt eyelet.
function colour(tone: Bit["tone"], dark: boolean) {
  if (tone === 0) return "#2d5bff";
  if (tone === 1) return "#a6baff";
  if (tone === 2) return dark ? "rgba(245, 245, 247, 0.6)" : "rgba(19, 19, 22, 0.55)";
  return dark ? "#e7edff" : "#6f8fff";
}

export function BenchAmbient() {
  const box = useRef<HTMLDivElement>(null);
  const onStart = useCallback(() => {
    box.current?.setAttribute("data-on", "");
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, f: Frame) => {
    const { w, h, t, dark } = f;
    ctx.clearRect(0, 0, w, h);
    // Fewer bits on a small layer (phones), never crowded.
    const count = Math.max(14, Math.min(BITS.length, Math.round((w * h) / 21000)));
    const unit = Math.max(0.75, Math.min(1.25, w / 640));
    for (let i = 0; i < count; i++) {
      const b = BITS[i];
      const a = (t / b.period) * Math.PI * 2 + b.phase;
      const x = b.x * w + Math.cos(a * 0.7) * b.ax * unit;
      const y = b.y * h + Math.sin(a) * b.ay * unit;
      const s = b.size * unit;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(b.rot + Math.sin(a * 0.8) * 0.25);
      ctx.fillStyle = colour(b.tone, dark);
      ctx.strokeStyle = colour(b.tone, dark);
      if (b.kind === "square") {
        ctx.fillRect(-s / 2, -s / 2, s, s);
      } else if (b.kind === "diamond") {
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-s / 2.6, -s / 2.6, s / 1.3, s / 1.3);
      } else if (b.kind === "dot") {
        ctx.beginPath();
        ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.kind === "ring") {
        ctx.lineWidth = Math.max(1.5, s * 0.22);
        ctx.beginPath();
        ctx.arc(0, 0, s / 2.4, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // A strip of tape with notched ends.
        const tw = s;
        const th = s * 0.34;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(-tw / 2, -th / 2);
        ctx.lineTo(tw / 2, -th / 2);
        ctx.lineTo(tw / 2 - th * 0.25, 0);
        ctx.lineTo(tw / 2, th / 2);
        ctx.lineTo(-tw / 2, th / 2);
        ctx.lineTo(-tw / 2 + th * 0.25, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }, []);

  return (
    <div ref={box} className={styles.ambient}>
      <CanvasLoop draw={draw} afterIntro onStart={onStart} className={styles.canvas} />
    </div>
  );
}

"use client";

// The touchscreen of BoothApp, drawn on a canvas (285 tiles are too many for
// DOM nodes). It follows the scene around it: dark until step 3 (the stand is
// set up), and from step 4 it plays the app on its own clock: header, the
// grid filling in, a tap, one panel full screen, a swipe, back to the grid.
// With reduced motion it shows the full grid.
import { useRef } from "react";
import { CanvasLoop, type Frame } from "../CanvasLoop";

const COLS = 15;
const ROWS = 19; // 15 x 19 = 285, the number of panel variants.
const TAPPED = { c: 8, r: 7 };

// Timeline, in seconds from step 4.
const HEADER = [0, 0.5];
const FILL = [0.4, 3.4];
const TAP = [4.2, 4.7];
const ZOOM_IN = [4.7, 5.5];
const SWIPE = [6.5, 7.1];
const ZOOM_OUT = [7.7, 8.5];
const GRID_SHOWN = 9;

const INK = "#1d1d22";
const COBALT = "#2d5bff";
const MIST = "#e7edff";
const STEEL = "#d3d3da";
const PAPER = "#ffffff";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const span = (t: number, [a, b]: number[]) => clamp((t - a) / (b - a));
const ease = (p: number) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);
const out = (p: number) => 1 - (1 - p) ** 3;

/** A steady pseudo-random colour per tile: the variants. The tapped one and its neighbour are strong. */
function tileColour(c: number, r: number) {
  if (r === TAPPED.r && c === TAPPED.c) return COBALT;
  if (r === TAPPED.r && c === TAPPED.c + 1) return INK;
  const n = Math.abs(Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1;
  if (n < 0.12) return COBALT;
  if (n < 0.26) return INK;
  if (n < 0.56) return STEEL;
  return MIST;
}

type Rect = { x: number; y: number; w: number; h: number };

function lerpRect(a: Rect, b: Rect, p: number): Rect {
  return {
    x: a.x + (b.x - a.x) * p,
    y: a.y + (b.y - a.y) * p,
    w: a.w + (b.w - a.w) * p,
    h: a.h + (b.h - a.h) * p,
  };
}

/** A perforated panel: holes on a staggered grid. */
function panel(ctx: CanvasRenderingContext2D, r: Rect, fill: string) {
  ctx.fillStyle = fill;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle =
    fill === COBALT || fill === INK ? "rgba(255, 255, 255, 0.85)" : "rgba(29, 29, 34, 0.5)";
  const step = r.w / 8;
  const rad = step * 0.2;
  for (let row = 0, y = r.y + step * 0.6; y < r.y + r.h - rad; row++, y += step * 0.8) {
    for (let x = r.x + step * (row % 2 ? 1 : 0.5); x < r.x + r.w - rad; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function KioskScreen({ className }: { className?: string }) {
  const zero = useRef(-1);

  const draw = (ctx: CanvasRenderingContext2D, f: Frame) => {
    const { w, h } = f;
    ctx.clearRect(0, 0, w, h);
    const scene = f.el.closest("[data-scene]");
    const on = f.still || scene?.hasAttribute("data-s3");
    if (!on) {
      zero.current = -1;
      ctx.fillStyle = INK;
      ctx.fillRect(0, 0, w, h);
      return;
    }
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);

    let t = GRID_SHOWN;
    if (!f.still) {
      if (!scene?.hasAttribute("data-s4")) {
        zero.current = -1;
        return;
      }
      if (zero.current < 0) zero.current = f.t;
      t = f.t - zero.current;
    }

    // Header.
    const hh = h * 0.075;
    const hp = out(span(t, HEADER));
    ctx.save();
    ctx.globalAlpha = hp;
    ctx.translate(0, -hh * (1 - hp));
    ctx.fillStyle = COBALT;
    ctx.fillRect(0, 0, w, hh);
    ctx.fillStyle = PAPER;
    const m = hh * 0.3;
    ctx.fillRect(m * 1.4, m, hh - m * 2, hh - m * 2);
    ctx.fillRect(hh + m * 0.8, hh * 0.42, w * 0.3, hh * 0.16);
    ctx.restore();

    // Grid.
    const pad = w * 0.06;
    const top = hh + pad;
    const gap = w * 0.012;
    const cw = (w - pad * 2 - gap * (COLS - 1)) / COLS;
    const ch = Math.min(cw, (h - top - pad - gap * (ROWS - 1)) / ROWS);
    const gridH = ROWS * ch + (ROWS - 1) * gap;
    const y0 = top + (h - top - pad - gridH) / 2;
    const cell = (c: number, r: number): Rect => ({
      x: pad + c * (cw + gap),
      y: y0 + r * (ch + gap),
      w: cw,
      h: ch,
    });
    const content: Rect = { x: pad, y: top, w: w - pad * 2, h: h - top - pad };

    const zin = ease(span(t, ZOOM_IN));
    const zout = ease(span(t, ZOOM_OUT));
    const single = zin > 0 && zout < 1;
    const gridAlpha = single ? Math.max(1 - zin, zout) : 1;

    ctx.globalAlpha = gridAlpha;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const d = FILL[0] + ((c + r) / (COLS + ROWS - 2)) * (FILL[1] - FILL[0] - 0.25);
        const p = out(clamp((t - d) / 0.25));
        if (p <= 0) continue;
        const b = cell(c, r);
        const s = 0.35 + 0.65 * p;
        ctx.fillStyle = tileColour(c, r);
        ctx.fillRect(b.x + (b.w * (1 - s)) / 2, b.y + (b.h * (1 - s)) / 2, b.w * s, b.h * s);
      }
    }
    ctx.globalAlpha = 1;

    // The tap.
    const tp = span(t, TAP);
    if (tp > 0 && tp < 1) {
      const b = cell(TAPPED.c, TAPPED.r);
      ctx.strokeStyle = COBALT;
      ctx.lineWidth = Math.max(1.5, w * 0.012);
      ctx.globalAlpha = 1 - tp;
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w * (0.6 + tp * 2.4), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // One panel full screen, then a swipe to the next, then back to its tile.
    if (single) {
      const sw = ease(span(t, SWIPE));
      const from = cell(TAPPED.c, TAPPED.r);
      const back = cell(TAPPED.c + 1, TAPPED.r);
      if (zout > 0) {
        panel(ctx, lerpRect(content, back, zout), tileColour(TAPPED.c + 1, TAPPED.r));
      } else {
        const a = lerpRect(from, content, zin);
        ctx.save();
        ctx.beginPath();
        ctx.rect(content.x, content.y, content.w, content.h);
        ctx.clip();
        panel(ctx, { ...a, x: a.x - sw * (content.w + gap * 4) }, tileColour(TAPPED.c, TAPPED.r));
        if (sw > 0) {
          panel(
            ctx,
            { ...content, x: content.x + (1 - sw) * (content.w + gap * 4) },
            tileColour(TAPPED.c + 1, TAPPED.r),
          );
        }
        ctx.restore();
      }
    }
  };

  return <CanvasLoop draw={draw} className={className} />;
}

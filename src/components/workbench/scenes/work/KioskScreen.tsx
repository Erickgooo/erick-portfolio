"use client";

// The touchscreen of BoothApp, drawn on a canvas (285 tiles are too many for
// DOM nodes). It follows the scene around it: dark until step 3 (the stand is
// set up), and from step 4 it plays the app on its own clock: header, the
// grid filling in, a tap, one panel full screen, a swipe, back to the grid.
// With reduced motion it shows the full grid. Sober (2026-10-22): the app
// takes the page's tone in either theme; its tiles are outlined in variant A
// (cobalt ones filled) and flat in variant B.
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

// The variants of the panels, by role; drawn in the palette of the page.
type Tone = "cobalt" | "ink" | "steel" | "mist";
const COBALT = "#2d5bff";

type Palette = {
  /** The screen while the stand is being set up. */
  off: string;
  /** The app's background. */
  paper: string;
  /** Outlined tiles (variant A) or filled ones (B). */
  outline: boolean;
  tone: Record<Tone, string>;
  /** The holes of a perforated panel, on a strong and on a light tone. */
  holesOnStrong: string;
  holesOnLight: string;
};

function palette(dark: boolean, b: boolean): Palette {
  if (b) {
    return dark
      ? {
          off: "#26262c",
          paper: "#131316",
          outline: false,
          tone: { cobalt: COBALT, ink: "#f5f5f7", steel: "#3a3a42", mist: "#26262c" },
          holesOnStrong: "rgba(19, 19, 22, 0.75)",
          holesOnLight: "rgba(245, 245, 247, 0.45)",
        }
      : {
          off: "#e7edff",
          paper: "#ffffff",
          outline: false,
          tone: { cobalt: COBALT, ink: "#1d1d22", steel: "#d3d3da", mist: "#e7edff" },
          holesOnStrong: "rgba(255, 255, 255, 0.85)",
          holesOnLight: "rgba(29, 29, 34, 0.5)",
        };
  }
  return dark
    ? {
        off: "#1c1c21",
        paper: "#131316",
        outline: true,
        tone: { cobalt: COBALT, ink: "#f5f5f7", steel: "#55555f", mist: "#3a4670" },
        holesOnStrong: "rgba(19, 19, 22, 0.75)",
        holesOnLight: "rgba(245, 245, 247, 0.5)",
      }
    : {
        off: "#f3f6ff",
        paper: "#ffffff",
        outline: true,
        tone: { cobalt: COBALT, ink: "#1d1d22", steel: "#b9bbc6", mist: "#b4c3f5" },
        holesOnStrong: "rgba(255, 255, 255, 0.85)",
        holesOnLight: "rgba(29, 29, 34, 0.45)",
      };
}

// TEMPORARY (sober variants): which of the two treatments is on.
function variantB() {
  return document.documentElement.getAttribute("data-wb-variant") === "b";
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const span = (t: number, [a, b]: number[]) => clamp((t - a) / (b - a));
const ease = (p: number) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);
const out = (p: number) => 1 - (1 - p) ** 3;

/** A steady pseudo-random tone per tile: the variants. The tapped one and its neighbour are strong. */
function tileTone(c: number, r: number): Tone {
  if (r === TAPPED.r && c === TAPPED.c) return "cobalt";
  if (r === TAPPED.r && c === TAPPED.c + 1) return "ink";
  const n = Math.abs(Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1;
  if (n < 0.12) return "cobalt";
  if (n < 0.26) return "ink";
  if (n < 0.56) return "steel";
  return "mist";
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
function panel(ctx: CanvasRenderingContext2D, r: Rect, tone: Tone, p: Palette) {
  ctx.fillStyle = p.tone[tone];
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = tone === "cobalt" || tone === "ink" ? p.holesOnStrong : p.holesOnLight;
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
    const pal = palette(f.dark, variantB());
    const scene = f.el.closest("[data-scene]");
    const on = f.still || scene?.hasAttribute("data-s3");
    if (!on) {
      zero.current = -1;
      ctx.fillStyle = pal.off;
      ctx.fillRect(0, 0, w, h);
      return;
    }
    ctx.fillStyle = pal.paper;
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
    ctx.fillStyle = "#ffffff";
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
    ctx.lineWidth = Math.max(0.75, w * 0.004);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const d = FILL[0] + ((c + r) / (COLS + ROWS - 2)) * (FILL[1] - FILL[0] - 0.25);
        const p = out(clamp((t - d) / 0.25));
        if (p <= 0) continue;
        const b = cell(c, r);
        const s = 0.35 + 0.65 * p;
        const tone = tileTone(c, r);
        const x = b.x + (b.w * (1 - s)) / 2;
        const y = b.y + (b.h * (1 - s)) / 2;
        if (pal.outline && tone !== "cobalt") {
          const lw = ctx.lineWidth;
          ctx.strokeStyle = pal.tone[tone];
          ctx.strokeRect(x + lw / 2, y + lw / 2, b.w * s - lw, b.h * s - lw);
        } else {
          ctx.fillStyle = pal.tone[tone];
          ctx.fillRect(x, y, b.w * s, b.h * s);
        }
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
        panel(ctx, lerpRect(content, back, zout), tileTone(TAPPED.c + 1, TAPPED.r), pal);
      } else {
        const a = lerpRect(from, content, zin);
        ctx.save();
        ctx.beginPath();
        ctx.rect(content.x, content.y, content.w, content.h);
        ctx.clip();
        panel(
          ctx,
          { ...a, x: a.x - sw * (content.w + gap * 4) },
          tileTone(TAPPED.c, TAPPED.r),
          pal,
        );
        if (sw > 0) {
          panel(
            ctx,
            { ...content, x: content.x + (1 - sw) * (content.w + gap * 4) },
            tileTone(TAPPED.c + 1, TAPPED.r),
            pal,
          );
        }
        ctx.restore();
      }
    }
  };

  return <CanvasLoop draw={draw} className={className} />;
}

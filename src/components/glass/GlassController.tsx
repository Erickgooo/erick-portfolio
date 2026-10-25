"use client";

// Liquid Glass, the moving parts (the material itself is in _glass.scss):
// - html[data-lg-scrolled] once the page has scrolled, so the header can
//   change state (Header.module.scss);
// - data-lg-tone="dense" on the header pill while media or a section that
//   contrasts with the page passes underneath, so its denser tint fades in;
// - the specular light of every glass surface, carried toward the pointer
//   with `translate` (fine pointers only; on touch screens it rests, and in
//   variant b it slides with the scroll); with reduced motion it rests;
// - the lens: in Chromium, which draws SVG filters in backdrop-filter, one
//   displacement filter per glass surface, sized to it; the surface gets
//   data-lg-lens-on once its filter is in the page. Safari and Firefox keep
//   the blur alone.
// The chatbot's surfaces are found by their module classes, so its component
// stays as it is.
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import chat from "../FaqChatbot.module.scss";
import { whenIntroLeaves } from "../workbench/scenes/intro";

const SCROLLED_AT = 4;
/** How close (px) the pointer must come for a surface's light to follow it. */
const REACH = 160;
const MEDIA = new Set(["IMG", "VIDEO", "IFRAME", "PICTURE"]);

type Variant = "a" | "b";
type Lens = {
  id: string;
  w: number;
  h: number;
  r: number;
  bezel: number;
  scale: number;
  /** The map's blob: URL, once drawn. */
  href?: string;
};

const variantOf = (): Variant => (document.documentElement.dataset.lg === "b" ? "b" : "a");

function glassTargets(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      `[data-lg-glass], .${chat.toggleButton}, .${chat.greetingBubble}, .${chat.chatbotContainer}`,
    ),
  );
}

// ── What passes under the pill ──────────────────────────────────────────────

let probe: CanvasRenderingContext2D | null = null;
const colours = new Map<string, [number, number, number, number]>();

/** Any computed CSS colour as sRGB 0-255 and alpha 0-1, through a 1x1 canvas. */
function rgba(css: string): [number, number, number, number] {
  const known = colours.get(css);
  if (known) return known;
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  let out: [number, number, number, number] = [0, 0, 0, 0];
  if (probe) {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = css;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
    out = [r, g, b, a / 255];
  }
  colours.set(css, out);
  return out;
}

function luminance([r, g, b]: [number, number, number, number]) {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** "dense" when media, or a fill that stands apart from the page, lies at (x, y). */
function toneAt(x: number, y: number, page: number, skip: (el: Element) => boolean) {
  for (const el of document.elementsFromPoint(x, y)) {
    if (skip(el)) continue;
    if (MEDIA.has(el.tagName)) return "dense";
    const style = getComputedStyle(el);
    if (style.backgroundImage.includes("url(")) return "dense";
    const fill = rgba(style.backgroundColor);
    if (fill[3] >= 0.4) return Math.abs(luminance(fill) - page) > 0.12 ? "dense" : "base";
  }
  return "base";
}

function readTone() {
  const pill = document.querySelector<HTMLElement>('[data-lg-glass="pill"]');
  if (!pill) return;
  const box = pill.getBoundingClientRect();
  if (box.width === 0) return;
  const header = pill.closest("header");
  const wrapper = document.querySelector(`.${chat.chatbotWrapper}`);
  const skip = (el: Element) => !!(header?.contains(el) || wrapper?.contains(el));
  const page = luminance(
    rgba(getComputedStyle(document.documentElement).getPropertyValue("--wb-page").trim()),
  );
  const y = box.top + box.height / 2;
  const dense = [0.2, 0.5, 0.8].some(
    (at) => toneAt(box.left + box.width * at, y, page, skip) === "dense",
  );
  const tone = dense ? "dense" : "base";
  if (pill.dataset.lgTone !== tone) pill.dataset.lgTone = tone;
}

// ── The lens ────────────────────────────────────────────────────────────────

/**
 * A displacement map for a rounded box, drawn pixel by pixel (an SVG image
 * in feImage lost its inner shapes in Chromium): red moves the backdrop
 * sideways and green up and down, 128 leaves it in place. Within `bezel` of
 * the edge each pixel pulls the backdrop from further inside, along the
 * edge's normal and harder toward the edge, so the rim bends what lies
 * under it like the edge of a lens; the middle stays still. Only the band
 * along the edge is computed, and the PNG is encoded off the main thread.
 */
const maps = new Map<string, Promise<string>>();

function lensMap(lens: Lens) {
  const key = `${lens.w}x${lens.h}r${lens.r}b${lens.bezel}`;
  let map = maps.get(key);
  if (!map) {
    map = drawLensMap(lens);
    maps.set(key, map);
  }
  return map;
}

function drawLensMap({ w, h, r, bezel }: Lens): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve("");
  const img = ctx.createImageData(w, h);
  // Every pixel still (128, 128, 128, opaque) to start with.
  new Uint32Array(img.data.buffer).fill(0xff808080);
  const hw = w / 2;
  const hh = h / 2;
  const rr = Math.min(r, hw, hh);
  const band = Math.max(bezel, rr);
  for (let y = 0; y < h; y++) {
    const capRow = y < band || y >= h - band;
    for (let x = 0; x < w; x++) {
      // Along the straight sides only the outer `bezel` pixels bend.
      if (!capRow && x >= bezel && x < w - bezel) {
        x = w - bezel - 1;
        continue;
      }
      const px = x + 0.5 - hw;
      const py = y + 0.5 - hh;
      const qx = Math.abs(px) - (hw - rr);
      const qy = Math.abs(py) - (hh - rr);
      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const out = Math.hypot(ox, oy);
      // Distance from the edge, inward (the rounded box's signed distance).
      const depth = rr - out - Math.min(Math.max(qx, qy), 0);
      if (depth >= bezel || depth < -1) continue;
      const t = Math.min(1, 1 - depth / bezel);
      const m = t * t;
      let nx = 0;
      let ny = 0;
      if (out > 0) {
        nx = ox / out;
        ny = oy / out;
      } else if (qx > qy) nx = 1;
      else ny = 1;
      const i = (y * w + x) * 4;
      img.data[i] = Math.round(128 - 127 * Math.sign(px) * nx * m);
      img.data[i + 1] = Math.round(128 - 127 * Math.sign(py) * ny * m);
    }
  }
  ctx.putImageData(img, 0, 0);
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : ""), "image/png"),
  );
}

/** The lens of each surface: a contained one in variant a, a visible one in b. */
function lensFor(id: string, el: HTMLElement, variant: Variant): Lens {
  const w = Math.round(el.offsetWidth);
  const h = Math.round(el.offsetHeight);
  const radius = getComputedStyle(el).borderTopLeftRadius;
  const r = Math.min(
    radius.endsWith("%")
      ? (Number.parseFloat(radius) / 100) * Math.min(w, h)
      : Number.parseFloat(radius) || 0,
    Math.min(w, h) / 2,
  );
  const panel = id === "lg-panel" || id === "lg-bubble";
  if (variant === "a") return { id, w, h, r, bezel: panel ? 10 : 8, scale: 10 };
  const bezel = panel ? 16 : Math.min(14, Math.round(h * 0.34));
  return { id, w, h, r, bezel, scale: panel ? 24 : 28 };
}

// ── The component ───────────────────────────────────────────────────────────

const sameLens = (a: Lens, b: Lens) =>
  a.w === b.w && a.h === b.h && a.r === b.r && a.href === b.href;

/** Lets every surface whose filter is in the page use its lens. */
function markReady(ids: Set<string>) {
  for (const el of document.querySelectorAll<HTMLElement>("[data-lg-lens]")) {
    const on = ids.has(el.dataset.lgLens ?? "");
    if (on !== (el.dataset.lgLensOn !== undefined)) {
      if (on) el.dataset.lgLensOn = "";
      else delete el.dataset.lgLensOn;
    }
  }
}

export function GlassController() {
  const pathname = usePathname();
  const [lenses, setLenses] = useState<Lens[]>([]);
  const ready = useRef(new Set<string>());
  const scanRef = useRef<(() => void) | null>(null);
  // Adds or resizes one surface's lens, keeping the others.
  const upsert = (lens: Lens) =>
    setLenses((all) => {
      const old = all.find((l) => l.id === lens.id);
      if (old && sameLens(old, lens)) return all;
      return [...all.filter((l) => l.id !== lens.id), lens];
    });

  // Scroll state and the pill's tone.
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let toneTimer = 0;
    let lastTone = 0;

    const tone = () => {
      lastTone = performance.now();
      toneTimer = 0;
      readTone();
    };
    const update = () => {
      frame = 0;
      const scrolled = window.scrollY > SCROLLED_AT;
      if (root.hasAttribute("data-lg-scrolled") !== scrolled) {
        root.toggleAttribute("data-lg-scrolled", scrolled);
      }
      // At most every 150 ms while scrolling, and once when it stops.
      window.clearTimeout(toneTimer);
      const wait = Math.max(0, 150 - (performance.now() - lastTone));
      toneTimer = window.setTimeout(tone, wait);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const stopWaiting = whenIntroLeaves(schedule, { gone: true });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(toneTimer);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      stopWaiting();
    };
  }, []);

  // A new page: read what lies under the pill once it has painted.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on every navigation
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(readTone);
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [pathname]);

  // The light.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const variant = variantOf();
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    // How fast a light catches up with its target each frame: b lags more.
    const ease = variant === "b" ? 0.18 : 0.32;
    const state = new WeakMap<HTMLElement, { dx: number; dy: number; o: number }>();
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;

    const write = (el: HTMLElement, dx: number, dy: number, o: number) => {
      el.style.setProperty("--lg-dx", `${dx.toFixed(1)}px`);
      el.style.setProperty("--lg-dy", `${dy.toFixed(1)}px`);
      el.style.setProperty("--lg-o", o.toFixed(3));
    };

    const step = () => {
      frame = 0;
      const rest = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--lg-spot-rest"),
      );
      let moving = false;
      for (const el of glassTargets()) {
        const box = el.getBoundingClientRect();
        if (box.bottom < 0 || box.top > innerHeight || box.width === 0) continue;
        // The rest point is the light's place in CSS: 30% across, on the top edge.
        let tx = 0;
        let ty = 0;
        let to = rest;
        if (pointer) {
          const out = Math.hypot(
            Math.max(box.left - pointer.x, 0, pointer.x - box.right),
            Math.max(box.top - pointer.y, 0, pointer.y - box.bottom),
          );
          const near = Math.max(0, 1 - out / REACH) ** 2;
          const lx = Math.min(Math.max(pointer.x - box.left, 0), box.width);
          const ly = Math.min(Math.max(pointer.y - box.top, 0), box.height);
          tx = (lx - box.width * 0.3) * near;
          ty = ly * near;
          to = rest + (1 - rest) * near;
        }
        const now = state.get(el) ?? { dx: 0, dy: 0, o: rest };
        const next = {
          dx: now.dx + (tx - now.dx) * ease,
          dy: now.dy + (ty - now.dy) * ease,
          o: now.o + (to - now.o) * ease,
        };
        if (
          Math.abs(tx - next.dx) > 0.3 ||
          Math.abs(ty - next.dy) > 0.3 ||
          Math.abs(to - next.o) > 0.004
        ) {
          moving = true;
        } else {
          next.dx = tx;
          next.dy = ty;
          next.o = to;
        }
        state.set(el, next);
        write(el, next.dx, next.dy, next.o);
      }
      if (moving) frame = requestAnimationFrame(step);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };

    if (fine) {
      const move = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
        pointer = { x: event.clientX, y: event.clientY };
        schedule();
      };
      const leave = () => {
        pointer = null;
        schedule();
      };
      window.addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
      window.addEventListener("scroll", schedule, { passive: true });
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", move);
        document.documentElement.removeEventListener("pointerleave", leave);
        window.removeEventListener("scroll", schedule);
      };
    }

    // Touch screens: the light rests, except in variant b, where the pill's
    // light slides along it as the page scrolls.
    if (variant !== "b") return;
    let scrollFrame = 0;
    const slide = () => {
      scrollFrame = 0;
      const pill = document.querySelector<HTMLElement>('[data-lg-glass="pill"]');
      if (!pill) return;
      // From its rest point (30% across) to 90% and back, every 1600 px or so.
      const dx = 0.3 * (1 - Math.cos(window.scrollY / 260)) * pill.offsetWidth;
      pill.style.setProperty("--lg-dx", `${dx.toFixed(1)}px`);
    };
    const onScroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(slide);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // The lens, in Chromium only (navigator.userAgentData is Chromium's). Each
  // surface is measured when it appears or changes size; its map is drawn in
  // an idle moment, one surface at a time, and encoded off the main thread,
  // so the lens never weighs on loading. A surface takes its lens
  // (data-lg-lens-on) only once its filter is in the page: a missing filter
  // would drop the blur too.
  // biome-ignore lint/correctness/useExhaustiveDependencies: upsert only calls the state setter
  useEffect(() => {
    if (!("userAgentData" in navigator)) return;
    const variant = variantOf();
    let alive = true;
    const idle = typeof window.requestIdleCallback === "function";
    const later = (run: () => void) =>
      idle ? window.requestIdleCallback(run, { timeout: 3000 }) : window.setTimeout(run, 300);
    const queue = new Map<string, HTMLElement>();
    let pending = 0;

    const pump = () => {
      pending = 0;
      const next = queue.entries().next();
      if (next.done) return;
      const [id, el] = next.value;
      queue.delete(id);
      const lens = el.isConnected ? lensFor(id, el, variant) : null;
      if (lens && lens.w > 0 && lens.h > 0) {
        lensMap(lens).then((href) => {
          if (alive && href) upsert({ ...lens, href });
        });
      }
      if (queue.size > 0) pending = later(pump);
    };
    const sizes = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (el.dataset.lgLens) queue.set(el.dataset.lgLens, el);
      }
      if (queue.size > 0 && !pending) pending = later(pump);
    });
    const watch = (el: Element | null, id: string) => {
      if (!(el instanceof HTMLElement) || el.dataset.lgLens === id) return;
      el.dataset.lgLens = id;
      sizes.observe(el);
    };
    const scan = () => {
      watch(document.querySelector('[data-lg-glass="pill"]'), "lg-pill");
      // The play keys are all the same size and share one lens.
      for (const key of document.querySelectorAll('[data-lg-glass="play"]')) watch(key, "lg-play");
      watch(document.querySelector(`.${chat.toggleButton}`), "lg-launch");
      watch(document.querySelector(`.${chat.greetingBubble}`), "lg-bubble");
      watch(document.querySelector(`.${chat.chatbotContainer}`), "lg-panel");
      markReady(ready.current);
    };
    scanRef.current = scan;
    // The chatbot's greeting and panel come and go; the play keys arrive
    // with the pages that have videos (scanned again on every navigation).
    const changes = new MutationObserver(scan);
    const start = later(() => {
      scan();
      const wrapper = document.querySelector(`.${chat.chatbotWrapper}`);
      if (wrapper) changes.observe(wrapper, { childList: true });
    });
    return () => {
      alive = false;
      scanRef.current = null;
      for (const handle of [start, pending]) {
        if (idle) window.cancelIdleCallback(handle);
        else window.clearTimeout(handle);
      }
      changes.disconnect();
      sizes.disconnect();
      for (const el of document.querySelectorAll<HTMLElement>("[data-lg-lens]")) {
        delete el.dataset.lgLens;
        delete el.dataset.lgLensOn;
      }
    };
  }, []);

  // A new page may bring play keys.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on every navigation
  useEffect(() => {
    scanRef.current?.();
  }, [pathname]);

  // Filters in the page: their surfaces may use them now.
  useEffect(() => {
    ready.current = new Set(lenses.map((lens) => lens.id));
    markReady(ready.current);
  }, [lenses]);

  if (lenses.length === 0) return null;
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        {lenses.map((lens) => (
          <filter
            key={lens.id}
            id={lens.id}
            x="0"
            y="0"
            width={lens.w}
            height={lens.h}
            filterUnits="userSpaceOnUse"
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={lens.href}
              x="0"
              y="0"
              width={lens.w}
              height={lens.h}
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={lens.scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        ))}
      </defs>
    </svg>
  );
}

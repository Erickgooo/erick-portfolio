// Design capture: screenshots plus measurements of the site as it renders right now.
//
//   node scripts/design/capture.mjs --base http://localhost:3111 --out docs/design/screens/after [--home-path /]
//
// Needs a server already running at --base (production build: `npm run build`,
// then `npx next start -p 3111`). Writes PNG/JPEG screenshots, metrics.json and
// metrics.md into --out. Nothing in the site is modified: the page is only read,
// and the only things injected are a constructed stylesheet (to hide text for a
// second screenshot, so the real pixels behind it can be measured) and inline
// styles on fixed and sticky chrome while the full-page image is stitched, which
// are removed again straight after each band.
//
// The Home it expects: a film in [data-film-root] whose text all sits on opaque
// surfaces ([data-opaque]: the hero band and the [data-seat] title cards), with
// empty [data-film-beat] stretches between the cards. The only text left over
// footage is the header's side labels ([data-header-side]), so those are
// measured at every position of the scroll.
//
// Options
//   --home-path /lab?v=a   route used for everything Home-specific (default "/")
//   --only home,work,scan,rm   run a subset: home | scan | rm | work | case-study |
//                              case-clip | about | blog | blog-post | gallery | 404 | locked
//                              (`scan` is the pass along the film: nav labels and film background)
//   --film-steps 40        scroll positions along the film
//   --film-dense 240       extra positions, so short flashes are not missed (0 = off)
//   --case /work/<slug>    case study route (default /work/quick-metal-shop-viral-videos)
//   --clip /work/<slug>    case study with a video clip (default /work/leadbot-ai)
//   --post /blog/<slug>    blog post route (default /blog/my-workspace)
//   --compare <file>       metrics.json of an earlier run for the before/after section
//                          (default: ../before/metrics.json next to --out, when it exists)
//   --debug                also keep the text-hidden frames in <out>/_debug
//   --summary-only         rewrite metrics.md from the metrics.json already in --out (no browser)
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, devices } from "@playwright/test";

// ─── Arguments ──────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const BASE = String(args.base ?? "http://localhost:3111").replace(/\/$/, "");
const OUT = path.resolve(String(args.out ?? "docs/design/screens/after"));
const COMPARE = path.resolve(String(args.compare ?? path.join(OUT, "..", "before", "metrics.json")));
const HOME_PATH = String(args["home-path"] ?? "/");
const FILM_STEPS = Number(args["film-steps"] ?? 40);
const FILM_DENSE = Number(args["film-dense"] ?? 240);
const DEBUG = Boolean(args.debug);
const ONLY = args.only ? new Set(String(args.only).split(",")) : null;
const wants = (name) => !ONLY || ONLY.has(name);

const VIEWPORTS = [
  {
    name: "390",
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: devices["Pixel 7"].userAgent,
    minTarget: 44,
  },
  { name: "1440", width: 1440, height: 900, deviceScaleFactor: 1, minTarget: 28 },
];
const THEMES = ["light", "dark"];
const PAGES = [
  { name: "work", path: "/work" },
  { name: "case-study", path: String(args.case ?? "/work/quick-metal-shop-viral-videos") },
  { name: "case-clip", path: String(args.clip ?? "/work/leadbot-ai") },
  { name: "about", path: "/about" },
  { name: "blog", path: "/blog" },
  { name: "blog-post", path: String(args.post ?? "/blog/my-workspace") },
  { name: "gallery", path: "/gallery" },
  { name: "404", path: "/this-page-does-not-exist" },
  { name: "locked", path: "/unauthorized" },
];
/** Home frames shot again under reduced motion. */
const RM_FRAMES = ["hero-top", "after-brand", "brand", "after-content"];
/** Fraction of an empty film stretch's own height that is scrolled past before its frame is shot. */
const BEAT_PROGRESS = 0.35;

mkdirSync(OUT, { recursive: true });
if (DEBUG) mkdirSync(path.join(OUT, "_debug"), { recursive: true });

let sharp = null;
try {
  // CAPTURE_NO_SHARP=1 forces the fallback, to check it still works.
  if (!process.env.CAPTURE_NO_SHARP) sharp = (await import("sharp")).default;
} catch {
  // Decoding falls back to a canvas in a helper page (see decodePng).
}

const notes = [];
const note = (text) => {
  if (!notes.includes(text)) notes.push(text);
  console.log(`  note: ${text}`);
};
const log = (text) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${text}`);

// ─── In-page library ────────────────────────────────────────────────────────
// Serialised into every document before its own scripts run. Read-only apart
// from the stylesheet modes and chromeOff/chromeOn described at the top.
function capLib() {
  if (window.top !== window || window.__cap) return;
  const cap = {};
  window.__cap = cap;
  const ids = new WeakMap();
  let seq = 0;
  const idOf = (el) => {
    let id = ids.get(el);
    if (!id) {
      id = ++seq;
      ids.set(el, id);
    }
    return id;
  };
  const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
  const VIS = { checkVisibilityCSS: true, contentVisibilityAuto: true };
  const COLOR_RE =
    /rgba?\([^()]*\)|color\([^()]*\)|(?:oklch|oklab|lab|lch|hsla?|hwb)\([^()]*\)|#[0-9a-f]{3,8}\b/gi;

  let canvasCtx = null;
  function parseColor(input) {
    const s = String(input || "").trim();
    if (!s || s === "transparent") return [0, 0, 0, 0];
    const alphaOf = (a) => (a === undefined ? 1 : a.endsWith("%") ? parseFloat(a) / 100 : +a);
    let m = s.match(
      /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/,
    );
    if (m) return [+m[1], +m[2], +m[3], alphaOf(m[4])];
    m = s.match(
      /^color\(srgb\s+([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i,
    );
    if (m) return [m[1] * 255, m[2] * 255, m[3] * 255, alphaOf(m[4])];
    if (!canvasCtx) {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      canvasCtx = canvas.getContext("2d", { willReadFrequently: true });
    }
    canvasCtx.clearRect(0, 0, 1, 1);
    canvasCtx.fillStyle = "#000";
    canvasCtx.fillStyle = s;
    canvasCtx.fillRect(0, 0, 1, 1);
    const d = canvasCtx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  }

  function desc(el) {
    let s = el.tagName.toLowerCase();
    if (el.id) s += `#${el.id}`;
    const classes = (el.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean);
    const moduleClasses = classes.filter((c) => /__[\w-]+$/.test(c));
    for (const c of (moduleClasses.length ? moduleClasses : classes).slice(0, 3)) s += `.${c}`;
    for (const a of el.attributes) {
      if (!a.name.startsWith("data-") || a.name.startsWith("data-cap") || s.length > 90) continue;
      s += `[${a.name}${a.value ? `=${a.value.slice(0, 24)}` : ""}]`;
    }
    return s.slice(0, 140);
  }
  function pathOf(el, depth = 3) {
    const parts = [];
    for (let e = el.parentElement; e && e !== document.body && parts.length < depth; ) {
      parts.unshift(desc(e));
      e = e.parentElement;
    }
    return parts.join(" > ");
  }
  cap.desc = desc;

  // ── Stylesheet modes ──
  // The site's own stylesheets use !important too (Once UI greys every link's
  // underline that way), and between two !important rules the more specific
  // one wins. `:is(*, #_#_#_)` still matches every element, with the weight of
  // three ids.
  const ALL = ":is(*,#_#_#_)";
  const EVERY = `${ALL},${ALL}::before,${ALL}::after,${ALL}::marker,${ALL}::placeholder`;
  const NO_TRANSITION = `${ALL},${ALL}::before,${ALL}::after{transition:none!important}`;
  const MODES = {
    "": "",
    noTransition: NO_TRANSITION,
    // Text and everything drawn in the text colour disappears; panels, pills and
    // marker underlines stay, because they are the background the text sits on.
    hideText: `${NO_TRANSITION}${EVERY}{color:transparent!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke-color:transparent!important;-webkit-text-stroke-width:0!important;text-shadow:none!important;text-decoration-color:transparent!important;caret-color:transparent!important}[data-cap-clip]${ALL}{background-image:none!important;background-color:transparent!important}`,
    // Only the film stage (video, veil, glow) is painted.
    filmOnly: `${NO_TRANSITION}body *{visibility:hidden!important}[data-film-stage],[data-film-stage] *{visibility:visible!important}`,
    // Every glyph in one loud colour: compared with the text-hidden frame, it shows which pixels the text covers.
    markText: `${NO_TRANSITION}${EVERY}{color:#ff00ff!important;-webkit-text-fill-color:#ff00ff!important;-webkit-text-stroke-width:0!important;text-shadow:none!important}`,
  };
  let sheet = null;
  cap.mode = (name) => {
    if (!sheet) {
      sheet = new CSSStyleSheet();
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    }
    for (const el of document.querySelectorAll("[data-cap-clip]")) {
      el.removeAttribute("data-cap-clip");
    }
    if (name === "hideText") {
      for (const el of document.querySelectorAll("body *")) {
        const clip = getComputedStyle(el).backgroundClip || "";
        if (clip.split(",").some((v) => v.trim() === "text")) el.setAttribute("data-cap-clip", "");
      }
    }
    sheet.replaceSync(MODES[name] ?? "");
    void document.body.offsetHeight;
  };
  /** Back to normal without the text fading back in through its own colour transition. */
  cap.restore = async () => {
    cap.mode("noTransition");
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    cap.mode("");
  };

  // For the stitched full-page image: fixed chrome is painted once, in the first
  // band if it fits there entirely (a top bar) or else in the last one (a bottom
  // bar, the chatbot); sticky boxes go back to where they sit in the flow. This is
  // what a single tall render of the page would show. Full-screen fixed layers
  // (the page backdrop) are left alone.
  let touched = [];
  const shown = new WeakSet();
  /** Union of an element's box and its visible descendants' boxes, or null if nothing has a size. */
  const paintedBox = (el) => {
    let box = null;
    for (const e of [el, ...el.querySelectorAll("*")]) {
      if (!e.checkVisibility(VIS)) continue;
      const r = e.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      box = box
        ? [Math.min(box[0], r.left), Math.min(box[1], r.top), Math.max(box[2], r.right), Math.max(box[3], r.bottom)]
        : [r.left, r.top, r.right, r.bottom];
    }
    return box;
  };
  const override = (el, props) => {
    touched.push([el, Object.keys(props).map((k) => [k, el.style.getPropertyValue(k), el.style.getPropertyPriority(k)])]);
    for (const [k, v] of Object.entries(props)) el.style.setProperty(k, v, "important");
  };
  cap.chromeOff = ({ keepAbove = null, keepBelow = null } = {}) => {
    cap.mode("noTransition");
    const area = innerWidth * innerHeight;
    const kept = [];
    const removed = [];
    const fixed = new Set();
    for (const el of document.querySelectorAll("body *")) {
      const position = getComputedStyle(el).position;
      if (position === "sticky") {
        override(el, { position: "relative", inset: "auto" });
        continue;
      }
      if (position !== "fixed") continue;
      // Only the outermost fixed box decides; what is nested in it follows.
      let nested = false;
      for (let e = el.parentElement; e; e = e.parentElement) {
        if (fixed.has(e)) nested = true;
      }
      fixed.add(el);
      if (nested) continue;
      const own = el.getBoundingClientRect();
      if (own.width * own.height > area * 0.5) continue;
      // A fixed wrapper is often an empty box whose content overflows it.
      const r = paintedBox(el);
      if (!r) continue;
      const fits =
        (keepAbove !== null && r[3] <= keepAbove) || (keepBelow !== null && r[1] >= keepBelow);
      if (fits && !shown.has(el)) {
        shown.add(el);
        kept.push(desc(el));
        continue;
      }
      if (!shown.has(el)) removed.push(desc(el));
      override(el, { visibility: "hidden" });
    }
    void document.body.offsetHeight;
    return { kept, removed };
  };
  cap.chromeOn = () => {
    for (const [el, props] of touched.reverse()) {
      for (const [k, value, priority] of props) {
        if (value) el.style.setProperty(k, value, priority);
        else el.style.removeProperty(k);
      }
    }
    touched = [];
    cap.mode("");
  };

  // ── Waiting ──
  /** Finite animations and transitions on the document timeline have finished. */
  cap.animationsIdle = () =>
    document.getAnimations().every((a) => {
      if (a.timeline !== document.timeline) return true;
      const timing = a.effect?.getComputedTiming();
      if (!timing || !Number.isFinite(timing.endTime)) return true;
      return a.playState === "finished" || a.playState === "idle";
    });
  cap.imagesReady = () => {
    for (const img of document.images) {
      const r = img.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) continue;
      if (!img.checkVisibility()) continue;
      if (!img.complete) return false;
    }
    return true;
  };
  /** The film has stopped moving: no seek in flight, time and veil unchanged for 250 ms. */
  cap.filmSettled = async (timeoutMs = 5000) => {
    const root = document.querySelector("[data-film-root]");
    const video = document.querySelector("[data-film-video]");
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    if (!root) return { film: false };
    const started = performance.now();
    let lastTime = -1;
    let lastVeil = "";
    let stableSince = started;
    let settled = false;
    while (performance.now() - started < timeoutMs) {
      await frame();
      const time = video ? video.currentTime : 0;
      const veil = root.style.getPropertyValue("--film-veil");
      if (time !== lastTime || veil !== lastVeil || video?.seeking) {
        lastTime = time;
        lastVeil = veil;
        stableSince = performance.now();
      } else if (performance.now() - stableSince > 250) {
        settled = true;
        break;
      }
    }
    await frame();
    await frame();
    return cap.filmState(settled);
  };
  cap.filmState = (settled) => {
    const root = document.querySelector("[data-film-root]");
    if (!root) return { film: false };
    const video = document.querySelector("[data-film-video]");
    const stage = document.querySelector("[data-film-stage]");
    const img = stage?.querySelector("img");
    let beat = "";
    for (const section of root.querySelectorAll("[data-film-beat]")) {
      if (section.getBoundingClientRect().top <= 0) beat = section.dataset.filmBeat;
    }
    return {
      film: true,
      settled,
      ready: root.hasAttribute("data-film-ready"),
      veil: getComputedStyle(root).getPropertyValue("--film-veil").trim(),
      beat,
      scrollY: Math.round(scrollY),
      progress: root.style.getPropertyValue("--film-progress") || null,
      stageTop: stage ? Math.round(stage.getBoundingClientRect().top) : null,
      navOverCard: document.documentElement.hasAttribute("data-nav-over-card"),
      pastFilm: document.documentElement.hasAttribute("data-past-film"),
      video: video
        ? {
            time: round(video.currentTime, 3),
            seeking: video.seeking,
            readyState: video.readyState,
            hasSrc: Boolean(video.currentSrc),
            blob: video.currentSrc.startsWith("blob:"),
            width: video.videoWidth,
            height: video.videoHeight,
            opacity: getComputedStyle(video).opacity,
          }
        : null,
      still: img ? (img.currentSrc || img.src).replace(location.origin, "") : null,
      stillLoaded: img ? img.complete && img.naturalWidth > 0 : null,
    };
  };

  // ── Text ──
  const BLOCK_SEL =
    "h1,h2,h3,h4,h5,h6,p,li,a,button,summary,label,blockquote,figcaption,dt,dd,th,td,legend,caption";
  const SKIP_SEL = "svg,script,style,noscript,template,select,iframe,object,title";

  /** Elements that own text directly, with their text nodes. */
  function leaves() {
    const map = new Map();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.nodeValue || !node.nodeValue.trim()) continue;
      const el = node.parentElement;
      if (!el || el.closest(SKIP_SEL)) continue;
      const list = map.get(el);
      if (list) list.push(node);
      else map.set(el, [node]);
    }
    return map;
  }
  // Inside the film, "surface" is text on an opaque band or card and "film" is
  // text straight on the footage.
  const regionOf = (el) =>
    el.closest('[class*="FaqChatbot"]')
      ? "chatbot"
      : el.closest("header")
        ? "header"
        : el.closest("footer")
          ? "footer"
          : el.closest("[data-film-root]")
            ? el.closest("[data-film-root] [data-opaque]")
              ? "surface"
              : "film"
            : "main";
  const surfaceId = (el) => (el.dataset.seat ? `card:${el.dataset.seat}` : "hero-band");

  /**
   * What lies under a horizontal strip of the viewport (the header's labels):
   * an opaque surface of the Home ("card"), the film ("film"), the boundary
   * between two of them ("edge"), or the ordinary page.
   */
  cap.underBox = (top, bottom) => {
    const root = document.querySelector("[data-film-root]");
    if (!root) return { kind: "page" };
    const height = bottom - top;
    let best = null;
    for (const surface of root.querySelectorAll("[data-opaque]")) {
      const r = surface.getBoundingClientRect();
      const share = (Math.min(bottom, r.bottom) - Math.max(top, r.top)) / height;
      if (share > 0 && (!best || share > best.share)) best = { share, id: surfaceId(surface) };
    }
    const rr = root.getBoundingClientRect();
    const filmShare = Math.max(0, Math.min(bottom, rr.bottom) - Math.max(top, rr.top)) / height;
    if (best && best.share >= 0.999) return { kind: "card", surface: best.id };
    if (best) return { kind: "edge", surface: best.id, surfaceShare: round(best.share, 2) };
    if (filmShare >= 0.999) {
      // Pinned, the stage's top fade is under the labels; once it scrolls away it is not.
      const stage = root.querySelector("[data-film-stage]").getBoundingClientRect();
      return { kind: "film", stagePinned: Math.abs(stage.top) < 1, offsetInStage: Math.round(top - stage.top) };
    }
    if (filmShare > 0) return { kind: "edge", surface: "film-end", surfaceShare: round(1 - filmShare, 2) };
    return { kind: "page" };
  };

  /**
   * Visible text, grouped: leaves that share a block container (heading,
   * paragraph, link…) and an identical paint and type style are one entry, so a
   * heading split into one span per word is reported once.
   *
   * mode "viewport": everything at least `minVisible` inside the viewport.
   * mode "band": entries whose centre lies in [bandTop, bandBottom) of the page,
   *              plus everything in fixed chrome.
   */
  cap.collectText = (opts = {}) => {
    const { mode = "viewport", bandTop = 0, bandBottom = Infinity, minVisible = 0.25 } = opts;
    const vw = innerWidth;
    const vh = innerHeight;
    const styles = new Map();
    const cs = (el) => {
      let s = styles.get(el);
      if (!s) {
        s = getComputedStyle(el);
        styles.set(el, s);
      }
      return s;
    };
    const opacities = new Map();
    const opacityOf = (el) => {
      if (!el || el.nodeType !== 1) return 1;
      if (opacities.has(el)) return opacities.get(el);
      const own = parseFloat(cs(el).opacity);
      const value = (Number.isNaN(own) ? 1 : own) * opacityOf(el.parentElement);
      opacities.set(el, value);
      return value;
    };
    const clips = new Map();
    const clipOf = (el) => {
      if (!el || el === document.body || el === document.documentElement) {
        return [-1e9, -1e9, 1e9, 1e9];
      }
      if (clips.has(el)) return clips.get(el);
      const clip = clipOf(el.parentElement).slice();
      const s = cs(el);
      if (s.overflowX !== "visible" || s.overflowY !== "visible") {
        const r = el.getBoundingClientRect();
        if (s.overflowX !== "visible") {
          clip[0] = Math.max(clip[0], r.left);
          clip[2] = Math.min(clip[2], r.right);
        }
        if (s.overflowY !== "visible") {
          clip[1] = Math.max(clip[1], r.top);
          clip[3] = Math.min(clip[3], r.bottom);
        }
      }
      clips.set(el, clip);
      return clip;
    };
    const fixedOf = (el) => {
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
        if (cs(e).position === "fixed") return true;
      }
      return false;
    };
    const isClipText = (el) =>
      (cs(el).backgroundClip || "").split(",").some((v) => v.trim() === "text");

    const groups = new Map();
    const range = document.createRange();
    for (const [el, nodes] of leaves()) {
      if (!el.checkVisibility(VIS)) continue;
      const clip = clipOf(el);
      const rects = [];
      for (const node of nodes) {
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) {
          const x0 = Math.max(r.left, clip[0]);
          const y0 = Math.max(r.top, clip[1]);
          const x1 = Math.min(r.right, clip[2]);
          const y1 = Math.min(r.bottom, clip[3]);
          if (x1 - x0 >= 1 && y1 - y0 >= 1) rects.push([x0, y0, x1, y1]);
        }
      }
      if (!rects.length) continue;

      const s = cs(el);
      const container = el.closest(BLOCK_SEL) || el;
      const fill = parseColor(s.webkitTextFillColor || s.color);
      const strokeWidth = parseFloat(s.webkitTextStrokeWidth) || 0;
      const stroke = strokeWidth > 0 ? parseColor(s.webkitTextStrokeColor) : null;
      let clipEl = null;
      for (let e = el; e; e = e.parentElement) {
        if (isClipText(e)) {
          clipEl = e;
          break;
        }
        if (e === container) break;
      }
      let paint;
      if (clipEl && fill[3] < 0.05) {
        const image = cs(clipEl).backgroundImage;
        const stops = image && image !== "none" ? (image.match(COLOR_RE) || []).map(parseColor) : [];
        if (!stops.length) {
          const solid = parseColor(cs(clipEl).backgroundColor);
          if (solid[3] > 0) stops.push(solid);
        }
        paint = { kind: "gradient", raw: String(image).slice(0, 240), stops };
      } else if (fill[3] < 0.05 && stroke && stroke[3] > 0) {
        paint = { kind: "stroke", color: stroke, strokeWidth };
      } else if (fill[3] < 0.05) {
        paint = { kind: "none", color: fill };
      } else {
        paint = { kind: "solid", color: fill };
      }
      const ownImage = !isClipText(el) && s.backgroundImage !== "none" ? s.backgroundImage : "";
      const opacity = opacityOf(el);
      const family = s.fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "");
      const signature = [
        paint.kind,
        JSON.stringify(paint.color || paint.stops),
        s.fontSize,
        s.fontWeight,
        family,
        s.letterSpacing,
        s.fontStyle,
        s.textTransform,
        round(opacity, 2),
        ownImage ? 1 : 0,
      ].join("|");
      const key = `${idOf(container)}|${signature}`;
      let group = groups.get(key);
      if (!group) {
        group = { key, el, container, s, paint, opacity, family, ownImage, texts: [], rects: [] };
        groups.set(key, group);
      }
      group.texts.push(nodes.map((n) => n.nodeValue).join(" "));
      group.rects.push(...rects);
    }

    const out = [];
    for (const g of groups.values()) {
      let x0 = 1e9;
      let y0 = 1e9;
      let x1 = -1e9;
      let y1 = -1e9;
      let total = 0;
      let inside = 0;
      const pixelRects = [];
      for (const [a, b, c, d] of g.rects) {
        x0 = Math.min(x0, a);
        y0 = Math.min(y0, b);
        x1 = Math.max(x1, c);
        y1 = Math.max(y1, d);
        total += (c - a) * (d - b);
        const ia = Math.max(a, 0);
        const ib = Math.max(b, 0);
        const ic = Math.min(c, vw);
        const id = Math.min(d, vh);
        if (ic - ia >= 1 && id - ib >= 1) {
          inside += (ic - ia) * (id - ib);
          pixelRects.push([Math.floor(ia), Math.floor(ib), Math.ceil(ic), Math.ceil(id)]);
        }
      }
      const visibleFraction = total ? inside / total : 0;
      const centreY = (y0 + y1) / 2 + scrollY;
      const fixed = fixedOf(g.el);
      if (mode === "viewport" && visibleFraction < minVisible) continue;
      if (mode === "band") {
        if (fixed ? visibleFraction < 0.5 : centreY < bandTop || centreY >= bandBottom) continue;
        if (!pixelRects.length) continue;
      }

      const { el, s } = g;
      const fontSize = parseFloat(s.fontSize);
      const letterSpacingPx = s.letterSpacing === "normal" ? 0 : parseFloat(s.letterSpacing) || 0;
      const lineHeightPx = s.lineHeight === "normal" ? null : parseFloat(s.lineHeight);

      // Nearest thing painted directly behind the text by an ancestor, inside the film if there is one.
      let surface = null;
      let surfaceOpen = true;
      let backdrop = null;
      const layers = [];
      let complex = null;
      let opaque = false;
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
        const es = cs(e);
        const clipText = isClipText(e);
        const colour = clipText ? [0, 0, 0, 0] : parseColor(es.backgroundColor);
        const image = !clipText && es.backgroundImage !== "none" ? es.backgroundImage : "";
        const blur = es.backdropFilter && es.backdropFilter !== "none" ? es.backdropFilter : "";
        if (blur && !backdrop) backdrop = { el: desc(e), value: blur };
        // The film stage covers whatever the film root's own ancestors paint.
        if (e.hasAttribute("data-film-root") || e === document.body) surfaceOpen = false;
        if (!surface && surfaceOpen && (colour[3] > 0.02 || image || blur)) {
          surface = {
            el: desc(e),
            backgroundColor: es.backgroundColor,
            backgroundImage: image.slice(0, 160) || "none",
            backdropFilter: blur || "none",
            borderRadius: es.borderTopLeftRadius,
          };
        }
        if (!opaque) {
          if (blur) complex = complex || "backdrop-filter";
          if (image) complex = complex || "background-image";
          if (colour[3] > 0) {
            layers.push(colour);
            if (colour[3] >= 0.999) opaque = true;
          }
        }
      }
      let base = opaque ? layers.pop().slice(0, 3) : [255, 255, 255];
      for (let i = layers.length - 1; i >= 0; i--) {
        const [r, gg, b, a] = layers[i];
        base = [r * a + base[0] * (1 - a), gg * a + base[1] * (1 - a), b * a + base[2] * (1 - a)];
      }
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      if (!opaque && cx >= 0 && cx < vw && cy >= 0 && cy < vh) {
        for (const other of document.elementsFromPoint(cx, cy)) {
          if (other === el || other.contains(el) || el.contains(other)) continue;
          if (/^(IMG|VIDEO|CANVAS|PICTURE|IFRAME)$/.test(other.tagName)) {
            complex = complex || "over-media";
            break;
          }
          const os = cs(other);
          if (os.backgroundImage !== "none") {
            complex = complex || "over-background-image";
            break;
          }
          if (parseColor(os.backgroundColor)[3] > 0.02) {
            complex = complex || "over-sibling-background";
            break;
          }
        }
      }

      let clipPath = "";
      for (let e = el, i = 0; e && i < 4; e = e.parentElement, i++) {
        const value = cs(e).clipPath;
        if (value && value !== "none") {
          clipPath = value;
          break;
        }
      }
      const inset = clipPath.match(/^inset\(([\d.]+)%/);
      const beat = el.closest("[data-film-beat]");
      const landing = el.closest("[data-landing-section]");
      const opaqueSurface = el.closest("[data-film-root] [data-opaque]");
      const side = el.closest("[data-header-side]");
      const sides = side ? [...document.querySelectorAll("[data-header-side]")] : [];
      const text = g.texts.join(" ").replace(/\s+/g, " ").trim();
      out.push({
        key: g.key,
        text: text.slice(0, 60),
        textLength: text.length,
        tag: (g.container || el).tagName.toLowerCase(),
        el: desc(el),
        container: g.container !== el ? desc(g.container) : undefined,
        path: pathOf(el),
        region: regionOf(el),
        beat: beat ? beat.dataset.filmBeat : undefined,
        onSurface: opaqueSurface ? surfaceId(opaqueSurface) : undefined,
        headerSide: side ? (sides.indexOf(side) === 0 ? "left" : "right") : undefined,
        under: side ? cap.underBox(y0, y1) : undefined,
        landing: landing ? landing.dataset.landingSection : undefined,
        fixed,
        paint: g.paint,
        color: s.color,
        fontFamily: g.family,
        fontSize,
        fontWeight: Number(s.fontWeight) || s.fontWeight,
        letterSpacingPx: round(letterSpacingPx, 3),
        letterSpacingEm: fontSize ? round(letterSpacingPx / fontSize, 4) : 0,
        lineHeight: s.lineHeight,
        lineHeightRatio: lineHeightPx && fontSize ? round(lineHeightPx / fontSize, 3) : null,
        textTransform: s.textTransform !== "none" ? s.textTransform : undefined,
        opacity: round(g.opacity, 3),
        marker: g.ownImage ? g.ownImage.slice(0, 120) : undefined,
        bbox: { x: round(x0, 1), y: round(y0, 1), w: round(x1 - x0, 1), h: round(y1 - y0, 1) },
        pageY: Math.round(y0 + scrollY),
        rectCount: g.rects.length,
        visibleFraction: round(visibleFraction, 2),
        surface,
        backdrop,
        domBackground: { rgb: base.map(Math.round), complex, opaqueAncestor: opaque },
        ariaHidden: el.closest('[aria-hidden="true"]') ? true : undefined,
        clipPath: clipPath || undefined,
        clippedAway: inset && parseFloat(inset[1]) >= 99 ? true : undefined,
        rects: pixelRects.slice(0, 80),
      });
    }
    return out;
  };

  // ── Type inventory ──
  cap.typeInventory = () => {
    const combos = new Map();
    const families = new Map();
    let smallest = Infinity;
    let where = [];
    let total = 0;
    // A heading split into one span per word is one use of its style, not fourteen.
    const counted = new Set();
    const range = document.createRange();
    for (const [el, nodes] of leaves()) {
      if (!el.checkVisibility(VIS)) continue;
      range.selectNodeContents(nodes[0]);
      const r = range.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const s = getComputedStyle(el);
      const text = nodes.map((n) => n.nodeValue).join(" ").replace(/\s+/g, " ").trim();
      const fontSize = round(parseFloat(s.fontSize), 2);
      const spacing = s.letterSpacing === "normal" ? 0 : parseFloat(s.letterSpacing) || 0;
      const em = fontSize ? round(spacing / fontSize, 3) : 0;
      const family = s.fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "");
      const lineHeight = s.lineHeight === "normal" ? "normal" : round(parseFloat(s.lineHeight) / fontSize, 2);
      const key = `${fontSize}|${s.fontWeight}|${em}`;
      const use = `${idOf(el.closest(BLOCK_SEL) || el)}|${key}|${family}`;
      const first = !counted.has(use);
      counted.add(use);
      if (first) total++;
      let combo = combos.get(key);
      if (!combo) {
        combo = {
          fontSize,
          fontWeight: Number(s.fontWeight) || s.fontWeight,
          letterSpacingEm: em,
          count: 0,
          chars: 0,
          families: [],
          lineHeights: [],
          sample: { text: text.slice(0, 50), el: desc(el), region: regionOf(el) },
        };
        combos.set(key, combo);
      }
      if (first) combo.count++;
      combo.chars += text.length;
      if (!combo.families.includes(family)) combo.families.push(family);
      if (!combo.lineHeights.includes(lineHeight) && combo.lineHeights.length < 6) {
        combo.lineHeights.push(lineHeight);
      }
      const fam = families.get(family) || { family, declared: s.fontFamily.slice(0, 160), count: 0, chars: 0 };
      if (first) fam.count++;
      fam.chars += text.length;
      families.set(family, fam);
      if (!fam.marked && !document.querySelector(`[data-cap-font="${families.size}"]`)) {
        fam.marked = String(families.size);
        el.setAttribute("data-cap-font", fam.marked);
      }
      if (fontSize < smallest) {
        smallest = fontSize;
        where = [];
      }
      if (fontSize === smallest && where.length < 8) {
        where.push({ text: text.slice(0, 50), el: desc(el), region: regionOf(el) });
      }
    }
    return {
      textElements: total,
      families: [...families.values()].sort((a, b) => b.count - a.count),
      combos: [...combos.values()].sort((a, b) => b.fontSize - a.fontSize || b.count - a.count),
      distinctSizes: [...new Set([...combos.values()].map((c) => c.fontSize))].sort((a, b) => b - a),
      smallest: { fontSize: smallest === Infinity ? null : smallest, where },
    };
  };
  cap.clearFontMarks = () => {
    for (const el of document.querySelectorAll("[data-cap-font]")) el.removeAttribute("data-cap-font");
  };

  // ── Hit targets ──
  const INTERACTIVE =
    'a[href],button,summary,input:not([type="hidden"]),select,textarea,[role="button"],[role="link"],[role="tab"],[role="switch"],[role="checkbox"],[role="menuitem"]';
  function accessibleName(el) {
    const label = el.getAttribute("aria-label");
    if (label?.trim()) return { name: label.trim(), source: "aria-label" };
    const labelledby = el.getAttribute("aria-labelledby");
    if (labelledby) {
      const text = labelledby
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent || "")
        .join(" ")
        .trim();
      if (text) return { name: text, source: "aria-labelledby" };
    }
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) {
      const text = el.labels?.[0]?.textContent?.trim();
      if (text) return { name: text, source: "label" };
      if (/^(submit|button|reset)$/.test(el.type) && el.value) return { name: el.value, source: "value" };
      if (el.title) return { name: el.title, source: "title" };
      if (el.placeholder) return { name: el.placeholder, source: "placeholder only" };
      return { name: "", source: "" };
    }
    const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
    if (text) return { name: text, source: "text" };
    const img = el.querySelector('img[alt]:not([alt=""])');
    if (img) return { name: img.alt, source: "img alt" };
    const svg = el.querySelector("svg[aria-label], svg title");
    if (svg) return { name: svg.getAttribute("aria-label") || svg.textContent || "", source: "svg" };
    if (el.title) return { name: el.title, source: "title" };
    return { name: "", source: "" };
  }
  cap.hitTargets = (min) => {
    const small = [];
    const unnamed = [];
    let total = 0;
    for (const el of document.querySelectorAll(INTERACTIVE)) {
      if (!el.checkVisibility(VIS)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      total++;
      const s = getComputedStyle(el);
      const { name, source } = accessibleName(el);
      const ownText = (el.textContent || "").trim();
      const iconOnly = !ownText && Boolean(el.querySelector("svg,img,i"));
      const block = el.parentElement?.closest("p,li,div,section,article,span");
      const inline =
        s.display === "inline" &&
        Boolean(block) &&
        (block.textContent || "").trim().length > ownText.length + 12;
      const entry = {
        el: desc(el),
        path: pathOf(el, 2),
        label: name.slice(0, 60),
        nameSource: source,
        w: round(r.width, 1),
        h: round(r.height, 1),
        pageY: Math.round(r.top + scrollY),
        region: regionOf(el),
        inlineInText: inline || undefined,
        iconOnly: iconOnly || undefined,
        href: el.getAttribute("href")?.slice(0, 80) || undefined,
      };
      if (r.width < min || r.height < min) small.push(entry);
      if (!name) unnamed.push(entry);
    }
    return { min, total, small, unnamed };
  };

  // ── Overlaps with the chatbot and the nav bar ──
  cap.overlaps = () => {
    const vw = innerWidth;
    const vh = innerHeight;
    const blockers = [];
    const add = (name, el) => {
      if (!el || !el.checkVisibility(VIS)) return;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.top >= vh) return;
      blockers.push({ name, el, rect: [r.left, r.top, r.right, r.bottom] });
    };
    add("chatbot-greeting", document.querySelector('[class*="greetingBubble"]'));
    add("chatbot-button", document.querySelector('[class*="floatingButton"]'));
    add("chatbot-panel", document.querySelector('[class*="chatbotContainer"]'));
    // The header box spans the screen but is transparent: only its filled pieces block anything.
    const header = document.querySelector("header");
    if (header) {
      const solid = [];
      for (const el of [header, ...header.querySelectorAll("*")]) {
        if (solid.some((s) => s.contains(el))) continue;
        const cs = getComputedStyle(el);
        const filled = parseColor(cs.backgroundColor)[3] > 0.05 || (cs.backdropFilter && cs.backdropFilter !== "none");
        if (filled) solid.push(el);
      }
      for (const el of solid) add("nav-bar", el);
    }
    const covered = (rects, b) => {
      let total = 0;
      let hit = 0;
      for (const [x0, y0, x1, y1] of rects) {
        total += (x1 - x0) * (y1 - y0);
        const w = Math.min(x1, b[2]) - Math.max(x0, b[0]);
        const h = Math.min(y1, b[3]) - Math.max(y0, b[1]);
        if (w > 0 && h > 0) hit += w * h;
      }
      return { px: Math.round(hit), fraction: total ? hit / total : 0 };
    };
    const hits = [];
    const texts = cap.collectText({ mode: "viewport", minVisible: 0.01 });
    // Boxes with their own fill, border or blur on the Home's opaque surfaces (the button, for one).
    const panels = [];
    for (const el of document.querySelectorAll("[data-film-root] [data-opaque] *")) {
      if (!el.checkVisibility(VIS) || panels.some((panel) => panel.contains(el))) continue;
      const cs = getComputedStyle(el);
      const painted =
        parseColor(cs.backgroundColor)[3] > 0.05 ||
        (cs.backdropFilter && cs.backdropFilter !== "none") ||
        (parseFloat(cs.borderTopWidth) > 0 && parseColor(cs.borderTopColor)[3] > 0.05);
      const r = el.getBoundingClientRect();
      if (painted && r.width >= 24 && r.height >= 24 && r.bottom > 0 && r.top < vh) panels.push(el);
    }
    for (const blocker of blockers) {
      const own = blocker.name.startsWith("chatbot") ? "chatbot" : "header";
      for (const t of texts) {
        if (t.region === own || t.opacity < 0.05) continue;
        const hit = covered(t.rects, blocker.rect);
        if (hit.px >= 24) {
          hits.push({ by: blocker.name, kind: "text", what: t.el, text: t.text, coveredPx: hit.px, covered: round(hit.fraction, 3), region: t.region, beat: t.beat });
        }
      }
      for (const el of panels) {
        let opacity = 1;
        for (let e = el; e && e.nodeType === 1; e = e.parentElement) opacity *= parseFloat(getComputedStyle(e).opacity);
        if (opacity < 0.05) continue;
        const r = el.getBoundingClientRect();
        const hit = covered([[r.left, r.top, r.right, r.bottom]], blocker.rect);
        if (hit.px >= 24) {
          hits.push({ by: blocker.name, kind: "panel", what: desc(el), text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 60), coveredPx: hit.px, covered: round(hit.fraction, 3), region: "surface", beat: el.closest("[data-film-beat]")?.dataset.filmBeat });
        }
      }
      for (const el of document.querySelectorAll(INTERACTIVE)) {
        if (blocker.el.contains(el) || regionOf(el) === own || !el.checkVisibility(VIS)) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        const hit = covered([[r.left, r.top, r.right, r.bottom]], blocker.rect);
        if (hit.px >= 24) {
          hits.push({ by: blocker.name, kind: "control", what: desc(el), text: accessibleName(el).name.slice(0, 60), coveredPx: hit.px, covered: round(hit.fraction, 3), region: regionOf(el) });
        }
      }
    }
    return {
      blockers: blockers.map((b) => ({ name: b.name, rect: b.rect.map((v) => Math.round(v)) })),
      hits,
    };
  };

  // ── Effects ──
  cap.effects = () => {
    const cats = {
      backdropFilter: new Map(),
      backgroundClipText: new Map(),
      filterBlur: new Map(),
      filterOther: new Map(),
      borderRadius9999: new Map(),
      borderRadius50pct: new Map(),
      mixBlendMode: new Map(),
      animation: new Map(),
    };
    // `value` is the first value seen; `values` counts each distinct one, because
    // the same selector can sit at blur(0px) in one section and blur(18px) in the next.
    // Each element is also filed under its owner, so the chatbot (out of scope
    // for the redesign) and the nav can be told apart from the rest.
    let zone = "other";
    const zones = new Map();
    const add = (map, key, value) => {
      const entry = map.get(key) || { el: key, zone, count: 0, value, values: {} };
      entry.count++;
      const tally = zones.get(map) || { chatbot: 0, nav: 0, other: 0 };
      tally[zone]++;
      zones.set(map, tally);
      if (value in entry.values || Object.keys(entry.values).length < 6) {
        entry.values[value] = (entry.values[value] || 0) + 1;
      }
      map.set(key, entry);
    };
    for (const el of document.querySelectorAll("*")) {
      if (!el.checkVisibility()) continue;
      zone = el.closest('[class*="FaqChatbot"]')
        ? "chatbot"
        : el.closest("header,[data-header-fade]")
          ? "nav"
          : "other";
      for (const pseudo of [null, "::before", "::after"]) {
        const s = getComputedStyle(el, pseudo);
        if (pseudo && (s.content === "none" || s.content === "normal" || s.display === "none")) continue;
        const name = desc(el) + (pseudo || "");
        if (s.backdropFilter && s.backdropFilter !== "none") add(cats.backdropFilter, name, s.backdropFilter);
        if ((s.backgroundClip || "").split(",").some((v) => v.trim() === "text")) {
          add(cats.backgroundClipText, name, s.backgroundImage.slice(0, 140));
        }
        if (s.filter && s.filter !== "none") {
          add(s.filter.includes("blur(") ? cats.filterBlur : cats.filterOther, name, s.filter.slice(0, 140));
        }
        const radii = [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius];
        if (radii.some((v) => parseFloat(v) >= 9999 && !v.includes("%"))) {
          add(cats.borderRadius9999, name, radii[0]);
        } else if (radii.some((v) => v.includes("%") && parseFloat(v) >= 50)) {
          add(cats.borderRadius50pct, name, radii[0]);
        }
        if (s.mixBlendMode && s.mixBlendMode !== "normal") add(cats.mixBlendMode, name, s.mixBlendMode);
        if (s.animationName && s.animationName !== "none") {
          add(
            cats.animation,
            name,
            `${s.animationName} | timeline ${s.animationTimeline || "auto"} | ${s.animationDuration} | x${s.animationIterationCount} | ${s.animationPlayState}`,
          );
        }
      }
    }
    const computed = {};
    for (const [name, map] of Object.entries(cats)) {
      const list = [...map.values()].sort((a, b) => b.count - a.count);
      computed[name] = {
        elements: list.reduce((n, e) => n + e.count, 0),
        distinct: list.length,
        byZone: zones.get(map) || { chatbot: 0, nav: 0, other: 0 },
        list: list.slice(0, 60),
      };
    }
    const animationNames = {};
    for (const entry of cats.animation.values()) {
      for (const n of entry.value.split(" | ")[0].split(",")) {
        const key = n.trim();
        animationNames[key] = (animationNames[key] || 0) + entry.count;
      }
    }
    const running = {};
    for (const a of document.getAnimations()) {
      const kind = a.animationName ? `css:${a.animationName}` : a.transitionProperty ? `transition:${a.transitionProperty}` : "waapi";
      const timeline = a.timeline === document.timeline ? "document" : a.timeline ? a.timeline.constructor.name : "none";
      const key = `${kind} | ${timeline} | ${a.playState}`;
      running[key] = (running[key] || 0) + 1;
    }

    // What the loaded stylesheets declare, whether or not an element uses it right now.
    const declared = { backdropFilter: [], backgroundClipText: [], filterBlur: [], mixBlendMode: [], borderRadius9999: [], keyframes: [], keyframesWithBlur: [] };
    const walk = (rules) => {
      for (const rule of rules) {
        if (rule instanceof CSSKeyframesRule) {
          declared.keyframes.push(rule.name);
          if (/blur\(/.test(rule.cssText)) declared.keyframesWithBlur.push(rule.name);
          continue;
        }
        if (rule.style && rule.selectorText) {
          const st = rule.style;
          const sel = rule.selectorText.slice(0, 110);
          const backdrop = st.getPropertyValue("backdrop-filter") || st.getPropertyValue("-webkit-backdrop-filter");
          if (backdrop && backdrop !== "none") declared.backdropFilter.push(`${sel} { ${backdrop} }`);
          const clip = st.getPropertyValue("background-clip") || st.getPropertyValue("-webkit-background-clip");
          if (clip.includes("text")) declared.backgroundClipText.push(sel);
          const filter = st.getPropertyValue("filter");
          if (filter.includes("blur(")) declared.filterBlur.push(`${sel} { ${filter.slice(0, 60)} }`);
          const blend = st.getPropertyValue("mix-blend-mode");
          if (blend && blend !== "normal") declared.mixBlendMode.push(`${sel} { ${blend} }`);
          if (/(^|\s)9999px/.test(st.getPropertyValue("border-top-left-radius") || st.getPropertyValue("border-radius"))) {
            declared.borderRadius9999.push(sel);
          }
        }
        if (rule.cssRules?.length) walk(rule.cssRules);
      }
    };
    for (const styleSheet of document.styleSheets) {
      try {
        walk(styleSheet.cssRules);
      } catch {
        // Cross-origin sheet: nothing to read.
      }
    }
    const declaredOut = {};
    for (const [name, list] of Object.entries(declared)) {
      const unique = [...new Set(list)];
      declaredOut[name] = { rules: list.length, list: unique.slice(0, 60) };
    }
    return { computed, animationNames, running, declared: declaredOut };
  };

  // ── The Home's film ──
  /** Frames to shoot on the Home, top to bottom: each title card pinned, each empty stretch part-way through. */
  cap.homePlan = (progress) => {
    const root = document.querySelector("[data-film-root]");
    const top = (el) => el.getBoundingClientRect().top + scrollY;
    const frames = [];
    for (const el of root ? root.querySelectorAll("[data-seat], [data-film-beat]") : []) {
      if (el.dataset.seat) {
        frames.push({ name: el.dataset.seat, kind: "card", scrollY: Math.round(top(el)), height: el.offsetHeight });
      } else if (!el.querySelector("[data-opaque]")) {
        // The beat that holds the hero band is the first screen; hero-top covers it.
        frames.push({
          name: el.dataset.filmBeat,
          kind: "stretch",
          scrollY: Math.round(top(el) + progress * el.offsetHeight),
          height: el.offsetHeight,
        });
      }
    }
    const sections = [...document.querySelectorAll("[data-landing-section]")].map((el) => ({
      id: el.dataset.landingSection,
      hidden: !el.checkVisibility(),
      top: top(el),
      height: el.offsetHeight,
    }));
    return { frames, sections, filmBottom: root ? Math.round(root.getBoundingClientRect().bottom + scrollY) : 0 };
  };

  /** Every text element inside the film, and whether it has an opaque surface under it. */
  cap.textOnFootage = () => {
    const root = document.querySelector("[data-film-root]");
    if (!root) return null;
    const onFootage = [];
    let checked = 0;
    for (const [el, nodes] of leaves()) {
      if (!root.contains(el)) continue;
      checked++;
      const surface = el.closest("[data-opaque]");
      if (surface && root.contains(surface)) continue;
      onFootage.push({
        text: nodes.map((n) => n.nodeValue).join(" ").replace(/\s+/g, " ").trim().slice(0, 60),
        el: desc(el),
        path: pathOf(el),
        rendered: el.checkVisibility(VIS),
      });
    }
    const surfaces = [...root.querySelectorAll("[data-opaque]")].map((el) => {
      const cs = getComputedStyle(el);
      return {
        id: surfaceId(el),
        backgroundColor: cs.backgroundColor,
        backgroundImage: cs.backgroundImage,
        opacity: cs.opacity,
        opaque: parseColor(cs.backgroundColor)[3] >= 0.999 && Number(cs.opacity) >= 0.999,
        height: el.offsetHeight,
        viewports: round(el.offsetHeight / innerHeight, 2),
      };
    });
    const stretches = [...root.querySelectorAll("[data-film-beat]")].map((el) => ({
      id: el.dataset.filmBeat,
      ariaHidden: el.getAttribute("aria-hidden") === "true",
      holdsSurface: Boolean(el.querySelector("[data-opaque]")),
      textLength: (el.textContent || "").trim().length,
      height: el.offsetHeight,
    }));
    return { textElements: checked, onFootage, surfaces, stretches };
  };

  /** Where the film, its surfaces and the nav sit, for the pass along the scroll. */
  cap.trackGeometry = () => {
    const root = document.querySelector("[data-film-root]");
    if (!root) return null;
    const r = root.getBoundingClientRect();
    const edges = [];
    for (const surface of root.querySelectorAll("[data-opaque]")) {
      const b = surface.getBoundingClientRect();
      edges.push(
        { id: surfaceId(surface), side: "top", y: Math.round(b.top + scrollY) },
        { id: surfaceId(surface), side: "bottom", y: Math.round(b.bottom + scrollY) },
      );
    }
    edges.push({ id: "film", side: "bottom", y: Math.round(r.bottom + scrollY) });
    let labelBox = null;
    const range = document.createRange();
    for (const side of document.querySelectorAll("[data-header-side]")) {
      const walker = document.createTreeWalker(side, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.nodeValue.trim() || !node.parentElement.checkVisibility(VIS)) continue;
        range.selectNodeContents(node);
        const b = range.getBoundingClientRect();
        if (b.width < 1 || b.height < 1) continue;
        labelBox = labelBox ? [Math.min(labelBox[0], b.top), Math.max(labelBox[1], b.bottom)] : [b.top, b.bottom];
      }
    }
    const header = document.querySelector("header");
    return {
      top: r.top + scrollY,
      height: r.height,
      vh: innerHeight,
      vw: innerWidth,
      docHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
      edges,
      labelBox,
      navBox: header ? paintedBox(header) : null,
    };
  };

  /** The header as it is right now: its text (side labels and the bar's own) and its icons. */
  cap.navReadings = () => {
    const texts = cap.collectText({ mode: "viewport", minVisible: 0.5 }).filter((t) => t.region === "header");
    const controls = [];
    for (const el of document.querySelectorAll("header a[href], header button")) {
      const svg = el.querySelector("svg");
      if (!svg || !el.checkVisibility(VIS)) continue;
      const r = svg.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const colour = parseColor(getComputedStyle(svg).color);
      const shape = svg.querySelector("path,circle,rect,line,polyline,polygon,ellipse");
      const shapeStyle = shape ? getComputedStyle(shape) : null;
      const same = (value) =>
        Boolean(value) && value !== "none" && parseColor(value).slice(0, 3).join() === colour.slice(0, 3).join();
      let opacity = 1;
      for (let e = svg; e && e.nodeType === 1; e = e.parentElement) {
        const own = parseFloat(getComputedStyle(e).opacity);
        opacity *= Number.isNaN(own) ? 1 : own;
      }
      controls.push({
        label: accessibleName(el).name.slice(0, 40),
        el: desc(el),
        color: colour,
        opacity: round(opacity, 3),
        // The text-hidden frame only removes the icon if it is drawn in the text colour.
        followsTextColour: shapeStyle ? same(shapeStyle.fill) || same(shapeStyle.stroke) : null,
        selected: el.getAttribute("aria-current") === "page" || /selected/i.test(el.getAttribute("class") || ""),
        controlBackground: getComputedStyle(el).backgroundColor,
        rect: [Math.floor(r.left), Math.floor(r.top), Math.ceil(r.right), Math.ceil(r.bottom)],
      });
    }
    return { texts, controls };
  };

  cap.pageInfo = () => ({
    url: location.pathname + location.search,
    theme: document.documentElement.getAttribute("data-theme"),
    storedTheme: localStorage.getItem("data-theme"),
    fx: document.documentElement.getAttribute("data-fx"),
    pastFilm: document.documentElement.hasAttribute("data-past-film"),
    bodyBackground: getComputedStyle(document.body).backgroundColor,
    docHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    viewport: [innerWidth, innerHeight],
    dpr: devicePixelRatio,
    title: document.title,
    greeting: Boolean(document.querySelector('[class*="greetingBubble"]')?.checkVisibility()),
  });
}

// ─── Pixels ─────────────────────────────────────────────────────────────────
let helperPage = null;
async function decodePng(buffer) {
  if (sharp) {
    const { data, info } = await sharp(buffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    return { data, width: info.width, height: info.height, channels: info.channels };
  }
  const result = await helperPage.evaluate(async (b64) => {
    const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0);
    const bytes = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return { width: bitmap.width, height: bitmap.height, b64: btoa(binary) };
  }, buffer.toString("base64"));
  return { data: Buffer.from(result.b64, "base64"), width: result.width, height: result.height, channels: 4 };
}

const LINEAR = new Float64Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  LINEAR[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
const linear = (v) => {
  const c = Math.min(255, Math.max(0, v)) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
/** WCAG relative luminance of an sRGB colour (0–255 channels). */
const luminance = ([r, g, b]) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const hex = ([r, g, b]) =>
  `#${[r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;
const r2 = (n) => Math.round(n * 100) / 100;
const r4 = (n) => Math.round(n * 10000) / 10000;

/**
 * Luminance statistics of the pixels inside `rects` ([x0, y0, x1, y1] in image
 * pixels). Large areas are subsampled on a regular grid down to ~maxSamples.
 */
function regionStats(img, rects, maxSamples = 60000) {
  const { data, width, height, channels } = img;
  let area = 0;
  const clamped = [];
  for (const [a, b, c, d] of rects) {
    const x0 = Math.max(0, Math.min(width, a));
    const y0 = Math.max(0, Math.min(height, b));
    const x1 = Math.max(0, Math.min(width, c));
    const y1 = Math.max(0, Math.min(height, d));
    if (x1 > x0 && y1 > y0) {
      clamped.push([x0, y0, x1, y1]);
      area += (x1 - x0) * (y1 - y0);
    }
  }
  if (!area) return null;
  const stride = Math.max(1, Math.ceil(Math.sqrt(area / maxSamples)));
  const offsets = [];
  for (const [x0, y0, x1, y1] of clamped) {
    for (let y = y0; y < y1; y += stride) {
      for (let x = x0; x < x1; x += stride) offsets.push((y * width + x) * channels);
    }
  }
  // Sorted by luminance with the sample index packed into the low bits, so the
  // native numeric sort can be used: luminance in millionths * 2^23 + index.
  const lum = new Float64Array(offsets.length);
  const keys = new Float64Array(offsets.length);
  const PACK = 2 ** 23;
  let sum = 0;
  for (let i = 0; i < offsets.length; i++) {
    const o = offsets[i];
    lum[i] = 0.2126 * LINEAR[data[o]] + 0.7152 * LINEAR[data[o + 1]] + 0.0722 * LINEAR[data[o + 2]];
    sum += lum[i];
    keys[i] = Math.round(lum[i] * 1e6) * PACK + (i % PACK);
  }
  keys.sort();
  const at = (q) => {
    const key = keys[Math.min(keys.length - 1, Math.max(0, Math.round(q * (keys.length - 1))))];
    const i = key % PACK;
    const o = offsets[i];
    return { L: r4(lum[i]), rgb: [data[o], data[o + 1], data[o + 2]] };
  };
  return {
    samples: offsets.length,
    stride,
    mean: r4(sum / lum.length),
    min: at(0),
    p5: at(0.05),
    p50: at(0.5),
    p95: at(0.95),
    p99: at(0.99),
    max: at(1),
  };
}

const compactStats = (s) =>
  s && {
    samples: s.samples,
    min: s.min.L,
    p5: s.p5.L,
    median: s.p50.L,
    p95: s.p95.L,
    p99: s.p99.L,
    max: s.max.L,
    mean: s.mean,
    medianHex: hex(s.p50.rgb),
    p5Hex: hex(s.p5.rgb),
    p95Hex: hex(s.p95.rgb),
    maxHex: hex(s.max.rgb),
  };

/** Contrast of a paint (with its alpha and the element's opacity) over a background pixel. */
function ratioOver(rgba, opacity, bg) {
  const a = Math.min(1, Math.max(0, rgba[3] * opacity));
  const mixed = [0, 1, 2].map((i) => rgba[i] * a + bg[i] * (1 - a));
  return contrast(luminance(mixed), luminance(bg));
}

/**
 * The pixels a text really covers, and how they fare. A text box also holds the
 * space above, below and between the letters; here only pixels that change by a
 * lot between the text-hidden frame and one with the text painted magenta are
 * taken (the body of each stroke, not its faint antialiased rim), and the text
 * colour is rated against what the hidden frame shows at each of them.
 */
function glyphStats(hidden, marked, rects, rgba, opacity, required) {
  const { data, width, height, channels } = hidden;
  const loud = marked.data;
  const ratios = [];
  for (const [a, b, c, d] of rects) {
    const x1 = Math.min(width, c);
    const y1 = Math.min(height, d);
    for (let y = Math.max(0, b); y < y1; y++) {
      for (let x = Math.max(0, a); x < x1; x++) {
        const o = (y * width + x) * channels;
        const change = Math.max(
          Math.abs(data[o] - loud[o]),
          Math.abs(data[o + 1] - loud[o + 1]),
          Math.abs(data[o + 2] - loud[o + 2]),
        );
        if (change >= 96) ratios.push(ratioOver(rgba, opacity, [data[o], data[o + 1], data[o + 2]]));
      }
    }
  }
  if (!ratios.length) return null;
  ratios.sort((p, q) => p - q);
  const firstOk = ratios.findIndex((r) => r >= required);
  const under = firstOk === -1 ? ratios.length : firstOk;
  const at = (q) => r2(ratios[Math.round(q * (ratios.length - 1))]);
  return { pixels: ratios.length, shareUnder: r4(under / ratios.length), ratioMin: at(0), ratioP5: at(0.05), ratioMedian: at(0.5) };
}

/** Adds colours, background statistics and WCAG verdicts to a text entry from the page. */
function evaluate(entry, stats) {
  const { paint } = entry;
  const colours = paint.kind === "gradient" ? paint.stops : paint.color ? [paint.color] : [];
  const large = entry.fontSize >= 24 || (entry.fontSize >= 18.66 && Number(entry.fontWeight) >= 700);
  const required = large ? 3 : 4.5;
  const result = {
    ...entry,
    paint: undefined,
    rects: undefined,
    key: undefined,
    paintKind: paint.kind,
    colorHex: colours.length ? hex(colours[0]) : null,
    colorAlpha: colours.length ? r2(colours[0][3]) : null,
    large,
    required,
  };
  if (paint.kind === "gradient") {
    const sorted = [...paint.stops].sort((a, b) => luminance(a) - luminance(b));
    result.gradient = {
      raw: paint.raw,
      stops: paint.stops.map(hex),
      darkestStop: sorted.length ? hex(sorted[0]) : null,
      lightestStop: sorted.length ? hex(sorted[sorted.length - 1]) : null,
    };
    result.colorHex = result.gradient.darkestStop;
  }
  if (paint.kind === "stroke") result.strokeWidth = paint.strokeWidth;
  const dom = entry.domBackground;
  result.domBackground = { hex: hex(dom.rgb), complex: dom.complex, opaqueAncestor: dom.opaqueAncestor };
  result.bg = dom.complex ? "image" : "solid";
  result.background = compactStats(stats);

  const visible = paint.kind !== "none" && colours.length > 0 && entry.opacity >= 0.05 && !entry.clippedAway;
  result.visible = visible;
  if (!visible) {
    result.skipped = paint.kind === "none" ? "transparent text with no stroke or clipped gradient" : entry.clippedAway ? "clip-path hides it" : "opacity under 0.05";
    return result;
  }
  if (!stats) {
    result.skipped = "outside the captured frame";
    return result;
  }
  const worstOf = (bg) => Math.min(...colours.map((c) => ratioOver(c, entry.opacity, bg)));
  result.ratioMedian = r2(worstOf(stats.p50.rgb));
  result.ratioP95 = r2(worstOf(stats.p95.rgb));
  result.ratioP5 = r2(worstOf(stats.p5.rgb));
  result.ratioWorst = Math.min(result.ratioP95, result.ratioP5);
  // The same paint at full opacity: tells apart "colour too weak" from "caught mid-fade".
  if (entry.opacity < 0.99) {
    result.ratioMedianAtFullOpacity = r2(Math.min(...colours.map((c) => ratioOver(c, 1, stats.p50.rgb))));
  }
  result.ratioDom = dom.complex ? null : r2(Math.min(...colours.map((c) => ratioOver(c, entry.opacity, dom.rgb))));
  result.failMedian = result.ratioMedian < required;
  result.failWorst = result.ratioWorst < required;
  return result;
}

// ─── Page helpers ───────────────────────────────────────────────────────────
async function scrollTo(page, y) {
  await page.evaluate((top) => window.scrollTo({ top, left: 0, behavior: "instant" }), y);
}

async function settle(page, { film = false, extra = 120 } = {}) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  let state = null;
  if (film) state = await page.evaluate(() => window.__cap.filmSettled());
  await page.waitForFunction(() => window.__cap.imagesReady(), null, { timeout: 5000 }).catch(() => {});
  await page.waitForFunction(() => window.__cap.animationsIdle(), null, { timeout: 4000 }).catch(() => {});
  if (extra) await page.waitForTimeout(extra);
  return state;
}

function attachLogs(page) {
  const store = { console: [], requests: [] };
  page.on("console", (message) => {
    const type = message.type();
    if (type !== "error" && type !== "warning") return;
    store.console.push({ type, text: message.text().slice(0, 300), url: (message.location()?.url || "").slice(0, 160) });
  });
  page.on("pageerror", (error) => store.console.push({ type: "pageerror", text: String(error).slice(0, 300) }));
  page.on("requestfailed", (request) => {
    store.requests.push({
      url: request.url().slice(0, 200),
      failure: request.failure()?.errorText || "failed",
      resource: request.resourceType(),
    });
  });
  page.on("response", (response) => {
    if (response.status() < 400) return;
    store.requests.push({
      url: response.url().slice(0, 200),
      status: response.status(),
      resource: response.request().resourceType(),
    });
  });
  return store;
}

async function newContext(browser, vp, theme, extra = {}) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor,
    isMobile: Boolean(vp.isMobile),
    hasTouch: Boolean(vp.hasTouch),
    ...(vp.userAgent ? { userAgent: vp.userAgent } : {}),
    colorScheme: theme,
    ...extra,
  });
  // The site's own head script reads this key before first paint (src/app/layout.tsx).
  await context.addInitScript((value) => {
    try {
      localStorage.setItem("data-theme", value);
    } catch {}
  }, theme);
  await context.addInitScript(capLib);
  return context;
}

/**
 * Loads a route and waits until it is in the state a visitor reaches on their
 * own: film ready, fonts in, entrance animations done.
 */
async function open(page, route, theme, { expectFilm = true } = {}) {
  const started = Date.now();
  const response = await page.goto(BASE + route, { waitUntil: "load" });
  const info = { status: response?.status() ?? null, timings: {} };
  await page.evaluate(() => document.fonts.ready.then(() => true));
  const hasFilm = await page.evaluate(() => Boolean(document.querySelector("[data-film-root]")));
  if (hasFilm && expectFilm) {
    try {
      await page.waitForSelector("[data-film-root][data-film-ready]", { state: "attached", timeout: 30000 });
    } catch {
      note(`film never became ready on ${route} (${theme})`);
    }
  }
  info.film = hasFilm;
  info.timings.film = Date.now() - started;
  await settle(page, { film: hasFilm });
  info.timings.settled = Date.now() - started;
  Object.assign(info, await page.evaluate(() => window.__cap.pageInfo()));
  info.themeApplied = info.theme === theme;
  if (!info.themeApplied) note(`theme ${theme} did not apply on ${route}: data-theme="${info.theme}"`);
  return info;
}

/** The chatbot greeting shows 2.5 s after hydration and leaves by itself 8 s later. */
async function waitGreeting(page) {
  try {
    await page.waitForSelector('[class*="greetingBubble"]', { state: "visible", timeout: 6000 });
    await settle(page);
    return true;
  } catch {
    return false;
  }
}
async function dismissGreeting(page) {
  await page.evaluate(() => document.querySelector('button[aria-label="Close greeting"]')?.click());
  await page.waitForSelector('[class*="greetingBubble"]', { state: "detached", timeout: 12000 }).catch(() => note("chatbot greeting could not be dismissed"));
  await settle(page);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name), type: "png" });
  return name;
}

/** The current frame with text made invisible, decoded at one pixel per CSS pixel. */
async function hiddenFrame(page, { clip, mode = "hideText", restore = true, debugName } = {}) {
  await page.evaluate((m) => window.__cap.mode(m), mode);
  const buffer = await page.screenshot({ type: "png", scale: "css", ...(clip ? { clip } : {}) });
  if (restore) await page.evaluate(() => window.__cap.restore());
  if (DEBUG && debugName) writeFileSync(path.join(OUT, "_debug", debugName), buffer);
  return decodePng(buffer);
}

/** Text in the viewport, measured against the pixels actually behind it. */
async function measureViewport(page, debugName) {
  const texts = await page.evaluate(() => window.__cap.collectText({ mode: "viewport" }));
  const frame = await hiddenFrame(page, { debugName });
  return texts.map((t) => evaluate(t, regionStats(frame, t.rects)));
}

const summarise = (entries) => {
  const visible = entries.filter((e) => e.visible && e.ratioMedian !== undefined);
  return {
    checked: visible.length,
    skippedInvisible: entries.length - visible.length,
    failMedian: visible.filter((e) => e.failMedian).length,
    failWorstOnly: visible.filter((e) => !e.failMedian && e.failWorst).length,
  };
};

/**
 * Walks a page top to bottom in bands of 60% of the viewport. Text is measured
 * in the band where it sits in the upper part of the screen, so scroll-driven
 * entrances have finished. With `stitchTo`, the bands are also joined into one
 * full-page JPEG: Playwright's own fullPage shot keeps the scroll position at
 * 0, which leaves every scroll-revealed block at its hidden starting state.
 */
async function walkPage(page, { startY = 0, stitchTo = null, label }) {
  const byKey = new Map();
  const keptChrome = new Set();
  const removedChrome = new Set();
  const strips = [];
  let stripWidth = 0;
  let covered = startY;
  let tiles = 0;
  for (; tiles < 500; tiles++) {
    const dims = await page.evaluate(() => ({
      docH: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
      vh: innerHeight,
      vw: innerWidth,
    }));
    const bandH = Math.round(dims.vh * 0.6);
    const maxScroll = Math.max(0, dims.docH - dims.vh);
    await scrollTo(page, Math.min(covered, maxScroll));
    await settle(page, { extra: 60 });
    const y = await page.evaluate(() => Math.round(scrollY));
    const last = y >= maxScroll - 1;
    const cropTop = Math.max(0, covered - y);
    const cropBottom = last ? dims.vh : cropTop + bandH;

    const texts = await page.evaluate((o) => window.__cap.collectText(o), {
      mode: "band",
      bandTop: covered,
      bandBottom: last ? 1e9 : covered + bandH,
    });
    if (texts.length) {
      const frame = await hiddenFrame(page, { debugName: DEBUG ? `${label}-tile${tiles}.png` : null });
      for (const t of texts) {
        const entry = evaluate(t, regionStats(frame, t.rects));
        entry.scrollY = y;
        const previous = byKey.get(t.key);
        if (!previous) {
          byKey.set(t.key, entry);
        } else if (entry.fixed && entry.ratioMedian !== undefined) {
          // Fixed chrome is measured over every band; the weakest reading is kept.
          previous.measuredAt = (previous.measuredAt || 1) + 1;
          if (previous.ratioMedian === undefined || entry.ratioMedian < previous.ratioMedian) {
            entry.measuredAt = previous.measuredAt;
            entry.ratioMedianBest = Math.max(previous.ratioMedianBest ?? previous.ratioMedian ?? 0, entry.ratioMedian);
            byKey.set(t.key, entry);
          } else {
            previous.ratioMedianBest = Math.max(previous.ratioMedianBest ?? previous.ratioMedian, entry.ratioMedian);
          }
        }
      }
    }

    if (stitchTo) {
      if (!(tiles === 0 && last)) {
        const chrome = await page.evaluate((o) => window.__cap.chromeOff(o), {
          keepAbove: tiles === 0 ? cropBottom : null,
          keepBelow: last ? cropTop : null,
        });
        for (const el of chrome.kept) keptChrome.add(el);
        for (const el of chrome.removed) removedChrome.add(el);
      }
      const buffer = await page.screenshot({ type: "png" });
      await page.evaluate(() => window.__cap.chromeOn());
      const img = await decodePng(buffer);
      const scale = img.width / dims.vw;
      const from = Math.round(cropTop * scale);
      const to = Math.min(img.height, Math.round(cropBottom * scale));
      const rowBytes = img.width * img.channels;
      if (img.channels === 3) {
        strips.push(Buffer.from(img.data.subarray(from * rowBytes, to * rowBytes)));
      } else {
        const rgb = Buffer.alloc((to - from) * img.width * 3);
        for (let i = from * img.width, o = 0; i < to * img.width; i++, o += 3) {
          rgb[o] = img.data[i * 4];
          rgb[o + 1] = img.data[i * 4 + 1];
          rgb[o + 2] = img.data[i * 4 + 2];
        }
        strips.push(rgb);
      }
      stripWidth = img.width;
    }
    if (last) break;
    covered += bandH;
  }

  let stitched = null;
  if (stitchTo) {
    const raw = Buffer.concat(strips);
    const height = raw.length / (stripWidth * 3);
    if (sharp) {
      let image = sharp(raw, { raw: { width: stripWidth, height, channels: 3 }, limitInputPixels: false });
      let outHeight = height;
      if (height > 65000) {
        // JPEG stops at 65 535 px a side.
        const factor = Math.ceil(height / 65000);
        outHeight = Math.round(height / factor);
        image = image.resize({ width: Math.round(stripWidth / factor) });
        note(`${stitchTo} was taller than JPEG allows and was scaled down ${factor}x`);
      }
      await image.jpeg({ quality: 80 }).toFile(path.join(OUT, stitchTo));
      stitched = {
        file: stitchTo,
        width: stripWidth,
        height: outHeight,
        bands: tiles + 1,
        fixedShown: [...keptChrome],
        fixedLeftOut: [...removedChrome].filter((el) => !keptChrome.has(el)),
      };
    } else {
      await scrollTo(page, 0);
      await page.screenshot({ path: path.join(OUT, stitchTo), type: "jpeg", quality: 80, fullPage: true });
      note("sharp is not resolvable: full-page images are Playwright fullPage shots, so scroll-revealed blocks may be blank");
      stitched = { file: stitchTo, fallback: true };
    }
  }
  return { entries: [...byKey.values()], bands: tiles + 1, stitched };
}

/** Failures only, as asked for the non-film text. */
function contrastReport(entries) {
  const slim = (e) => ({
    el: e.el,
    container: e.container,
    path: e.path,
    text: e.text,
    region: e.region,
    landing: e.landing,
    fixed: e.fixed || undefined,
    color: e.colorHex,
    colorAlpha: e.colorAlpha,
    opacity: e.opacity,
    paintKind: e.paintKind,
    bg: e.bg,
    bgWhy: e.domBackground.complex || undefined,
    background: e.background?.medianHex,
    backgroundDom: e.bg === "solid" ? e.domBackground.hex : undefined,
    ratio: e.ratioMedian,
    ratioWorst: e.ratioWorst,
    ratioDom: e.ratioDom,
    ratioAtFullOpacity: e.ratioMedianAtFullOpacity,
    required: e.required,
    fontSize: e.fontSize,
    fontWeight: e.fontWeight,
    pageY: e.pageY,
    midFade: e.opacity < 0.99 ? true : undefined,
  });
  const visible = entries.filter((e) => e.visible && e.ratioMedian !== undefined);
  const solid = visible.filter((e) => e.ratioDom !== null && e.ratioDom !== undefined);
  // How far the two methods agree where both apply (solid backgrounds).
  const disagree = solid.filter((e) => Math.abs(e.ratioDom - e.ratioMedian) / e.ratioMedian > 0.15);
  return {
    ...summarise(entries),
    imageBackgrounds: visible.filter((e) => e.bg === "image").length,
    methodCheck: { solidBackgrounds: solid.length, pixelVsDomDisagreeOver15pct: disagree.length, examples: disagree.slice(0, 5).map((e) => ({ el: e.el, text: e.text, pixel: e.ratioMedian, dom: e.ratioDom })) },
    failures: visible.filter((e) => e.failMedian).map(slim).sort((a, b) => a.ratio - b.ratio),
    worstCaseOnly: visible.filter((e) => !e.failMedian && e.failWorst).map(slim).sort((a, b) => a.ratioWorst - b.ratioWorst),
  };
}

/** Type inventory, with the font each declared family actually resolves to. */
async function typeInventory(page) {
  const inventory = await page.evaluate(() => window.__cap.typeInventory());
  try {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
    for (const family of inventory.families) {
      if (!family.marked) continue;
      const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: `[data-cap-font="${family.marked}"]` });
      if (!nodeId) continue;
      const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      family.rendered = fonts.map((f) => `${f.familyName}${f.isCustomFont ? " (web font)" : " (local)"}`);
      family.marked = undefined;
    }
    await cdp.detach();
  } catch (error) {
    note(`rendered fonts could not be read: ${String(error).slice(0, 120)}`);
  }
  await page.evaluate(() => window.__cap.clearFontMarks());
  return inventory;
}

// ─── Runs ───────────────────────────────────────────────────────────────────
/** The Home screenshots a complete run leaves behind, in page order. */
const HOME_SHOTS = [
  "hero-top",
  "brand",
  "after-brand",
  "content",
  "after-content",
  "paid-media",
  "after-paid-media",
  "crm",
  "after-crm",
  "software",
  "after-software",
  "proof",
  "hiring",
  "faq",
  "final-cta",
  "footer",
];

const metrics = {
  meta: {
    base: BASE,
    homePath: HOME_PATH,
    out: OUT,
    generatedAt: new Date().toISOString(),
    command: `node scripts/design/capture.mjs ${process.argv.slice(2).join(" ")}`,
    viewports: VIEWPORTS.map(({ name, width, height, deviceScaleFactor, isMobile, hasTouch }) => ({
      name,
      width,
      height,
      deviceScaleFactor,
      isMobile: Boolean(isMobile),
      hasTouch: Boolean(hasTouch),
    })),
    themes: THEMES,
    pages: PAGES,
    beatProgress: BEAT_PROGRESS,
    decoder: sharp ? "sharp" : "canvas",
  },
  loads: [],
  home: {},
  film: { text: {}, textOnFootage: {}, labels: {}, nav: {}, scan: {}, reducedMotion: null },
  pages: {},
  effects: {},
  overlaps: [],
  logs: {},
};

const recordLoad = (name, vp, theme, info) =>
  metrics.loads.push({
    page: name,
    viewport: vp.name,
    theme,
    status: info.status,
    themeAttribute: info.theme,
    themeApplied: info.themeApplied,
    fx: info.fx,
    bodyBackground: info.bodyBackground,
    docHeight: info.docHeight,
    timings: info.timings,
  });
const recordLogs = (name, vp, theme, store) => {
  metrics.logs[`${name}-${vp.name}-${theme}`] = store;
};
const recordOverlaps = async (page, shotName) => {
  const result = await page.evaluate(() => window.__cap.overlaps());
  for (const hit of result.hits) metrics.overlaps.push({ shot: shotName, ...hit });
  return result.blockers;
};

async function runHome(browser, vp, theme) {
  const tag = `home-${vp.name}-${theme}`;
  log(`${tag}: ${HOME_PATH}`);
  const context = await newContext(browser, vp, theme);
  const page = await context.newPage();
  const logs = attachLogs(page);
  const info = await open(page, HOME_PATH, theme);
  recordLoad("home", vp, theme, info);
  const home = { url: HOME_PATH, status: info.status, shots: [] };
  (metrics.home[vp.name] ??= {})[theme] = home;
  const filmText = ((metrics.film.text[vp.name] ??= {})[theme] = {});

  // As a visitor finds it a few seconds in: the chatbot greeting on screen.
  home.greetingAtTop = await waitGreeting(page);
  home.shots.push(await shot(page, `${tag}-hero-top.png`));
  await recordOverlaps(page, `${tag}-hero-top.png`);
  await dismissGreeting(page);
  home.shots.push(await shot(page, `${tag}-hero-top-clean.png`));

  const frame = async (name, kind, file) => {
    const state = await page.evaluate(() => window.__cap.filmState(true));
    const elements = await measureViewport(page, `${tag}-${name}.png`);
    filmText[name] = { kind, shot: file, scrollY: state.scrollY ?? 0, film: state, ...summarise(elements), elements };
  };
  await frame("hero-top", "hero", `${tag}-hero-top-clean.png`);

  // The whole film, wherever it is scrolled: is any text left without a surface under it?
  (metrics.film.textOnFootage[vp.name] ??= {})[theme] = await page.evaluate(() => window.__cap.textOnFootage());

  const plan = await page.evaluate((progress) => window.__cap.homePlan(progress), BEAT_PROGRESS);
  if (!plan.frames.length) note(`${HOME_PATH} has no [data-seat] cards or empty [data-film-beat] stretches: film frames skipped`);
  home.frames = plan.frames;
  for (const item of plan.frames) {
    await scrollTo(page, item.scrollY);
    const state = await settle(page, { film: true });
    if (state?.film && !state.settled) note(`${tag}: film did not settle at ${item.name}`);
    const file = await shot(page, `${tag}-${item.name}.png`);
    home.shots.push(file);
    await recordOverlaps(page, file);
    await frame(item.name, item.kind, file);
  }

  home.sections = plan.sections;
  // Clear of the nav bar, which is at the top on wide screens and at the bottom on phones.
  const offset = vp.width > 768 ? 96 : 24;
  for (const section of plan.sections) {
    if (section.hidden) {
      note(`${tag}: section "${section.id}" is hidden, no screenshot`);
      continue;
    }
    await scrollTo(page, Math.max(0, Math.round(section.top - offset)));
    await settle(page, { film: true });
    const file = await shot(page, `${tag}-${section.id}.png`);
    home.shots.push(file);
    await recordOverlaps(page, file);
  }
  await scrollTo(page, 1e7);
  await settle(page, { film: true });
  home.shots.push(await shot(page, `${tag}-footer.png`));
  await recordOverlaps(page, `${tag}-footer.png`);

  // Everything under the film, measured like any other page.
  const walked = await walkPage(page, { startY: plan.filmBottom, label: tag });
  const record = (((metrics.pages.home ??= {})[vp.name] ??= {})[theme] = {
    url: HOME_PATH,
    status: info.status,
    scope: plan.filmBottom ? `below the film (page y >= ${plan.filmBottom})` : "whole page",
    contrast: contrastReport(walked.entries.filter((e) => e.region !== "film" && e.region !== "surface")),
  });

  if (theme === "dark") {
    await scrollTo(page, 0);
    await settle(page, { film: true });
    record.type = await typeInventory(page);
    record.hitTargets = await page.evaluate((min) => window.__cap.hitTargets(min), vp.minTarget);
    if (vp.name === "1440") metrics.effects.home = await page.evaluate(() => window.__cap.effects());
  }
  recordLogs("home", vp, theme, logs);
  await context.close();
}

// ── The pass along the film ──
/** Which kind of ground a header label stands on. */
const labelGround = (reading) => {
  const under = reading.under || { kind: "page" };
  if (under.kind === "film") return under.stagePinned ? "film, stage pinned" : "film, stage scrolling away";
  if (under.kind === "card") return "opaque surface";
  if (under.kind === "edge") return "edge of a surface";
  return "page";
};
const GROUNDS = ["film, stage pinned", "film, stage scrolling away", "opaque surface", "edge of a surface", "page"];

function summariseLabels(samples) {
  const sides = {};
  for (const sample of samples) {
    for (const label of sample.labels || []) {
      if (label.ratioMedian === undefined) continue;
      const side = (sides[label.side] ??= { text: label.text, fontSize: label.fontSize, fontWeight: label.fontWeight, required: label.required, grounds: {} });
      const ground = (side.grounds[labelGround(label)] ??= {
        positions: 0,
        byKind: {},
        colours: {},
        underMedian: 0,
        underP95: 0,
        underWorst: 0,
        underGlyph: 0,
        worstMedian: null,
        worstP95: null,
        worstAny: null,
        worstGlyph: null,
      });
      ground.positions++;
      ground.byKind[sample.kind] = (ground.byKind[sample.kind] || 0) + 1;
      ground.colours[label.color] = (ground.colours[label.color] || 0) + 1;
      if (label.ratioMedian < label.required) ground.underMedian++;
      if (label.ratioP95 < label.required) ground.underP95++;
      if (label.ratioWorst < label.required) ground.underWorst++;
      // One per cent of the glyph pixels is the floor: below that it is a few rim pixels.
      if (label.glyph && label.glyph.shareUnder >= 0.01) ground.underGlyph++;
      const ref = () => ({
        glyphShareUnder: label.glyph?.shareUnder,
        glyphRatioP5: label.glyph?.ratioP5,
        glyphRatioMedian: label.glyph?.ratioMedian,
        ratioMedian: label.ratioMedian,
        ratioP95: label.ratioP95,
        ratioP5: label.ratioP5,
        ratioWorst: label.ratioWorst,
        color: label.color,
        bgMedian: label.bgMedian,
        bgP95: label.bgP95,
        bgP5: label.bgP5,
        scrollY: sample.scrollY,
        time: sample.time,
        veil: sample.veil,
        beat: sample.beat,
        kind: sample.kind,
        edge: sample.edge,
        where: sample.where,
        navOverCard: sample.navOverCard,
        pastFilm: sample.pastFilm,
        under: label.under,
      });
      if (!ground.worstMedian || label.ratioMedian < ground.worstMedian.ratioMedian) ground.worstMedian = ref();
      if (!ground.worstP95 || label.ratioP95 < ground.worstP95.ratioP95) ground.worstP95 = ref();
      if (!ground.worstAny || label.ratioWorst < ground.worstAny.ratioWorst) ground.worstAny = ref();
      if (label.glyph && (!ground.worstGlyph || label.glyph.shareUnder > ground.worstGlyph.glyphShareUnder)) {
        ground.worstGlyph = ref();
      }
    }
  }
  return sides;
}

/** The bar's own text and icons: the weakest reading of each across the positions it was read at. */
function summariseNav(samples) {
  const fold = (map, key, entry, sample, base) => {
    const item = map.get(key) || { ...base, readings: 0, worstMedian: Infinity, worstAny: Infinity };
    item.readings++;
    const any = Math.min(entry.ratioP95, entry.ratioP5);
    if (entry.ratioMedian < item.worstMedian) {
      item.worstMedian = entry.ratioMedian;
      item.bgAtWorst = entry.bgMedian;
      item.scrollYAtWorst = sample.scrollY;
    }
    item.worstAny = Math.min(item.worstAny, any);
    map.set(key, item);
  };
  const texts = new Map();
  const icons = new Map();
  for (const sample of samples) {
    for (const t of sample.pill || []) {
      if (t.ratioMedian === undefined) continue;
      fold(texts, `${t.text}|${t.color}`, t, sample, { text: t.text, color: t.color, fontSize: t.fontSize, fontWeight: t.fontWeight, required: t.required });
    }
    for (const c of sample.controls || []) {
      fold(icons, `${c.label}|${c.color}`, c, sample, { label: c.label, color: c.color, selected: c.selected, followsTextColour: c.followsTextColour, required: 3 });
    }
  }
  return { texts: [...texts.values()], icons: [...icons.values()] };
}

/**
 * One trip down the film for a viewport and theme. At every position it reads
 * the header (side labels, the bar's text and icons) against the pixels behind
 * it; in the dark theme it also reads the film itself, as the old film scan did.
 * Positions: the evenly spaced ones, a dense set, and where the labels show,
 * the stretch after the stage unpins and four positions around every edge that
 * passes under them.
 */
async function runTrack(browser, vp, theme) {
  const scan = theme === "dark";
  const context = await newContext(browser, vp, theme);
  const page = await context.newPage();
  await open(page, HOME_PATH, theme);
  await waitGreeting(page);
  await dismissGreeting(page);
  const geo = await page.evaluate(() => window.__cap.trackGeometry());
  if (!geo) {
    note(`${HOME_PATH} has no [data-film-root]: pass along the film skipped`);
    await context.close();
    return;
  }
  const labels = Boolean(geo.labelBox);
  const start = geo.top;
  const end = geo.top + geo.height - geo.vh;
  const maxScroll = geo.docHeight - geo.vh;
  const positions = [];
  const spread = (count, kind) => {
    for (let i = 0; i < count; i++) {
      positions.push({ kind, scrollY: Math.round(start + ((end - start) * i) / Math.max(1, count - 1)) });
    }
  };
  spread(FILM_STEPS, "base");
  if (FILM_DENSE > 0 && (scan || labels)) spread(FILM_DENSE, "dense");
  if (labels) {
    // After the stage unpins it scrolls away under the labels, without its top fade.
    const step = Math.max(8, Math.round((end - start) / Math.max(1, (FILM_DENSE || FILM_STEPS) - 1)));
    for (let y = end + step; y <= Math.min(maxScroll, geo.top + geo.height); y += step) {
      positions.push({ kind: "tail", scrollY: Math.round(y) });
    }
    const [top, bottom] = geo.labelBox;
    const height = bottom - top;
    // Where the edge sits in the label box. The site switches the labels' colour
    // when a surface spans the middle of the bar, so the two positions next to
    // the middle are the last one before and the first one after that switch.
    const around = [
      ["edge a quarter down the box", height * 0.25],
      ["edge 1 px above the middle", height / 2 - 1],
      ["edge 1 px below the middle", height / 2 + 1],
      ["edge three quarters down the box", height * 0.75],
    ];
    for (const edge of geo.edges) {
      for (const [where, into] of around) {
        // The edge sits `into` px below the top of the label box.
        const y = Math.round(edge.y - (top + into));
        if (y >= 0 && y <= maxScroll) positions.push({ kind: "edge", edge: `${edge.id} ${edge.side}`, where, scrollY: y });
      }
    }
    // The site turns the labels back to the theme colour when the film's end is 80 px from the top.
    for (const [where, delta] of [["1 px before the switch", -1], ["at the switch", 0]]) {
      const y = Math.round(geo.top + geo.height - 80 + delta);
      if (y >= 0 && y <= maxScroll) positions.push({ kind: "edge", edge: "past-film switch", where, scrollY: y });
    }
  }
  positions.sort((a, b) => a.scrollY - b.scrollY);
  log(`film pass ${vp.name} ${theme}: ${positions.length} positions${labels ? ", labels" : ""}${scan ? ", film background" : ""}`);

  const centre = {
    x: Math.round(geo.vw * 0.2),
    y: Math.round(geo.vh * 0.2),
    width: Math.round(geo.vw * 0.6),
    height: Math.round(geo.vh * 0.6),
  };
  const whole = [[0, 0, centre.width, centre.height]];
  const navTop = geo.navBox ? Math.max(0, Math.floor(geo.navBox[1]) - 4) : 0;
  const navBottom = geo.navBox ? Math.min(geo.vh, Math.ceil(geo.navBox[3]) + 4) : 0;
  const navClip = geo.navBox ? { x: 0, y: navTop, width: geo.vw, height: navBottom - navTop } : null;
  const inClip = (rects) => rects.map(([a, b, c, d]) => [a, b - navTop, c, d - navTop]);
  const slimText = (e) => ({
    side: e.headerSide,
    text: e.text,
    color: e.colorHex,
    opacity: e.opacity,
    fontSize: e.fontSize,
    fontWeight: e.fontWeight,
    required: e.required,
    under: e.under,
    ratioMedian: e.ratioMedian,
    ratioP95: e.ratioP95,
    ratioP5: e.ratioP5,
    ratioWorst: e.ratioWorst,
    bgMedian: e.background?.medianHex,
    bgP95: e.background?.p95Hex,
    bgP5: e.background?.p5Hex,
  });

  const samples = [];
  for (const position of positions) {
    await scrollTo(page, position.scrollY);
    const state = await page.evaluate(() => window.__cap.filmSettled());
    // The veil eases over 200 ms and the header's attributes follow the scroll by a frame.
    await page.waitForFunction(() => window.__cap.animationsIdle(), null, { timeout: 3000 }).catch(() => {});
    const sample = {
      ...position,
      time: state.video?.time ?? null,
      veil: Number(state.veil),
      beat: state.beat,
      settled: state.settled,
      navOverCard: state.navOverCard,
      pastFilm: state.pastFilm,
      stageTop: state.stageTop,
    };
    let touched = false;
    if (navClip && (labels || position.kind === "base")) {
      const nav = await page.evaluate(() => window.__cap.navReadings());
      const frame = await hiddenFrame(page, { clip: navClip, restore: false });
      const marked = labels ? await hiddenFrame(page, { clip: navClip, mode: "markText", restore: false }) : null;
      touched = true;
      const read = (t) => slimText(evaluate(t, regionStats(frame, inClip(t.rects))));
      sample.labels = nav.texts
        .filter((t) => t.headerSide)
        .map((t) => {
          const reading = read(t);
          if (marked && t.paint.color && reading.ratioMedian !== undefined) {
            reading.glyph = glyphStats(frame, marked, inClip(t.rects), t.paint.color, t.opacity, reading.required);
          }
          return reading;
        });
      sample.pill = nav.texts.filter((t) => !t.headerSide).map(read);
      sample.controls = [];
      for (const control of nav.controls) {
        const stats = regionStats(frame, inClip([control.rect]));
        if (!stats) continue;
        const ratio = (bg) => r2(ratioOver(control.color, control.opacity, bg));
        sample.controls.push({
          label: control.label,
          color: hex(control.color),
          selected: control.selected,
          followsTextColour: control.followsTextColour,
          bgMedian: hex(stats.p50.rgb),
          ratioMedian: ratio(stats.p50.rgb),
          ratioP95: ratio(stats.p95.rgb),
          ratioP5: ratio(stats.p5.rgb),
        });
      }
    }
    if (scan && (position.kind === "base" || position.kind === "dense")) {
      if (position.kind === "base") {
        const withContent = await hiddenFrame(page, { clip: centre, restore: false });
        sample.withContent = compactStats(regionStats(withContent, whole, Number.POSITIVE_INFINITY));
      }
      const film = await hiddenFrame(page, { clip: centre, mode: "filmOnly", restore: false });
      sample.filmOnly = compactStats(regionStats(film, whole, Number.POSITIVE_INFINITY));
      touched = true;
    }
    if (touched) await page.evaluate(() => window.__cap.restore());
    samples.push(sample);
  }
  await context.close();

  const unsettled = samples.filter((s) => !s.settled).length;
  if (unsettled) note(`film pass ${vp.name} ${theme}: the film did not settle at ${unsettled} positions`);
  const counts = {};
  for (const s of samples) counts[s.kind] = (counts[s.kind] || 0) + 1;

  (metrics.film.nav[vp.name] ??= {})[theme] = { positions: samples.filter((s) => s.controls).length, ...summariseNav(samples) };
  if (labels) {
    (metrics.film.labels[vp.name] ??= {})[theme] = {
      labelBox: geo.labelBox,
      positions: counts,
      sides: summariseLabels(samples),
      samples: samples.map((s) => ({
        kind: s.kind,
        edge: s.edge,
        where: s.where,
        scrollY: s.scrollY,
        time: s.time,
        veil: s.veil,
        beat: s.beat,
        navOverCard: s.navOverCard,
        pastFilm: s.pastFilm,
        stageTop: s.stageTop,
        labels: (s.labels || []).map(({ text, fontSize, fontWeight, required, opacity, ...rest }) => rest),
      })),
    };
  }
  if (scan) {
    const base = samples.filter((s) => s.kind === "base");
    const dense = samples.filter((s) => s.kind === "dense");
    const brightest = (list, layer, stat) =>
      list.reduce((best, s) => (s[layer] && (!best || s[layer][stat] > best[layer][stat]) ? s : best), null);
    const pick = (s, layer) =>
      s && {
        scrollY: s.scrollY,
        time: s.time,
        veil: s.veil,
        beat: s.beat,
        p95: s[layer].p95,
        max: s[layer].max,
        p95Hex: s[layer].p95Hex,
        maxHex: s[layer].maxHex,
        median: s[layer].median,
      };
    const veils = [...new Set(dense.map((s) => s.veil))].sort();
    metrics.film.scan[vp.name] = {
      theme,
      region: { ...centre, note: "central 60% of the viewport in both directions, CSS pixels" },
      track: { startScrollY: Math.round(start), endScrollY: Math.round(end) },
      samples: base.map((s, i) => ({
        i,
        scrollY: s.scrollY,
        time: s.time,
        veil: s.veil,
        beat: s.beat,
        settled: s.settled,
        withContent: s.withContent,
        filmOnly: s.filmOnly,
      })),
      brightest: {
        withContentByP95: pick(brightest(base, "withContent", "p95"), "withContent"),
        withContentByMax: pick(brightest(base, "withContent", "max"), "withContent"),
        filmOnlyByP95: pick(brightest(base, "filmOnly", "p95"), "filmOnly"),
        filmOnlyByMax: pick(brightest(base, "filmOnly", "max"), "filmOnly"),
      },
      dense: dense.length
        ? {
            steps: dense.length,
            byP95: pick(brightest(dense, "filmOnly", "p95"), "filmOnly"),
            byMax: pick(brightest(dense, "filmOnly", "max"), "filmOnly"),
            veilValues: veils,
            // Brightest sample for each veil value, to see what the veil is spent on.
            byVeil: Object.fromEntries(
              veils.map((veil) => [veil, pick(brightest(dense.filter((s) => s.veil === veil), "filmOnly", "p95"), "filmOnly")]),
            ),
            samples: dense.map((s) => ({
              scrollY: s.scrollY,
              time: s.time,
              veil: s.veil,
              beat: s.beat,
              median: s.filmOnly.median,
              p95: s.filmOnly.p95,
              max: s.filmOnly.max,
            })),
          }
        : null,
    };
  }
}

async function runReducedMotion(browser) {
  const vp = VIEWPORTS.find((v) => v.name === "1440");
  const theme = "dark";
  log("reduced motion: home 1440 dark");
  const context = await newContext(browser, vp, theme, { reducedMotion: "reduce" });
  const page = await context.newPage();
  const video = [];
  page.on("request", (request) => {
    if (/\.(mp4|webm|mov)(\?|$)/.test(request.url())) video.push(request.url().replace(BASE, ""));
  });
  await open(page, HOME_PATH, theme, { expectFilm: false });
  await waitGreeting(page);
  await dismissGreeting(page);
  const result = {
    viewport: vp.name,
    theme,
    matchesReducedMotion: await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches),
    frames: {},
    shots: [],
  };
  const plan = await page.evaluate((progress) => window.__cap.homePlan(progress), BEAT_PROGRESS);
  for (const name of RM_FRAMES) {
    const item = name === "hero-top" ? { name, kind: "hero", scrollY: 0 } : plan.frames.find((f) => f.name === name);
    if (!item) {
      note(`reduced motion: no frame called ${name}`);
      continue;
    }
    await scrollTo(page, item.scrollY);
    await page
      .waitForFunction(() => {
        const img = document.querySelector("[data-film-stage] img");
        return !img || (img.complete && img.naturalWidth > 0);
      }, null, { timeout: 8000 })
      .catch(() => {});
    const state = await settle(page, { film: true });
    const file = await shot(page, `home-${vp.name}-${theme}-rm-${name}.png`);
    result.shots.push(file);
    result.frames[name] = {
      kind: item.kind,
      shot: file,
      scrollY: state?.scrollY,
      still: state?.still,
      stillLoaded: state?.stillLoaded,
      video: state?.video,
      filmReadyAttribute: state?.ready,
      veil: state?.veil,
    };
  }
  await page.waitForTimeout(500);
  result.videoRequests = video;
  const frames = Object.values(result.frames);
  result.videoAbsent = video.length === 0 && frames.every((f) => f.video && !f.video.hasSrc);
  metrics.film.reducedMotion = result;
  await context.close();
}

async function runPage(browser, vp, theme, def) {
  const tag = `${def.name}-${vp.name}-${theme}`;
  log(`${tag}: ${def.path}`);
  const context = await newContext(browser, vp, theme);
  const page = await context.newPage();
  const logs = attachLogs(page);
  const info = await open(page, def.path, theme);
  recordLoad(def.name, vp, theme, info);
  const record = (((metrics.pages[def.name] ??= {})[vp.name] ??= {})[theme] = { url: def.path, status: info.status, shots: [] });

  record.greetingAtTop = await waitGreeting(page);
  record.shots.push(await shot(page, `${tag}-top.png`));
  await recordOverlaps(page, `${tag}-top.png`);
  await dismissGreeting(page);

  // One pass down the page first, so lazy images and late content are in before anything is measured.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += vp.height) {
    await scrollTo(page, y);
    await page.waitForTimeout(80);
  }
  await page
    .waitForFunction(() => [...document.images].every((img) => img.complete || img.loading === "lazy"), null, { timeout: 8000 })
    .catch(() => {});
  await scrollTo(page, 0);
  await settle(page);

  if (theme === "dark") {
    record.type = await typeInventory(page);
    record.hitTargets = await page.evaluate((min) => window.__cap.hitTargets(min), vp.minTarget);
    if (vp.name === "1440") metrics.effects[def.name] = await page.evaluate(() => window.__cap.effects());
  }

  const walked = await walkPage(page, { stitchTo: `${tag}-full.jpg`, label: tag });
  record.contrast = contrastReport(walked.entries);
  record.full = walked.stitched;
  record.shots.push(`${tag}-full.jpg`);
  record.docHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  await scrollTo(page, 1e7);
  await settle(page);
  record.shots.push(await shot(page, `${tag}-footer.png`));
  await recordOverlaps(page, `${tag}-footer.png`);
  recordLogs(def.name, vp, theme, logs);
  await context.close();
}

/** Files a run of the requested parts must have written, and which of them are missing or stale. */
function checkFiles(startedAt) {
  const expected = [];
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      if (wants("home")) {
        for (const name of [...HOME_SHOTS, "hero-top-clean"]) expected.push(`home-${vp.name}-${theme}-${name}.png`);
      }
      for (const def of PAGES) {
        if (!wants(def.name)) continue;
        for (const suffix of ["top.png", "full.jpg", "footer.png"]) expected.push(`${def.name}-${vp.name}-${theme}-${suffix}`);
      }
    }
  }
  if (wants("rm")) for (const name of RM_FRAMES) expected.push(`home-1440-dark-rm-${name}.png`);
  const missing = [];
  for (const file of expected) {
    const full = path.join(OUT, file);
    if (!existsSync(full)) missing.push(file);
    else if (statSync(full).mtimeMs < startedAt - 2000) missing.push(`${file} (left over from an earlier run)`);
  }
  return { expected: expected.length, written: expected.length - missing.length, missing };
}

// ─── Summary (metrics.md) ───────────────────────────────────────────────────
const EFFECTS = ["backdropFilter", "backgroundClipText", "filterBlur", "filterOther", "borderRadius9999", "borderRadius50pct", "mixBlendMode", "animation"];

function loadBefore() {
  if (!existsSync(COMPARE) || COMPARE === path.join(OUT, "metrics.json")) return null;
  try {
    return JSON.parse(readFileSync(COMPARE, "utf8"));
  } catch (error) {
    note(`could not read ${COMPARE}: ${String(error).slice(0, 100)}`);
    return null;
  }
}

function writeSummary() {
  const lines = [];
  const p = (...text) => lines.push(...text);
  const table = (head, rows) => {
    if (!rows.length) return p("_none_", "");
    p(`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`);
    for (const row of rows) p(`| ${row.map((c) => String(c ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ")).join(" | ")} |`);
    p("");
  };
  const clip = (s, n = 40) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s || "");
  const m = metrics;
  const each = (fn) => {
    for (const [name, byVp] of Object.entries(m.pages)) {
      for (const [vp, byTheme] of Object.entries(byVp)) {
        for (const [theme, rec] of Object.entries(byTheme)) fn(name, vp, theme, rec);
      }
    }
  };
  const site = (list) => list.filter((t) => t.region !== "chatbot");
  const bot = (list) => list.filter((t) => t.region === "chatbot");

  p("# Design capture", "");
  p(`- Generated: ${m.meta.generatedAt} — ${m.meta.durationSec ?? "?"} s`);
  p(`- Base: ${m.meta.base} — Home route: \`${m.meta.homePath}\``);
  p(`- Browser: Chromium ${m.meta.chromium} (Playwright), decoder: ${m.meta.decoder}`);
  p(`- Re-run: \`${m.meta.command}\``);
  const applied = m.loads.filter((l) => l.themeApplied).length;
  p(`- Theme forced through localStorage \`data-theme\`: applied in ${applied}/${m.loads.length} page loads. \`data-fx\`: ${[...new Set(m.loads.map((l) => l.fx))].join(", ")}`);
  if (m.meta.files) {
    p(`- Files: ${m.meta.files.written} of ${m.meta.files.expected} expected screenshots written${m.meta.files.missing.length ? `; missing: ${m.meta.files.missing.join(", ")}` : ", none missing"}.`);
  }
  p("- Ratios are WCAG 2 contrast. Text counts as large from 24 px, or from 18.66 px at weight 700+: it needs 3:1, everything else 4.5:1.");
  p("- Backgrounds are read from a second screenshot of the same frame with the text made invisible. `median` is the pixel of median luminance behind the text, `p95` the 95th percentile, `p5` the 5th. A ratio already includes the element's opacity at the moment of capture.", "");

  // A — opaque surfaces
  p("## A. Text on the Home's opaque surfaces (hero band and title cards)", "");
  const footageRows = [];
  for (const [vp, byTheme] of Object.entries(m.film.textOnFootage)) {
    for (const [theme, check] of Object.entries(byTheme)) {
      if (!check) continue;
      footageRows.push([
        vp,
        theme,
        check.textElements,
        check.onFootage.length,
        check.onFootage.map((t) => `"${clip(t.text, 30)}" (${clip(t.el, 40)}${t.rendered ? "" : ", not rendered"})`).join("; ") || "—",
        check.surfaces.filter((s) => !s.opaque).map((s) => s.id).join(", ") || "all opaque",
        check.stretches.filter((s) => !s.holdsSurface && s.textLength > 0).map((s) => s.id).join(", ") || "all empty",
      ]);
    }
  }
  p("Every text element inside `[data-film-root]`, rendered or not, and whether it has a `[data-opaque]` ancestor:", "");
  table(["width", "theme", "text elements in the film", "without an opaque surface", "which", "surfaces that are not opaque", "stretches that hold text"], footageRows);
  const firstCheck = Object.values(Object.values(m.film.textOnFootage)[0] || {})[0];
  if (firstCheck) {
    table(
      ["surface", "height (viewports)", ...Object.keys(m.film.textOnFootage).flatMap((vp) => Object.keys(m.film.textOnFootage[vp]).map((theme) => `${vp} ${theme}`))],
      firstCheck.surfaces.map((s, i) => [
        s.id,
        s.viewports,
        ...Object.values(m.film.textOnFootage).flatMap((byTheme) => Object.values(byTheme).map((c) => c?.surfaces[i]?.backgroundColor)),
      ]),
    );
  }
  for (const [vp, byTheme] of Object.entries(m.film.text)) {
    p(`### ${vp} px`, "");
    const rows = [];
    const worst = {};
    for (const [theme, frames] of Object.entries(byTheme)) {
      for (const [name, data] of Object.entries(frames)) {
        for (const e of data.elements) {
          if (e.region !== "surface") continue;
          if (!e.visible) {
            rows.push([theme, e.onSurface, clip(e.text, 34), e.colorHex ?? "", `${e.fontSize}/${e.fontWeight}`, e.letterSpacingEm, "", "", "", "", "", `not painted: ${e.skipped}`]);
            continue;
          }
          const group = e.onSurface === "hero-band" ? "band" : "cards";
          const key = `${group} ${theme}`;
          if (!worst[key] || e.ratioWorst < worst[key].ratioWorst) worst[key] = { ...e, frame: name };
          rows.push([
            theme,
            e.onSurface,
            clip(e.text, 34),
            e.colorHex,
            `${e.fontSize}/${e.fontWeight}`,
            e.letterSpacingEm,
            e.background?.medianHex,
            e.background?.p95Hex === e.background?.p5Hex ? "flat" : `${e.background?.p5Hex}–${e.background?.p95Hex}`,
            e.ratioMedian,
            e.ratioP95,
            e.ratioWorst,
            e.failMedian ? `FAIL <${e.required}` : e.failWorst ? `worst case <${e.required}` : `ok (${e.required})`,
          ]);
        }
      }
    }
    table(["theme", "surface", "text", "colour", "px/weight", "ls em", "bg median", "bg p5–p95", "ratio median", "ratio p95", "ratio worst", "verdict"], rows);
    p(`Lowest ratio per surface kind and theme (${vp} px): ${Object.entries(worst).map(([key, e]) => `${key} ${e.ratioWorst} ("${clip(e.text, 24)}", ${e.colorHex} on ${e.background?.medianHex}, ${e.fontSize} px)`).join("; ") || "nothing measured"}.`, "");
    const chrome = [];
    let readings = 0;
    for (const [theme, frames] of Object.entries(byTheme)) {
      for (const [name, data] of Object.entries(frames)) {
        for (const e of data.elements) {
          if (e.region === "surface" || !e.visible) continue;
          readings++;
          if (!(e.failMedian || e.failWorst)) continue;
          chrome.push([theme, name, e.region + (e.headerSide ? ` (${e.headerSide} label)` : ""), clip(e.text, 30), e.colorHex, `${e.fontSize}/${e.fontWeight}`, e.background?.medianHex, e.ratioMedian, e.ratioWorst, e.failMedian ? "FAIL" : "worst case"]);
        }
      }
    }
    p(`Nav, chatbot and any other text in the same ${Object.keys(Object.values(byTheme)[0] || {}).length} frames (${vp} px, both themes): ${readings} readings, these fall short:`, "");
    table(["theme", "frame", "region", "text", "colour", "px/weight", "bg median", "ratio median", "ratio worst", "verdict"], chrome);
  }

  // A2 — nav labels along the film
  p("## A2. Header side labels along the film", "");
  p("The place and clock labels (`[data-header-side]`) are the only text left over footage. Each row is one label on one kind of ground: `film, stage pinned` has the stage's 132 px top fade under the labels; `film, stage scrolling away` is the last screen of the film, when the stage has unpinned and the labels cross it lower down; `opaque surface` is the hero band or a title card; `edge of a surface` is a position where a surface boundary cuts through the label box (four positions were placed around every such edge, plus two around the point where the site switches the labels back at the film's end). `worst` is the lower of the p5 and p95 ratios, so it catches light text on a bright patch and dark text on a dark one. Those three are read over the label's whole text box, which also holds the space around the letters; `glyph pixels under it` is read only on the pixels the letters cover (found by painting the text magenta in one more frame), and gives the share of them where the label's colour is under the threshold against the pixel behind.", "");
  for (const [vp, byTheme] of Object.entries(m.film.labels)) {
    for (const [theme, data] of Object.entries(byTheme)) {
      p(`### ${vp} px — ${theme}`, "");
      p(`Positions: ${Object.entries(data.positions).map(([k, n]) => `${n} ${k}`).join(", ")}. Label box: y ${data.labelBox.map((v) => Math.round(v)).join("–")} px.`, "");
      const rows = [];
      const spot = (r, key) => (r ? `${r[key]} — ${r.color} on ${key === "ratioMedian" ? r.bgMedian : key === "ratioP95" ? r.bgP95 : r.ratioP5 < r.ratioP95 ? r.bgP5 : r.bgP95}, scrollY ${r.scrollY}, film ${r.time} s, veil ${r.veil}${r.edge ? `, ${r.edge} ${r.where}` : ""}` : "");
      for (const [side, info] of Object.entries(data.sides)) {
        for (const ground of GROUNDS) {
          const g = info.grounds[ground];
          if (!g) continue;
          const worstAny = g.worstAny;
          const glyph = g.worstGlyph;
          rows.push([
            `${side} (${/^\d/.test(info.text) ? "clock" : clip(info.text, 20)})`,
            ground,
            g.positions,
            Object.keys(g.colours).join(", "),
            spot(g.worstMedian, "ratioMedian"),
            spot(g.worstP95, "ratioP95"),
            spot(worstAny, "ratioWorst"),
            `${g.underMedian} / ${g.underP95} / ${g.underWorst}`,
            glyph ? `${g.underGlyph} positions; at most ${Math.round(glyph.glyphShareUnder * 100)}% of the glyph pixels (scrollY ${glyph.scrollY}, film ${glyph.time} s, veil ${glyph.veil}; 5th-percentile ratio there ${glyph.glyphRatioP5})` : "",
          ]);
        }
      }
      table(["label", "ground", "positions", "label colour", "worst median", "worst p95", "worst (p5 or p95)", `under ${Object.values(data.sides)[0]?.required ?? 4.5}: median / p95 / worst`, "glyph pixels under it"], rows);
      const failing = [];
      for (const s of data.samples) {
        for (const l of s.labels) {
          if (l.ratioMedian === undefined) continue;
          if (Math.min(l.ratioMedian, l.ratioWorst) >= 4.5 && !(l.glyph && l.glyph.shareUnder >= 0.01)) continue;
          failing.push([s.scrollY, s.kind + (s.edge ? `: ${s.edge}, ${s.where}` : ""), l.side, labelGround(l) + (l.under?.surface ? ` (${l.under.surface}${l.under.surfaceShare ? ` ${Math.round(l.under.surfaceShare * 100)}%` : ""})` : ""), l.color, `${l.bgP5} / ${l.bgMedian} / ${l.bgP95}`, l.ratioMedian, l.ratioP95, l.ratioP5, l.glyph ? `${Math.round(l.glyph.shareUnder * 100)}%` : "", s.time, s.veil, s.navOverCard ? "yes" : "no", s.pastFilm ? "yes" : "no"]);
        }
      }
      p(`Every reading under 4.5 at the median pixel, at the worst pixel of the box, or on at least 1% of the glyph pixels (${failing.length}):`, "");
      table(["scrollY", "position", "label", "ground", "colour", "bg p5 / median / p95", "median", "p95", "p5", "glyph px under 4.5", "film s", "veil", "nav-over-card", "past-film"], failing.slice(0, 120));
      if (failing.length > 120) p(`…and ${failing.length - 120} more in \`metrics.json\` (\`film.labels\`).`, "");
    }
  }
  p("### The bar's own text and icons along the film", "");
  p("Read at every position the labels were read at (1440 px) or at the evenly spaced positions (390 px, where the labels are hidden and the bar is an icon row). Icons are rated against 3:1 (WCAG 1.4.11, non-text); their colour is the SVG's computed `color`, and `drawn in text colour: no` means the text-hidden frame may still show the icon, so that reading is not reliable.", "");
  const navRows = [];
  for (const [vp, byTheme] of Object.entries(m.film.nav)) {
    for (const [theme, nav] of Object.entries(byTheme)) {
      for (const t of nav.texts) navRows.push([vp, theme, "text", clip(t.text, 24), t.color, t.bgAtWorst, t.readings, t.worstMedian, t.worstAny, t.required, t.worstMedian < t.required ? "FAIL" : t.worstAny < t.required ? "worst case" : "ok"]);
      for (const c of nav.icons) navRows.push([vp, theme, c.selected ? "icon (current page)" : "icon", clip(c.label, 24), c.color, c.bgAtWorst, c.readings, c.worstMedian, c.worstAny, 3, (c.worstMedian < 3 ? "FAIL" : c.worstAny < 3 ? "worst case" : "ok") + (c.followsTextColour === false ? " (drawn in text colour: no)" : "")]);
    }
  }
  table(["width", "theme", "what", "label", "colour", "bg at worst", "readings", "worst median", "worst p5/p95", "need", "verdict"], navRows);

  // B — film background
  p("## B. Film background across the whole scroll", "");
  p("Central 60% of the viewport, text hidden, dark theme. `with content` is the page as it is (a title card covers the film while it passes); `film only` is the stage alone (video, veil, top fade, progress bar) at the same scroll position. Luminance is WCAG relative luminance, 0–1. White text on a background of luminance L has contrast 1.05 / (L + 0.05).", "");
  for (const [vp, scan] of Object.entries(m.film.scan)) {
    p(`### ${vp} px`, "");
    const b = scan.brightest;
    const row = (label, s) => (s ? [label, s.p95, s.max, s.maxHex, s.veil, s.scrollY, s.time, s.beat, r2(1.05 / (s.p95 + 0.05)), r2(1.05 / (s.max + 0.05))] : [label]);
    const rows = [row(`with content, highest p95 (${scan.samples.length} positions)`, b.withContentByP95), row("with content, highest max", b.withContentByMax), row("film only, highest p95", b.filmOnlyByP95), row("film only, highest max", b.filmOnlyByMax)];
    if (scan.dense) {
      rows.push(row(`film only, dense pass (${scan.dense.steps}), highest p95`, scan.dense.byP95), row("film only, dense pass, highest max", scan.dense.byMax));
      for (const [veil, s] of Object.entries(scan.dense.byVeil)) rows.push(row(`dense pass, veil ${veil}, highest p95`, s));
    }
    table(["sample", "L p95", "L max", "max colour", "--film-veil", "scrollY", "film s", "beat", "white vs p95", "white vs max"], rows);
    table(
      ["#", "scrollY", "film s", "beat", "veil", "content p95", "content max", "film p95", "film max"],
      scan.samples.map((s) => [s.i, s.scrollY, s.time, s.beat, s.veil, s.withContent?.p95, s.withContent?.max, s.filmOnly?.p95, s.filmOnly?.max]),
    );
  }

  // C — other pages
  p("## C. Contrast failures outside the film", "");
  p("`ratio` is against the median pixel behind the text; `worst` against the 5th/95th percentile, whichever is closer to the text. `bg` is `image` when an ancestor has a background image or backdrop filter, or the text sits over media. `home` is everything below the film.", "");
  const counts = [];
  each((name, vp, theme, rec) => {
    const c = rec.contrast;
    if (c) counts.push([name, vp, theme, c.checked, c.failMedian, c.failWorstOnly, c.imageBackgrounds, `${c.methodCheck.pixelVsDomDisagreeOver15pct}/${c.methodCheck.solidBackgrounds}`]);
  });
  table(["page", "width", "theme", "text entries", "fail", "worst case only", "on image bg", "pixel vs DOM differ >15%"], counts);
  each((name, vp, theme, rec) => {
    const c = rec.contrast;
    if (!c || (!c.failures.length && !c.worstCaseOnly.length)) return;
    p(`### ${name} — ${vp} px — ${theme}`, "");
    const rows = [...c.failures.map((f) => [f, "FAIL"]), ...c.worstCaseOnly.map((f) => [f, "worst case"])].map(([f, verdict]) => [
      verdict,
      f.region + (f.landing ? `/${f.landing}` : ""),
      clip(f.el, 46),
      clip(f.text, 30),
      f.color + (f.opacity < 0.99 ? ` @${f.opacity}` : ""),
      f.background,
      f.bg,
      f.ratio,
      f.ratioWorst,
      f.required,
      `${f.fontSize}/${f.fontWeight}`,
    ]);
    table(["", "region", "element", "text", "colour", "bg", "bg kind", "ratio", "worst", "need", "px/weight"], rows);
  });

  // D — type
  p("## D. Type inventory (dark theme; type does not change with the theme)", "");
  for (const [name, byVp] of Object.entries(m.pages)) {
    for (const [vp, byTheme] of Object.entries(byVp)) {
      const t = byTheme.dark?.type;
      if (!t) continue;
      p(`### ${name} — ${vp} px`, "");
      p(`- Families: ${t.families.map((f) => `${f.family} ×${f.count}${f.rendered ? ` → ${f.rendered.join(", ")}` : ""}`).join("; ")}`);
      p(`- ${t.textElements} text blocks, ${t.combos.length} size/weight/spacing combinations, ${t.distinctSizes.length} sizes: ${t.distinctSizes.join(", ")}`);
      p(`- Smallest: ${t.smallest.fontSize} px — ${t.smallest.where.slice(0, 4).map((w) => `"${clip(w.text, 24)}" (${w.region}, ${clip(w.el, 40)})`).join("; ")}`, "");
      table(["px", "weight", "ls em", "count", "line-height", "e.g."], t.combos.map((c) => [c.fontSize, c.fontWeight, c.letterSpacingEm, c.count, c.lineHeights.join(", "), `${clip(c.sample.text, 28)} (${c.sample.region})`]));
    }
  }

  // E — hit targets
  p("## E. Hit targets (dark theme)", "");
  p("Smaller than 44×44 CSS px at 390, or 28×28 at 1440, over `a[href]`, `button`, `summary`, inputs and ARIA widgets. `inline` marks links inside a sentence, which WCAG 2.5.8 exempts. The chatbot's controls are listed apart: it is out of scope.", "");
  for (const [name, byVp] of Object.entries(m.pages)) {
    for (const [vp, byTheme] of Object.entries(byVp)) {
      const h = byTheme.dark?.hitTargets;
      if (!h) continue;
      p(`### ${name} — ${vp} px: ${site(h.small).length} site controls under ${h.min}×${h.min} (of ${h.total} controls in all), ${bot(h.small).length} chatbot; without an accessible name: ${site(h.unnamed).length} site, ${bot(h.unnamed).length} chatbot`, "");
      const rows = (list) => list.map((t) => [`${t.w}×${t.h}`, clip(t.label, 34) || "(none)", t.region, clip(t.el, 50), t.inlineInText ? "inline" : "", t.iconOnly ? "icon only" : "", t.pageY]);
      table(["size", "label", "region", "element", "inline", "icon", "page y"], rows(site(h.small)));
      if (bot(h.small).length) {
        p("Chatbot:", "");
        table(["size", "label", "region", "element", "inline", "icon", "page y"], rows(bot(h.small)));
      }
      if (h.unnamed.length) {
        p("No accessible name:", "");
        table(["size", "region", "element", "icon only", "path"], h.unnamed.map((t) => [`${t.w}×${t.h}`, t.region, clip(t.el, 50), t.iconOnly ? "yes" : "", clip(t.path, 60)]));
      }
    }
  }

  // F — effects
  p("## F. Effects inventory (1440 px, dark, computed styles of rendered elements)", "");
  p("Each cell: elements in all, then split `chatbot / header and nav / everything else`.", "");
  table(
    ["page", ...EFFECTS],
    Object.entries(m.effects).map(([name, e]) => [
      name,
      ...EFFECTS.map((c) => {
        const z = e.computed[c].byZone;
        return e.computed[c].elements ? `${e.computed[c].elements} (${z.chatbot} / ${z.nav} / ${z.other})` : "0";
      }),
    ]),
  );
  for (const [name, e] of Object.entries(m.effects)) {
    p(`### ${name}`, "");
    for (const c of EFFECTS) {
      const cat = e.computed[c];
      if (!cat.elements) continue;
      p(`**${c}** — ${cat.elements} elements`, "");
      table(
        ["count", "owner", "element", "value"],
        cat.list.slice(0, 25).map((x) => [
          x.count,
          x.zone,
          clip(x.el, 60),
          Object.entries(x.values)
            .map(([v, n]) => (Object.keys(x.values).length > 1 ? `${clip(v, 70)} ×${n}` : clip(v, 90)))
            .join(" · "),
        ]),
      );
    }
    p(`**Animation names on elements:** ${Object.entries(e.animationNames).map(([n, c]) => `${n} ×${c}`).join(", ") || "none"}`, "");
    p(`**Animations alive at capture:** ${Object.entries(e.running).map(([n, c]) => `${n} ×${c}`).join("; ") || "none"}`, "");
    p(`**Declared in the loaded stylesheets:** ${Object.entries(e.declared).map(([n, d]) => `${n} ${d.rules}`).join(", ")}. Keyframes with a blur: ${e.declared.keyframesWithBlur.list.join(", ") || "none"}`, "");
  }

  // G — logs
  p("## G. Console errors, warnings and failed requests", "");
  const seen = new Map();
  for (const [key, store] of Object.entries(m.logs)) {
    for (const c of store.console) {
      const k = `console ${c.type}: ${c.text}`;
      (seen.get(k) || seen.set(k, []).get(k)).push(key);
    }
    for (const r of store.requests) {
      const k = `request ${r.status ?? r.failure} (${r.resource}): ${r.url.replace(/\?.*$/, "?…")}`;
      (seen.get(k) || seen.set(k, []).get(k)).push(key);
    }
  }
  table(["what", "loads", "where"], [...seen.entries()].map(([k, where]) => [clip(k, 170), where.length, clip([...new Set(where)].join(", "), 120)]));

  // H — reduced motion
  const rm = m.film.reducedMotion;
  if (rm) {
    p("## H. Reduced motion (Home, 1440 px, dark)", "");
    p(`- \`prefers-reduced-motion: reduce\` matched: ${rm.matchesReducedMotion}.`);
    p(`- Video requests: ${rm.videoRequests.length ? rm.videoRequests.join(", ") : "none"}. Video element without a source in every frame: ${rm.videoAbsent}.`, "");
    table(["frame", "kind", "still on the stage", "loaded", "video src", "data-film-ready", "veil", "shot"], Object.entries(rm.frames).map(([id, f]) => [id, f.kind, f.still, f.stillLoaded, f.video?.hasSrc, f.filmReadyAttribute, f.veil, f.shot]));
  }

  // I — overlaps
  p("## I. Chatbot and nav bar over content", "");
  p("From the named screenshots (not the full-page bands). `covered` is the share of the text, control or box that lies under the blocker. Nav-bar rows are listed for the Home's film frames only.", "");
  const overlapRows = m.overlaps
    .filter((o) => o.by !== "nav-bar" || (o.shot.startsWith("home-") && (o.region === "film" || o.region === "surface")))
    .map((o) => [o.shot, o.by, o.kind, clip(o.text, 36), clip(o.what, 44), `${o.coveredPx} px2 (${Math.round(o.covered * 100)}%)`]);
  table(["shot", "under", "kind", "text / label", "element", "covered"], overlapRows);

  // J — before / after
  const before = loadBefore();
  p("## J. Before → after", "");
  if (!before) {
    p(`No earlier run to compare with (looked for \`${COMPARE}\`).`, "");
  } else {
    p(`Before: \`${COMPARE}\`, generated ${before.meta?.generatedAt}, Home route \`${before.meta?.homePath}\`. A cell reads \`before → after\`. \`not captured\` means that page was not part of the earlier run.`, "");
    const arrow = (a, b) => `${a ?? "not captured"} → ${b ?? "not captured"}`;

    p("### Contrast failures (fail + worst-case-only, of text entries checked)", "");
    p("Same method both times for the first number: every visible text entry against the median pixel behind it. The second number (worst case only) is not strictly like for like: this script now hides link underlines in the text-hidden frame even where the site forces their colour with `!important`, and the earlier run could leave such an underline in as a pixel behind its own link. `home` is the part below the film in both runs; the film itself is in the next table.", "");
    const cell = (c) => (c ? `${c.failMedian} + ${c.failWorstOnly} of ${c.checked}` : null);
    const rowsC = [];
    for (const [name, byVp] of Object.entries(m.pages)) {
      for (const vp of Object.keys(byVp)) {
        const light = byVp[vp].light?.contrast;
        const dark = byVp[vp].dark?.contrast;
        const bl = before.pages?.[name]?.[vp]?.light?.contrast;
        const bd = before.pages?.[name]?.[vp]?.dark?.contrast;
        rowsC.push([name, vp, arrow(cell(bl), cell(light)), arrow(cell(bd), cell(dark))]);
      }
    }
    table(["page", "width", "light", "dark"], rowsC);

    p("### Text inside the Home's film", "");
    p("Not the same thing measured twice: before, the text sat on footage and each beat was one frame of a moving background; after, it sits on opaque surfaces. The counts are comparable, the ratios are not like for like.", "");
    const rowsF = [];
    for (const vp of Object.keys(m.film.text)) {
      for (const theme of Object.keys(m.film.text[vp])) {
        const was = { n: 0, fail: 0, worst: 0, min: Infinity };
        for (const frame of Object.values(before.film?.text?.[vp]?.[theme] || {})) {
          for (const e of frame.elements) {
            if (e.region !== "film" || !e.visible || e.ratioMedian === undefined) continue;
            was.n++;
            if (e.failMedian) was.fail++;
            else if (e.failWorst) was.worst++;
            was.min = Math.min(was.min, e.ratioP95);
          }
        }
        const now = { n: 0, fail: 0, worst: 0, min: Infinity };
        for (const frame of Object.values(m.film.text[vp][theme])) {
          for (const e of frame.elements) {
            if (e.region !== "surface" || !e.visible || e.ratioMedian === undefined) continue;
            now.n++;
            if (e.failMedian) now.fail++;
            else if (e.failWorst) now.worst++;
            now.min = Math.min(now.min, e.ratioWorst);
          }
        }
        const onFootage = m.film.textOnFootage[vp]?.[theme]?.onFootage.length;
        rowsF.push([vp, theme, `${was.n} → ${onFootage ?? "?"}`, `${was.n} → ${now.n}`, `${was.fail} + ${was.worst} → ${now.fail} + ${now.worst}`, `${was.min === Infinity ? "—" : was.min} → ${now.min === Infinity ? "—" : now.min}`]);
      }
    }
    table(["width", "theme", "text entries on footage", "text entries measured in the film", "fail + worst-case-only", "lowest worst-case ratio"], rowsF);

    p("### Hit targets under the minimum (dark theme; site controls, then chatbot, of all controls)", "");
    p("Same selector and thresholds both times (44×44 at 390, 28×28 at 1440).", "");
    const targets = (h) => (h ? `${site(h.small).length} site, ${bot(h.small).length} chatbot, of ${h.total}` : null);
    const rowsH = [];
    for (const [name, byVp] of Object.entries(m.pages)) {
      rowsH.push([
        name,
        ...Object.keys(byVp).flatMap((vp) => [
          arrow(targets(before.pages?.[name]?.[vp]?.dark?.hitTargets), targets(byVp[vp].dark?.hitTargets)),
          arrow(before.pages?.[name]?.[vp]?.dark?.hitTargets?.unnamed.length, byVp[vp].dark?.hitTargets?.unnamed.length),
        ]),
      ]);
    }
    table(["page", ...Object.keys(Object.values(m.pages)[0] || {}).flatMap((vp) => [`${vp} px small`, `${vp} px unnamed`])], rowsH);

    p("### Effects (1440 px, dark; elements)", "");
    p("Totals are comparable. The split by owner exists only for the new run; the earlier file has no owner per element, so its chatbot share is recovered from element names (`FaqChatbot…`) and given in brackets as `chatbot` where it is not zero.", "");
    const rowsE = [];
    for (const [name, e] of Object.entries(m.effects)) {
      const was = before.effects?.[name];
      rowsE.push([
        name,
        ...EFFECTS.map((c) => {
          const old = was?.computed?.[c];
          const oldBot = old ? old.list.filter((x) => /FaqChatbot/.test(x.el)).reduce((n, x) => n + x.count, 0) : 0;
          const z = e.computed[c].byZone;
          return `${old ? old.elements + (oldBot ? ` (${oldBot} chatbot)` : "") : "not captured"} → ${e.computed[c].elements}${e.computed[c].elements ? ` (${z.chatbot} / ${z.nav} / ${z.other})` : ""}`;
        }),
      ]);
    }
    table(["page", ...EFFECTS], rowsE);

    p("### Type (dark theme)", "");
    p("Same inventory both times: distinct computed font sizes, size/weight/letter-spacing combinations and the smallest size among visible text.", "");
    const rowsT = [];
    for (const [name, byVp] of Object.entries(m.pages)) {
      for (const vp of Object.keys(byVp)) {
        const now = byVp[vp].dark?.type;
        const was = before.pages?.[name]?.[vp]?.dark?.type;
        if (!now) continue;
        rowsT.push([
          name,
          vp,
          arrow(was?.distinctSizes.length, now.distinctSizes.length),
          arrow(was?.combos.length, now.combos.length),
          arrow(was?.smallest.fontSize, now.smallest.fontSize),
          arrow(was ? was.families.map((f) => f.family).join(", ") : null, now.families.map((f) => f.family).join(", ")),
        ]);
      }
    }
    table(["page", "width", "font sizes", "size/weight/spacing combos", "smallest px", "families"], rowsT);

    p("### Film background (dark theme, central 60%, film only)", "");
    const rowsB = [];
    for (const [vp, scan] of Object.entries(m.film.scan)) {
      const was = before.film?.scan?.[vp];
      const top = (s) => {
        if (!s) return null;
        const byMax = s.dense?.byMax && s.dense.byMax.max > s.brightest.filmOnlyByMax.max ? s.dense.byMax : s.brightest.filmOnlyByMax;
        const byP95 = s.dense?.byP95 && s.dense.byP95.p95 > s.brightest.filmOnlyByP95.p95 ? s.dense.byP95 : s.brightest.filmOnlyByP95;
        return { max: `L ${byMax.max} (${byMax.maxHex}) at veil ${byMax.veil}`, p95: `L ${byP95.p95} at veil ${byP95.veil}`, veils: s.dense?.veilValues.join(", ") };
      };
      const a = top(was);
      const b = top(scan);
      rowsB.push([vp, arrow(a?.max, b?.max), arrow(a?.p95, b?.p95), arrow(a?.veils, b?.veils)]);
    }
    table(["width", "brightest pixel", "highest p95", "veil values seen"], rowsB);

    p("### Header side labels over the film", "");
    const oldLabels = [];
    for (const [theme, frames] of Object.entries(before.film?.text?.["1440"] || {})) {
      let n = 0;
      let min = Infinity;
      let minWorst = Infinity;
      for (const frame of Object.values(frames)) {
        for (const e of frame.elements) {
          if (e.region !== "header" || !e.visible || e.ratioMedian === undefined) continue;
          if (!(e.bbox.x < 200 || e.bbox.x > 1200)) continue;
          n++;
          min = Math.min(min, e.ratioMedian);
          minWorst = Math.min(minWorst, e.ratioWorst);
        }
      }
      oldLabels.push(`${theme}: ${n} readings, lowest median ${min}, lowest worst-case ${minWorst}`);
    }
    p(`Not comparable. Before, the labels were read only in the ten beat frames per theme, over a film that carried a 0.58 veil (${oldLabels.join("; ") || "no readings"}; picked out of the earlier file by their position at the two ends of the bar). After, they are read at every position of section A2.`, "");
  }

  p("## Limits of the method", "");
  p("- Not measured: text inside closed disclosures (FAQ answers, the chatbot panel, the gallery dialog), hover/focus/active states, text drawn by pseudo-elements, SVG text, input values, and emoji (they ignore the text colour, so they stay in the text-hidden frame).");
  p("- `bg median` / `p5` / `p95` are single pixels picked by luminance rank from up to 60 000 samples of the text box; boxes include the gaps between lines.");
  p("- Section A2 reads the labels at discrete scroll positions (the spacing of the dense pass is about 0.1 s of film). The film between two positions is not read, and each position is read after the film and the veil's 200 ms ease have settled, not while they move.");
  p("- The four positions around each edge are fixed offsets into the label box; they show what happens while an edge crosses the labels, not how long a visitor stays there.");
  p("- The film background scan and the film-only frames run in the dark theme only; type inventory, hit targets and effects are read in the dark theme only.");
  p("- Full-page JPEGs are stitched from bands of 60% of the viewport, each shot with that band at the top of the screen. Fixed chrome is painted once and sticky boxes sit at their place in the flow; `metrics.json` lists fixed boxes that fitted in neither the first nor the last band (`full.fixedLeftOut`).");
  p("- The chatbot greeting is on screen in every `-top.png` and in `hero-top.png` (it appears 2.5 s after load and leaves after 8 s); it is dismissed before everything else is shot or measured. `hero-top-clean.png` is the same frame without it.", "");
  p("## Notes from the run", "");
  for (const n of m.meta.notes) p(`- ${n}`);
  if (!m.meta.notes.length) p("- none");
  p("");
  writeFileSync(path.join(OUT, "metrics.md"), lines.join("\n"));
}

// ─── Main ───────────────────────────────────────────────────────────────────
if (args["summary-only"]) {
  const file = path.join(OUT, "metrics.json");
  Object.assign(metrics, JSON.parse(readFileSync(file, "utf8")));
  writeSummary();
  log(`metrics.md rewritten from ${file}`);
  process.exit(0);
}
const startedAt = Date.now();
const browser = await chromium.launch();
metrics.meta.chromium = browser.version();
if (!sharp) {
  helperPage = await (await browser.newContext()).newPage();
  note("sharp is not resolvable from node_modules: screenshots are decoded with a canvas in a helper page");
}
try {
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      if (wants("home")) await runHome(browser, vp, theme);
      for (const def of PAGES) {
        if (wants(def.name)) await runPage(browser, vp, theme, def);
      }
      if (wants("scan")) await runTrack(browser, vp, theme);
    }
  }
  if (wants("rm")) await runReducedMotion(browser);
} finally {
  await browser.close();
  metrics.meta.durationSec = Math.round((Date.now() - startedAt) / 1000);
  metrics.meta.files = checkFiles(startedAt);
  for (const file of metrics.meta.files.missing) note(`missing screenshot: ${file}`);
  metrics.meta.notes = notes;
  writeFileSync(path.join(OUT, "metrics.json"), JSON.stringify(metrics, null, 1));
  writeSummary();
  log(`done in ${metrics.meta.durationSec} s → ${OUT}`);
}

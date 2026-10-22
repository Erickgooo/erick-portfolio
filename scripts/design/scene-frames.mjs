// Frame sequences of one animated scene, so a still capture is not the only
// record of its motion: `count` PNGs `interval` ms apart, cropped to the
// scene, at 390 and 1440 px in light and dark.
//
//   npm run build && npx next start -p 3341
//   node scripts/design/scene-frames.mjs --base http://localhost:3341 --page / \
//     --selector '[class*="activity_window"]' --name activity [--count 6] [--interval 900]
//
// Options:
//   --page <path>        page to open (default /)
//   --selector <css>     the scene element; frames are cropped to its box
//   --name <scene>       file prefix (default "scene")
//   --count, --interval  number of frames and ms between them (6, 900)
//   --wait <ms>          pause after scrolling, before the first frame (300)
//   --step <k>           the scene is step k of a SceneStepper: on desktop the
//                        page scrolls to where step k is active (the stepper
//                        replays that scene from its start); on phones the
//                        selector is simply scrolled into view
//   --at-load            a hero scene: no scroll; the first frame is taken as
//                        the site intro starts to fade
//   --widths, --themes   default 390,1440 and light,dark
//   --pad <px>           margin around the crop (12)
//   --mask-media         images, videos and iframes become flat boxes (the
//                        media rule: for our own checks, never the pieces)
//   --reduced            emulate prefers-reduced-motion: reduce
//   --out <dir>          default docs/design/screens/rediseno-2026-escenas/frames
//
// Files: <out>/<name>-<width>-<theme>-<n>.png (n from 1).
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "@playwright/test";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const flag = (name) => args.includes(`--${name}`);

const base = arg("base", "http://localhost:3341");
const pagePath = arg("page", "/");
const selector = arg("selector", null);
const name = arg("name", "scene");
const count = Number(arg("count", 6));
const interval = Number(arg("interval", 900));
const wait = Number(arg("wait", 300));
const step = arg("step", null);
const pad = Number(arg("pad", 12));
const atLoad = flag("at-load");
const widths = arg("widths", "390,1440").split(",").map(Number);
const themes = arg("themes", "light,dark").split(",");
const out = arg("out", "docs/design/screens/rediseno-2026-escenas/frames");
const maskMedia = flag("mask-media");
const reduced = flag("reduced");

if (!selector) {
  console.error("--selector is required");
  process.exit(1);
}

const MASK_CSS =
  "img, video, iframe, picture, svg image { filter: brightness(0) !important; opacity: 0.14 !important; }";
const INTRO = '[class*="IntroLoader_overlay"]';
const VIEWPORTS = {
  390: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
  1440: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const errors = [];

for (const width of widths) {
  for (const theme of themes) {
    const opts = VIEWPORTS[width] ?? { viewport: { width, height: 900 } };
    const ctx = await browser.newContext({
      ...opts,
      colorScheme: theme,
      reducedMotion: reduced ? "reduce" : "no-preference",
    });
    await ctx.addInitScript((t) => {
      try {
        localStorage.setItem("data-theme", t);
      } catch {}
    }, theme);
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(`${width} ${theme}: ${e.message}`));
    await page.goto(`${base}${pagePath}`, { waitUntil: "domcontentloaded" });
    if (maskMedia) await page.addStyleTag({ content: MASK_CSS });

    if (atLoad) {
      // The first frame as the intro starts to fade (or at once without one).
      await page
        .waitForFunction(
          (q) => {
            const el = document.querySelector(q);
            return !el || /IntroLoader_leaving/.test(el.className);
          },
          INTRO,
          { timeout: 12000 },
        )
        .catch(() => {});
    } else {
      // Let the intro (home only) finish before scrolling.
      await page.waitForSelector(INTRO, { state: "detached", timeout: 12000 }).catch(() => {});
      await page.waitForSelector(selector, { state: "attached", timeout: 10000 });
      const target = await page.evaluate(
        ({ q, k }) => {
          const el = document.querySelector(q);
          if (!el) return null;
          const stepper = el.closest("[data-stepper]");
          const track = stepper?.querySelector("[data-track]");
          if (k !== null && track && window.matchMedia("(min-width: 1024px)").matches) {
            const n = Number(getComputedStyle(stepper).getPropertyValue("--n")) || 1;
            const top = track.getBoundingClientRect().top + window.scrollY;
            const travel = track.offsetHeight - window.innerHeight;
            return top + (travel * (Number(k) + 0.35)) / n;
          }
          const box = el.getBoundingClientRect();
          return box.top + window.scrollY - Math.max(0, (window.innerHeight - box.height) / 2);
        },
        { q: selector, k: step },
      );
      if (target === null) throw new Error(`no element for ${selector}`);
      // Two hops, so a stepper passes through the steps before it, as a reader would.
      await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 400)), target);
      await page.waitForTimeout(250);
      await page.evaluate((y) => window.scrollTo(0, y), target);
    }
    await page.waitForTimeout(wait);

    const vp = page.viewportSize();
    for (let n = 1; n <= count; n++) {
      const box = await page.evaluate((q) => {
        const els = Array.from(document.querySelectorAll(q));
        // The visible match (a stepper layer that is on, a scene on screen).
        const el =
          els.find((e) => {
            const r = e.getBoundingClientRect();
            const layer = e.closest("[data-scene-layer]");
            return (
              r.width > 0 &&
              r.bottom > 0 &&
              r.top < innerHeight &&
              (!layer || layer.hasAttribute("data-on"))
            );
          }) ?? els[0];
        const r = el.getBoundingClientRect();
        return { x: r.left, y: r.top, w: r.width, h: r.height };
      }, selector);
      const x = Math.max(0, box.x - pad);
      const y = Math.max(0, box.y - pad);
      const clip = {
        x,
        y,
        width: Math.min(vp.width - x, box.w + pad * 2),
        height: Math.min(vp.height - y, box.h + pad * 2),
      };
      const file = path.join(out, `${name}-${width}-${theme}-${n}.png`);
      await page.screenshot({ path: file, clip });
      if (n < count) await page.waitForTimeout(interval);
    }
    await ctx.close();
  }
}
await browser.close();
if (errors.length) console.log(`page errors:\n${errors.join("\n")}`);
console.log(`frames of ${name} in ${out}`);

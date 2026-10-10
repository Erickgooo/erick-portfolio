// Screenshots of the Home directions on /lab: hero, chosen stretches of the film
// and the top of what follows it, at 390 and 1440 px in light and dark.
//
//   node scripts/design/lab-shots.mjs --base http://localhost:3111 --out docs/design/screens/lab [--only a,b] [--quick]
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const base = arg("base", "http://localhost:3111");
const out = arg("out", "docs/design/screens/lab");
const only = arg("only", "a,b,c").split(",");
const quick = args.includes("--quick");

// Where to stop in each direction: a film section and how far through it (0–1),
// a film section placed part of the way down the viewport, or a selector to
// bring to the top of the viewport.
const STOPS = {
  a: [
    { name: "hero", y: 0 },
    { name: "film-1", beat: "solution", at: 0.3 },
    { name: "film-2", beat: "benefit-3", at: 0.3 },
    { name: "after", selector: "[data-lab] h2" },
  ],
  b: [
    { name: "hero", y: 0 },
    { name: "film-1", beat: "qms", view: [0.28, 0.5] },
    { name: "film-2", beat: "leads", view: [0.28, 0.5] },
    { name: "after", selector: "[data-lab] table" },
  ],
  c: [
    { name: "hero", y: 0 },
    { name: "film-1", beat: "after-2", at: 0.12 },
    { name: "film-2", selector: "[data-lab] section:has(> div > h2):nth-of-type(4)" },
    { name: "after", selector: "[data-lab] ul" },
  ],
};

const VIEWPORTS = [
  { w: 1440, h: 900, dsf: 1, mobile: false },
  { w: 390, h: 844, dsf: 2, mobile: true },
];
const THEMES = quick ? ["dark"] : ["dark", "light"];

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  for (const theme of THEMES) {
    const context = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: vp.dsf,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      colorScheme: theme,
    });
    await context.addInitScript((value) => {
      localStorage.setItem("data-theme", value);
    }, theme);
    for (const id of only) {
      const page = await context.newPage();
      await page.goto(`${base}/lab?v=${id}&clean=1`, { waitUntil: "load" });
      await page
        .waitForSelector("[data-film-stage] video", { state: "attached", timeout: 15000 })
        .catch(() => {});
      await page
        .waitForFunction(
          () => document.querySelector("[data-film-root],[data-film-window]")?.hasAttribute("data-film-ready"),
          null,
          { timeout: 30000 },
        )
        .catch(() => console.warn(`film not ready: ${id} ${vp.w} ${theme}`));
      // The chatbot greeting comes and goes on its own; wait it out.
      await page.waitForTimeout(quick ? 500 : 11000);
      for (const stop of STOPS[id]) {
        const y = await page.evaluate((s) => {
          if (typeof s.y === "number") return s.y;
          const el = s.beat
            ? document.querySelector(`[data-film-beat="${s.beat}"]`)
            : document.querySelector(s.selector);
          if (!el) return -1;
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          // `view`: put the section's top that far down the viewport (wide, narrow).
          if (s.view) return top - window.innerHeight * s.view[window.innerWidth < 900 ? 1 : 0];
          return s.beat ? top + rect.height * s.at : top - 96;
        }, stop);
        if (y < 0) {
          console.warn(`missing stop ${stop.name}: ${id}`);
          continue;
        }
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(900);
        await page
          .waitForFunction(() => !document.querySelector("video")?.seeking, null, { timeout: 5000 })
          .catch(() => {});
        await page.waitForTimeout(300);
        const file = path.join(out, `${id}-${vp.w}-${theme}-${stop.name}.png`);
        await page.screenshot({ path: file });
        console.log(file);
      }
      await page.close();
    }
    await context.close();
  }
}
await browser.close();

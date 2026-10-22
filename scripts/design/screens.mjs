// Full-page screenshots of the redesigned site, one viewport at a time and
// stitched, at 390 and 1440 px in light and dark.
//
//   npm run build && npx next start -p 3301
//   node scripts/design/screens.mjs [--base http://localhost:3301] [--out docs/design/screens/rediseno-2026] [--pages home,about]
//
// Files: <out>/<page>-<390|1440>-<light|dark>.png
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "@playwright/test";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const base = arg("base", "http://localhost:3301");
const out = arg("out", "docs/design/screens/rediseno-2026");
const ALL = {
  home: "/",
  about: "/about",
  work: "/work",
  caso: "/work/leadbot-ai",
  blog: "/blog",
  "blog-post": "/blog/my-workspace",
  gallery: "/gallery",
  "404": "/this-page-does-not-exist",
  unauthorized: "/unauthorized",
};
const only = arg("pages", Object.keys(ALL).join(",")).split(",");
const VIEWPORTS = {
  390: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
  1440: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

async function newPage(browser, width, theme, reducedMotion = "no-preference") {
  const opts = VIEWPORTS[width] ?? { viewport: { width, height: 900 } };
  const ctx = await browser.newContext({ ...opts, colorScheme: theme, reducedMotion });
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem("data-theme", t);
    } catch {}
  }, theme);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  return { ctx, page, errors };
}

// A full-page screenshot is taken in one go after scrolling back to the top,
// so reveals that replay on re-entry, pinned steppers and fans that reset when
// they leave the viewport come out half-played. Instead, shoot one viewport at
// a time, let each one settle, and stack the frames. Fixed and sticky bars
// (header, chatbot button) show in the first frame only. A pinned stage shows
// up once per frame it spans, at the step that frame reached.
async function stitchedShot(browser, page, file) {
  const { width, height: vh } = page.viewportSize();
  const frames = [];
  for (let y = 0; frames.length < 60; y += vh) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(1700);
    const top = await page.evaluate(() => window.scrollY);
    frames.push({ top, data: (await page.screenshot()).toString("base64") });
    if (frames.length === 1) {
      await page.evaluate(() => {
        for (const el of document.querySelectorAll("body *")) {
          const cs = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          if ((cs.position === "fixed" || cs.position === "sticky") && box.height < 240) {
            el.style.setProperty("visibility", "hidden", "important");
          }
        }
      });
    }
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    if (top + vh >= total || top < y) break;
  }
  const last = frames[frames.length - 1].top + vh;
  const dsf = await page.evaluate(() => window.devicePixelRatio);
  const ctx = await browser.newContext({ viewport: { width, height: vh }, deviceScaleFactor: dsf });
  const sheet = await ctx.newPage();
  const imgs = frames
    .map(
      (f) =>
        `<img src="data:image/png;base64,${f.data}" style="position:absolute;left:0;top:${f.top}px;width:${width}px;height:${vh}px">`,
    )
    .join("");
  await sheet.setContent(
    `<body style="margin:0"><div style="position:relative;width:${width}px;height:${last}px">${imgs}</div></body>`,
    { waitUntil: "load" },
  );
  await sheet.screenshot({ path: file, fullPage: true });
  await ctx.close();
}

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
for (const name of only) {
  for (const width of [390, 1440]) {
    for (const theme of ["light", "dark"]) {
      const { ctx, page } = await newPage(browser, width, theme);
      await page.goto(`${base}${ALL[name]}`, { waitUntil: "networkidle" });
      // The intro plays for five seconds on every document load.
      await page.waitForTimeout(6500);
      await stitchedShot(browser, page, path.join(out, `${name}-${width}-${theme}.png`));
      await ctx.close();
    }
  }
}
await browser.close();
console.log(`screens in ${out}`);

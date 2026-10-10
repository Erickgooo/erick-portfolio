// Lab INP: mobile viewport, 4x CPU throttling, real (trusted) Playwright input.
// Reports web-vitals INP per page plus long tasks (>50 ms) observed while scrolling.
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromium, devices } from "@playwright/test";

// web-vitals' package "exports" don't expose the IIFE build, so read it by path.
const WEB_VITALS = readFileSync(
  path.join(process.cwd(), "node_modules", "web-vitals", "dist", "web-vitals.iife.js"),
  "utf8",
);
const BASE = process.env.INP_BASE_URL ?? "http://localhost:3100";

const SCENARIOS = {
  home: async (page) => {
    // Mobile viewport: only the icon variant is visible; it carries the accessible name.
    const burger = page.getByRole("button", { name: "Open menu" });
    if (await burger.isVisible()) await burger.click();
    await page.locator("header").getByRole("link", { name: "Projects" }).click();
    await page.waitForURL("**/work");
  },
  work: async (page) => {
    const row = page.locator("[data-work-row] a").first();
    const target = (await row.count()) ? row : page.locator("a[href^='/work/']").first();
    await target.click();
    await page.waitForURL("**/work/**");
  },
  about: async (page) => {
    await page.getByRole("button", { name: "Toggle ErickBot" }).click();
    await page.getByRole("button", { name: "Toggle ErickBot" }).click();
  },
  blog: async (page) => {
    await page.getByRole("button", { name: /^Copy link to section/ }).first().click();
  },
  gallery: async (page) => {
    const cell = page.locator("[data-gallery-cell]").first();
    if (await cell.count()) {
      await cell.click();
      await page.keyboard.press("Escape");
    }
    await page.getByRole("button", { name: /^Play video:/ }).first().click();
  },
};
const PATHS = { home: "/", work: "/work", about: "/about", blog: "/blog/my-workspace", gallery: "/gallery" };

const browser = await chromium.launch();
const rows = [];
for (const [name, act] of Object.entries(SCENARIOS)) {
  const context = await browser.newContext({ ...devices["Pixel 7"] });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(`${WEB_VITALS};
    window.__inp = 0; window.__long = [];
    webVitals.onINP((m) => { window.__inp = Math.max(window.__inp, m.value); }, { reportAllChanges: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(Math.round(e.duration)); })
      .observe({ type: "longtask", buffered: true });`);
  await page.goto(BASE + PATHS[name]);
  // "load", not "networkidle": Chromium keeps the home film's blob: request open.
  await page.waitForLoadState("load");
  await page.waitForTimeout(1500); // let hydration settle: its long tasks are not scroll work
  await page.evaluate(() => {
    window.__long = [];
  });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  const scrollLong = await page.evaluate(() => window.__long.slice());
  let error = "";
  try {
    await act(page);
    await page.waitForTimeout(1000);
  } catch (e) {
    error = String(e).split("\n")[0];
  }
  // Force INP to report: a visibility change flushes the metric.
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  const inp = await page.evaluate(() => window.__inp);
  rows.push({ name, inp, scrollLong, error });
  await context.close();
}
await browser.close();

console.log("| Page | INP lab (ms) | Long tasks while scrolling (ms) | Note |");
console.log("|---|---|---|---|");
for (const r of rows) {
  console.log(`| ${r.name} | ${Math.round(r.inp)} | ${r.scrollLong.join(", ") || "none"} | ${r.error} |`);
}

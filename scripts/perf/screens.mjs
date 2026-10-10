// Usage: node scripts/perf/screens.mjs <tag> [baseUrl]
// Full-page screenshots for every page × {mobile, desktop} × {dark, light}.
// reducedMotion "reduce" makes every animation sit at its final state, so shots are deterministic.
import { mkdirSync } from "node:fs";
import { chromium, devices } from "@playwright/test";

const [tag, base = "http://localhost:3100"] = process.argv.slice(2);
if (!tag) {
  console.error("usage: screens.mjs <tag> [baseUrl]");
  process.exit(1);
}
const PAGES = { home: "/", about: "/about", work: "/work", blog: "/blog/my-workspace", gallery: "/gallery" };
const out = `.perf/screens/${tag}`;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const [vpName, vp] of Object.entries({ mobile: devices["Pixel 7"], desktop: devices["Desktop Chrome"] })) {
  for (const scheme of ["dark", "light"]) {
    const context = await browser.newContext({ ...vp, colorScheme: scheme, reducedMotion: "reduce" });
    const page = await context.newPage();
    for (const [name, p] of Object.entries(PAGES)) {
      await page.goto(base + p);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(name === "home" ? 6000 : 800);
      await page.screenshot({ path: `${out}/${name}-${vpName}-${scheme}.png`, fullPage: true });
    }
    await context.close();
  }
}
await browser.close();
console.log(`Screens written to ${out}`);

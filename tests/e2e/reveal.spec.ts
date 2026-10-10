import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 250) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
  });
}

test("about has reveal targets", async ({ page }) => {
  await page.goto("/about");
  expect(await page.locator("[data-reveal]").count()).toBeGreaterThan(0);
});

test("every [data-reveal] ends fully visible when scrolled into view", async ({ page }) => {
  await page.goto("/about");
  await scrollThrough(page);
  const count = await page.locator("[data-reveal]").count();
  const offenders: string[] = [];
  for (let i = 0; i < count; i++) {
    const el = page.locator("[data-reveal]").nth(i);
    await el.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(700);
    const opacity = Number(await el.evaluate((node) => getComputedStyle(node).opacity));
    if (opacity < 0.99) offenders.push(`#${i}: ${opacity}`);
  }
  expect(offenders).toEqual([]);
});

test("elements visible at load are not stuck mid-fade", async ({ page }) => {
  await page.goto("/about");
  await page.waitForTimeout(700);
  const inView = await page.$$eval("[data-reveal]", (els) =>
    els
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight * 0.6;
      })
      .map((el) => Number(getComputedStyle(el).opacity)),
  );
  for (const o of inView) expect(o).toBeGreaterThan(0.99);
});

test("firefox uses the IntersectionObserver fallback", async ({ page, browserName }) => {
  test.skip(browserName !== "firefox", "fallback path is Firefox-specific");
  await page.goto("/about");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.className))
    .toContain("mo-ready");
  await scrollThrough(page);
  const missing = await page.$$eval("[data-reveal]:not(.is-in)", (els) => els.length);
  expect(missing).toBe(0);
});

test("reduced motion: nothing is transformed or faded", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about");
  const moving = await page.$$eval(
    "[data-reveal]",
    (els) =>
      els.filter((el) => {
        const cs = getComputedStyle(el);
        return cs.transform !== "none" || Number(cs.opacity) < 1;
      }).length,
  );
  expect(moving).toBe(0);
});

test("blocks in view at load are sharp, not left mid-blur", async ({ page }) => {
  // A block taller than the viewport finishes its entry range late; a sub-pixel
  // blur left on running text reads as a rendering fault.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/about");
  await page.waitForTimeout(700);
  const filters = await page.$$eval("[data-reveal]", (els) =>
    els
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight * 0.6;
      })
      .map((el) => getComputedStyle(el).filter),
  );
  expect(filters.length).toBeGreaterThan(0);
  for (const f of filters) expect(["none", "blur(0px)"]).toContain(f);
});

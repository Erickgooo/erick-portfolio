import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { introDone } from "./helpers";

const TEXT = "Most companies hire a department. I build the system that does the work of one.";

// Scroll timelines are sampled once per frame, so wait two frames before reading styles.
const scrollIntoBeat = (page: Page, progress: number) =>
  page.evaluate(async (p) => {
    const el = document.querySelector('[data-film-beat="tagline"]') as HTMLElement;
    const top = el.getBoundingClientRect().top + window.scrollY;
    // The site scrolls smoothly; tests need the position now.
    window.scrollTo({ top: top + el.offsetHeight * p, behavior: "instant" });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }, progress);

const opacities = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-tagline-word]")).map((el) =>
      Number(getComputedStyle(el).opacity),
    ),
  );

test("the tagline is one heading with its exact text", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-tagline]")).toHaveText(TEXT);
  expect(await page.locator("[data-tagline]").evaluate((el) => el.tagName)).toBe("H2");
});

test("words light up in reading order as the section scrolls", async ({ page }, testInfo) => {
  test.skip(
    !["chromium", "mobile-chromium"].includes(testInfo.project.name),
    "scroll timelines are asserted on Chromium",
  );
  await page.goto("/");
  await introDone(page);
  await scrollIntoBeat(page, 0.02);
  let values = await opacities(page);
  expect(values.at(-1)).toBeLessThan(0.5);
  await scrollIntoBeat(page, 0.3);
  values = await opacities(page);
  expect(values[0]).toBe(1);
  expect(values.at(-1)).toBeLessThan(0.5);
  await scrollIntoBeat(page, 0.75);
  values = await opacities(page);
  expect(Math.min(...values)).toBe(1);
});

test("fallback engines end with every word lit", async ({ page, browserName }) => {
  test.skip(browserName !== "firefox", "IntersectionObserver path");
  await page.goto("/");
  await introDone(page);
  await scrollIntoBeat(page, 0.3);
  await expect.poll(async () => Math.min(...(await opacities(page))), { timeout: 5000 }).toBe(1);
});

test("reduced motion: every word is lit from the start", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const values = await opacities(page);
  expect(values.length).toBeGreaterThan(10);
  expect(Math.min(...values)).toBe(1);
});

test("the film reaches the tagline's shots while it is on screen", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "one engine is enough for the mapping");
  await page.goto("/");
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          Boolean(document.querySelector("[data-film-root]")?.hasAttribute("data-film-ready")),
        ),
      { timeout: 20000 },
    )
    .toBe(true);
  await introDone(page);
  await scrollIntoBeat(page, 0.5);
  const time = () =>
    page.evaluate(
      () => (document.querySelector("[data-film-video]") as HTMLVideoElement).currentTime,
    );
  await expect.poll(time).toBeGreaterThan(4.6);
  expect(await time()).toBeLessThan(5.6);
});

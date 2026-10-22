import { expect, test } from "./fixtures";

// The home in Workbench (redesign 2026): links, layout and motion rules.

const INTRO = '[class*="IntroLoader_overlay"]';

test("home cases link to their real project pages", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page
    .locator("#work ul a")
    .evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) expect(href).toMatch(/^\/work\/[a-z0-9-]+$/);
  await expect(page.locator('a[href^="/lab"]')).toHaveCount(0);
});

test("no horizontal scroll on the home from 360 to 1440 px", async ({ page }) => {
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `at ${width}px`).toBeLessThanOrEqual(0);
  }
});

test("the bench objects wait behind the intro, then rise", async ({ page }) => {
  await page.goto("/");
  const bench = page.locator('[class*="bench_bench"]');
  // Server HTML and first frames: held in place while the intro covers them.
  if (await page.locator(INTRO).count()) await expect(bench).toHaveAttribute("data-hold", "");
  await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 9000 });
  await expect(bench).not.toHaveAttribute("data-hold", "");
});

test("with reduced motion every section shows without scrolling or animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 9000 });
  const hidden = await page.locator("main [data-reveal]").evaluateAll((els) =>
    els.filter((el) => {
      // Visually hidden lists (screen-reader copies of the tool board) are skipped.
      const box = el.getBoundingClientRect();
      return box.width > 1 && getComputedStyle(el).opacity !== "1";
    }),
  );
  expect(hidden.length).toBe(0);
  // No CSS animation runs inside the page content (the chatbot is not part of it).
  const running = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === "running" && a instanceof CSSAnimation)
      .filter((a) => {
        const target = (a.effect as KeyframeEffect | null)?.target;
        return target instanceof Element && target.closest("main");
      })
      .map((a) => (a as CSSAnimation).animationName),
  );
  expect(running).toEqual([]);
});

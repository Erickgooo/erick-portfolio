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

// Scenes (redesign 2026, step 3): drawn, aria-hidden, held behind the intro.

test("the hero's ambient layer waits behind the intro, then rises", async ({ page }) => {
  await page.goto("/");
  const ambient = page.locator('[class*="ambient_ambient"]');
  await expect(ambient).toHaveCount(1);
  if (await page.locator(INTRO).count()) await expect(ambient).not.toHaveAttribute("data-on", "");
  await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 9000 });
  await expect(ambient).toHaveAttribute("data-on", "");
});

test("every scene is hidden from assistive tech and reserves its box", async ({ page }) => {
  await page.goto("/");
  const scenes = page.locator("main [data-scene]");
  expect(await scenes.count()).toBeGreaterThan(4);
  const report = await scenes.evaluateAll((els) =>
    els.map((el) => ({
      hidden: el.closest('[aria-hidden="true"]') !== null,
      size: el.getBoundingClientRect().width * el.getBoundingClientRect().height,
    })),
  );
  for (const scene of report) {
    expect(scene.hidden).toBe(true);
    expect(scene.size).toBeGreaterThan(0);
  }
});

test("with reduced motion every scene shows its final state at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 9000 });
  const scenes = await page.locator("main [data-scene]").evaluateAll((els) =>
    els.map((el) => ({
      last: (el.dataset.steps ?? "0").split(",").length - 1,
      at: el.dataset.step,
    })),
  );
  expect(scenes.length).toBeGreaterThan(0);
  for (const scene of scenes) expect(Number(scene.at)).toBe(scene.last);
  const typedDone = await page
    .locator("main [data-type]")
    .evaluateAll((els) => els.every((el) => el.hasAttribute("data-typed")));
  expect(typedDone).toBe(true);
});

test("the builds stepper pins and changes scene on desktop, and stacks on phones", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 9000 });
  const stepper = page.locator("[data-stepper]");
  const layers = stepper.locator("[data-scene-layer]");
  await expect(layers).toHaveCount(4);
  if ((page.viewportSize()?.width ?? 0) < 1024) {
    await expect(stepper).toHaveAttribute("data-active", "stack");
    await expect(stepper.locator("[data-scene-layer][data-on]")).toHaveCount(4);
    return;
  }
  // Six tenths of the way through the track: the third step.
  const y = await stepper.locator("[data-track]").evaluate((track: HTMLElement) => {
    const top = track.getBoundingClientRect().top + window.scrollY;
    return top + (track.offsetHeight - window.innerHeight) * 0.6;
  });
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await expect(stepper).toHaveAttribute("data-active", "2");
  await expect(stepper.locator("[data-scene-layer][data-on]")).toHaveCount(1);
  await expect(stepper.locator('[data-scene-layer][data-step="2"]')).toHaveAttribute("data-on", "");
});

test("the LeadBot case tells what the bot does in a drawn scene", async ({ page }) => {
  await page.goto("/work/leadbot-ai");
  const scene = page.locator("main [data-scene]");
  await expect(scene).toHaveCount(1);
  await expect(scene).toHaveAttribute("aria-hidden", "true");
  // Its figure is the case's own.
  await expect(scene.locator("[data-count]")).toHaveAttribute("data-count", "85%");
});

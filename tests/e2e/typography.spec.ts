import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { introDone } from "./helpers";

const HEADLINE =
  "I build your marketing engine from zero and make it outperform a full department.";

const isChromium = (project: string) => ["chromium", "mobile-chromium"].includes(project);

/** Puts a film section's top edge `offset` viewport-heights below the top of the viewport. */
const placeSection = (page: Page, beat: string, offset: number) =>
  page.evaluate(
    async ([id, o]) => {
      const el = document.querySelector(`[data-film-beat="${id}"]`) as HTMLElement;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - window.innerHeight * (o as number), behavior: "instant" });
      // Scroll timelines are sampled once per frame.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    },
    [beat, offset] as const,
  );

/** Opacity and blur of every animated word inside a scope. */
const wordStates = (page: Page, scope: string) =>
  page.evaluate(
    (selector) =>
      Array.from(document.querySelectorAll(`${selector} [data-word] > span`)).map((el) => {
        const style = getComputedStyle(el);
        return { opacity: Number(style.opacity), sharp: /^(none|blur\(0px\))$/.test(style.filter) };
      }),
    scope,
  );

/** How much of a benefit figure is still unfilled, as the top inset of its fill layer in %. */
const unfilled = (page: Page, index: number) =>
  page.evaluate((i) => {
    const el = document.querySelectorAll("[data-figure-fill]")[i];
    const clip = getComputedStyle(el).clipPath;
    if (clip === "none") return 0;
    const match = clip.match(/inset\(([\d.]+)/);
    return match ? Number(match[1]) : -1;
  }, index);

test("the split headline still reads as one sentence", async ({ page }) => {
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveAccessibleName(HEADLINE);
  await expect(h1).toHaveText(HEADLINE);
  await expect(h1.locator("[data-word]")).toHaveCount(HEADLINE.split(" ").length);
});

test("after the intro every word of the headline has arrived, sharp", async ({ page }) => {
  await page.goto("/");
  await introDone(page);
  await expect
    .poll(
      async () => (await wordStates(page, "h1")).every((word) => word.opacity === 1 && word.sharp),
      { timeout: 8000 },
    )
    .toBe(true);
});

test("key words are solid and underlined in the brand colour, not outlined", async ({ page }) => {
  await page.goto("/");
  const marked = page.locator("h1 [data-word][data-hl] > span");
  expect(await marked.count()).toBeGreaterThanOrEqual(2);
  const style = await marked.first().evaluate((el) => {
    const computed = getComputedStyle(el);
    return {
      stroke: Number.parseFloat(computed.getPropertyValue("-webkit-text-stroke-width")),
      colour: computed.color,
      marker: computed.backgroundImage,
    };
  });
  // Outlined type read as thin and weak in this typeface.
  expect(style.stroke).toBe(0);
  expect(style.colour).toBe("rgb(255, 255, 255)");
  // Cobalto, #2d5bff.
  expect(style.marker).toContain("rgb(45, 91, 255)");
});

test("problem and solution sit in glass panels on opposite sides", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "desktop composition");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const panels = await page.evaluate(() =>
    ["problem", "solution"].map((beat) => {
      const el = document.querySelector(`[data-film-beat="${beat}"] [data-panel]`) as HTMLElement;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        centre: rect.left + rect.width / 2,
        glass: style.backdropFilter !== "none" && style.backdropFilter !== "",
      };
    }),
  );
  expect(panels[0].centre).toBeLessThan(720);
  expect(panels[1].centre).toBeGreaterThan(720);
  expect(panels.every((panel) => panel.glass)).toBe(true);
});

test("the four benefits alternate sides", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "desktop composition");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const figureIsLeft = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-benefit]")).map((benefit) => {
      const figure = (
        benefit.querySelector("[data-benefit-figure]") as HTMLElement
      ).getBoundingClientRect();
      const text = (
        benefit.querySelector("[data-benefit-text]") as HTMLElement
      ).getBoundingClientRect();
      return figure.left + figure.width / 2 < text.left + text.width / 2;
    }),
  );
  expect(figureIsLeft).toEqual([true, false, true, false]);
});

test("a section's words arrive as it scrolls in", async ({ page }, testInfo) => {
  test.skip(!isChromium(testInfo.project.name), "scroll timelines are asserted on Chromium");
  await page.goto("/");
  await introDone(page);
  // Just entering from the bottom: the last word has not started.
  await placeSection(page, "problem", 0.9);
  expect((await wordStates(page, '[data-film-beat="problem"] h2')).at(-1)?.opacity).toBeLessThan(
    0.5,
  );
  // Pinned: every word is there and sharp.
  await placeSection(page, "problem", -0.1);
  const words = await wordStates(page, '[data-film-beat="problem"] h2');
  expect(words.length).toBeGreaterThan(10);
  expect(words.every((word) => word.opacity === 1 && word.sharp)).toBe(true);
});

test("a benefit figure starts as an outline and fills in with the scroll", async ({
  page,
}, testInfo) => {
  test.skip(!isChromium(testInfo.project.name), "scroll timelines are asserted on Chromium");
  await page.goto("/");
  await introDone(page);
  await placeSection(page, "benefit-1", 0.6);
  expect(await unfilled(page, 0)).toBeGreaterThan(50);
  await placeSection(page, "benefit-1", -0.2);
  expect(await unfilled(page, 0)).toBe(0);
});

test("fallback engines end with every section word visible", async ({ page, browserName }) => {
  test.skip(browserName !== "firefox", "IntersectionObserver path");
  await page.goto("/");
  await introDone(page);
  await placeSection(page, "problem", -0.1);
  await expect
    .poll(
      async () =>
        (await wordStates(page, '[data-film-beat="problem"] h2')).every(
          (word) => word.opacity === 1 && word.sharp,
        ),
      { timeout: 6000 },
    )
    .toBe(true);
});

test("reduced motion: every word is in place and the figures are filled", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const words = await wordStates(page, "[data-film-root]");
  expect(words.length).toBeGreaterThan(60);
  expect(words.every((word) => word.opacity === 1 && word.sharp)).toBe(true);
  for (let i = 0; i < 4; i++) expect(await unfilled(page, i)).toBe(0);
});

test("on phones the call to action and the hero figures stay clear of the chatbot greeting", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "phone layout");
  await page.goto("/");
  await introDone(page);
  const greeting = page.locator('[class*="greetingBubble"]');
  await expect(greeting).toBeVisible({ timeout: 15000 });
  const boxes = await page.evaluate(() => {
    const box = (selector: string) => {
      const rect = (document.querySelector(selector) as HTMLElement).getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
    };
    return {
      greeting: box('[class*="greetingBubble"]'),
      cta: box('[data-cta="primary"]'),
      stats: box("[data-hero-stats]"),
    };
  });
  const overlaps = (a: typeof boxes.cta, b: typeof boxes.cta) =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  expect(overlaps(boxes.cta, boxes.greeting)).toBe(false);
  expect(overlaps(boxes.stats, boxes.greeting)).toBe(false);
});

test("process steps are separate glass cards", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator('[data-film-beat="process"] [data-step]');
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(1)).toContainText("Build");
});

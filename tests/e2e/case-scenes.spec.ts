import { expect, test } from "./fixtures";

// The drawn scenes of the case studies (redesign 2026, sober step 4): every
// case has one, each is aria-hidden and sized, its figures are the case's
// own, reduced motion shows its final state, scene text stays at 12 px or
// more on phones, and the margin steppers pin and switch on desktop and
// stack on phones.

const FIGURES: Record<string, string[]> = {
  "leadbot-ai": ["85%"],
  "atv-riders": ["200+"],
  "ai-powered-ad-creatives": ["35", "$23.04", "3.92x", "260", "$3.45"],
  "quick-metal-shop-viral-videos": ["110K", "125K", "103K", "338K+"],
  "quick-metal-shop-arquiexpo": ["48h", "285"],
  "quick-metal-shop-marketing": [],
  "quick-metal-shop-the-brand-comes-to-life": [],
  "dakoma-roofing": [],
  "ai-portfolio": [],
};

for (const [slug, figures] of Object.entries(FIGURES)) {
  test(`the ${slug} case tells its work in drawn scenes with its own figures`, async ({ page }) => {
    await page.goto(`/work/${slug}`);
    const scenes = page.locator("main [data-scene]");
    expect(await scenes.count()).toBeGreaterThan(0);
    const report = await scenes.evaluateAll((els) =>
      els.map((el) => ({
        hidden: el.closest('[aria-hidden="true"]') !== null,
        box: el.getBoundingClientRect().width * el.getBoundingClientRect().height,
      })),
    );
    for (const scene of report) {
      expect(scene.hidden).toBe(true);
      expect(scene.box).toBeGreaterThan(0);
    }
    const counts = await page
      .locator("main [data-scene] [data-count]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-count")));
    expect(counts).toEqual(figures);
  });
}

test("with reduced motion every case scene shows its final state, typed text complete", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const slug of [
    "atv-riders",
    "dakoma-roofing",
    "ai-portfolio",
    "quick-metal-shop-marketing",
  ]) {
    await page.goto(`/work/${slug}`);
    await expect(page.locator("main [data-scene]").first()).toHaveAttribute("data-started", "");
    const scenes = await page.locator("main [data-scene]").evaluateAll((els) =>
      els.map((el) => ({
        last: (el.dataset.steps ?? "0").split(",").length - 1,
        at: el.dataset.step,
      })),
    );
    for (const scene of scenes) expect(Number(scene.at), slug).toBe(scene.last);
    const typedDone = await page
      .locator("main [data-scene] [data-type]")
      .evaluateAll((els) => els.every((el) => el.hasAttribute("data-typed")));
    expect(typedDone, slug).toBe(true);
  }
});

test("scene text is at least 12 px", async ({ page }) => {
  for (const slug of ["atv-riders", "ai-powered-ad-creatives", "quick-metal-shop-arquiexpo"]) {
    await page.goto(`/work/${slug}`);
    const smallest = await page.locator("main [data-scene]").evaluateAll((els) => {
      let min = Number.POSITIVE_INFINITY;
      for (const scene of els) {
        const walker = document.createTreeWalker(scene, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent?.trim()) continue;
          const parent = node.parentElement;
          if (!parent || parent.getClientRects().length === 0) continue;
          min = Math.min(min, Number.parseFloat(getComputedStyle(parent).fontSize));
        }
      }
      return min;
    });
    expect(smallest, slug).toBeGreaterThanOrEqual(12);
  }
});

test("the marketing stepper switches scene with the text on desktop and stacks on phones", async ({
  page,
}) => {
  await page.goto("/work/quick-metal-shop-marketing");
  const stepper = page.locator("[data-margin-stepper]");
  const layers = stepper.locator("[data-scene-layer]");
  await expect(layers).toHaveCount(5);
  if ((page.viewportSize()?.width ?? 0) < 1024) {
    await expect(stepper).toHaveAttribute("data-active", "stack");
    await expect(stepper.locator("[data-scene-layer][data-on]")).toHaveCount(5);
    return;
  }
  // The third step's part of the text (the social media h3) past the line.
  await page.evaluate(() => {
    const h3 = Array.from(document.querySelectorAll("h3")).find((h) =>
      h.textContent?.includes("Social Media"),
    );
    if (h3) window.scrollTo(0, h3.getBoundingClientRect().top + window.scrollY - 200);
  });
  await expect(stepper).toHaveAttribute("data-active", "2");
  await expect(stepper.locator("[data-scene-layer][data-on]")).toHaveCount(1);
  await expect(stepper.locator('[data-scene-layer][data-step="2"]')).toHaveAttribute("data-on", "");
  // The stepper stays on screen beside the text (the margin is sticky).
  const top = await stepper.evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(0);
  expect(top).toBeLessThan(400);
});

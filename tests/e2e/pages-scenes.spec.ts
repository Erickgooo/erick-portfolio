import { expect, test } from "./fixtures";

// The scenes of About, Projects, Blog and the "My Workspace" post (sober
// style, step 4): drawn, aria-hidden, sized, and complete with reduced motion.

const INTRO = '[class*="IntroLoader_overlay"]';

const PAGES = [
  { path: "/about", scene: '[class*="supportqueue_window"]' },
  { path: "/work", scene: '[class*="figurecounter_counter"]' },
  { path: "/blog", scene: '[class*="titlesheet_sheet"]' },
];

for (const { path, scene } of PAGES) {
  test(`${path}: its scene is hidden from assistive tech and reserves its box`, async ({
    page,
  }) => {
    await page.goto(path);
    const el = page.locator(`main ${scene}`);
    await expect(el).toHaveCount(1);
    await expect(el).toHaveAttribute("aria-hidden", "true");
    const box = await el.boundingBox();
    expect((box?.width ?? 0) * (box?.height ?? 0)).toBeGreaterThan(0);
  });
}

test("with reduced motion the page scenes show their final text", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto("/about");
  await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 9000 });
  const queue = page.locator('main [class*="supportqueue_window"]');
  await expect(queue.locator("[data-typed-text]")).toHaveText(/cost of not automating it\?$/);

  await page.goto("/work");
  await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 9000 });
  // The counter's first figure is the LeadBot case's own.
  await expect(page.locator('main [class*="figurecounter_counter"] [data-typed-text]')).toHaveText(
    "85%",
  );

  await page.goto("/blog");
  await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 9000 });
  const title = await page.locator("main article h2").first().innerText();
  await expect(page.locator('main [class*="titlesheet_sheet"] [data-typed-text]')).toHaveText(
    title,
  );
});

test("the workspace desk follows the reading on desktop and loops on phones", async ({ page }) => {
  await page.goto("/blog/my-workspace");
  const wide = (page.viewportSize()?.width ?? 0) >= 1024;
  const read = page.locator("main [data-desk]");
  const loop = page.locator('main [data-scene][class*="desk_loop"]');
  await expect(read).toHaveAttribute("aria-hidden", "true");
  await expect(loop).toHaveAttribute("aria-hidden", "true");
  if (!wide) {
    await expect(loop).toBeVisible();
    await expect(read).toBeHidden();
    return;
  }
  await expect(loop).toBeHidden();
  // A section is current once its heading is within 150 px of the top.
  const reach = (id: string) =>
    page.evaluate((target) => {
      const el = document.getElementById(target);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100);
    }, id);
  await reach("the-machine");
  await expect(read).toHaveAttribute("data-part", "machine");
  await reach("audio-and-video");
  await expect(read).toHaveAttribute("data-part", "av");
});

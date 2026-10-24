import { expect, test } from "./fixtures";

// Motion fixes of the animation audit (2026-10-24) that are easy to undo
// without noticing.

const GLOW = '[class*="SpotlightBackground_glow"]';
const INTRO = '[class*="IntroLoader_overlay"]';
const BUBBLE = '[class*="FaqChatbot_greetingBubble"]';

test.describe("reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("anchor jumps land at once", async ({ page }) => {
    await page.goto("/about");
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(behavior).toBe("auto");
  });

  test("the chatbot's greeting bubble appears without sliding in", async ({ page }) => {
    await page.goto("/about");
    const bubble = page.locator(BUBBLE);
    // The bubble shows 2.5 s after load.
    await expect(bubble).toBeVisible({ timeout: 6000 });
    const running = await bubble.evaluate((el) => el.getAnimations().length);
    expect(running).toBe(0);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the home shows no intro veil", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(INTRO)).toBeHidden();
    await expect(page.locator("h1").first()).toBeVisible();
  });
});

test("the pointer glow stops once it has reached the pointer", async ({ page }) => {
  await page.goto("/about");
  const { width, height } = page.viewportSize() ?? { width: 1280, height: 720 };
  const to = { x: Math.round(width * 0.7), y: Math.round(height * 0.65) };
  const glow = page.locator(GLOW);
  // The glow listens once the page has hydrated: move until it follows,
  // and it eases onto the pointer.
  await expect
    .poll(
      async () => {
        await page.mouse.move(to.x - 1, to.y);
        await page.mouse.move(to.x, to.y);
        return glow.evaluate((el) => {
          const box = el.getBoundingClientRect();
          return [Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2)];
        });
      },
      { timeout: 10_000 },
    )
    .toEqual([to.x, to.y]);
  // Arrived (the last pixel takes a few frames): from then on nothing is
  // written, frame after frame. Frames, not seconds, since it eases by a
  // share of the distance each frame.
  const changes = await page.evaluate(
    (sel) =>
      new Promise<number>((resolve) => {
        const el = document.querySelector<HTMLElement>(sel);
        if (!el?.parentElement) throw new Error("no glow");
        let frames = 0;
        let count = 0;
        const watch = new MutationObserver((records) => {
          if (frames >= 20) count += records.length;
        });
        watch.observe(el, { attributes: true, attributeFilter: ["style"] });
        watch.observe(el.parentElement, { attributes: true, attributeFilter: ["style"] });
        const tick = () => {
          frames += 1;
          if (frames < 50) {
            requestAnimationFrame(tick);
            return;
          }
          watch.disconnect();
          resolve(count);
        };
        requestAnimationFrame(tick);
      }),
    GLOW,
  );
  expect(changes).toBe(0);
});

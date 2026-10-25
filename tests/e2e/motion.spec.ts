import { expect, test } from "./fixtures";

// Motion fixes of the animation audit (2026-10-24) that are easy to undo
// without noticing.

const GLOW = '[class*="SpotlightBackground_glow"]';
const GLOW_LAYER = '[class*="SpotlightBackground_spotlightWrapper"]';
const INTRO = '[class*="IntroLoader_overlay"]';
const BUBBLE = '[class*="FaqChatbot_greetingBubble"]';
const BENCH = '[class*="bench_bench"]';
const RISE = '[class*="bench_rise"]';

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

  // Pulido de animaciones (2026-10-25): the intro still shows (a brand
  // decision) but nothing in it moves.
  test("the intro shows its finished mark and nothing in it moves", async ({ page }) => {
    await page.goto("/");
    const intro = page.locator(INTRO);
    test.skip((await intro.count()) === 0, "the intro did not play on this visit");
    await expect(intro).toHaveClass(/IntroLoader_entering/);
    const state = await intro.evaluate((el) => ({
      wordmark: getComputedStyle(el.querySelector('[class*="IntroLoader_wordmark"]') as Element)
        .opacity,
      moving: document
        .getAnimations()
        .filter((a) => {
          const target = (a.effect as KeyframeEffect | null)?.target;
          return target instanceof Element && el.contains(target) && a.playState === "running";
        }).length,
    }));
    expect(state).toEqual({ wordmark: "1", moving: 0 });
  });
});

// Pulido de animaciones (2026-10-25): on the home's first visit the intro is
// the only thing that moves. While its veil fades, the bench's objects wait
// hidden, the pointer glow stays dark and the greeting bubble has not come;
// the objects float only once they have all risen.
test("nothing under the intro moves while its veil fades", async ({ page }) => {
  await page.goto("/");
  test.skip((await page.locator(INTRO).count()) === 0, "the intro did not play on this visit");
  const seen = await page.evaluate(
    ([introSel, riseSel, glowSel, bubbleSel]) =>
      new Promise<{ rises: string[]; glow: string; bubble: boolean }>((resolve) => {
        const intro = document.querySelector(introSel) as HTMLElement;
        const look = () =>
          resolve({
            rises: Array.from(document.querySelectorAll(riseSel), (el) => getComputedStyle(el).opacity),
            glow: getComputedStyle(document.querySelector(glowSel) as Element).opacity,
            bubble: !!document.querySelector(bubbleSel),
          });
        // A quarter of a second into the veil's fade (0.5 s).
        const watch = new MutationObserver(() => {
          if (!/IntroLoader_leaving/.test(intro.className)) return;
          watch.disconnect();
          setTimeout(look, 250);
        });
        watch.observe(intro, { attributes: true, attributeFilter: ["class"] });
      }),
    [INTRO, RISE, GLOW_LAYER, BUBBLE],
  );
  expect(seen.rises.length).toBeGreaterThan(4);
  expect(seen.rises.every((opacity) => opacity === "0")).toBe(true);
  expect(seen.glow).toBe("0");
  expect(seen.bubble).toBe(false);
  await expect(page.locator(BENCH)).toHaveAttribute("data-settled", "", { timeout: 5000 });
  await expect(page.locator(GLOW_LAYER)).toHaveAttribute("data-on", "");
});

test("the pointer glow dims while the page scrolls", async ({ page, isMobile }) => {
  test.skip(isMobile, "a wheel scroll needs a mouse");
  await page.goto("/about");
  const layer = page.locator(GLOW_LAYER);
  await expect(layer).toHaveAttribute("data-on", "");
  await page.mouse.move(400, 400);
  await page.mouse.wheel(0, 300);
  await expect(layer).toHaveAttribute("data-calm", "");
  await expect(layer).not.toHaveAttribute("data-calm", "", { timeout: 3000 });
});

test("the header's clock never moves anything", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "layout-shift entries are Chromium's");
  test.skip((page.viewportSize()?.width ?? 0) <= 768, "the clock shows on desktop only");
  await page.goto("/about");
  await page.evaluate(() => document.fonts.ready);
  // Two ticks of the clock after the fonts are in.
  const moved = await page.evaluate(
    () =>
      new Promise<string[]>((resolve) => {
        const found: string[] = [];
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as {
            sources: { node: Node | null }[];
          }[]) {
            for (const source of entry.sources) {
              const node = source.node;
              const el = node instanceof Element ? node : node?.parentElement;
              if (el?.closest("header")) found.push(el.className || el.nodeName);
            }
          }
        }).observe({ type: "layout-shift" });
        setTimeout(() => resolve(found), 2300);
      }),
  );
  expect(moved).toEqual([]);
});

// Nothing is left half-way: scrolled through at a reading pace, every reveal
// of the page has arrived by the end (one that never meets its trigger would
// stay hidden for good).
for (const path of ["/", "/about", "/work", "/work/leadbot-ai", "/gallery", "/blog/my-workspace"]) {
  test(`${path}: every reveal arrives on the way down`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 9000 });
    await page.evaluate(async () => {
      const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.6) {
        window.scrollTo({ top: y, behavior: "instant" });
        await pause(120);
      }
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
    });
    // Arrived: marked in, or fully shown by a parent's reveal (the frames of a
    // scrolling row come in with their row). Screen-reader copies inside a
    // visually hidden list (a 1 px box) are not drawn, so they do not count.
    const waiting = page.locator("main [data-reveal]:not([data-in])");
    await expect
      .poll(() =>
        waiting.evaluateAll(
          (els) =>
            els.filter((el) => {
              for (let up: Element | null = el; up && up.tagName !== "MAIN"; up = up.parentElement) {
                if (up.getBoundingClientRect().width <= 1) return false;
              }
              return getComputedStyle(el).opacity !== "1";
            }).length,
        ),
      )
      .toBe(0);
  });
}

// One scene moves at a time: wherever the page rests, at most one scene is
// live (the others wait to start or hold where they are). On phones a
// stepper's sheets stack, and the end of one scene used to play with the next.
test("no more than one scene moves at a time", async ({ page }) => {
  for (const path of ["/", "/work/ai-powered-ad-creatives"]) {
    await page.goto(path);
    await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 9000 });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewport = page.viewportSize()?.height ?? 800;
    for (let y = 0; y < height; y += viewport * 0.45) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      await page.waitForTimeout(250);
      const moving = await page
        .locator("main [data-scene][data-live]:not([data-held])")
        .evaluateAll(
          (els) => els.filter((el) => el.getBoundingClientRect().bottom > 0 && el.getBoundingClientRect().top < innerHeight).length,
        );
      expect(moving, `${path} at ${Math.round(y)} px`).toBeLessThanOrEqual(1);
    }
  }
});

test("a stepper's stage never moves: its sheets keep their place and size", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 1024, "the stepper pins from 1024 px");
  for (const path of ["/", "/work/ai-powered-ad-creatives"]) {
    await page.goto(path);
    const moved = await page
      .locator("[data-stepper] [data-scene-layer] > div, [data-margin-stepper] [data-scene-layer] > div")
      .evaluateAll((els) =>
        els
          .map((el) => getComputedStyle(el))
          .filter((style) => style.translate !== "none" || style.scale !== "none").length,
      );
    expect(moved).toBe(0);
  }
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

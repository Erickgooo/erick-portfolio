import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { introDone } from "./helpers";

const HEADLINE =
  "I build your marketing engine from zero and make it outperform a full department.";
const CALENDAR = "https://calendly.com/santiagomahecha2328/30min";

const filmReady = (page: Page) =>
  expect
    .poll(
      () =>
        page.evaluate(() =>
          Boolean(document.querySelector("[data-film-root]")?.hasAttribute("data-film-ready")),
        ),
      { timeout: 20000 },
    )
    .toBe(true);

const filmTime = (page: Page) =>
  page.evaluate(
    () => (document.querySelector("[data-film-video]") as HTMLVideoElement).currentTime,
  );

const scrollIntoBeat = (page: Page, beat: string, progress: number) =>
  page.evaluate(
    ([id, p]) => {
      const el = document.querySelector(`[data-film-beat="${id}"]`) as HTMLElement;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + el.offsetHeight * (p as number), behavior: "instant" });
    },
    [beat, progress] as const,
  );

test.describe("scrubbing", () => {
  test.beforeEach(({ page: _page }, testInfo) => {
    test.skip(
      !["chromium", "mobile-chromium"].includes(testInfo.project.name),
      "scrubbing is asserted on Chromium; other engines are covered by the SSR and poster checks",
    );
  });

  test("the film follows the scroll position, forwards and backwards", async ({ page }) => {
    await page.goto("/");
    await introDone(page);
    await filmReady(page);
    await scrollIntoBeat(page, "hero", 0.5);
    await expect.poll(() => filmTime(page)).toBeGreaterThan(1.3);
    expect(await filmTime(page)).toBeLessThan(1.9);
    for (const p of [0.9, 0.1, 0.7, 0.2]) await scrollIntoBeat(page, "hero", p);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => filmTime(page)).toBeLessThan(0.3);
  });

  test("the clip plays from memory and is seekable end to end", async ({ page }) => {
    await page.goto("/");
    await filmReady(page);
    const video = await page.evaluate(() => {
      const v = document.querySelector("[data-film-video]") as HTMLVideoElement;
      return { src: v.currentSrc, seekable: v.seekable.length ? v.seekable.end(0) : 0 };
    });
    expect(video.src.startsWith("blob:")).toBe(true);
    expect(video.seekable).toBeGreaterThan(20);
  });

  test("the stage stays pinned while its sections scroll", async ({ page }) => {
    await page.goto("/");
    await introDone(page);
    await page.evaluate(() => window.scrollTo(0, 500));
    const top = await page.evaluate(
      () =>
        (document.querySelector("[data-film-stage]") as HTMLElement).getBoundingClientRect().top,
    );
    expect(top).toBe(0);
  });

  test("phones get the portrait encode", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "phone only");
    await page.goto("/");
    await filmReady(page);
    const size = await page.evaluate(() => {
      const v = document.querySelector("[data-film-video]") as HTMLVideoElement;
      return { w: v.videoWidth, h: v.videoHeight };
    });
    expect(size.w).toBeLessThan(size.h);
  });
});

const mp4Requests = (page: Page) => {
  const urls: string[] = [];
  page.on("request", (request) => {
    if (/\.mp4(\?|$)/.test(request.url())) urls.push(request.url());
  });
  return urls;
};

test("reduced motion: no video is downloaded and the poster stays", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const urls = mp4Requests(page);
  await page.goto("/");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1500);
  expect(urls).toEqual([]);
  await expect(page.locator("[data-film-stage] img")).toBeAttached();
});

test("lite tier: no video is downloaded", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 });
  });
  const urls = mp4Requests(page);
  await page.goto("/");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1500);
  expect(urls).toEqual([]);
});

test("a failed film download leaves the poster and logs nothing", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.route("**/video/home-film*.mp4", (route) => route.abort());
  await page.goto("/");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1500);
  await expect(page.locator("[data-film-stage] img")).toBeAttached();
  expect(
    await page.evaluate(() =>
      Boolean(document.querySelector("[data-film-root]")?.hasAttribute("data-film-ready")),
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});

test("the h1 and the call link are in the server HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain(HEADLINE);
  expect(html).toContain(CALENDAR);
});

test("there is exactly one primary call to action above the fold", async ({ page }) => {
  await page.goto("/");
  const visible = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('[data-cta="primary"]')).filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      }).length,
  );
  expect(visible).toBe(1);
  await expect(page.locator('[data-cta="primary"]').first()).toHaveAttribute("href", CALENDAR);
});

for (const width of [390, 859, 861, 1024, 1440]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    await expect(page.locator("[data-film-root]")).toBeAttached();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

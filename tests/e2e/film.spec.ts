import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { introDone } from "./helpers";

const HEADLINE =
  "I build your marketing engine from zero and make it outperform a full department.";
const CALENDAR = "https://calendly.com/santiagomahecha2328/30min";

/** Server HTML reduced to the text a reader gets: tags and React's comment markers out. */
const visibleText = (html: string) =>
  html
    .replace(/<!--[^]*?-->/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ");

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

test("the film becomes ready on every engine", async ({ page }) => {
  await page.goto("/");
  await filmReady(page);
  const video = await page.evaluate(() => {
    const v = document.querySelector("[data-film-video]") as HTMLVideoElement;
    return { src: v.currentSrc, duration: v.duration, error: v.error?.code ?? null };
  });
  // Playwright's WebKit will not play a Blob URL and takes the plain-URL fallback.
  expect(video.src.startsWith("blob:") || video.src.includes("/video/home-film")).toBe(true);
  expect(video.error).toBeNull();
  expect(video.duration).toBeGreaterThan(24);
});

test("turning a phone swaps the clip to the matching orientation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "one engine is enough for the variant rule");
  const shape = () =>
    page.evaluate(() => {
      const v = document.querySelector("[data-film-video]") as HTMLVideoElement;
      return v.videoWidth > v.videoHeight ? "landscape" : "portrait";
    });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await filmReady(page);
  expect(await shape()).toBe("portrait");
  await page.setViewportSize({ width: 844, height: 390 });
  await expect.poll(shape, { timeout: 20000 }).toBe("landscape");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("a wide touch screen gets the landscape clip", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "one engine is enough for the variant rule");
  const context = await browser.newContext({
    viewport: { width: 1180, height: 820 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/");
  await filmReady(page);
  const size = await page.evaluate(() => {
    const v = document.querySelector("[data-film-video]") as HTMLVideoElement;
    return { w: v.videoWidth, h: v.videoHeight };
  });
  expect(size.w).toBeGreaterThan(size.h);
  await context.close();
});

test("light theme: the header's side labels stay readable over the film and after it", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "the side labels are a desktop feature");
  await page.addInitScript(() => localStorage.setItem("data-theme", "light"));
  await page.goto("/");
  await introDone(page);
  const place = page.locator("[data-header-side]").first();
  const colour = () => place.evaluate((el) => getComputedStyle(el.firstElementChild ?? el).color);
  // Over the film, which is always dark footage: shown, and in white.
  await expect(place).toBeVisible();
  await expect(place).toContainText("Medellín, Colombia");
  expect(await colour()).toBe("rgb(255, 255, 255)");
  // The page-coloured (white) fade would wash out the top of the film.
  await expect(page.locator("[data-header-fade]").first()).toBeHidden();

  // Past the film the page is light again: the labels go back to the theme's dark text.
  await page.evaluate(() => {
    const film = document.querySelector("[data-film-root]") as HTMLElement;
    const bottom = film.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo({ top: bottom + 200, behavior: "instant" });
  });
  await expect.poll(colour).not.toBe("rgb(255, 255, 255)");
  await expect(place).toBeVisible();
  await expect(page.locator("[data-header-fade]").first()).toBeVisible();

  // And back up over the film.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(colour).toBe("rgb(255, 255, 255)");
});

test("dark theme: the header's side labels are shown on the Home", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "the side labels are a desktop feature");
  await page.addInitScript(() => localStorage.setItem("data-theme", "dark"));
  await page.goto("/");
  await expect(page.locator("[data-header-side]").first()).toBeVisible();
  await expect(page.locator("[data-header-side]").first()).toContainText("Medellín, Colombia");
});

test("on phones the hero figures sit in one row", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "phone layout");
  await page.goto("/");
  const stats = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("[data-hero-stats] li"));
    const tops = items.map((el) => Math.round(el.getBoundingClientRect().top));
    return { count: items.length, rows: new Set(tops).size };
  });
  expect(stats.count).toBe(4);
  expect(stats.rows).toBe(1);
});

const BEATS = [
  "hero",
  "tagline",
  "problem",
  "solution",
  "benefit-1",
  "benefit-2",
  "benefit-3",
  "benefit-4",
  "process",
];

test("every film section has a beat", async ({ page }) => {
  await page.goto("/");
  const ids = await page
    .locator("[data-film-beat]")
    .evaluateAll((els) => els.map((el) => el.getAttribute("data-film-beat")));
  expect(ids).toEqual(BEATS);
});

test("the last film section ends the video", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "one engine is enough for the mapping");
  await page.goto("/");
  await introDone(page);
  await filmReady(page);
  // Scroll to where the stage unpins: the last section's bottom edge at the viewport's bottom edge.
  await page.evaluate(() => {
    const el = document.querySelector('[data-film-beat="process"]') as HTMLElement;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + el.offsetHeight - window.innerHeight, behavior: "instant" });
  });
  await expect.poll(() => filmTime(page), { timeout: 10000 }).toBeGreaterThan(24.5);
});

test("each benefit shows its figure and links to its case study", async ({ page }) => {
  await page.goto("/");
  const benefits = page.locator("[data-benefit]");
  await expect(benefits).toHaveCount(4);
  const figures = await benefits.locator("[data-benefit-figure]").allTextContents();
  expect(figures).toEqual(["338K+", "3.92x", "85%", "48h"]);
  const links = await benefits
    .locator("a")
    .evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  expect(links).toEqual([
    "/work/quick-metal-shop-viral-videos",
    "/work/ai-powered-ad-creatives",
    "/work/leadbot-ai",
    "/work/quick-metal-shop-arquiexpo",
  ]);
});

test("the argument is in the server HTML", async ({ request }) => {
  const text = visibleText(await (await request.get("/")).text());
  expect(text).toContain("none of them talk to each other");
  expect(text).toContain("Content at agency scale.");
  expect(text).toContain("How I work");
});

test("the cursor glow also follows the pointer over the film", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "one mouse-driven engine is enough");
  await page.goto("/");
  await introDone(page);
  await page.mouse.move(520, 300);
  const x = () =>
    page.evaluate(() =>
      Number.parseFloat(
        (
          document.querySelector("[data-film-stage] [data-spotlight-target]") as HTMLElement
        ).style.getPropertyValue("--x"),
      ),
    );
  await expect.poll(async () => Math.abs((await x()) - 520) < 4, { timeout: 5000 }).toBe(true);
});

test("benefit figures are set in the display face at display size", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "desktop sizes");
  await page.goto("/");
  const style = await page
    .locator("[data-benefit-figure]")
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        family: cs.fontFamily,
        size: Number.parseFloat(cs.fontSize),
        weight: Number(cs.fontWeight),
      };
    });
  expect(style.family).not.toContain("Mono");
  expect(style.size).toBeGreaterThanOrEqual(128);
  expect(style.weight).toBeGreaterThanOrEqual(700);
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

test("reduced motion swaps a still per section", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const urls = mp4Requests(page);
  await page.goto("/");
  await introDone(page);
  const still = () =>
    page.evaluate(
      () => (document.querySelector("[data-film-stage] img") as HTMLImageElement).currentSrc,
    );
  expect(await still()).toContain("/images/film/hero");
  await scrollIntoBeat(page, "benefit-1", 0.2);
  await expect.poll(still).toContain("/images/film/benefit-1");
  await scrollIntoBeat(page, "process", 0.2);
  await expect.poll(still).toContain("/images/film/process");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const img = document.querySelector("[data-film-stage] img") as HTMLImageElement;
        return img.complete && img.naturalWidth > 0;
      }),
    )
    .toBe(true);
  expect(urls).toEqual([]);
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
  // The headline is split into one element per word; what matters is the text.
  expect(visibleText(html)).toContain(HEADLINE);
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

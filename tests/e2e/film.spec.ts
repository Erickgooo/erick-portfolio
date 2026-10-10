import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { wordsOnFilm } from "./helpers";

const CALENDAR = "https://calendly.com/santiagomahecha2328/30min";
const FILM_DURATION = 24.8;
const WHITE = "rgb(255, 255, 255)";
const THEMES = {
  light: { page: "rgb(244, 245, 247)", content: "rgb(11, 12, 14)" },
  dark: { page: "rgb(0, 0, 0)", content: "rgb(244, 245, 247)" },
} as const;

const forceTheme = (page: Page, theme: keyof typeof THEMES) =>
  page.addInitScript((value) => localStorage.setItem("data-theme", value), theme);

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

/** Puts the top of the viewport `progress` of the way through an element (0 = its top edge). */
const scrollInto = (page: Page, selector: string, progress: number) =>
  page.evaluate(
    ([target, p]) => {
      const el = document.querySelector(target as string) as HTMLElement;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + el.offsetHeight * (p as number), behavior: "instant" });
    },
    [selector, progress] as const,
  );

const scrollIntoBeat = (page: Page, beat: string, progress: number) =>
  scrollInto(page, `[data-film-beat="${beat}"]`, progress);

const scrollPastFilm = (page: Page) =>
  page.evaluate(() => {
    const film = document.querySelector("[data-film-root]") as HTMLElement;
    const bottom = film.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo({ top: bottom + 200, behavior: "instant" });
  });

test.describe("scrubbing", () => {
  test.beforeEach(({ page: _page }, testInfo) => {
    test.skip(
      !["chromium", "mobile-chromium"].includes(testInfo.project.name),
      "scrubbing is asserted on Chromium; other engines are covered by the SSR and poster checks",
    );
  });

  test("the film follows the scroll position, forwards and backwards", async ({ page }) => {
    await page.goto("/");
    await filmReady(page);
    await scrollIntoBeat(page, "hero", 0.5);
    await expect.poll(() => filmTime(page)).toBeGreaterThan(1.3);
    expect(await filmTime(page)).toBeLessThan(1.9);
    for (const p of [0.9, 0.1, 0.7, 0.2]) await scrollIntoBeat(page, "hero", p);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => filmTime(page)).toBeLessThan(0.3);
  });

  test("a title card holds the film on the cut it arrived at", async ({ page }) => {
    await page.goto("/");
    await filmReady(page);
    // Halfway through the Content card: the stretch before it has ended (7.03 s)
    // and the one after it has not started.
    await scrollInto(page, '[data-seat="content"]', 0.5);
    await expect.poll(() => filmTime(page)).toBeGreaterThan(6.9);
    expect(await filmTime(page)).toBeLessThan(7.1);
    await scrollIntoBeat(page, "after-content", 0.5);
    await expect.poll(() => filmTime(page)).toBeGreaterThan(9.4);
    expect(await filmTime(page)).toBeLessThan(10);
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
    const stageTop = () =>
      page.evaluate(
        () =>
          (document.querySelector("[data-film-stage]") as HTMLElement).getBoundingClientRect().top,
      );
    await page.evaluate(() => window.scrollTo(0, 500));
    expect(await stageTop()).toBe(0);
    // Still pinned under a title card and through the stretch after it.
    await scrollInto(page, '[data-seat="crm"]', 0.5);
    expect(await stageTop()).toBe(0);
    await scrollIntoBeat(page, "after-crm", 0.5);
    expect(await stageTop()).toBe(0);
  });

  test("the progress bar tracks the film", async ({ page }) => {
    await page.goto("/");
    await filmReady(page);
    const bar = () =>
      page.evaluate(() => {
        const el = document.querySelector("[data-film-progress]") as HTMLElement;
        return new DOMMatrixReadOnly(getComputedStyle(el).transform).a;
      });
    expect(await bar()).toBeLessThan(0.03);
    for (const [beat, progress] of [
      ["after-brand", 0.5],
      ["after-crm", 0.4],
    ] as const) {
      await scrollIntoBeat(page, beat, progress);
      // Wait for the film to move there, then for the bar to agree with it.
      await expect.poll(() => filmTime(page)).toBeGreaterThan(beat === "after-brand" ? 4.5 : 17);
      await expect
        .poll(async () => Math.abs((await bar()) - (await filmTime(page)) / FILM_DURATION))
        .toBeLessThan(0.03);
    }
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

test("every film stretch has a beat", async ({ page }) => {
  await page.goto("/");
  const stretches = await page.locator("[data-film-beat]").evaluateAll((els) =>
    els.map((el) => ({
      beat: el.getAttribute("data-film-beat"),
      // The seat a clean stretch follows; the hero has none.
      after: el.previousElementSibling?.getAttribute("data-seat") ?? null,
      height: (el as HTMLElement).offsetHeight,
    })),
  );
  expect(stretches.map(({ beat, after }) => ({ beat, after }))).toEqual([
    { beat: "hero", after: null },
    { beat: "after-brand", after: "brand" },
    { beat: "after-content", after: "content" },
    { beat: "after-paid-media", after: "paid-media" },
    { beat: "after-crm", after: "crm" },
    { beat: "after-software", after: "software" },
  ]);
  // A stretch with no height would be skipped by the film map.
  for (const stretch of stretches) expect(stretch.height, String(stretch.beat)).toBeGreaterThan(0);
});

test("the last stretch ends the video", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "one engine is enough for the mapping");
  await page.goto("/");
  await filmReady(page);
  // Scroll to where the stage unpins: the last stretch's bottom edge at the viewport's bottom edge.
  await page.evaluate(() => {
    const el = document.querySelector('[data-film-beat="after-software"]') as HTMLElement;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + el.offsetHeight - window.innerHeight, behavior: "instant" });
  });
  await expect.poll(() => filmTime(page), { timeout: 10000 }).toBeGreaterThan(24.5);
});

for (const theme of ["light", "dark"] as const) {
  test(`no words sit on the footage (${theme} theme)`, async ({ page }) => {
    await forceTheme(page, theme);
    await page.goto("/");
    const { body, words } = await wordsOnFilm(page);
    // The h1, the byline, the button, and a title, a sentence and a link per seat.
    expect(words.length).toBeGreaterThanOrEqual(18);
    expect(body).toBe(THEMES[theme].page);
    for (const word of words) expect(word.surface, word.text).toBe(body);
  });

  test(`the cards take the colour of the page (${theme} theme)`, async ({ page }) => {
    await forceTheme(page, theme);
    await page.goto("/");
    const surfaces = page.locator('[data-film-beat="hero"] [data-opaque], [data-seat]');
    await expect(surfaces).toHaveCount(6);
    for (const surface of await surfaces.all()) {
      await expect(surface).toHaveCSS("background-color", THEMES[theme].page);
    }
    const titles = page.locator("[data-seat] h2");
    await expect(titles).toHaveCount(5);
    for (const title of await titles.all()) {
      await expect(title).toHaveCSS("color", THEMES[theme].content);
    }
    await expect(page.locator('[data-film-beat="hero"] h1')).toHaveCSS(
      "color",
      THEMES[theme].content,
    );
  });
}

test.describe("the nav's side labels", () => {
  test.beforeEach(({ page: _page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile-chromium", "the side labels are a desktop feature");
  });

  const labelColour = (page: Page) =>
    page
      .locator("[data-header-side]")
      .first()
      .evaluate((el) => getComputedStyle(el.firstElementChild ?? el).color);

  test("light theme: the nav labels follow what is under them", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await forceTheme(page, "light");
    await page.goto("/");
    const place = page.locator("[data-header-side]").first();
    await expect(place).toContainText("Medellín, Colombia");
    // Over the footage, which is dark whatever the theme.
    expect(await labelColour(page)).toBe(WHITE);
    // A light title card pinned under the bar.
    await scrollInto(page, '[data-seat="brand"]', 0.2);
    await expect.poll(() => labelColour(page)).toBe(THEMES.light.content);
    // The labels change where the card's edge crosses their own middle: a card is
    // under them from the moment its top edge passes it until its bottom edge does.
    const middle = await place.evaluate((el) => {
      const rect = (el.firstElementChild ?? el).getBoundingClientRect();
      return (rect.top + rect.bottom) / 2;
    });
    const putCardEdge = (edge: "top" | "bottom", y: number) =>
      page.evaluate(
        ([side, at]) => {
          const card = document.querySelector('[data-seat="brand"]') as HTMLElement;
          const rect = card.getBoundingClientRect();
          const from = side === "top" ? rect.top : rect.bottom;
          window.scrollTo({ top: window.scrollY + from - (at as number), behavior: "instant" });
        },
        [edge, y] as const,
      );
    await putCardEdge("top", middle + 6);
    await expect.poll(() => labelColour(page)).toBe(WHITE);
    await putCardEdge("top", middle - 6);
    await expect.poll(() => labelColour(page)).toBe(THEMES.light.content);
    await putCardEdge("bottom", middle + 6);
    await expect.poll(() => labelColour(page)).toBe(THEMES.light.content);
    await putCardEdge("bottom", middle - 6);
    await expect.poll(() => labelColour(page)).toBe(WHITE);
    // The card has left and the film is clean again.
    await scrollIntoBeat(page, "after-brand", 0.1);
    await expect.poll(() => labelColour(page)).toBe(WHITE);
    await scrollInto(page, '[data-seat="software"]', 0.5);
    await expect.poll(() => labelColour(page)).toBe(THEMES.light.content);
    await scrollIntoBeat(page, "after-software", 0.1);
    await expect.poll(() => labelColour(page)).toBe(WHITE);
    await scrollPastFilm(page);
    await expect.poll(() => labelColour(page)).toBe(THEMES.light.content);
  });

  test("light theme: the header's side labels stay readable over the film and after it", async ({
    page,
  }) => {
    await forceTheme(page, "light");
    await page.goto("/");
    const place = page.locator("[data-header-side]").first();
    // Over the film, which is always dark footage: shown, and in white.
    await expect(place).toBeVisible();
    await expect(place).toContainText("Medellín, Colombia");
    expect(await labelColour(page)).toBe(WHITE);
    // The page-coloured (white) fade would wash out the top of the film.
    await expect(page.locator("[data-header-fade]").first()).toBeHidden();

    // Past the film the page is light again: the labels go back to the theme's dark text.
    await scrollPastFilm(page);
    await expect.poll(() => labelColour(page)).not.toBe(WHITE);
    await expect(place).toBeVisible();
    await expect(page.locator("[data-header-fade]").first()).toBeVisible();

    // And back up over the film.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect.poll(() => labelColour(page)).toBe(WHITE);
  });

  test("dark theme: the header's side labels are shown on the Home", async ({ page }) => {
    await forceTheme(page, "dark");
    await page.goto("/");
    await expect(page.locator("[data-header-side]").first()).toBeVisible();
    await expect(page.locator("[data-header-side]").first()).toContainText("Medellín, Colombia");
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

test("reduced motion swaps a still per stretch", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const urls = mp4Requests(page);
  await page.goto("/");
  const still = () =>
    page.evaluate(
      () => (document.querySelector("[data-film-stage] img") as HTMLImageElement).currentSrc,
    );
  // Phones get the portrait still of the same shot: `<name>-m.webp`.
  await expect.poll(still).toMatch(/\/images\/film\/hero(-m)?\.webp$/);
  await scrollIntoBeat(page, "after-content", 0.2);
  await expect.poll(still).toMatch(/\/images\/film\/solution(-m)?\.webp$/);
  await scrollIntoBeat(page, "after-software", 0.2);
  await expect.poll(still).toMatch(/\/images\/film\/process(-m)?\.webp$/);
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

test("reduced motion: a still is swapped while the card above it covers the screen", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const still = () =>
    page.evaluate(
      () => (document.querySelector("[data-film-stage] img") as HTMLImageElement).currentSrc,
    );
  // Puts the top edge of the stretch after the Content card `inside` px above the
  // bottom of the viewport (negative: still under the fold).
  const stretchTop = (inside: number) =>
    page.evaluate((px) => {
      const el = document.querySelector('[data-film-beat="after-content"]') as HTMLElement;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - window.innerHeight + px, behavior: "instant" });
    }, inside);
  // Under the fold: the card covers the screen and the stage keeps the shot before it.
  await stretchTop(-40);
  await expect.poll(still).toMatch(/\/images\/film\/tagline(-m)?\.webp$/);
  // The moment the stretch shows at the bottom edge, its own still is already there.
  await stretchTop(2);
  await expect.poll(still).toMatch(/\/images\/film\/solution(-m)?\.webp$/);
  // And scrolling back up puts the earlier one back before the card uncovers it.
  await stretchTop(-40);
  await expect.poll(still).toMatch(/\/images\/film\/tagline(-m)?\.webp$/);
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

test("on phones the call to action stays clear of the nav bar and the chatbot greeting", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const cta = page.locator('[data-film-beat="hero"] [data-cta="primary"]');
  const greeting = page.locator('[class*="greetingBubble"]');
  // The greeting opens by itself a couple of seconds after load.
  await expect(greeting).toBeVisible({ timeout: 8000 });
  const box = async (locator: typeof cta) => {
    const rect = await locator.boundingBox();
    if (!rect) throw new Error("not rendered");
    return rect;
  };
  const button = await box(cta);
  expect(button.y).toBeGreaterThanOrEqual(0);
  // Clear means air between them, not edges that happen to touch.
  const AIR = 8;
  for (const other of [await box(page.locator("header")), await box(greeting)]) {
    const apart =
      button.x + button.width + AIR <= other.x ||
      other.x + other.width + AIR <= button.x ||
      button.y + button.height + AIR <= other.y ||
      other.y + other.height + AIR <= button.y;
    expect(apart, JSON.stringify({ button, other })).toBe(true);
  }
});

test("a screen shorter than the hero band still shows the whole headline", async ({ page }) => {
  // A phone on its side: the band is taller than the screen.
  await page.setViewportSize({ width: 568, height: 320 });
  await page.goto("/");
  const h1 = page.locator('[data-film-beat="hero"] h1');
  const box = await h1.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + 8, rect.top + 8);
    return {
      // Above the top of the document there is nowhere to scroll to.
      top: rect.top + window.scrollY,
      bottom: rect.bottom,
      uncovered: top !== null && el.contains(top),
    };
  });
  expect(box.top).toBeGreaterThanOrEqual(0);
  expect(box.bottom).toBeLessThanOrEqual(320);
  expect(box.uncovered).toBe(true);
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

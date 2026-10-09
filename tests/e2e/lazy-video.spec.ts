import { expect, test } from "./fixtures";

// The pre-task original of videohome.mp4 (see git show 6139e7e:public/videohome.mp4).
// A recompressed video must never ship more bytes than this to the browser.
const PRE_TASK_VIDEOHOME_BYTES = 3_611_663;

test.describe("home video", () => {
  test("downloads 0 video bytes on load and plays once scrolled into view", async ({
    page,
    browserName,
  }) => {
    const videoRequests: string[] = [];
    const videoResponses: import("@playwright/test").Response[] = [];
    page.on("request", (r) => {
      if (/videohome\.(mp4|webm)/.test(r.url())) videoRequests.push(r.url());
    });
    page.on("response", (r) => {
      if (/videohome\.(mp4|webm)/.test(r.url())) videoResponses.push(r);
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(videoRequests).toEqual([]);

    const video = page.locator('[data-testid="home-video"] video');
    await video.scrollIntoViewIfNeeded();

    // WebKit's media-element network loads aren't surfaced through Playwright's
    // request/response events on this build (verified: video.currentSrc,
    // readyState and paused all report correctly, but no request/response/
    // requestfinished event ever fires for the resource) — only the
    // byte-tracking assertions below are unobservable here, so only they are
    // skipped, not the whole test.
    test.skip(
      browserName === "webkit",
      "WebKit on Windows doesn't surface media-element network requests to Playwright (request/bytes assertions unobservable here)",
    );

    await expect.poll(() => videoRequests.length).toBeGreaterThan(0);
    await expect.poll(() => videoResponses.length).toBeGreaterThan(0);
    const contentRange = videoResponses[0].headers()["content-range"];
    const totalBytes = Number(contentRange?.split("/").pop());
    expect(totalBytes).toBeGreaterThan(0);
    expect(totalBytes).toBeLessThanOrEqual(PRE_TASK_VIDEOHOME_BYTES);

    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  });

  test("respects prefers-reduced-motion: no autoplay, accessible play button", async ({
    page,
    browserName,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const wrap = page.locator('[data-testid="home-video"]');
    await wrap.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    expect(await wrap.locator("video").evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    const play = wrap.getByRole("button", { name: /play/i });
    await expect(play).toBeVisible();
    await play.focus();
    await page.keyboard.press("Enter");
    test.skip(browserName === "webkit", "WebKit on Windows has no H.264 decoder");
    await expect
      .poll(() => wrap.locator("video").evaluate((v: HTMLVideoElement) => !v.paused))
      .toBe(true);
  });

  test("an interrupted play() (AbortError) does not surface a second play button", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      HTMLMediaElement.prototype.play = () =>
        Promise.reject(new DOMException("The play() request was interrupted", "AbortError"));
    });
    await page.goto("/");
    const wrap = page.locator('[data-testid="home-video"]');
    await wrap.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await expect(wrap.locator("button[class*='play']")).toHaveCount(0);
  });

  test("a blocked autoplay (NotAllowedError) offers the play button", async ({ page }) => {
    await page.addInitScript(() => {
      HTMLMediaElement.prototype.play = () =>
        Promise.reject(new DOMException("autoplay blocked", "NotAllowedError"));
    });
    await page.goto("/");
    const wrap = page.locator('[data-testid="home-video"]');
    await wrap.scrollIntoViewIfNeeded();
    await expect(wrap.locator("button[class*='play']")).toHaveCount(1);
  });

  test("reserves its box so it causes no layout shift", async ({ page }) => {
    await page.goto("/");
    // Layout height (offsetHeight) — the docking frame scales the video with a
    // transform, which is not a layout shift and would skew boundingBox().
    const video = page.locator('[data-testid="home-video"]');
    const before = await video.evaluate((el) => (el as HTMLElement).offsetHeight);
    await video.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const after = await video.evaluate((el) => (el as HTMLElement).offsetHeight);
    expect(before).toBeGreaterThan(0);
    expect(after).toBe(before);
  });

  test("exposes a pause control once playing, and it pauses the video", async ({
    page,
    browserName,
  }) => {
    // One browser is enough to cover the toggle button's behaviour; chromium
    // autoplays reliably here (see the first test above).
    test.skip(browserName !== "chromium", "one engine is enough for this toggle-button check");
    await page.goto("/");
    // Wait for the intro to hand off: while its overlay intercepts the pointer,
    // Playwright retries the click with fresh scrolls, each of which re-crosses
    // the IntersectionObserver threshold and can resume the video after the pause.
    await expect
      .poll(
        () => page.evaluate(() => document.documentElement.classList.contains("intro-pending")),
        { timeout: 8000 },
      )
      .toBe(false);
    const wrap = page.locator('[data-testid="home-video"]');
    const video = wrap.locator("video");
    await wrap.scrollIntoViewIfNeeded();
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);

    const pauseButton = wrap.getByRole("button", { name: /pause/i });
    await expect(pauseButton).toBeVisible();
    await expect(pauseButton).toHaveAccessibleName(/pause/i);
    await pauseButton.click();
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);

    // The same control toggles back to a "Play" accessible name and resumes.
    const playButton = wrap.getByRole("button", { name: /play/i });
    await expect(playButton).toBeVisible();
    await playButton.click();
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  });
});

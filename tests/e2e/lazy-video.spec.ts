import { expect, test } from "./fixtures";

// Most bytes the loop may send, by viewport. Viewports of 1024 px or more get up
// to 8 MB (about 2.6 Mbps), approved by the owner. Narrower ones, phones held
// sideways included, stay at the weight of the original (see
// git show 6139e7e:public/videohome.mp4): on mobile data, more would take longer
// and could stall.
const WIDE_FROM = 1024;
const WIDE_MAX_BYTES = 8_000_000;
const NARROW_MAX_BYTES = 3_611_663;
// videohome.mp4 and its versions: videohome-<label>.mp4 or .webm.
const VIDEO_URL = /videohome(-[\w-]+)?\.(mp4|webm)/;

// The loop that used to open the home now opens on About (Workbench, step 2):
// a small print on the bench that opens into a wide frame once half of its box
// is on screen. The test id sits on the reserved box (the stage), which never
// changes size; the frame inside it only transforms.
test.describe("about video", () => {
  test("downloads 0 video bytes on load and plays once scrolled into view", async ({
    page,
    browserName,
  }) => {
    const videoRequests: string[] = [];
    const videoResponses: import("@playwright/test").Response[] = [];
    page.on("request", (r) => {
      if (VIDEO_URL.test(r.url())) videoRequests.push(r.url());
    });
    page.on("response", (r) => {
      if (VIDEO_URL.test(r.url())) videoResponses.push(r);
    });
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
    expect(videoRequests).toEqual([]);

    const video = page.locator('[data-testid="about-video"] video');
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
    const wide = (page.viewportSize()?.width ?? 0) >= WIDE_FROM;
    expect(totalBytes).toBeLessThanOrEqual(wide ? WIDE_MAX_BYTES : NARROW_MAX_BYTES);

    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  });

  test("gives each viewport and engine its file", async ({ page, browserName }) => {
    const fileAt = async (width: number) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/about");
      const video = page.locator('[data-testid="about-video"] video');
      await video.scrollIntoViewIfNeeded();
      await expect.poll(() => video.getAttribute("src")).toBeTruthy();
      return video.getAttribute("src");
    };
    // WebKit reports AV1 as "probably" too, so only the vendor keeps it on H.264.
    const wide = browserName === "webkit" ? "/videohome-1080.mp4" : "/videohome-av1.mp4";
    expect(await fileAt(1024)).toBe(wide);
    expect(await fileAt(1023)).toBe("/videohome-720.mp4");
  });

  test("respects prefers-reduced-motion: no autoplay, accessible play button", async ({
    page,
    browserName,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about");
    const wrap = page.locator('[data-testid="about-video"]');
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

  test("reserves its box so it causes no layout shift", async ({ page }) => {
    await page.goto("/about");
    const before = await page.locator('[data-testid="about-video"]').boundingBox();
    await page.locator('[data-testid="about-video"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const after = await page.locator('[data-testid="about-video"]').boundingBox();
    expect(Math.round(after?.height ?? 0)).toBe(Math.round(before?.height ?? -1));
  });

  test("exposes a pause control once playing, and it pauses the video", async ({
    page,
    browserName,
  }) => {
    // One browser is enough to cover the toggle button's behaviour; chromium
    // autoplays reliably here (see the first test above).
    test.skip(browserName !== "chromium", "one engine is enough for this toggle-button check");
    await page.goto("/about");
    const wrap = page.locator('[data-testid="about-video"]');
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

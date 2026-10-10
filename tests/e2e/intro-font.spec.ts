import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// Seeks every Web Animation on the intro to a fixed time, so each screenshot is
// a deterministic frame regardless of machine speed. Scroll-driven animations
// (view()/scroll() timelines) take progress, not milliseconds, so skip them.
async function seek(page: Page, ms: number) {
  await page.evaluate((t) => {
    for (const a of document.getAnimations()) {
      if (!(a.timeline instanceof DocumentTimeline)) continue;
      a.pause();
      a.currentTime = t;
    }
  }, ms);
}

test.describe("IntroLoader wordmark font", () => {
  // Reference snapshots were only ever captured on win32 (see the
  // `-chromium-win32.png` suffix in tests/e2e/intro-font.spec.ts-snapshots),
  // so these screenshot comparisons fail by construction on Linux/macOS CI.
  test.skip(process.platform !== "win32", "reference frames were captured on win32 only");
  test.use({ viewport: { width: 1280, height: 800 } });
  // Forced serial: concurrent headless Chromium workers racing on the same
  // paused-animation screenshot were observed to collapse the 2500ms and
  // 3500ms frames to identical pixels (a rendering-pipeline timing artifact
  // under parallel load, verified by re-running with --workers=1). Serial
  // execution makes each frame's capture deterministic.
  test.describe.configure({ mode: "serial" });

  for (const ms of [500, 2500, 3500]) {
    test(`frame at ${ms}ms is unchanged`, async ({ page }, testInfo) => {
      // Reference frames are captured only for the desktop "chromium"
      // project. `browserName` is "chromium" for mobile-chromium too (same
      // engine, different device emulation/DPR), which would require a
      // second, separately-captured baseline set per screenshot; skip by
      // project name instead, matching the a11y-names.spec.ts pattern.
      test.skip(
        testInfo.project.name !== "chromium",
        "reference frames are captured for the chromium project only",
      );
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      await seek(page, ms);
      await expect(page.locator('[class*="IntroLoader_overlay"]')).toHaveScreenshot(
        `intro-${ms}.png`,
        {
          animations: "allow",
        },
      );
    });
  }
});

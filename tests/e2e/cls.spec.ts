import { expect, test } from "./fixtures";
import { ROUTES, measureCLS } from "./helpers";

test.describe("layout stability", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "layout-shift entries are Chromium-only");

  for (const route of ROUTES) {
    test(`${route.name}: CLS < 0.05 including the chatbot greeting`, async ({ page }) => {
      await page.goto(route.path);
      // 3.5 s covers the greeting bubble, which appears 2.5 s after load.
      const cls = await measureCLS(page, 3500);
      expect(cls).toBeLessThan(0.05);
    });
  }

  test("greeting bubble stays inside a 360px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/about");
    const bubble = page.getByText("Curious about my work?");
    await expect(bubble).toBeVisible({ timeout: 5000 });
    const box = await bubble.boundingBox();
    expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(360);
  });
});

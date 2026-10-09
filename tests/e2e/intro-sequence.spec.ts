import { expect, test } from "./fixtures";

test("intro-pending clears when the intro starts fading (~4 s), not at the 7 s backstop", async ({
  page,
}) => {
  await page.goto("/");
  const t0 = Date.now();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains("intro-pending")), {
      timeout: 8000,
    })
    .toBe(false);
  const elapsed = Date.now() - t0;
  expect(elapsed).toBeGreaterThan(3000);
  expect(elapsed).toBeLessThan(5500);
});

test("while the intro plays the h1 is already in the page", async ({ page }) => {
  await page.goto("/");
  expect(
    await page.evaluate(() => document.documentElement.classList.contains("intro-pending")),
  ).toBe(true);
  await expect(page.locator("h1")).toBeVisible();
});

test("the IntroLoader still ignores prefers-reduced-motion (brand exemption)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator('[class*="IntroLoader_overlay"]')).toBeVisible();
});

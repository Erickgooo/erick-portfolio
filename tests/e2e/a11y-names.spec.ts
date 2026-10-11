import { devices } from "@playwright/test";
import { expect, test } from "./fixtures";

// `defaultBrowserType` on the device preset is a worker-scoped fixture that
// Playwright refuses to override inside a nested `describe` (it would force a
// new worker); every project here already pins a single browser, so it's
// dropped and only the viewport/UA/touch fields are applied per-test.
const { defaultBrowserType: _defaultBrowserType, ...pixel7 } = devices["Pixel 7"];

test.describe("mobile nav", () => {
  test.use({ ...pixel7 });
  test("icon-only nav links have accessible names", async ({ page }) => {
    await page.goto("/");
    for (const name of ["About", "Projects", "Blog", "Visual Work"]) {
      await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
    }
  });
});

test("share and copy-link controls have accessible names", async ({ page }) => {
  await page.goto("/blog/my-workspace");
  await expect(page.getByRole("link", { name: "Share on X" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Share on LinkedIn" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Share by email" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy link to this post" })).toBeVisible();
});

test("heading copy-link controls are real buttons with a name", async ({ page }) => {
  await page.goto("/blog/my-workspace");
  expect(await page.getByRole("button", { name: /^Copy link to section/ }).count()).toBeGreaterThan(
    0,
  );
  expect(await page.locator("div[aria-label='Copy']").count()).toBe(0);
});

test("heading copy-link button becomes visible on keyboard focus", async ({ page }) => {
  await page.goto("/blog/my-workspace");
  const firstCopyButton = page.getByRole("button", { name: /^Copy link to section/ }).first();
  await firstCopyButton.focus();
  // The reveal is an opacity transition (200ms); poll past it instead of
  // reading a single mid-transition frame.
  await expect.poll(() => firstCopyButton.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
});

test("heading copy-link button is visible on touch devices without interaction", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-chromium",
    "hover:none behavior is only meaningful on the touch device project",
  );
  await page.goto("/blog/my-workspace");
  const firstCopyButton = page.getByRole("button", { name: /^Copy link to section/ }).first();
  const opacity = await firstCopyButton.evaluate((el) => getComputedStyle(el).opacity);
  expect(opacity).toBe("1");
});

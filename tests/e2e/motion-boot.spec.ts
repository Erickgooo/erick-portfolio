import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const fx = (page: Page) => page.evaluate(() => document.documentElement.dataset.fx);

test("full tier by default on a capable desktop", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
  });
  await page.goto("/about");
  expect(await fx(page)).toBe("full");
});

test("lite tier when deviceMemory <= 2", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 2 });
  });
  await page.goto("/about");
  expect(await fx(page)).toBe("lite");
});

test("lite tier when hardwareConcurrency < 4", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 });
  });
  await page.goto("/about");
  expect(await fx(page)).toBe("lite");
});

test("missing deviceMemory (Safari) is ignored, not treated as low", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => undefined });
  });
  await page.goto("/about");
  expect(await fx(page)).toBe("full");
});

test("intro-pending only on Home and cleared by the 7 s backstop at the latest", async ({ page }) => {
  await page.goto("/about");
  expect(
    await page.evaluate(() => document.documentElement.classList.contains("intro-pending")),
  ).toBe(false);
  await page.goto("/");
  expect(
    await page.evaluate(() => document.documentElement.classList.contains("intro-pending")),
  ).toBe(true);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains("intro-pending")), {
      timeout: 8000,
    })
    .toBe(false);
});

test("mo-io matches the absence of view() support", async ({ page }) => {
  await page.goto("/about");
  const { supports, moIo } = await page.evaluate(() => ({
    supports: CSS.supports("animation-timeline: view()"),
    moIo: document.documentElement.classList.contains("mo-io"),
  }));
  expect(moIo).toBe(!supports);
});

test("the page background is flat black in the dark theme, with no pattern", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/about");
  const bg = await page.evaluate(() => ({
    color: getComputedStyle(document.body).backgroundColor,
    pattern: getComputedStyle(document.body, "::before").backgroundImage,
  }));
  expect(bg.color).toBe("rgb(0, 0, 0)");
  expect(bg.pattern).toBe("none");
});

test("headings and body use Geist; figures use Geist Mono", async ({ page }) => {
  await page.goto("/about");
  const fonts = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      heading: root.getPropertyValue("--font-heading"),
      body: root.getPropertyValue("--font-body"),
      code: root.getPropertyValue("--font-code"),
    };
  });
  expect(fonts.heading).toContain("Geist");
  expect(fonts.body).toContain("Geist");
  expect(fonts.code).toContain("Geist Mono");
});

test("lite tier: no autoplay on the home video, play button offered", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 });
  });
  await page.goto("/");
  const wrap = page.locator('[data-testid="home-video"]');
  await wrap.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  expect(await wrap.locator("video").evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(wrap.getByRole("button", { name: /play/i })).toBeVisible();
});

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

test("lite tier on a slow connection", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
    Object.defineProperty(navigator, "connection", {
      get: () => ({ saveData: false, effectiveType: "3g" }),
    });
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

test("the font tokens name Geist for headings and body, and Geist Mono for code", async ({
  page,
}) => {
  await page.goto("/about");
  const fonts = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    // The family a stack asks for first; what follows it is the fallback.
    const first = (token: string) =>
      root
        .getPropertyValue(token)
        .split(",")[0]
        .trim()
        .replace(/^["']|["']$/g, "");
    return {
      heading: first("--font-heading"),
      body: first("--font-body"),
      code: first("--font-code"),
    };
  });
  // Exact names: "Geist Mono" also contains "Geist", and it is the code face only.
  expect(fonts).toEqual({ heading: "Geist", body: "Geist", code: "Geist Mono" });
});

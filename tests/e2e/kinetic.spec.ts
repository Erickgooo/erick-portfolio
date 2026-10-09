import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const CASES = [{ path: "/about", text: "Erick Mahecha" }];

async function copyH1(page: Page) {
  return page.evaluate(() => {
    const h1 = document.querySelector("h1");
    if (!h1) return "";
    const range = document.createRange();
    range.selectNodeContents(h1);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    return sel?.toString().replace(/\s+/g, " ").trim() ?? "";
  });
}

for (const c of CASES) {
  test(`${c.path}: h1 keeps its exact accessible name`, async ({ page }) => {
    await page.goto(c.path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(c.text);
  });

  test(`${c.path}: animated words are aria-hidden and separated by real spaces`, async ({
    page,
  }) => {
    await page.goto(c.path);
    const words = page.locator("h1 [data-kinetic-words]");
    await expect(words).toHaveAttribute("aria-hidden", "true");
    expect(await words.textContent()).toBe(c.text);
  });

  test(`${c.path}: copying the h1 yields the text once, with spaces`, async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "selection API assertion is Chromium-only");
    await page.goto(c.path);
    expect(await copyH1(page)).toBe(c.text);
  });

  test(`${c.path}: h1 words are fully opaque and unclipped from the first frame`, async ({
    page,
  }) => {
    await page.goto(c.path);
    const state = await page.$eval("h1", (h) => {
      const words = [...h.querySelectorAll<HTMLElement>("[data-kinetic-word]")];
      return {
        count: words.length,
        h1Opacity: getComputedStyle(h).opacity,
        wordOpacities: words.map((w) => getComputedStyle(w).opacity),
        overflow: getComputedStyle(h).overflow,
      };
    });
    expect(state.count).toBeGreaterThan(0);
    expect(state.h1Opacity).toBe("1");
    expect(state.wordOpacities.every((o) => o === "1")).toBe(true);
    expect(state.overflow).not.toBe("hidden");
  });
}

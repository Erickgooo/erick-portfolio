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
    await page.goto("/about");
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

test("a link under an embed is named by the words it shows", async ({ page }) => {
  await page.goto("/work/quick-metal-shop-viral-videos");
  const links = page.locator('.main-content-wrapper a[href*="instagram.com"]');
  await expect(links).toHaveCount(3);
  for (const link of await links.all()) {
    // Voice control finds a link by what is written on it, so the name must hold it.
    const shown = ((await link.textContent()) ?? "").trim();
    expect(shown).toBe("View metrics on Instagram");
    await expect(link).toHaveAccessibleName(shown);
  }
});

test("the picture that opens a case study is named after the project", async ({ page }) => {
  await page.goto("/work/dakoma-roofing");
  const title = ((await page.locator("h1").first().textContent()) ?? "").trim();
  expect(title).not.toBe("");
  const hero = page.locator("[data-project-hero] img");
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute("alt", title);
});

test("heading copy-link controls are real buttons with a name", async ({ page }) => {
  await page.goto("/blog/my-workspace");
  expect(await page.getByRole("button", { name: /^Copy link to section/ }).count()).toBeGreaterThan(
    0,
  );
  expect(await page.locator("div[aria-label='Copy']").count()).toBe(0);
});

test("heading copy-link buttons are shown without hover or focus, each named after its section", async ({
  page,
}) => {
  await page.goto("/blog/my-workspace");
  const buttons = page.getByRole("button", { name: /^Copy link to section/ });
  await expect(buttons.first()).toBeVisible();
  // Nothing is hovered and nothing has focus: the mark is there all the same, at
  // full strength. It used to fade in on hover, which a keyboard or a finger never does.
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  const marks = await buttons.evaluateAll((els) =>
    els.map((el) => {
      let opacity = 1;
      for (let node: Element | null = el; node; node = node.parentElement) {
        opacity *= Number(getComputedStyle(node).opacity);
      }
      const box = el.getBoundingClientRect();
      // The heading and its mark share one box.
      const heading = el
        .closest('[class*="HeadingLink_control"]')
        ?.querySelector("h1, h2, h3, h4, h5, h6");
      return {
        name: el.getAttribute("aria-label") ?? "",
        heading: (heading?.textContent ?? "").trim(),
        shown: el.checkVisibility({ visibilityProperty: true }) && box.width > 0 && box.height > 0,
        opacity,
      };
    }),
  );
  expect(marks.length).toBeGreaterThan(2);
  expect(marks.filter((mark) => !mark.shown || mark.opacity !== 1)).toEqual([]);
  expect(marks.filter((mark) => mark.heading === "" || !mark.name.includes(mark.heading))).toEqual(
    [],
  );
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

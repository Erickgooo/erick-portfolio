import { expect, test } from "./fixtures";

const SECTIONS = ["About", "Projects", "Blog", "Visual Work"];
const isMobile = (name: string) => name === "mobile-chromium";

test("the nav bar shows an icon and a label for every section", async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo.project.name), "desktop layout");
  await page.goto("/about");
  for (const name of SECTIONS) {
    const link = page.locator("header").getByRole("link", { name, exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveText(name);
    expect(await link.locator("svg").count()).toBeGreaterThan(0);
  }
});

test("the nav bar stays at the top while the page scrolls", async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo.project.name), "desktop layout");
  await page.goto("/about");
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
  const box = await page.locator("header").boundingBox();
  expect(box?.y).toBe(0);
});

test("the nav bar does not cover the top of the page content", async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo.project.name), "desktop layout");
  await page.goto("/work");
  const header = await page.locator("header").boundingBox();
  const heading = await page.locator("h1").first().boundingBox();
  expect(heading?.y ?? 0).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0));
});

test("phones get the icon bar at the bottom, with named links and no menu button", async ({
  page,
}, testInfo) => {
  test.skip(!isMobile(testInfo.project.name), "phone layout");
  await page.goto("/about");
  const viewport = page.viewportSize();
  const box = await page.locator("header").boundingBox();
  expect(box?.y ?? 0).toBeGreaterThan((viewport?.height ?? 0) / 2);
  for (const name of SECTIONS) {
    await expect(page.locator("header").getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: /menu/i })).toHaveCount(0);
});

// Every control in the bar is a tap target on phones and a safe click target on desktop.
const controlSizes = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("header a, header button"))
      // The bar renders a text and an icon variant of each link; one of them is display: none.
      .filter((el) => el.getClientRects().length > 0)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          name: el.getAttribute("aria-label") ?? el.textContent ?? "",
          w: r.width,
          h: r.height,
        };
      }),
  );

test("on a phone every nav control is at least 44x44 and the bar fits", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  const sizes = await controlSizes(page);
  expect(sizes.length).toBeGreaterThan(4);
  expect(sizes.filter((s) => s.w < 43.5 || s.h < 43.5)).toEqual([]);
  const bar = await page.locator("header").evaluate((el) => ({
    scroll: el.scrollWidth,
    client: el.clientWidth,
    docScroll: document.documentElement.scrollWidth,
  }));
  expect(bar.scroll).toBeLessThanOrEqual(bar.client);
  expect(bar.docScroll).toBeLessThanOrEqual(390);
});

test("at 320px wide the whole bar is on screen and centred, every control 44x44", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/about");
  await expect(page.locator("h1").first()).toBeVisible();
  const controls = await page.evaluate(() =>
    Array.from(document.querySelectorAll("header a, header button"))
      .filter((el) => el.getClientRects().length > 0)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          name: el.getAttribute("aria-label") ?? el.textContent ?? "",
          w: r.width,
          h: r.height,
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
        };
      }),
  );
  // Home, the four sections and the theme switch.
  expect(controls.length).toBe(6);
  expect(controls.filter((c) => c.w < 43.5 || c.h < 43.5)).toEqual([]);
  expect(
    controls.filter((c) => c.left < 0 || c.right > 320 || c.top < 0 || c.bottom > 640),
  ).toEqual([]);
  // Six 44px controls leave 16px to spare at this width: the same air on both
  // sides, not a gutter kept for labels that phones do not show.
  const air = { left: controls[0].left, right: 320 - controls[controls.length - 1].right };
  expect(air.left).toBeGreaterThanOrEqual(8);
  expect(Math.abs(air.left - air.right)).toBeLessThanOrEqual(1);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(overflow).toBeLessThanOrEqual(320);
});

test("on desktop every nav control is at least 28x28", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/about");
  const sizes = await controlSizes(page);
  expect(sizes.length).toBeGreaterThan(4);
  expect(sizes.filter((s) => s.w < 28 || s.h < 28)).toEqual([]);
});

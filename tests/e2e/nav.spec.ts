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

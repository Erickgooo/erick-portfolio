import { expect, test } from "./fixtures";

const isMobile = (name: string) => name === "mobile-chromium";

test("the nav is a floating pill detached from the top", async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo.project.name), "desktop layout");
  await page.goto("/about");
  const pill = page.locator("header nav");
  const box = await pill.boundingBox();
  const style = await pill.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      radius: Number.parseFloat(s.borderTopLeftRadius),
      position: getComputedStyle(el.closest("header") as HTMLElement).position,
    };
  });
  expect(style.position).toBe("fixed");
  expect(style.radius).toBeGreaterThan(100);
  expect(box?.y).toBe(24);
  expect(box?.width).toBeLessThan(900);
});

test("the current page is marked in the nav", async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo.project.name), "desktop layout");
  await page.goto("/work");
  await expect(page.locator("header").getByRole("link", { name: "Projects" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test.describe("mobile menu", () => {
  test.beforeEach(({ page: _page }, testInfo) => {
    test.skip(!isMobile(testInfo.project.name), "phone layout");
  });

  test("the burger opens a full screen menu and Escape closes it", async ({ page }) => {
    await page.goto("/about");
    const burger = page.getByRole("button", { name: "Open menu" });
    await expect(burger).toHaveAttribute("aria-expanded", "false");
    await burger.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(page.locator("#site-menu").getByRole("link", { name: "Projects" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await expect(page.locator("#site-menu").getByRole("link", { name: "Projects" })).toBeHidden();
  });

  test("choosing a link closes the menu", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.locator("#site-menu").getByRole("link", { name: "Projects" }).click();
    await page.waitForURL("**/work");
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });
});

test("nav links use the neutral text colour, not the global link blue", async ({
  page,
}, testInfo) => {
  test.skip(isMobile(testInfo.project.name), "desktop layout");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/about");
  const colors = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "var(--neutral-on-background-weak)";
    document.body.append(probe);
    const expected = getComputedStyle(probe).color;
    probe.remove();
    const link = document.querySelector('header nav a[href="/work"]') as HTMLElement;
    return { expected, actual: getComputedStyle(link).color };
  });
  expect(colors.actual).toBe(colors.expected);
});

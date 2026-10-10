import { expect, test } from "./fixtures";

const cta = (page: import("@playwright/test").Page) =>
  page.locator("[data-cta-magnetic]").getByRole("link", { name: "Book a 30 minute call" });

test("magnetic CTA moves at most 6px toward the pointer on desktop", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "fine-pointer check");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForTimeout(5500); // intro overlay blocks pointer events
  const link = cta(page);
  // Instant, not smooth: the CTA now sits under a long film and the box must be final.
  await link.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  const box = await link.boundingBox();
  if (!box) throw new Error("no CTA");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2, { steps: 5 });
  await page.waitForTimeout(250);
  // DOMMatrix only exists in the browser, so parse the transform there.
  const dx = await page.locator("[data-cta-magnetic]").evaluate((el) => {
    const t = getComputedStyle(el.firstElementChild as Element).transform;
    return new DOMMatrix(t === "none" ? undefined : t).m41;
  });
  expect(Math.abs(dx)).toBeGreaterThan(0);
  expect(Math.abs(dx)).toBeLessThanOrEqual(6);
});

test.describe("touch devices", () => {
  test("no magnetic transform on coarse pointers", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-chromium",
      "coarse-pointer check (Pixel 7 project)",
    );
    await page.goto("/");
    await page.waitForTimeout(5500);
    const link = cta(page);
    await link.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await link.hover();
    const t = await page
      .locator("[data-cta-magnetic]")
      .evaluate((el) => getComputedStyle(el.firstElementChild as Element).transform);
    expect(t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);
  });
});

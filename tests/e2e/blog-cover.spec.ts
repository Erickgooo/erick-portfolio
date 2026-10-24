import { expect, test } from "./fixtures";

// A post's cover on phones: the whole photo, at its own proportions, across
// the column (the page gutter is 16px a side), short enough to be seen whole,
// and no sideways scroll. On desktop it keeps the 400px print beside the title.

const POST = "/blog/my-workspace";
const COVER = 'main [class*="blog_cover"]';

async function measure(page: import("@playwright/test").Page) {
  const img = page.locator(`${COVER} img`);
  await expect(img).toBeVisible();
  return img.evaluate((el: HTMLImageElement) => {
    const fig = el.closest("figure") as HTMLElement;
    const f = fig.getBoundingClientRect();
    const i = el.getBoundingClientRect();
    return {
      vw: window.innerWidth,
      vh: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      fig: { left: f.left, width: f.width },
      img: { left: i.left, right: i.right, width: i.width, height: i.height },
      ratio: Number(el.getAttribute("height")) / Number(el.getAttribute("width")),
    };
  });
}

for (const [width, height] of [
  [390, 844],
  [360, 800],
]) {
  test(`on a ${width}px phone the post cover shows the whole photo across the column`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto(POST);
    const m = await measure(page);

    expect(m.scrollWidth).toBeLessThanOrEqual(m.vw);
    expect(m.fig.left).toBeCloseTo(16, 0);
    expect(m.fig.width).toBeCloseTo(m.vw - 32, 0);
    expect(m.img.left).toBeGreaterThanOrEqual(0);
    expect(m.img.right).toBeLessThanOrEqual(m.vw);
    // Not cropped or stretched: the drawn box keeps the file's proportions.
    expect(m.img.height / m.img.width).toBeCloseTo(m.ratio, 2);
    expect(m.img.height).toBeLessThanOrEqual(m.vh);
  });
}

test("on desktop the post cover stays the 400px print beside the title", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(POST);
  const m = await measure(page);

  expect(m.fig.width).toBeCloseTo(400, 0);
  expect(m.img.height / m.img.width).toBeCloseTo(m.ratio, 2);
});

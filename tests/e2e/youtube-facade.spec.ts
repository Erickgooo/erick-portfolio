import { expect, test } from "./fixtures";

const isYouTubePlayer = (url: string) =>
  /youtube(-nocookie)?\.com\/(embed|s\/player|youtubei)/.test(url);

test("gallery loads no YouTube player until a facade is activated", async ({ page }) => {
  const ytRequests: string[] = [];
  page.on("request", (r) => {
    if (isYouTubePlayer(r.url())) ytRequests.push(r.url());
  });
  await page.goto("/gallery");
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
  });
  await page.waitForLoadState("networkidle");
  expect(ytRequests).toEqual([]);
});

test("keyboard activation starts the player and moves focus into it", async ({ page }) => {
  await page.goto("/gallery");
  const facade = page.getByRole("button", { name: /^Play video:/ }).first();
  // The button is in the server's HTML, but Enter does nothing until React has
  // claimed it: it tags the nodes it has hydrated. Pressed before that, the key
  // was lost, and the player never came.
  await expect
    .poll(() =>
      facade.evaluate((el) => Object.keys(el).some((key) => key.startsWith("__reactFiber$"))),
    )
    .toBe(true);
  await facade.focus();
  await page.keyboard.press("Enter");
  const iframe = page.locator('iframe[src*="youtube-nocookie.com/embed/"]').first();
  await expect(iframe).toBeVisible();
  expect(await iframe.getAttribute("src")).toContain("autoplay=1");
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe("IFRAME");
});

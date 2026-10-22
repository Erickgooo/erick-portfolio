import { expect, test } from "./fixtures";

// Visual Work, the 404 and the protected-content screen in Workbench
// (docs/design/rediseno-2026/README.md, step 2). Structure and behaviour
// only: the media pieces themselves are never inspected.

test.describe("Visual Work", () => {
  test("the index card counts exactly the pieces laid on the bench", async ({ page }) => {
    await page.goto("/gallery");
    const figure = async (label: string) =>
      Number(
        await page
          .locator("dl div")
          .filter({ has: page.locator("dt", { hasText: new RegExp(`^${label}$`) }) })
          .locator("dd")
          .textContent(),
      );
    const videos = await figure("videos");
    const decks = await figure("carousels");
    const posts = await figure("posts");
    expect(videos + decks + posts).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: /^Play video:/ })).toHaveCount(videos);
    await expect(page.getByRole("button", { name: /^Open carousel/ })).toHaveCount(decks);
    await expect(page.getByRole("button", { name: /^Open image:/ })).toHaveCount(posts);
  });

  test("an image opens in the viewer, Escape closes it and focus returns", async ({ page }) => {
    await page.goto("/gallery");
    const trigger = page.getByRole("button", { name: /^Open image:/ }).first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await expect(viewer.getByRole("button", { name: "Close" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("a carousel deals through its slides with the arrow keys and the keys", async ({ page }) => {
    await page.goto("/gallery");
    const trigger = page.getByRole("button", { name: /^Open carousel/ }).first();
    const slides = Number((await trigger.getAttribute("aria-label"))?.match(/(\d+) slides/)?.[1]);
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const viewer = page.getByRole("dialog");
    const count = viewer.getByText(new RegExp(`\\d+ / ${slides}$`));
    await expect(count).toHaveText(`Slide 1 / ${slides}`);
    await page.keyboard.press("ArrowRight");
    await expect(count).toHaveText(`Slide 2 / ${slides}`);
    await viewer.getByRole("button", { name: "Previous slide" }).click();
    await expect(count).toHaveText(`Slide 1 / ${slides}`);
    await expect(viewer.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    await viewer.getByRole("button", { name: "Close" }).click();
    await expect(viewer).toBeHidden();
  });
});

test("the 404 shows the monogram and two ways back", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  const main = page.locator("main");
  await expect(main.getByRole("heading", { level: 1 })).toHaveText("Nothing on the bench here.");
  await expect(main.locator("svg[viewBox='314 503 1419 1038']")).toBeVisible();
  await expect(main.getByRole("link", { name: "Back to the home" })).toHaveAttribute("href", "/");
  await expect(main.getByRole("link", { name: /See the projects/ })).toHaveAttribute(
    "href",
    "/work",
  );
});

test("the password screen keeps a labelled field, a named reveal key and Submit", async ({
  page,
}) => {
  await page.goto("/unauthorized");
  // The reveal key works once the page has hydrated; a click before that is lost.
  await page.waitForLoadState("networkidle");
  const field = page.getByLabel("Password", { exact: true });
  await expect(field).toHaveAttribute("type", "password");
  const reveal = page.getByRole("button", { name: "Show password" });
  await reveal.click();
  await expect(field).toHaveAttribute("type", "text");
  await expect(reveal).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Submit" })).toBeEnabled();
});

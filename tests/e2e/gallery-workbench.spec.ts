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

// The scenes of these pages (README, "Step 3: scenes"): drawings only.
test.describe("scenes", () => {
  test("Visual Work shows how the pieces are made: four steps, each with an aria-hidden scene", async ({
    page,
  }) => {
    await page.goto("/gallery");
    const section = page.locator("section", {
      has: page.getByRole("heading", { level: 2, name: "How the pieces are made" }),
    });
    await expect(section.getByRole("heading", { level: 3 })).toHaveText([
      "Avatar",
      "Motion",
      "Voice",
      "Edit and post",
    ]);
    const scenes = section.locator("[data-scene]");
    await expect(scenes).toHaveCount(4);
    for (const scene of await scenes.all()) {
      await expect(scene).toHaveAttribute("aria-hidden", "true");
    }
    await section.scrollIntoViewIfNeeded();
    const box = await scenes.first().boundingBox();
    expect(box?.width).toBeGreaterThan(200);
    expect(box?.height).toBeGreaterThan(150);
  });

  test("the 404 scene types the address that was asked for", async ({ page }) => {
    await page.goto("/no/such-page");
    const scene = page.locator("main [data-scene]");
    await expect(scene).toHaveAttribute("aria-hidden", "true");
    await expect(scene.locator("[data-typed-text]")).toHaveText("/no/such-page");
    await expect(scene).toHaveAttribute("data-s2", "");
  });

  test("with reduced motion the 404 and the locked drawer show their final state at once", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/no/such-page");
    const lost = page.locator("main [data-scene]");
    await expect(lost).toHaveAttribute("data-s2", "");
    await expect(lost.locator("[data-typed-text]")).toHaveText("/no/such-page");
    await page.goto("/unauthorized");
    await expect(page.locator("main [data-scene]")).toHaveAttribute("data-s2", "");
  });

  test("the locked drawer is a drawing beside the password field, never around it", async ({
    page,
  }) => {
    await page.goto("/unauthorized");
    const drawing = page.locator("main [data-scene]");
    await expect(drawing).toHaveAttribute("aria-hidden", "true");
    await expect(drawing.locator("input, button, a")).toHaveCount(0);
    await expect(page.locator("[data-scene] #password")).toHaveCount(0);
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  });
});

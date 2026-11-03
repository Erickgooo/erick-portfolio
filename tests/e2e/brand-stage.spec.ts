import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// The brand stage (2026-11-02, "escenario por scroll"): on pinned desktop each
// brand takes the stage as the page scrolls and the rail takes you to any of
// them; on phones nothing pins; with reduced motion every brand shows, still.
// The index keeps a compact version. Every logo loads and every link opens
// its case.

const STAGE = 'section[data-brand-stage="home"]';
const BRANDS: [string, string][] = [
  ["Nequi", "/work/scope-multi-client-platform"],
  ["Wompi", "/work/scope-multi-client-platform"],
  ["Colmaíz", "/work/chatflow-whatsapp-ai-platform"],
  ["Samsung", "/work/samsung-lifemiles-whatsapp"],
  ["DIRECTV", "/work/directv-click-to-whatsapp"],
];
const FIGURES = ["13", "146/146", "35,000+", "2M+", "62"];

const isDesk = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

/** The Home, once the site intro (which holds the scroll) has gone. */
async function gotoHome(page: Page) {
  await page.goto("/");
  await expect(page.locator('[class*="IntroLoader_overlay"]')).toHaveCount(0, { timeout: 15_000 });
}

async function expectLoaded(img: Locator) {
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth), {
      timeout: 10_000,
    })
    .toBeGreaterThan(0);
}

/** Scrolls (instantly) to the middle of brand i's stretch of the pinned track. */
async function scrollToBrand(page: Page, i: number) {
  await page.locator(STAGE).evaluate((el, k) => {
    const track = el.querySelector("[data-track]") as HTMLElement;
    const n = el.querySelectorAll("[data-panel]").length;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const travel = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + travel * ((k + 0.5) / n), behavior: "instant" });
  }, i);
}

/** The panel is on stage: active, not inert, its pieces shown. */
async function expectOnStage(page: Page, i: number) {
  const panel = page.locator(`${STAGE} [data-panel="${i}"]`);
  await expect(panel).toHaveAttribute("data-state", "active");
  await expect
    .poll(() =>
      panel.evaluate(
        (el) => !(el as HTMLElement).inert && getComputedStyle(el.children[0]).opacity,
      ),
    )
    .toBe("1");
  await expect(page.locator(`${STAGE} [data-rail="${i}"]`)).toHaveAttribute("aria-current", "true");
  const others = await page
    .locator(`${STAGE} [data-panel]`)
    .evaluateAll(
      (els, k) => els.filter((el, j) => j !== k).map((el) => (el as HTMLElement).inert),
      i,
    );
  expect(others.every(Boolean), "the others are inert").toBe(true);
}

test("the stage comes right after the hero and before What I build", async ({ page }) => {
  await gotoHome(page);
  const order = await page.evaluate(() => {
    const hero = document.querySelector("#hero-title")?.closest("section");
    const stage = document.querySelector('section[data-brand-stage="home"]');
    const builds = document.querySelector("#builds-title")?.closest("section");
    return [hero?.nextElementSibling === stage, stage?.nextElementSibling === builds];
  });
  expect(order).toEqual([true, true]);
  await expect(page.locator(STAGE).getByRole("heading", { level: 2 })).toHaveText(
    "Brands I’ve led projects for at Incentiva Group",
  );
});

test("desktop: each brand takes the stage as the page scrolls", async ({ page }) => {
  test.skip(!isDesk(page), "the stage pins on desktop only");
  await gotoHome(page);
  const sticky = page.locator(`${STAGE} [data-track] > *`).first();
  await expect(sticky).toHaveCSS("position", "sticky");
  for (let i = 0; i < BRANDS.length; i++) {
    await scrollToBrand(page, i);
    await expectOnStage(page, i);
    // Its figure counts up to its real value.
    await expect(page.locator(`${STAGE} [data-panel="${i}"] [data-count-text]`)).toHaveText(
      FIGURES[i],
    );
  }
  // The whole stage stays within 300 svh of scroll.
  const travel = await page
    .locator(`${STAGE} [data-track]`)
    .evaluate((el) => (el as HTMLElement).offsetHeight - window.innerHeight);
  const vh = page.viewportSize()?.height ?? 720;
  expect(travel).toBeLessThanOrEqual(vh * 3 + 1);
});

test("desktop: the rail takes you to each brand, by click and by Enter", async ({ page }) => {
  test.skip(!isDesk(page), "the rail exists on desktop only");
  await gotoHome(page);
  await scrollToBrand(page, 0);
  for (const i of [3, 1, 4, 0, 2]) {
    await page.locator(`${STAGE} [data-rail="${i}"]`).click();
    await expectOnStage(page, i);
  }
  const rail = page.locator(`${STAGE} [data-rail="4"]`);
  await rail.focus();
  await page.keyboard.press("Enter");
  await expectOnStage(page, 4);
  await expect(rail).toHaveAccessibleName(/DIRECTV/);
});

test("each brand's logo loads and its link opens its case", async ({ page, request }) => {
  await gotoHome(page);
  const panels = page.locator(`${STAGE} [data-panel]`);
  await expect(panels).toHaveCount(BRANDS.length);
  for (const [i, [name, href]] of BRANDS.entries()) {
    const panel = panels.nth(i);
    if (isDesk(page)) await scrollToBrand(page, i);
    else await panel.scrollIntoViewIfNeeded();
    const img = panel.locator("img");
    await expect(img).toHaveAttribute("alt", name);
    await expectLoaded(img);
    const link = panel.getByRole("link", { name: /^See the case/ });
    await expect(link).toHaveAttribute("href", href);
    expect((await request.get(href)).status(), href).toBe(200);
  }
  // Following one opens its case.
  if (isDesk(page)) await scrollToBrand(page, 3);
  else await panels.nth(3).scrollIntoViewIfNeeded();
  await panels
    .nth(3)
    .getByRole("link", { name: /^See the case/ })
    .click();
  await expect(page).toHaveURL(/\/work\/samsung-lifemiles-whatsapp$/);
});

test("phones: nothing pins, there is no rail, and every brand is a card", async ({ page }) => {
  test.skip(isDesk(page), "phones only");
  await gotoHome(page);
  await expect(page.locator(`${STAGE} [data-track] > *`).first()).not.toHaveCSS(
    "position",
    "sticky",
  );
  await expect(page.locator(`${STAGE} ol`)).toBeHidden();
  const panels = page.locator(`${STAGE} [data-panel]`);
  for (let i = 0; i < BRANDS.length; i++) {
    const panel = panels.nth(i);
    await panel.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        panel.evaluate((el) => !(el as HTMLElement).inert && getComputedStyle(el).opacity),
      )
      .toBe("1");
    await expect(panel.locator("[data-count-text]")).toHaveText(FIGURES[i]);
  }
});

test("reduced motion: every brand shows at once, still, with its final figure", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoHome(page);
  const stage = page.locator(STAGE);
  await expect(stage.locator("[data-track] > *").first()).not.toHaveCSS("position", "sticky");
  await expect(stage.locator("ol")).toBeHidden();
  await stage.scrollIntoViewIfNeeded();
  const state = await stage.locator("[data-panel]").evaluateAll((els) =>
    els.map((el) => ({
      inert: (el as HTMLElement).inert,
      opacity: getComputedStyle(el).opacity,
      pieces: Array.from(el.children).every((c) => getComputedStyle(c).opacity === "1"),
      figure: el.querySelector("[data-count-text]")?.textContent,
    })),
  );
  expect(state).toEqual(
    FIGURES.map((figure) => ({ inert: false, opacity: "1", pieces: true, figure })),
  );
  const moving = await stage.evaluate(
    (el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length,
  );
  expect(moving).toBe(0);
});

test("the index keeps a compact version: every brand, never pinned", async ({ page }) => {
  await page.goto("/work/incentiva-group");
  const compact = page.locator('section[data-brand-stage="index"]');
  await expect(compact.locator("[data-track], ol")).toHaveCount(0);
  const panels = compact.locator("[data-panel]");
  await expect(panels).toHaveCount(BRANDS.length);
  for (const [i, [name, href]] of BRANDS.entries()) {
    const panel = panels.nth(i);
    await panel.scrollIntoViewIfNeeded();
    await expectLoaded(panel.locator("img"));
    await expect(panel.locator("img")).toHaveAttribute("alt", name);
    await expect(panel.getByRole("link", { name: /^See the case/ })).toHaveAttribute("href", href);
    await expect(panel.locator("[data-count-text]")).toHaveText(FIGURES[i]);
  }
});

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// Round 3 of the Incentiva Group brief (2026-11-02,
// docs/design/rediseno-2026/incentiva-encargo.md): the tool wall with no tile
// left without a logo or pictogram. The brands now have their own stage
// (brand-stage.spec.ts).

/** Scrolls an image into view and waits until it has decoded a real picture. */
async function expectLoaded(img: Locator) {
  await img.scrollIntoViewIfNeeded();
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth), {
      timeout: 10_000,
    })
    .toBeGreaterThan(0);
}

/** The tiles a visitor sees: the board's cells on desktop, the lists on phones. */
async function visibleTiles(page: Page) {
  const desk = await page.evaluate(() => window.matchMedia("(min-width: 1024px)").matches);
  return {
    desk,
    tiles: page.locator(
      desk
        ? '[class*="toolwall_face__"]:not([class*="toolwall_hot__"])'
        : '[class*="toolwall_tile__"]',
    ),
  };
}

for (const theme of ["light", "dark"] as const) {
  test(`${theme} theme: every tile of the tool wall shows a logo or a pictogram`, async ({
    page,
  }) => {
    await page.addInitScript((t) => localStorage.setItem("data-theme", t), theme);
    await page.goto("/");
    const wall = page.locator('section[aria-labelledby="tools-title"]');
    await wall.scrollIntoViewIfNeeded();
    const { desk, tiles } = await visibleTiles(page);
    // 39 tools: 37 official logos and 2 pictograms (Azure and Azure DevOps do
    // not allow their marks here; Xcode, App Store Connect and Google Play show
    // theirs by Erick's decision of 2026-11-03).
    await expect(tiles).toHaveCount(39);
    let pictograms = 0;
    for (let i = 0; i < 39; i++) {
      const tile = tiles.nth(i);
      if (!desk) await tile.scrollIntoViewIfNeeded();
      const name = (await tile.textContent())?.trim() ?? "";
      expect(name, `tile ${i} has a name`).not.toBe("");
      const img = tile.locator("img");
      const svg = tile.locator("svg[data-pictogram]");
      const kinds = (await img.count()) + (await svg.count());
      expect(kinds, `${name}: exactly one glyph`).toBe(1);
      if (await img.count()) {
        await expectLoaded(img);
      } else {
        pictograms += 1;
        const box = await svg.boundingBox();
        expect(box?.width ?? 0, `${name}: pictogram drawn`).toBeGreaterThan(10);
      }
      // Nothing hides the glyph: the chip it sits on is shown and not transparent.
      const chip = await tile.evaluate((el) => {
        const c = el.querySelector('[class*="toolwall_chip__"]') as HTMLElement | null;
        if (!c) return null;
        const s = getComputedStyle(c);
        return {
          display: s.display,
          visibility: s.visibility,
          opacity: Number(s.opacity),
          bg: s.backgroundColor,
        };
      });
      expect(chip, `${name}: chip`).not.toBeNull();
      expect(chip?.display).not.toBe("none");
      expect(chip?.visibility).toBe("visible");
      expect(chip?.opacity ?? 0).toBeGreaterThan(0.3);
      // In dark, every logo sits on a white chip in its own colours, never as
      // a flat silhouette (a black mark would vanish on the dark tile).
      if (theme === "dark") {
        expect(chip?.bg, `${name}: light chip in dark`).toBe("rgb(255, 255, 255)");
        if (await img.count()) {
          const filter = await img.evaluate((el) => getComputedStyle(el).filter);
          expect(filter, `${name}: no silhouette filter`).not.toMatch(/invert|brightness\(0\)/);
        }
      }
    }
    expect(pictograms).toBe(2);
  });
}

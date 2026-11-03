import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// Round 3 of the Incentiva Group brief (2026-11-02,
// docs/design/rediseno-2026/incentiva-encargo.md): the strip of brands Erick
// led projects for at Incentiva Group, on the Home and in the head of the
// index, and the tool wall with no tile left without a logo or pictogram.

const STRIP = "[data-brand-strip]";
const BRANDS: [string, string][] = [
  ["Nequi", "/work/scope-multi-client-platform"],
  ["Wompi", "/work/scope-multi-client-platform"],
  ["Colmaíz", "/work/chatflow-whatsapp-ai-platform"],
  ["Samsung", "/work/samsung-lifemiles-whatsapp"],
];

/** Scrolls an image into view and waits until it has decoded a real picture. */
async function expectLoaded(img: Locator) {
  await img.scrollIntoViewIfNeeded();
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth), {
      timeout: 10_000,
    })
    .toBeGreaterThan(0);
}

for (const path of ["/", "/work/incentiva-group"]) {
  test(`${path}: the brand strip shows each logo, linked to its case`, async ({ page }) => {
    await page.goto(path);
    const strip = page.locator(STRIP);
    await expect(strip).toHaveCount(1);
    await expect(strip.getByRole("heading")).toHaveText(
      "Brands I’ve led projects for at Incentiva Group",
    );
    const links = strip.locator("a");
    await expect(links).toHaveCount(BRANDS.length);
    for (const [k, [name, href]] of BRANDS.entries()) {
      const link = links.nth(k);
      await expect(link).toHaveAttribute("href", href);
      const img = link.locator("img");
      await expect(img).toHaveAttribute("alt", name);
      await expectLoaded(img);
      await expect(img).toBeVisible();
      // Its accessible name says where it goes.
      await expect(link).toHaveAccessibleName(new RegExp(`^${name} \\(the .+ case\\)$`));
    }
    // DIRECTV is named in the text only: Incentiva holds no logo file for it.
    await expect(strip.locator('img[alt*="DIRECTV" i]')).toHaveCount(0);
  });
}

test("the Home's brand strip comes right after the hero and before What I build", async ({
  page,
}) => {
  await page.goto("/");
  const order = await page.evaluate(() => {
    const hero = document.querySelector("#hero-title")?.closest("section");
    const strip = document.querySelector("[data-brand-strip]");
    const builds = document.querySelector("#builds-title")?.closest("section");
    return [hero?.nextElementSibling === strip, strip?.nextElementSibling === builds];
  });
  expect(order).toEqual([true, true]);
});

/** The tiles a visitor sees: the board's cells on desktop, the lists on phones. */
async function visibleTiles(page: Page) {
  const desk = await page.evaluate(() => window.matchMedia("(min-width: 1024px)").matches);
  return {
    desk,
    tiles: page.locator(
      desk ? '[class*="toolwall_face__"]:not([class*="toolwall_hot__"])' : '[class*="toolwall_tile__"]',
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
    // 38 tools: 34 official logos and 4 pictograms (Azure, Azure DevOps,
    // App Store Connect and Google Play do not allow their marks here).
    await expect(tiles).toHaveCount(38);
    let pictograms = 0;
    for (let i = 0; i < 38; i++) {
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
    expect(pictograms).toBe(4);
  });
}

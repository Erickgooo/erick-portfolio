import { expect, test } from "./fixtures";
import { pdfLineBoxes, pdfText } from "./pdf-text";

// Round 6 (2026-11-03, docs/design/rediseno-2026/ajustes-cv-marcas-encargo.md):
// the resume back in the original's style with a centred head, the commercial
// proposals gone, no "Experience & Resume" link, the brand logos straight on
// the page in both themes, and the tool wall with Xcode, ChatGPT 6.1 Sol and
// the official App Store Connect and Google Play icons.

const RESUME = "/resume/Erick_Mahecha_Resume.pdf";

test.describe("the resume", () => {
  test("says Incentiva Group and nothing of the proposals", async ({ request }) => {
    const response = await request.get(RESUME);
    expect(response.status()).toBe(200);
    const text = pdfText(await response.body()).replace(/\s+/g, " ");
    expect(text).toContain("Incentiva Group");
    expect(text).toContain("Growth & AI Systems Lead");
    for (const banned of [/proposal/i, /quotation/i, /Indiana/i, /cost model/i]) {
      expect(text, String(banned)).not.toMatch(banned);
    }
  });

  test("keeps to two pages, its name centred on the page", async ({ request }) => {
    const boxes = pdfLineBoxes(await (await request.get(RESUME)).body());
    expect(Math.max(...boxes.map((b) => b.page)) + 1).toBeLessThanOrEqual(2);
    const name = boxes.find((b) => b.page === 0 && /^ERICK SANTIAGO MAHECHA TAFUR$/i.test(b.text));
    expect(name, "the name's line").toBeDefined();
    if (!name) return;
    const centre = (name.x0 + name.x1) / 2;
    expect(Math.abs(centre - name.pageWidth / 2)).toBeLessThanOrEqual(2);
    // The title and the contact line under it are centred too.
    const title = boxes.find((b) => b.page === 0 && b.text === "Growth & AI Systems Lead");
    expect(title, "the title's line").toBeDefined();
    if (title)
      expect(Math.abs((title.x0 + title.x1) / 2 - name.pageWidth / 2)).toBeLessThanOrEqual(2);
  });
});

test("no page links to Experience & Resume", async ({ page }) => {
  for (const path of ["/", "/about", "/work", "/work/incentiva-group", "/blog"]) {
    await page.goto(path);
    await expect(page.getByRole("link", { name: /Experience\s*&\s*Resume/i }), path).toHaveCount(0);
    await expect(page.getByText(/Experience\s*&\s*Resume/i), path).toHaveCount(0);
  }
  // About keeps the section, its anchor and the resume.
  await page.goto("/about");
  await expect(page.locator("#experience h2")).toHaveText("Experience");
  await expect(
    page.locator("#experience").getByRole("link", { name: /Download the resume/ }),
  ).toHaveAttribute("href", RESUME);
});

test("the tool wall: 39 tiles, two of them pictograms, and the new names", async ({ page }) => {
  await page.goto("/");
  const wall = page.locator('section[aria-labelledby="tools-title"]');
  // The lists (shown on phones, kept for screen readers on desktop) carry every tool.
  const tiles = wall.locator('[class*="toolwall_tile__"]');
  await expect(tiles).toHaveCount(39);
  await expect(wall.locator('[class*="toolwall_tile__"] svg[data-pictogram]')).toHaveCount(2);
  const names = (await tiles.allTextContents()).map((t) => t.trim());
  for (const name of ["ChatGPT 6.1 Sol", "Xcode", "App Store Connect", "Google Play"]) {
    expect(names, name).toContain(name);
  }
  expect(names).not.toContain("GPT-4o mini");
  // The desktop board: 39 cells, three of them wide (6 x 7 = 42 cells).
  await expect(wall.locator('[class*="toolwall_cell__"]')).toHaveCount(39);
  await expect(wall.locator('[class*="toolwall_cell__"][data-wide]')).toHaveCount(3);
});

test("phones and tablets: no group of the tool wall leaves a hole", async ({ page }) => {
  // Below 1024 px each group has its own list: 3 columns on phones, 6 (or 4
  // for the groups of 7 and 8) on tablets.
  for (const width of [390, 800]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const lists = page.locator('section[aria-labelledby="tools-title"] [class*="toolwall_tiles__"]');
    await expect(lists).toHaveCount(6);
    // Laid out for real (the wall skips rendering until it is near), every
    // list's last tile ends where its widest row ends, so its last row is
    // full. Layout boxes, not client rects: the tiles enter slightly scaled.
    const gaps: number[] = [];
    for (let i = 0; i < 6; i++) {
      const list = lists.nth(i);
      await list.scrollIntoViewIfNeeded();
      gaps.push(
        await list.evaluate((ul) => {
          const tiles = Array.from(ul.children) as HTMLElement[];
          const right = (el: HTMLElement) => el.offsetLeft + el.offsetWidth;
          const widest = Math.max(...tiles.map(right));
          return Math.abs(widest - right(tiles[tiles.length - 1])) <= 1 ? 0 : widest;
        }),
      );
    }
    expect(gaps, `${width} px`).toEqual([0, 0, 0, 0, 0, 0]);
  }
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} theme: the brand logos sit on the page, one file per theme`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem("data-theme", t), theme);
    for (const path of ["/", "/work/incentiva-group"]) {
      await page.goto(path);
      const cards = page.locator('[data-brand-stage] [class*="brandstage_logoCard__"]');
      await expect(cards, path).toHaveCount(5);
      for (let i = 0; i < 5; i++) {
        const card = cards.nth(i);
        const look = await card.evaluate((el) => {
          const s = getComputedStyle(el);
          return { bg: s.backgroundColor, image: s.backgroundImage, border: s.borderTopWidth };
        });
        expect(look.bg, `${path} ${i}: no background`).toBe("rgba(0, 0, 0, 0)");
        expect(look.image).toBe("none");
        expect(look.border).toBe("0px");
        // Exactly one of the two files shows, the one for this theme.
        const shown = card.locator("img:visible");
        await expect(shown).toHaveCount(1);
        const src = (await shown.getAttribute("src")) ?? "";
        const name = (await shown.getAttribute("alt")) ?? "";
        if (theme === "dark" && name !== "Colmaíz") expect(src, name).toMatch(/on-dark/);
        if (theme === "light") expect(src, name).not.toMatch(/on-dark/);
      }
    }
  });
}

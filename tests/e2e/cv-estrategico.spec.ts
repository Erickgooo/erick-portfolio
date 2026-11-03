import { expect, test } from "./fixtures";
import { pdfLineBoxes, pdfText } from "./pdf-text";

// Round 7 (2026-11-03, docs/design/rediseno-2026/cv-estrategico-encargo.md):
// the resume opens each earlier role with its result (Quick Metal Shop with
// the 338K+ organic views), the 285 panel variants are gone from the site and
// the resume, the Colmaíz assistant "has reached" its contacts, the Home's job
// list starts every role in the same column, and Colmaíz has its official
// negative on the dark theme.

const RESUME = "/resume/Erick_Mahecha_Resume.pdf";

test.describe("the resume", () => {
  test("Quick Metal Shop opens with the 338K+ views, and the 285 is gone", async ({ request }) => {
    const response = await request.get(RESUME);
    expect(response.status()).toBe(200);
    const pdf = await response.body();
    const text = pdfText(pdf).replace(/\s+/g, " ");
    // Quick Metal Shop's block runs, on the page, from its name down to the
    // next company's (Chromium paints the heads before the bullets, so the
    // text's order is not the page's: the lines are placed by their baseline).
    const boxes = pdfLineBoxes(pdf);
    const head = (name: string) => boxes.find((b) => b.text === name);
    const qms = head("Quick Metal Shop");
    const dakoma = head("Dakoma Roofing");
    expect(qms, "Quick Metal Shop's head").toBeDefined();
    expect(dakoma, "Dakoma Roofing's head").toBeDefined();
    if (!qms || !dakoma) return;
    const inBlock = (pattern: RegExp) =>
      boxes.filter(
        (b) =>
          pattern.test(b.text) &&
          (b.page - qms.page) * 10_000 + b.y > qms.y &&
          (b.page - dakoma.page) * 10_000 + b.y < dakoma.y,
      );
    const views = inBlock(/338K\+/);
    expect(views, "338K+ inside Quick Metal Shop").toHaveLength(1);
    // Its first bullet is the video pipeline's result, above the brand manual.
    const manual = inBlock(/Brand Manual/);
    expect(manual).toHaveLength(1);
    expect(views[0].y).toBeLessThan(manual[0].y);
    expect(text).not.toMatch(/285/);
    expect(text).not.toMatch(/panel variants/i);
    expect(text).not.toMatch(/serves a community/i);
    expect(text).toContain("has reached 35,000+ contacts and served 6,000+ of them");
  });
});

test.describe("the Home's job list", () => {
  const LIST = 'ul[aria-label="Where I have worked"]';

  async function roles(page: import("@playwright/test").Page, width: number) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const list = page.locator(LIST);
    await list.scrollIntoViewIfNeeded();
    await expect(list.locator("> li")).toHaveCount(7);
    // Layout boxes relative to each row (the rows rise into place as they
    // reveal, which moves them up and down but never sideways).
    return list.locator("> li").evaluateAll((lis) =>
      lis.map((li) => {
        const role = li.children[1] as HTMLElement;
        const row = li.getBoundingClientRect();
        const box = role.getBoundingClientRect();
        return {
          company: li.children[0].textContent ?? "",
          left: box.left - row.left,
          top: box.top - row.top,
        };
      }),
    );
  }

  for (const width of [768, 1024, 1280]) {
    test(`at ${width} px every role starts in the same column`, async ({ page }) => {
      const rows = await roles(page, width);
      const lefts = rows.map((r) => r.left);
      const spread = Math.max(...lefts) - Math.min(...lefts);
      expect(spread, JSON.stringify(rows)).toBeLessThanOrEqual(1);
      // The role is a column of its own, right of the company.
      expect(Math.min(...lefts)).toBeGreaterThan(100);
      // The same vertical alignment in every row.
      const tops = rows.map((r) => r.top);
      expect(Math.max(...tops) - Math.min(...tops), JSON.stringify(rows)).toBeLessThanOrEqual(1);
    });
  }

  test("at 375 px, one column, every role has the same indent and space", async ({ page }) => {
    const rows = await roles(page, 375);
    for (const r of rows) {
      expect(Math.abs(r.left - rows[0].left), r.company).toBeLessThanOrEqual(1);
      expect(Math.abs(r.top - rows[0].top), r.company).toBeLessThanOrEqual(1);
    }
    expect(rows[0].left).toBeLessThanOrEqual(1);
  });
});

test("the 285 is gone from the About page and the ArquiExpo case", async ({ page }) => {
  for (const path of ["/about", "/work/quick-metal-shop-arquiexpo", "/work"]) {
    await page.goto(path);
    const text = (await page.locator("main").innerText()).replace(/\s+/g, " ");
    expect(text, path).not.toMatch(/\b285\b/);
    expect(text, path).not.toMatch(/panel variants/i);
  }
  // About's figures: the LifeMiles miles, at Incentiva Group, where the 285 was.
  await page.goto("/about");
  const tags = page.getByRole("list", { name: "In figures" });
  await expect(tags).toContainText("2M+");
  await expect(tags).toContainText("at Incentiva Group");
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} theme: Colmaíz shows its ${theme === "dark" ? "official negative" : "colour logo"}`, async ({
    page,
  }) => {
    await page.addInitScript((t) => localStorage.setItem("data-theme", t), theme);
    for (const path of ["/", "/work/incentiva-group"]) {
      await page.goto(path);
      const shown = page.locator('[data-brand-stage] img[alt="Colmaíz"]:visible');
      await expect(shown, path).toHaveCount(1);
      const src = decodeURIComponent((await shown.getAttribute("src")) ?? "");
      if (theme === "dark") expect(src, path).toMatch(/colmaiz-on-dark/);
      else expect(src, path).not.toMatch(/on-dark/);
    }
  });
}

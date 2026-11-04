import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// Message and impact round (docs/design/rediseno-2026/mensaje-impacto-encargo.md):
// the hero's headline and lede, the Home's description, the lede of /work and
// the line "What the business gained" in four cases. The second half guards
// what must not change, so it passes on the previous main too: the Home's
// title, the hero's two keys, no "Experience & Resume", and the bench inside
// the first screen of a 360 x 780 phone.

const INTRO = '[class*="IntroLoader_overlay"]';
const HEADLINE = "I build and run the systems behind business growth.";
const LEDE =
  "From growth operations and AI automation to production software. I lead the strategy, architecture and delivery of systems businesses depend on.";
const DESCRIPTION =
  "Erick Mahecha, Growth & AI Systems Lead. From growth operations and AI automation to production software: strategy, architecture and delivery.";
const WORK_LEDE = "AI automation, growth operations and production software, built and run.";

const BUSINESS_LINES: Record<string, string> = {
  "scope-multi-client-platform":
    "Incentiva can now serve a second financial client on the platform it already runs, with each client's data kept apart. Adding a campaign became configuration instead of a project.",
  "chatflow-whatsapp-ai-platform":
    "Incentiva runs several client lines on one platform, and a small team can change it with confidence that no client will notice. Colmaíz's commercial team now has its own view of its conversations and uses it daily.",
  "scope-ios-launch":
    "Field staff on iPhones can now work in the app, and Incentiva owns what it needs to keep shipping it. When a coordinator reports a problem from the field, the answer is a version and a date.",
  "directv-click-to-whatsapp":
    "Incentiva owns a digital sales channel it can read: each lead arrives pre-qualified and with consent, and each sale reports back to the ad platform that produced it. The advisor who closes the sale gets only the conversations worth closing.",
};

async function openHome(page: Page) {
  await page.goto("/");
  await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 15_000 });
}

test.describe("the new message", () => {
  test("the hero carries the exact headline and lede", async ({ page }) => {
    await openHome(page);
    await expect(page.locator("#hero-title")).toHaveText(HEADLINE);
    const hero = page.locator("section", { has: page.locator("#hero-title") });
    await expect(hero.locator('[class*="hero_offer"]')).toHaveText(LEDE);
  });

  test("the Home's description is the new one, for search and for shared links", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", DESCRIPTION);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      "content",
      DESCRIPTION,
    );
  });

  test("/work opens with the new sentence and keeps the case count", async ({ page }) => {
    await page.goto("/work");
    const lede = page.locator('[class*="work_lede"]');
    await expect(lede).toContainText(WORK_LEDE);
    await expect(lede).toHaveText(new RegExp(`^${WORK_LEDE} \\S+ cases, newest first\\.$`));
  });

  for (const [slug, text] of Object.entries(BUSINESS_LINES)) {
    test(`${slug} says what the business gained, right after its result`, async ({ page }) => {
      await page.goto(`/work/${slug}`);
      const line = page.locator("main p", {
        has: page.locator("strong", { hasText: /^What the business gained:$/ }),
      });
      await expect(line).toHaveCount(1);
      await expect(line).toHaveText(`What the business gained: ${text}`);
      const previous = await line.evaluate((el) => el.previousElementSibling?.textContent ?? "");
      expect(previous).toMatch(/^Result: /);
      // No measured-sounding claims, and no figure of any kind (D35).
      const said = await line.innerText();
      expect(said).not.toMatch(/\b(reduced|saved|faster|fewer|increased|more efficient)\b/i);
      expect(said).not.toMatch(/\d/);
    });
  }
});

test.describe("what must not change", () => {
  test("the Home's title stays the umbrella title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Erick Mahecha · Growth & AI Systems Lead");
  });

  test("the hero keeps its two keys and no others", async ({ page }) => {
    await openHome(page);
    const hero = page.locator("section", { has: page.locator("#hero-title") });
    await expect(hero.getByRole("link")).toHaveCount(2);
    await expect(hero.getByRole("link", { name: "Explore my work" })).toHaveAttribute(
      "href",
      "/work",
    );
    await expect(hero.getByRole("link", { name: "Book a call" })).toHaveAttribute(
      "href",
      /calendly\.com/,
    );
  });

  for (const path of ["/", "/work"]) {
    test(`${path} has no "Experience & Resume"`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByText("Experience & Resume")).toHaveCount(0);
    });
  }

  // A phone context (overlay scrollbars, so the column is the full width). Only
  // Chromium runs it: Firefox cannot emulate a phone, and the layout is the same.
  test("on a 360 x 780 phone the bench starts in the first screen and the tablet out-sizes the text", async ({
    browser,
    browserName,
    baseURL,
  }) => {
    test.skip(browserName !== "chromium", "phone emulation, measured in Chromium");
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 360, height: 780 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await openHome(page);
    await page.evaluate(() => document.fonts.ready);
    const sizes = await page.evaluate(() => {
      const textArea = (el: Element | null) => {
        if (!el) return 0;
        const range = document.createRange();
        range.selectNodeContents(el);
        const { width, height } = range.getBoundingClientRect();
        return width * height;
      };
      const bench = document.querySelector('[class*="bench_bench"]')?.getBoundingClientRect();
      const tablet = document.querySelector('[data-slot="screen"]')?.getBoundingClientRect();
      return {
        benchTop: bench?.top ?? Number.POSITIVE_INFINITY,
        tabletBottom: tablet?.bottom ?? Number.POSITIVE_INFINITY,
        tabletArea: (tablet?.width ?? 0) * (tablet?.height ?? 0),
        headlineArea: textArea(document.querySelector("#hero-title")),
        ledeArea: textArea(document.querySelector('[class*="hero_offer"]')),
      };
    });
    await context.close();
    expect(sizes.benchTop).toBeLessThan(780);
    // The whole tablet is on screen, and neither text block is larger: it stays
    // the page's LCP element.
    expect(sizes.tabletBottom).toBeLessThanOrEqual(780);
    expect(sizes.headlineArea).toBeLessThan(sizes.tabletArea);
    expect(sizes.ledeArea).toBeLessThan(sizes.tabletArea);
  });
});

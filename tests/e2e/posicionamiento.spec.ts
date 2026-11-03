import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { pdfText } from "./pdf-text";

// Positioning of 2026-11-03 (docs/design/rediseno-2026/validacion-confidencial.md):
// the umbrella title, the hero, the recruiter's route to #experience, the four
// featured cases, the page titles, the blog's four posts, the resume, and the
// accessibility pass (keyboard focus, axe, 360 px).

const INTRO = '[class*="IntroLoader_overlay"]';
const ROLE = "Growth & AI Systems Lead";

async function openHome(page: Page) {
  await page.goto("/");
  await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 15_000 });
}

test("the hero carries the umbrella title, the headline and the three routes", async ({ page }) => {
  await openHome(page);
  const hero = page.locator("section", { has: page.locator("#hero-title") });
  await expect(hero.getByText("Growth / AI / Systems", { exact: true })).toBeVisible();
  await expect(hero.getByText(ROLE, { exact: true })).toBeVisible();
  await expect(page.locator("#hero-title")).toHaveText(
    "I build the systems behind business growth.",
  );
  await expect(hero).toContainText(
    "From acquisition and CRM automation to AI assistants and production software. I turn disconnected tools and workflows into systems teams can actually run.",
  );
  await expect(hero.getByRole("link", { name: "Explore my work" })).toHaveAttribute(
    "href",
    "/work",
  );
  await expect(hero.getByRole("link", { name: "Book a call" })).toHaveAttribute(
    "href",
    /calendly\.com/,
  );
  await expect(hero.getByRole("link", { name: "Experience & Resume" })).toHaveAttribute(
    "href",
    "/about#experience",
  );
});

test("the bench shows three figures and recent Incentiva work", async ({ page }) => {
  await openHome(page);
  const bench = page.locator('[class*="bench_bench"]');
  const values = await bench.locator('[class*="bench_value"]').allInnerTexts();
  expect(values.sort()).toEqual(["2M+", "3,177", "338K+"].sort());
  await expect(bench).toContainText("organic views");
  await expect(bench).toContainText(
    "LifeMiles miles awarded through a chatbot I led at Incentiva Group",
  );
  await expect(bench).toContainText("automated tests");
  await expect(bench).not.toContainText("85%");
  await expect(bench.getByRole("img", { name: /Samsung × LifeMiles/ })).toBeAttached();
});

test("Experience & Resume in the header opens the experience, resume first", async ({ page }) => {
  await openHome(page);
  const key = page.locator("header").getByRole("link", { name: "Experience & Resume" });
  await expect(key).toHaveAttribute("href", "/about#experience");
  await key.click();
  await expect(page).toHaveURL(/\/about#experience$/);
  const section = page.locator("#experience");
  await expect(section).toBeInViewport({ timeout: 10_000 });
  const resume = section.getByRole("link", { name: /Download the resume/ });
  await expect(resume).toBeVisible();
  await expect(resume).toHaveAttribute("href", "/resume/Erick_Mahecha_Resume.pdf");
  // The resume comes before the first role.
  const [resumeTop, firstRole] = await Promise.all([
    resume.evaluate((el) => el.getBoundingClientRect().top),
    section
      .locator("details")
      .first()
      .evaluate((el) => el.getBoundingClientRect().top),
  ]);
  expect(resumeTop).toBeLessThan(firstRole);
});

test("the home features four cases, each with its category", async ({ page }) => {
  await openHome(page);
  const cards = page.locator("#work ul a");
  await expect(cards).toHaveCount(4);
  const expected = [
    ["Acquisition", "/work/directv-click-to-whatsapp"],
    ["Automation", "/work/samsung-lifemiles-whatsapp"],
    ["Product", "/work/scope-multi-client-platform"],
    ["Operations", "/work/chatflow-whatsapp-ai-platform"],
  ];
  for (const [i, [category, href]] of expected.entries()) {
    const card = cards.nth(i);
    await expect(card).toHaveAttribute("href", href);
    await expect(card.locator('[class*="projects_category"]')).toHaveText(category);
  }
  await expect(page.locator("#work")).not.toContainText("Quick Metal Shop");
});

test("every page title names the page and Erick", async ({ page }) => {
  const titles: [string, string][] = [
    ["/", `Erick Mahecha · ${ROLE}`],
    ["/about", "About · Erick Mahecha"],
    ["/work", "Projects · Erick Mahecha"],
    ["/blog", "Insights · Erick Mahecha"],
    ["/gallery", "Visual Work · Erick Mahecha"],
    ["/work/incentiva-group", "Incentiva Group · Erick Mahecha"],
    [
      "/blog/designing-a-multi-client-platform",
      "One Database per Client: Designing a Multi-Client Platform That Fails Closed · Erick Mahecha",
    ],
  ];
  for (const [path, title] of titles) {
    await page.goto(path);
    await expect(page, path).toHaveTitle(title);
  }
});

test("the blog lists four posts and each new post opens", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.locator("main h1")).toHaveText("Insights");
  await expect(page.locator("main article")).toHaveCount(4);
  for (const slug of [
    "designing-a-multi-client-platform",
    "operable-whatsapp-ai-assistants",
    "running-projects-with-ai-agents",
  ]) {
    await expect(page.locator(`main a[href="/blog/${slug}"]`)).toHaveCount(1);
    const response = await page.goto(`/blog/${slug}`);
    expect(response?.status(), slug).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    // The post's own date (the recent posts under it carry theirs).
    await expect(page.locator("main article time").first()).toHaveAttribute(
      "datetime",
      "2026-11-03",
    );
  }
});

test("the resume answers 200 and says both titles", async ({ request }) => {
  const response = await request.get("/resume/Erick_Mahecha_Resume.pdf");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  const text = pdfText(await response.body()).replace(/\s+/g, " ");
  expect(text).toContain(ROLE);
  expect(text).toContain("Operations Manager");
});

test.describe("keyboard", () => {
  test("the first key skips to the content, and nothing reorders the tab sequence", async ({
    page,
    browserName,
  }) => {
    // Safari's default skips links on Tab unless the user turns that on.
    test.skip(browserName === "webkit", "WebKit tabs to links only with Full Keyboard Access");
    for (const path of [
      "/",
      "/about",
      "/work",
      "/work/samsung-lifemiles-whatsapp",
      "/blog/designing-a-multi-client-platform",
    ]) {
      if (path === "/") await openHome(page);
      else await page.goto(path);
      expect(
        await page.locator('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])').count(),
        `${path}: no positive tabindex`,
      ).toBe(0);
      await page.keyboard.press("Tab");
      const skip = page.getByRole("link", { name: "Skip to content" });
      await expect(skip, path).toBeFocused();
      await expect(skip, path).toBeInViewport();
      // The next keys are focused one after another, each with a visible ring.
      for (let k = 0; k < 6; k++) {
        await page.keyboard.press("Tab");
        const ring = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return "none";
          const own = getComputedStyle(el);
          const after = getComputedStyle(el, "::after");
          const drawn =
            (own.outlineStyle !== "none" && Number.parseFloat(own.outlineWidth) > 0) ||
            own.boxShadow !== "none" ||
            (after.content !== "none" && after.content !== "normal");
          return drawn ? "ring" : `${el.tagName} ${el.className}`;
        });
        expect(ring, `${path}, key ${k + 2}`).toBe("ring");
      }
    }
  });
});

test.describe("axe", () => {
  test.use({ bypassCSP: true });
  const axePath = createRequire(__filename).resolve("axe-core/axe.min.js");

  for (const path of [
    "/",
    "/about",
    "/work",
    "/work/samsung-lifemiles-whatsapp",
    "/blog/designing-a-multi-client-platform",
  ]) {
    test(`no serious or critical violations on ${path}`, async ({ page }) => {
      test.setTimeout(60_000);
      if (path === "/") await openHome(page);
      else await page.goto(path);
      await page.waitForLoadState("load");
      await page.evaluate(readFileSync(axePath, "utf8"));
      const violations = await page.evaluate(async () => {
        // biome-ignore lint/suspicious/noExplicitAny: axe is injected at run time
        const axe = (window as any).axe;
        const result = await axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
        });
        return result.violations
          .filter((v: { impact: string }) => v.impact === "serious" || v.impact === "critical")
          .map(
            (v: { id: string; impact: string; nodes: { target: string[] }[] }) =>
              `${v.impact} ${v.id}: ${v.nodes
                .slice(0, 3)
                .map((n) => n.target.join(" "))
                .join(" | ")}`,
          );
      });
      expect(violations).toEqual([]);
    });
  }
});

test("nothing scrolls sideways at 360 px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  for (const path of [
    "/about",
    "/work",
    "/work/samsung-lifemiles-whatsapp",
    "/blog",
    "/blog/designing-a-multi-client-platform",
  ]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

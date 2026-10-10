import { expect, test } from "./fixtures";
import { introDone } from "./helpers";

const CALENDAR = "https://calendly.com/santiagomahecha2328/30min";
const QUESTIONS = [
  "What exactly do you do?",
  "Who do you work with?",
  "Do you work alone?",
  "Which tools do you use?",
  "How fast can you start showing results?",
  "Where are you based and what languages do you work in?",
  "What happens on the call?",
];

test("the closing sections follow the film in order", async ({ page }) => {
  await page.goto("/");
  const ids = await page
    .locator("[data-landing-section]")
    .evaluateAll((els) => els.map((el) => el.getAttribute("data-landing-section")));
  expect(ids).toEqual(["proof", "hiring", "faq", "final-cta"]);
});

test("the three most recent case studies with a result are shown, each with an image and a link", async ({
  page,
}) => {
  await page.goto("/");
  const cards = page.locator("[data-proof-card]");
  await expect(cards).toHaveCount(3);
  const hrefs = await cards
    .locator("a")
    .evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  expect(hrefs).toEqual([
    "/work/quick-metal-shop-viral-videos",
    "/work/ai-powered-ad-creatives",
    "/work/quick-metal-shop-arquiexpo",
  ]);
  for (const card of await cards.all()) {
    // Decorative: the card is one link whose name is already the project's title.
    await expect(card.locator("img")).toHaveCount(1);
    await expect(card.locator("img")).toHaveAttribute("alt", "");
    await expect(card.getByRole("link")).toHaveAccessibleName(/[A-Za-z]/);
  }
  await expect(
    page.locator('[data-landing-section="proof"]').getByRole("link", { name: "See all projects" }),
  ).toHaveAttribute("href", "/work");
});

test("every case study card shows its result and the cards line up", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const cards = page.locator("[data-proof-card]");
  await expect(cards.locator("[data-proof-metric]")).toHaveCount(3);
  const heights = await cards.evaluateAll((els) =>
    els.map((el) => Math.round(el.getBoundingClientRect().height)),
  );
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
});

test("the hiring block links to the resume and the about page", async ({ page }) => {
  await page.goto("/");
  const hiring = page.locator('[data-landing-section="hiring"]');
  await expect(hiring.getByRole("link", { name: "Download my resume" })).toHaveAttribute(
    "href",
    "/resume/Erick_Mahecha_Resume.pdf",
  );
  await expect(hiring.getByRole("link", { name: "More about me" })).toHaveAttribute(
    "href",
    "/about",
  );
});

test("the FAQ has seven questions and its answers open on click", async ({ page }) => {
  await page.goto("/");
  const faq = page.locator('[data-landing-section="faq"]');
  const questions = await faq.locator("summary").allTextContents();
  expect(questions.map((q) => q.trim())).toEqual(QUESTIONS);
  const first = faq.locator("details").first();
  await expect(first.locator("[data-faq-answer]")).toBeHidden();
  // After the intro and with the question already in place: a click aimed while the
  // page is still scroll-locked or gliding can land on a neighbouring question.
  await introDone(page);
  await first
    .locator("summary")
    .evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  await first.locator("summary").click();
  await expect(first.locator("[data-faq-answer]")).toBeVisible();
});

test("answers open with the keyboard", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "Safari only tabs to summaries with a system setting");
  await page.goto("/");
  const last = page.locator('[data-landing-section="faq"] details').last();
  await last.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(last.locator("[data-faq-answer]")).toBeVisible();
});

test("the FAQ schema carries the same questions as the page", async ({ page }) => {
  await page.goto("/");
  const schema = await page.evaluate(() => {
    for (const el of document.querySelectorAll('script[type="application/ld+json"]')) {
      const data = JSON.parse(el.textContent ?? "{}");
      if (data["@type"] === "FAQPage") return data;
    }
    return null;
  });
  expect(schema).not.toBeNull();
  expect(schema.mainEntity.map((item: { name: string }) => item.name)).toEqual(QUESTIONS);
  for (const item of schema.mainEntity) {
    expect(item.acceptedAnswer.text.length).toBeGreaterThan(20);
  }
});

test("the page ends with the same call to action as the hero", async ({ page }) => {
  await page.goto("/");
  const ctas = page.locator('[data-cta="primary"]');
  await expect(ctas).toHaveCount(2);
  const [top, bottom] = await ctas.evaluateAll((els) =>
    els.map((el) => ({ href: el.getAttribute("href"), text: el.textContent?.trim() })),
  );
  expect(top).toEqual({ href: CALENDAR, text: "Book a 30 minute call" });
  expect(bottom).toEqual(top);
  expect(
    await page.locator('[data-landing-section="final-cta"] [data-cta="primary"]').count(),
  ).toBe(1);
});

test("the closing sections are in the server HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  for (const text of ["Recent work", "Download my resume", "What happens on the call?"]) {
    expect(html).toContain(text);
  }
});

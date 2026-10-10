import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const CALENDAR = "https://calendly.com/santiagomahecha2328/30min";
const HEADLINE = "The marketing department is one person.";
const BYLINE = "Erick Mahecha. Growth marketing and AI automation, from Medellín.";
const SEATS = [
  {
    id: "brand",
    name: "Brand",
    text: "Quick Metal Shop had no brand manual. I wrote it in my first week, and the ArquiExpo 2026 stand was built from it.",
    href: "/work/quick-metal-shop-the-brand-comes-to-life",
    project: "Quick Metal Shop: The Brand Comes to Life",
  },
  {
    id: "content",
    name: "Content",
    text: "Three reels cut from before-and-after photos reached 338K+ organic views. Ad spend was $0.",
    href: "/work/quick-metal-shop-viral-videos",
    project: "Quick Metal Shop: Engineering Virality with AI",
  },
  {
    id: "paid-media",
    name: "Paid media",
    text: "A sales campaign made with AI video returned 3.92x ROAS. A second one brought 260 B2B leads at $3.45 each.",
    href: "/work/ai-powered-ad-creatives",
    project: "Quick Metal Shop & Dakoma Roofing: AI-Powered Ad Creatives",
  },
  {
    id: "crm",
    name: "CRM",
    text: "At Artesa, a WhatsApp assistant handles 85% of conversations. At ATV Riders, 200+ leads a day arrive sorted.",
    href: "/work/leadbot-ai",
    project: "LeadBot AI: WhatsApp Automation for Lead Qualification",
  },
  {
    id: "software",
    name: "Software",
    text: "For ArquiExpo I shipped a touchscreen app 48 hours after the idea.",
    href: "/work/quick-metal-shop-arquiexpo",
    project: "Quick Metal Shop: ArquiExpo 2026 Interactive Gallery Application",
  },
];
const SECTIONS = [
  { id: "proof", title: "Work" },
  { id: "hiring", title: "For hiring teams" },
  { id: "faq", title: "Questions" },
  { id: "final-cta", title: "Tell me where your funnel leaks." },
];
const QUESTIONS = [
  "What exactly do you do?",
  "Who do you work with?",
  "Do you work alone?",
  "Which tools do you use?",
  "How fast can you start showing results?",
  "Where are you based and what languages do you work in?",
  "What happens on the call?",
];

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  // The markup is what is under test. With scripting off the browser fetches every
  // lazy image at once, and `load` would wait for all of them to be optimised.
  const open = (page: Page) => page.goto("/", { waitUntil: "domcontentloaded" });

  test("the page reads top to bottom without JavaScript", async ({ page }) => {
    await open(page);
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(HEADLINE);
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCSS("opacity", "1");
    await expect(page.locator('[data-film-beat="hero"]').getByText(BYLINE)).toBeVisible();

    const seats = page.locator("[data-seat]");
    await expect(seats).toHaveCount(SEATS.length);
    for (const [i, seat] of SEATS.entries()) {
      const card = seats.nth(i);
      await expect(card).toHaveAttribute("data-seat", seat.id);
      await expect(card.locator("h2")).toHaveText(seat.name);
      await expect(card.locator("p")).toHaveText(seat.text);
      await expect(card.locator("h2")).toHaveCSS("opacity", "1");
    }

    const sections = page.locator("[data-landing-section]");
    await expect(sections).toHaveCount(SECTIONS.length);
    for (const [i, section] of SECTIONS.entries()) {
      await expect(sections.nth(i)).toHaveAttribute("data-landing-section", section.id);
      await expect(sections.nth(i).locator("h2")).toHaveText(section.title);
    }
    // The hero comes before the first seat, and the closing sections after the film.
    const seatsAfterHero = page.locator('[data-film-beat="hero"]:has(h1) ~ [data-seat="brand"]');
    const closingAfterFilm = page.locator(
      '[data-film-root]:has([data-seat]) ~ * [data-landing-section="proof"]',
    );
    await expect(seatsAfterHero).toHaveCount(1);
    await expect(closingAfterFilm).toHaveCount(1);
  });

  test("the FAQ opens without JavaScript", async ({ page }) => {
    await open(page);
    const first = page.locator('[data-landing-section="faq"] details').first();
    await expect(first.locator("[data-faq-answer]")).toBeHidden();
    await first.locator("summary").click();
    await expect(first.locator("[data-faq-answer]")).toBeVisible();
  });
});

test("the hero is there on the first frame", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const hero = page.locator('[data-film-beat="hero"]');
  await expect(hero.locator("h1")).toHaveCount(1);
  // Nothing in the hero is animated in: no entrance, no reveal, no intro to wait for.
  const moving = await hero.evaluate((el) =>
    el.getAnimations({ subtree: true }).map((animation) => {
      const target = (animation.effect as KeyframeEffect | null)?.target;
      return target ? target.tagName : "unknown";
    }),
  );
  expect(moving).toEqual([]);
  await page.waitForTimeout(100);
  // One reading, no retries: the headline must already be on screen and uncovered.
  const h1 = await hero.locator("h1").evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    let opacity = 1;
    for (let node: Element | null = el; node; node = node.parentElement) {
      opacity *= Number(getComputedStyle(node).opacity);
    }
    return {
      inView: rect.top >= 0 && rect.bottom <= window.innerHeight && rect.height > 0,
      uncovered: top !== null && el.contains(top),
      opacity,
      visibility: getComputedStyle(el).visibility,
    };
  });
  expect(h1).toEqual({ inView: true, uncovered: true, opacity: 1, visibility: "visible" });
});

test("the h1 and the call link are in the server HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain(`>${HEADLINE}</h1>`);
  expect(html).toContain(CALENDAR);
});

test("each seat links to its case study by name", async ({ page }) => {
  await page.goto("/");
  for (const seat of SEATS) {
    const link = page.locator(`[data-seat="${seat.id}"]`).getByRole("link");
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute("href", seat.href);
    await expect(link).toHaveText("Read the case study");
    await expect(link).toHaveAccessibleName(`Read the case study: ${seat.project}`);
  }
});

test("the clean stretches of film are hidden from assistive technology", async ({ page }) => {
  await page.goto("/");
  const stretches = page.locator("[data-seat] + [data-film-beat]");
  await expect(stretches).toHaveCount(SEATS.length);
  for (const stretch of await stretches.all()) {
    await expect(stretch).toHaveAttribute("aria-hidden", "true");
    await expect(stretch).toBeEmpty();
  }
});

test("nothing on the Home is glass, gradient text or a blur", async ({ page }) => {
  await page.goto("/");
  const scan = () =>
    page.evaluate(() => {
      const found: string[] = [];
      const name = (el: Element) => `${el.tagName.toLowerCase()}.${el.getAttribute("class") ?? ""}`;
      let scanned = 0;
      for (const el of Array.from(document.querySelectorAll("body *"))) {
        // The nav may blur what is behind it; the chatbot is out of this pass.
        if (el.closest('header, [data-header-fade], [class*="FaqChatbot"]')) continue;
        scanned += 1;
        const style = getComputedStyle(el) as CSSStyleDeclaration & {
          webkitBackdropFilter?: string;
          webkitBackgroundClip?: string;
        };
        const backdrop = style.backdropFilter || style.webkitBackdropFilter || "none";
        if (backdrop !== "none") found.push(`backdrop-filter: ${name(el)}`);
        const clip = `${style.backgroundClip} ${style.webkitBackgroundClip ?? ""}`;
        if (clip.includes("text")) found.push(`background-clip text: ${name(el)}`);
      }
      for (const animation of document.getAnimations()) {
        const effect = animation.effect as KeyframeEffect | null;
        const frames = effect?.getKeyframes() ?? [];
        if (frames.some((frame) => "filter" in frame || "backdropFilter" in frame)) {
          found.push(`animated filter: ${effect?.target ? name(effect.target) : "unknown"}`);
        }
      }
      return { found, scanned };
    });
  const top = await scan();
  expect(top.scanned).toBeGreaterThan(50);
  expect(top.found).toEqual([]);
  // Again on a title card and at the end of the page, where anything that
  // animates on arrival would be running.
  for (const selector of ['[data-seat="content"]', '[data-landing-section="final-cta"]']) {
    await page.locator(selector).evaluate((el) => el.scrollIntoView({ behavior: "instant" }));
    expect((await scan()).found, selector).toEqual([]);
  }
});

test("Work shows the six most recent public projects", async ({ page }) => {
  await page.goto("/");
  const work = page.locator('[data-landing-section="proof"]');
  const items = work.locator("[data-work-item]");
  await expect(items).toHaveCount(6);
  const hrefs = await items
    .locator("a")
    .evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  expect(hrefs).toEqual([
    "/work/quick-metal-shop-viral-videos",
    "/work/ai-powered-ad-creatives",
    "/work/quick-metal-shop-the-brand-comes-to-life",
    "/work/quick-metal-shop-arquiexpo",
    "/work/quick-metal-shop-marketing",
    "/work/dakoma-roofing",
  ]);
  for (const item of await items.all()) {
    // Decorative: the item is one link whose name already carries the project's title.
    await expect(item.locator("img")).toHaveCount(1);
    await expect(item.locator("img")).toHaveAttribute("alt", "");
    await expect(item.getByRole("link")).toHaveAccessibleName(/[A-Za-z]/);
  }
  // A result where the project has one, and nothing made up where it does not.
  await expect(items.nth(0)).toContainText("338K+ organic views");
  await expect(items.nth(1)).toContainText("3.92x ROAS");
  await expect(items.nth(2).getByRole("link")).toHaveAccessibleName(
    "Quick Metal Shop: The Brand Comes to Life",
  );
  await expect(work.getByRole("link", { name: "See all projects" })).toHaveAttribute(
    "href",
    "/work",
  );
});

test("the hiring block links to the resume and the about page", async ({ page }) => {
  await page.goto("/");
  const hiring = page.locator('[data-landing-section="hiring"]');
  await expect(hiring).toContainText(
    "I lead growth and operations at Incentiva Group. Before that I was the first marketing hire at Quick Metal Shop.",
  );
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
  for (const cta of await ctas.all()) {
    await expect(cta).toHaveText("Book a 30 minute call");
    await expect(cta).toHaveAttribute("href", CALENDAR);
  }
  expect(await page.locator('[data-film-beat="hero"] [data-cta="primary"]').count()).toBe(1);
  const final = page.locator('[data-landing-section="final-cta"]');
  expect(await final.locator('[data-cta="primary"]').count()).toBe(1);
  await expect(final).toContainText("In 30 minutes I'll tell you what I would automate first.");
});

test("every target on the Home is large enough on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const targets = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".main-content-wrapper :is(a, button, summary)"))
      // Something that is not rendered at all cannot be pressed.
      .filter((el) => el.getClientRects().length > 0)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          name: `${el.tagName.toLowerCase()} "${(el.textContent ?? "").trim().slice(0, 40)}"`,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      }),
  );
  // Two buttons, five case study links, six projects, three text links, seven questions.
  expect(targets.length).toBeGreaterThanOrEqual(23);
  expect(targets.filter((target) => target.width < 44 || target.height < 44)).toEqual([]);
});

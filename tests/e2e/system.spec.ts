import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { ROUTES } from "./helpers";

// The one set of tokens the whole site draws from. Later tasks add cases here.

/** One case study per kind of body: embeds and stats, links in running text, a code block. */
const CASE_STUDIES = [
  "/work/quick-metal-shop-viral-videos",
  "/work/ai-powered-ad-creatives",
  "/work/atv-riders",
] as const;

const forceTheme = async (page: import("@playwright/test").Page, theme: "light" | "dark") => {
  await page.addInitScript((t) => localStorage.setItem("data-theme", t), theme);
  await page.emulateMedia({ colorScheme: theme });
};

const tokens = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      weak: cs.getPropertyValue("--neutral-on-background-weak").trim().toLowerCase(),
      strong: cs.getPropertyValue("--neutral-on-background-strong").trim().toLowerCase(),
      surface: cs.getPropertyValue("--surface-background").trim().toLowerCase(),
      bg: getComputedStyle(document.body).backgroundColor,
    };
  });

test("light theme resolves the shared colour tokens", async ({ page }) => {
  await forceTheme(page, "light");
  await page.goto("/about");
  expect(await tokens(page)).toEqual({
    weak: "#4b5058",
    strong: "#0b0c0e",
    surface: "#ffffff",
    bg: "rgb(244, 245, 247)",
  });
});

test("dark theme resolves the shared colour tokens", async ({ page }) => {
  await forceTheme(page, "dark");
  await page.goto("/about");
  expect(await tokens(page)).toEqual({
    weak: "#a8adb5",
    strong: "#f4f5f7",
    surface: "#141416",
    bg: "rgb(0, 0, 0)",
  });
});

for (const route of ROUTES) {
  test(`${route.name}: no dot grid and no cursor glow`, async ({ page }) => {
    await page.goto(route.path);
    await expect(page.locator("[data-spotlight]")).toHaveCount(0);
    await expect(page.locator("[data-spotlight-target]")).toHaveCount(0);
    const dots = await page.evaluate(
      () => getComputedStyle(document.body, "::before").backgroundImage,
    );
    expect(dots).toBe("none");
  });
}

test("phones keep a 16px root", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/about");
  const size = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
  expect(size).toBe("16px");
  await context.close();
});

test("no visible text on /about is lighter than 400", async ({ page }) => {
  await page.goto("/about");
  const light = await page.evaluate(() => {
    const out: string[] = [];
    for (const el of Array.from(document.body.querySelectorAll("*"))) {
      if (el.closest('[class*="FaqChatbot"]')) continue;
      const own = Array.from(el.childNodes).some(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim() !== "",
      );
      if (!own) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      if (Number(cs.fontWeight) < 400) out.push(`${el.tagName}.${el.className}: ${cs.fontWeight}`);
    }
    return out;
  });
  expect(light).toEqual([]);
});

test("Once UI surfaces no longer blur what is behind them", async ({ page }) => {
  await page.goto("/about");
  const value = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--backdrop-filter").trim(),
  );
  expect(["", "none"]).toContain(value);
});

// The related projects under a case study are the same cards as the list's.
const MOTION_ROUTES = [...ROUTES, { name: "case study", path: CASE_STUDIES[0] }];

for (const route of MOTION_ROUTES) {
  test(`${route.name}: no entrance-animation machinery is left`, async ({ page }) => {
    await page.goto(route.path);
    // A page that failed to render has no animations either.
    await expect(page.locator("h1").first()).toBeVisible();
    const state = await page.evaluate(async () => {
      // Only transform and opacity may move; an animation on filter is a regression.
      // Watched for a while, not read once: one that starts after hydration counts too.
      const filtered = new Set<string>();
      const until = performance.now() + 1500;
      while (performance.now() < until) {
        for (const animation of document.getAnimations()) {
          const effect = animation.effect as KeyframeEffect | null;
          if (!effect?.getKeyframes().some((k) => "filter" in k && k.filter !== "none")) continue;
          const target = effect.target;
          filtered.add(target ? `${target.tagName.toLowerCase()}.${target.className}` : "?");
        }
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      return {
        classes: [...document.documentElement.classList],
        nodes: document.querySelectorAll("[data-reveal], [data-mo-io], [data-kinetic-words]")
          .length,
        filtered: [...filtered],
      };
    });
    expect(state.classes).not.toContain("mo-io");
    expect(state.classes).not.toContain("mo-ready");
    expect(state.nodes).toBe(0);
    expect(state.filtered).toEqual([]);
  });
}

const footerLinks = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("footer a"))
      .filter((a) => !a.closest('[class*="FaqChatbot"]'))
      .map((a) => {
        const r = a.getBoundingClientRect();
        const cs = getComputedStyle(a);
        const parent = getComputedStyle(a.parentElement as Element);
        return {
          text: (a.textContent ?? "").trim() || a.getAttribute("aria-label") || "",
          w: r.width,
          h: r.height,
          colour: cs.color,
          sameColour: cs.color === parent.color,
          underlined: cs.textDecorationLine.includes("underline"),
          isText: (a.textContent ?? "").trim() !== "",
        };
      }),
  );

for (const [width, min] of [
  [390, 44],
  [1440, 28],
] as const) {
  test(`footer links are at least ${min}x${min} at ${width}px`, async ({ page }) => {
    // The page fixture, not a fresh context, so WebKit still gets its CSP workaround.
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/about");
    const links = await footerLinks(page);
    expect(links.length).toBeGreaterThan(2);
    expect(links.filter((l) => l.w < min - 0.5 || l.h < min - 0.5)).toEqual([]);
  });
}

test("footer keeps its attribution, linked, in the text colour and underlined", async ({
  page,
}) => {
  await page.goto("/about");
  const footer = page.locator("footer");
  await expect(footer).toContainText("Once UI");
  await expect(footer).toContainText("CC BY-NC 4.0");
  await expect(footer.getByRole("link", { name: "Once UI" })).toBeVisible();
  await expect(footer.getByRole("link", { name: /CC BY-NC 4\.0/ })).toBeVisible();
  const links = await footerLinks(page);
  const text = links.filter((l) => l.isText);
  // Text links wear the colour of their sentence; the icon buttons are neutral, never cobalt.
  expect(text.filter((l) => !l.sameColour).map((l) => l.text)).toEqual([]);
  expect(links.filter((l) => l.colour === "rgb(45, 91, 255)")).toEqual([]);
  expect(text.length).toBeGreaterThanOrEqual(2);
  expect(text.filter((l) => !l.underlined).map((l) => l.text)).toEqual([]);
});

// ─── The page system ────────────────────────────────────────────────────────
// What a page outside the Home holds to, whatever it shows: one family, nothing
// tiny, no glass, targets a thumb can hit, no half-shown control and no cobalt
// in text. `followsThePageSystem` is the whole check for one route at one
// width; a page joins by being added to SYSTEM_PAGES.

interface Viewport {
  width: number;
  height: number;
  /** Smallest side of a link or button: 44px up to 768px wide, 28px above. */
  minTarget: number;
}

const PHONE: Viewport = { width: 390, height: 844, minTarget: 44 };
const DESKTOP: Viewport = { width: 1440, height: 900, minTarget: 28 };

/** `--scheme-brand-100` to `-1200` (custom.css), written the way a computed colour reads. */
const BRAND_SCALE = [
  "#0a0e1f",
  "#0d1431",
  "#172b74",
  "#1e3a9e",
  "#2549cb",
  "#2d5bff",
  "#6688ff",
  "#a6baff",
  "#c1cfff",
  "#dbe3ff",
  "#e7edff",
  "#f3f6ff",
].map((hex) => {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
});

/**
 * Waits until the page is the one a visitor ends up looking at: rendered,
 * hydrated (React tags the nodes it has claimed), fonts in, and the controls
 * that only exist after an effect (the stats arrows) either there or not.
 */
async function settled(page: Page) {
  await expect(page.locator("h1").first()).toBeVisible();
  await page.waitForFunction(() => {
    const h1 = document.querySelector("h1");
    return h1 !== null && Object.keys(h1).some((key) => key.startsWith("__reactFiber$"));
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    const controls = () =>
      Array.from(document.querySelectorAll("a, button")).filter((el) => el.checkVisibility())
        .length;
    let last = -1;
    for (let same = 0; same < 6; ) {
      await frame();
      const now = controls();
      same = now === last ? same + 1 : 0;
      last = now;
    }
  });
}

/** One pass over the rendered page; each list names the elements that break a rule. */
const measureSystem = (page: Page, minTarget: number) =>
  page.evaluate(
    ({ minTarget, brand }) => {
      const CHATBOT = '[class*="FaqChatbot"]';
      const name = (el: Element) => {
        const text = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 32);
        const classes = (el.getAttribute("class") ?? "").slice(0, 48);
        return `${el.tagName.toLowerCase()}.${classes} "${text || el.getAttribute("aria-label") || ""}"`;
      };
      // Painted: in the layout, not `visibility: hidden`, with a box. Opacity is
      // left out on purpose, so a control faded to nothing still counts as there.
      const painted = (el: Element) => {
        if (el.closest(CHATBOT)) return false;
        if (!el.checkVisibility({ visibilityProperty: true })) return false;
        const box = el.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      };
      const ownText = (el: Element) =>
        Array.from(el.childNodes).some(
          (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim() !== "",
        );
      const opacity = (el: Element) => {
        let value = 1;
        for (let node: Element | null = el; node; node = node.parentElement) {
          value *= Number(getComputedStyle(node).opacity);
        }
        return value;
      };

      const offFamily: string[] = [];
      const small: string[] = [];
      const glass: string[] = [];
      const clipped: string[] = [];
      const brandText: string[] = [];
      let texts = 0;
      for (const el of Array.from(document.body.querySelectorAll("*"))) {
        if (el.closest("svg") || !painted(el)) continue;
        const cs = getComputedStyle(el);
        if (!el.closest("header, [data-header-fade]")) {
          const blur =
            cs.getPropertyValue("backdrop-filter") ||
            cs.getPropertyValue("-webkit-backdrop-filter") ||
            "none";
          if (blur !== "none") glass.push(`${name(el)} ${blur}`);
        }
        const clip =
          cs.getPropertyValue("background-clip") || cs.getPropertyValue("-webkit-background-clip");
        if (clip === "text") clipped.push(name(el));
        if (!ownText(el)) continue;
        texts += 1;
        const family = cs.fontFamily
          .split(",")[0]
          .trim()
          .replace(/^["']|["']$/g, "");
        const expected = el.closest("pre, code") ? "Geist Mono" : "Geist";
        if (family !== expected) offFamily.push(`${family} (not ${expected}) ${name(el)}`);
        if (Number.parseFloat(cs.fontSize) < 13) small.push(`${cs.fontSize} ${name(el)}`);
        if (el.closest(".main-content-wrapper") && brand.includes(cs.color)) {
          brandText.push(`${cs.color} ${name(el)}`);
        }
      }

      const undersized: string[] = [];
      const brandLinks: string[] = [];
      let targets = 0;
      let links = 0;
      for (const el of Array.from(
        document.querySelectorAll(".main-content-wrapper a, .main-content-wrapper button"),
      )) {
        if (!painted(el)) continue;
        targets += 1;
        const box = el.getBoundingClientRect();
        if (box.width < minTarget - 0.5 || box.height < minTarget - 0.5) {
          undersized.push(`${Math.round(box.width)}x${Math.round(box.height)} ${name(el)}`);
        }
        if (el.tagName !== "A") continue;
        links += 1;
        const colour = getComputedStyle(el).color;
        if (brand.includes(colour)) brandLinks.push(`${colour} ${name(el)}`);
      }

      const faded: string[] = [];
      let buttons = 0;
      for (const el of Array.from(document.querySelectorAll("button"))) {
        if (!painted(el)) continue;
        buttons += 1;
        const value = opacity(el);
        if (value < 1) faded.push(`${value} ${name(el)}`);
      }

      return {
        counts: { texts, targets, links, buttons },
        offFamily,
        small,
        glass,
        clipped,
        undersized,
        faded,
        brandLinks,
        brandText,
      };
    },
    { minTarget, brand: BRAND_SCALE },
  );

function followsThePageSystem(path: string, viewport: Viewport) {
  test(`${path} follows the page system at ${viewport.width}px`, async ({ page }) => {
    // The page fixture, not a fresh context, so WebKit still gets its CSP workaround.
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(path);
    await settled(page);
    const found = await measureSystem(page, viewport.minTarget);

    // A scan that found nothing to measure proves nothing.
    expect(found.counts.texts).toBeGreaterThan(10);
    expect(found.counts.targets).toBeGreaterThan(0);
    expect(found.counts.links).toBeGreaterThan(0);
    expect(found.counts.buttons).toBeGreaterThan(0);

    expect.soft(found.offFamily, "text is Geist; Geist Mono only in pre and code").toEqual([]);
    expect.soft(found.small, "no text under 13px").toEqual([]);
    expect.soft(found.glass, "no backdrop-filter outside the nav").toEqual([]);
    expect.soft(found.clipped, "no background-clip: text").toEqual([]);
    expect
      .soft(found.undersized, `links and buttons are at least ${viewport.minTarget}px a side`)
      .toEqual([]);
    expect.soft(found.faded, "no button is shown faded").toEqual([]);
    expect.soft(found.brandLinks, "no link in a brand colour").toEqual([]);
    expect.soft(found.brandText, "no text in a brand colour").toEqual([]);
  });
}

const SYSTEM_PAGES = ["/work", ...CASE_STUDIES];

for (const path of SYSTEM_PAGES) {
  for (const viewport of [PHONE, DESKTOP]) followsThePageSystem(path, viewport);
}

// ─── Work and the case studies ──────────────────────────────────────────────

/** The text colours and the raised surface of the theme in force, as computed colours read them. */
const themeColours = (page: Page) =>
  page.evaluate(() => {
    const probe = document.createElement("span");
    document.body.append(probe);
    const read = (token: string) => {
      probe.style.color = `var(${token})`;
      return getComputedStyle(probe).color;
    };
    const colours = {
      strong: read("--neutral-on-background-strong"),
      weak: read("--neutral-on-background-weak"),
      surface: read("--surface-background"),
    };
    probe.remove();
    return colours;
  });

for (const path of ["/work", CASE_STUDIES[0], CASE_STUDIES[1]]) {
  test(`${path}: text links wear a content colour and an underline`, async ({ page }) => {
    await page.goto(path);
    await settled(page);
    const colours = await themeColours(page);
    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".main-content-wrapper a"))
        .filter((a) => !a.closest('[class*="FaqChatbot"]') && a.checkVisibility())
        .filter((a) => (a.textContent ?? "").trim() !== "")
        .map((a) => {
          const cs = getComputedStyle(a);
          return {
            text: (a.textContent ?? "").trim(),
            colour: cs.color,
            underlined: cs.textDecorationLine.includes("underline"),
            // Once UI greys the underline of every link; it has to match the words.
            line: cs.textDecorationColor,
          };
        }),
    );
    expect(links.length).toBeGreaterThan(2);
    const allowed = [colours.strong, colours.weak];
    expect(links.filter((l) => !allowed.includes(l.colour)).map((l) => l.text)).toEqual([]);
    expect(links.filter((l) => !l.underlined).map((l) => l.text)).toEqual([]);
    expect(links.filter((l) => l.line !== l.colour).map((l) => l.text)).toEqual([]);
  });
}

for (const path of SYSTEM_PAGES) {
  test(`${path}: no visible text is set outside 400, 500 and 600`, async ({ page }) => {
    await page.goto(path);
    await settled(page);
    const weights = await page.evaluate(() => {
      const off: string[] = [];
      let texts = 0;
      for (const el of Array.from(document.querySelectorAll(".main-content-wrapper *"))) {
        if (el.closest('[class*="FaqChatbot"], svg') || !el.checkVisibility()) continue;
        const own = Array.from(el.childNodes).some(
          (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim() !== "",
        );
        if (!own) continue;
        texts += 1;
        const weight = getComputedStyle(el).fontWeight;
        if (!["400", "500", "600"].includes(weight)) {
          const text = (el.textContent ?? "").trim().slice(0, 32);
          off.push(`${weight} ${el.tagName.toLowerCase()} "${text}"`);
        }
      }
      return { texts, off };
    });
    expect(weights.texts).toBeGreaterThan(10);
    expect(weights.off).toEqual([]);
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`results stats sit on the shared tokens in the ${theme} theme`, async ({ page }) => {
    await forceTheme(page, theme);
    await page.goto(CASE_STUDIES[0]);
    await settled(page);
    const colours = await themeColours(page);
    const stats = await page.evaluate(() => {
      const styles = (selector: string) =>
        Array.from(document.querySelectorAll(selector)).map((el) => {
          const cs = getComputedStyle(el);
          return {
            colour: cs.color,
            background: cs.backgroundColor,
            weight: cs.fontWeight,
            size: Number.parseFloat(cs.fontSize),
          };
        });
      return {
        surfaces: styles('[class*="ResultsStats_carouselWrapper"]'),
        values: styles('[class*="ResultsStats_value"]'),
        labels: styles('[class*="ResultsStats_label"]'),
      };
    });
    expect(stats.surfaces.length).toBeGreaterThan(0);
    expect(stats.values.length).toBeGreaterThan(3);
    expect(stats.labels.length).toBe(stats.values.length);
    expect(colours.surface).toBe(theme === "light" ? "rgb(255, 255, 255)" : "rgb(20, 20, 22)");
    expect(stats.surfaces.filter((s) => s.background !== colours.surface)).toEqual([]);
    expect(stats.values.filter((v) => v.colour !== colours.strong || v.weight !== "600")).toEqual(
      [],
    );
    expect(stats.labels.filter((l) => l.colour !== colours.weak || l.size < 13)).toEqual([]);
  });
}

test("a stats arrow is there only while there is somewhere to scroll to", async ({ page }) => {
  await page.setViewportSize({ width: PHONE.width, height: PHONE.height });
  await page.goto(CASE_STUDIES[0]);
  // The first block of results is wider than a phone, so it starts at its left end.
  const block = page.locator('[class*="ResultsStats_carouselWrapper"]').first();
  const back = block.getByRole("button", { name: "Scroll left" });
  const forward = block.getByRole("button", { name: "Scroll right" });
  await expect(forward).toBeVisible();
  await expect(back).toBeHidden();
  const box = await forward.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(PHONE.minTarget);
  expect(box?.height).toBeGreaterThanOrEqual(PHONE.minTarget);

  await block.locator('[class*="ResultsStats_track"]').evaluate((track) => {
    track.scrollTo({ left: track.scrollWidth, behavior: "instant" });
  });
  await expect(back).toBeVisible();
  await expect(forward).toBeHidden();
});

test("the project list shows every project with its pictures and a way in", async ({ page }) => {
  await page.goto("/work");
  await settled(page);
  const cards = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".main-content-wrapper article")).map((card) => ({
      title: card.querySelector("h2")?.textContent ?? "",
      pictures: card.querySelectorAll("[data-project-media] img").length,
      // Nothing on the list plays: a project's clips stay in its case study.
      clips: card.querySelectorAll("video").length,
      links: Array.from(card.querySelectorAll("a")).map((a) => a.getAttribute("href")),
    })),
  );
  expect(cards.length).toBeGreaterThan(5);
  expect(cards.filter((c) => c.title.trim() === "").length).toBe(0);
  expect(cards.filter((c) => c.pictures === 0).map((c) => c.title)).toEqual([]);
  expect(cards.filter((c) => c.clips > 0).map((c) => c.title)).toEqual([]);
  expect(
    cards.filter((c) => !c.links.some((href) => href?.startsWith("/work/"))).map((c) => c.title),
  ).toEqual([]);
});

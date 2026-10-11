import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { ROUTES, caseStudies } from "./helpers";

// The one set of tokens the whole site draws from. Later tasks add cases here.

/**
 * One case study per kind of page: embeds and stats, links in running text, a
 * code block and a clip after the body, a clip for a hero.
 */
const CASE_STUDIES = [
  "/work/quick-metal-shop-viral-videos",
  "/work/ai-powered-ad-creatives",
  "/work/atv-riders",
  "/work/leadbot-ai",
] as const;

/**
 * Case studies whose body holds pictures written as plain `<img>` tags, and how
 * many: they skip the component every other picture goes through, so the page's
 * own stylesheet has to give them their corner and keep them inside the column.
 */
const RAW_PICTURES: Record<string, number> = {
  "/work/dakoma-roofing": 1,
  "/work/quick-metal-shop-arquiexpo": 2,
  "/work/quick-metal-shop-marketing": 2,
};

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
    // A page that failed to render has no dot grid either.
    await expect(page.locator("h1").first()).toBeVisible();
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

      // A colour of the brand scale, whatever its alpha (the scale has 15%, 30% and 50% steps).
      const isBrand = (colour: string) => {
        const parts = colour.match(/^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/);
        if (!parts || Number(parts[4] ?? 1) === 0) return false;
        return brand.includes(`rgb(${parts[1]}, ${parts[2]}, ${parts[3]})`);
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
        // The site's own header and its fades: any other <header> (a dialog's
        // title bar is one) holds to the rule like the rest of the page.
        if (!el.closest("header:has([data-header-side]), [data-header-fade]")) {
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

      // Cobalt means the call to action and the film's progress, so nothing else in
      // the page is filled, outlined or drawn in the brand scale. A border or an
      // outline counts only where one is drawn: its colour is set even at 0px.
      // The one thing left out besides them is the logo, which the redesign keeps as
      // it is: its node is Cobalt wherever the mark is drawn.
      const COBALT = '[data-cta], [class*="_cta__"], [data-film-progress], [data-brand-mark]';
      const brandPaint: string[] = [];
      let paints = 0;
      for (const el of Array.from(document.querySelectorAll(".main-content-wrapper *"))) {
        if (!painted(el) || el.closest(COBALT)) continue;
        paints += 1;
        const cs = getComputedStyle(el);
        const drawn = (width: string, style: string) =>
          cs.getPropertyValue(style) !== "none" &&
          Number.parseFloat(cs.getPropertyValue(width)) > 0;
        const found: string[] = [];
        if (isBrand(cs.backgroundColor)) found.push(`background ${cs.backgroundColor}`);
        for (const side of ["top", "right", "bottom", "left"]) {
          const colour = cs.getPropertyValue(`border-${side}-color`);
          if (drawn(`border-${side}-width`, `border-${side}-style`) && isBrand(colour)) {
            found.push(`border-${side} ${colour}`);
          }
        }
        if (drawn("outline-width", "outline-style") && isBrand(cs.outlineColor)) {
          found.push(`outline ${cs.outlineColor}`);
        }
        if (el instanceof SVGElement) {
          if (isBrand(cs.fill)) found.push(`fill ${cs.fill}`);
          if (isBrand(cs.stroke)) found.push(`stroke ${cs.stroke}`);
        }
        if (found.length > 0) brandPaint.push(`${found.join(", ")} ${name(el)}`);
      }

      // A link that leaves the site opens in a tab of its own and hands this one no
      // opener. Once UI writes `rel="noreferrer"`, which implies `noopener`.
      const sameTab: string[] = [];
      let external = 0;
      for (const a of Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="http"]'))) {
        if (a.closest(CHATBOT) || new URL(a.href).host === location.host) continue;
        if (a.closest(".main-content-wrapper")) external += 1;
        const rel = (a.getAttribute("rel") ?? "").split(/\s+/);
        const apart = rel.includes("noopener") || rel.includes("noreferrer");
        if (a.target !== "_blank" || !apart) {
          sameTab.push(`target="${a.target}" rel="${rel.join(" ")}" ${a.href.slice(0, 60)}`);
        }
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
        counts: { texts, targets, links, buttons, external, paints },
        offFamily,
        small,
        glass,
        clipped,
        undersized,
        faded,
        brandLinks,
        brandText,
        brandPaint,
        sameTab,
      };
    },
    { minTarget, brand: BRAND_SCALE },
  );

/** The least a page has to show for the scan to count as having looked at it. */
interface Minimums {
  texts: number;
  targets: number;
  links: number;
  buttons: number;
  /** Links in the body of the page that leave the site; most pages have none. */
  external?: number;
}

const FULL_PAGE: Minimums = { texts: 10, targets: 1, links: 1, buttons: 1 };

function followsThePageSystem(path: string, viewport: Viewport, minimum: Minimums = FULL_PAGE) {
  test(`${path} follows the page system at ${viewport.width}px`, async ({ page }) => {
    // The page fixture, not a fresh context, so WebKit still gets its CSP workaround.
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(path);
    await settled(page);
    const found = await measureSystem(page, viewport.minTarget);

    // A scan that found nothing to measure proves nothing.
    expect(found.counts.texts).toBeGreaterThanOrEqual(minimum.texts);
    expect(found.counts.targets).toBeGreaterThanOrEqual(minimum.targets);
    expect(found.counts.links).toBeGreaterThanOrEqual(minimum.links);
    expect(found.counts.buttons).toBeGreaterThanOrEqual(minimum.buttons);
    expect(found.counts.external).toBeGreaterThanOrEqual(minimum.external ?? 0);
    expect(found.counts.paints).toBeGreaterThan(0);

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
    expect
      .soft(found.brandPaint, "no fill, border, outline or drawing in a brand colour")
      .toEqual([]);
    expect.soft(found.sameTab, "a link that leaves the site opens in a new tab").toEqual([]);
  });
}

/** Every case study the site has, not a sample of them: any one can break a rule on its own. */
const ALL_CASE_STUDIES = caseStudies().map((study) => study.path);

test("the page system is checked on every case study", () => {
  // The scans below are generated from this list, so an empty one would pass by having no tests.
  expect(ALL_CASE_STUDIES.length).toBeGreaterThanOrEqual(9);
  for (const path of [...CASE_STUDIES, ...Object.keys(RAW_PICTURES)]) {
    expect(ALL_CASE_STUDIES).toContain(path);
  }
});

const SYSTEM_PAGES = ["/work", ...ALL_CASE_STUDIES, "/about", "/blog/my-workspace"];

// Pages that hold a heading, a line or a card and a control, and little else.
const SHORT_PAGES = ["/blog", "/this-page-does-not-exist", "/unauthorized"];

/**
 * Pages whose body links out, and the fewest such links the scan has to have
 * seen there: the booking link and two profiles, and two networks to share on.
 */
const LINKS_OUT: Record<string, number> = { "/about": 3, "/blog/my-workspace": 2 };

for (const path of SYSTEM_PAGES) {
  for (const viewport of [PHONE, DESKTOP]) {
    followsThePageSystem(path, viewport, { ...FULL_PAGE, external: LINKS_OUT[path] ?? 0 });
  }
}

// The Home has its own type scale and its own tests; what it shares with the
// other pages is where the brand colour may go. The call to action and the
// film's progress bar are the two places, and the scan leaves both out.
test("/: only the call to action and the progress bar wear the brand colour", async ({ page }) => {
  await page.goto("/");
  await settled(page);
  await expect(page.locator('.main-content-wrapper [data-cta="primary"]')).toHaveCount(2);
  await expect(page.locator("[data-film-progress]")).toHaveCount(1);
  const found = await measureSystem(page, DESKTOP.minTarget);
  expect(found.counts.paints).toBeGreaterThan(50);
  expect(found.brandPaint).toEqual([]);
  expect(found.brandText).toEqual([]);
  expect(found.sameTab).toEqual([]);
});

// The blog has one post to list: a card, and little else.
for (const viewport of [PHONE, DESKTOP]) {
  followsThePageSystem("/blog", viewport, { ...FULL_PAGE, texts: 8 });
}

// The gallery is pictures and clips behind buttons (every cell is one, and counted
// below): no link in its body.
for (const viewport of [PHONE, DESKTOP]) {
  followsThePageSystem("/gallery", viewport, { ...FULL_PAGE, links: 0 });
}

// A missing page and the password screen are short on purpose, and the screen
// has no link in its body: the form is the one control. They still have to show
// enough text and a control for the scan to have looked at something.
for (const viewport of [PHONE, DESKTOP]) {
  followsThePageSystem("/this-page-does-not-exist", viewport, {
    texts: 5,
    targets: 1,
    links: 1,
    buttons: 0,
  });
  followsThePageSystem("/unauthorized", viewport, {
    texts: 5,
    targets: 1,
    links: 0,
    buttons: 1,
  });
}

// ─── One main landmark ──────────────────────────────────────────────────────
// A screen reader jumps to it, so it holds the page and nothing of the site
// around it: not the header, the footer or the chatbot.

for (const path of [...ROUTES.map((route) => route.path), ...SHORT_PAGES.slice(1)]) {
  test(`${path}: one main landmark, with the heading of the page in it`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    const found = await page.evaluate(() => {
      const mains = Array.from(document.querySelectorAll("main"));
      const main = mains[0];
      const around = ["header:has([data-header-side])", "footer", '[class*="FaqChatbot"]'];
      return {
        mains: mains.length,
        headings: document.querySelectorAll("h1").length,
        headingsInside: main ? main.querySelectorAll("h1").length : 0,
        // Everything of the site that is around the page: there, and outside the landmark.
        around: around.map((selector) => document.querySelectorAll(selector).length > 0),
        inside: main ? around.filter((selector) => main.querySelector(selector) !== null) : [],
      };
    });
    expect(found.mains).toBe(1);
    expect(found.headings).toBeGreaterThanOrEqual(1);
    expect(found.headingsInside).toBe(found.headings);
    expect(found.around).toEqual([true, true, true]);
    expect(found.inside).toEqual([]);
  });
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

for (const path of [...SYSTEM_PAGES, "/gallery", ...SHORT_PAGES]) {
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
    expect(weights.texts).toBeGreaterThanOrEqual(SHORT_PAGES.includes(path) ? 3 : 10);
    expect(weights.off).toEqual([]);
  });
}

// The body of a case study or a post is set in the two text colours and nothing
// between them. Code keeps its own palette.
for (const path of [CASE_STUDIES[0], "/work/leadbot-ai", "/blog/my-workspace"]) {
  test(`${path}: body copy is in the content colour, with no third grey`, async ({ page }) => {
    await page.goto(path);
    await settled(page);
    const colours = await themeColours(page);
    const body = await page.evaluate(() => {
      const texts: { colour: string; text: string; paragraph: boolean }[] = [];
      for (const el of Array.from(document.querySelectorAll(".main-content-wrapper article *"))) {
        if (el.closest("pre, code, svg") || !el.checkVisibility()) continue;
        const own = Array.from(el.childNodes).some(
          (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim() !== "",
        );
        if (!own) continue;
        texts.push({
          colour: getComputedStyle(el).color,
          text: (el.textContent ?? "").trim().slice(0, 32),
          // What the MDX `p` renders to: a block of running text with its own leading.
          paragraph: el.matches('span[style*="line-height"]'),
        });
      }
      return texts;
    });
    const paragraphs = body.filter((t) => t.paragraph);
    expect(paragraphs.length).toBeGreaterThan(3);
    expect(paragraphs.filter((t) => t.colour !== colours.strong).map((t) => t.text)).toEqual([]);
    const allowed = [colours.strong, colours.weak];
    expect(
      body.filter((t) => !allowed.includes(t.colour)).map((t) => `${t.colour} ${t.text}`),
    ).toEqual([]);
  });
}

test("a post: its section list is in the secondary colour, the current section in the content colour", async ({
  page,
}) => {
  await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
  await page.goto("/blog/my-workspace");
  await settled(page);
  const colours = await themeColours(page);
  const label = page.getByText("On this page", { exact: true });
  await expect(label).toBeVisible();
  await expect(label).toHaveCSS("color", colours.weak);
  // The list is built after hydration, from the headings in the page.
  const links = page.locator('.main-content-wrapper a[href^="#"]').filter({ visible: true });
  await expect.poll(() => links.count()).toBeGreaterThan(2);
  const colour = () => links.evaluateAll((els) => els.map((a) => getComputedStyle(a).color));
  // Which section is current is measured in an effect, a moment after the list appears.
  await expect
    .poll(async () => (await colour()).filter((c) => c === colours.strong).length)
    .toBe(1);
  const found = await colour();
  expect(found.filter((colour) => colour !== colours.strong && colour !== colours.weak)).toEqual(
    [],
  );
});

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

test("with reduced motion a stats arrow jumps instead of gliding", async ({ page }) => {
  await page.setViewportSize({ width: PHONE.width, height: PHONE.height });
  await page.goto(CASE_STUDIES[0]);
  // After the navigation: Firefox drops media emulated before the first one on this site.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const block = page.locator('[class*="ResultsStats_carouselWrapper"]').first();
  await expect(block.getByRole("button", { name: "Scroll right" })).toBeVisible();
  const moved = await block.evaluate((el) => {
    const track = el.querySelector('[class*="ResultsStats_track"]') as HTMLElement;
    (el.querySelector('button[aria-label="Scroll right"]') as HTMLButtonElement).click();
    // Read in the same task as the click: only a scroll that did not glide is there already.
    return track.scrollLeft;
  });
  expect(moved).toBeGreaterThan(0);
});

// Once UI sets `scroll-behavior: smooth` on <html>, so the page glides to a
// section whoever scrolls it there: a script, or the router following a link to
// `#section`. Clicks, then reads where the page is on every frame until it has
// been still for a while: a jump is one move, a glide passes through many places.
const placesAfterClick = (target: import("@playwright/test").Locator) =>
  target.evaluate(async (el: HTMLElement) => {
    const places = [Math.round(window.scrollY)];
    el.click();
    const until = performance.now() + 1500;
    while (performance.now() < until) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const now = Math.round(window.scrollY);
      if (now !== places[places.length - 1]) places.push(now);
    }
    return places;
  });

test("with reduced motion a section link of a post jumps instead of gliding", async ({ page }) => {
  await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
  await page.goto("/blog/my-workspace");
  await settled(page);
  // After the navigation: Firefox drops media emulated before the first one on this site.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const links = page.locator('.main-content-wrapper a[href^="#"]').filter({ visible: true });
  await expect.poll(() => links.count()).toBeGreaterThan(2);
  const places = await placesAfterClick(links.nth(2));
  // Where it was, and where the section is: nothing in between.
  expect(places.length).toBe(2);
  expect(places[1]).toBeGreaterThan(100);
});

test("with reduced motion the About page's section list jumps instead of gliding", async ({
  page,
}) => {
  await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
  await page.goto("/about");
  await settled(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  // The list is fixed to the left edge; the same words are a heading in the page.
  const entry = page.getByText("Work Experience", { exact: true }).first();
  await expect(entry).toBeVisible();
  expect(await entry.evaluate((el) => el.closest("h2") === null)).toBe(true);
  const places = await placesAfterClick(entry);
  expect(places.length).toBe(2);
  expect(places[1]).toBeGreaterThan(100);
});

test("without reduced motion a section link still glides", async ({ page }) => {
  // The other half of the two tests above: they would also pass on a page that never glides.
  await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
  await page.goto("/about");
  await settled(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const entry = page.getByText("Work Experience", { exact: true }).first();
  await expect(entry).toBeVisible();
  const places = await placesAfterClick(entry);
  expect(places.length).toBeGreaterThan(3);
});

// ─── A case study keeps every picture and clip of its project ───────────────
// The list shows stills only, so the page of the project is where the rest of
// its media lives: the first entry as the hero, the others after the body.

const CLIPS = [
  { path: "/work/leadbot-ai", files: ["chatbot-artesa.mp4", "leadbot.mp4"] },
  { path: "/work/atv-riders", files: ["chatbot-video.mp4"] },
];

for (const { path, files } of CLIPS) {
  test(`${path}: its clips wait to be played`, async ({ page, request }) => {
    await page.goto(path);
    await settled(page);
    for (const file of files) {
      const clip = page.locator(`.main-content-wrapper video[src$="/${file}"]`);
      await expect(clip).toHaveCount(1);
      await clip.scrollIntoViewIfNeeded();
      await expect(clip).toBeVisible();
      const state = await clip.evaluate((video: HTMLVideoElement) => {
        const box = video.getBoundingClientRect();
        return {
          controls: video.controls,
          autoplay: video.autoplay,
          paused: video.paused,
          preload: video.preload,
          // The attribute, not the property: Firefox has no `playsInline` on the element.
          inline: video.hasAttribute("playsinline"),
          label: video.getAttribute("aria-label") ?? "",
          poster: video.getAttribute("poster") ?? "",
          width: box.width,
          height: box.height,
          corner: getComputedStyle(video.parentElement as Element).borderRadius,
          fit: getComputedStyle(video).objectFit,
          ground: getComputedStyle(video).backgroundColor,
        };
      });
      expect(state.controls).toBe(true);
      expect(state.autoplay).toBe(false);
      expect(state.paused).toBe(true);
      // Nothing is fetched until it is played: a <video> that loads, even only its
      // metadata, makes Firefox hold back the page's `load` under a busy server.
      expect(state.preload).toBe("none");
      expect(state.inline).toBe(true);
      expect(state.label).not.toBe("");
      expect(state.width).toBeGreaterThan(200);
      expect(state.height).toBeGreaterThan(100);
      expect(state.corner).toBe("4px");
      // A screen recording is not 16:9: it is shown whole, on black, not cropped to the frame.
      expect(state.fit).toBe("contain");
      expect(state.ground).toBe("rgb(0, 0, 0)");
      // With nothing loaded the poster is all there is to see, so it has to exist.
      expect(state.poster).toMatch(/-poster\.webp$/);
      expect((await request.get(state.poster)).status()).toBe(200);
    }
    const playing = await page.evaluate(
      () => Array.from(document.querySelectorAll("video")).filter((video) => !video.paused).length,
    );
    expect(playing).toBe(0);
  });
}

const moreMedia = (page: Page) =>
  page.evaluate(() => {
    const section = document.querySelector("[data-project-more]");
    if (!section) return null;
    const body = document.querySelector(".main-content-wrapper article");
    return {
      afterBody:
        body !== null &&
        (body.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
      heading: section.querySelector("h2")?.textContent ?? "",
      media: Array.from(section.querySelectorAll("img, video")).map((el) =>
        decodeURIComponent(el.getAttribute("src") ?? ""),
      ),
      corners: Array.from(section.querySelectorAll("li")).map(
        (item) => getComputedStyle(item).borderRadius,
      ),
    };
  });

test("a case study shows the rest of its project's media after the body", async ({ page }) => {
  await page.goto(CASE_STUDIES[0]);
  await settled(page);
  const more = await moreMedia(page);
  expect(more).not.toBeNull();
  expect(more?.afterBody).toBe(true);
  expect(more?.heading.trim()).not.toBe("");
  expect(more?.media.length).toBe(2);
  expect(more?.media[0]).toContain("social-media2.webp");
  expect(more?.media[1]).toContain("social-media3.webp");
  expect(more?.corners).toEqual(["4px", "4px"]);
});

test("stills and clips keep the order the project lists them in", async ({ page }) => {
  await page.goto("/work/atv-riders");
  await settled(page);
  const more = await moreMedia(page);
  expect(more?.media.length).toBe(2);
  expect(more?.media[0]).toMatch(/chatbot-video\.mp4$/);
  expect(more?.media[1]).toContain("chatbot.webp");
});

// One picture only, and a project whose other pictures are already in its body.
for (const path of ["/work/ai-portfolio", "/work/dakoma-roofing"]) {
  test(`${path}: nothing is left to show, so there is no section for it`, async ({ page }) => {
    await page.goto(path);
    await settled(page);
    // The page did render: its hero and its related projects are there.
    await expect(page.locator("[data-project-hero]")).toBeVisible();
    await expect(page.locator("[data-project-media]").first()).toBeAttached();
    expect(await moreMedia(page)).toBeNull();
  });
}

// ─── Blog, About ────────────────────────────────────────────────────────────

/** Every h2 on the page, and whether anything follows it before its parent ends. */
const headingsWithNothingAfter = (page: Page) =>
  page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll(".main-content-wrapper h2"));
    const empty = headings
      .filter((h) => {
        // The block under a heading is the next sibling of the heading, or of the box that
        // holds it and its copy-link mark; a list that rendered nothing leaves none.
        const box = h.parentElement?.matches('[class*="HeadingLink_control"]')
          ? h.parentElement
          : h;
        const next = box.nextElementSibling;
        return next === null || (next.textContent ?? "").trim() === "";
      })
      .map((h) => (h.textContent ?? "").trim());
    return { total: headings.length, empty };
  });

test("/blog: no heading is left over a list with nothing in it", async ({ page }) => {
  await page.goto("/blog");
  await settled(page);
  // The page did render its posts: there is one, and it is a link to it.
  await expect(
    page.locator('.main-content-wrapper a[href="/blog/my-workspace"]').first(),
  ).toBeVisible();
  expect((await headingsWithNothingAfter(page)).empty).toEqual([]);
  await expect(page.getByRole("heading", { name: "Earlier posts" })).toHaveCount(0);
});

test("a post: no heading is left over a list with nothing in it", async ({ page }) => {
  await page.goto("/blog/my-workspace");
  await settled(page);
  const found = await headingsWithNothingAfter(page);
  // The post's own sections are headings too, so this scan has something to read.
  expect(found.total).toBeGreaterThan(0);
  expect(found.empty).toEqual([]);
  await expect(page.getByRole("heading", { name: "Recent posts" })).toHaveCount(0);
});

for (const viewport of [PHONE, DESKTOP]) {
  test(`/about: "Schedule a call" is the call to action at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/about");
    await settled(page);
    const call = page.getByRole("link", { name: "Schedule a call" });
    await expect(call).toBeVisible();
    const look = await call.evaluate((a) => {
      const cs = getComputedStyle(a);
      return {
        background: cs.backgroundColor,
        colour: cs.color,
        radius: cs.borderRadius,
        height: a.getBoundingClientRect().height,
        underlined: cs.textDecorationLine.includes("underline"),
      };
    });
    expect(look.background).toBe("rgb(45, 91, 255)");
    expect(look.colour).toBe("rgb(255, 255, 255)");
    expect(look.radius).toBe("6px");
    expect(look.height).toBeGreaterThanOrEqual(44);
    expect(look.underlined).toBe(false);
  });
}

// The cover of a post fills the column: on a phone it is told so, and asks for
// a file its own width, not the 768px one a wide screen needs.
test("a post: the cover asks for a file the width of a phone's screen", async ({ page }) => {
  await page.setViewportSize({ width: PHONE.width, height: PHONE.height });
  await page.goto("/blog/my-workspace");
  await settled(page);
  const cover = page.locator(
    '.main-content-wrapper img[alt="My Workspace: The System Behind My Creative & AI Work"]',
  );
  await expect(cover).toHaveCount(1);
  await expect
    .poll(() => cover.evaluate((img: HTMLImageElement) => img.currentSrc))
    .toContain("w=");
  const asked = await cover.evaluate((img: HTMLImageElement) => ({
    file: Number(new URL(img.currentSrc).searchParams.get("w")),
    shown: img.getBoundingClientRect().width,
    ratio: window.devicePixelRatio,
  }));
  expect(asked.shown).toBeLessThanOrEqual(PHONE.width);
  expect(asked.file).toBeGreaterThanOrEqual(asked.shown * asked.ratio);
  expect(asked.file).toBeLessThan(768 * asked.ratio);
});

test("/blog: the first post's picture is not lazy", async ({ page }) => {
  await page.goto("/blog");
  await settled(page);
  const pictures = page.locator('.main-content-wrapper a[href^="/blog/"] img[alt^="Thumbnail of"]');
  // The largest thing on the first screen: it has to start loading with the page.
  await expect(pictures.first()).toBeVisible();
  expect(await pictures.first().getAttribute("loading")).not.toBe("lazy");
});

// ─── Gallery ────────────────────────────────────────────────────────────────

test("/gallery: a group of pictures opens without animating a filter", async ({ page }) => {
  await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
  await page.goto("/gallery");
  await settled(page);
  const cover = page.getByText(/^1\/\d+$/).first();
  await cover.scrollIntoViewIfNeeded();
  await cover.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // More than one picture to go through, so the group is really on screen.
  await expect(dialog.locator("img").nth(1)).toBeAttached();
  const filtered = await page.evaluate(async () => {
    const seen = new Set<string>();
    const until = performance.now() + 1500;
    while (performance.now() < until) {
      for (const animation of document.getAnimations()) {
        const effect = animation.effect as KeyframeEffect | null;
        if (!effect?.getKeyframes().some((k) => "filter" in k && k.filter !== "none")) continue;
        const target = effect.target;
        seen.add(target ? `${target.tagName.toLowerCase()}.${target.className}` : "?");
      }
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    return [...seen];
  });
  expect(filtered).toEqual([]);
});

test("/gallery: a tile moves with transform alone, never with its shadow", async ({ page }) => {
  await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
  await page.goto("/gallery");
  await settled(page);
  const tiles = await page.evaluate(() => {
    const seconds = (value: string) =>
      value.endsWith("ms") ? Number.parseFloat(value) / 1000 : Number.parseFloat(value);
    return Array.from(
      document.querySelectorAll(
        '.main-content-wrapper button[aria-haspopup="dialog"], .main-content-wrapper [class*="youtubeHover"]',
      ),
    ).map((el) => {
      const cs = getComputedStyle(el);
      const properties = cs.transitionProperty.split(",").map((p) => p.trim());
      const durations = cs.transitionDuration.split(",").map((d) => seconds(d.trim()));
      return {
        kind: el.tagName === "BUTTON" ? "picture" : "video",
        // What would animate if it changed: every listed property with a duration.
        moving: properties.filter((_, i) => durations[i % durations.length] > 0),
      };
    });
  });
  expect(tiles.filter((t) => t.kind === "picture").length).toBeGreaterThan(10);
  expect(tiles.filter((t) => t.kind === "video").length).toBeGreaterThan(0);
  expect(tiles.filter((t) => t.moving.some((p) => p !== "transform" && p !== "opacity"))).toEqual(
    [],
  );
  // The hover is still there for a mouse: the scan above did not pass on tiles that never move.
  expect(tiles.filter((t) => t.kind === "picture" && t.moving.includes("transform")).length).toBe(
    tiles.filter((t) => t.kind === "picture").length,
  );
});

test("/gallery: the counter on a group is opaque and square-cornered", async ({ page }) => {
  // Light, where the theme's own text colour is the one that would vanish on black.
  await forceTheme(page, "light");
  await page.goto("/gallery");
  await settled(page);
  const badges = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".main-content-wrapper *"))
      .filter((el) => /^1\/\d+$/.test((el.textContent ?? "").trim()) && el.children.length === 0)
      .map((el) => {
        const box = el.parentElement as HTMLElement;
        const cs = getComputedStyle(box);
        return {
          background: cs.backgroundColor,
          radius: cs.borderRadius,
          blur: cs.getPropertyValue("backdrop-filter") || "none",
          count: getComputedStyle(el).color,
          icon: getComputedStyle(box.querySelector("svg") ?? box).color,
          size: Number.parseFloat(getComputedStyle(el).fontSize),
          pictures: Number((el.textContent ?? "").split("/")[1]),
        };
      }),
  );
  expect(badges.length).toBeGreaterThan(0);
  for (const badge of badges) {
    expect(badge).toEqual({
      background: "rgb(0, 0, 0)",
      radius: "4px",
      blur: "none",
      // The badge is black in both themes, so what is on it is white in both.
      count: "rgb(255, 255, 255)",
      icon: "rgb(255, 255, 255)",
      size: expect.any(Number),
      pictures: expect.any(Number),
    });
    // A group of one has nothing to count, so it wears no badge.
    expect(badge.pictures).toBeGreaterThan(1);
    expect(badge.size).toBeGreaterThanOrEqual(13);
  }
});

test("/gallery: each cell is a button that names what it opens", async ({ page }) => {
  await page.setViewportSize({ width: PHONE.width, height: PHONE.height });
  await page.goto("/gallery");
  await settled(page);
  const cells = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('.main-content-wrapper button[aria-haspopup="dialog"]'),
    ).map((el) => {
      const box = el.getBoundingClientRect();
      return {
        name: el.getAttribute("aria-label") ?? "",
        w: box.width,
        h: box.height,
      };
    }),
  );
  expect(cells.length).toBeGreaterThan(10);
  expect(cells.filter((c) => !/^Open (picture|\d+ pictures): \S/.test(c.name))).toEqual([]);
  expect(cells.filter((c) => c.w < 44 || c.h < 44)).toEqual([]);
  // At least one group says how many pictures it holds.
  expect(cells.some((c) => /^Open \d+ pictures/.test(c.name))).toBe(true);
});

test.describe("the gallery from the keyboard", () => {
  // Safari does not put buttons in the Tab order unless a system setting says so.
  test.skip(({ browserName }) => browserName === "webkit", "Safari skips buttons when tabbing");

  const tabTo = async (page: Page, target: import("@playwright/test").Locator) => {
    for (let presses = 0; presses < 80; presses++) {
      if (await target.evaluate((el) => el === document.activeElement)) return;
      await page.keyboard.press("Tab");
    }
    throw new Error("Tab never reached the element");
  };

  test("a picture opens with Enter, has a name and gives focus back on Escape", async ({
    page,
  }) => {
    await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
    await page.goto("/gallery");
    await settled(page);
    const cell = page.locator('button[aria-haspopup="dialog"][aria-label^="Open picture"]').first();
    await tabTo(page, cell);
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName(/\S/);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(cell).toBeFocused();
  });

  test("a group's pictures can be scrolled from the keyboard", async ({ page }) => {
    await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
    await page.goto("/gallery");
    await settled(page);
    const cell = page.locator('button[aria-haspopup="dialog"][aria-label*=" pictures:"]').first();
    await tabTo(page, cell);
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName(/\S/);
    const row = dialog.locator('ul[aria-label^="Pictures"]');
    await expect(row).toHaveCount(1);
    await tabTo(page, row);
    await expect(row).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(cell).toBeFocused();
  });
});

// ─── The short screens keep their button the size of the call to action ─────

for (const path of SHORT_PAGES.slice(1)) {
  for (const viewport of [PHONE, DESKTOP]) {
    test(`${path}: the button is one call to action tall at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(path);
      await settled(page);
      const button = page.locator('.main-content-wrapper [class*="screens_cta"]');
      await expect(button).toHaveCount(1);
      const box = await button.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeLessThanOrEqual(56);
      // One compact group: the heading, the line and the button sit within a few hundred pixels.
      const group = await page.evaluate(() => {
        const screen = document.querySelector('[class*="screens_screen"]') as HTMLElement;
        return screen.firstElementChild && screen.lastElementChild
          ? screen.lastElementChild.getBoundingClientRect().bottom -
              screen.firstElementChild.getBoundingClientRect().top
          : Number.POSITIVE_INFINITY;
      });
      expect(group).toBeLessThan(320);
    });
  }
}

test("/unauthorized: the field's show button says what it does", async ({ page }) => {
  await page.goto("/unauthorized");
  await settled(page);
  const show = page.getByRole("button", { name: "Show password" });
  await expect(show).toBeVisible();
  await expect(page.locator("#password")).toHaveAttribute("type", "password");
  await show.click();
  await expect(page.locator("#password")).toHaveAttribute("type", "text");
  await expect(page.getByRole("button", { name: "Hide password" })).toBeVisible();
});

// ─── Pictures have 4px corners ──────────────────────────────────────────────

for (const path of [
  "/work",
  "/blog",
  "/blog/my-workspace",
  "/gallery",
  ...Object.keys(RAW_PICTURES),
]) {
  test(`${path}: every picture is clipped to 4px corners`, async ({ page }) => {
    await page.goto(path);
    await settled(page);
    const found = await page.evaluate(() => {
      const bad: string[] = [];
      let pictures = 0;
      for (const img of Array.from(document.querySelectorAll(".main-content-wrapper img"))) {
        // Avatars are circles on purpose: the one kind of picture with another corner.
        if (img.closest('[class*="Avatar"]') || !img.checkVisibility()) continue;
        pictures += 1;
        // The corner a picture shows is its own, or that of a box around it that
        // clips it: one that hides its overflow and that the picture fills. A box
        // may clip without a corner of its own (Once UI's Media does) inside one
        // that has it (a gallery tile), so the walk goes on until a corner is found
        // or a box is larger than the picture, whose corners are then not its.
        const radii: string[] = [];
        const own = getComputedStyle(img).borderRadius;
        if (own !== "0px") radii.push(own);
        const box = img.getBoundingClientRect();
        for (let node = img.parentElement; node; node = node.parentElement) {
          const cs = getComputedStyle(node);
          if (cs.overflow === "visible") continue;
          const clip = node.getBoundingClientRect();
          const filled =
            box.left <= clip.left + 2 &&
            box.top <= clip.top + 2 &&
            box.right >= clip.right - 2 &&
            box.bottom >= clip.bottom - 2;
          if (!filled) break;
          if (cs.borderRadius !== "0px") {
            radii.push(cs.borderRadius);
            break;
          }
        }
        // A corner has to be there, and be 4px: a picture with none at all is square.
        if (radii.length === 0 || radii.some((radius) => radius !== "4px")) {
          bad.push(
            `${radii.join(" ") || "no radius"} ${(img.getAttribute("src") ?? "").slice(-40)}`,
          );
        }
      }
      return { pictures, bad };
    });
    expect(found.pictures).toBeGreaterThan(0);
    expect(found.bad).toEqual([]);
  });
}

for (const [path, count] of Object.entries(RAW_PICTURES)) {
  test(`${path}: a picture written straight into the body stays inside the column`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: PHONE.width, height: PHONE.height });
    await page.goto(path);
    await settled(page);
    // next/image marks its own pictures; these are the ones that are not its.
    const raw = page.locator(".main-content-wrapper article img:not([data-nimg])");
    await expect(raw).toHaveCount(count);
    for (const picture of await raw.all()) {
      await picture.scrollIntoViewIfNeeded();
      await expect
        .poll(() => picture.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0);
      const box = await picture.evaluate((img: HTMLImageElement) => {
        const cs = getComputedStyle(img);
        const column = (img.closest("article") as HTMLElement).getBoundingClientRect();
        const rect = img.getBoundingClientRect();
        return {
          radius: cs.borderRadius,
          display: cs.display,
          maxWidth: cs.maxWidth,
          inside: rect.left >= column.left - 0.5 && rect.right <= column.right + 0.5,
          // Its own proportions, not a height left over from somewhere else.
          proportion: Math.abs(rect.width / rect.height - img.naturalWidth / img.naturalHeight),
        };
      });
      expect(box.radius).toBe("4px");
      expect(box.display).toBe("block");
      expect(box.maxWidth).toBe("100%");
      expect(box.inside).toBe(true);
      expect(box.proportion).toBeLessThan(0.02);
    }
  });
}

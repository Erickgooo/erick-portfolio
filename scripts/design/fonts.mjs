// Which font each kind of text really renders in, page by page, so two builds
// can be compared after a font change (once, a CSS order change sent the intro
// and the chatbot to Times New Roman).
//
//   node scripts/design/fonts.mjs --base https://www.erickmahecha.com --out .perf/fonts/prod.json
//   node scripts/design/fonts.mjs --base http://localhost:3100 --out .perf/fonts/branch.json --compare .perf/fonts/prod.json
//
// For every page, at 390 and 1440 px, it records:
//   - named probes: h1, h2, h3, a paragraph, a nav link, the footer, the intro
//     wordmark (Home, while the intro plays) and the chatbot's greeting bubble;
//   - one probe per distinct (font-family, weight, style) found on text in the
//     page, after scrolling through it so every section has rendered;
//   - document.fonts: each face with its status.
// Each probe gives getComputedStyle's font-family and weight and the face
// Chromium actually drew the text with (CDP CSS.getPlatformFontsForNode).
// --compare prints every difference against another run and exits 1 if any.
// LH_BYPASS (env) sends Vercel's protection-bypass headers (Preview).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, devices } from "@playwright/test";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const base = arg("base", "http://localhost:3100");
const out = arg("out", ".perf/fonts/local.json");
const compare = arg("compare", "");
const PAGES = {
  home: "/",
  about: "/about",
  work: "/work",
  "leadbot-ai": "/work/leadbot-ai",
  "ai-powered-ad-creatives": "/work/ai-powered-ad-creatives",
  "atv-riders": "/work/atv-riders",
  "quick-metal-shop-viral-videos": "/work/quick-metal-shop-viral-videos",
  "quick-metal-shop-arquiexpo": "/work/quick-metal-shop-arquiexpo",
  "ai-portfolio": "/work/ai-portfolio",
  "dakoma-roofing": "/work/dakoma-roofing",
  "quick-metal-shop-marketing": "/work/quick-metal-shop-marketing",
  "quick-metal-shop-the-brand-comes-to-life": "/work/quick-metal-shop-the-brand-comes-to-life",
  blog: "/blog",
  "blog-post": "/blog/my-workspace",
  gallery: "/gallery",
  404: "/this-page-does-not-exist",
};
const only = arg("pages", Object.keys(PAGES).join(",")).split(",");
const VIEWPORTS = {
  390: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
  1440: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const NAMED = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  paragraph: "main p",
  nav: "header a",
  footer: "footer p, footer a, footer span",
  "intro-wordmark": '[class*="IntroLoader_wordmark"]',
  "chatbot-bubble": '[class*="greetingBubble"] p, [class*="greetingBubble"] span',
};

// The face Chromium drew an element's text with, e.g. "Montserrat" or "Arial".
async function platformFonts(cdp, selector) {
  const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector });
  if (!nodeId) return null;
  // The text node holds the glyphs; the element itself reports its children.
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  return fonts
    .filter((f) => f.glyphCount > 0)
    .map((f) => f.familyName)
    .sort()
    .join(" + ");
}

// Marks the first visible element with text for a selector (or, when its text
// sits in children, the first descendant holding text itself) and returns its
// computed font.
async function mark(page, selector, id) {
  return page.evaluate(
    ({ selector, id }) => {
      const ownText = (n) =>
        [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
      const host = [...document.querySelectorAll(selector)].find(
        (e) => e.textContent.trim() && e.getClientRects().length > 0,
      );
      if (!host) return null;
      const el = [host, ...host.querySelectorAll("*")].find(
        (n) => ownText(n) && n.getClientRects().length > 0,
      );
      if (!el) return null;
      el.setAttribute("data-fontprobe", id);
      const cs = getComputedStyle(el);
      return { family: cs.fontFamily, weight: cs.fontWeight, style: cs.fontStyle };
    },
    { selector, id },
  );
}

async function probe(page, cdp, selector, id) {
  const computed = await mark(page, selector, id);
  if (!computed) return null;
  await page.evaluate(
    (id) => document.querySelector(`[data-fontprobe="${id}"]`)?.scrollIntoView({ block: "center" }),
    id,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  return { ...computed, rendered: await renderedFont(page, cdp, id) };
}

// A section with content-visibility: auto can take a few frames to render
// after it scrolls in; until then CDP reports no glyphs, so retry a little.
async function renderedFont(page, cdp, id) {
  let rendered = await platformFonts(cdp, `[data-fontprobe="${id}"]`);
  for (let tries = 0; rendered === "" && tries < 5; tries++) {
    await page.waitForTimeout(300);
    rendered = await platformFonts(cdp, `[data-fontprobe="${id}"]`);
  }
  return rendered;
}

async function measurePage(browser, name, width) {
  const opts = { ...VIEWPORTS[width], colorScheme: "light" };
  if (process.env.LH_BYPASS) {
    opts.extraHTTPHeaders = {
      "x-vercel-protection-bypass": process.env.LH_BYPASS,
      "x-vercel-set-bypass-cookie": "true",
    };
  }
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  await page.goto(`${base}${PAGES[name]}`, { waitUntil: "load", timeout: 90_000 });
  const result = { named: {}, faces: {}, documentFonts: [] };

  // The intro wordmark exists only while the intro plays (Home); it fades in after 2 s.
  if (await page.locator(NAMED["intro-wordmark"]).count()) {
    await page.waitForTimeout(2600);
    result.named["intro-wordmark"] = await probe(
      page,
      cdp,
      NAMED["intro-wordmark"],
      "intro-wordmark",
    );
  }
  // The greeting bubble shows 2.5 s after the chatbot mounts, for 8 s.
  const bubble = await page
    .waitForSelector('[class*="greetingBubble"]', { timeout: 9000 })
    .then(() => true)
    .catch(() => false);
  if (bubble)
    result.named["chatbot-bubble"] = await probe(
      page,
      cdp,
      NAMED["chatbot-bubble"],
      "chatbot-bubble",
    );

  // Let the intro end, then scroll through the page so every section renders.
  await page.waitForFunction(() => document.body.style.overflow !== "hidden", null, {
    timeout: 15_000,
  });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * 0.8) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 120));
    }
    await document.fonts.ready;
  });

  for (const [id, selector] of Object.entries(NAMED)) {
    if (id === "intro-wordmark" || id === "chatbot-bubble") continue;
    result.named[id] = await probe(page, cdp, selector, id);
  }

  // One probe per distinct computed font on elements with their own text.
  const keys = await page.evaluate(() => {
    const seen = new Map();
    for (const el of document.querySelectorAll("body *")) {
      if (el.closest("script, style, noscript, svg")) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own || !el.getClientRects().length) continue;
      const cs = getComputedStyle(el);
      const key = `${cs.fontFamily} | ${cs.fontWeight} | ${cs.fontStyle}`;
      if (!seen.has(key)) {
        const id = `face-${seen.size}`;
        el.setAttribute("data-fontprobe", id);
        seen.set(key, id);
      }
    }
    return [...seen.entries()];
  });
  for (const [key, id] of keys) {
    await page.evaluate(
      (id) =>
        document.querySelector(`[data-fontprobe="${id}"]`)?.scrollIntoView({ block: "center" }),
      id,
    );
    await page.evaluate(() => document.fonts.ready);
    result.faces[key] = await renderedFont(page, cdp, id);
  }

  result.documentFonts = await page.evaluate(() =>
    [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.style}: ${f.status}`).sort(),
  );
  await ctx.close();
  return result;
}

const browser = await chromium.launch();
const results = {};
try {
  for (const name of only) {
    for (const width of [390, 1440]) {
      results[`${name}@${width}`] = await measurePage(browser, name, width);
      process.stdout.write(".");
    }
  }
} finally {
  await browser.close();
}
console.log("");
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(results, null, 2));
console.log(`Written ${out}`);

if (compare) {
  const other = JSON.parse(readFileSync(compare, "utf8"));
  // next/font's own faces carry a build hash in their family name
  // ("__Inter_d65c78"); that hash is not a difference in the font.
  const norm = (v) => JSON.stringify(v ?? null).replace(/__([A-Za-z_]+?)_[0-9a-f]{6}/g, "__$1");
  const diffs = [];
  for (const [pageKey, r] of Object.entries(results)) {
    const o = other[pageKey];
    if (!o) {
      diffs.push(`${pageKey}: missing in ${compare}`);
      continue;
    }
    for (const id of new Set([...Object.keys(r.named), ...Object.keys(o.named)])) {
      if (norm(r.named[id]) !== norm(o.named[id])) {
        diffs.push(`${pageKey} ${id}: ${norm(o.named[id])} -> ${norm(r.named[id])}`);
      }
    }
    const faces = (x) => Object.fromEntries(Object.entries(x.faces).map(([k, v]) => [norm(k), v]));
    const a = faces(r);
    const b = faces(o);
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (a[k] !== b[k])
        diffs.push(`${pageKey} face ${k}: ${b[k] ?? "absent"} -> ${a[k] ?? "absent"}`);
    }
    const fa = norm(r.documentFonts);
    const fb = norm(o.documentFonts);
    if (fa !== fb) diffs.push(`${pageKey} document.fonts: ${fb} -> ${fa}`);
  }
  console.log(diffs.length ? diffs.join("\n") : `No font differences against ${compare}`);
  if (diffs.length) process.exitCode = 1;
}

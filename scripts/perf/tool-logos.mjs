// When does each logo of the Home's tool wall ("What's on the bench") finish
// downloading, compared with the moment its tile enters the viewport? And how
// many logo and font requests does a repeat visit make?
//
//   node scripts/perf/tool-logos.mjs [--base https://www.erickmahecha.com] [--forms mobile,desktop] [--runs 3] [--speed 300] [--tag prod]
//
// Profile (Lighthouse's mobile one, applied through CDP): RTT 150 ms, 1.6 Mbps
// down, 750 Kbps up, CPU 4x. Each run opens a fresh context (empty cache):
//   1. First visit: load the Home, wait for the intro to finish, then scroll
//      at --speed px/s (reading pace) down to the wall and through it. A tile
//      "enters" when its top edge crosses the bottom of the viewport
//      (IntersectionObserver, threshold 0); its logo is "done" at the
//      responseEnd of the logo's Resource Timing entry (0 when it came with
//      the HTML). Phones count each tile of the stacked groups; desktop counts
//      the 24 cells of the board.
//   2. Repeat visits, in the same context, each with the same intro wait and
//      scroll: a plain navigation to the same URL in the same tab (no forced
//      reload), then a new tab once the first one is closed (the renderer's
//      memory cache is gone, as for a visitor who comes back later). Each
//      counts the logo and font requests that did not come out of the cache:
//      a request counts when CDP reports it neither from the memory, disk or
//      prefetch cache, or when its Resource Timing transferSize is above 0.
//      A 304 counts as a request. (Chrome can reuse a font from the previous
//      document of the same tab without asking the network at all, so the
//      new tab is the one that shows a font's revalidation.)
//
// LH_BYPASS (env) sends Vercel's protection-bypass headers (Preview).
// Writes .perf/logos/<tag>.json and prints a summary.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, devices } from "@playwright/test";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const base = arg("base", "http://localhost:3100");
const forms = arg("forms", "mobile,desktop").split(",");
const runs = Number(arg("runs", 3));
const speed = Number(arg("speed", 300));
const tag = arg("tag", "local");

const NETWORK = {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
};
const CPU_RATE = 4;
const CONTEXTS = {
  mobile: { ...devices["Pixel 7"] },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

const isFont = (url) => /\.woff2?(\?|$)/i.test(url);

async function newContext(browser, form) {
  const opts = { ...CONTEXTS[form] };
  if (process.env.LH_BYPASS) {
    opts.extraHTTPHeaders = {
      "x-vercel-protection-bypass": process.env.LH_BYPASS,
      "x-vercel-set-bypass-cookie": "true",
    };
  }
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript(() => {
    performance.setResourceTimingBufferSize(2000);
  });
  return ctx;
}

// A throttled tab whose requests are recorded.
async function openPage(ctx) {
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  const reqs = recordRequests(cdp);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", NETWORK);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_RATE });
  return { page, reqs };
}

// One visit: load, intro, scroll through the wall, then the uncached logo
// and font requests of that document.
async function visit(page, reqs, form, logoUrls) {
  reqs.clear();
  await page.goto(`${base}/`, { waitUntil: "load", timeout: 120_000 });
  await waitForIntro(page);
  const rows = await scrollThroughWall(page, form, speed);
  for (const r of rows) if (r.src && !r.src.startsWith("data:")) logoUrls.add(r.src);
  await page.waitForLoadState("networkidle", { timeout: 60_000 }).catch(() => {});
  return { rows, requests: await countUncached(page, reqs, logoUrls) };
}

// Every request of the page as CDP sees it, keyed by requestId.
function recordRequests(cdp) {
  const reqs = new Map();
  const get = (id) => {
    if (!reqs.has(id)) reqs.set(id, { url: "", type: "", status: 0, cache: "" });
    return reqs.get(id);
  };
  cdp.on("Network.requestWillBeSent", (e) => {
    const r = get(e.requestId);
    r.url = e.request.url;
    r.type = e.type ?? r.type;
  });
  cdp.on("Network.requestServedFromCache", (e) => {
    get(e.requestId).cache = "memory";
  });
  cdp.on("Network.responseReceived", (e) => {
    const r = get(e.requestId);
    r.url = r.url || e.response.url;
    r.type = e.type ?? r.type;
    r.status = e.response.status;
    if (e.response.fromDiskCache) r.cache = r.cache || "disk";
    if (e.response.fromPrefetchCache) r.cache = r.cache || "prefetch";
  });
  return reqs;
}

async function waitForIntro(page) {
  // The overlay unmounts and the body scrolls again when the intro is done.
  await page.waitForFunction(
    () =>
      document.readyState !== "loading" &&
      !document.querySelector('[class*="IntroLoader_overlay"]') &&
      document.body.style.overflow !== "hidden",
    null,
    { timeout: 90_000, polling: 100 },
  );
}

// Observes the tiles, scrolls at a constant pace through the wall, and
// returns one row per tile.
async function scrollThroughWall(page, form, pxPerSecond) {
  return page.evaluate(
    async ({ form, pxPerSecond }) => {
      const wall = document.querySelector('section[aria-labelledby="tools-title"]');
      if (!wall) throw new Error("tool wall not found");
      const board = wall.querySelector('[class*="toolwall_board"]');
      // Phones: the list tiles. Desktop: the board cells (the lists are visually hidden there).
      const tiles =
        form === "desktop"
          ? [...board.querySelectorAll('[class*="toolwall_cell"]')]
          : [...wall.querySelectorAll('li[class*="toolwall_tile"]')];
      const rows = tiles.map((tile, i) => {
        const img = tile.querySelector("img");
        return {
          i,
          name: tile.textContent.trim(),
          src: img?.currentSrc || img?.src || "",
          enter: null,
          completeAtEnter: null,
        };
      });
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          const row = rows[tiles.indexOf(e.target)];
          if (e.isIntersecting && row.enter === null) {
            row.enter = e.time;
            const img = e.target.querySelector("img");
            row.completeAtEnter = Boolean(img?.complete && img.naturalWidth > 0);
            row.src = img?.currentSrc || img?.src || row.src;
          }
        }
      });
      for (const t of tiles) io.observe(t);

      const box = wall.getBoundingClientRect();
      const end = window.scrollY + box.bottom;
      await new Promise((resolve) => {
        let last = performance.now();
        const step = (now) => {
          const dt = Math.min(100, now - last);
          last = now;
          const next = Math.min(end, window.scrollY + (pxPerSecond * dt) / 1000);
          window.scrollTo({ top: next, behavior: "instant" });
          const max = document.documentElement.scrollHeight - window.innerHeight;
          if (next >= end || window.scrollY >= max - 1) resolve();
          else requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      // Let the last tiles report.
      await new Promise((r) => setTimeout(r, 1500));
      io.disconnect();

      const nav = performance.getEntriesByType("navigation")[0];
      for (const row of rows) {
        if (!row.src || row.src.startsWith("data:")) {
          row.done = nav.responseEnd;
          row.via = "inline";
          continue;
        }
        const entry = performance.getEntriesByName(row.src, "resource")[0];
        row.done = entry ? entry.responseEnd : null;
        row.start = entry ? entry.startTime : null;
        row.via = entry ? "network" : "none";
      }
      return rows;
    },
    { form, pxPerSecond },
  );
}

// Logo and font requests of the current document that left the cache.
async function countUncached(page, reqs, logoUrls) {
  const timing = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((e) => ({ url: e.name, transferSize: e.transferSize })),
  );
  const isLogo = (url) => logoUrls.has(url);
  const cdpHits = [...reqs.values()].filter(
    (r) => (isLogo(r.url) || isFont(r.url)) && !r.cache && r.status !== 0,
  );
  const rtHits = timing.filter((e) => (isLogo(e.url) || isFont(e.url)) && e.transferSize > 0);
  const urls = new Set([...cdpHits.map((r) => r.url), ...rtHits.map((e) => e.url)]);
  const list = [...urls].map((url) => ({
    url: url.replace(/^https?:\/\/[^/]+/, ""),
    kind: isLogo(url) ? "logo" : "font",
    status: cdpHits.find((r) => r.url === url)?.status ?? null,
    transferSize: rtHits.find((e) => e.url === url)?.transferSize ?? 0,
  }));
  return {
    logos: list.filter((x) => x.kind === "logo").length,
    fonts: list.filter((x) => x.kind === "font").length,
    list,
  };
}

function summarize(rows) {
  const entered = rows.filter((r) => r.enter !== null);
  const late = entered.filter((r) => r.done === null || r.done > r.enter);
  const leads = entered.filter((r) => r.done !== null).map((r) => r.enter - r.done);
  leads.sort((a, b) => a - b);
  return {
    tiles: rows.length,
    entered: entered.length,
    readyBeforeEnter: entered.length - late.length,
    late: late.length,
    completeAtEnter: entered.filter((r) => r.completeAtEnter).length,
    worstLeadMs: leads.length ? Math.round(leads[0]) : null,
    medianLeadMs: leads.length ? Math.round(leads[Math.floor(leads.length / 2)]) : null,
  };
}

const browser = await chromium.launch();
const results = [];
try {
  for (const form of forms) {
    for (let run = 1; run <= runs; run++) {
      const ctx = await newContext(browser, form);
      const logoUrls = new Set();
      const tab = await openPage(ctx);
      const first = await visit(tab.page, tab.reqs, form, logoUrls);
      // Repeat visit in the same tab: a plain navigation to the same URL.
      const sameTab = await visit(tab.page, tab.reqs, form, logoUrls);
      // Repeat visit in a new tab of the same context, once the first tab is
      // closed: the renderer's memory cache is gone, so this is the visitor
      // who comes back later, served by the HTTP cache alone.
      await tab.page.close();
      const tab2 = await openPage(ctx);
      const newTab = await visit(tab2.page, tab2.reqs, form, logoUrls);

      const summary = summarize(first.rows);
      results.push({
        form,
        run,
        summary,
        first: first.requests,
        repeatSameTab: { summary: summarize(sameTab.rows), ...sameTab.requests },
        repeatNewTab: { summary: summarize(newTab.rows), ...newTab.requests },
        rows: first.rows,
      });
      console.log(
        `${form} #${run}: ${summary.readyBeforeEnter}/${summary.entered} logos ready before their tile enters ` +
          `(worst lead ${summary.worstLeadMs} ms, median ${summary.medianLeadMs} ms); ` +
          `first visit ${first.requests.logos} logo + ${first.requests.fonts} font requests; ` +
          `repeat, same tab ${sameTab.requests.logos} + ${sameTab.requests.fonts}; ` +
          `repeat, new tab ${newTab.requests.logos} + ${newTab.requests.fonts}`,
      );
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}

const outDir = path.join(".perf", "logos");
mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, `${tag}.json`);
writeFileSync(
  file,
  JSON.stringify(
    { base: base.replace(/\/\/[^/]*@/, "//"), speed, network: NETWORK, cpu: CPU_RATE, results },
    null,
    2,
  ),
);
console.log(`Written ${file}`);

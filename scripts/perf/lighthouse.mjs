// Runs Lighthouse LH_RUNS times per page and form factor and writes the JSON
// reports to .perf/<LH_TAG>/<page>-<formFactor>-<run>.json.
// Lighthouse's Windows temp-dir cleanup can exit non-zero (EPERM) after a
// successful run, so success is judged by the report file existing.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const LH_CLI = path.join(
  path.dirname(require.resolve("lighthouse/package.json")),
  "cli",
  "index.js",
);

const BASE = process.env.LH_BASE_URL ?? "http://localhost:3100";
// LH_QUERY=a=1 adds a query string to every page; the reports keep their
// usual names, so give the batch its own LH_TAG.
const QUERY = process.env.LH_QUERY ?? "";
const TAG = process.env.LH_TAG ?? "local";
const RUNS = Number(process.env.LH_RUNS ?? 3);
// "blog" is the post, as in every report so far; the index is "blog-index".
const DEFAULT_PAGES = {
  home: "/",
  about: "/about",
  work: "/work",
  blog: "/blog/my-workspace",
  gallery: "/gallery",
};
// The nine case studies, "case-<slug>". They run only when named, or all of
// them through LH_PAGES=cases.
const CASES = [
  "leadbot-ai",
  "ai-powered-ad-creatives",
  "atv-riders",
  "quick-metal-shop-viral-videos",
  "quick-metal-shop-arquiexpo",
  "ai-portfolio",
  "dakoma-roofing",
  "quick-metal-shop-marketing",
  "quick-metal-shop-the-brand-comes-to-life",
];
const ALL_PAGES = {
  ...DEFAULT_PAGES,
  "blog-index": "/blog",
  ...Object.fromEntries(CASES.map((slug) => [`case-${slug}`, `/work/${slug}`])),
};
const ALL_FORMS = ["mobile", "desktop"];

// LH_PAGES=about,gallery,home / LH_FORMS=mobile narrow which pages and form
// factors run, e.g. for a targeted re-check after a fix ("cases" stands for
// the nine case studies). Unset -> the five default pages, both form factors.
const PAGES = process.env.LH_PAGES
  ? Object.fromEntries(
      process.env.LH_PAGES.split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .flatMap((name) => (name === "cases" ? CASES.map((slug) => `case-${slug}`) : [name]))
        .map((name) => {
          if (!(name in ALL_PAGES)) {
            throw new Error(
              `LH_PAGES: unknown page "${name}" (known: ${Object.keys(ALL_PAGES).join(", ")}, cases)`,
            );
          }
          return [name, ALL_PAGES[name]];
        }),
    )
  : DEFAULT_PAGES;
const FORMS = process.env.LH_FORMS
  ? process.env.LH_FORMS.split(",")
      .map((f) => f.trim())
      .filter(Boolean)
  : ALL_FORMS;
for (const f of FORMS) {
  if (!ALL_FORMS.includes(f)) {
    throw new Error(`LH_FORMS: unknown form factor "${f}" (known: ${ALL_FORMS.join(", ")})`);
  }
}

const outDir = path.join(".perf", TAG);
mkdirSync(outDir, { recursive: true });

let headersFile = null;
if (process.env.LH_BYPASS) {
  headersFile = path.join(outDir, "extra-headers.json");
  writeFileSync(
    headersFile,
    JSON.stringify({
      "x-vercel-protection-bypass": process.env.LH_BYPASS,
      "x-vercel-set-bypass-cookie": "true",
    }),
  );
}

const failures = [];
for (const [name, pagePath] of Object.entries(PAGES)) {
  for (const formFactor of FORMS) {
    for (let run = 1; run <= RUNS; run++) {
      const file = path.join(outDir, `${name}-${formFactor}-${run}.json`);
      const args = [
        LH_CLI,
        BASE + pagePath + (QUERY ? `${pagePath.includes("?") ? "&" : "?"}${QUERY}` : ""),
        "--output=json",
        `--output-path=${file}`,
        "--only-categories=performance,accessibility,best-practices,seo",
        "--max-wait-for-load=45000",
        "--quiet",
        "--chrome-flags=--headless=new --no-sandbox",
      ];
      if (formFactor === "desktop") args.push("--preset=desktop");
      if (headersFile) args.push(`--extra-headers=${headersFile}`);
      spawnSync(process.execPath, args, { stdio: "inherit", timeout: 240_000 });
      if (!existsSync(file)) failures.push(`${name}-${formFactor}-${run}`);
    }
  }
}
// The headers file holds the bypass secret; it is not left on disk.
if (headersFile) rmSync(headersFile, { force: true });
if (failures.length) {
  console.error(`Missing reports: ${failures.join(", ")}`);
  process.exit(1);
}
console.log(`Reports written to ${outDir}`);

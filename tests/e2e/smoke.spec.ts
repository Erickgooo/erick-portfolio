import type { ConsoleMessage } from "@playwright/test";
import { expect, test } from "./fixtures";
import { ROUTES } from "./helpers";

// Pre-existing console errors observed on this build, unrelated to the
// harness itself (see docs/perf-baseline.md § "Known console errors").
//
// Chromium's console text for a failed resource load is generic and does not
// include the resource's URL ("Failed to load resource: the server responded
// with a status of 404 (Not Found)" / "... 400 (Bad Request)"), so matching by
// text alone would silently swallow ANY new 404/400 on ANY page. Each entry
// below is therefore matched on the exact text AND the failing resource's
// URL, and (for the gallery-only entries) the route as well — anything that
// doesn't match on all of those still fails the test.
//
// The failing resource's URL comes from `msg.location().url` for a
// "Failed to load resource" message (that's where Chromium puts it — the
// text itself doesn't carry it), and from the message text itself for the
// "Refused to execute script" message (Chromium embeds the URL directly in
// that text). Observed once via a throwaway debug script during development
// (not committed):
//   404 "Failed to load resource...": location().url = "http://localhost:3100/_vercel/insights/script.js"
//
// Firefox and WebKit word some of these messages differently (or don't log
// some of them at all — see docs/perf-baseline.md for the full per-browser
// breakdown observed running this same suite against each browser project).
// Entries below that are worded identically across browsers (and whose text
// still embeds/derives the same `urlIncludes`) are left unscoped; entries
// whose *text* differs per browser carry a `browsers` allow-list so a
// mismatch on one browser can't accidentally swallow a different browser's
// real error.
interface KnownConsoleError {
  text: string;
  /** Substring identifying the failing resource, checked against location().url and, as a
   * fallback, the message text itself (browsers expose the URL differently per message type). */
  urlIncludes: string;
  /** Restrict this exclusion to one route; omit to apply on every page. */
  route?: (typeof ROUTES)[number]["name"];
  /** Restrict this exclusion to these browser projects; omit to apply on every browser. */
  browsers?: ("chromium" | "firefox" | "webkit")[];
}

const KNOWN_CONSOLE_ERRORS: KnownConsoleError[] = [
  // @vercel/analytics requests this script; it exists only when served by
  // Vercel, so it 404s locally and is then refused for its resulting MIME type.
  //
  // The 404 itself is worded identically by all three engines (confirmed via
  // debug script): "Failed to load resource: the server responded with a
  // status of 404 (Not Found)", location().url =
  // "http://localhost:3100/_vercel/insights/script.js" — left unscoped.
  {
    text: "Failed to load resource: the server responded with a status of 404 (Not Found)",
    urlIncludes: "/_vercel/insights/script.js",
  },
  // The follow-up "script refused for its MIME type" message is worded
  // differently by every engine and each embeds the script's URL directly in
  // its own text (location().url is empty/irrelevant for this message type),
  // so each needs its own browser-scoped entry.
  {
    text: "Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/html') is not executable, and strict MIME type checking is enabled.",
    urlIncludes: "/_vercel/insights/script.js",
    browsers: ["chromium"],
  },
  {
    text: '[JavaScript Error: "The resource from “http://localhost:3100/_vercel/insights/script.js” was blocked due to MIME type (“text/html”) mismatch (X-Content-Type-Options: nosniff)." {file: "%PAGE_URL%" line: 0}]',
    urlIncludes: "/_vercel/insights/script.js",
    browsers: ["firefox"],
  },
  {
    text: 'Refused to execute http://localhost:3100/_vercel/insights/script.js as script because "X-Content-Type-Options: nosniff" was given and its Content-Type is not a script MIME type.',
    urlIncludes: "/_vercel/insights/script.js",
    browsers: ["webkit"],
  },
];

function isKnownConsoleError(msg: ConsoleMessage, routeName: string, browserName: string): boolean {
  const text = msg.text();
  const locationUrl = msg.location().url;
  return KNOWN_CONSOLE_ERRORS.some((known) => {
    if (known.route && known.route !== routeName) return false;
    if (
      known.browsers &&
      !known.browsers.includes(browserName as "chromium" | "firefox" | "webkit")
    )
      return false;
    if (!(locationUrl.includes(known.urlIncludes) || text.includes(known.urlIncludes)))
      return false;
    // The Firefox "blocked due to MIME type" message embeds the *page's own*
    // URL (not the vercel script's) in its `file:` suffix, so it can't be
    // matched by an exact literal string across routes — match everything up
    // to that suffix instead.
    if (known.text.includes("%PAGE_URL%")) {
      const [prefix] = known.text.split("%PAGE_URL%");
      return text.startsWith(prefix);
    }
    return text === known.text;
  });
}

for (const route of ROUTES) {
  test(`smoke: ${route.name} renders without console errors`, async ({ page, browserName }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isKnownConsoleError(msg, route.name, browserName))
        errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
}

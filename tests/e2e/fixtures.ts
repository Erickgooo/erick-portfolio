import { test as base, expect } from "@playwright/test";

// WebKit does not treat `http://localhost` (or `127.0.0.1`) as a "potentially
// trustworthy origin" for `upgrade-insecure-requests`, unlike Chromium and
// Firefox. next.config.mjs's production CSP sends `upgrade-insecure-requests`
// (correctly — real HTTPS deployments need it) together with
// Strict-Transport-Security. Under Playwright WebKit against our local
// `next start` server (plain HTTP, per playwright.config.ts), that upgrades
// every subresource the document references — CSS, JS chunks, images — to
// `https://`, which then fails to connect since the local server has no TLS
// listener, breaking every page's rendering.
//
// This fixture strips only the `content-security-policy` and
// `strict-transport-security` response headers from the *document* request,
// and only on WebKit against a localhost/127.0.0.1 baseURL — every other
// resource type, browser, and base URL (e.g. a Vercel Preview deployment) is
// left untouched. Production CSP itself is still verified on the real
// deployment and by the header diff in Task 11; this only works around a
// WebKit-vs-plain-HTTP test environment artifact, not a product behaviour.
interface Fixtures {
  stripCspOnWebkitLocalhost: undefined;
}

export const test = base.extend<Fixtures>({
  stripCspOnWebkitLocalhost: [
    async ({ page, browserName, baseURL }, use) => {
      const host = baseURL ? new URL(baseURL).hostname : "";
      const isLocal = host === "localhost" || host === "127.0.0.1";
      if (browserName === "webkit" && isLocal) {
        await page.route("**/*", async (route) => {
          const request = route.request();
          if (request.resourceType() !== "document") {
            await route.continue();
            return;
          }
          const response = await route.fetch();
          const {
            "content-security-policy": _csp,
            "strict-transport-security": _hsts,
            ...headers
          } = response.headers();
          await route.fulfill({ response, headers });
        });
      }
      await use(undefined);
      // A document still in flight when the test ends (the YouTube player's
      // iframe, for one) would make route.fetch() throw outside any test.
      if (browserName === "webkit" && isLocal) {
        await page.unrouteAll({ behavior: "ignoreErrors" });
      }
    },
    { auto: true },
  ],
});

export { expect };

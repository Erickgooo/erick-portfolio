import { expect, test } from "./fixtures";
import { ROUTES } from "./helpers";

// The one set of tokens the whole site draws from. Later tasks add cases here.

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
      bg: getComputedStyle(document.body).backgroundColor,
    };
  });

test("light theme resolves the shared colour tokens", async ({ page }) => {
  await forceTheme(page, "light");
  await page.goto("/about");
  expect(await tokens(page)).toEqual({
    weak: "#4b5058",
    strong: "#0b0c0e",
    bg: "rgb(244, 245, 247)",
  });
});

test("dark theme resolves the shared colour tokens", async ({ page }) => {
  await forceTheme(page, "dark");
  await page.goto("/about");
  expect(await tokens(page)).toEqual({
    weak: "#a8adb5",
    strong: "#f4f5f7",
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

for (const route of ROUTES) {
  test(`${route.name}: no entrance-animation machinery is left`, async ({ page }) => {
    await page.goto(route.path);
    const state = await page.evaluate(() => ({
      classes: [...document.documentElement.classList],
      nodes: document.querySelectorAll("[data-reveal], [data-mo-io], [data-kinetic-words]").length,
      // Only transform and opacity may move; a running animation on filter is a regression.
      filtered: document
        .getAnimations()
        .filter((a) => {
          const effect = a.effect as KeyframeEffect | null;
          return effect?.getKeyframes().some((k) => "filter" in k && k.filter !== "none");
        }).length,
    }));
    expect(state.classes).not.toContain("mo-io");
    expect(state.classes).not.toContain("mo-ready");
    expect(state.nodes).toBe(0);
    // The Once UI Carousel on /work animates a blur through its own RevealFx.
    // Task 5 replaces that carousel and drops this exemption.
    if (route.name !== "work") expect(state.filtered).toBe(0);
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

test("footer keeps its attribution, linked, in the text colour and underlined", async ({ page }) => {
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

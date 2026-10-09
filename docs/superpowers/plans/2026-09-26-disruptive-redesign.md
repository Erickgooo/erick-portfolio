# Disruptive Redesign Implementation Plan (Plan 2 de 2)
> **CANCELADO desde la Task 14 (2026-10-09).** Erick rechazó en CP2 la dirección «Blueprint → Live System». Las tareas 14–22 no se ejecutan. Sigue el spec `docs/superpowers/specs/2026-10-09-landing-film-home-design.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar la dirección «Blueprint → Live System» (el Nodo de crecimiento) en todas las páginas, con un momento firma por página, sin romper el presupuesto de performance logrado en el Plan 1.

**Architecture:** Primero un sistema de motion CSS-first en `src/components/motion/`: scroll-driven animations con fallback de IntersectionObserver, tiers de dispositivo fijados por un script inline antes del primer paint y View Transitions con un listener global. Luego cada página se reconstruye sobre esas primitivas, un momento firma por commit, medido antes y después. Sin framer-motion. `RevealFx` desaparece del código.

**Tech Stack:** Next.js 15.5.23 App Router, React 19, TypeScript, SCSS modules, Once UI 1.4.x, CSS `animation-timeline` (`view()`/`scroll()`), View Transitions API, `@playwright/test`, Lighthouse 13.5.0 (12.8.2 hasta el 2026-10-09), `web-vitals` (solo devDep para medir INP de laboratorio).

**Spec:** `docs/superpowers/specs/2026-09-26-disruptive-redesign-design.md`, §6, §7, §8, §9, §10 y §11.

**Prerrequisito:** el Plan 1 (`docs/superpowers/plans/2026-09-26-perf-quick-wins.md`) está completo en `perf/quick-wins`. Esta rama se rebasa sobre ella antes de la Task 1:
```bash
# en el worktree .claude/worktrees/disruptive-redesign
git fetch . perf/quick-wins:perf/quick-wins 2>/dev/null || true
git rebase perf/quick-wins
npm ci --no-audit --no-fund
```
Usa del Plan 1: `playwright.config.ts`, `tests/e2e/helpers.ts` (`ROUTES`, `measureCLS`), `scripts/perf/lighthouse.mjs`, `scripts/perf/report.mjs`, `LazyVideo`, `YouTubeFacade`, `routeEnabled`.

## Ejecución y puntos de control

- Modo: **subagent-driven**. Un implementador y un revisor por tarea, más una revisión final de la rama.
- **Si una tarea no pasa la revisión dos veces seguidas: detenerse y reportar a Erick.**
- **Antes de la Task 1:** rebasar sobre `main` si el merge de `perf/quick-wins` ya ocurrió; si no, sobre `perf/quick-wins`. Así el rediseño parte de los assets optimizados.
- **CP2 (tras la Task 13, Fase B + Home):** push de la rama y Preview para que Erick vea el primer momento firma en celular y desktop. **No seguir con Work (Task 14) sin su aprobación.** Entregar un resumen corto: tareas hechas, commits e ideas descartadas.
- **CP3 (Task 22, fin de la Fase D):** Preview final, reporte completo y resumen de fase. Merge solo con aprobación.
- Al cerrar cada fase (B, C, D), resumen corto: tareas hechas, commits e ideas descartadas.

## Global Constraints

- Rama `feat/disruptive-redesign` (worktree `.claude/worktrees/disruptive-redesign`). **Nunca commit a `main`. Merge solo con aprobación explícita de Erick.**
- **Biome gate** antes de cada commit: `npx @biomejs/biome check src --max-diagnostics=0` sin errores **y** `node scripts/quality/biome-gate.mjs HEAD` sin warnings nuevos en los archivos tocados.
- DevDependencies con versión exacta (`npm i -D -E`). Nunca `postinstall` ni `playwright install` en `package.json`.
- Commits atómicos (`feat:`, `perf:`, `fix:`, `test:`, `docs:`, `refactor:`). Cada mensaje termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Gates antes de cada push: `npm run build`, `npx tsc --noEmit` y `npx @biomejs/biome check src` con 0 errores.
- **Solo se animan `transform` y `opacity`.** Nada de width/height/top/left/color/filter en animaciones nuevas.
- Toda animación nueva degrada con `prefers-reduced-motion: reduce` a su estado final (como mucho fades ≤ 150 ms). El IntroLoader queda exento y solo recibe el cambio de §8 del spec (Task 13).
- El elemento LCP de cada página es visible desde el primer frame (opacidad 1, sin máscara ni clip) y nunca depende de JS.
- `data-fx="lite"` = `saveData` **o** `deviceMemory ≤ 2` (si existe) **o** `hardwareConcurrency < 4`. Desactiva parallax, imagen flotante de Work, autoplay de video y efecto magnético. `(pointer: coarse)` es un eje aparte y desactiva solo `Magnetic` y `GlowTrack`.
- Marca: el Cobalto (`#2D5BFF`) solo en CTAs, métricas, el nodo y acentos. No hay gradientes decorativos: el único efecto de luz es el Glow Border (`GlowTrack` vive dentro del anillo de 1px). Hay un único patrón de fondo (Blueprint Grid) al ≤ 8%. Movimientos a 0°, 45° y 90°.
- Copy intocable. Solo se añaden índices numéricos generados desde los datos (`01 / 05`, `01–N`, h2 del blog). Las etiquetas con texto quedan fuera: por defecto, solo números.
- No tocar `.env.local`, secretos, `middleware.ts`, auth ni la lógica del chatbot. CSP y headers idénticos.
- Nombres: la primitiva del spec «KineticHeading» se implementa como `KineticText`, spans que van **dentro** de un `Heading` de Once UI para heredar su tipografía.
- **Presupuesto** (Lighthouse móvil, mediana de 3): Perf ≥ 95, A11y ≥ 95, LCP < 2.0 s, CLS < 0.05, INP lab < 200 ms. First Load JS por ruta ≤ línea base (`/` 311, `/about` 275, `/work` 309, `/blog/[slug]` 312, `/gallery` 286 kB) + 10 kB máximo, con justificación.

### Procedimiento «Perf gate» (lo invocan las tasks por nombre)

`PERF_GATE(<tag>, <pages>, <kbBudget>)`:
1. `npm run build 2>&1 | tee .perf/build-<tag>.txt`: comparar First Load JS de las rutas afectadas con el build del commit anterior (`.perf/build-<prev>.txt`). El Δ debe ser ≤ `<kbBudget>` y el total por ruta ≤ línea base + 10 kB.
2. `npm run start -- -p 3100 &` (si no corre), luego `LH_PAGES=<pages> LH_FORMS=mobile LH_TAG=<tag> npm run perf:lh` y `npm run perf:report -- <tag>`.
3. Si alguna página de `<pages>` incumple el presupuesto: **revertir el efecto** (`git revert` o `git checkout` de los archivos del efecto), añadir una fila a «Ideas descartadas» en `docs/perf-report.md` con la medición y seguir con la siguiente task.
4. Si cumple: añadir una fila a la tabla «Motion ledger» de `docs/perf-report.md` (efecto | técnica | Δ KB | Perf/LCP/CLS/TBT móvil de las páginas afectadas) e incluirla en el commit de la task.

## Review Focus

1. **Navegación con View Transition cuando la ruta tarda > 500 ms (red lenta):** la navegación debe completarse, sin animar la página vieja, y `html.vt-active` no debe quedar pegado. Lo cubre el test `slow navigation skips the transition and still navigates` (Task 9).
2. **Atrás del navegador después de una navegación con transición:** sin `view-transition-name` residuales, con el scroll restaurado y sin transición. Lo cubre `back navigation restores scroll without transition or leftover names` (Task 9).
3. **Cruce del breakpoint de 1024px en Home (rotación o resize de tablet):** el riel aparece o desaparece sin scroll horizontal. Lo cubre `no horizontal overflow at 1023/1024/390px` (Task 11).
4. **Proyecto sin métrica o sin imagen de portada:** la fila del índice mantiene la misma altura y no deja huecos rotos. Lo cubren `tests/unit/projects.spec.ts` y `rows keep a constant height` (Task 14).
5. **Usuario solo con teclado en Work y Gallery:** los estados de `:focus-visible` activan el atenuado, el decode y la imagen. El Dialog atrapa el foco y lo devuelve. Lo cubren `keyboard focus drives the index` (Task 14) y `dialog keeps Once UI focus management` (Task 19).

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `scripts/perf/lighthouse.mjs` | Modify | Soporte de `LH_PAGES` y `LH_FORMS` |
| `scripts/perf/inp.mjs` | Create | INP de laboratorio (web-vitals, CPU 4x, móvil) + tareas largas en scroll |
| `scripts/perf/screens.mjs` | Create | Capturas antes/después por página, tema y viewport |
| `src/components/motion/motionBoot.ts` | Create | Script inline de `<head>`: `data-fx`, `mo-io`, `intro-pending` |
| `src/components/motion/motion.css` | Create | Tokens, keyframes, Reveal, Blueprint Grid, View Transitions, RM |
| `src/components/motion/MotionRuntime.tsx` | Create | Fallback IO + MutationObserver (`is-in`, `is-active`, `mo-ready`) |
| `src/components/motion/intro.ts` | Create | `whenIntroDone(): Promise<void>` |
| `src/components/motion/Reveal.tsx` | Create | Entrada por scroll (server) |
| `src/components/motion/KineticText.tsx` + `.module.scss` | Create | Palabras con translate (server) |
| `src/components/motion/BlueprintLine.tsx` + `.module.scss` | Create | Línea 1px que se traza (server) |
| `src/components/motion/BlueprintFrame.tsx` + `.module.scss` | Create | Marco de 4 líneas + marcas de corte (server) |
| `src/components/motion/decode.ts` | Create | `scrambleFrame()` pura |
| `src/components/motion/DecodeText.tsx` + `.module.scss` | Create | Scramble en overlay `aria-hidden` (client) |
| `src/components/motion/Magnetic.tsx` + `.module.scss` | Create | Atracción ≤ 6px (client) |
| `src/components/motion/GlowTrack.tsx` + `.module.scss` | Create | Brillo dentro del Glow Border (client) |
| `src/components/motion/viewTransition.ts` | Create | `shouldIntercept()`, `vtNameForPath()`, `pickShared()` puras |
| `src/components/motion/ViewTransitions.tsx` | Create | Listener global (client) |
| `src/components/motion/ReadingProgress.tsx` + `.module.scss` | Create | Barra de lectura con nodo (server) |
| `src/components/motion/index.ts` | Create | Barrel |
| `src/app/layout.tsx` | Modify | Script `motion-init`, `motion.css`, `MotionRuntime`, `ViewTransitions`, Blueprint Grid; quitar Spotlight y `RevealFx` |
| `src/components/SpotlightBackground.tsx` / `.module.scss` | Delete | Contradice el Manual §5.3 |
| `src/components/Header.tsx` / `.module.scss` | Modify | `view-transition-name: site-header` + línea de barrido |
| `src/components/IntroLoader.tsx` | Modify | Quitar `intro-pending` al pasar a `leaving`/`done` (1 efecto) |
| `src/utils/projects.ts` | Create | `sortProjects`, `coverImage`, `parseMetric`, `formatIndex` |
| `src/resources/content.tsx` | Modify | `home.headline` como string (mismo texto) |
| `src/components/home/Home.module.scss` | Create | Layout de Home |
| `src/components/home/HomeRail.tsx`, `HomeSection.tsx`, `FeaturedProject.tsx`, `DockFrame.tsx` | Create | Riel, secciones indexadas, ficha técnica, marco del video |
| `src/app/page.tsx` | Modify | Nueva Home |
| `src/components/work/WorkIndex.tsx` + `.module.scss` | Create | Índice numerado + imagen flotante + firma táctil |
| `src/app/work/page.tsx` | Modify | Usa `WorkIndex` |
| `src/app/work/[slug]/page.tsx` | Modify | Hero destino del morph |
| `src/components/mdx/ResultsStats.tsx` | Modify | `DecodeText` en lugar del count-up por frame |
| `src/app/about/page.tsx`, `src/components/about/about.module.scss`, `src/components/about/TableOfContents.tsx` | Modify | Timeline, avatar enmarcado, índice mono con nodo |
| `src/app/blog/[slug]/page.tsx`, `src/components/blog/OnThisPage.tsx`, `src/components/blog/post.module.scss` | Modify / Create | Barra de lectura, h2 numerados, TOC numerado con `transform` |
| `src/components/gallery/GalleryView.tsx`, `src/components/gallery/gallery.module.scss` | Modify / Create | Botones, stagger por columna, cruz de retícula, morph al Dialog |
| `src/components/CallToAction.tsx` | Modify | `GlowTrack` + `Magnetic` |
| `tests/unit/*.spec.ts`, `tests/e2e/*.spec.ts` | Create | Ver cada task |
| `docs/perf-report.md` | Modify | Motion ledger, ideas descartadas, antes/después final |

---

## Fase B — Sistema base de motion

### Task 1: Arnés de medición ampliado (páginas filtrables, INP lab, capturas)

**Files:**
- Modify: `scripts/perf/lighthouse.mjs`
- Create: `scripts/perf/inp.mjs`, `scripts/perf/screens.mjs`
- Modify: `package.json` (devDep `web-vitals`, scripts `perf:inp`, `perf:screens`)

**Interfaces:**
- Produces:
  - `LH_PAGES=home,work` y `LH_FORMS=mobile` en `perf:lh`.
  - `npm run perf:inp` (env `INP_BASE_URL`, default `http://localhost:3100`) imprime una tabla con INP y tareas largas por interacción.
  - `npm run perf:screens -- <tag> <baseUrl>` guarda las capturas en `.perf/screens/<tag>/`.

- [x] **Step 1: `LH_PAGES` / `LH_FORMS` en `scripts/perf/lighthouse.mjs`**

Reemplazar los dos bucles externos:

```js
const ONLY = (process.env.LH_PAGES ?? "").split(",").filter(Boolean);
const FORMS = (process.env.LH_FORMS ?? "mobile,desktop").split(",").filter(Boolean);
const selected = Object.entries(PAGES).filter(([name]) => ONLY.length === 0 || ONLY.includes(name));

const failures = [];
for (const [name, pagePath] of selected) {
  for (const formFactor of FORMS) {
```
(el cuerpo interno no cambia).

- [x] **Step 2: devDep y scripts**

```bash
npm i -D -E web-vitals@4
node -e "console.log(require('./package.json').devDependencies['web-vitals'])"   # sin ^ ni ~
```
En `package.json` → `scripts`:
```json
    "perf:inp": "node scripts/perf/inp.mjs",
    "perf:screens": "node scripts/perf/screens.mjs"
```

- [x] **Step 3: `scripts/perf/inp.mjs`**

```js
// Lab INP: mobile viewport, 4x CPU throttling, real (trusted) Playwright input.
// Reports web-vitals INP per page plus long tasks (>50 ms) observed while scrolling.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium, devices } from "@playwright/test";

const require = createRequire(import.meta.url);
const WEB_VITALS = readFileSync(require.resolve("web-vitals/dist/web-vitals.iife.js"), "utf8");
const BASE = process.env.INP_BASE_URL ?? "http://localhost:3100";

const SCENARIOS = {
  home: async (page) => {
    await page.locator("header a[href='/work']").first().click();
    await page.waitForURL("**/work");
  },
  work: async (page) => {
    await page.locator("[data-work-row] a").first().click();
    await page.waitForURL("**/work/**");
  },
  about: async (page) => {
    await page.getByRole("button", { name: "Toggle ErickBot" }).click();
    await page.getByRole("button", { name: "Toggle ErickBot" }).click();
  },
  blog: async (page) => {
    await page.getByRole("button", { name: /^Copy link to section/ }).first().click();
  },
  gallery: async (page) => {
    await page.locator("[data-gallery-cell]").first().click();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /^Play video:/ }).first().click();
  },
};
const PATHS = { home: "/", work: "/work", about: "/about", blog: "/blog/my-workspace", gallery: "/gallery" };

const browser = await chromium.launch();
const rows = [];
for (const [name, act] of Object.entries(SCENARIOS)) {
  const context = await browser.newContext({ ...devices["Pixel 7"] });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(`${WEB_VITALS};
    window.__inp = 0; window.__long = [];
    webVitals.onINP((m) => { window.__inp = Math.max(window.__inp, m.value); }, { reportAllChanges: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(Math.round(e.duration)); })
      .observe({ type: "longtask", buffered: true });`);
  await page.goto(BASE + PATHS[name]);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(6000); // let the Home intro finish
  await page.evaluate(() => { window.__long = []; });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  const scrollLong = await page.evaluate(() => window.__long.slice());
  await act(page);
  await page.waitForTimeout(1000);
  // Force INP to report: switching visibility flushes the metric.
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  const inp = await page.evaluate(() => window.__inp);
  rows.push({ name, inp, scrollLong });
  await context.close();
}
await browser.close();

console.log("| Page | INP lab (ms) | Long tasks while scrolling (ms) |");
console.log("|---|---|---|");
for (const r of rows) console.log(`| ${r.name} | ${Math.round(r.inp)} | ${r.scrollLong.join(", ") || "none"} |`);
```

- [x] **Step 4: `scripts/perf/screens.mjs`**

```js
// Usage: node scripts/perf/screens.mjs <tag> <baseUrl>
// Full-page screenshots for every page × {mobile, desktop} × {dark, light}.
import { mkdirSync } from "node:fs";
import { chromium, devices } from "@playwright/test";

const [tag, base = "http://localhost:3100"] = process.argv.slice(2);
if (!tag) {
  console.error("usage: screens.mjs <tag> [baseUrl]");
  process.exit(1);
}
const PAGES = { home: "/", about: "/about", work: "/work", blog: "/blog/my-workspace", gallery: "/gallery" };
const out = `.perf/screens/${tag}`;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const [vpName, vp] of Object.entries({ mobile: devices["Pixel 7"], desktop: devices["Desktop Chrome"] })) {
  for (const scheme of ["dark", "light"]) {
    const context = await browser.newContext({ ...vp, colorScheme: scheme, reducedMotion: "reduce" });
    const page = await context.newPage();
    for (const [name, p] of Object.entries(PAGES)) {
      await page.goto(base + p);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(name === "home" ? 6000 : 800);
      await page.screenshot({ path: `${out}/${name}-${vpName}-${scheme}.png`, fullPage: true });
    }
    await context.close();
  }
}
await browser.close();
console.log(`Screens written to ${out}`);
```
`reducedMotion: "reduce"` produce capturas deterministas (estado final de cada animación).

- [x] **Step 5: Capturas «antes» y medición INP de referencia**

```bash
npm run build && (npm run start -- -p 3100 &) 
npm run perf:screens -- before http://localhost:3100
npm run perf:inp | tee .perf/inp-before.txt
LH_FORMS=mobile LH_TAG=redesign-start npm run perf:lh && npm run perf:report -- redesign-start > .perf/lh-redesign-start.md
cp .perf/build-*.txt . 2>/dev/null; npm run build 2>&1 | tee .perf/build-redesign-start.txt | tail -30
```
Expected: capturas en `.perf/screens/before/` y tablas de INP y Lighthouse. Son la referencia de todo el Plan 2.

- [x] **Step 6: Commit**

```bash
git add scripts/perf package.json package-lock.json
git commit -m "test: add page filters, lab INP and screenshot scripts to the perf harness

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `motionBoot` (tiers, fallback, intro-pending), `motion.css` base, Blueprint Grid y retiro de SpotlightBackground

**Files:**
- Create: `src/components/motion/motionBoot.ts`, `src/components/motion/motion.css`, `tests/e2e/motion-boot.spec.ts`
- Modify: `src/app/layout.tsx`
- Delete: `src/components/SpotlightBackground.tsx`, `src/components/SpotlightBackground.module.scss`

**Interfaces:**
- Produces:
  - En `<html>`: atributo `data-fx="full"|"lite"` y clases `mo-io` (sin soporte de `view()` y sin RM), `mo-ready` (la pone `MotionRuntime`, Task 3) e `intro-pending` (Home, pestaña visible).
  - Tokens CSS: `--dur-xs|s|m|l`, `--ease-precise`, `--ease-out`, `--shift-s|m`, `--line`, `--cobalt`.
  - Clase global `.blueprint-bg`.

- [x] **Step 1: Test e2e (falla)**

`tests/e2e/motion-boot.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

const fx = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.dataset.fx);

test("full tier by default on a capable desktop", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
  });
  await page.goto("/about");
  expect(await fx(page)).toBe("full");
});

test("lite tier when deviceMemory <= 2", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 2 });
  });
  await page.goto("/about");
  expect(await fx(page)).toBe("lite");
});

test("lite tier when hardwareConcurrency < 4", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 });
  });
  await page.goto("/about");
  expect(await fx(page)).toBe("lite");
});

test("missing deviceMemory (Safari) is ignored, not treated as low", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => undefined });
  });
  await page.goto("/about");
  expect(await fx(page)).toBe("full");
});

test("intro-pending only on Home and cleared by the 7 s backstop at the latest", async ({ page }) => {
  await page.goto("/about");
  expect(await page.evaluate(() => document.documentElement.classList.contains("intro-pending"))).toBe(false);
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.classList.contains("intro-pending"))).toBe(true);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains("intro-pending")), { timeout: 8000 })
    .toBe(false);
});

test("mo-io matches the absence of view() support", async ({ page }) => {
  await page.goto("/about");
  const { supports, moIo } = await page.evaluate(() => ({
    supports: CSS.supports("animation-timeline: view()"),
    moIo: document.documentElement.classList.contains("mo-io"),
  }));
  expect(moIo).toBe(!supports);
});

test("the page background is a single blueprint grid at <= 8% opacity", async ({ page }) => {
  await page.goto("/about");
  const opacity = await page.evaluate(() => getComputedStyle(document.body, "::before").opacity);
  expect(Number(opacity)).toBeLessThanOrEqual(0.08);
  expect(await page.locator('[class*="spotlightWrapper"]').count()).toBe(0);
});
```

Run: `npm run build && npx playwright test --project=chromium --project=firefox tests/e2e/motion-boot.spec.ts` → FAIL.

- [x] **Step 2: `src/components/motion/motionBoot.ts`**

```ts
/**
 * Runs inline in <head> before first paint (layout.tsx serialises it with
 * Function.prototype.toString), so it must stay self-contained: no imports,
 * no references to anything outside this function body.
 *
 * - data-fx: "lite" on data-saver, <=2 GB RAM (only where the browser exposes
 *   deviceMemory — Safari doesn't, and absence is not treated as low) or <4 cores.
 * - mo-io: the IntersectionObserver fallback for browsers without
 *   `animation-timeline: view()` (Firefox without flag). Never set under reduced
 *   motion. A 3 s watchdog removes it if MotionRuntime never reports ready, so
 *   content can't stay hidden.
 * - intro-pending: Home only, when the tab is visible — the same decision the
 *   IntroLoader makes on a document load. The IntroLoader clears it when its
 *   fade-out starts; the 7 s backstop outlasts its 6.5 s MAX_LIFETIME_MS.
 */
export function motionBoot(): void {
  const root = document.documentElement;
  try {
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
    };
    const saveData = Boolean(nav.connection && nav.connection.saveData);
    const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2;
    const fewCores = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4;
    root.setAttribute("data-fx", saveData || lowMemory || fewCores ? "lite" : "full");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsView = typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()");
    if (!supportsView && !reduce) {
      root.classList.add("mo-io");
      window.setTimeout(() => {
        if (!root.classList.contains("mo-ready")) root.classList.remove("mo-io");
      }, 3000);
    }

    if (window.location.pathname === "/" && !document.hidden) {
      root.classList.add("intro-pending");
      window.setTimeout(() => root.classList.remove("intro-pending"), 7000);
    }
  } catch {
    root.setAttribute("data-fx", "full");
  }
}
```

- [x] **Step 3: `src/components/motion/motion.css` (base; las tasks siguientes añaden secciones)**

```css
/* ─── Motion system — Blueprint → Live System ──────────────────────────────
   CSS-first: scroll-driven animations where supported, an IntersectionObserver
   fallback under html.mo-io, transform/opacity only, and a reduced-motion
   escape hatch for everything (the IntroLoader is exempt by brand decision). */

:root {
  --dur-xs: 150ms;
  --dur-s: 300ms;
  --dur-m: 500ms;
  --dur-l: 700ms;
  --ease-precise: cubic-bezier(0.2, 0, 0, 1);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --shift-s: 8px;
  --shift-m: 16px;
  /* Grafito line for blueprint strokes, and the single brand accent. */
  --line: color-mix(in srgb, #6e7681 55%, transparent);
  --cobalt: #2d5bff;
}

/* ─── Blueprint Grid (Manual §5.3.4) — the ONE background pattern, ≤ 8% ──── */
.blueprint-bg {
  position: relative;
}
.blueprint-bg::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(to right, #6e7681 1px, transparent 1px),
    linear-gradient(to bottom, #6e7681 1px, transparent 1px);
  background-size: 64px 64px;
  opacity: 0.08;
}
```

- [x] **Step 4: `src/app/layout.tsx`**

1. Imports: añadir `import "@/components/motion/motion.css";` después de `import "@/resources/custom.css";` y `import { motionBoot } from "@/components/motion/motionBoot";`. Borrar `RevealFx` del import de Once UI, además de `import { SpotlightBackground } …` y `import spotlightStyles …`.
2. Dentro de `<head>`, después del `theme-init`:
```tsx
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: device tier, motion fallback and intro flags must be set before first paint; the body is our own static function, no user input */}
        <script id="motion-init" dangerouslySetInnerHTML={{ __html: `(${motionBoot.toString()})();` }} />
```
3. En el `<Column as="body" …>`, cambiar `className={spotlightStyles.pageDots}` por `className="blueprint-bg"` y borrar la línea `<SpotlightBackground />`.
4. Borrar los archivos:
```bash
git rm src/components/SpotlightBackground.tsx src/components/SpotlightBackground.module.scss
rg -n "SpotlightBackground|spotlightStyles|pageDots" src   # Expected: sin resultados
```

- [x] **Step 5: El tier lite también desactiva el autoplay de `LazyVideo` (spec §6.2)**

En `src/components/home/LazyVideo.tsx` (Plan 1, Task 6), `canAutoplay()` pasa a leer el tier que fija `motionBoot`:
```tsx
function canAutoplay(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  // data-fx="lite" already covers saveData, <=2 GB RAM and <4 cores (motionBoot).
  return document.documentElement.dataset.fx !== "lite";
}
```
Borrar el tipo `NetworkInformationLike`, que queda sin uso. Añadir a `tests/e2e/lazy-video.spec.ts`:
```ts
  test("lite tier: no autoplay, play button offered", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 });
    });
    await page.goto("/");
    const wrap = page.locator('[data-testid="home-video"]');
    await wrap.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    expect(await wrap.locator("video").evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await expect(wrap.getByRole("button", { name: /play/i })).toBeVisible();
  });
```
(dentro del `test.describe("home video", …)`).

- [x] **Step 6: Verificar**

```bash
npm run build && npx playwright test --project=chromium --project=firefox --project=webkit tests/e2e/motion-boot.spec.ts tests/e2e/lazy-video.spec.ts tests/e2e/smoke.spec.ts
```
Expected: PASS. En Firefox, `mo-io` presente. Mientras no exista `MotionRuntime` (Task 3), el watchdog la quita a los 3 s; el test `mo-io matches…` lee el valor antes de eso.

- [x] **Step 7: Perf gate y commit**

`PERF_GATE(task02-boot, home,about, 0)`: esperado ≈ −0.5 kB (se va el JS del Spotlight y su loop de rAF).

```bash
git add src/components/motion/motionBoot.ts src/components/motion/motion.css src/app/layout.tsx src/components/home/LazyVideo.tsx tests/e2e/motion-boot.spec.ts tests/e2e/lazy-video.spec.ts docs/perf-report.md
git commit -m "feat: add motion boot flags and blueprint grid; remove the global spotlight

The page-wide radial spotlight contradicted Manual §5.3 (light only lives in the
Glow Border) and ran a permanent requestAnimationFrame loop. The dot texture is
replaced by a single Blueprint Grid at 8%, since patterns must not be combined.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: `Reveal` + `MotionRuntime` (fallback IO) + reglas de reduced motion

**Files:**
- Create: `src/components/motion/Reveal.tsx`, `src/components/motion/MotionRuntime.tsx`, `src/components/motion/index.ts`, `tests/e2e/reveal.spec.ts`
- Modify: `src/components/motion/motion.css` (sección Reveal), `src/app/layout.tsx` (montar `MotionRuntime`)

**Interfaces:**
- Produces:
  - `<Reveal as? direction?: "up" | "left" index?: number className? style? id?>`: renderiza `data-reveal` y `--i`.
  - `<MotionRuntime />`: con `html.mo-io`, añade `.is-in` una vez a `[data-reveal]` y `[data-mo-io]`, alterna `.is-active` en `[data-mo-band]` (banda central) y marca `html.mo-ready`.

- [x] **Step 1: Test e2e (falla)**

`tests/e2e/reveal.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

async function scrollThrough(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 250) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
  });
}

test("every [data-reveal] ends fully visible after scrolling through the page", async ({ page }) => {
  await page.goto("/about");
  await scrollThrough(page);
  await page.waitForTimeout(700);
  const offenders = await page.$$eval("[data-reveal]", (els) =>
    els
      .map((el) => {
        el.scrollIntoView({ block: "center" });
        return el;
      })
      .filter((el) => Number(getComputedStyle(el).opacity) < 0.99)
      .map((el) => el.outerHTML.slice(0, 80)),
  );
  expect(offenders).toEqual([]);
});

test("elements visible at load are not stuck mid-fade", async ({ page }) => {
  await page.goto("/about");
  await page.waitForTimeout(300);
  const inView = await page.$$eval("[data-reveal]", (els) =>
    els
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight * 0.6;
      })
      .map((el) => Number(getComputedStyle(el).opacity)),
  );
  for (const o of inView) expect(o).toBeGreaterThan(0.99);
});

test("firefox uses the IntersectionObserver fallback", async ({ page, browserName }) => {
  test.skip(browserName !== "firefox", "fallback path is Firefox-specific");
  await page.goto("/about");
  await expect.poll(() => page.evaluate(() => document.documentElement.className)).toContain("mo-ready");
  await scrollThrough(page);
  const missing = await page.$$eval("[data-reveal]:not(.is-in)", (els) => els.length);
  expect(missing).toBe(0);
});

test("reduced motion: nothing is transformed or faded", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about");
  const moving = await page.$$eval("[data-reveal]", (els) =>
    els.filter((el) => {
      const cs = getComputedStyle(el);
      return cs.transform !== "none" || Number(cs.opacity) < 1;
    }).length,
  );
  expect(moving).toBe(0);
});
```

Estos tests necesitan al menos un `[data-reveal]` en `/about`. El Step 5 añade uno temporal, que se queda como `Reveal` real en la Task 16.

Run: `npm run build && npx playwright test --project=chromium --project=firefox tests/e2e/reveal.spec.ts` → FAIL.

- [x] **Step 2: Sección Reveal en `motion.css`**

```css
/* ─── Reveal ───────────────────────────────────────────────────────────── */
@keyframes mo-reveal-up {
  from {
    opacity: 0;
    transform: translateY(var(--shift-m));
    animation-timing-function: var(--ease-out);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes mo-reveal-left {
  from {
    opacity: 0;
    transform: translateX(calc(var(--shift-m) * -1));
    animation-timing-function: var(--ease-out);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-reveal] {
      animation: mo-reveal-up linear both;
      animation-timeline: view();
      /* Elements already on screen at load finish immediately (spec 6.3 / adj. 5). */
      animation-range: entry calc(var(--i, 0) * 4%) entry calc(60% + var(--i, 0) * 4%);
    }
    [data-reveal="left"] {
      animation-name: mo-reveal-left;
    }
  }
}

/* Fallback: html.mo-io is set only without view() support and without RM. */
html.mo-io [data-reveal] {
  transition:
    opacity var(--dur-m) var(--ease-out),
    transform var(--dur-m) var(--ease-out);
  transition-delay: calc(var(--i, 0) * 60ms);
}
html.mo-io [data-reveal]:not(.is-in) {
  opacity: 0;
  transform: translateY(var(--shift-m));
}
html.mo-io [data-reveal="left"]:not(.is-in) {
  transform: translateX(calc(var(--shift-m) * -1));
}

/* ─── Reduced motion: final state, always ─────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  [data-reveal],
  [data-mo-io],
  [data-mo-band] {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

- [x] **Step 3: `src/components/motion/Reveal.tsx`**

```tsx
import type { CSSProperties, ElementType, ReactNode } from "react";

interface RevealProps {
  as?: ElementType;
  /** Entry direction on the 0°/90° grid. */
  direction?: "up" | "left";
  /** Stagger slot: shifts the view() range by 4% (or the IO fallback by 60 ms) per step. */
  index?: number;
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Scroll-driven entry (server component, no JS). Uses `animation-timeline: view()`;
 * browsers without it get the MotionRuntime IntersectionObserver fallback. Content
 * is visible without JS: the hidden state only exists under html.mo-io.
 */
export function Reveal({ as: Tag = "div", direction = "up", index = 0, id, className, style, children }: RevealProps) {
  return (
    <Tag
      id={id}
      data-reveal={direction === "left" ? "left" : ""}
      className={className}
      style={{ "--i": index, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
```

- [x] **Step 4: `src/components/motion/MotionRuntime.tsx` e `index.ts`**

```tsx
"use client";

import { useEffect } from "react";

const ONCE = "[data-reveal]:not(.is-in), [data-mo-io]:not(.is-in)";
const BAND = "[data-mo-band]";

/**
 * IntersectionObserver fallback for browsers without scroll-driven animations.
 * Inert unless the head script set html.mo-io. Watches nodes added by client
 * navigations too (MutationObserver), then flags html.mo-ready so the head
 * script's 3 s watchdog doesn't strip the fallback.
 */
export function MotionRuntime() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("mo-io")) return;

    const once = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            once.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    const band = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.classList.toggle("is-active", entry.isIntersecting);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );

    const scan = (scope: ParentNode) => {
      for (const el of scope.querySelectorAll(ONCE)) once.observe(el);
      for (const el of scope.querySelectorAll(BAND)) band.observe(el);
    };
    scan(document);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(ONCE)) once.observe(node);
          if (node.matches(BAND)) band.observe(node);
          scan(node);
        }
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    root.classList.add("mo-ready");

    return () => {
      once.disconnect();
      band.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
```

```ts
// src/components/motion/index.ts
export { Reveal } from "./Reveal";
export { MotionRuntime } from "./MotionRuntime";
```

- [x] **Step 5: Montar `MotionRuntime` y un `Reveal` en About**

- `layout.tsx`: `import { MotionRuntime } from "@/components/motion";` y `<MotionRuntime />` justo después de `<Footer />`.
- `src/app/about/page.tsx`: envolver el bloque de la intro (`<Column fillWidth marginBottom="xl"><Text …>{about.intro.description}</Text></Column>`) con `<Reveal>…</Reveal>` (import desde `@/components/motion`).

- [x] **Step 6: Verificar**

```bash
npm run build && npx playwright test --project=chromium --project=mobile-chromium --project=firefox --project=webkit tests/e2e/reveal.spec.ts tests/e2e/smoke.spec.ts
```
Expected: PASS (el test de Firefox solo corre allí).

- [x] **Step 7: Perf gate y commit**

`PERF_GATE(task03-reveal, about, 0.8)`.

```bash
git add src/components/motion src/app/layout.tsx src/app/about/page.tsx tests/e2e/reveal.spec.ts docs/perf-report.md
git commit -m "feat: add scroll-driven Reveal with IntersectionObserver fallback

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `KineticText`

**Files:**
- Create: `src/components/motion/KineticText.tsx`, `src/components/motion/KineticText.module.scss`, `tests/e2e/kinetic.spec.ts`
- Modify: `src/components/motion/index.ts`, `src/resources/custom.css` (utilidad `.sr-only`)

**Interfaces:**
- Produces: `<KineticText text: string mode?: "load" | "view" />`, que renderiza spans para usar **dentro** de un `Heading`/`Text`. No usarlo en h2 que alimenten `useHeadingLinks` (blog), porque su `textContent` quedaría duplicado.

- [x] **Step 1: Test e2e (falla)**

`tests/e2e/kinetic.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

const HEADLINE = "I Build Marketing Infrastructure From Zero. And Make It Outperform Full Departments.";

test("h1 keeps its exact accessible name", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(HEADLINE);
});

test("animated words are aria-hidden and separated by real spaces", async ({ page }) => {
  await page.goto("/");
  const words = page.locator("h1 [data-kinetic-words]");
  await expect(words).toHaveAttribute("aria-hidden", "true");
  expect(await words.textContent()).toBe(HEADLINE);
});

test("copying the visible headline yields the text once, with spaces", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "selection API assertion is Chromium-only");
  await page.goto("/");
  const copied = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    if (!h1) return "";
    const range = document.createRange();
    range.selectNodeContents(h1);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    return sel?.toString().replace(/\s+/g, " ").trim() ?? "";
  });
  expect(copied).toBe(HEADLINE);
});

test("h1 is fully opaque and unclipped from the first frame", async ({ page }) => {
  await page.goto("/");
  const state = await page.$eval("h1", (h) => {
    const words = [...h.querySelectorAll<HTMLElement>("[data-kinetic-word]")];
    return {
      h1Opacity: getComputedStyle(h).opacity,
      wordOpacities: words.map((w) => getComputedStyle(w).opacity),
      clip: getComputedStyle(h).overflow,
    };
  });
  expect(state.h1Opacity).toBe("1");
  expect(state.wordOpacities.every((o) => o === "1")).toBe(true);
  expect(state.clip).not.toBe("hidden");
});
```
Estos tests dependen de que la Home use `KineticText` (Task 10). Hasta entonces, marcarlos como `test.fixme` y quitar el `fixme` en la Task 10. En esta task se verifica con el Step 4.

- [x] **Step 2: `.sr-only` en `src/resources/custom.css`**

```css
/* Visually hidden, still read by assistive tech. user-select:none keeps copy /
   paste from duplicating text rendered twice (e.g. KineticText). */
.sr-only {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
  user-select: none;
}
```

- [x] **Step 3: `KineticText.tsx` + `KineticText.module.scss`**

```tsx
import { type CSSProperties, Fragment } from "react";
import styles from "./KineticText.module.scss";

interface KineticTextProps {
  text: string;
  /** "load": plays on first paint (paused while html.intro-pending). "view": scroll-driven. */
  mode?: "load" | "view";
}

/**
 * Word-by-word kinetic type (spec «KineticHeading»). Render it INSIDE a Once UI
 * Heading so typography is inherited. The real text lives once in an sr-only span;
 * the animated copy is aria-hidden and keeps real spaces between words, so SEO,
 * screen readers and copy/paste all get the exact copy. Words only translate —
 * they are opaque and unclipped from the first frame, so the heading can be LCP.
 */
export function KineticText({ text, mode = "load" }: KineticTextProps) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span
        aria-hidden="true"
        data-kinetic-words=""
        data-mo-io={mode === "view" ? "" : undefined}
        className={`${styles.words} ${mode === "view" ? styles.view : styles.load}`}
      >
        {words.map((word, i) => (
          <Fragment key={`${i}-${word}`}>
            <span data-kinetic-word="" className={styles.word} style={{ "--w": i } as CSSProperties}>
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </>
  );
}
```

```scss
.words {
  display: inline;
}

.word {
  display: inline-block;
}

@keyframes kinetic-in {
  from {
    transform: translateY(0.35em);
  }
  to {
    transform: none;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .load .word {
    animation: kinetic-in var(--dur-m) var(--ease-out) both;
    animation-delay: calc(var(--w) * 40ms);
  }

  :global(html.intro-pending) .load .word {
    animation-play-state: paused;
  }

  @supports (animation-timeline: view()) {
    .view .word {
      animation: kinetic-in linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 50%;
    }
  }

  :global(html.mo-io) .view .word {
    transition: transform var(--dur-m) var(--ease-out);
    transition-delay: calc(var(--w) * 40ms);
  }

  :global(html.mo-io) .view:not(:global(.is-in)) .word {
    transform: translateY(0.35em);
  }
}
```

- [x] **Step 4: Verificación aislada**

Añadir `export { KineticText } from "./KineticText";` a `index.ts`. Uso temporal en `/about`: `<Heading …>{person.name}</Heading>` → `<Heading …><KineticText text={person.name} /></Heading>`.
```bash
npm run build && npx playwright test --project=chromium tests/e2e/smoke.spec.ts
```
Comprobación manual en `/about`: el h1 es visible desde el primer frame y las palabras suben 0.35em. En DevTools, el árbol de accesibilidad muestra el h1 con el nombre «Erick Mahecha».

- [x] **Step 5: Perf gate y commit**

`PERF_GATE(task04-kinetic, about, 0.1)` (0 kB de JS: server component).

```bash
git add src/components/motion src/resources/custom.css src/app/about/page.tsx tests/e2e/kinetic.spec.ts docs/perf-report.md
git commit -m "feat: add KineticText (word translate on visible text, sr-only source)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: `BlueprintLine`, `BlueprintFrame` y `ReadingProgress`

**Files:**
- Create: `src/components/motion/BlueprintLine.tsx` + `.module.scss`, `src/components/motion/BlueprintFrame.tsx` + `.module.scss`, `src/components/motion/ReadingProgress.tsx` + `.module.scss`
- Modify: `src/components/motion/index.ts`

**Interfaces:**
- Produces:
  - `<BlueprintLine orientation?: "h" | "v" origin?: "start" | "end" trigger?: "view" | "load" className? style? />`
  - `<BlueprintFrame trigger?: "view" | "load" className? />`: 4 líneas y 4 marcas de corte; el padre debe tener `position: relative`.
  - `<ReadingProgress />`: fija arriba, `scroll(root)`; se oculta si no hay soporte.

- [x] **Step 1: `BlueprintLine`**

```tsx
import styles from "./BlueprintLine.module.scss";

interface BlueprintLineProps {
  orientation?: "h" | "v";
  /** Which end the stroke grows from. */
  origin?: "start" | "end";
  /** "view": draws as it scrolls in. "load": draws on first paint (paused during the intro). */
  trigger?: "view" | "load";
  className?: string;
  style?: React.CSSProperties;
}

/** 1px Grafito guide line that draws itself with scaleX/scaleY. Out of flow (absolute). */
export function BlueprintLine({ orientation = "h", origin = "start", trigger = "view", className, style }: BlueprintLineProps) {
  return (
    <span
      aria-hidden="true"
      data-mo-io={trigger === "view" ? "" : undefined}
      className={[styles.line, styles[orientation], styles[origin], styles[trigger], className].filter(Boolean).join(" ")}
      style={style}
    />
  );
}
```

```scss
.line {
  position: absolute;
  display: block;
  background: var(--line);
  pointer-events: none;
}
.h {
  height: 1px;
}
.v {
  width: 1px;
}
.h.start {
  transform-origin: left center;
}
.h.end {
  transform-origin: right center;
}
.v.start {
  transform-origin: center top;
}
.v.end {
  transform-origin: center bottom;
}

@keyframes draw-x {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
@keyframes draw-y {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .load.h {
    animation: draw-x var(--dur-l) var(--ease-precise) both;
  }
  .load.v {
    animation: draw-y var(--dur-l) var(--ease-precise) both;
  }
  :global(html.intro-pending) .load {
    animation-play-state: paused;
  }

  @supports (animation-timeline: view()) {
    .view.h {
      animation: draw-x linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 80%;
    }
    .view.v {
      animation: draw-y linear both;
      animation-timeline: view();
      animation-range: entry 0% cover 50%;
    }
  }

  :global(html.mo-io) .view {
    transition: transform var(--dur-l) var(--ease-precise);
  }
  :global(html.mo-io) .view.h:not(:global(.is-in)) {
    transform: scaleX(0);
  }
  :global(html.mo-io) .view.v:not(:global(.is-in)) {
    transform: scaleY(0);
  }
}
```

- [x] **Step 2: `BlueprintFrame`**

```tsx
import styles from "./BlueprintFrame.module.scss";
import { BlueprintLine } from "./BlueprintLine";

interface BlueprintFrameProps {
  trigger?: "view" | "load";
  className?: string;
}

/**
 * Blueprint frame: each edge draws from a corner, clockwise, plus four 90° crop
 * marks. Absolutely positioned at inset 0 — the parent must be position:relative
 * and provide its own padding, so nothing overflows the viewport gutter.
 */
export function BlueprintFrame({ trigger = "load", className }: BlueprintFrameProps) {
  return (
    <span aria-hidden="true" className={`${styles.frame} ${className ?? ""}`}>
      <BlueprintLine trigger={trigger} orientation="h" origin="start" className={styles.top} />
      <BlueprintLine trigger={trigger} orientation="v" origin="start" className={styles.right} />
      <BlueprintLine trigger={trigger} orientation="h" origin="end" className={styles.bottom} />
      <BlueprintLine trigger={trigger} orientation="v" origin="end" className={styles.left} />
      <span className={`${styles.mark} ${styles.tl}`} />
      <span className={`${styles.mark} ${styles.tr}`} />
      <span className={`${styles.mark} ${styles.bl}`} />
      <span className={`${styles.mark} ${styles.br}`} />
    </span>
  );
}
```

```scss
.frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.top {
  top: 0;
  left: 0;
  right: 0;
}
.bottom {
  bottom: 0;
  left: 0;
  right: 0;
  animation-delay: 160ms !important;
}
.right {
  top: 0;
  bottom: 0;
  right: 0;
  animation-delay: 80ms !important;
}
.left {
  top: 0;
  bottom: 0;
  left: 0;
  animation-delay: 240ms !important;
}

/* 12px L-shaped crop marks, 90° only (Manual §2.2 geometry). */
.mark {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: var(--scheme-neutral-800, #c7ccd1);
  border-style: solid;
  border-width: 0;
}
.tl {
  top: -6px;
  left: -6px;
  border-top-width: 1px;
  border-left-width: 1px;
}
.tr {
  top: -6px;
  right: -6px;
  border-top-width: 1px;
  border-right-width: 1px;
}
.bl {
  bottom: -6px;
  left: -6px;
  border-bottom-width: 1px;
  border-left-width: 1px;
}
.br {
  bottom: -6px;
  right: -6px;
  border-bottom-width: 1px;
  border-right-width: 1px;
}
```
Las marcas sobresalen 6px: el padre debe tener un padding horizontal ≥ 8px y la página ≥ 16px de gutter. La Task 11 lo verifica con el test de overflow.

- [x] **Step 3: `ReadingProgress`**

```tsx
import styles from "./ReadingProgress.module.scss";

/** Reading progress: a 1px Cobalto stroke with the node riding its tip. Pure CSS (scroll(root)). */
export function ReadingProgress() {
  return (
    <span aria-hidden="true" className={styles.bar}>
      <span className={styles.fill} />
      <span className={styles.node} />
    </span>
  );
}
```

```scss
.bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  z-index: 10;
  pointer-events: none;
  display: none;
}

@supports (animation-timeline: scroll()) {
  .bar {
    display: block;
  }
}

.fill {
  position: absolute;
  inset: 0;
  background: var(--cobalt);
  transform-origin: left center;
  animation: progress-fill linear both;
  animation-timeline: scroll(root);
}

.node {
  position: absolute;
  top: -4px;
  left: 0;
  width: 9px;
  height: 9px;
  background: var(--cobalt);
  box-shadow: var(--glow-border);
  animation: progress-node linear both;
  animation-timeline: scroll(root);
}

@keyframes progress-fill {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
@keyframes progress-node {
  from {
    transform: translateX(0) rotate(45deg);
  }
  to {
    transform: translateX(calc(100vw - 9px)) rotate(45deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .node {
    display: none;
  }
}
```

- [x] **Step 4: Exportar y verificar**

`index.ts`: `export { BlueprintLine } from "./BlueprintLine"; export { BlueprintFrame } from "./BlueprintFrame"; export { ReadingProgress } from "./ReadingProgress";`

```bash
npm run build && npx tsc --noEmit && npx @biomejs/biome check src/components/motion
```
Su comportamiento visual lo verifican las Tasks 10–18.

- [x] **Step 5: Commit**

```bash
git add src/components/motion
git commit -m "feat: add BlueprintLine, BlueprintFrame and ReadingProgress primitives

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: `DecodeText`

**Files:**
- Create: `src/components/motion/decode.ts`, `src/components/motion/intro.ts`, `src/components/motion/DecodeText.tsx` + `.module.scss`, `tests/unit/decode.spec.ts`, `tests/e2e/decode.spec.ts`
- Modify: `src/components/motion/index.ts`

**Interfaces:**
- Produces:
  - `scrambleFrame(target: string, progress: number, rand: () => number): string`
  - `whenIntroDone(): Promise<void>`
  - `<DecodeText value: string trigger?: "view" | "manual" active?: boolean duration?: number className? />`

- [x] **Step 1: Tests unitarios (fallan)**

`tests/unit/decode.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { scrambleFrame } from "@/components/motion/decode";

const seeded = (seed = 1) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

test("progress 1 returns the exact value", () => {
  expect(scrambleFrame("$3.45", 1, seeded())).toBe("$3.45");
  expect(scrambleFrame("338K+", 1, seeded())).toBe("338K+");
});

test("keeps length and every non-alphanumeric character in place", () => {
  const out = scrambleFrame("$3.45", 0, seeded());
  expect(out).toHaveLength(5);
  expect(out[0]).toBe("$");
  expect(out[2]).toBe(".");
});

test("digits scramble to digits and letters to uppercase letters", () => {
  const out = scrambleFrame("92x", 0, seeded(7));
  expect(out[0]).toMatch(/\d/);
  expect(out[1]).toMatch(/\d/);
  expect(out[2]).toMatch(/[A-Z]/);
});

test("resolves left to right", () => {
  const out = scrambleFrame("12345", 0.6, () => 0.99);
  expect(out.slice(0, 3)).toBe("123");
});
```

Run: `npx playwright test --project=unit tests/unit/decode.spec.ts` → FAIL.

- [x] **Step 2: `decode.ts` e `intro.ts`**

```ts
// src/components/motion/decode.ts
const DIGITS = "0123456789";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * One frame of the decode effect: characters left of `progress` show their final
 * value; the rest scramble within their class (digit→digit, letter→A–Z).
 * Punctuation, symbols and spaces never move, so the width never changes.
 */
export function scrambleFrame(target: string, progress: number, rand: () => number): string {
  const resolved = Math.floor(target.length * Math.min(Math.max(progress, 0), 1));
  let out = "";
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    if (i < resolved) out += ch;
    else if (/\d/.test(ch)) out += DIGITS[Math.floor(rand() * DIGITS.length)];
    else if (/[a-z]/i.test(ch)) out += LETTERS[Math.floor(rand() * LETTERS.length)];
    else out += ch;
  }
  return out;
}
```

```ts
// src/components/motion/intro.ts
/** Resolves once html.intro-pending is gone (immediately if it never was). */
export function whenIntroDone(): Promise<void> {
  const root = document.documentElement;
  if (!root.classList.contains("intro-pending")) return Promise.resolve();
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (!root.classList.contains("intro-pending")) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  });
}
```

- [x] **Step 3: Tests unitarios en verde**

Run: `npx playwright test --project=unit tests/unit/decode.spec.ts` → 4 passed.

- [x] **Step 4: `DecodeText.tsx` + `.module.scss`**

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./DecodeText.module.scss";
import { scrambleFrame } from "./decode";
import { whenIntroDone } from "./intro";

interface DecodeTextProps {
  value: string;
  /** "view": once, when 60% visible (after the intro). "manual": every time `active` turns true. */
  trigger?: "view" | "manual";
  active?: boolean;
  duration?: number;
  className?: string;
}

/**
 * Mono metric that "decodes" into place. The real value stays in the DOM and is
 * what assistive tech reads; the scramble runs in an aria-hidden overlay written
 * directly to the DOM (no React re-render per frame). No aria-live.
 */
export function DecodeText({ value, trigger = "view", active = false, duration = 600, className }: DecodeTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const fxRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  const [running, setRunning] = useState(false);

  const run = useCallback(() => {
    const fx = fxRef.current;
    if (!fx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(frameRef.current);
    const start = performance.now();
    setRunning(true);
    const tick = (now: number) => {
      const p = (now - start) / duration;
      if (p >= 1) {
        fx.textContent = "";
        setRunning(false);
        return;
      }
      fx.textContent = scrambleFrame(value, p, Math.random);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [value, duration]);

  useEffect(() => {
    if (trigger !== "view") return;
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          whenIntroDone().then(run);
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [trigger, run]);

  useEffect(() => {
    if (trigger === "manual" && active) run();
  }, [trigger, active, run]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  return (
    <span ref={rootRef} className={`${styles.root} ${className ?? ""}`} data-running={running ? "" : undefined}>
      <span className={styles.value}>{value}</span>
      <span ref={fxRef} className={styles.fx} aria-hidden="true" />
    </span>
  );
}
```

```scss
.root {
  position: relative;
  display: inline-block;
  font-family: var(--font-code), monospace;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.fx {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
}
.root[data-running] .value {
  opacity: 0;
}
.root[data-running] .fx {
  opacity: 1;
}
```

- [x] **Step 5: Test e2e**

`tests/e2e/decode.spec.ts` (usa las stats de Home, que la Task 10 convierte; hasta entonces `test.fixme`):

```ts
import { expect, test } from "@playwright/test";

test("metrics expose their real value to assistive tech, overlay is aria-hidden", async ({ page }) => {
  await page.goto("/");
  const stat = page.locator("[data-home-stats] li").first();
  await expect(stat).toContainText("338K+");
  await expect(stat.locator("[aria-hidden='true']")).toHaveCount(1);
  expect(await stat.locator("[aria-live]").count()).toBe(0);
});

test("reduced motion shows the final value without scrambling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForTimeout(7000);
  const running = await page.locator("[data-home-stats] [data-running]").count();
  expect(running).toBe(0);
});
```

- [x] **Step 6: Exportar, verificar y commit**

`index.ts`: `export { DecodeText } from "./DecodeText";`
```bash
npx playwright test --project=unit && npm run build && npx tsc --noEmit
git add src/components/motion tests/unit/decode.spec.ts tests/e2e/decode.spec.ts
git commit -m "feat: add DecodeText (aria-hidden scramble overlay over the real value)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: `Magnetic` y `GlowTrack`

**Files:**
- Create: `src/components/motion/Magnetic.tsx` + `.module.scss`, `src/components/motion/GlowTrack.tsx` + `.module.scss`, `tests/e2e/pointer-fx.spec.ts`
- Modify: `src/components/motion/index.ts`

**Interfaces:**
- Produces:
  - `<Magnetic strength?: number>{children}</Magnetic>`
  - `<GlowTrack className? radius?: string>{children}</GlowTrack>`

- [x] **Step 1: `Magnetic`**

```tsx
"use client";

import { type ReactNode, useEffect, useRef } from "react";
import styles from "./Magnetic.module.scss";

function enabled(): boolean {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    document.documentElement.dataset.fx !== "lite"
  );
}

/** Pulls its child up to `strength` px toward the pointer (fine pointers, full tier only). */
export function Magnetic({ children, strength = 6 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled()) return;
    let rect = el.getBoundingClientRect();
    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onEnter = () => {
      rect = el.getBoundingClientRect();
      el.style.transition = "transform 80ms linear";
    };
    const onMove = (e: PointerEvent) => {
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      x = Math.max(-1, Math.min(1, dx)) * strength;
      y = Math.max(-1, Math.min(1, dy)) * strength;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      el.style.transition = "transform var(--dur-s) var(--ease-out)";
      if (!frame) frame = requestAnimationFrame(apply);
    };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <span ref={ref} className={styles.magnetic}>
      {children}
    </span>
  );
}
```

```scss
.magnetic {
  display: inline-flex;
}
```

- [x] **Step 2: `GlowTrack`**

```tsx
"use client";

import { type ReactNode, useEffect, useRef } from "react";
import styles from "./GlowTrack.module.scss";

/**
 * The Glow Border (Manual §5.3.3) with a highlight that follows the pointer —
 * but only INSIDE the 1px ring: a static mask confines the moving highlight to
 * the border, which is the one place the manual allows light. The highlight
 * moves with transform only. Fine pointers only; touch shows the static ring.
 */
export function GlowTrack({ children, className }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const spot = spotRef.current;
    if (!root || !spot || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      spot.style.transform = `translate3d(${x - 160}px, ${y - 160}px, 0)`;
    };
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    root.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={rootRef} className={`${styles.track} ${className ?? ""}`}>
      {children}
      <span aria-hidden="true" className={styles.ring}>
        <span ref={spotRef} className={styles.spot} />
      </span>
    </div>
  );
}
```

```scss
.track {
  position: relative;
  border-radius: var(--radius-l, 12px);
  box-shadow: var(--glow-border);
}

/* Static mask: only the 1px border band is painted. */
.ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  pointer-events: none;
  overflow: hidden;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box exclude,
    linear-gradient(#000 0 0);
}

.spot {
  position: absolute;
  top: 0;
  left: 0;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle closest-side, rgba(45, 91, 255, 0.9), transparent);
  opacity: 0;
  transition: opacity var(--dur-s) var(--ease-out);
}

@media (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .track:hover .spot {
    opacity: 1;
  }
}
```

- [x] **Step 3: Test e2e**

`tests/e2e/pointer-fx.spec.ts` (el CTA de Home usa ambos desde la Task 12; hasta entonces `test.fixme`):

```ts
import { devices, expect, test } from "@playwright/test";

test("magnetic CTA moves at most 6px toward the pointer on desktop", async ({ page }) => {
  await page.goto("/");
  const cta = page.getByRole("link", { name: "Schedule a call" }).last();
  await cta.scrollIntoViewIfNeeded();
  const box = await cta.boundingBox();
  if (!box) throw new Error("no CTA");
  await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2);
  await page.waitForTimeout(200);
  const t = await cta.evaluate((el) => getComputedStyle(el.parentElement as Element).transform);
  const m = new DOMMatrix(t);
  expect(Math.abs(m.m41)).toBeLessThanOrEqual(6);
  expect(Math.abs(m.m41)).toBeGreaterThan(0);
});

test.describe("touch devices", () => {
  test.use({ ...devices["Pixel 7"] });
  test("no magnetic transform on coarse pointers", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: "Schedule a call" }).last();
    await cta.scrollIntoViewIfNeeded();
    await cta.tap();
    const t = await cta.evaluate((el) => getComputedStyle(el.parentElement as Element).transform);
    expect(t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);
  });
});
```

- [x] **Step 4: Exportar, verificar y commit**

`index.ts`: `export { Magnetic } from "./Magnetic"; export { GlowTrack } from "./GlowTrack";`
```bash
npm run build && npx tsc --noEmit && npx @biomejs/biome check src/components/motion
git add src/components/motion tests/e2e/pointer-fx.spec.ts
git commit -m "feat: add Magnetic and GlowTrack (light confined to the Glow Border)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Header persistente + línea de barrido + CSS de View Transitions

**Files:**
- Modify: `src/components/Header.tsx`, `src/components/Header.module.scss`, `src/components/motion/motion.css`

**Interfaces:**
- Produces: `view-transition-name: site-header` en el `<header>`. La clase `html.vt-active` (la pone la Task 9) dispara el barrido.

- [x] **Step 1: CSS de View Transitions en `motion.css`**

```css
/* ─── View Transitions (page) ─────────────────────────────────────────── */
@keyframes vt-out {
  to {
    opacity: 0;
    transform: translateY(calc(var(--shift-s) * -1));
  }
}
@keyframes vt-in {
  from {
    opacity: 0;
    transform: translateY(var(--shift-s));
  }
}
@media (prefers-reduced-motion: no-preference) {
  ::view-transition-old(root) {
    animation: vt-out 200ms var(--ease-precise) both;
  }
  ::view-transition-new(root) {
    animation: vt-in 350ms var(--ease-precise) both;
  }
  ::view-transition-group(*) {
    animation-duration: 350ms;
    animation-timing-function: var(--ease-precise);
  }
}
::view-transition-group(site-header) {
  animation: none;
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

- [x] **Step 2: Header**

En `Header.tsx`, al `<Row … as="header" …>` añadir `style={{ viewTransitionName: "site-header" }}` y, como último hijo del header, la línea:
```tsx
        <span aria-hidden="true" className={styles.sweep} />
```

En `Header.module.scss`:
```scss
.sweep {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: var(--cobalt);
  transform: scaleX(0);
  transform-origin: left center;
  opacity: 0;
  pointer-events: none;
}

@keyframes header-sweep {
  0% {
    transform: scaleX(0);
    opacity: 1;
  }
  70% {
    transform: scaleX(1);
    opacity: 1;
  }
  100% {
    transform: scaleX(1);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: no-preference) {
  :global(html.vt-active) .sweep {
    animation: header-sweep 450ms var(--ease-precise) both;
  }
}
```
El header de Once UI ya es `position: sticky/fixed`, así que `absolute` se ancla a él. Verificarlo en DevTools; si no, añadir `position: relative` al header vía `className`.

- [x] **Step 3: Verificar y commit**

```bash
npm run build && npx playwright test --project=chromium tests/e2e/smoke.spec.ts
git add src/components/Header.tsx src/components/Header.module.scss src/components/motion/motion.css
git commit -m "feat: persistent header and Cobalto sweep for page transitions

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: `ViewTransitions` (listener global)

**Files:**
- Create: `src/components/motion/viewTransition.ts`, `src/components/motion/ViewTransitions.tsx`, `tests/unit/viewTransition.spec.ts`, `tests/e2e/view-transitions.spec.ts`
- Modify: `src/components/motion/index.ts`, `src/app/layout.tsx`

**Interfaces:**
- Produces:
  - `shouldIntercept(input: InterceptInput): { href: string; pathname: string } | null`
  - `vtNameForPath(pathname: string): string | null` (`/work/<slug>` → `project-<slug>`)
  - `pickShared(name: string, root?: ParentNode): HTMLElement | null`: el primer elemento **visible** con `data-vt-name=<name>`.
  - `<ViewTransitions />`
  - Contrato para las páginas: los orígenes del morph llevan `data-vt-name="project-<slug>"` (solo atributo, sin `view-transition-name`). El destino (hero del caso) lleva `style={{ viewTransitionName: "project-<slug>" }}` estático.

- [x] **Step 1: Tests unitarios (fallan)**

`tests/unit/viewTransition.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { shouldIntercept, vtNameForPath } from "@/components/motion/viewTransition";

const base = {
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  defaultPrevented: false,
  target: null as string | null,
  download: false,
  current: { origin: "https://erickmahecha.com", pathname: "/", search: "" },
};

test("intercepts plain internal navigations", () => {
  expect(shouldIntercept({ ...base, href: "/work" })).toEqual({ href: "/work", pathname: "/work" });
  expect(shouldIntercept({ ...base, href: "/work/leadbot-ai#results" })).toEqual({
    href: "/work/leadbot-ai#results",
    pathname: "/work/leadbot-ai",
  });
});

test("ignores modified clicks, non-primary buttons, targets and downloads", () => {
  expect(shouldIntercept({ ...base, href: "/work", metaKey: true })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/work", ctrlKey: true })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/work", shiftKey: true })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/work", altKey: true })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/work", button: 1 })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/work", target: "_blank" })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/resume/cv.pdf", download: true })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/work", defaultPrevented: true })).toBeNull();
});

test("ignores external, same-page hash, API and file links", () => {
  expect(shouldIntercept({ ...base, href: "https://linkedin.com/in/x" })).toBeNull();
  expect(shouldIntercept({ ...base, href: "mailto:a@b.co" })).toBeNull();
  expect(shouldIntercept({ ...base, href: "#top" })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/" })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/api/rss" })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/resume/Erick_Mahecha_Resume.pdf" })).toBeNull();
  expect(shouldIntercept({ ...base, href: null })).toBeNull();
});

test("maps case-study paths to a unique shared-element name", () => {
  expect(vtNameForPath("/work/leadbot-ai")).toBe("project-leadbot-ai");
  expect(vtNameForPath("/work")).toBeNull();
  expect(vtNameForPath("/blog/my-workspace")).toBeNull();
});
```

Run: `npx playwright test --project=unit tests/unit/viewTransition.spec.ts` → FAIL.

- [x] **Step 2: `viewTransition.ts`**

```ts
export interface InterceptInput {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
  href: string | null;
  target: string | null;
  download: boolean;
  current: { origin: string; pathname: string; search: string };
}

/** Which clicks become a view-transition navigation. Anything unusual falls through to the browser/Next. */
export function shouldIntercept(i: InterceptInput): { href: string; pathname: string } | null {
  if (i.defaultPrevented || i.button !== 0) return null;
  if (i.metaKey || i.ctrlKey || i.shiftKey || i.altKey) return null;
  if (!i.href || i.download) return null;
  if (i.target && i.target !== "_self") return null;

  let url: URL;
  try {
    url = new URL(i.href, i.current.origin + i.current.pathname);
  } catch {
    return null;
  }
  if (url.origin !== i.current.origin) return null;
  if (url.pathname.startsWith("/api/")) return null;
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return null; // files (pdf, xml, …)
  if (url.pathname === i.current.pathname && url.search === i.current.search) return null; // same page / hash

  return { href: url.pathname + url.search + url.hash, pathname: url.pathname };
}

/** Case-study routes morph from the clicked project image; everything else just crossfades. */
export function vtNameForPath(pathname: string): string | null {
  const m = pathname.match(/^\/work\/([^/]+)\/?$/);
  return m ? `project-${m[1]}` : null;
}

/** First *visible* element carrying data-vt-name=<name> (hidden candidates can't be captured). */
export function pickShared(name: string, root: ParentNode = document): HTMLElement | null {
  const candidates = root.querySelectorAll<HTMLElement>(`[data-vt-name="${CSS.escape(name)}"]`);
  for (const el of candidates) {
    const visible =
      typeof el.checkVisibility === "function"
        ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
        : el.getClientRects().length > 0;
    if (visible) return el;
  }
  return null;
}
```

- [x] **Step 3: Tests unitarios en verde**

Run: `npx playwright test --project=unit tests/unit/viewTransition.spec.ts` → 4 passed.

- [x] **Step 4: `ViewTransitions.tsx`**

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { pickShared, shouldIntercept, vtNameForPath } from "./viewTransition";

const TIMEOUT_MS = 500;

type Pending = { pathname: string; resolve: () => void };

/**
 * Global click listener (capture phase) that wraps internal navigations in
 * document.startViewTransition. Chosen over Next's experimental viewTransition
 * flag, which switches the whole app to React's experimental channel (spec 6.4).
 *
 * - Resolves when the new pathname has rendered (effect on usePathname), with a
 *   500 ms safety timeout that also skips the animation.
 * - Back/forward (popstate) is left alone on purpose: Next handles it in its own
 *   startTransition, and iOS already animates the swipe-back gesture.
 * - Only the clicked element gets a view-transition-name, cleared when done.
 */
export function ViewTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<Pending | null>(null);

  useEffect(() => {
    const p = pending.current;
    if (p && p.pathname === pathname) {
      pending.current = null;
      p.resolve();
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof document.startViewTransition !== "function") return;

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      const decision = shouldIntercept({
        button: event.button,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        defaultPrevented: event.defaultPrevented,
        href: anchor.getAttribute("href"),
        target: anchor.getAttribute("target"),
        download: anchor.hasAttribute("download"),
        current: { origin: location.origin, pathname: location.pathname, search: location.search },
      });
      if (!decision) return;
      event.preventDefault();

      const name = vtNameForPath(decision.pathname);
      const shared = name ? pickShared(name) : null;
      if (shared && name) shared.style.viewTransitionName = name;
      document.documentElement.classList.add("vt-active");

      let timer = 0;
      const transition = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            pending.current = { pathname: decision.pathname, resolve };
            router.push(decision.href);
            timer = window.setTimeout(() => {
              if (pending.current) {
                pending.current = null;
                resolve();
                transition.skipTransition();
              }
            }, TIMEOUT_MS);
          }),
      );
      transition.finished.finally(() => {
        window.clearTimeout(timer);
        if (shared) shared.style.viewTransitionName = "";
        document.documentElement.classList.remove("vt-active");
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
```

- [x] **Step 5: Montar y test e2e**

- `index.ts`: `export { ViewTransitions } from "./ViewTransitions";`
- `layout.tsx`: `<ViewTransitions />` junto a `<MotionRuntime />`.

`tests/e2e/view-transitions.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

async function duplicateVtNames(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const names = [...document.querySelectorAll("*")]
      .map((el) => getComputedStyle(el).viewTransitionName)
      .filter((n) => n && n !== "none");
    return names.filter((n, i) => names.indexOf(n) !== i);
  });
}

test("internal navigation runs a view transition and lands on the page", async ({ page, browserName }) => {
  test.skip(browserName === "firefox", "checked separately: FF may lack same-document VT");
  await page.goto("/about");
  await page.evaluate(() => {
    (window as unknown as { __vt: number }).__vt = 0;
    const orig = document.startViewTransition.bind(document);
    document.startViewTransition = ((cb: () => Promise<void>) => {
      (window as unknown as { __vt: number }).__vt++;
      return orig(cb);
    }) as typeof document.startViewTransition;
  });
  await page.locator("header a[href='/work']").first().click();
  await page.waitForURL("**/work");
  expect(await page.evaluate(() => (window as unknown as { __vt: number }).__vt)).toBe(1);
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("vt-active"))).toBe(false);
});

test("slow navigation skips the transition and still navigates", async ({ page, browserName }) => {
  test.skip(browserName === "firefox", "VT support varies");
  await page.goto("/about");
  await page.route("**/work?_rsc=*", async (route) => {
    await new Promise((r) => setTimeout(r, 900));
    await route.continue();
  });
  await page.route("**/work", async (route) => {
    await new Promise((r) => setTimeout(r, 900));
    await route.continue();
  });
  await page.locator("header a[href='/work']").first().click();
  await page.waitForURL("**/work", { timeout: 10_000 });
  await expect(page.locator("h1").first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("vt-active"))).toBe(false);
});

test("back navigation restores scroll without transition or leftover names", async ({ page }) => {
  await page.goto("/about");
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(200);
  await page.locator("header a[href='/work']").first().click();
  await page.waitForURL("**/work");
  await page.goBack();
  await page.waitForURL("**/about");
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY)), { timeout: 3000 }).toBeGreaterThan(1000);
  expect(await duplicateVtNames(page)).toEqual([]);
  const inline = await page.$$eval("[style*='view-transition-name']", (els) =>
    els.map((e) => (e as HTMLElement).style.viewTransitionName).filter((n) => n && n !== "site-header"),
  );
  expect(inline).toEqual([]);
});

test("modifier clicks and same-page hash links are not intercepted", async ({ page, context }) => {
  await page.goto("/blog/my-workspace");
  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    page.locator("header a[href='/work']").first().click({ modifiers: ["ControlOrMeta"] }),
  ]);
  await popup.close();
  expect(new URL(page.url()).pathname).toBe("/blog/my-workspace");
});

test("no page ever has duplicate view-transition names", async ({ page }) => {
  for (const p of ["/", "/about", "/work", "/work/leadbot-ai", "/blog/my-workspace", "/gallery"]) {
    await page.goto(p);
    expect(await duplicateVtNames(page), p).toEqual([]);
  }
});
```

Run: `npm run build && npx playwright test --project=chromium --project=firefox --project=webkit tests/e2e/view-transitions.spec.ts tests/unit/viewTransition.spec.ts`
Expected: PASS. Si `ControlOrMeta` no abre una pestaña nueva en algún navegador, ajustar la aserción a «la URL de la página original no cambia», que es lo que importa.

- [x] **Step 6: Perf gate y commit**

`PERF_GATE(task09-vt, home,work, 1.5)`.

```bash
git add src/components/motion src/app/layout.tsx tests/unit/viewTransition.spec.ts tests/e2e/view-transitions.spec.ts docs/perf-report.md
git commit -m "feat: page transitions via a global View Transitions listener

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Fase C — Páginas

### Task 10: Home — hero «el sistema se cablea» (+ medición de LCP con y sin `KineticText`)

**Files:**
- Create: `src/utils/projects.ts`, `tests/unit/projects.spec.ts`, `src/components/home/Home.module.scss`, `src/components/home/HomeSection.tsx`
- Modify: `src/resources/content.tsx` (`home.headline` → string, mismo texto), `src/app/page.tsx`, `tests/e2e/kinetic.spec.ts` y `tests/e2e/decode.spec.ts` (quitar `fixme`)

**Interfaces:**
- Produces:
  - `formatIndex(n: number, total?: number): string` (`formatIndex(1, 5)` → `"01 / 05"`, `formatIndex(3)` → `"03"`).
  - `sortProjects<T extends { metadata: { publishedAt: string } }>(posts: T[]): T[]`
  - `coverImage(images: string[]): string | null` (primera imagen que no es video).
  - `parseMetric(metric?: string): { value: string; label: string } | null`
  - `<HomeSection index total id? children>`: índice mono, rama al riel (≥ 1024) y línea horizontal (< 1024).

- [x] **Step 1: Tests unitarios de `projects.ts` (fallan)**

`tests/unit/projects.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { coverImage, formatIndex, parseMetric, sortProjects } from "@/utils/projects";

test("formatIndex pads and totals", () => {
  expect(formatIndex(1, 5)).toBe("01 / 05");
  expect(formatIndex(3)).toBe("03");
  expect(formatIndex(12)).toBe("12");
});

test("coverImage skips videos and handles empty lists", () => {
  expect(coverImage(["/a.mp4", "/b.webp", "/c.webp"])).toBe("/b.webp");
  expect(coverImage(["/a.mp4"])).toBeNull();
  expect(coverImage([])).toBeNull();
});

test("parseMetric splits value|label and rejects partial input", () => {
  expect(parseMetric("85%|conversations automated")).toEqual({ value: "85%", label: "conversations automated" });
  expect(parseMetric("85%")).toBeNull();
  expect(parseMetric("")).toBeNull();
  expect(parseMetric(undefined)).toBeNull();
});

test("sortProjects orders newest first without mutating the input", () => {
  const input = [
    { metadata: { publishedAt: "2026-01-01" }, slug: "a" },
    { metadata: { publishedAt: "2026-05-01" }, slug: "b" },
  ];
  expect(sortProjects(input).map((p) => p.slug)).toEqual(["b", "a"]);
  expect(input[0].slug).toBe("a");
});
```

Run: `npx playwright test --project=unit tests/unit/projects.spec.ts` → FAIL.

- [x] **Step 2: `src/utils/projects.ts`**

```ts
const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

/** "01 / 05" with a total, "03" without. Numbering always comes from data. */
export function formatIndex(n: number, total?: number): string {
  const pad = (x: number) => String(x).padStart(2, "0");
  return total ? `${pad(n)} / ${pad(total)}` : pad(n);
}

export function sortProjects<T extends { metadata: { publishedAt: string } }>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
  );
}

/** First still image of a project (case-study carousels may start with a video). */
export function coverImage(images: string[]): string | null {
  return images.find((src) => !VIDEO.test(src)) ?? null;
}

/** "value|label" → parts; null unless both are present. */
export function parseMetric(metric?: string): { value: string; label: string } | null {
  if (!metric) return null;
  const [value, label] = metric.split("|").map((s) => s.trim());
  return value && label ? { value, label } : null;
}
```

Run: `npx playwright test --project=unit tests/unit/projects.spec.ts` → 4 passed.

- [x] **Step 3: `home.headline` como string (mismo texto exacto)**

En `src/resources/content.tsx`:
```tsx
  headline: "I Build Marketing Infrastructure From Zero. And Make It Outperform Full Departments.",
```
(antes: el mismo texto dentro de `<>…</>`). Verificar que `Home.headline` en `src/types/content.types.ts` admite `string` (`React.ReactNode` lo incluye). `git diff src/resources/content.tsx` debe mostrar **solo** ese cambio.

- [x] **Step 4: `HomeSection.tsx` + `Home.module.scss` (sección base)**

```tsx
import { BlueprintLine } from "@/components/motion";
import { formatIndex } from "@/utils/projects";
import type { ReactNode } from "react";
import styles from "./Home.module.scss";

interface HomeSectionProps {
  index: number;
  total: number;
  id?: string;
  className?: string;
  children: ReactNode;
}

/**
 * A Home section "wired" to the rail: its mono index, a 90° branch from the rail
 * (≥1024px) and a full-width guide line (<1024px). Lines are absolute (0 flow
 * height), so they never reduce the content width.
 */
export function HomeSection({ index, total, id, className, children }: HomeSectionProps) {
  return (
    <section id={id} className={`${styles.section} ${className ?? ""}`}>
      <BlueprintLine orientation="h" className={styles.branch} />
      <BlueprintLine orientation="h" className={styles.hline} />
      <span aria-hidden="true" className={styles.index}>
        {formatIndex(index, total)}
      </span>
      {children}
    </section>
  );
}
```

`src/components/home/Home.module.scss`:

```scss
@use "../breakpoints.scss" as breakpoints;

.home {
  position: relative;
  width: 100%;
  max-width: var(--responsive-width-m, 48rem);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--static-space-80, 5rem);
  padding-block: var(--static-space-12, 0.75rem);
}

.section {
  position: relative;
  width: 100%;
  padding-top: var(--static-space-40, 2.5rem);
}

.index {
  display: block;
  margin-bottom: var(--static-space-16, 1rem);
  font-family: var(--font-code), monospace;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: var(--neutral-on-background-weak);
}

/* ≥1024: branch from the rail (48px to the left of the column) to the section. */
.branch {
  top: 0;
  left: -48px;
  width: 48px;
}
/* <1024: a full-width guide line across the section top. */
.hline {
  top: 0;
  left: 0;
  right: 0;
}

@media (max-width: 1023px) {
  .branch {
    display: none;
  }
}
@media (min-width: 1024px) {
  .hline {
    display: none;
  }
}

/* ─── Hero ─── */
.hero {
  position: relative;
  padding: var(--static-space-40, 2.5rem) var(--static-space-24, 1.5rem) var(--static-space-32, 2rem);
  display: grid;
  gap: var(--static-space-24, 1.5rem);
  justify-items: start;
  text-align: left;
}

@media (max-width: 640px) {
  .hero {
    padding-inline: var(--static-space-16, 1rem);
  }
}

.stats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--static-space-12, 0.75rem);
}

.stat {
  display: inline-flex;
  align-items: baseline;
  gap: var(--static-space-8, 0.5rem);
  padding: var(--static-space-8, 0.5rem) var(--static-space-16, 1rem);
  border-radius: var(--radius-m, 8px);
  background: var(--brand-alpha-weak);
  box-shadow: var(--glow-border);
}

.statValue {
  font-weight: 700;
  color: var(--brand-on-background-weak);
}

.statLabel {
  font-size: 0.8125rem;
  color: var(--neutral-on-background-weak);
}
```

- [x] **Step 5: Hero en `src/app/page.tsx`**

Reemplazar **todo** el `return` de `Home()` por la nueva estructura. Las secciones 2–5 quedan como marcadores de la Task 11 con **el mismo contenido de hoy** (video, proyecto, blog, CTA) envuelto en `HomeSection`:

```tsx
import { CallToAction, Mailchimp } from "@/components";
import { Posts } from "@/components/blog/Posts";
import { HomeSection } from "@/components/home/HomeSection";
import styles from "@/components/home/Home.module.scss";
import { LazyVideo } from "@/components/home/LazyVideo";
import { BlueprintFrame, DecodeText, KineticText } from "@/components/motion";
import { Projects } from "@/components/work/Projects";
import { about, baseURL, home, person, routes } from "@/resources";
import { Avatar, Badge, Button, Heading, Meta, Row, Schema, Text } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

// Section order drives the "0N / 0T" indices — numbering comes from this list.
const SECTIONS = ["hero", "reel", "featured", ...(routes["/blog"] ? ["writing"] : []), "contact"] as const;
const total = SECTIONS.length;
const idx = (key: (typeof SECTIONS)[number]) => SECTIONS.indexOf(key) + 1;

export default function Home() {
  return (
    <div className={styles.home}>
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      <HomeSection index={idx("hero")} total={total} className={styles.hero}>
        <BlueprintFrame trigger="load" />
        {home.featured.display && (
          <Badge
            background="brand-alpha-weak"
            paddingX="12"
            paddingY="4"
            onBackground="neutral-strong"
            textVariant="label-default-s"
            arrow={false}
            href={home.featured.href}
            style={{ boxShadow: "var(--glow-border)" }}
          >
            <Row paddingY="2">{home.featured.title}</Row>
          </Badge>
        )}
        <Heading as="h1" wrap="balance" variant="display-strong-l">
          <KineticText text={home.headline as string} />
        </Heading>
        <Text as="p" wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
          {home.subline}
        </Text>
        {home.stats && home.stats.length > 0 && (
          <ul className={styles.stats} data-home-stats="">
            {home.stats.map((stat) => (
              <li key={stat.label} className={styles.stat}>
                <DecodeText value={stat.value} className={styles.statValue} />
                <span className={styles.statLabel}>{stat.label}</span>
              </li>
            ))}
          </ul>
        )}
        <Button id="about" data-border="rounded" href={about.path} variant="secondary" size="m" weight="default" arrowIcon>
          <Row gap="8" vertical="center" paddingRight="4">
            {about.avatar.display && (
              <Avatar marginRight="8" style={{ marginLeft: "-0.75rem" }} src={person.avatar} size="m" />
            )}
            {about.title}
          </Row>
        </Button>
      </HomeSection>

      <HomeSection index={idx("reel")} total={total}>
        <LazyVideo
          data-testid="home-video"
          src="/videohome.mp4"
          webm="/videohome.webm"
          poster="/images/videohome-poster.webp"
          width={1920}
          height={1080}
          label="Play showreel"
          watermark
        />
      </HomeSection>

      <HomeSection index={idx("featured")} total={total}>
        <Projects range={[1, 1]} />
        <Row fillWidth horizontal="center" paddingBottom="24">
          <Button id="all-projects" data-border="rounded" href="/work" variant="secondary" size="m" arrowIcon>
            View all projects
          </Button>
        </Row>
      </HomeSection>

      {routes["/blog"] && (
        <HomeSection index={idx("writing")} total={total}>
          <Heading as="h2" variant="display-strong-xs" wrap="balance" marginBottom="24">
            Latest from the blog
          </Heading>
          <Posts range={[1, 2]} columns="2" />
        </HomeSection>
      )}

      <HomeSection index={idx("contact")} total={total}>
        <CallToAction />
      </HomeSection>
      <Mailchimp />
    </div>
  );
}
```
Mantener `width={…}`/`height={…}` con los valores reales que la Task 6 del Plan 1 dejó en `LazyVideo`. `NodeDivider` deja de usarse en Home (lo reemplazan las líneas del riel), pero sigue exportado para `/work/[slug]` y `/blog/[slug]`.

- [x] **Step 6: Quitar `fixme` y verificar**

Quitar `test.fixme` de `tests/e2e/kinetic.spec.ts` y `tests/e2e/decode.spec.ts`.
```bash
npm run build && npx playwright test --project=chromium --project=mobile-chromium --project=firefox --project=webkit tests/e2e/kinetic.spec.ts tests/e2e/decode.spec.ts tests/e2e/ssr-content.spec.ts tests/e2e/lazy-video.spec.ts tests/e2e/smoke.spec.ts
rg -n "RevealFx" src/app/page.tsx   # Expected: sin resultados
```

- [x] **Step 7: Medición de LCP con y sin `KineticText` (spec 6.5, ajuste 1)**

1. Variante A (con `KineticText`, la actual): `LH_PAGES=home LH_FORMS=mobile LH_TAG=hero-kinetic npm run perf:lh`.
2. Variante B (temporal, **sin commitear**): en `page.tsx`, `<Heading …>{home.headline}</Heading>` sin `KineticText`. Build, arrancar, `LH_PAGES=home LH_FORMS=mobile LH_TAG=hero-static npm run perf:lh`, y revertir con `git checkout -- src/app/page.tsx`.
3. `npm run perf:report -- hero-kinetic hero-static` → anotar ambos LCP (mediana de 3) en `docs/perf-report.md`, sección «KineticText LCP check».
4. **Regla:** si LCP(A) − LCP(B) > 50 ms, dejar el h1 estático (variante B) y documentar `KineticText` del hero en «Ideas descartadas».

- [ ] **Step 8: Perf gate y commit**

`PERF_GATE(task10-hero, home, 1.0)`.

```bash
git add src/utils/projects.ts tests/unit/projects.spec.ts src/resources/content.tsx src/components/home src/app/page.tsx tests/e2e/kinetic.spec.ts tests/e2e/decode.spec.ts docs/perf-report.md
git commit -m "feat(home): editorial blueprint hero with kinetic headline and decoding stats

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Home — riel con nodo, ramas y video acoplado

**Files:**
- Create: `src/components/home/HomeRail.tsx`, `src/components/home/DockFrame.tsx`, `src/components/home/DockFrame.module.scss`, `tests/e2e/home-rail.spec.ts`
- Modify: `src/components/home/Home.module.scss`, `src/app/page.tsx`

**Interfaces:**
- Produces:
  - `<HomeRail />`: debe ser hijo directo de `.home`.
  - `<DockFrame>{children}</DockFrame>`

- [x] **Step 1: Test e2e (falla)**

`tests/e2e/home-rail.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

for (const width of [390, 1023, 1024, 1440]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("rail is visible at >=1024px and hidden below", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-home-rail]")).toBeVisible();
  await page.setViewportSize({ width: 1023, height: 900 });
  await expect(page.locator("[data-home-rail]")).toBeHidden();
});

test("the rail does not reduce the content column width", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const width = await page.locator("h1").evaluate((h) => h.closest("section")?.getBoundingClientRect().width ?? 0);
  expect(width).toBeGreaterThan(700);
});

test("reduced motion: rail and branches are fully drawn", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const t = await page.locator("[data-home-rail] [data-rail-line]").evaluate((el) => getComputedStyle(el).transform);
  expect(t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);
});
```

Run: `npm run build && npx playwright test --project=chromium tests/e2e/home-rail.spec.ts` → FAIL.

- [x] **Step 2: `HomeRail.tsx` + estilos**

```tsx
import styles from "./Home.module.scss";

/**
 * The growth-node rail (≥1024px): a 1px line that draws with the page's view
 * timeline and a Cobalto node that rides it via position: sticky — no scroll
 * timeline needed, so it behaves the same in Firefox.
 */
export function HomeRail() {
  return (
    <span aria-hidden="true" className={styles.rail} data-home-rail="">
      <span className={styles.railLine} data-rail-line="" />
      <span className={styles.railNode} />
    </span>
  );
}
```

Añadir a `Home.module.scss`:

```scss
.home {
  view-timeline-name: --home;
}

.rail {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -48px;
  width: 1px;
  pointer-events: none;
}
.railLine {
  position: absolute;
  inset: 0;
  background: var(--line);
  transform-origin: center top;
}
.railNode {
  position: sticky;
  top: 50vh;
  display: block;
  width: 9px;
  height: 9px;
  margin-left: -4px;
  background: var(--cobalt);
  box-shadow: var(--glow-border);
  transform: rotate(45deg);
}

@media (max-width: 1023px) {
  .rail {
    display: none;
  }
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .railLine {
      animation: rail-draw linear both;
      animation-timeline: --home;
      animation-range: cover 0% cover 100%;
    }
  }
}
@keyframes rail-draw {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}
```
El nodo sticky se mueve porque la página se desplaza, no por una animación. Con RM sigue siendo sticky, lo cual es aceptable: no hay movimiento autónomo.

- [x] **Step 3: `DockFrame`**

```tsx
import styles from "./DockFrame.module.scss";

/** Video frame that "docks" (scale .92 → 1) as it enters while its crop marks retract. */
export function DockFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.dock} data-mo-io="">
      {children}
      <span aria-hidden="true" className={`${styles.mark} ${styles.tl}`} />
      <span aria-hidden="true" className={`${styles.mark} ${styles.tr}`} />
      <span aria-hidden="true" className={`${styles.mark} ${styles.bl}`} />
      <span aria-hidden="true" className={`${styles.mark} ${styles.br}`} />
    </div>
  );
}
```

```scss
.dock {
  position: relative;
  padding: 8px;
}
.mark {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 0 solid var(--scheme-neutral-800, #c7ccd1);
}
.tl {
  top: 0;
  left: 0;
  border-top-width: 1px;
  border-left-width: 1px;
}
.tr {
  top: 0;
  right: 0;
  border-top-width: 1px;
  border-right-width: 1px;
}
.bl {
  bottom: 0;
  left: 0;
  border-bottom-width: 1px;
  border-left-width: 1px;
}
.br {
  bottom: 0;
  right: 0;
  border-bottom-width: 1px;
  border-right-width: 1px;
}

@keyframes dock {
  from {
    transform: scale(0.92);
  }
  to {
    transform: none;
  }
}
@keyframes retract-tl {
  from {
    transform: translate(-10px, -10px);
  }
}
@keyframes retract-tr {
  from {
    transform: translate(10px, -10px);
  }
}
@keyframes retract-bl {
  from {
    transform: translate(-10px, 10px);
  }
}
@keyframes retract-br {
  from {
    transform: translate(10px, 10px);
  }
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .dock {
      animation: dock linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 80%;
    }
    .tl,
    .tr,
    .bl,
    .br {
      animation: linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 80%;
    }
    .tl {
      animation-name: retract-tl;
    }
    .tr {
      animation-name: retract-tr;
    }
    .bl {
      animation-name: retract-bl;
    }
    .br {
      animation-name: retract-br;
    }
  }
}

:global(html.mo-io) .dock {
  transition: transform var(--dur-l) var(--ease-out);
}
:global(html.mo-io) .dock:not(:global(.is-in)) {
  transform: scale(0.92);
}
```
El `view()` de las marcas usa su propio sujeto (la marca), que entra en viewport junto con el marco, así que el efecto es equivalente. La escala de un contenedor no provoca CLS (`transform`).

- [x] **Step 4: Integrar en `page.tsx`**

- `<HomeRail />` como primer hijo de `<div className={styles.home}>` (después de `<Schema>`).
- En la sección `reel`, envolver `<LazyVideo …/>` con `<DockFrame>…</DockFrame>`.
- Envolver el contenido de las secciones `reel`, `featured`, `writing` y `contact` en `<Reveal>` (import desde `@/components/motion`).

- [x] **Step 5: Verificar**

```bash
npm run build && npx playwright test --project=chromium --project=mobile-chromium --project=firefox tests/e2e/home-rail.spec.ts tests/e2e/reveal.spec.ts tests/e2e/cls.spec.ts tests/e2e/lazy-video.spec.ts
```

- [x] **Step 6: Perf gate y commit**

`PERF_GATE(task11-rail, home, 0.2)`.

```bash
git add src/components/home src/app/page.tsx tests/e2e/home-rail.spec.ts docs/perf-report.md
git commit -m "feat(home): growth-node rail with branches and docking reel frame

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Home — proyecto destacado como ficha técnica + parallax + CTA con `GlowTrack`/`Magnetic`

**Files:**
- Create: `src/components/home/FeaturedProject.tsx`, `src/components/home/FeaturedProject.module.scss`
- Modify: `src/app/page.tsx`, `src/components/CallToAction.tsx`, `tests/e2e/pointer-fx.spec.ts` (quitar `fixme`)

**Interfaces:**
- Consumes: `sortProjects`, `coverImage`, `parseMetric`, `formatIndex` (Task 10); `DecodeText`, `GlowTrack`, `Magnetic` (Tasks 6–7); contrato `data-vt-name="project-<slug>"` (Task 9).
- Produces: `<FeaturedProject />`, origen del morph hacia `/work/<slug>`.

- [x] **Step 1: `FeaturedProject.tsx`**

```tsx
import { DecodeText, GlowTrack } from "@/components/motion";
import { coverImage, formatIndex, parseMetric, sortProjects } from "@/utils/projects";
import { getPosts } from "@/utils/utils";
import { Heading, Row, SmartLink, Text } from "@once-ui-system/core";
import Image from "next/image";
import Link from "next/link";
import styles from "./FeaturedProject.module.scss";

/** Latest project as a spec sheet. Its image is the shared-element origin for the case study. */
export function FeaturedProject() {
  const [project] = sortProjects(getPosts(["src", "app", "work", "projects"]));
  if (!project) return null;
  const { title, summary, images, link, metric: rawMetric } = project.metadata;
  const cover = coverImage(images);
  const metric = parseMetric(rawMetric);
  const href = `/work/${project.slug}`;

  return (
    <GlowTrack className={styles.card}>
      {cover && (
        <Link href={href} className={styles.media}>
          <span className={styles.parallax}>
            <Image
              src={cover}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className={styles.img}
              data-vt-name={`project-${project.slug}`}
            />
          </span>
        </Link>
      )}
      <div className={styles.sheet}>
        <span aria-hidden="true" className={styles.num}>
          {formatIndex(1)}
        </span>
        <Heading as="h2" variant="heading-strong-xl" wrap="balance">
          {title}
        </Heading>
        {metric && (
          <p className={styles.metric}>
            <DecodeText value={metric.value} />
            <span className={styles.metricLabel}>{metric.label}</span>
          </p>
        )}
        <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
          {summary}
        </Text>
        <Row gap="24" wrap>
          {project.content.trim() && (
            <SmartLink suffixIcon="arrowRight" style={{ margin: 0, width: "fit-content" }} href={href}>
              <Text variant="body-default-s">Read case study</Text>
            </SmartLink>
          )}
          {link && (
            <SmartLink suffixIcon="arrowUpRightFromSquare" style={{ margin: 0, width: "fit-content" }} href={link}>
              <Text variant="body-default-s">View project</Text>
            </SmartLink>
          )}
        </Row>
      </div>
    </GlowTrack>
  );
}
```

`FeaturedProject.module.scss`:

```scss
.card {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  overflow: hidden;
  background: var(--surface-background);
}
@media (max-width: 768px) {
  .card {
    grid-template-columns: 1fr;
  }
}
.media {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
}
.parallax {
  position: absolute;
  inset: -14px 0;
}
.img {
  object-fit: cover;
}
.sheet {
  display: grid;
  gap: var(--static-space-12, 0.75rem);
  align-content: center;
  padding: var(--static-space-24, 1.5rem);
}
.num {
  font-family: var(--font-code), monospace;
  font-size: 0.75rem;
  color: var(--neutral-on-background-weak);
}
.metric {
  display: inline-flex;
  gap: var(--static-space-8, 0.5rem);
  align-items: baseline;
  margin: 0;
  width: fit-content;
  padding: var(--static-space-8, 0.5rem) var(--static-space-12, 0.75rem);
  border-radius: var(--radius-m, 8px);
  background: var(--brand-alpha-weak);
  box-shadow: var(--glow-border);
  color: var(--brand-on-background-weak);
  font-weight: 700;
}
.metricLabel {
  font-family: var(--font-body), sans-serif;
  font-weight: 400;
  font-size: 0.8125rem;
  color: var(--neutral-on-background-weak);
}

@keyframes parallax {
  from {
    transform: translateY(12px);
  }
  to {
    transform: translateY(-12px);
  }
}
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    :global(html[data-fx="full"]) .parallax {
      animation: parallax linear both;
      animation-timeline: view();
      animation-range: cover 0% cover 100%;
    }
  }
}
```

- [x] **Step 2: Integrar y CTA**

- `page.tsx`, sección `featured`: reemplazar `<Projects range={[1, 1]} />` por `<FeaturedProject />` (import `@/components/home/FeaturedProject`) y quitar el import de `Projects` si queda sin uso.
- `src/components/CallToAction.tsx`: envolver el `Column` raíz con `<GlowTrack>` (quitar su `style={{ boxShadow: "var(--glow-border)" }}`, porque `GlowTrack` ya lo aplica) y el botón primario con `<Magnetic>`:
```tsx
import { GlowTrack, Magnetic } from "@/components/motion";
// …
    <GlowTrack>
      <Column … /* mismas props, sin style boxShadow */>
        {/* … */}
        <Row gap="12" wrap horizontal="center">
          <Magnetic>
            <Button href={about.calendar.link} variant="primary" size="l" prefixIcon="calendar">
              Schedule a call
            </Button>
          </Magnetic>
          <Button href={`mailto:${person.email}`} variant="secondary" size="l" prefixIcon="email">
            Send an email
          </Button>
        </Row>
      </Column>
    </GlowTrack>
```
- Quitar `test.fixme` de `tests/e2e/pointer-fx.spec.ts`.
- La ficha no muestra avatares del equipo (aprobado). **El crédito al equipo debe seguir visible en el caso de estudio.** Añadir `tests/e2e/team-credit.spec.ts`:
```ts
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const dir = "src/app/work/projects";
const withTeam = readdirSync(dir)
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => ({ slug: f.replace(/\.mdx$/, ""), src: readFileSync(path.join(dir, f), "utf8") }))
  .map(({ slug, src }) => ({ slug, names: [...src.matchAll(/^\s+- name: "([^"]+)"/gm)].map((m) => m[1]) }))
  .filter((p) => p.names.length > 0);

for (const p of withTeam) {
  test(`team credit visible on /work/${p.slug}`, async ({ page }) => {
    await page.goto(`/work/${p.slug}`);
    for (const name of p.names) await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  });
}
```

- [x] **Step 3: Verificar**

```bash
npm run build && npx playwright test --project=chromium --project=mobile-chromium --project=webkit tests/e2e/pointer-fx.spec.ts tests/e2e/team-credit.spec.ts tests/e2e/view-transitions.spec.ts tests/e2e/cls.spec.ts tests/e2e/no-broken-images.spec.ts
```
Manual: en Home desktop, clic en la imagen destacada → la imagen se transforma en el hero del caso de estudio (se completa en la Task 15; aquí se verifica que la navegación funciona y no hay nombres duplicados).

- [x] **Step 4: Perf gate y commit**

`PERF_GATE(task12-featured, home, 1.0)`.

```bash
git add src/components/home src/app/page.tsx src/components/CallToAction.tsx tests/e2e/pointer-fx.spec.ts docs/perf-report.md
git commit -m "feat(home): featured project spec sheet with parallax; glow-tracked magnetic CTA

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: IntroLoader → hero (señal de fin, spec §8)

**Files:**
- Modify: `src/components/IntroLoader.tsx` (un solo `useEffect` nuevo)
- Create: `tests/e2e/intro-sequence.spec.ts`

- [x] **Step 1: Test (falla: hoy la clase solo se va por el backstop de 7 s)**

```ts
import { expect, test } from "@playwright/test";

test("intro-pending clears when the intro starts fading (~4 s), not at the 7 s backstop", async ({ page }) => {
  await page.goto("/");
  const t0 = Date.now();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains("intro-pending")), { timeout: 8000 })
    .toBe(false);
  const elapsed = Date.now() - t0;
  expect(elapsed).toBeGreaterThan(3000);
  expect(elapsed).toBeLessThan(5500);
});

test("while the intro plays, hero animations are paused but the h1 is visible", async ({ page }) => {
  await page.goto("/");
  const state = await page.$eval("h1 [data-kinetic-word]", (w) => ({
    playState: getComputedStyle(w).animationPlayState,
    opacity: getComputedStyle(w).opacity,
  }));
  expect(state.playState).toBe("paused");
  expect(state.opacity).toBe("1");
});

test("the IntroLoader still ignores prefers-reduced-motion (brand exemption)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator('[class*="IntroLoader_overlay"]')).toBeVisible();
});
```

Run: `npm run build && npx playwright test --project=chromium tests/e2e/intro-sequence.spec.ts` → FAIL en el primero.

- [x] **Step 2: Un único efecto en `IntroLoader.tsx`**

Añadir después del efecto que maneja `document.body.style.overflow`:

```tsx
  // Hands off to the hero (spec §8): the hero's kinetic headline, blueprint
  // frame and decoding stats wait on html.intro-pending, set by the head script.
  // Cleared as soon as the fade-out starts — or immediately when the intro
  // doesn't show at all (phase starts at "done"). Timing is otherwise untouched.
  useEffect(() => {
    if (phase === "leaving" || phase === "done") {
      document.documentElement.classList.remove("intro-pending");
    }
  }, [phase]);
```
**Nada más cambia en el IntroLoader.** `git diff src/components/IntroLoader.tsx` debe mostrar solo esas líneas.

- [x] **Step 3: Verificar y commit**

```bash
npm run build && npx playwright test --project=chromium tests/e2e/intro-sequence.spec.ts tests/e2e/intro-font.spec.ts tests/e2e/motion-boot.spec.ts
git add src/components/IntroLoader.tsx tests/e2e/intro-sequence.spec.ts
git commit -m "feat: hand off from the IntroLoader to the hero animations

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 4: CP2 — Preview de la Fase B + Home y ESPERA**

1. Gates completos (build, tsc, Biome gate, `npm run test:unit && npm run test:e2e`).
2. `LH_PAGES=home LH_TAG=cp2-local npm run perf:lh` y `npm run perf:report -- cp2-local base-local`.
3. `git push -u origin feat/disruptive-redesign` y URL del Preview (mismo procedimiento que el Plan 1, Task 11, Steps 6–7, incluido el bypass de Deployment Protection si hace falta).
4. Mensaje a Erick con: resumen de la Fase B y la Home (tareas hechas, `git log --oneline perf/quick-wins..HEAD` o `main..HEAD`, ideas descartadas), tabla de Lighthouse de Home, URL del Preview y qué mirar en celular y desktop (hero tras el intro, riel y ramas en ≥1024px, líneas horizontales en móvil, video acoplado, ficha técnica, CTA).
5. **No empezar la Task 14 sin aprobación.**

---

### Task 14: Work — índice numerado, imagen flotante (desktop) y «la fila que se enciende» (táctil)

**Files:**
- Create: `src/components/work/WorkIndex.tsx`, `src/components/work/WorkIndex.module.scss`, `tests/e2e/work-index.spec.ts`
- Modify: `src/app/work/page.tsx`

**Interfaces:**
- Consumes: `sortProjects`, `coverImage`, `parseMetric`, `formatIndex`; `DecodeText`; contrato `data-vt-name`; `[data-mo-band]` de `MotionRuntime`.
- Produces: `WorkIndexProject = { slug: string; title: string; summary: string; metric: { value: string; label: string } | null; cover: string | null; link: string; hasCaseStudy: boolean }` y `<WorkIndex projects: WorkIndexProject[] />`. Cada `<li>` lleva `data-work-row`.

- [ ] **Step 1: Test e2e (falla)**

`tests/e2e/work-index.spec.ts`:

```ts
import { devices, expect, test } from "@playwright/test";

test("numbering comes from the data and every project keeps its copy", async ({ page }) => {
  await page.goto("/work");
  const rows = page.locator("[data-work-row]");
  const n = await rows.count();
  expect(n).toBeGreaterThan(5);
  for (let i = 0; i < n; i++) {
    await expect(rows.nth(i).locator("[data-row-num]")).toHaveText(String(i + 1).padStart(2, "0"));
  }
  await expect(page.getByText("Read case study").first()).toBeVisible();
});

test("rows keep a constant height (no layout shift from missing metric/cover)", async ({ page }) => {
  await page.goto("/work");
  const heights = await page.$$eval("[data-work-row] > a", (as) => as.map((a) => Math.round(a.getBoundingClientRect().height)));
  expect(new Set(heights).size).toBeLessThanOrEqual(2); // one- vs two-line summary at most
});

test("hover dims the other rows' text to 60% and shows the floating preview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work");
  await page.waitForTimeout(1500); // previews mount on idle
  const first = page.locator("[data-work-row] > a").first();
  await first.hover();
  const other = await page.locator("[data-work-row]").nth(1).locator("[data-row-title]").evaluate((el) => getComputedStyle(el).opacity);
  expect(Number(other)).toBeCloseTo(0.6, 1);
  await expect(page.locator("[data-work-preview]")).toHaveAttribute("data-visible", "true");
});

test("keyboard focus drives the index like hover", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work");
  await page.waitForTimeout(1500);
  await page.locator("[data-work-row] > a").first().focus();
  await page.keyboard.press("Tab");
  const focused = page.locator("[data-work-row] > a:focus-visible");
  await expect(focused).toHaveCount(1);
  const dimmed = await page.locator("[data-work-row]").first().locator("[data-row-title]").evaluate((el) => getComputedStyle(el).opacity);
  expect(Number(dimmed)).toBeCloseTo(0.6, 1);
  await expect(page.locator("[data-work-preview]")).toHaveAttribute("data-visible", "true");
});

test.describe("touch", () => {
  test.use({ ...devices["Pixel 7"] });
  test("a row lights up when it crosses the center band", async ({ page }) => {
    await page.goto("/work");
    const row = page.locator("[data-work-row]").nth(2);
    await row.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(400);
    const o = await row.locator("[data-row-thumb]").evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(o)).toBeGreaterThan(0.9);
    await expect(page.locator("[data-work-preview]")).toBeHidden();
  });
});

test("reduced motion: thumbnails and metrics are static and visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work");
  const o = await page.locator("[data-row-thumb]").first().evaluate((el) => getComputedStyle(el).opacity);
  expect(o).toBe("1");
});
```

Run: `npm run build && npx playwright test --project=chromium tests/e2e/work-index.spec.ts` → FAIL.

- [ ] **Step 2: `WorkIndex.tsx`**

```tsx
"use client";

import { DecodeText } from "@/components/motion";
import { formatIndex } from "@/utils/projects";
import { SmartLink, Text } from "@once-ui-system/core";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./WorkIndex.module.scss";

export interface WorkIndexProject {
  slug: string;
  title: string;
  summary: string;
  metric: { value: string; label: string } | null;
  cover: string | null;
  link: string;
  hasCaseStudy: boolean;
}

const usesPreview = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  document.documentElement.dataset.fx !== "lite";

/**
 * Work as a numbered index. Desktop (fine pointer, full tier): hovering or
 * keyboard-focusing a row dims the others (CSS :has), decodes its metric and
 * shows ONE floating preview that follows the pointer (transform + lerp).
 * Touch and lite: each row has an inline thumbnail that lights up as the row
 * crosses the viewport's center band (view() timeline; IO fallback).
 */
export function WorkIndex({ projects }: { projects: WorkIndexProject[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [centered, setCentered] = useState<Set<number>>(new Set());
  const [previewReady, setPreviewReady] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const frame = useRef(0);

  // Mount preview images on idle so they never compete with LCP.
  useEffect(() => {
    if (!usesPreview()) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const id = w.requestIdleCallback ? w.requestIdleCallback(() => setPreviewReady(true)) : window.setTimeout(() => setPreviewReady(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  // Pointer-follow loop (desktop only), runs only while the preview is visible.
  useEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    if (!list || !preview || !usesPreview()) return;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;
      const tilt = Math.max(-3, Math.min(3, (target.current.x - pos.current.x) * 0.05));
      preview.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) rotate(${tilt}deg)`;
      if (Math.abs(target.current.x - pos.current.x) + Math.abs(target.current.y - pos.current.y) > 0.5) {
        frame.current = requestAnimationFrame(tick);
      } else {
        frame.current = 0;
      }
    };
    const onMove = (e: PointerEvent) => {
      target.current = { x: e.clientX + 24, y: e.clientY - 120 };
      if (!frame.current) frame.current = requestAnimationFrame(tick);
    };
    list.addEventListener("pointermove", onMove);
    return () => {
      list.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  // Touch/lite: decode each row's metric once, when it crosses the center band.
  useEffect(() => {
    const list = listRef.current;
    if (!list || usesPreview()) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = Number((entry.target as HTMLElement).dataset.index);
          setCentered((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const row of list.querySelectorAll("[data-work-row]")) observer.observe(row);
    return () => observer.disconnect();
  }, []);

  const anchorPreviewToRow = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    target.current = { x: r.right - 360, y: r.top - 60 };
    pos.current = { ...target.current };
    if (previewRef.current) previewRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
  };

  return (
    <>
      <ol ref={listRef} className={styles.index} onPointerLeave={() => setActive(null)}>
        {projects.map((p, i) => (
          <li key={p.slug} className={styles.row} data-work-row="" data-index={i} data-mo-band="">
            <Link
              href={`/work/${p.slug}`}
              className={styles.link}
              onPointerEnter={() => setActive(i)}
              onFocus={(e) => {
                setActive(i);
                if (usesPreview()) anchorPreviewToRow(e.currentTarget);
              }}
              onBlur={() => setActive(null)}
            >
              <span className={styles.num} data-row-num="">
                <span className={styles.numBase}>{formatIndex(i + 1)}</span>
                <span aria-hidden="true" className={styles.numLit}>
                  {formatIndex(i + 1)}
                </span>
              </span>
              <span className={styles.title} data-row-title="">
                {p.title}
              </span>
              <span className={styles.meta}>
                {p.metric && (
                  <span className={styles.badge}>
                    <DecodeText
                      trigger="manual"
                      active={active === i || centered.has(i)}
                      value={p.metric.value}
                      className={styles.badgeValue}
                    />
                    <span className={styles.badgeLabel}>{p.metric.label}</span>
                  </span>
                )}
                <Text variant="body-default-s" onBackground="neutral-weak" className={styles.summary}>
                  {p.summary}
                </Text>
                {p.hasCaseStudy && <span className={styles.cta}>Read case study →</span>}
              </span>
              <span className={styles.thumbSlot} data-row-thumb="">
                {p.cover && (
                  <Image
                    src={p.cover}
                    alt=""
                    fill
                    sizes="112px"
                    className={styles.thumb}
                    data-vt-name={`project-${p.slug}`}
                  />
                )}
              </span>
            </Link>
            {p.link && (
              <SmartLink suffixIcon="arrowUpRightFromSquare" href={p.link} className={styles.external}>
                <Text variant="body-default-s">View project</Text>
              </SmartLink>
            )}
          </li>
        ))}
      </ol>

      <div
        ref={previewRef}
        aria-hidden="true"
        className={styles.preview}
        data-work-preview=""
        data-visible={active !== null ? "true" : "false"}
      >
        {previewReady &&
          projects.map(
            (p, i) =>
              p.cover && (
                <Image
                  key={p.slug}
                  src={p.cover}
                  alt=""
                  fill
                  sizes="360px"
                  className={styles.previewImg}
                  data-active={active === i ? "true" : "false"}
                  data-vt-name={active === i ? `project-${p.slug}` : undefined}
                />
              ),
          )}
      </div>
    </>
  );
}
```
Nota: el hover no aparece en el árbol de accesibilidad (la preview es `aria-hidden` y la miniatura tiene `alt=""`); el nombre del enlace es el título de la fila. «Read case study →» es copy existente, ahora dentro de la fila (la fila entera es el enlace). «View project» queda fuera del `<a>` porque no se pueden anidar enlaces.

- [ ] **Step 3: `WorkIndex.module.scss`**

```scss
.index {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--line);
}

.row {
  position: relative;
  border-bottom: 1px solid var(--line);
  view-timeline-name: --row;
}

.link {
  display: grid;
  grid-template-columns: 3.5rem 1fr 112px;
  grid-template-areas: "num title thumb" "num meta thumb";
  column-gap: var(--static-space-16, 1rem);
  row-gap: var(--static-space-8, 0.5rem);
  align-items: start;
  min-height: 132px;
  padding: var(--static-space-24, 1.5rem) var(--static-space-8, 0.5rem);
  color: inherit;
  text-decoration: none;
  outline: none;

  &:focus-visible {
    box-shadow: inset 0 0 0 2px var(--brand-solid-medium);
  }
}

.num {
  grid-area: num;
  position: relative;
  font-family: var(--font-code), monospace;
  font-size: 0.875rem;
}
.numBase {
  color: var(--neutral-on-background-weak);
}
.numLit {
  position: absolute;
  inset: 0;
  color: var(--cobalt);
  opacity: 0;
}

.title {
  grid-area: title;
  font-family: var(--font-heading), sans-serif;
  font-weight: 700;
  font-size: clamp(1.25rem, 1rem + 1.4vw, 2rem);
  line-height: 1.15;
  transition: opacity var(--dur-s) var(--ease-out);
}

.meta {
  grid-area: meta;
  display: grid;
  gap: var(--static-space-8, 0.5rem);
  transition: opacity var(--dur-s) var(--ease-out);
}

.badge {
  display: inline-flex;
  align-items: baseline;
  gap: var(--static-space-8, 0.5rem);
  width: fit-content;
  padding: var(--static-space-4, 0.25rem) var(--static-space-12, 0.75rem);
  border-radius: var(--radius-m, 8px);
  background: var(--brand-alpha-weak);
  box-shadow: var(--glow-border);
  transition: opacity var(--dur-s) var(--ease-out);
}
.badgeValue {
  font-weight: 700;
  color: var(--brand-on-background-weak);
}
.badgeLabel {
  font-size: 0.8125rem;
  color: var(--neutral-on-background-weak);
}
.summary {
  max-width: 44ch;
}
.cta {
  font-size: 0.875rem;
  color: var(--brand-on-background-weak);
}

.thumbSlot {
  grid-area: thumb;
  position: relative;
  width: 112px;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-s, 4px);
  overflow: hidden;
  background: var(--surface-background);
}
.thumb {
  object-fit: cover;
}

.external {
  position: absolute;
  right: var(--static-space-8, 0.5rem);
  bottom: var(--static-space-8, 0.5rem);
}

/* ─── Desktop, full tier: hover/focus drives the index ─── */
.index:has(.link:focus-visible) .row:not(:has(.link:focus-visible)) :is(.title, .meta) {
  opacity: 0.6;
}
.index:has(.link:focus-visible) .row:not(:has(.link:focus-visible)) :is(.badge, .thumbSlot) {
  opacity: 0.3;
}
@media (hover: hover) and (pointer: fine) {
  .index:has(.link:hover) .row:not(:has(.link:hover)) :is(.title, .meta) {
    opacity: 0.6;
  }
  .index:has(.link:hover) .row:not(:has(.link:hover)) :is(.badge, .thumbSlot) {
    opacity: 0.3;
  }
  :global(html[data-fx="full"]) .thumbSlot {
    visibility: hidden; /* keeps the grid track: row height never changes */
  }
}

.preview {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5;
  width: 360px;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-m, 8px);
  overflow: hidden;
  box-shadow: var(--glow-border);
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--dur-s) var(--ease-out);
  display: none;
}
@media (hover: hover) and (pointer: fine) {
  :global(html[data-fx="full"]) .preview {
    display: block;
  }
}
.preview[data-visible="true"] {
  opacity: 1;
}
.previewImg {
  object-fit: cover;
  opacity: 0;
  transition: opacity var(--dur-xs) linear;
}
.previewImg[data-active="true"] {
  opacity: 1;
}

/* ─── Touch / lite signature: the row lights up in the center band ─── */
@keyframes row-thumb {
  0%,
  100% {
    transform: scale(0.6);
    opacity: 0;
  }
  40%,
  60% {
    transform: none;
    opacity: 1;
  }
}
@keyframes row-num {
  0%,
  100% {
    opacity: 0;
  }
  40%,
  60% {
    opacity: 1;
  }
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .thumbSlot {
      animation: row-thumb linear both;
      animation-timeline: --row;
      animation-range: cover 30% cover 70%;
    }
    .numLit {
      animation: row-num linear both;
      animation-timeline: --row;
      animation-range: cover 30% cover 70%;
    }
  }
}

:global(html.mo-io) .thumbSlot,
:global(html.mo-io) .numLit {
  transition:
    transform var(--dur-m) var(--ease-out),
    opacity var(--dur-m) var(--ease-out);
}
:global(html.mo-io) .row:not(:global(.is-active)) .thumbSlot {
  transform: scale(0.6);
  opacity: 0;
}
:global(html.mo-io) .row:global(.is-active) .numLit {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .thumbSlot {
    opacity: 1 !important;
    transform: none !important;
  }
}

@media (max-width: 560px) {
  .link {
    grid-template-columns: 2.5rem 1fr 88px;
  }
  .thumbSlot {
    width: 88px;
  }
}
```
La animación de la miniatura en desktop full no se ve (`visibility: hidden`), pero no consume nada relevante. En desktop con tier lite se ve la variante por scroll, como pide el spec.

- [ ] **Step 4: `src/app/work/page.tsx`**

```tsx
import { WorkIndex, type WorkIndexProject } from "@/components/work/WorkIndex";
import { about, baseURL, person, work } from "@/resources";
import { coverImage, parseMetric, sortProjects } from "@/utils/projects";
import { getPosts } from "@/utils/utils";
import { Column, Heading, Meta, Schema } from "@once-ui-system/core";

// generateMetadata sin cambios

export default function Work() {
  const projects: WorkIndexProject[] = sortProjects(getPosts(["src", "app", "work", "projects"])).map((p) => ({
    slug: p.slug,
    title: p.metadata.title,
    summary: p.metadata.summary,
    metric: parseMetric(p.metadata.metric),
    cover: coverImage(p.metadata.images),
    link: p.metadata.link ?? "",
    hasCaseStudy: p.content.trim().length > 0,
  }));

  return (
    <Column maxWidth="m" paddingTop="24" fillWidth>
      {/* <Schema …/> sin cambios */}
      <Heading marginBottom="l" variant="heading-strong-xl" align="center">
        {work.title}
      </Heading>
      <WorkIndex projects={projects} />
    </Column>
  );
}
```

- [ ] **Step 5: Verificar**

```bash
npm run build && npx playwright test --project=chromium --project=mobile-chromium --project=firefox --project=webkit tests/e2e/work-index.spec.ts tests/e2e/cls.spec.ts tests/e2e/view-transitions.spec.ts tests/e2e/ssr-content.spec.ts
```
Si `rows keep a constant height` falla por resúmenes de 3 líneas, fijar `.summary { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }`. **No** cambiar el copy.

- [ ] **Step 6: Perf gate y commit**

`PERF_GATE(task14-work, work, 1.6)` (esperado: +1.2 kB de la preview y +0.3 kB de la banda).

```bash
git add src/components/work/WorkIndex.tsx src/components/work/WorkIndex.module.scss src/app/work/page.tsx tests/e2e/work-index.spec.ts docs/perf-report.md
git commit -m "feat(work): numbered index with floating preview and touch center-band signature

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: Caso de estudio — hero destino del morph + `ResultsStats` con `DecodeText`

**Files:**
- Modify: `src/app/work/[slug]/page.tsx`, `src/components/mdx/ResultsStats.tsx`
- Create: `tests/e2e/case-study.spec.ts`

- [ ] **Step 1: Test (falla)**

```ts
import { expect, test } from "@playwright/test";

test("case-study hero is the only element named for the morph", async ({ page }) => {
  await page.goto("/work/leadbot-ai");
  const names = await page.$$eval("*", (els) =>
    els.map((e) => getComputedStyle(e).viewTransitionName).filter((n) => n === "project-leadbot-ai"),
  );
  expect(names).toHaveLength(1);
});

test("clicking a Work row morphs into the case study (shared element present in both states)", async ({ page, browserName }) => {
  test.skip(browserName === "firefox", "VT support varies");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work");
  const row = page.locator("[data-work-row]").filter({ hasText: "LeadBot" }).locator("a").first();
  await row.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(400);
  await row.click();
  await page.waitForURL("**/work/leadbot-ai");
  await expect(page.locator("h1")).toContainText("LeadBot");
});

// Every ResultsStats value must end as the exact MDX string, character by character.
// (Move these two imports to the top of the file, next to the @playwright/test import.)
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const DIR = "src/app/work/projects";
const statsBySlug = readdirSync(DIR)
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => {
    const src = readFileSync(path.join(DIR, f), "utf8");
    const values = [...src.matchAll(/<ResultsStats[^>]*data="([^"]+)"/g)].flatMap((m) =>
      m[1].split("|").map((s) => s.trim()).filter((_, i) => i % 2 === 0),
    );
    return { slug: f.replace(/\.mdx$/, ""), values };
  })
  .filter((p) => p.values.length > 0);

for (const p of statsBySlug) {
  test(`ResultsStats on /work/${p.slug} end exactly as written in the MDX`, async ({ page }) => {
    await page.goto(`/work/${p.slug}`);
    const stats = page.locator("[data-results-stats] [data-stat-value]");
    await stats.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200); // > DecodeText duration
    const shown = await stats.evaluateAll((els) =>
      els.map((el) => ({
        value: el.querySelector("[class*='value']")?.textContent ?? "",
        overlay: el.querySelector("[aria-hidden='true']")?.textContent ?? "",
      })),
    );
    expect(shown.map((s) => s.value)).toEqual(p.values);
    expect(shown.every((s) => s.overlay === "")).toBe(true);
  });
}
```

- [ ] **Step 2: Hero con nombre estático**

En `src/app/work/[slug]/page.tsx`, envolver el hero:

```tsx
        <Row fillWidth position="relative" style={{ viewTransitionName: `project-${post.slug}` }}>
          <Media priority aspectRatio="16 / 9" radius="m" alt={post.metadata.title} src={post.metadata.images[0]} />
          {/* watermark span sin cambios */}
        </Row>
```
(Además se mejora el `alt="image"` genérico, que pasa a ser el título.)

- [ ] **Step 3: `ResultsStats` con `DecodeText`**

Reemplazar `AnimatedStat` (el count-up que llamaba a `setState` en cada frame) por:

```tsx
function Stat({ stat }: { stat: Stat }) {
  return (
    <div className={styles.statInner}>
      <div className={styles.value} data-stat-value="">
        <DecodeText value={stat.value} />
      </div>
      <div className={styles.label}>{stat.label}</div>
    </div>
  );
}
```
Borrar `parseValue`, `formatNumber`, `formatFinal` y `AnimatedStat` (quedan sin uso). En el map usar `<Stat stat={stat} />`. Añadir `data-results-stats=""` al `div` raíz. Import: `import { DecodeText } from "@/components/motion";`. Los valores se muestran exactamente como están escritos en el MDX (antes el count-up los reformateaba al final; ahora no hay reformateo, así que el copy queda literal).

- [ ] **Step 4: Verificar, perf gate y commit**

```bash
npm run build && npx playwright test --project=chromium --project=mobile-chromium --project=webkit tests/e2e/case-study.spec.ts tests/e2e/view-transitions.spec.ts tests/e2e/no-broken-images.spec.ts
```
`PERF_GATE(task15-case, work, 0)` (esperado Δ ≤ 0: se va la lógica de count-up).

```bash
git add "src/app/work/[slug]/page.tsx" src/components/mdx/ResultsStats.tsx tests/e2e/case-study.spec.ts docs/perf-report.md
git commit -m "feat(work): case-study hero receives the project morph; stats decode in place

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: About — «el timeline se construye», avatar enmarcado, índice mono con nodo

**Files:**
- Modify: `src/app/about/page.tsx`, `src/components/about/about.module.scss`, `src/components/about/TableOfContents.tsx`
- Create: `tests/e2e/about.spec.ts`

- [ ] **Step 1: Test (falla)**

```ts
import { expect, test } from "@playwright/test";

test("each experience node fills when it crosses the center", async ({ page }) => {
  await page.goto("/about");
  const item = page.locator("[data-timeline-item]").nth(1);
  await item.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(500);
  const fill = await item.locator("[data-node-fill]").evaluate((el) => getComputedStyle(el).opacity);
  expect(Number(fill)).toBeGreaterThan(0.9);
});

test("TOC is numbered anchor navigation that marks the active section", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/about");
  const nav = page.getByRole("navigation", { name: "On this page" });
  const links = nav.getByRole("link");
  await expect(links.first()).toHaveAttribute("href", "#Introduction");
  await expect(nav.locator("[data-toc-index]").first()).toHaveText("01");
  await page.locator("[id='Work Experience']").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(nav.locator("a[aria-current='true']")).toHaveCount(1);
  const t = await page.locator("[data-toc-node]").evaluate((el) => getComputedStyle(el).transform);
  expect(t).not.toBe("none");
});

test.describe("TOC without JavaScript", () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  test("anchors still navigate to their section", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("navigation", { name: "On this page" }).getByRole("link").nth(1).click();
    await expect(page).toHaveURL(/#Work%20Experience$/);
  });
});

test("reduced motion: timeline fully drawn and nodes filled", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about");
  const fills = await page.$$eval("[data-node-fill]", (els) => els.map((e) => getComputedStyle(e).opacity));
  expect(fills.every((o) => o === "1")).toBe(true);
});
```

- [ ] **Step 2: Timeline en `about/page.tsx`**

Reemplazar el `<Column fillWidth gap="l" marginBottom="40">` de experiencias por:

```tsx
              <ol className={styles.timeline}>
                <span aria-hidden="true" className={styles.timelineRail} />
                {about.work.experiences.map((experience, index) => (
                  <li
                    key={`${experience.company}-${experience.role}-${index}`}
                    className={styles.timelineItem}
                    data-timeline-item=""
                    data-mo-band=""
                  >
                    <span aria-hidden="true" className={styles.node}>
                      <span className={styles.nodeFill} data-node-fill="" />
                    </span>
                    {/* contenido existente de cada experiencia, sin cambios de copy: */}
                    <Row fillWidth horizontal="between" vertical="end" marginBottom="4">
                      <Text id={experience.company} variant="heading-strong-l">
                        {experience.company}
                      </Text>
                      <Text variant="heading-default-xs" onBackground="neutral-weak" style={{ fontFamily: "var(--font-code)" }}>
                        {experience.timeframe}
                      </Text>
                    </Row>
                    <Text variant="body-default-s" onBackground="brand-weak" marginBottom="m">
                      {experience.role}
                    </Text>
                    {experience.description && (
                      <Column fillWidth marginBottom="m">
                        <Text variant="body-default-m">{experience.description}</Text>
                      </Column>
                    )}
                    <Column as="ul" gap="16">
                      {experience.achievements.map((achievement: React.ReactNode, i: number) => (
                        <Reveal as="li" index={i} key={`${experience.company}-${i}`}>
                          <Text variant="body-default-m">{achievement}</Text>
                        </Reveal>
                      ))}
                    </Column>
                    {/* bloque de experience.images sin cambios */}
                  </li>
                ))}
              </ol>
```
Borrar los comentarios `--- INICIO/FIN DEL CÓDIGO NUEVO ---`. Avatar: envolver `<Avatar src={person.avatar} size="xl" />` en `<span className={styles.avatarFrame}><BlueprintFrame trigger="load" /><Avatar … /></span>`. Restaurar el `<Heading …>{person.name}</Heading>` a `<Heading …><KineticText text={person.name} /></Heading>` (ya hecho en la Task 4) y conservar el `Reveal` de la intro (Task 3).

- [ ] **Step 3: Estilos en `about.module.scss`**

```scss
.timeline {
  position: relative;
  list-style: none;
  margin: 0 0 var(--static-space-40, 2.5rem);
  padding: 0 0 0 var(--static-space-32, 2rem);
  display: grid;
  gap: var(--static-space-40, 2.5rem);
  view-timeline-name: --timeline;
}
.timelineRail {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 7px;
  width: 1px;
  background: var(--line);
  transform-origin: center top;
}
.timelineItem {
  position: relative;
  view-timeline-name: --item;
}
.node {
  position: absolute;
  top: 0.55em;
  left: calc(-1 * var(--static-space-32, 2rem) + 3px);
  width: 9px;
  height: 9px;
  border: 1px solid var(--cobalt);
  transform: rotate(45deg);
  background: var(--page-background);
}
.nodeFill {
  position: absolute;
  inset: 1px;
  background: var(--cobalt);
  opacity: 0;
}
.avatarFrame {
  position: relative;
  display: inline-block;
  padding: 10px;
}

@keyframes timeline-draw {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}
@keyframes node-fill {
  to {
    opacity: 1;
  }
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .timelineRail {
      animation: timeline-draw linear both;
      animation-timeline: --timeline;
      animation-range: entry 0% exit 100%;
    }
    .nodeFill {
      animation: node-fill linear both;
      animation-timeline: --item;
      animation-range: entry 100% contain 50%;
    }
  }
}
:global(html.mo-io) .nodeFill {
  transition: opacity var(--dur-s) var(--ease-out);
}
:global(html.mo-io) .timelineItem:global(.is-active) .nodeFill,
:global(html.mo-io) .timelineItem:global(.was-active) .nodeFill {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .nodeFill {
    opacity: 1 !important;
  }
}
```
En Firefox, `.is-active` se alterna con la banda central. Para que el nodo quede relleno después de pasar, `MotionRuntime` necesita marcar `was-active`: añadir en su callback `band`: `if (entry.isIntersecting) entry.target.classList.add("was-active");`, y un test en `reveal.spec.ts` de Firefox que lo compruebe en `/about`.

- [ ] **Step 4: `TableOfContents` como índice mono con nodo**

Reemplazar el render de secciones por una lista numerada con estado activo (IO sobre los headings) y un nodo que se mueve con `transform`:

```tsx
"use client";

import { Column, Flex, Text } from "@once-ui-system/core";
import React, { useEffect, useState } from "react";
import styles from "./about.module.scss";

const ITEM = 36; // px per row; the node travels in these steps

// … interfaz TableOfContentsProps sin cambios …

const TableOfContents: React.FC<TableOfContentsProps> = ({ structure, about }) => {
  const sections = structure.filter((s) => s.display);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const i = sections.findIndex((s) => s.title === entry.target.id);
            if (i >= 0) setActive(i);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const s of sections) {
      const el = document.getElementById(s.title);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  if (!about.tableOfContent.display) return null;

  // Plain in-page anchors: they work without JS, can be shared/bookmarked and are
  // announced as navigation. The sticky-header offset comes from scroll-margin-top
  // on the section headings (about.module.scss), so no click handler is needed.
  return (
    <Column left="0" style={{ top: "50%", transform: "translateY(-50%)", whiteSpace: "nowrap" }} position="fixed" paddingLeft="24" m={{ hide: true }}>
      <nav aria-label="On this page" className={styles.toc}>
        <span aria-hidden="true" className={styles.tocNode} data-toc-node="" style={{ transform: `translateY(${active * ITEM}px) rotate(45deg)` }} />
        {sections.map((section, i) => (
          <a
            key={section.title}
            href={`#${encodeURIComponent(section.title)}`}
            className={styles.tocItem}
            aria-current={i === active ? "true" : undefined}
          >
            <span className={styles.tocIndex} data-toc-index="">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Text>{section.title}</Text>
          </a>
        ))}
      </nav>
    </Column>
  );
};

export default TableOfContents;
```
Los ítems pasan de `Flex onClick` a enlaces `<a href="#…">` numerados, con `aria-current="true"` en el activo. La opción `subItems` estaba desactivada (`about.tableOfContent.subItems: false`), así que se elimina su render (aprobado) y se documenta en el commit. `ViewTransitions` no intercepta estos enlaces (mismo pathname + hash), así que usan el salto nativo. Borrar de `TableOfContents.tsx` los imports que queden sin uso (`Flex`).

Añadir a `about.module.scss` el offset del header para los destinos de ancla:
```scss
.anchorTarget {
  scroll-margin-top: 80px;
}
```
y aplicar `className={styles.anchorTarget}` a los `Heading`/`Column` con `id={about.intro.title}`, `id={about.work.title}`, `id={about.studies.title}`, `id={about.certifications.title}` y `id={about.technical.title}` en `about/page.tsx`. Si el componente ya tiene `className`, concatenarlo.

Estilos (añadir a `about.module.scss`):

```scss
.toc {
  position: relative;
  display: grid;
  padding-left: 20px;
}
.tocNode {
  position: absolute;
  left: 0;
  top: 13px;
  width: 9px;
  height: 9px;
  background: var(--cobalt);
  transition: transform var(--dur-s) var(--ease-precise);
}
.tocItem {
  display: flex;
  text-decoration: none;
  gap: 12px;
  align-items: center;
  height: 36px;
  cursor: pointer;
  color: var(--neutral-on-background-weak);

  &[aria-current="true"] {
    color: var(--neutral-on-background-strong);
  }
  &:focus-visible {
    outline: 2px solid var(--brand-solid-medium);
    outline-offset: 2px;
  }
}
.tocIndex {
  font-family: var(--font-code), monospace;
  font-size: 0.75rem;
}
@media (prefers-reduced-motion: reduce) {
  .tocNode {
    transition: none;
  }
}
```
En `about/page.tsx` hay **dos** columnas fijas que contienen el TOC (la de la página y la del propio componente). Quitar la `Column … position="fixed"` que envuelve `<TableOfContents>` en `page.tsx`, porque el componente ya se posiciona solo, y dejar solo `{about.tableOfContent.display && <TableOfContents structure={structure} about={about} />}`.

- [ ] **Step 5: Verificar, perf gate y commit**

```bash
npm run build && npx playwright test --project=chromium --project=mobile-chromium --project=firefox tests/e2e/about.spec.ts tests/e2e/reveal.spec.ts tests/e2e/cls.spec.ts
```
`PERF_GATE(task16-about, about, 0.5)`.

```bash
git add src/app/about/page.tsx src/components/about src/components/motion/MotionRuntime.tsx tests/e2e/about.spec.ts tests/e2e/reveal.spec.ts docs/perf-report.md
git commit -m "feat(about): self-building timeline, framed avatar and mono index with node

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: Blog — «leer compila» (barra de lectura, h2 numerados, TOC numerado)

**Files:**
- Create: `src/components/blog/post.module.scss`, `tests/e2e/blog.spec.ts`
- Modify: `src/app/blog/[slug]/page.tsx`, `src/components/blog/OnThisPage.tsx`

- [ ] **Step 1: Test (falla)**

```ts
import { expect, test } from "@playwright/test";

test("h2 numbering in the article matches the On this page numbering", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/blog/my-workspace");
  const articleNums = await page.$$eval("[data-post-article] h2", (hs) =>
    hs.map((h) => getComputedStyle(h, "::before").content.replace(/"/g, "")),
  );
  const tocNums = await page.$$eval("[data-toc-num]", (els) => els.map((e) => e.textContent?.trim()));
  expect(articleNums.length).toBe(6);
  expect(articleNums).toEqual(["01", "02", "03", "04", "05", "06"]);
  expect(tocNums).toEqual(articleNums);
});

test("h2 accessible names are unchanged (numbers are decorative)", async ({ page }) => {
  await page.goto("/blog/my-workspace");
  await expect(page.getByRole("heading", { level: 2, name: "The Machine" })).toBeVisible();
});

test("reading progress is scroll-linked and hidden without support", async ({ page, browserName }) => {
  await page.goto("/blog/my-workspace");
  const display = await page.locator("[data-reading-progress]").evaluate((el) => getComputedStyle(el).display);
  const supported = await page.evaluate(() => CSS.supports("animation-timeline: scroll()"));
  expect(display === "none").toBe(!supported);
  if (browserName === "firefox") expect(display).toBe("none");
});

test("TOC indicator moves with transform, not top", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/blog/my-workspace");
  await page.getByRole("heading", { level: 2, name: "The Machine" }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const style = await page.locator("[data-toc-indicator]").evaluate((el) => ({
    top: (el as HTMLElement).style.top,
    transform: getComputedStyle(el).transform,
  }));
  expect(style.top).toBe("");
  expect(style.transform).not.toBe("none");
});
```

- [ ] **Step 2: `post.module.scss` y página**

```scss
.article {
  counter-reset: h2;
}
.article :global(h2)::before {
  counter-increment: h2;
  content: counter(h2, decimal-leading-zero);
  display: inline-block;
  margin-right: 0.6em;
  font-family: var(--font-code), monospace;
  font-size: 0.6em;
  font-weight: 500;
  vertical-align: 0.25em;
  color: var(--cobalt);
}
```
En `src/app/blog/[slug]/page.tsx`:
- `import styles from "@/components/blog/post.module.scss";` e `import { ReadingProgress } from "@/components/motion";`
- `<ReadingProgress />` como primer hijo del `<Row fillWidth>` raíz. Para el test, `ReadingProgress` debe aceptar pasar `data-reading-progress` a su raíz: añadirlo en el componente (`<span aria-hidden="true" className={styles.bar} data-reading-progress="">`).
- `<Column as="article" maxWidth="s" className={styles.article} data-post-article="">`.

- [ ] **Step 3: `OnThisPage` numerado y con `transform`**

- Calcular el número solo para h2, en el orden de aparición:
```tsx
  let h2Count = 0;
  const numbered = headings.map((h) => ({ ...h, num: h.level === 2 ? String(++h2Count).padStart(2, "0") : null }));
```
  y usar `numbered.map` en el render. Dentro del `SmartLink`, antes del `Text`:
```tsx
                  {heading.num && (
                    <span data-toc-num="" style={{ fontFamily: "var(--font-code)", marginRight: 8, color: "var(--cobalt)" }}>
                      {heading.num}
                    </span>
                  )}
```
- Indicador: sustituir `style={{ top: …, transition: "top 0.3s ease" }}` por:
```tsx
            data-toc-indicator=""
            style={{
              top: 0,
              transform: `translateY(${activeIndex * ITEM_HEIGHT}px)`,
              transition: "transform 0.3s var(--ease-precise)",
            }}
```
  El test exige que `el.style.top` esté vacío: usar `className` con `top: 0` en un SCSS, o no fijar `top` inline (el valor por defecto de un `absolute` sin `top` es la posición estática, que aquí es 0). Dejar `style={{ transform, transition }}` sin `top`.

- [ ] **Step 4: Verificar, perf gate y commit**

```bash
npm run build && npx playwright test --project=chromium --project=firefox --project=webkit tests/e2e/blog.spec.ts tests/e2e/a11y-names.spec.ts tests/e2e/cls.spec.ts
```
`PERF_GATE(task17-blog, blog, 0.2)`.

```bash
git add "src/app/blog/[slug]/page.tsx" src/components/blog src/components/motion/ReadingProgress.tsx tests/e2e/blog.spec.ts docs/perf-report.md
git commit -m "feat(blog): reading progress node, numbered h2 and matching On this page numbers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 18: Gallery — «contact sheet» (celdas `<button>`, stagger por columna, cruz de retícula)

**Files:**
- Create: `src/components/gallery/gallery.module.scss`, `tests/e2e/gallery.spec.ts`
- Modify: `src/components/gallery/GalleryView.tsx`

- [ ] **Step 1: Test (falla)**

```ts
import { expect, test } from "@playwright/test";

test("gallery cells are real buttons named by their alt text", async ({ page }) => {
  await page.goto("/gallery");
  const cell = page.locator("[data-gallery-cell]").first();
  expect(await cell.evaluate((el) => el.tagName)).toBe("BUTTON");
  await expect(cell).toHaveAccessibleName(/.+/);
});

test("columns stagger: --i equals the column rank", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/gallery");
  await page.waitForTimeout(500);
  const data = await page.$$eval("[data-gallery-item]", (els) =>
    els.map((e) => ({ left: Math.round(e.getBoundingClientRect().left), i: (e as HTMLElement).style.getPropertyValue("--i") })),
  );
  const lefts = [...new Set(data.map((d) => d.left))].sort((a, b) => a - b);
  for (const d of data) expect(Number(d.i)).toBe(lefts.indexOf(d.left));
});
```

- [ ] **Step 2: `gallery.module.scss`**

```scss
.cell {
  all: unset;
  position: relative;
  display: block;
  width: 100%;
  cursor: pointer;
  border-radius: var(--radius-m, 8px);
  overflow: hidden;
  transition: transform var(--dur-s) var(--ease-out);

  &:focus-visible {
    outline: 2px solid var(--brand-solid-medium);
    outline-offset: 2px;
  }
}

@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .cell:hover {
    transform: scale(1.02);
  }
}

/* Blueprint crosshair + mono caption (existing alt text) on hover/focus. */
.cross,
.caption {
  position: absolute;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--dur-s) var(--ease-out);
}
.cross {
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  background:
    linear-gradient(var(--cobalt), var(--cobalt)) center / 1px 100% no-repeat,
    linear-gradient(var(--cobalt), var(--cobalt)) center / 100% 1px no-repeat;
}
.caption {
  left: 12px;
  right: 44px;
  bottom: 12px;
  font-family: var(--font-code), monospace;
  font-size: 0.6875rem;
  line-height: 1.4;
  color: #f4f5f7;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cell:hover .cross,
.cell:hover .caption,
.cell:focus-visible .cross,
.cell:focus-visible .caption {
  opacity: 1;
}
```

- [ ] **Step 3: `GalleryView.tsx`**

1. Reemplazar `HoverWrapper` (div con estado de hover en JS) por un botón:
```tsx
const CellButton = forwardRef<HTMLButtonElement, { alt: string; onClick: () => void; children: React.ReactNode }>(
  function CellButton({ alt, onClick, children }, ref) {
    return (
      <button ref={ref} type="button" className={styles.cell} onClick={onClick} data-gallery-cell="">
        {children}
        <span aria-hidden="true" className={styles.cross} />
        <span aria-hidden="true" className={styles.caption}>
          {alt}
        </span>
      </button>
    );
  },
);
```
   El nombre accesible sale del `alt` del `Media` interior. Usarlo en `ImageCell` y `CarouselCell` con `alt={item.image.alt}` / `alt={item.coverImage.alt}`. `import { forwardRef } from "react";` y `import styles from "./gallery.module.scss";`.
2. Envolver cada ítem del `MasonryGrid` con `Reveal`: reemplazar `<Flex key={index} fillWidth style={{ breakInside: "avoid" }}>` por `<Reveal key={index} className={…} style={{ breakInside: "avoid" }}>` con `data-gallery-item` (añadir un `div` interno si `Reveal` no reenvía atributos `data-*`; o extender `Reveal` con una prop `dataAttrs`, lo más simple: envolver en `<div data-gallery-item="">`).
3. Rango de columna calculado tras el layout:
```tsx
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const assign = () => {
      const items = [...grid.querySelectorAll<HTMLElement>("[data-gallery-item]")];
      const lefts = [...new Set(items.map((el) => Math.round(el.getBoundingClientRect().left)))].sort((a, b) => a - b);
      for (const el of items) el.style.setProperty("--i", String(lefts.indexOf(Math.round(el.getBoundingClientRect().left))));
    };
    assign();
    const ro = new ResizeObserver(assign);
    ro.observe(grid);
    return () => ro.disconnect();
  }, []);
```
   y `<div ref={gridRef}><MasonryGrid …>…</MasonryGrid></div>`. `--i` es la variable que ya usa `[data-reveal]`. Se fija sobre el wrapper `data-gallery-item`, que **es** el elemento `Reveal` (o su padre inmediato; en ese caso la variable se hereda).

- [ ] **Step 4: Verificar, perf gate y commit**

```bash
npm run build && npx playwright test --project=chromium --project=mobile-chromium --project=firefox tests/e2e/gallery.spec.ts tests/e2e/youtube-facade.spec.ts tests/e2e/reveal.spec.ts tests/e2e/cls.spec.ts
```
`PERF_GATE(task18-gallery, gallery, 0.3)`.

```bash
git add src/components/gallery tests/e2e/gallery.spec.ts docs/perf-report.md
git commit -m "feat(gallery): contact-sheet cells as buttons with column stagger and blueprint crosshair

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 19: Gallery — morph miniatura → visor preservando el foco de Once UI

**Files:**
- Modify: `src/components/gallery/GalleryView.tsx`
- Create: `tests/e2e/gallery-dialog.spec.ts`

- [ ] **Step 1: Test (falla)**

```ts
import { expect, test } from "@playwright/test";

test("dialog keeps Once UI focus management: trap, Esc, focus returns to the cell", async ({ page }) => {
  await page.goto("/gallery");
  const cell = page.locator("[data-gallery-cell]").first();
  await cell.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("[role='dialog']"))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(cell).toBeFocused();
});

test("opening morphs with a single shared name at a time", async ({ page, browserName }) => {
  test.skip(browserName === "firefox", "VT support varies");
  await page.goto("/gallery");
  await page.evaluate(() => {
    const seen: number[] = [];
    (window as unknown as { __dups: number[] }).__dups = seen;
    const check = () => {
      const n = [...document.querySelectorAll("*")].filter((e) => getComputedStyle(e).viewTransitionName === "gallery-active").length;
      seen.push(n);
      if (seen.length < 60) requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
  await page.locator("[data-gallery-cell]").first().click();
  await page.waitForTimeout(1200);
  const dups = await page.evaluate(() => (window as unknown as { __dups: number[] }).__dups);
  expect(Math.max(...dups)).toBeLessThanOrEqual(1);
});

test("reduced motion opens instantly", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/gallery");
  await page.locator("[data-gallery-cell]").first().click();
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 300 });
});
```

- [ ] **Step 2: Hook `useMorphDialog` dentro de `GalleryView.tsx`**

```tsx
import { flushSync } from "react-dom";

const MORPH = "gallery-active";

/**
 * Wraps a Dialog's open/close in a same-document view transition. Only the
 * state change is wrapped, so Once UI keeps its focus trap, Esc and focus
 * restore. Exactly one element holds the shared name at any moment: the cell
 * in the old snapshot, the dialog media in the new one (and vice versa).
 */
function useMorphDialog() {
  const [open, setOpenState] = useState(false);
  const cellRef = useRef<HTMLButtonElement>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const mounted = useRef<(() => void) | null>(null);

  const setMediaRef = (el: HTMLDivElement | null) => {
    mediaRef.current = el;
    if (el && mounted.current) {
      mounted.current();
      mounted.current = null;
    }
  };

  const canMorph = () =>
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setOpen = (next: boolean) => {
    const cell = cellRef.current;
    if (!canMorph() || !cell) {
      setOpenState(next);
      return;
    }
    if (next) {
      cell.style.viewTransitionName = MORPH;
      const vt = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            cell.style.viewTransitionName = "";
            mounted.current = () => {
              if (mediaRef.current) mediaRef.current.style.viewTransitionName = MORPH;
              resolve();
            };
            flushSync(() => setOpenState(true));
            if (mediaRef.current) mounted.current?.();
            window.setTimeout(() => {
              if (mounted.current) {
                mounted.current = null;
                resolve();
              }
            }, 300);
          }),
      );
      vt.finished.finally(() => {
        if (mediaRef.current) mediaRef.current.style.viewTransitionName = "";
      });
    } else {
      if (mediaRef.current) mediaRef.current.style.viewTransitionName = MORPH;
      const vt = document.startViewTransition(() => {
        if (mediaRef.current) mediaRef.current.style.viewTransitionName = "";
        flushSync(() => setOpenState(false));
        cell.style.viewTransitionName = MORPH;
      });
      vt.finished.finally(() => {
        cell.style.viewTransitionName = "";
      });
    }
  };

  return { open, setOpen, cellRef, setMediaRef };
}
```

En `ImageCell` y `CarouselCell`:
```tsx
  const { open, setOpen, cellRef, setMediaRef } = useMorphDialog();
  // …
  <CellButton ref={cellRef} alt={…} onClick={() => setOpen(true)}>…</CellButton>
  <Dialog isOpen={open} onClose={() => setOpen(false)} …>
    <div ref={setMediaRef}>
      {/* Media / Carousel existentes */}
    </div>
  </Dialog>
```
El `Dialog` de Once UI guarda `document.activeElement` (el botón) al abrir y lo restaura al cerrar. El orden (el foco está en el botón cuando se llama a `setOpen(true)`) no cambia. Si el `Dialog` monta su contenido de forma asíncrona, el `ref` callback resuelve la promesa; si pasan 300 ms sin eso, se resuelve sin morph (crossfade).

- [ ] **Step 3: Verificar, perf gate y commit**

```bash
npm run build && npx playwright test --project=chromium --project=mobile-chromium --project=firefox --project=webkit tests/e2e/gallery-dialog.spec.ts tests/e2e/gallery.spec.ts
```
`PERF_GATE(task19-gallery-morph, gallery, 0.4)`.

```bash
git add src/components/gallery/GalleryView.tsx tests/e2e/gallery-dialog.spec.ts docs/perf-report.md
git commit -m "feat(gallery): thumbnail-to-viewer morph that preserves Once UI focus handling

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 20: Magnetic en CTAs primarios restantes, `GlowTrack` en cards y barrido final de `RevealFx`

**Files:**
- Modify: `src/app/about/page.tsx` (botón «Schedule a call»), `src/components/blog/Post.tsx` (card), cualquier archivo donde `rg RevealFx` todavía encuentre algo
- Create: `tests/unit/no-revealfx.spec.ts`

- [ ] **Step 1: Test de «cero RevealFx» (unit)**

```ts
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

test("no source file uses RevealFx", () => {
  const offenders = walk("src").filter((f) => /\.(tsx?|mdx)$/.test(f) && readFileSync(f, "utf8").includes("RevealFx"));
  expect(offenders).toEqual([]);
});

test("no source file animates layout properties in new motion code", () => {
  const motion = walk("src/components/motion").filter((f) => /\.(s?css)$/.test(f));
  const bad: string[] = [];
  for (const f of motion) {
    const css = readFileSync(f, "utf8");
    for (const m of css.matchAll(/@keyframes[^{]+\{([\s\S]*?)\n\}/g)) {
      if (/\b(width|height|top|left|right|bottom|margin|padding)\s*:/.test(m[1])) bad.push(`${f}: ${m[0].slice(0, 40)}`);
    }
  }
  expect(bad).toEqual([]);
});
```

- [ ] **Step 2: Aplicar**

- `about/page.tsx`: envolver `<Button href={about.calendar.link} variant="primary" …>Schedule a call</Button>` con `<Magnetic>`.
- `Post.tsx`: envolver el `Card` con `<GlowTrack>` solo cuando `thumbnail` es true (cards de «Recent posts» y Home).
- `rg -n "RevealFx" src`: eliminar cualquier import restante.

- [ ] **Step 3: Verificar, perf gate y commit**

```bash
npx playwright test --project=unit && npm run build && npx playwright test --project=chromium --project=mobile-chromium tests/e2e/pointer-fx.spec.ts tests/e2e/smoke.spec.ts
```
`PERF_GATE(task20-global, home,about,blog, 0.2)`.

```bash
git add src tests/unit/no-revealfx.spec.ts docs/perf-report.md
git commit -m "feat: magnetic primary CTAs and glow-tracked cards; remove last RevealFx uses

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Fase D — Verificación y entrega

### Task 21: Medición del IntroLoader (solo reporte)

**Files:**
- Modify: `docs/perf-report.md`

- [ ] **Step 1: Variante (a), normal**

```bash
npm run build && (npm run start -- -p 3100 &)
LH_PAGES=home LH_FORMS=mobile,desktop LH_TAG=intro-on npm run perf:lh
INP_BASE_URL=http://localhost:3100 npm run perf:inp | tee .perf/inp-intro-on.txt
```

- [ ] **Step 2: INP de un clic DURANTE el intro**

Script puntual (no se commitea), en `.perf/inp-during-intro.mjs`:
```js
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium, devices } from "@playwright/test";
const require = createRequire(import.meta.url);
const WV = readFileSync(require.resolve("web-vitals/dist/web-vitals.iife.js"), "utf8");
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["Pixel 7"] });
const page = await ctx.newPage();
await (await ctx.newCDPSession(page)).send("Emulation.setCPUThrottlingRate", { rate: 4 });
await page.addInitScript(`${WV}; window.__inp=0; webVitals.onINP(m=>{window.__inp=Math.max(window.__inp,m.value)},{reportAllChanges:true});`);
await page.goto("http://localhost:3100/");
await page.waitForTimeout(1500);                 // intro is on screen
await page.mouse.click(200, 400);                // click lands on the overlay
await page.waitForTimeout(500);
await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
console.log("INP during intro (ms):", Math.round(await page.evaluate(() => window.__inp)));
await browser.close();
```
`node .perf/inp-during-intro.mjs`

- [ ] **Step 3: Variante (b), sin intro (temporal, sin commitear)**

En `src/components/IntroLoader.tsx`, primera línea del cuerpo del componente: `return null;` (temporal). Build, arrancar, `LH_PAGES=home LH_FORMS=mobile,desktop LH_TAG=intro-off npm run perf:lh` y `npm run perf:inp | tee .perf/inp-intro-off.txt`. **Revertir** con `git checkout -- src/components/IntroLoader.tsx` y confirmar con `git status --short`.

- [ ] **Step 4: Reporte**

`npm run perf:report -- intro-on intro-off` → sección «IntroLoader impact» en `docs/perf-report.md`, con LCP, CLS, TBT e INP (antes/durante/después del intro) y una frase de conclusión. **No proponer cambios**: la decisión es de Erick.

---

### Task 22: Suite completa, reporte final, push y Preview

**Files:**
- Modify: `docs/perf-report.md`

- [ ] **Step 1: Gates**

```bash
npx @biomejs/biome check src --max-diagnostics=0 2>&1 | tail -2
npx tsc --noEmit; echo "tsc exit=$?"
npm run build 2>&1 | tee .perf/build-final.txt | tail -30
npm run test:unit && npm run test:e2e
rg -n "RevealFx" src || echo "RevealFx: 0"
```
Expected: todo en verde y `RevealFx: 0`.

- [ ] **Step 2: Reduced motion, CPU 4x y fallback de Firefox (confirmación explícita)**

- `npx playwright test --project=firefox tests/e2e/reveal.spec.ts tests/e2e/about.spec.ts tests/e2e/work-index.spec.ts` (camino IO).
- `npx playwright test --grep "reduced motion"` (todas las pruebas RM en los cuatro proyectos).
- `npm run perf:inp | tee .perf/inp-final.txt` (móvil + CPU 4x): INP < 200 ms en las 5 páginas y **ninguna** tarea larga > 50 ms atribuible al motion durante el scroll. Si aparece alguna, trazarla con DevTools → Performance (CPU 4x) y resolverla con `superpowers:systematic-debugging` antes de seguir.

- [ ] **Step 3: Headers, chatbot y auth**

Repetir los Steps 2 y 3 de la Task 11 del Plan 1 (comandos idénticos). Expected: `HEADERS IDENTICAL` y los mismos códigos que `main`.

- [ ] **Step 4: Lighthouse final y capturas**

```bash
LH_TAG=redesign-local npm run perf:lh
npm run perf:report -- redesign-local base-local
npm run perf:screens -- after http://localhost:3100
du -sh public
```

- [ ] **Step 5: `docs/perf-report.md` final**

Añadir la sección `## Rediseño (feat/disruptive-redesign)` con:
1. Tabla antes/después por página: Lighthouse (Perf / A11y), LCP, CLS, INP lab / TBT, KB de JS (build y transfer) y peso total de assets. Columnas: producción (línea base), quick wins y rediseño.
2. Motion ledger completo (filas de cada `PERF_GATE`).
3. «KineticText LCP check» (Task 10) e «IntroLoader impact» (Task 21).
4. **Resumen por página:** qué animaciones o cambios se hicieron y con qué técnica (Home, Work, caso de estudio, About, Blog, Gallery, global).
5. **Ideas descartadas:** la lista del spec §11 más las revertidas por `PERF_GATE`, con su medición.
6. Enlaces a las capturas `.perf/screens/before` y `.perf/screens/after` (adjuntarlas al PR; `.perf/` no se commitea).

```bash
git add docs/perf-report.md
git commit -m "docs: final redesign performance report

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Code review y push**

1. Invocar `superpowers:requesting-code-review` sobre la rama completa. Atender los hallazgos con `superpowers:receiving-code-review`.
2. `git push -u origin feat/disruptive-redesign`.
3. Obtener la URL del Preview con el mismo procedimiento que la Task 11 (Steps 6–7) del Plan 1, incluido el caso de Deployment Protection (token de *Protection Bypass for Automation*; no desactivarla).
4. `LH_BASE_URL=<preview> LH_TAG=redesign-preview npm run perf:lh` y añadir la tabla del Preview al reporte (commit `docs:` + push).

- [ ] **Step 7: CP3 — entrega a Erick y ESPERA**

Mensaje con:
0. Resumen corto de las Fases C y D: tareas hechas, commits e ideas descartadas.
1. URL del Preview.
2. Enlace a `docs/perf-report.md`, con la tabla resumida en el mensaje.
3. Resumen por página.
4. Ideas descartadas.
5. **Checklist manual para Safari de macOS e iOS:** fachada de YouTube con un toque, gesto de volver sin doble animación, timelines de scroll, firma táctil de Work, intro → hero.
6. Las etiquetas con texto pendientes (spec §12), para decidir viendo el Preview.

**No hacer merge sin un «sí» explícito.** Al recibirlo, usar `superpowers:finishing-a-development-branch`.

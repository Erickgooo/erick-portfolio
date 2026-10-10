# Landing con película de scroll — Plan A: puerta de aspecto

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar en el Preview la nueva cara de la Home (tipografía Geist, fondos planos, nav en píldora, video de fondo que avanza con el scroll, hero y tagline) para que Erick la apruebe antes de construir el resto.

**Architecture:** Una capa `sticky` a pantalla completa contiene el video; las secciones son HTML de servidor que pasa por delante. Un componente cliente (`ScrollFilm`) descarga el clip después del `load`, lo reproduce desde un `Blob` y fija `currentTime` según qué sección cruza el borde superior del viewport. El mapeo scroll → tiempo es una función pura (`filmMap.ts`).

**Tech Stack:** Next.js 15.5 App Router, React 19, TypeScript, SCSS modules, Once UI 1.4, `next/font` (Geist), CSS `view-timeline`, `@playwright/test` 1.63, ffmpeg.

**Spec:** `docs/superpowers/specs/2026-10-09-landing-film-home-design.md` (§8, paso 1). Los pasos 2–4 del spec van en un Plan B que se escribe **después** del sí de Erick, porque la puerta puede cambiar el diseño.

**Guía de diseño:** `.claude/skills/landing-page-design/SKILL.md` (checkout principal). Las decisiones del spec §1 ganan sobre la skill.

## Global Constraints

- Rama `feat/disruptive-redesign`, worktree `.claude/worktrees/disruptive-redesign`. Nunca commit a `main`. No tocar el checkout principal, `.env.local`, `middleware.ts`, auth ni el chatbot.
- **Único cambio de headers permitido:** `media-src 'self' blob:` en `next.config.mjs` (aprobado por Erick el 2026-10-09). Nada de `'unsafe-eval'` ni cambios en `script-src`.
- Acción única: «Book a 30 minute call» → `about.calendar.link`. Un solo CTA primario sobre el pliegue.
- Tipografía: Geist (títulos y cuerpo), Geist Mono solo en cifras. Acento único: Cobalto `#2D5BFF`.
- Fondos planos, sin degradados de fondo. Oscuro: `#000000`, `#181818`, `#1F1F1F`. Se conserva el tema claro.
- Copy del spec §3, sin guiones dentro de las frases, sin signos de exclamación, títulos en minúscula tipo oración.
- Tamaños de fuente solo de la escala Tailwind (12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96 px). Espaciado solo de: 0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96 px.
- Curva de movimiento: `cubic-bezier(0.32, 0.72, 0, 1)`. Todo movimiento nuevo degrada a su estado final con `prefers-reduced-motion: reduce`. El IntroLoader no se toca.
- Video: desktop ≤ 15 MB, móvil ≤ 12 MB. No se descarga con movimiento reducido ni con `data-fx="lite"`. El `h1` y el CTA nunca dependen de JS.
- Los specs e2e importan `{ expect, test }` de `./fixtures`. En la Home, esperar a que `html.intro-pending` desaparezca antes de interactuar.
- **Biome gate** antes de cada commit: `npx @biomejs/biome check src --max-diagnostics=0` sin errores y `node scripts/quality/biome-gate.mjs HEAD`. Si aparecen decenas de errores `format`, son CRLF: `npx @biomejs/biome format --write src`.
- Commits atómicos; cada mensaje termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Preparar archivos por ruta explícita.
- First Load JS por ruta ≤ base + 10 kB (`/` 312, `/about` 275, `/work` 310, `/blog/[slug]` 313, `/gallery` 286).

## Review Focus

1. **El video tarda o falla (red lenta, 404, sin conexión):** la página se queda con el póster y todo el texto; ningún error en consola. Test `a failed film download leaves the poster` (Task 4).
2. **Scroll muy rápido arriba y abajo:** el clip no se congela ni queda en un tiempo distinto al de la sección visible. Test `the film follows the scroll position, forwards and backwards` (Task 4).
3. **Menú móvil abierto y navegación:** al elegir un enlace el menú se cierra, el scroll del `body` vuelve y el foco no queda atrapado. Test `choosing a link closes the menu` (Task 3).
4. **Giro del teléfono o cambio de ancho cruzando 860 px:** sin scroll horizontal y el escenario sigue cubriendo la pantalla. Test `no horizontal overflow` (Task 4).
5. **Navegador sin `view-timeline` (Firefox, iOS < 26):** el tagline termina con todas las palabras encendidas. Test `fallback engines end with every word lit` (Task 5).

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `scripts/media/encode-film.sh` | Create | Codifica el clip desktop, el móvil y los pósters |
| `public/video/home-film.mp4`, `home-film-m.mp4` | Create | Clips para scrub |
| `public/images/film/hero.webp`, `hero-m.webp` | Create | Primer fotograma de cada clip |
| `src/components/film/filmMap.ts` | Create | Planos, destellos y funciones puras scroll → tiempo y velo |
| `src/components/film/ScrollFilm.tsx` + `.module.scss` | Create | Escenario fijo, carga por Blob, scrub |
| `src/components/film/FilmSection.tsx` + `.module.scss` | Create | Sección de servidor con contenido anclado |
| `src/resources/landing.ts` | Create | Copy de la landing |
| `src/components/landing/Hero.tsx`, `Tagline.tsx`, `CallButton.tsx`, `landing.module.scss` | Create | Hero, tagline y CTA único |
| `src/app/page.tsx` | Modify | Nueva Home |
| `src/app/fonts.ts` | Modify | Geist y Geist Mono |
| `src/resources/custom.css` | Modify | Neutros planos, offsets del layout |
| `src/components/motion/motion.css` | Modify | Fuera la retícula; curva fluida; entrada con desenfoque |
| `src/app/layout.tsx` | Modify | Sin `blueprint-bg` ni espaciador del header |
| `src/components/Header.tsx` + `.module.scss` | Modify | Píldora flotante y menú móvil |
| `next.config.mjs` | Modify | `media-src 'self' blob:` |
| `tests/unit/filmMap.spec.ts`, `tests/e2e/film.spec.ts`, `nav.spec.ts`, `tagline.spec.ts` | Create | Ver cada task |
| `tests/e2e/helpers.ts` y specs existentes | Modify | `headerLink()`, y retirar lo que dependía de la Home vieja |

---

### Task 1: Clips, pósters y mapa de la película

**Files:**
- Create: `scripts/media/encode-film.sh`, `public/video/home-film.mp4`, `public/video/home-film-m.mp4`, `public/images/film/hero.webp`, `public/images/film/hero-m.webp`
- Create: `src/components/film/filmMap.ts`
- Test: `tests/unit/filmMap.spec.ts`

**Interfaces:**
- Produces: `FilmBeat { id: string; start: number; end: number }`, `SectionBox { id: string; top: number; height: number }`, `FILM_DURATION: number`, `FILM_BEATS: FilmBeat[]`, `filmTimeAt(beats: FilmBeat[], boxes: SectionBox[]): number`, `veilAt(time: number): number`. Rutas públicas `/video/home-film.mp4`, `/video/home-film-m.mp4`, `/images/film/hero.webp`, `/images/film/hero-m.webp`.

- [x] **Step 1: Test que falla**

`tests/unit/filmMap.spec.ts`:
```ts
import { expect, test } from "@playwright/test";
import { type FilmBeat, filmTimeAt, veilAt } from "../../src/components/film/filmMap";

const beats: FilmBeat[] = [
  { id: "hero", start: 0, end: 3.17 },
  { id: "tagline", start: 3.17, end: 7.03 },
];

test("before the first section reaches the top the film sits on its first frame", () => {
  const boxes = [
    { id: "hero", top: 40, height: 1600 },
    { id: "tagline", top: 1640, height: 2000 },
  ];
  expect(filmTimeAt(beats, boxes)).toBe(0);
});

test("progress through a section walks that section's shots", () => {
  const boxes = [
    { id: "hero", top: -800, height: 1600 },
    { id: "tagline", top: 800, height: 2000 },
  ];
  expect(filmTimeAt(beats, boxes)).toBeCloseTo(1.585, 3);
});

test("a section that has fully passed hands over to the next one", () => {
  const boxes = [
    { id: "hero", top: -2100, height: 1600 },
    { id: "tagline", top: -500, height: 2000 },
  ];
  expect(filmTimeAt(beats, boxes)).toBeCloseTo(3.17 + 0.25 * 3.86, 3);
});

test("past the last section the film holds its last mapped frame", () => {
  const boxes = [
    { id: "hero", top: -9000, height: 1600 },
    { id: "tagline", top: -7400, height: 2000 },
  ];
  expect(filmTimeAt(beats, boxes)).toBeCloseTo(7.03, 3);
});

test("sections without a beat or without height are ignored", () => {
  const boxes = [
    { id: "unknown", top: -50, height: 100 },
    { id: "hero", top: -800, height: 0 },
  ];
  expect(filmTimeAt(beats, boxes)).toBe(0);
});

test("the veil darkens during the white flashes", () => {
  expect(veilAt(1)).toBe(0.58);
  expect(veilAt(12.5)).toBe(0.82);
  expect(veilAt(15.5)).toBe(0.82);
  expect(veilAt(16)).toBe(0.58);
});
```

- [x] **Step 2: Verlo fallar**

Run: `npx playwright test --project=unit tests/unit/filmMap.spec.ts`
Expected: FAIL, `Cannot find module '../../src/components/film/filmMap'`.

- [x] **Step 3: Implementación**

`src/components/film/filmMap.ts`:
```ts
/** A stretch of the home film, in seconds, owned by one landing section. */
export interface FilmBeat {
  id: string;
  start: number;
  end: number;
}

/** A section's box relative to the top of the viewport. */
export interface SectionBox {
  id: string;
  top: number;
  height: number;
}

export const FILM_DURATION = 24.8;

/**
 * public/video/home-film.mp4 is an edit, not one take. Its cuts fall at 3.17,
 * 5.17, 7.03, 12.40, 15.50, 20.77 and 23.67 s; beats start and end on cuts so a
 * change of shot lands on a change of message.
 */
export const FILM_BEATS: FilmBeat[] = [
  { id: "hero", start: 0, end: 3.17 },
  { id: "tagline", start: 3.17, end: 7.03 },
];

/** White flash transitions in the edit; text over them needs a darker veil. */
const FILM_FLASHES: [number, number][] = [
  [12.3, 12.75],
  [15.35, 15.7],
];
const VEIL_BASE = 0.58;
const VEIL_FLASH = 0.82;

/**
 * Film time for the current scroll position. Sections are read top to bottom:
 * each one that has reached the top of the viewport takes over, and its own
 * progress (0 at its top edge, 1 at its bottom edge) walks its beat.
 */
export function filmTimeAt(beats: FilmBeat[], boxes: SectionBox[]): number {
  let time = beats[0]?.start ?? 0;
  for (const box of boxes) {
    const beat = beats.find((candidate) => candidate.id === box.id);
    if (!beat || box.height <= 0) continue;
    if (box.top > 0) break;
    const progress = Math.min(1, -box.top / box.height);
    time = beat.start + (beat.end - beat.start) * progress;
  }
  return time;
}

/** Opacity of the flat black veil over the film at a given time. */
export function veilAt(time: number): number {
  return FILM_FLASHES.some(([from, to]) => time >= from && time <= to) ? VEIL_FLASH : VEIL_BASE;
}
```

- [x] **Step 4: Verlo pasar**

Run: `npx playwright test --project=unit tests/unit/filmMap.spec.ts`
Expected: `6 passed`.

- [x] **Step 5: Script de codificación**

`scripts/media/encode-film.sh`:
```bash
#!/bin/bash
# Encodes the home film for scroll scrubbing. Small GOPs keep seeks cheap; the
# clip is played from an in-memory Blob, so it does not need to be all-intra.
# Usage: bash scripts/media/encode-film.sh [source.mp4]
set -euo pipefail
SRC="${1:-D:/Portafolio/Video Home/Video Renderizado/Video-Renderizado.mp4}"
OUT=public/video
IMG=public/images/film
mkdir -p "$OUT" "$IMG"
COMMON=(-an -c:v libx264 -preset slow -pix_fmt yuv420p -sc_threshold 0 -movflags +faststart)

ffmpeg -v error -y -i "$SRC" -vf "scale=1280:-2" "${COMMON[@]}" -crf 23 -g 8 -keyint_min 8 "$OUT/home-film.mp4"
# Centre crop for now; the shot-by-shot portrait reframe is Plan B.
ffmpeg -v error -y -i "$SRC" -vf "crop=ih*9/16:ih,scale=720:-2" "${COMMON[@]}" -crf 24 -g 4 -keyint_min 4 "$OUT/home-film-m.mp4"

ffmpeg -v error -y -i "$OUT/home-film.mp4" -frames:v 1 -c:v libwebp -quality 80 "$IMG/hero.webp"
ffmpeg -v error -y -i "$OUT/home-film-m.mp4" -frames:v 1 -c:v libwebp -quality 80 "$IMG/hero-m.webp"

ls -la "$OUT"/home-film*.mp4 "$IMG"/hero*.webp
```

Run: `bash scripts/media/encode-film.sh`
Expected: cuatro archivos. `home-film.mp4` ≤ 15 728 640 bytes y `home-film-m.mp4` ≤ 12 582 912 bytes. Si alguno se pasa, subir su `-crf` en 1 y repetir.

- [x] **Step 6: Mirar los fotogramas**

```bash
S=.perf/film-check; mkdir -p $S
ffmpeg -v error -y -i public/video/home-film.mp4 -vf "select='eq(n\,0)+eq(n\,47)+eq(n\,94)+eq(n\,96)+eq(n\,154)+eq(n\,156)+eq(n\,210)+eq(n\,212)',scale=480:-2,tile=4x2:padding=6" -fps_mode passthrough -frames:v 1 $S/beats.jpg
```
Abrir `$S/beats.jpg`, `public/images/film/hero.webp` y `hero-m.webp` con la herramienta Read. Comprobar: (a) el póster no es un fotograma negro ni un fundido; (b) los fotogramas 94/96 y 210/212 son planos distintos, es decir, los cortes de 3.17 s y 7.03 s caen donde dice `FILM_BEATS`. Si un corte está corrido, ajustar `start`/`end` en `filmMap.ts` y los números del test del Step 1 al valor real, y repetir el Step 4.

- [x] **Step 7: Commit**

```bash
git add scripts/media/encode-film.sh public/video/home-film.mp4 public/video/home-film-m.mp4 public/images/film/hero.webp public/images/film/hero-m.webp src/components/film/filmMap.ts tests/unit/filmMap.spec.ts
git commit -m "feat: home film clips and the scroll-to-time map

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Tipografía Geist y fondos planos

**Files:**
- Modify: `src/app/fonts.ts`, `src/resources/custom.css`, `src/components/motion/motion.css`, `src/app/layout.tsx`
- Modify: `tests/e2e/motion-boot.spec.ts` (test de la retícula), `tests/e2e/intro-font.spec.ts-snapshots/*`

**Interfaces:**
- Produces: variables CSS `--ease-fluid`, `--dur-xl`, `--shift-l` y `--cobalt` (ya existía) en `:root`. `--font-heading`, `--font-body` y `--font-code` siguen existiendo con los mismos nombres.

- [x] **Step 1: Test que falla**

En `tests/e2e/motion-boot.spec.ts`, reemplazar el test `the page background is a single blueprint grid at <= 8% opacity` por:
```ts
test("the page background is flat black in the dark theme, with no pattern", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/about");
  const bg = await page.evaluate(() => ({
    color: getComputedStyle(document.body).backgroundColor,
    pattern: getComputedStyle(document.body, "::before").backgroundImage,
  }));
  expect(bg.color).toBe("rgb(0, 0, 0)");
  expect(bg.pattern).toBe("none");
});

test("headings and body use Geist; figures use Geist Mono", async ({ page }) => {
  await page.goto("/about");
  const fonts = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      heading: root.getPropertyValue("--font-heading"),
      body: root.getPropertyValue("--font-body"),
      code: root.getPropertyValue("--font-code"),
    };
  });
  expect(fonts.heading).toContain("Geist");
  expect(fonts.body).toContain("Geist");
  expect(fonts.code).toContain("Geist Mono");
});
```

- [x] **Step 2: Verlo fallar**

Run: `npm run build && npx playwright test --project=chromium tests/e2e/motion-boot.spec.ts`
Expected: FAIL en los dos tests nuevos (`rgb(11, 11, 15)` y `Space Grotesk`).

- [x] **Step 3: Fuentes**

`src/app/fonts.ts`, reemplazar el import y las tres declaraciones (conservar el comentario sobre los preloads en Windows; cambiar su primera línea por la de abajo):
```ts
// Font declarations. Geist for headings and body, Geist Mono for figures —
// chosen by Erick on 2026-10-09 for the landing redesign; this replaces the
// brand manual's Space Grotesk / Inter / JetBrains Mono trio.
import { Geist, Geist_Mono } from "next/font/google";

export const heading = Geist({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const code = Geist_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});
```
Borrar el comentario largo sobre JetBrains Mono y el CLS de About: ya no aplica.

- [x] **Step 4: Neutros planos y tokens de movimiento**

`src/resources/custom.css`:
- `--scheme-neutral-100: #0b0b0f;` → `--scheme-neutral-100: #000000;`
- `--scheme-neutral-200: #16161a;` → `--scheme-neutral-200: #181818;`
- En el comentario de cabecera, la línea `neutral-100 = Obsidiana Profunda exactly (dark-mode page background);` → `neutral-100/200 = flat #000000 / #181818 (landing redesign, 2026-10-09);`
- El comentario `/* Labels use the body Inter instance (one font download instead of two). */` → `/* Labels share the body font. */`

`src/components/motion/motion.css`:
- Primera línea del comentario de cabecera: `/* ─── Motion system ───` (quitar «Blueprint → Live System»).
- En `:root`, añadir después de `--ease-out`:
```css
  --dur-xl: 800ms;
  /* Heavy, fluid curve used by every new transition (landing skill, B7). */
  --ease-fluid: cubic-bezier(0.32, 0.72, 0, 1);
  --shift-l: 64px;
```
- Borrar el bloque completo `/* ─── Blueprint Grid … */` con las reglas `.blueprint-bg` y `.blueprint-bg::before`.
- Después del bloque `@supports (animation-timeline: view())` del Reveal, añadir:
```css
/* Full tier only: entries also come out of a blur. Lite keeps opacity/translate. */
@keyframes mo-reveal-up-blur {
  from {
    opacity: 0;
    transform: translateY(var(--shift-l));
    filter: blur(12px);
    animation-timing-function: var(--ease-fluid);
  }
  to {
    opacity: 1;
    transform: none;
    filter: blur(0);
  }
}
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    html[data-fx="full"] [data-reveal]:not([data-reveal="left"]) {
      animation-name: mo-reveal-up-blur;
    }
  }
}
```
- En el bloque de `prefers-reduced-motion: reduce`, añadir `filter: none !important;` a la lista de declaraciones.

`src/app/layout.tsx`: quitar la línea `className="blueprint-bg"` del `<Column as="body">`.

- [x] **Step 5: Verlo pasar y regenerar las capturas del intro**

```bash
npm run build && npx playwright test --project=chromium tests/e2e/motion-boot.spec.ts tests/e2e/reveal.spec.ts
npx playwright test --project=chromium tests/e2e/intro-font.spec.ts --update-snapshots
```
Expected: motion-boot y reveal en verde. Abrir los PNG de `tests/e2e/intro-font.spec.ts-snapshots/` con Read y comprobar que el wordmark «Erick Mahecha» sale en Geist, completo y sin cortes.

Comprobar que no se descarga una fuente de más:
```bash
curl -s http://localhost:3100/about | grep -o 'rel="preload"[^>]*as="font"[^>]*' | wc -l
```
(En Windows da 0 por el bug de Next; en ese caso contar los `.woff2` de `.next/static/media`: deben ser los de Geist y Geist Mono, ninguno de Space Grotesk, Inter o JetBrains.)

- [x] **Step 6: Gates y commit**

```bash
npx @biomejs/biome check src --max-diagnostics=0 && node scripts/quality/biome-gate.mjs HEAD && npx tsc --noEmit
git add src/app/fonts.ts src/resources/custom.css src/components/motion/motion.css src/app/layout.tsx tests/e2e/motion-boot.spec.ts tests/e2e/intro-font.spec.ts-snapshots
git commit -m "feat: Geist typography and flat backgrounds; drop the blueprint grid

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Nav en píldora flotante y menú móvil

**Files:**
- Modify: `src/components/Header.tsx`, `src/components/Header.module.scss`, `src/app/layout.tsx`, `src/resources/custom.css`
- Modify: `tests/e2e/helpers.ts`, `tests/e2e/view-transitions.spec.ts`, `tests/e2e/a11y-names.spec.ts`, `scripts/quality/csp-check.mjs`, `scripts/perf/inp.mjs`
- Test: `tests/e2e/nav.spec.ts`

**Interfaces:**
- Consumes: `--ease-fluid`, `--cobalt` (Task 2).
- Produces: `headerLink(page: Page, name: string): Promise<Locator>` en `tests/e2e/helpers.ts`. El header es `position: fixed` y no ocupa espacio en el flujo; `.main-content-wrapper` reserva 96 px arriba.

- [x] **Step 1: Test que falla**

`tests/e2e/nav.spec.ts`:
```ts
import { expect, test } from "./fixtures";

const isMobile = (name: string) => name === "mobile-chromium";

test("the nav is a floating pill detached from the top", async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo.project.name), "desktop layout");
  await page.goto("/about");
  const pill = page.locator("header nav");
  const box = await pill.boundingBox();
  const style = await pill.evaluate((el) => {
    const s = getComputedStyle(el);
    return { radius: Number.parseFloat(s.borderTopLeftRadius), position: getComputedStyle(el.closest("header") as HTMLElement).position };
  });
  expect(style.position).toBe("fixed");
  expect(style.radius).toBeGreaterThan(100);
  expect(box?.y).toBe(24);
  expect(box?.width).toBeLessThan(900);
});

test("the current page is marked in the nav", async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo.project.name), "desktop layout");
  await page.goto("/work");
  await expect(page.locator("header").getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "page");
});

test.describe("mobile menu", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(!isMobile(testInfo.project.name), "phone layout");
  });

  test("the burger opens a full screen menu and Escape closes it", async ({ page }) => {
    await page.goto("/about");
    const burger = page.getByRole("button", { name: "Open menu" });
    await expect(burger).toHaveAttribute("aria-expanded", "false");
    await burger.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#site-menu").getByRole("link", { name: "Projects" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await expect(page.locator("#site-menu").getByRole("link", { name: "Projects" })).toBeHidden();
  });

  test("choosing a link closes the menu", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.locator("#site-menu").getByRole("link", { name: "Projects" }).click();
    await page.waitForURL("**/work");
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });
});
```

- [x] **Step 2: Verlo fallar**

Run: `npx playwright test --project=chromium --project=mobile-chromium tests/e2e/nav.spec.ts`
Expected: FAIL (`header nav` no existe; no hay botón «Open menu»).

- [x] **Step 3: Header**

En `src/components/Header.tsx`, conservar `TimeDisplay` y su `export default` tal cual, y reemplazar el componente `Header` y los imports por:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import { about, blog, display, gallery, routes, work } from "@/resources";
import { EMIcon } from "@/resources/EMIcon";
import styles from "./Header.module.scss";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/about", label: about.label },
  { href: "/work", label: work.label },
  { href: "/blog", label: blog.label },
  { href: "/gallery", label: gallery.label },
] as const;

export const Header = () => {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const links = NAV.filter((link) => routes[link.href]);
  const current = (href: string) => (pathname.startsWith(href) ? "page" : undefined);

  // A navigation always leaves the menu closed.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger, not an input
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      burgerRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={styles.header} style={{ viewTransitionName: "site-header" }}>
      <nav className={styles.pill} aria-label="Main">
        {routes["/"] && (
          <Link
            href="/"
            className={styles.brand}
            aria-label="Erick Mahecha — Home"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <EMIcon />
          </Link>
        )}
        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link} aria-current={current(link.href)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        {display.themeSwitcher && <ThemeToggle />}
        <button
          ref={burgerRef}
          type="button"
          className={styles.burger}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </nav>
      <div id="site-menu" className={styles.menu} data-open={open} inert={!open}>
        <ul className={styles.menuList}>
          {links.map((link, i) => (
            <li key={link.href} style={{ "--i": i } as CSSProperties}>
              <Link href={link.href} className={styles.menuLink} aria-current={current(link.href)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};
```
Si `EMIcon` exige props (tamaño o color), pasarle los que use `LazyVideo.tsx`.

`src/components/Header.module.scss`, reemplazar todo el contenido:
```scss
@use "./breakpoints.scss" as breakpoints;

$ease: var(--ease-fluid);

.header {
  position: fixed;
  top: 24px;
  left: 0;
  right: 0;
  z-index: 9;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.pill {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  width: max-content;
  padding: 4px;
  border: 1px solid var(--neutral-alpha-weak);
  border-radius: 9999px;
  background: color-mix(in srgb, var(--page-background) 70%, transparent);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  backdrop-filter: blur(16px) saturate(1.4);
}

.links {
  display: flex;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.brand,
.link {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  color: var(--neutral-on-background-weak);
  text-decoration: none;
  transition: color 700ms $ease, background-color 700ms $ease, transform 700ms $ease;
}

.brand {
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 20px;
}

.link {
  padding: 8px 12px;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
}

.brand:hover,
.link:hover,
.brand[aria-current="page"],
.link[aria-current="page"] {
  color: var(--neutral-on-background-strong);
}

.link:hover {
  background: var(--neutral-alpha-weak);
}

.link[aria-current="page"] {
  background: var(--neutral-alpha-medium);
}

.brand:active,
.link:active,
.burger:active {
  transform: scale(0.98);
}

.brand:focus-visible,
.link:focus-visible,
.burger:focus-visible,
.menuLink:focus-visible {
  outline: 2px solid var(--cobalt);
  outline-offset: 2px;
}

.burger {
  display: none;
  position: relative;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  color: var(--neutral-on-background-strong);
  cursor: pointer;
}

.burger span {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 50%;
  height: 2px;
  margin-top: -1px;
  border-radius: 2px;
  background: currentColor;
  transition: transform 700ms $ease;
}

.burger span:first-child {
  transform: translateY(-4px);
}

.burger span:last-child {
  transform: translateY(4px);
}

.burger[aria-expanded="true"] span:first-child {
  transform: rotate(45deg);
}

.burger[aria-expanded="true"] span:last-child {
  transform: rotate(-45deg);
}

.menu {
  position: fixed;
  inset: 0;
  z-index: -1;
  display: grid;
  place-items: center;
  pointer-events: auto;
  background: color-mix(in srgb, var(--page-background) 80%, transparent);
  -webkit-backdrop-filter: blur(64px);
  backdrop-filter: blur(64px);
  opacity: 0;
  visibility: hidden;
  transition: opacity 700ms $ease, visibility 0s linear 700ms;
}

.menu[data-open="true"] {
  opacity: 1;
  visibility: visible;
  transition: opacity 700ms $ease, visibility 0s;
}

.menuList {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: center;
}

.menuLink {
  display: block;
  padding: 12px 24px;
  border-radius: 16px;
  font-size: 2.25rem;
  line-height: 2.5rem;
  font-weight: 600;
  color: var(--neutral-on-background-strong);
  text-decoration: none;
  opacity: 0;
  transform: translateY(48px);
  transition: opacity 700ms $ease, transform 700ms $ease;
}

.menu[data-open="true"] .menuLink {
  opacity: 1;
  transform: none;
  transition-delay: calc(100ms + var(--i) * 50ms);
}

@media (max-width: breakpoints.$s) {
  .links {
    display: none;
  }

  .burger {
    display: inline-block;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand,
  .link,
  .burger span,
  .menu,
  .menuLink {
    transition: none;
  }

  .menuLink {
    transform: none;
  }
}
```

`src/app/layout.tsx`: borrar la línea `<Flex fillWidth minHeight="16" s={{ hide: true }} />`.

`src/resources/custom.css`: reemplazar el bloque «Mobile bottom-nav clearance» (comentario y `@media`) por:
```css
/* The header is a fixed floating pill (24px offset + 48px tall), so pages
   reserve room above their content instead of the header taking flow space. */
.main-content-wrapper {
  padding-top: 96px !important;
}
```

- [x] **Step 4: Helper y specs que hacían clic en el header**

En `tests/e2e/helpers.ts` añadir (y `Locator` al import de tipos):
```ts
/** A visible header link; on phones the links live in the menu, which is opened first. */
export async function headerLink(page: Page, name: string): Promise<Locator> {
  const burger = page.getByRole("button", { name: "Open menu" });
  if (await burger.isVisible()) await burger.click();
  return page.locator("header").getByRole("link", { name, exact: true });
}
```
Localizar los usos: `grep -n 'header' tests/e2e/view-transitions.spec.ts tests/e2e/a11y-names.spec.ts scripts/quality/csp-check.mjs scripts/perf/inp.mjs`.
- `view-transitions.spec.ts`: cada `page.locator("header").getByRole("link", { name: "Projects" })` (o equivalente) pasa a `await headerLink(page, "Projects")`.
- `a11y-names.spec.ts`: el test `icon-only nav links have accessible names` se reemplaza por:
```ts
  test("the home link and the menu button have accessible names", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("link", { name: "Erick Mahecha — Home" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });
```
- `scripts/quality/csp-check.mjs`: antes de `const link = page.locator(...)` añadir
```js
    const burger = page.getByRole("button", { name: "Open menu" });
    if (await burger.isVisible()) await burger.click();
```
- `scripts/perf/inp.mjs`: el mismo par de líneas antes de su clic en el enlace del header.

- [x] **Step 5: Verlo pasar**

```bash
npm run build && npx playwright test --project=chromium --project=mobile-chromium tests/e2e/nav.spec.ts tests/e2e/view-transitions.spec.ts tests/e2e/a11y-names.spec.ts tests/e2e/smoke.spec.ts
```
Expected: todo en verde.

- [x] **Step 6: Gates y commit**

```bash
npx @biomejs/biome check src --max-diagnostics=0 && node scripts/quality/biome-gate.mjs HEAD && npx tsc --noEmit
git add src/components/Header.tsx src/components/Header.module.scss src/app/layout.tsx src/resources/custom.css tests/e2e/nav.spec.ts tests/e2e/helpers.ts tests/e2e/view-transitions.spec.ts tests/e2e/a11y-names.spec.ts scripts/quality/csp-check.mjs scripts/perf/inp.mjs
git commit -m "feat: floating pill nav with a full screen mobile menu

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `ScrollFilm`, CSP y hero de la Home

**Files:**
- Create: `src/components/film/ScrollFilm.tsx`, `ScrollFilm.module.scss`, `FilmSection.tsx`, `FilmSection.module.scss`
- Create: `src/resources/landing.ts`, `src/components/landing/Hero.tsx`, `CallButton.tsx`, `landing.module.scss`
- Modify: `src/app/page.tsx`, `next.config.mjs`, `src/resources/custom.css`
- Delete: `tests/e2e/home-rail.spec.ts`, `tests/e2e/decode.spec.ts`, `tests/e2e/lazy-video.spec.ts`
- Modify: `tests/e2e/kinetic.spec.ts`, `pointer-fx.spec.ts`, `motion-boot.spec.ts`, `intro-sequence.spec.ts`, `ssr-content.spec.ts`
- Test: `tests/e2e/film.spec.ts`

**Interfaces:**
- Consumes: `FilmBeat`, `SectionBox`, `FILM_BEATS`, `FILM_DURATION`, `filmTimeAt`, `veilAt` y las rutas de assets (Task 1); `--ease-fluid`, `--cobalt` (Task 2); header fijo y `padding-top` del wrapper (Task 3).
- Produces: `<ScrollFilm src srcMobile poster posterMobile beats duration>{children}</ScrollFilm>`; `<FilmSection beat={string} screens={number}>{children}</FilmSection>`; `landing` (`hero.headline`, `hero.subline`, `hero.risk`, `cta.label`, `tagline: string[]`); `<CallButton />`. Atributos DOM: `[data-film-root]`, `[data-film-ready]` (cuando el clip ya pintó), `[data-film-video]`, `[data-film-stage]`, `[data-film-beat="<id>"]`, `[data-cta="primary"]`. La línea de tiempo CSS `--film-section` queda definida en cada `<section>` para sus descendientes.

- [x] **Step 1: Test que falla**

`tests/e2e/film.spec.ts`:
```ts
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const HEADLINE = "I build your marketing engine from zero and make it outperform a full department.";

const introDone = (page: Page) =>
  expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains("intro-pending")), {
      timeout: 8000,
    })
    .toBe(false);

const filmReady = (page: Page) =>
  expect
    .poll(
      () =>
        page.evaluate(() =>
          Boolean(document.querySelector("[data-film-root]")?.hasAttribute("data-film-ready")),
        ),
      { timeout: 20000 },
    )
    .toBe(true);

const filmTime = (page: Page) =>
  page.evaluate(() => (document.querySelector("[data-film-video]") as HTMLVideoElement).currentTime);

const scrollIntoBeat = (page: Page, beat: string, progress: number) =>
  page.evaluate(
    ([id, p]) => {
      const el = document.querySelector(`[data-film-beat="${id}"]`) as HTMLElement;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + el.offsetHeight * (p as number));
    },
    [beat, progress] as const,
  );

test.describe("scrubbing", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      !["chromium", "mobile-chromium"].includes(testInfo.project.name),
      "scrubbing is asserted on Chromium; other engines are covered by the SSR and poster checks",
    );
  });

  test("the film follows the scroll position, forwards and backwards", async ({ page }) => {
    await page.goto("/");
    await introDone(page);
    await filmReady(page);
    await scrollIntoBeat(page, "tagline", 0.5);
    await expect.poll(() => filmTime(page)).toBeGreaterThan(4.6);
    expect(await filmTime(page)).toBeLessThan(5.6);
    for (const p of [0.9, 0.1, 0.7, 0.2]) await scrollIntoBeat(page, "tagline", p);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => filmTime(page)).toBeLessThan(0.3);
  });

  test("the clip plays from memory and is seekable end to end", async ({ page }) => {
    await page.goto("/");
    await filmReady(page);
    const video = await page.evaluate(() => {
      const v = document.querySelector("[data-film-video]") as HTMLVideoElement;
      return { src: v.currentSrc, seekable: v.seekable.length ? v.seekable.end(0) : 0 };
    });
    expect(video.src.startsWith("blob:")).toBe(true);
    expect(video.seekable).toBeGreaterThan(20);
  });

  test("the stage stays pinned while its sections scroll", async ({ page }) => {
    await page.goto("/");
    await introDone(page);
    await page.evaluate(() => window.scrollTo(0, 500));
    const top = await page.evaluate(
      () => (document.querySelector("[data-film-stage]") as HTMLElement).getBoundingClientRect().top,
    );
    expect(top).toBe(0);
  });

  test("phones get the portrait encode", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "phone only");
    await page.goto("/");
    await filmReady(page);
    const size = await page.evaluate(() => {
      const v = document.querySelector("[data-film-video]") as HTMLVideoElement;
      return { w: v.videoWidth, h: v.videoHeight };
    });
    expect(size.w).toBeLessThan(size.h);
  });
});

const mp4Requests = (page: Page) => {
  const urls: string[] = [];
  page.on("request", (request) => {
    if (/\.mp4(\?|$)/.test(request.url())) urls.push(request.url());
  });
  return urls;
};

test("reduced motion: no video is downloaded and the poster stays", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const urls = mp4Requests(page);
  await page.goto("/");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1500);
  expect(urls).toEqual([]);
  await expect(page.locator("[data-film-stage] img")).toBeVisible();
});

test("lite tier: no video is downloaded", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 });
  });
  const urls = mp4Requests(page);
  await page.goto("/");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1500);
  expect(urls).toEqual([]);
});

test("a failed film download leaves the poster and logs nothing", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.route("**/video/home-film*.mp4", (route) => route.abort());
  await page.goto("/");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1500);
  await expect(page.locator("[data-film-stage] img")).toBeVisible();
  await expect(page.locator("[data-film-root]")).not.toHaveAttribute("data-film-ready", "");
  expect(errors).toEqual([]);
});

test("the h1 and the call link are in the server HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain(HEADLINE);
  expect(html).toContain("https://calendly.com/santiagomahecha2328/30min");
});

test("there is exactly one primary call to action above the fold", async ({ page }) => {
  await page.goto("/");
  const visible = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('[data-cta="primary"]')).filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      }).length,
  );
  expect(visible).toBe(1);
  await expect(page.locator('[data-cta="primary"]').first()).toHaveAttribute(
    "href",
    "https://calendly.com/santiagomahecha2328/30min",
  );
});

for (const width of [390, 859, 861, 1024, 1440]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
```

- [x] **Step 2: Verlo fallar**

Run: `npx playwright test --project=chromium tests/e2e/film.spec.ts`
Expected: FAIL (no existe `[data-film-root]`; el HTML no contiene el titular nuevo).

- [x] **Step 3: CSP**

`next.config.mjs`: `"media-src 'self'",` → `"media-src 'self' blob:",` y añadir a la lista del comentario de la CSP:
```js
 *   - media-src blob: the home film is fetched once and scrubbed from an in-memory Blob
```
Si `tests/e2e/ssr-content.spec.ts` (`csp is intact outside webkit-localhost`) compara el texto de `media-src`, actualizarlo al valor nuevo.

- [x] **Step 4: Copy**

`src/resources/landing.ts`:
```ts
/** Copy for the home landing page (spec 2026-10-09, §3). Plain strings only. */
export const landing = {
  hero: {
    headline: "I build your marketing engine from zero and make it outperform a full department.",
    subline:
      "For founders who need content, CRM and paid media working as one system. At Quick Metal Shop that meant 338K+ organic views with $0 in ad spend.",
    risk: "30 minutes. No commitment.",
  },
  cta: { label: "Book a 30 minute call" },
  tagline: ["Most companies hire a department.", "I build the system that does the work of one."],
} as const;
```

- [x] **Step 5: `FilmSection` y `ScrollFilm`**

`src/components/film/FilmSection.tsx`:
```tsx
import type { CSSProperties, ReactNode } from "react";
import styles from "./FilmSection.module.scss";

interface FilmSectionProps {
  /** Id of the FilmBeat this section scrubs through. */
  beat: string;
  /** Scroll length in viewport heights; the content stays pinned for all but the last one. */
  screens?: number;
  children: ReactNode;
}

/** A landing section laid over the film: its content pins while the film plays its beat. */
export function FilmSection({ beat, screens = 2, children }: FilmSectionProps) {
  return (
    <section
      data-film-beat={beat}
      className={styles.section}
      style={{ "--screens": screens } as CSSProperties}
    >
      <div className={styles.pin}>{children}</div>
    </section>
  );
}
```

`src/components/film/FilmSection.module.scss`:
```scss
.section {
  min-height: calc(var(--screens) * 100vh);
  min-height: calc(var(--screens) * 100svh);
  /* Descendants animate against the section, which keeps moving while .pin is stuck. */
  view-timeline-name: --film-section;
}

.pin {
  position: sticky;
  top: 0;
  display: grid;
  align-content: center;
  box-sizing: border-box;
  width: 100%;
  max-width: 1120px;
  min-height: 100vh;
  min-height: 100svh;
  margin-inline: auto;
  padding: 96px 24px 48px;
}
```

`src/components/film/ScrollFilm.tsx`:
```tsx
"use client";

import { type ReactNode, useEffect, useRef } from "react";
import styles from "./ScrollFilm.module.scss";
import { type FilmBeat, type SectionBox, filmTimeAt, veilAt } from "./filmMap";

interface ScrollFilmProps {
  src: string;
  srcMobile: string;
  poster: string;
  posterMobile: string;
  beats: FilmBeat[];
  duration: number;
  children: ReactNode;
}

/**
 * A full-viewport film pinned behind its children and scrubbed by scroll: each
 * child section tagged data-film-beat walks its beat as it crosses the top of
 * the viewport. The clip is fetched once after `load` and played from a Blob,
 * so every seek is instant. Reduced motion and the lite tier never download
 * it — the poster stays, and so does every word of the content.
 */
export function ScrollFilm({
  src,
  srcMobile,
  poster,
  posterMobile,
  beats,
  duration,
  children,
}: ScrollFilmProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.dataset.fx === "lite") return;

    const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const mobile = coarse || window.matchMedia("(max-width: 860px)").matches;
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-film-beat]"));
    // Coarser steps on phones mean fewer decodes.
    const step = mobile ? 0.02 : 0.008;
    const last = duration - 0.05;
    const abort = new AbortController();
    let objectUrl = "";
    let ready = false;
    let current = 0;
    let frame = 0;

    const measure = (): SectionBox[] =>
      sections.map((el) => {
        const rect = el.getBoundingClientRect();
        return { id: el.dataset.filmBeat ?? "", top: rect.top, height: rect.height };
      });

    const tick = () => {
      frame = 0;
      const target = Math.min(last, filmTimeAt(beats, measure()));
      current += (target - current) * 0.2;
      if (Math.abs(target - current) < 0.004) current = target;
      root.style.setProperty("--film-veil", String(veilAt(current)));
      // Never queue a seek behind one still decoding: fast flicks would pile up and freeze the clip.
      if (ready && !video.seeking && Math.abs(video.currentTime - current) > step) {
        video.currentTime = current;
      }
      if (current !== target || (ready && video.seeking)) schedule();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // iOS paints nothing for a muted video that was seeked but never played.
    const prime = () => {
      if (!ready) return;
      video
        .play()
        .then(() => video.pause())
        .catch(() => {});
    };

    const onLoaded = () => {
      ready = true;
      video.pause();
      // The poster stays until a real frame has painted.
      video.addEventListener("seeked", () => root.setAttribute("data-film-ready", ""), {
        once: true,
      });
      video.currentTime = Math.max(current, 0.001);
      prime();
      schedule();
    };

    const load = async () => {
      try {
        const response = await fetch(mobile ? srcMobile : src, { signal: abort.signal });
        if (!response.ok) return;
        objectUrl = URL.createObjectURL(await response.blob());
        video.addEventListener("loadeddata", onLoaded, { once: true });
        video.src = objectUrl;
        video.load();
      } catch {
        // Aborted, offline or blocked: the poster stays.
      }
    };
    const start = () => void load();

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("touchstart", prime, { once: true, passive: true });
    schedule();

    return () => {
      abort.abort();
      cancelAnimationFrame(frame);
      window.removeEventListener("load", start);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("touchstart", prime);
      video.removeEventListener("loadeddata", onLoaded);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, srcMobile, beats, duration]);

  return (
    <div ref={rootRef} className={styles.film} data-film-root="">
      <div className={styles.stage} data-film-stage="" aria-hidden="true">
        <picture>
          <source media="(max-width: 860px)" srcSet={posterMobile} />
          <img src={poster} alt="" className={styles.media} fetchPriority="high" />
        </picture>
        <video
          ref={videoRef}
          className={`${styles.media} ${styles.video}`}
          muted
          playsInline
          preload="none"
          tabIndex={-1}
          data-film-video=""
        />
        <div className={styles.veil} />
      </div>
      <div className={styles.track}>{children}</div>
    </div>
  );
}
```

`src/components/film/ScrollFilm.module.scss`:
```scss
.film {
  position: relative;
  width: 100%;
  /* The film is always dark footage, so its copy is light in both themes. */
  color: #ffffff;
  --film-veil: 0.58;
}

.stage {
  position: sticky;
  top: 0;
  z-index: 0;
  height: 100vh;
  /* The large viewport: the stage must not resize when a phone's URL bar slides. */
  height: 100lvh;
  overflow: hidden;
  background: #000000;
}

.media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video {
  opacity: 0;
}

.film[data-film-ready] .video {
  opacity: 1;
}

/* A flat veil, never a gradient: keeps the copy readable over bright footage. */
.veil {
  position: absolute;
  inset: 0;
  background: #000000;
  opacity: var(--film-veil);
}

.track {
  position: relative;
  z-index: 1;
  margin-top: -100vh;
  margin-top: -100lvh;
}
```

- [x] **Step 6: Hero, CTA y página**

`src/components/landing/CallButton.tsx`:
```tsx
import { about } from "@/resources";
import { landing } from "@/resources/landing";
import styles from "./landing.module.scss";

/** The landing's one action. Rendered at the top and repeated at the end, never beside another CTA. */
export function CallButton() {
  return (
    <a
      href={about.calendar.link}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.cta}
      data-cta="primary"
    >
      {landing.cta.label}
    </a>
  );
}
```

`src/components/landing/Hero.tsx`:
```tsx
import { FilmSection } from "@/components/film/FilmSection";
import { home } from "@/resources";
import { landing } from "@/resources/landing";
import { CallButton } from "./CallButton";
import styles from "./landing.module.scss";

export function Hero() {
  return (
    <FilmSection beat="hero" screens={2}>
      <div className={styles.hero}>
        <h1 className={styles.headline}>{landing.hero.headline}</h1>
        <p className={styles.subline}>{landing.hero.subline}</p>
        <div className={styles.action}>
          <CallButton />
          <span className={styles.risk}>{landing.hero.risk}</span>
        </div>
        {home.stats && home.stats.length > 0 && (
          <ul className={styles.stats}>
            {home.stats.map((stat) => (
              <li key={stat.label} className={styles.stat}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FilmSection>
  );
}
```

`src/components/landing/landing.module.scss`:
```scss
$ease: var(--ease-fluid);

.home {
  width: 100%;
}

.hero {
  display: grid;
  gap: 24px;
  justify-items: start;
}

.headline {
  max-width: 680px;
  margin: 0;
  font-family: var(--font-heading), sans-serif;
  font-size: 2.25rem;
  line-height: 2.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-wrap: balance;
  /* The one gradient the system allows: on the hero heading's text, never on a background. */
  background: linear-gradient(90deg, #ffffff, #9b9b9b);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subline {
  max-width: 680px;
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.75rem;
  color: #dcdddf;
  text-wrap: pretty;
}

.action {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.cta {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 9999px;
  background: var(--cobalt);
  color: #f4f5f7;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 700ms $ease, transform 700ms $ease;
}

.cta:hover {
  background: #2549cb;
}

.cta:active {
  transform: scale(0.98);
}

.cta:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}

.risk {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #afafb2;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, max-content);
  gap: 16px 40px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
}

.stat {
  display: grid;
  gap: 4px;
}

.statValue {
  font-family: var(--font-code), monospace;
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.statLabel {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #afafb2;
}

.flat {
  box-sizing: border-box;
  width: 100%;
  max-width: 1120px;
  margin-inline: auto;
  padding: 96px 24px;
}

@media (min-width: 768px) {
  .headline {
    font-size: 3.75rem;
    line-height: 1;
  }

  .subline {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  .stats {
    grid-template-columns: repeat(4, max-content);
  }

  .statValue {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta {
    transition: none;
  }
}
```

`src/app/page.tsx`, reemplazar todo el archivo:
```tsx
import { CallToAction, Mailchimp } from "@/components";
import { ScrollFilm } from "@/components/film/ScrollFilm";
import { FILM_BEATS, FILM_DURATION } from "@/components/film/filmMap";
import { Hero } from "@/components/landing/Hero";
import styles from "@/components/landing/landing.module.scss";
import { about, baseURL, home, person } from "@/resources";
import { Meta, Schema } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

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
      <ScrollFilm
        src="/video/home-film.mp4"
        srcMobile="/video/home-film-m.mp4"
        poster="/images/film/hero.webp"
        posterMobile="/images/film/hero-m.webp"
        beats={FILM_BEATS}
        duration={FILM_DURATION}
      >
        <Hero />
      </ScrollFilm>
      <div className={styles.flat}>
        <CallToAction />
        <Mailchimp />
      </div>
    </div>
  );
}
```
`CallToAction` queda abajo solo hasta el Plan B, que lo sustituye por las secciones planas y el CTA final.

`src/resources/custom.css`, añadir después de la regla `.main-content-wrapper` de la Task 3:
```css
/* The home film is full bleed and starts under the header. */
.main-content-wrapper:has([data-film-root]) {
  padding: 0 !important;
}
```

- [x] **Step 7: Retirar los tests de la Home vieja**

```bash
git rm tests/e2e/home-rail.spec.ts tests/e2e/decode.spec.ts tests/e2e/lazy-video.spec.ts
```
- `tests/e2e/kinetic.spec.ts`: quitar el caso `/` de la lista de casos (queda `/about`).
- `tests/e2e/pointer-fx.spec.ts`: borrar el test `featured project is a spec sheet whose image is the morph origin`.
- `tests/e2e/motion-boot.spec.ts`: borrar el test `lite tier: no autoplay on the home video, play button offered` (lo reemplaza `lite tier: no video is downloaded`).
- `tests/e2e/intro-sequence.spec.ts`: en `while the intro plays, hero animations are paused but the h1 is visible`, quitar las aserciones sobre `h1 [data-kinetic-word]` y dejar `await expect(page.locator("h1")).toBeVisible();` mientras `intro-pending` está puesto; renombrarlo a `while the intro plays the h1 is already in the page`.
- `tests/e2e/ssr-content.spec.ts`: si el caso de `/` compara el texto del `h1`, usar el titular nuevo.

Los componentes viejos (`HomeRail`, `FeaturedProject`, `LazyVideo`, etc.) siguen en el árbol sin uso; su borrado es del Plan B.

- [x] **Step 8: Verlo pasar**

```bash
npm run build 2>&1 | tee .perf/build-film-hero.txt | grep -E '^(┌|├|└) [○●] /(about|work|gallery|blog/\[slug\])? '
npx playwright test --project=chromium --project=mobile-chromium tests/e2e/film.spec.ts
npx playwright test --project=firefox --project=webkit tests/e2e/film.spec.ts
npx playwright test --project=chromium tests/e2e/cls.spec.ts tests/e2e/smoke.spec.ts tests/e2e/ssr-content.spec.ts tests/e2e/intro-sequence.spec.ts tests/e2e/motion-boot.spec.ts
node scripts/quality/csp-check.mjs
```
Expected: todo en verde; `csp-check OK: 0 CSP violations`; `/` ≤ 322 kB. Si `the stage stays pinned` falla, algún ancestro tiene `overflow` distinto de `visible`: encontrarlo con
```js
let el = document.querySelector("[data-film-stage]"); while ((el = el.parentElement)) { const o = getComputedStyle(el).overflow; if (o !== "visible") console.log(el, o); }
```
y corregir ese ancestro, no el escenario.

- [x] **Step 9: Gates y commit**

```bash
npx @biomejs/biome check src --max-diagnostics=0 && node scripts/quality/biome-gate.mjs HEAD && npx tsc --noEmit
git add next.config.mjs src/resources/landing.ts src/resources/custom.css src/components/film src/components/landing src/app/page.tsx tests/e2e
git commit -m "feat(home): hero over a scroll-driven film

The clip is fetched after load and scrubbed from a Blob, which needs
media-src blob: in the CSP (approved by Erick, 2026-10-09).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Tagline que se enciende palabra por palabra

**Files:**
- Create: `src/components/landing/Tagline.tsx`
- Modify: `src/components/landing/landing.module.scss`, `src/app/page.tsx`
- Test: `tests/e2e/tagline.spec.ts`

**Interfaces:**
- Consumes: `FilmSection` y la línea de tiempo `--film-section` (Task 4); `landing.tagline` (Task 4); `FILM_BEATS` ya incluye `tagline` (Task 1); `MotionRuntime` añade `.is-in` a los `[data-mo-io]` visibles (ya existe).
- Produces: `<Tagline />`; atributos `[data-tagline]` y `[data-tagline-word]`.

- [x] **Step 1: Test que falla**

`tests/e2e/tagline.spec.ts`:
```ts
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const TEXT = "Most companies hire a department. I build the system that does the work of one.";

const scrollIntoBeat = (page: Page, progress: number) =>
  page.evaluate((p) => {
    const el = document.querySelector('[data-film-beat="tagline"]') as HTMLElement;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + el.offsetHeight * p);
  }, progress);

const opacities = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-tagline-word]")).map((el) =>
      Number(getComputedStyle(el).opacity),
    ),
  );

test("the tagline is one heading with its exact text", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-tagline]")).toHaveText(TEXT);
  expect(await page.locator("[data-tagline]").evaluate((el) => el.tagName)).toBe("H2");
});

test("words light up in reading order as the section scrolls", async ({ page }, testInfo) => {
  test.skip(
    !["chromium", "mobile-chromium"].includes(testInfo.project.name),
    "scroll timelines are asserted on Chromium",
  );
  await page.goto("/");
  await scrollIntoBeat(page, 0.02);
  let values = await opacities(page);
  expect(values.at(-1)).toBeLessThan(0.5);
  await scrollIntoBeat(page, 0.3);
  values = await opacities(page);
  expect(values[0]).toBe(1);
  expect(values.at(-1)).toBeLessThan(0.5);
  await scrollIntoBeat(page, 0.75);
  values = await opacities(page);
  expect(Math.min(...values)).toBe(1);
});

test("fallback engines end with every word lit", async ({ page, browserName }) => {
  test.skip(browserName !== "firefox", "IntersectionObserver path");
  await page.goto("/");
  await scrollIntoBeat(page, 0.3);
  await expect.poll(async () => Math.min(...(await opacities(page))), { timeout: 5000 }).toBe(1);
});

test("reduced motion: every word is lit from the start", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(Math.min(...(await opacities(page)))).toBe(1);
});
```

- [x] **Step 2: Verlo fallar**

Run: `npx playwright test --project=chromium tests/e2e/tagline.spec.ts`
Expected: FAIL (`[data-tagline]` no existe).

- [x] **Step 3: Implementación**

`src/components/landing/Tagline.tsx`:
```tsx
import { FilmSection } from "@/components/film/FilmSection";
import { landing } from "@/resources/landing";
import { type CSSProperties, Fragment } from "react";
import styles from "./landing.module.scss";

/**
 * The page's one large-type statement. Each word starts muted and lights up in
 * reading order as the section scrolls. The words are plain inline spans with
 * real spaces between them, so the heading reads and copies as ordinary text.
 */
export function Tagline() {
  const lines = landing.tagline.map((line) => line.split(" "));
  const total = lines.reduce((sum, words) => sum + words.length, 0);
  let index = 0;

  return (
    <FilmSection beat="tagline" screens={2.5}>
      <h2
        className={styles.tagline}
        data-tagline=""
        data-mo-io=""
        style={{ "--n": total } as CSSProperties}
      >
        {lines.map((words, lineIndex) => (
          <Fragment key={landing.tagline[lineIndex]}>
            <span className={styles.taglineLine}>
              {words.map((word, wordIndex) => {
                const w = index++;
                return (
                  <Fragment key={`${w}-${word}`}>
                    <span
                      className={styles.word}
                      data-tagline-word=""
                      style={{ "--w": w } as CSSProperties}
                    >
                      {word}
                    </span>
                    {wordIndex < words.length - 1 ? " " : null}
                  </Fragment>
                );
              })}
            </span>
            {lineIndex < lines.length - 1 ? " " : null}
          </Fragment>
        ))}
      </h2>
    </FilmSection>
  );
}
```

Añadir a `src/components/landing/landing.module.scss`, antes del `@media (min-width: 768px)`:
```scss
.tagline {
  max-width: 680px;
  margin: 0;
  font-family: var(--font-heading), sans-serif;
  font-size: 2.25rem;
  line-height: 2.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.taglineLine {
  display: block;
  text-wrap: balance;
}

@keyframes word-on {
  from {
    opacity: 0.3;
    animation-timing-function: var(--ease-fluid);
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: no-preference) {
  /* The section is 2.5 screens tall and its content is pinned from 28% to 72% of
     its pass through the viewport; the words light up across that pinned stretch. */
  @supports (animation-timeline: view()) {
    .word {
      animation: word-on linear both;
      animation-timeline: --film-section;
      animation-range: cover calc(28% + var(--w) / var(--n) * 36%)
        cover calc(34% + var(--w) / var(--n) * 36%);
    }
  }

  :global(html.mo-io) .word {
    opacity: 0.3;
    transition: opacity 700ms var(--ease-fluid);
    transition-delay: calc(var(--w) * 70ms);
  }

  :global(html.mo-io) .tagline:global(.is-in) .word {
    opacity: 1;
  }
}
```
y dentro del `@media (min-width: 768px)` existente:
```scss
  .tagline {
    font-size: 3.75rem;
    line-height: 1;
  }
```

`src/app/page.tsx`: importar `import { Tagline } from "@/components/landing/Tagline";` y poner `<Tagline />` justo después de `<Hero />` dentro de `<ScrollFilm>`.

- [x] **Step 4: Verlo pasar**

```bash
npm run build && npx playwright test --project=chromium --project=mobile-chromium --project=firefox --project=webkit tests/e2e/tagline.spec.ts tests/e2e/film.spec.ts
```
Expected: todo en verde. Si `words light up in reading order` falla con todas las opacidades en 1, la línea de tiempo `--film-section` no está llegando a las palabras: comprobar en DevTools que `.section` tiene `view-timeline-name` y que el nombre no fue reescrito por CSS Modules.

- [x] **Step 5: Gates y commit**

```bash
npx @biomejs/biome check src --max-diagnostics=0 && node scripts/quality/biome-gate.mjs HEAD && npx tsc --noEmit
git add src/components/landing/Tagline.tsx src/components/landing/landing.module.scss src/app/page.tsx tests/e2e/tagline.spec.ts
git commit -m "feat(home): tagline that lights up word by word with the scroll

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Puerta de aspecto — verificación, Preview y ESPERA

**Files:**
- Modify: `docs/superpowers/plans/2026-10-09-landing-film-look-gate.md` (casillas)

- [x] **Step 1: Gates completos**

```bash
npx @biomejs/biome check src --max-diagnostics=0 2>&1 | tail -2
npx tsc --noEmit; echo "tsc exit=$?"
npm run build 2>&1 | tee .perf/build-look-gate.txt | tail -30
npm run test:unit && npm run test:e2e
node scripts/quality/csp-check.mjs
```
Expected: todo en verde, `csp-check OK`, First Load JS de cada ruta ≤ base + 10 kB. Un fallo de `networkidle` en Firefox bajo carga se repite aislado (`--project=firefox <spec> --repeat-each=2`) antes de darlo por bueno.

- [x] **Step 2: Mirar la página**

Con `npm run start -- -p 3100` arriba, capturar con Playwright (script puntual en `.perf/`, sin commitear) la Home en 1440×900 y 390×844, tema oscuro, tras esperar a que `intro-pending` desaparezca y `[data-film-ready]` exista, en estos puntos de scroll: 0; mitad del hero; inicio, mitad y final del tagline; y el bloque plano. Además el menú móvil abierto y `/about` en desktop. Abrir cada PNG con Read y comprobar a ojo: texto legible sobre el video en todos los puntos, sin cortes ni solapes, nav en píldora centrada, wordmark y titulares en Geist, palabras del tagline a medio encender en el punto medio.

- [x] **Step 3: Marcar casillas, push y Preview**

Marcar las casillas de las Tasks 1–6 de este plan e incluirlas en un commit `docs:`.
```bash
git push origin feat/disruptive-redesign
SHA=$(git rev-parse HEAD)
curl -s "https://api.github.com/repos/Erickgooo/magic-portfolio/deployments?sha=$SHA" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{for(const d of JSON.parse(s))console.log(d.id,d.environment)})'
curl -s "https://api.github.com/repos/Erickgooo/magic-portfolio/deployments/<id>/statuses" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{for(const x of JSON.parse(s))console.log(x.state,x.environment_url)})'
```
Push sin force. El Preview responde 302 por la Deployment Protection: no desactivarla; Erick lo abre con su sesión de Vercel.

- [ ] **Step 4: Entrega a Erick y ESPERA**

Mensaje con: URL del Preview; qué mirar (hero sobre el video, cómo avanza con el scroll en desktop y en el teléfono, tagline, nav en píldora y menú móvil, tipografía); lo que todavía no está (resto del argumento, secciones planas, reencuadre vertical plano por plano: hoy el móvil usa el recorte central); y resultado de los gates. **No escribir el Plan B ni tocar más código hasta su respuesta.**

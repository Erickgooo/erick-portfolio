# Pase apple-design — Plan: Home «Departamento de uno», sistema en todo el sitio y entrega

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Marca las casillas de tu tarea en el mismo commit que la cierra.

**Goal:** Reconstruir la Home como «Departamento de uno» (video limpio a sangre, tarjetas opacas del color de la página entre planos), llevar los mismos tokens y tipografía al resto del sitio, retirar todos los efectos y entregar con revisión, presupuesto y Preview.

**Architecture:** Los tokens se cambian en un solo lugar (`src/resources/custom.css`, sobre los tokens semánticos de Once UI), de modo que las páginas hechas con componentes de Once UI los heredan. La Home se reescribe en `src/components/landing/` con un módulo SCSS propio y el motor de video existente (`ScrollFilm`, `filmMap.ts`). Lo que desaparece se borra, no se oculta.

**Tech Stack:** Next.js 15 (App Router), React 19, SCSS modules, Once UI 1.8.2, Playwright 1.63 (unit + e2e), Biome.

**Spec:** `docs/superpowers/specs/2026-10-10-apple-pass-design.md`. Revisión de partida: `docs/design/apple-review-before.md`. Implementación de referencia de la Home, en la rama `lab/apple-directions`: `git show lab/apple-directions:src/components/lab/DirectionC.tsx` (y `c.module.scss`, `lab.module.scss`, `Closing.tsx`, `copy.ts` en la misma carpeta).

## Global Constraints

- **No tocar:** CSP, headers, `src/middleware.ts`, auth (`src/utils/auth.ts`, `src/app/api/authenticate`, `check-auth`), el chatbot (`src/components/FaqChatbot.*`, `src/resources/faqChatbot.ts`, `src/app/api/chatbot`), `.env.local`, `security-audit.local.md`, `next.config.mjs`, los videos de `public/video/` ni `tests/unit/filmBudget.spec.ts` (salvo su comentario).
- **Sin dependencias nuevas** ni cambios de versión.
- **Color** (valores exactos): superficie `#f4f5f7` / `#000000`; elevada `#ffffff` / `#141416`; contenido `#0b0c0e` / `#f4f5f7`; secundario `#4b5058` / `#a8adb5`; acento `#2d5bff`, hover `#2549cb`, texto encima `#ffffff`; línea = contenido al 14 % (claro) y 18 % (oscuro). Hover de enlace: `#2549cb` (claro), `#a6baff` (oscuro).
- **Cobalto solo** como relleno del CTA y en la barra de progreso del video. En ningún texto, chip, borde ni sombra.
- **Tipografía:** Geist y Geist Mono. Pesos 400, 500, 600; nunca 300. `letter-spacing` negativo solo desde 32 px. Nada por debajo de 13 px. Ningún texto en Arial ni en fuente del sistema.
- **Forma:** radio de 6 px en botones y 4 px en imágenes; sin `9999px` en contenido.
- **Objetivos:** todo enlace suelto, botón e icono ≥ 44×44 px hasta 768 px de ancho y ≥ 28×28 px por encima.
- **Movimiento:** solo `transform` y `opacity`. Ningún `filter` animado. Sin `background-clip: text`. `backdrop-filter` solo en la nav (y en el chatbot, que no se toca). Todo respeta `prefers-reduced-motion`.
- **LCP:** el elemento LCP de cada página está en el HTML del servidor, visible desde el primer fotograma, sin depender de JS.
- **Textos:** en inglés. Cifras, clientes, fechas y herramientas salen solo de `src/resources/` y del MDX; no se inventa ninguna. Frases cortas en primera persona; sin tríadas retóricas, sin «not X, but Y», sin preguntas retóricas, sin guiones largos encadenados, sin leverage / empower / transform / innovative / solutions / experiences / unlock / elevate / seamless.
- **Comentarios y commits en inglés,** con el estilo del repo (`feat(home): …`, `fix: …`, `test: …`). Los comentarios explican el porqué.
- **Antes de cada commit:** `node scripts/quality/biome-gate.mjs`, `npx tsc --noEmit` y `npm run build`, los tres en verde.
- **Antes de dar la tarea por hecha:** `npm run test:unit` y `npm run test:e2e` (necesita el build; usa el puerto 3100). Salida limpia.
- **No hacer** push, merge, cambio de rama ni borrado de ramas. Se trabaja en `feat/apple-pass`.
- **Sass en producción:** un carácter no ASCII en la salida de un `.module.scss` (por ejemplo `content: "\2212"`) hace que Sass emita un BOM que rompe la primera regla del módulo en el CSS concatenado. No usar caracteres no ASCII fuera de comentarios, y comprobar siempre en `npm run build`, no solo en `next dev`.
- **Windows:** el shell es Git Bash. Para mirar el resultado hay capturas con `node scripts/design/capture.mjs --base http://localhost:3111 --out <carpeta fuera de docs/design/screens/before> --only <páginas>` contra `npx next start -p 3111`; apaga el servidor que arranques.

## Review Focus

1. **Sin JavaScript:** la Home muestra el h1, la línea de autor, el CTA, las cinco tarjetas y todo lo de abajo. Test en la Tarea 2 (`the page reads top to bottom without JavaScript`).
2. **Movimiento reducido o equipo lento:** no se descarga el video y cada tramo muestra su fotograma fijo, con los nombres de `still`. Test en la Tarea 2.
3. **Tema claro sobre el video:** las etiquetas de la nav siguen blancas sobre el video y vuelven al color del tema después. Test existente, se conserva en la Tarea 2.
4. **Proyecto protegido por contraseña o sin métrica:** una tarjeta cuyo caso está protegido no pinta enlace; un proyecto sin métrica no deja un hueco raro en «Work». Test en la Tarea 2.
5. **Teléfono (390 px):** el CTA del héroe no queda bajo la barra de navegación ni bajo el saludo del chatbot; ningún objetivo táctil mide menos de 44 px. Tests en las Tareas 2, 4, 5 y 6.

---

### Task 1: Tokens y superficie global

**Files:** Modify `src/resources/custom.css`, `src/resources/once-ui.config.ts`, `src/app/layout.tsx`, `src/components/film/ScrollFilm.tsx`, `src/components/film/ScrollFilm.module.scss`, `src/components/ProjectCard.tsx`, `src/components/mdx/ResultsStats.module.scss`, `src/components/YouTubeFacade.module.scss`, `src/app/about/page.tsx`, `src/components/landing/landing.module.scss`, `tests/e2e/motion-boot.spec.ts`, `tests/e2e/film.spec.ts`. Create `tests/e2e/system.spec.ts`. Delete `src/components/SpotlightBackground.tsx`, `src/components/SpotlightBackground.module.scss`.

**Interfaces:**
- Produces: los tokens semánticos de Once UI con los valores nuevos (`--page-background`, `--surface-background`, `--neutral-on-background-strong`, `--neutral-on-background-weak`), que las tareas siguientes usan tal cual; `tests/e2e/system.spec.ts`, al que las Tareas 3 a 6 añaden casos.

Datos que necesitas (Once UI 1.8.2, `node_modules/@once-ui-system/core/dist/css/tokens.css`): los bloques de tema son `[data-theme=dark]` y `[data-theme=light]`, especificidad (0,1,0). Para ganarles por tema usa `:root[data-theme="light"]` y `:root[data-theme="dark"]` en `custom.css`. `--surface-background` lo fija `[data-surface=translucent][data-theme=…]` (0,2,0) y además `[data-surface=translucent]` define `--backdrop-filter: blur(1rem)`, que desenfoca todo `background="surface"`. La raíz baja a 15 px en móvil por `--font-scaling-mobile: 15px`. `.font-default` usa `--font-weight-display-default`, que vale 300.

- [x] **Step 1:** Tests que fallan en `tests/e2e/system.spec.ts` (importa `test`/`expect` de `./fixtures`; fuerza el tema con `localStorage["data-theme"]` en `addInitScript` y `colorScheme`, como `film.spec.ts:151`): (a) en `/about`, tema claro: `--neutral-on-background-weak` = `#4b5058`, `--neutral-on-background-strong` = `#0b0c0e`, fondo de `body` = `rgb(244, 245, 247)`; tema oscuro: `#a8adb5`, `#f4f5f7`, `rgb(0, 0, 0)`; (b) en cada ruta de `ROUTES` no existe `[data-spotlight]` ni `[data-spotlight-target]` y `getComputedStyle(body, "::before").backgroundImage` es `none`; (c) a 390 px `html` tiene `font-size: 16px`; (d) en `/about` ningún elemento con texto visible tiene `font-weight` menor que 400 (excluye lo que cuelgue de `[class*="FaqChatbot"]`); (e) `getComputedStyle(documentElement).getPropertyValue("--backdrop-filter")` está vacío o es `none` (las superficies de Once UI ya no desenfocan).
- [x] **Step 2:** Verlos fallar.
- [x] **Step 3:** `custom.css`: sobrescribe por tema los cuatro tokens con los valores de Global Constraints; `--font-scaling-mobile: 16px`; `--font-weight-display-default: 400`. Quita `--glow-border`. `.metric` pasa a `font-family: inherit; font-weight: 600; color: inherit; font-variant-numeric: tabular-nums; white-space: nowrap`. No borres `--font-label` ni las reglas de la cabecera sobre el video (`:132-143`).
- [x] **Step 4:** `once-ui.config.ts`: `surface: "filled"`. Comprueba en el build que `--surface-background` queda en `#ffffff` / `#141416`; si el valor por defecto de «filled» es otro, fíjalo en `custom.css` con `:root[data-surface="filled"][data-theme="…"]`.
- [x] **Step 5:** Quita el fondo de puntos y el brillo: borra `SpotlightBackground.*`, su import, `<SpotlightBackground />` y `className={spotlightStyles.pageDots}` en `layout.tsx`; en `ScrollFilm` borra el `div` `.glow` (`data-spotlight-target`) y su regla.
- [x] **Step 6:** Sustituye cada uso de `--glow-border` y su copia en línea: `ProjectCard.tsx:60-84` (la métrica queda como texto: valor en peso 600 y etiqueta, sin caja, sin sombra, sin fuente mono), `ResultsStats.module.scss:23`, `YouTubeFacade.module.scss:37`, `about/page.tsx:343-346`, `landing.module.scss:564` y las sombras del CTA (`:66`, `:73`).
- [x] **Step 7:** Borra los tests de lo que ya no existe: `motion-boot.spec.ts` «the page has the dotted background and one cursor glow layer», «the glow follows the pointer», «the glow goes idle once it has caught up…»; `film.spec.ts` «the cursor glow also follows the pointer over the film».
- [x] **Step 8:** Gates, `test:unit`, `test:e2e`. Commit `feat: one set of colour tokens for the whole site; drop the dot grid, the cursor glow and the glow border`.

### Task 2: Home «Departamento de uno»

**Files:** Modify `src/components/film/filmMap.ts`, `src/components/film/ScrollFilm.tsx`, `src/components/film/ScrollFilm.module.scss`, `src/resources/custom.css` (solo las reglas de la cabecera sobre el video), `src/resources/landing.ts`, `src/components/landing/Hero.tsx`, `src/components/landing/Closing.tsx`, `src/components/landing/CallButton.tsx`, `src/components/landing/landing.module.scss`, `src/app/page.tsx`, `src/app/layout.tsx`, `src/components/index.ts`, `src/components/motion/motionBoot.ts`, `src/components/motion/index.ts`, `src/resources/content.tsx`, `src/types/content.types.ts`, `tests/e2e/film.spec.ts`, `tests/e2e/landing.spec.ts`, `tests/e2e/ssr-content.spec.ts`, `tests/e2e/motion-boot.spec.ts`, `tests/e2e/cls.spec.ts`, `tests/e2e/helpers.ts`, `tests/unit/filmMap.spec.ts`, `tests/unit/filmBudget.spec.ts` (solo el comentario que cita la intro), `scripts/perf/inp.mjs`, `scripts/perf/screens.mjs`, `scripts/quality/csp-check.mjs`. Create `src/components/landing/Seats.tsx`. Delete `src/components/landing/Tagline.tsx`, `Argument.tsx`, `Words.tsx`, `type.module.scss`, `src/components/film/FilmSection.tsx`, `FilmSection.module.scss`, `src/components/IntroLoader.tsx`, `IntroLoader.module.scss`, `src/components/motion/Magnetic.tsx`, `Magnetic.module.scss`, `src/components/motion/intro.ts`, `tests/e2e/typography.spec.ts`, `tagline.spec.ts`, `intro-font.spec.ts` (y `intro-font.spec.ts-snapshots/`), `intro-sequence.spec.ts`, `pointer-fx.spec.ts`.

**Interfaces:**
- Consumes: los tokens de la Tarea 1.
- Produces: atributos que usan los tests y los scripts: `data-film-beat` con los ids `hero`, `after-brand`, `after-content`, `after-paid-media`, `after-crm`, `after-software`; `data-seat="brand|content|paid-media|crm|software"` en cada tarjeta; `data-opaque` en la banda del héroe y en cada tarjeta; `html[data-nav-over-card]` mientras una de ellas cubre la línea de las etiquetas de la nav; `data-landing-section="proof|hiring|faq|final-cta"`; `data-work-item` en cada proyecto de «Work»; `data-cta="primary"` en el botón (2 en la página); `data-faq-answer`.

Lee el §3 del spec y la referencia del lab antes de empezar. La estructura, los altos de scroll, los tramos y el texto están ahí con sus valores exactos. Diferencias respecto al lab: la banda del héroe y las tarjetas no son negras fijas sino del color de la página en cada tema (decisión de Erick posterior al lab); nada de `layout="window"`, ni props de clases, ni la variante `dim`; el degradado bajo la nav y la barra de progreso van dentro de `ScrollFilm`; los estilos usan los tokens de Once UI de la Tarea 1 (`--page-background`, `--surface-background`, `--neutral-on-background-strong`, `--neutral-on-background-weak`), no variables propias de color; la línea es `color-mix(in srgb, var(--neutral-on-background-strong) 14%, transparent)` (18 % en oscuro).

- [x] **Step 1:** Tests que fallan. `tests/unit/filmMap.spec.ts`: `veilAt` devuelve 0 fuera de un destello y 0.55 dentro; `FILM_BEATS` tiene los seis ids de arriba y sigue cubriendo de 0 a `FILM_DURATION` sin huecos. `tests/e2e/film.spec.ts` y `landing.spec.ts`, reescritos para la estructura nueva, con estos casos como mínimo:
  - `the page reads top to bottom without JavaScript` (contexto con `javaScriptEnabled: false`): h1 exacto «The marketing department is one person.», visible y con `opacity: 1`; la línea de autor; cinco `[data-seat]` en el orden Brand, Content, Paid media, CRM, Software, cada una con su h2 y su frase del spec; las cuatro secciones de abajo en orden.
  - `the hero is there on the first frame`: nada bajo `[data-film-beat="hero"]` tiene animación ni transición en curso; el h1 es visible 100 ms después de `domcontentloaded`.
  - `each seat links to its case study by name`: el enlace de cada tarjeta apunta al slug del spec y su nombre accesible es «Read the case study: <título del proyecto>».
  - `a protected case study gets no link` y `a project without a metric keeps its place in Work` (funciones puras o componentes probados con datos de ejemplo, como hace hoy `tests/unit/projects.spec.ts`).
  - `no words sit on the footage`: todo elemento con texto dentro de la pista del video tiene un ancestro `[data-opaque]` cuyo `background-color` es opaco (alfa 1) e igual al de `body`.
  - `the cards take the colour of the page`: en tema claro la banda del héroe y las tarjetas tienen fondo `rgb(244, 245, 247)` y el h2 `rgb(11, 12, 14)`; en tema oscuro, `rgb(0, 0, 0)` y `rgb(244, 245, 247)`.
  - `light theme: the nav labels follow what is under them`: a 1440 px, sobre el video «Medellín, Colombia» es `rgb(255, 255, 255)`; con una tarjeta fijada bajo la nav es el color del tema (`rgb(11, 12, 14)`); al volver a un tramo de video, blanco otra vez; pasado el video, el color del tema.
  - `every film stretch has a beat`, `the film follows the scroll position, forwards and backwards`, `the last stretch ends the video` (tiempo > 24.5 s al final de `after-software`), `the stage stays pinned while its sections scroll`.
  - `the progress bar tracks the film`: el `scaleX` de la barra coincide con `currentTime / 24.8` con tolerancia de 0.03.
  - `reduced motion swaps a still per stretch`: en `after-content` el póster es `/images/film/solution.webp`; en `after-software`, `process.webp`; no se pide ningún `.mp4`.
  - Se conservan sin cambios de intención: los de codificación vertical y horizontal, «the film becomes ready on every engine», «lite tier: no video is downloaded», «a failed film download leaves the poster and logs nothing», «there is exactly one primary call to action above the fold», los de desbordamiento horizontal y los dos de las etiquetas de la nav en tema claro y oscuro.
  - `on phones the call to action stays clear of the nav bar and the chatbot greeting` (390×844).
  - `nothing on the Home is glass, gradient text or a blur`: ningún elemento con `backdrop-filter` distinto de `none` fuera de `header`, `[data-header-fade]` y `[class*="FaqChatbot"]`; ninguno con `background-clip: text`; ninguna animación en curso cuyo keyframe toque `filter`.
  - `Work shows the six most recent public projects`, `the hiring block links to the resume and the about page`, `the FAQ has seven questions and its answers open on click`, `answers open with the keyboard`, `the FAQ schema carries the same questions as the page`, `the page ends with the same call to action as the hero`.
  - `every target on the Home is large enough on a phone`: a 390 px todo `a`, `button` y `summary` de `.main-content-wrapper` mide ≥ 44×44 px.
- [x] **Step 2:** Verlos fallar.
- [x] **Step 3:** Motor. `filmMap.ts`: `FilmBeat` gana `still?: string`; `FILM_BEATS` con la tabla del §3.2; `VEIL_BASE = 0`, `VEIL_FLASH = 0.55`. `ScrollFilm.tsx`: el fotograma fijo sale de `beat.still ?? beat.id`; el `tick` escribe `--film-progress` (`current / duration`, 4 decimales); un `div` de progreso en el escenario. `ScrollFilm.tsx`, en el efecto que ya marca `data-past-film`: marca además `html[data-nav-over-card]` cuando algún `[data-opaque]` de la pista cubre la línea de las etiquetas (su borde superior está por encima de 30 px y el inferior por debajo de 44 px) y lo quita en la limpieza. `src/resources/custom.css:132-143`: las dos reglas del tema claro sobre el video añaden `:not([data-nav-over-card])`. `ScrollFilm.module.scss`: `.stage::after` con el degradado de 132 px (negro al 74 % → transparente) y `.progress` (3 px, `#2d5bff`, `transform: scaleX(var(--film-progress, 0))`, `transform-origin: left`).
- [x] **Step 4:** Texto. `landing.ts` con el §3.3 del spec y nada más (borra `problem`, `solution`, `benefits`, `process`, `tagline`, `hero.risk`, `hero.emphasis`). Las preguntas del FAQ se conservan como están.
- [x] **Step 5:** Componentes. `Hero.tsx` (sección `data-film-beat="hero"`, primera pantalla con la banda `data-opaque` abajo: h1, autor, `CallButton`); `Seats.tsx` (por cada puesto, una `<section data-seat data-opaque>` con fondo `var(--page-background)` y texto en los tokens de contenido y después un tramo vacío `aria-hidden` con su `data-film-beat`; el enlace no se pinta si `isProtectedPath`); `Closing.tsx` sin `Reveal` ni `Magnetic`, con «Work» de seis proyectos (`sortProjects(publicProjects(...)).slice(0, 6)`); `CallButton.tsx` sin flecha; `page.tsx` sin `Mailchimp` ni el `div` `.flat`.
- [x] **Step 6:** `landing.module.scss` reescrito desde cero con los valores del §2 del spec. Sin clases sin uso.
- [x] **Step 7:** Quita la intro: `IntroLoader.*`, su uso en `layout.tsx` y su export en `components/index.ts`; el bloque `intro-pending` de `motionBoot.ts` (se queda `data-fx`); `motion/intro.ts`; `Magnetic.*` y su export. Borra `introDone` de `tests/e2e/helpers.ts` y la rama del menú hamburguesa de `headerLink`. Quita de `content.tsx` y de `content.types.ts` los campos `home.headline`, `home.subline` y `home.stats` (nadie los lee); `home.featured` se queda porque lo lee `src/app/api/chatbot/route.ts`.
- [x] **Step 8:** Tests y scripts que dependían de lo borrado: `ssr-content.spec.ts:10` (h1 nuevo), `motion-boot.spec.ts` «intro-pending only on Home…» (borrar), `cls.spec.ts` (la Home ya no se mide bajo la intro: debe seguir < 0.05), las esperas de 6000 ms de `scripts/perf/inp.mjs:61` y `scripts/perf/screens.mjs:24` y la espera de la intro de `scripts/quality/csp-check.mjs:82-87`.
- [x] **Step 9:** Gates, `test:unit`, `test:e2e`. Commit `feat(home): the department of one — the film plays clean and black title cards carry the words`.

### Task 3: Retirar las primitivas de movimiento

**Files:** Modify `src/app/about/page.tsx`, `src/app/layout.tsx`, `src/components/motion/index.ts`, `src/components/motion/motion.css`, `src/components/motion/motionBoot.ts`, `src/resources/custom.css` (`.sr-only`, si queda sin uso), `tests/e2e/motion-boot.spec.ts`, `tests/e2e/ssr-content.spec.ts`, `tests/e2e/system.spec.ts`, `scripts/quality/csp-check.mjs` (columna `mo-io`). Delete `src/components/motion/Reveal.tsx`, `KineticText.tsx`, `KineticText.module.scss`, `DecodeText.tsx`, `DecodeText.module.scss`, `decode.ts`, `MotionRuntime.tsx`, `tests/e2e/reveal.spec.ts`, `tests/e2e/kinetic.spec.ts`, `tests/unit/decode.spec.ts`.

**Interfaces:**
- Consumes: la Home de la Tarea 2 ya no usa `Reveal`, `Magnetic` ni `data-mo-io`.
- Produces: `motion.css` solo con las variables (`--cobalt`, `--ease-fluid` y las demás que alguien lea) y el bloque de view transitions; `motionBoot` solo con `data-fx`.

- [x] **Step 1:** Tests que fallan en `system.spec.ts`: en cada ruta de `ROUTES`, `html` no tiene las clases `mo-io` ni `mo-ready` y no existe ningún `[data-reveal]`, `[data-mo-io]`, `[data-kinetic-words]`; ninguna animación en curso toca `filter`. En `ssr-content.spec.ts`: el h1 de `/about` tiene el nombre accesible exacto «Erick Mahecha» y copiarlo da el texto una sola vez (son los dos casos que se conservan de `kinetic.spec.ts`).
- [x] **Step 2:** Verlos fallar.
- [x] **Step 3:** `about/page.tsx`: el h1 es texto plano y el bloque de introducción ya no va envuelto en `Reveal`. Borra los componentes de la lista y sus exports.
- [x] **Step 4:** `motion.css`: fuera los keyframes y reglas de `[data-reveal]`, la rama `mo-io` y el bloque de movimiento reducido que solo los reiniciaba. Se quedan las variables y las view transitions (solo `opacity` y `translateY`). `motionBoot.ts`: fuera `mo-io` y su vigilante. `layout.tsx`: fuera `<MotionRuntime />`.
- [x] **Step 5:** Borra los specs de la lista y el caso «mo-io matches the absence of view() support» de `motion-boot.spec.ts`.
- [x] **Step 6:** Gates, `test:unit`, `test:e2e`. Commit `refactor: remove the motion primitives nothing uses any more`.

### Task 4: Nav y footer

**Files:** Modify `src/components/Header.tsx`, `src/components/Header.module.scss`, `src/components/Footer.tsx`, `src/components/Footer.module.scss`, `tests/e2e/nav.spec.ts`, `tests/e2e/system.spec.ts`.

**Interfaces:**
- Consumes: tokens de la Tarea 1.
- Produces: se conservan `data-header-fade`, `data-header-side`, `viewTransitionName: "site-header"` y los nombres accesibles de la nav (`tests/e2e/a11y-names.spec.ts:14`).

Datos: cada control de la nav es un `ToggleButton` de Once UI tamaño `m` (alto 2rem, clase con hash `ToggleButton_m__*`), incluido `ThemeToggle`. `Header.module.scss` `.mask` no se usa en ningún sitio.

- [ ] **Step 1:** Tests que fallan en `nav.spec.ts`: a 390×844 cada enlace y botón dentro de `header` mide ≥ 44×44 px y la barra completa cabe en el ancho sin desbordar; a 1440×900 cada uno mide ≥ 28×28 px. En `system.spec.ts`: en `footer`, a 390 px cada `a` mide ≥ 44×44 px y a 1440 px ≥ 28×28 px; el footer contiene los textos «Once UI» y «CC BY-NC 4.0» con sus enlaces; ningún enlace del footer usa un color de la escala de marca (su `color` calculado es el del texto que lo rodea) y los enlaces de texto están subrayados.
- [ ] **Step 2:** Verlos fallar.
- [ ] **Step 3:** Nav: área mínima por control con CSS en `Header.module.scss` (hasta 768 px, 44×44; por encima no cambia). Borra `.mask`. No cambies etiquetas, iconos, orden ni el interruptor de tema.
- [ ] **Step 4:** Footer: iconos y enlaces con el área mínima; enlaces en el color del texto y subrayados; se conserva la atribución completa y el espacio inferior para la barra en móvil.
- [ ] **Step 5:** Gates, `test:unit`, `test:e2e`. Commit `fix(nav): controls and footer links large enough to tap`.

### Task 5: Work y casos de estudio

**Files:** Modify `src/app/work/page.tsx`, `src/app/work/[slug]/page.tsx`, `src/components/ProjectCard.tsx`, `src/components/work/Projects.tsx`, `src/components/mdx.tsx`, `src/components/mdx/ResultsStats.tsx`, `src/components/mdx/ResultsStats.module.scss`, `src/components/mdx/TechStack.module.scss`, `src/components/mdx/YouTubeEmbed.module.scss`, `src/components/HeadingLink.module.scss`, `tests/e2e/ssr-content.spec.ts`, `tests/e2e/system.spec.ts`. Delete los módulos que nadie importa: `src/components/work/Projects.module.scss`, `src/components/ProjectCard.module.scss` (compruébalo antes).

**Interfaces:**
- Consumes: tokens de la Tarea 1; `.metric` ya es texto normal en peso 600.
- Produces: nada que usen otras tareas.

Datos: `work.title` (`content.tsx:591`) es el `<title>`, el título del schema y está en la lista permitida del OG (`src/app/api/og/generate/route.tsx:46`); el h1 visible debe ser `work.label` («Projects») sin tocar `work.title`. Las flechas de `ResultsStats` son `<button>` sin `font-family` (caen a Arial) y se atenúan a opacidad 0.3. `mdx.tsx:156` pinta un `<pre>` sin fuente (lo usa `atv-riders.mdx:71-73`).

- [ ] **Step 1:** Tests que fallan. `ssr-content.spec.ts`: el h1 de `/work` es exactamente «Projects». `system.spec.ts`, en `/work` y en `/work/quick-metal-shop-viral-videos`, `/work/ai-powered-ad-creatives` y `/work/atv-riders`, a 390 y 1440 px: (a) todo texto visible usa una familia que empieza por Geist (o Geist Mono dentro de `pre`/`code`); (b) ningún texto visible mide menos de 13 px; (c) ningún elemento fuera de `header`, `[data-header-fade]` y `[class*="FaqChatbot"]` tiene `backdrop-filter` distinto de `none`, ni `background-clip: text`; (d) objetivos: todo `a` y `button` de `.main-content-wrapper` ≥ 44×44 px a 390 y ≥ 28×28 a 1440; (e) ningún `button` visible tiene `opacity` menor que 1 (una flecha que no aplica no se pinta); (f) ningún enlace de `.main-content-wrapper` tiene un `color` de la escala de marca.
- [ ] **Step 2:** Verlos fallar.
- [ ] **Step 3:** Work: h1 `work.label`; `ProjectCard` con la métrica como texto y el enlace «Read case study» subrayado, en el color del contenido, con su área; sin chips ni sombras de color.
- [ ] **Step 4:** Caso de estudio: etiquetas de `ResultsStats` en `--neutral-on-background-weak`, 13 px o más; flechas con `font: inherit` y ocultas (`hidden`) cuando no hay hacia dónde ir; `pre` de `mdx.tsx` en `var(--font-code)`; migas, autor, botones de copiar enlace y «View on Instagram» con su área; enlaces del cuerpo en el color del contenido y subrayados.
- [ ] **Step 5:** Si queda algún `backdrop-filter` de un componente de Once UI en estas páginas (`Carousel`, `AvatarGroup`), elimínalo de raíz (prop del componente o sustitución por un elemento propio). No escribas `backdrop-filter: none` para taparlo.
- [ ] **Step 6:** Gates, `test:unit`, `test:e2e`. Commit `feat(work): case studies on the shared tokens, with no chips, glass or faded controls`.

### Task 6: About, Blog, Gallery, 404 y contraseña

**Files:** Modify `src/app/about/page.tsx`, `src/components/about/about.module.scss`, `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/components/blog/Post.tsx`, `src/components/blog/Posts.tsx`, `src/components/blog/ShareSection.tsx`, `src/app/gallery/page.tsx`, `src/components/gallery/GalleryView.tsx`, `src/components/gallery/GalleryView.module.scss`, `src/app/not-found.tsx`, `src/components/PasswordPrompt.tsx`, `tests/e2e/ssr-content.spec.ts`, `tests/e2e/system.spec.ts`.

**Interfaces:**
- Consumes: tokens de la Tarea 1; el helper de comprobaciones por página que la Tarea 5 dejó en `system.spec.ts` (reutilízalo; si no existe como función, extráelo).
- Produces: `system.spec.ts` cubre todas las rutas de `ROUTES`, un post, tres casos, el 404 y `/unauthorized`.

Datos: `blog/page.tsx:39-41` pinta «Earlier posts» siempre y `Posts range={[4]}` no pinta nada con menos de 4 posts; `blog/[slug]/page.tsx:151-154` hace lo mismo con «Recent posts». `GalleryView.tsx:186-207` es la insignia del contador con `backdropFilter: blur(6px)`. `gallery.title` (`content.tsx:601`) también es `<title>` y OG: el h1 visible debe ser `gallery.label`. `ssr-content.spec.ts:69` fija el texto del 404.

- [ ] **Step 1:** Tests que fallan. `ssr-content.spec.ts`: h1 de `/gallery` exactamente «Visual Work»; 404 con h1 «Page not found» y un enlace «Go to the homepage» a `/`. `system.spec.ts`: las comprobaciones (a) a (f) de la Tarea 5 en `/about`, `/blog`, `/blog/my-workspace`, `/gallery`, `/this-page-does-not-exist` y `/unauthorized`; en `/blog` y en el post no existe ningún h2 cuyo siguiente bloque de lista esté vacío; en `/about` el enlace «Schedule a call» tiene fondo `rgb(45, 91, 255)`, texto blanco y ≥ 44 px de alto.
- [ ] **Step 2:** Verlos fallar.
- [ ] **Step 3:** About: «Schedule a call» con el estilo del CTA (Cobalto, blanco, radio 6 px); botones sociales y «View credential» con su área; fechas, instituciones y listas en el token secundario.
- [ ] **Step 4:** Blog y post: los encabezados «Earlier posts» y «Recent posts» solo si su lista tiene elementos; fechas de 13 px o más; botones de compartir con su área.
- [ ] **Step 5:** Gallery: h1 `gallery.label`; insignia del contador opaca (`#000000`, sin `backdropFilter`, radio 4 px), texto de 13 px o más.
- [ ] **Step 6:** 404: h1 «Page not found», una línea «The address may be mistyped, or the page may have moved.» y el botón «Go to the homepage». Contraseña: mismo botón y tokens; no cambies su lógica ni `RouteGuard`.
- [ ] **Step 7:** Gates, `test:unit`, `test:e2e`. Commit `feat: About, Blog, Gallery, 404 and the password screen on the shared system`.

### Task 7: Verificación y entrega (la ejecuta el controlador)

**Files:** Create `docs/design/apple-review-after.md`. Modify `scripts/design/capture.mjs` (tramos y selectores nuevos de la Home), `docs/perf-report.md` (sección nueva), `tests/unit/filmBudget.spec.ts` solo si el comentario quedó desfasado.

- [ ] **Step 1:** `rg` de la definición de terminado sobre `src/components` y `src/app`: `background-clip: text`, `filter: blur`, `backdrop-filter`. Solo puede quedar la excepción del §8 del spec.
- [ ] **Step 2:** Captura «después» con `scripts/design/capture.mjs` (`--out docs/design/screens/after`), mismas páginas y anchos que el «antes», con contraste medido por píxel en las etiquetas de la nav sobre el video.
- [ ] **Step 3:** `docs/design/apple-review-after.md` con el formato de la skill y los números medidos. Sin hallazgos Critical ni High; si aparece alguno, se corrige antes de seguir.
- [ ] **Step 4:** Lighthouse contra `main` con el método de `docs/perf-report.md` («Lighthouse 13: branch vs `main`»): `LH_TAG=apple-pass npm run perf:lh` y `npm run perf:report -- apple-pass base-lh13`. Presupuesto del §7 del spec. Tabla nueva en `docs/perf-report.md`.
- [ ] **Step 5:** Revisión final de toda la rama, correcciones y una sola re-revisión.
- [ ] **Step 6:** Push de `feat/apple-pass`, Preview, capturas de antes y después por página, nota de memoria y resumen para Erick. **Sin merge.**

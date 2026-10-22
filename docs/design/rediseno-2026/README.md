# Redesign 2026, phase 2: «Workbench» across the whole site

Branch `feat/rediseno-workbench`, from `main` at `5edfa92`. Erick picked proposal C, «Workbench», from the three built in `lab/rediseno-2026` (that branch is never merged). This branch brings only C's code, outside `/lab`, and redesigns every page with it.

- `workbench-propuesta.md`: C's notes as built in the lab (idea, palette, type, motion, page map).
- `lab-contrato.md`: the lab contract (foundable's motion grammar, what Erick rejected, banned patterns, responsive rules, the media rule). It still applies, except where this file says otherwise.

## Order

1. **Home first**, then stop for Erick's yes.
2. Then About, Projects (`/work`), case studies (`/work/[slug]`), Blog and posts, Visual Work (`/gallery`), 404 and the protected-content screen (look only), without stopping between pages. Report at the end.

## What stays from the current site (Erick, 2026-10-21)

1. **The pointer glow**: `src/components/SpotlightBackground.tsx`, follows the cursor on desktop and the finger on phones. Its colour is cobalt.
2. **The page dots**: `spotlightStyles.pageDots` on `<body>` in `src/app/layout.tsx` (`SpotlightBackground.module.scss`). They scroll with the page as today, so sections must not paint an opaque page-coloured background over them (bands and sheets that are deliberately coloured may).
3. **Cobalto Eléctrico `#2D5BFF` is the accent** (tokens in `src/resources/custom.css`). C used sun yellow as its accent (call-to-action key, glow, brand square); those roles move to cobalt. The rest of C's palette stays (sun, tomato, mint, paper and charcoal as paper colours).
4. **The floating pill header**: `src/components/Header.tsx` + `Header.module.scss`, with its mobile menu. Keep its shape and navigation; adjust only typography and colours to C. It is the only exception to the no-capsule rule; buttons and everything else follow C.
5. **The intro with the logo**: `src/components/IntroLoader.tsx`, exactly as it is. Its wordmark uses `var(--font-heading)` (Space Grotesk), and `tests/e2e/intro-font.spec.ts` compares frames against reference screenshots, so `--font-heading` keeps pointing at Space Grotesk; C's typefaces come in under their own variables.
6. **Erick's logo**, the monogram in `src/resources/EMIcon.tsx`, visible as today (footer, 404, article ends).

## Rules carried over

- Never touch: chatbot logic (`FaqChatbot*`, `/api/chatbot`), the CSP and headers in `next.config.mjs`, `src/middleware.ts`, auth (`RouteGuard`, `PasswordPrompt` logic, `src/app/api/authenticate`, `src/utils/auth*`), `.env.local`. The protected screen's look is redesigned; its logic is not. The chatbot's look stays as it is unless Erick approves a restyle.
- No new animation dependency without asking Erick first.
- Media pieces (Visual Work, case-study images and videos) are never opened, watched, described or evaluated; they are laid out from path, type and proportions (from file metadata when the code lacks them).
- Real content only, in English. No invented figures, clients, prices or availability.
- Responsive: no horizontal scroll from 360 to 1440 px; touch targets at least 44×44; body text at least 16 px on phones; every animation has a phone version that does not depend on hover; with `prefers-reduced-motion: reduce` content appears without animation; animate only `transform` and `opacity`.
- Push of any branch needs Erick's permission; merge or push to `main` needs his explicit yes (it publishes to production).

## Done (phase 2)

- `npx tsc --noEmit`, Biome (`npx @biomejs/biome check src` on LF content; the working copy is CRLF under `core.autocrlf=true`, so check `git -c core.autocrlf=false archive HEAD src biome.json`, plus `node scripts/quality/biome-gate.mjs main`), `npm run build`, `npm run test:unit` and `npm run test:e2e` pass. Tests that depended on the old structure are updated, never deleted to pass.
- Screenshots of every page at 390 and 1440 px, light and dark.
- Lighthouse mobile on Home and Projects (`npm run perf:lh`, median of 3) no more than 5 points below `main`.
- Erick reviewed the result.

## Baseline, measured on `main` before starting (2026-10-21)

`LH_TAG=base-2026-10-21 LH_PAGES=home,work LH_FORMS=mobile LH_RUNS=3`, local `next start`, Lighthouse 13.5 through Edge (`CHROME_PATH`).

| Page | Runs (performance) | Median | Floor for this branch | LCP (median) | TBT | CLS |
|---|---|---|---|---|---|---|
| Home `/` | 90, 89, 89 | **89** | 84 | 3.69 s | 62 ms | 0.008 |
| Projects `/work` | 80, 81, 81 | **81** | 76 | 5.03 s | 62 ms | 0.000 |

## Step 1: the home (2026-10-21)

- **Code.** `src/components/workbench/` (from `src/lab/c/`): `_shared.scss` (breakpoints, mixins), `scope.module.scss`, `ui.module.scss`, `BookCall`, `Closing`, `RevealObserver`, `data.ts`, `media.ts`, and `home/` (Hero, Bench, Builds, ToolWall with its controller and lazy logo sprite, Projects, About). `src/app/page.tsx` composes them and keeps the metadata, the JSON-LD schema and the `isProtectedPath` rule.
- **Tokens.** Global `--wb-*` in `src/resources/custom.css`, switched on `html[data-theme]`. `--wb-accent` is cobalt `#2D5BFF` in both themes; the page colour also feeds Once UI's `--page-background`, so body (with its dots), header pill and header fades share it.
- **Type.** Bricolage Grotesque (Google's instance with the optical-size axis pinned at 96, 41 KB instead of 77 KB) and Onest, self-hosted in `public/fonts` with their OFL licences, declared in `custom.css` as `--font-wb-display` / `--font-wb-text` with metric-matched fallbacks, preloaded from the root layout. next/font cannot emit preloads on Windows builds, and the local Lighthouse floor needed them. Trade-off: files in `public/` are revalidated on a full reload instead of cached as immutable.
- **Transitional mechanism.** `src/components/SiteMain.tsx`: routes in `WORKBENCH_ROUTES` (only `/` now) get a bare `<main>` with the Workbench scope; every other route keeps the old padded Once UI wrapper unchanged. Step 2 adds each page to the set, then removes the switch.
- **Links.** Once UI styles every `a:not(.button)` globally. `scope.module.scss` mirrors that selector one class deeper inside Workbench areas only (the redesigned main and the site footer) and reads colour, underline and timing from `--link-*` custom properties, which components set with plain classes. No `.button` class on links; old pages are untouched.
- **Kept elements.** Glow: `SpotlightBackground` unchanged, cobalt 15 %. Dots: on `<body>` as before, every Workbench section transparent except the tool-wall band and the paper sheets. Header: same pill and navigation; Onest, Workbench hairline and shadow, current page with a paper surface, a cobalt bar and `aria-current`, 44 px keys on touch screens. Intro: untouched; the bench objects wait behind it and rise as it fades. Monogram: in the new footer, which also keeps the Once UI licence line.
- **Lighthouse home mobile** (`LH_TAG=home-wb`, local `next start` on 3301): 94, 85, 91, median **91**. The runs are bimodal (about 94 or about 85) depending on whether the first frame is presented before hydration starts; the low mode stayed at 84 or 85 over 9 samples.
- **Tests.** The four `lazy-video.spec.ts` tests fail on both projects because the showreel left the home (it moves to Visual Work in step 2). `intro-font.spec.ts` passes after the font fix below.
- **Font fix (review, 2026-10-21).** Once UI's tokens declare `:root { --font-heading: var(--font-heading) }` (same for body, label and code). On `main` that stylesheet loads before next/font's, so next/font wins and the site has Space Grotesk and Inter (checked on `main`'s build and on production). This branch's new stylesheets changed Next's CSS chunk order, the tokens landed after the fonts, the variables emptied, and the intro wordmark, the old pages and the chatbot fell back to Times New Roman (the intro test failure). It was not a `main` bug. Fix, independent of chunk order: the root layout also puts the next/font variable classes on `<body>`, and `custom.css` sets `--font-label` and `font-family: var(--font-body)` on `body`.
- **Lighthouse after the font fix** (`LH_TAG=home-wb-check`, 3301): 80, 81, 89, median **81**, below the floor of 84. The earlier 91 was measured while the bug skipped the Space Grotesk and Inter downloads (2 font requests; now 4, the same two as `main` plus Bricolage and Onest). LCP element: the bench's LeadBot image. To recover in step 1b without changing the look.

## Step 2: About (2026-10-22)

Branch `feat/wb-about` (from `feat/rediseno-workbench` at `268952a`).

- **Code.** `src/components/workbench/about/`: `Intro`, `Film` (server) with the `FilmFrame` client island, `Experience`, `Skills`, `Credentials`, one module stylesheet each. `src/app/about/page.tsx` composes them with `Closing` and `RevealObserver`, and keeps the metadata and the JSON-LD (`Schema` with `sameAs` and the author). `/about` left `LEGACY_ROUTES` in `SiteMain.tsx`. No shared file needed an addition.
- **The film** (Erick: the home's old loop, "de una forma impactante"). `/videohome.mp4`, 1280 x 720 from the file headers, laid out without opening it. Second section, right under the first screen. The stage reserves the file's ratio, near full-bleed (edge to edge on phones, a 24 px margin from tablets up, never taller than 88 % of the screen) and never changes size. Inside it the frame starts as a print on the bench: white border, tape, tilted (-4 deg desktop, -3.5 tablet, -3 phone) and scaled down (0.4, 0.56, 0.74), and rises in when the stage enters. When half of the stage is on screen (on phones, half of it inside the top 70 %, because the frame is short and would otherwise open as it enters) it opens once: scale 1.3 s on the soft curve, the tilt lands with the pop overshoot, border and tape fade, and the loop starts. Triggered, then on its own time: nothing is tied to the scroll position. Transform and opacity only.
- **Video behaviour** (adapted from `src/components/home/LazyVideo.tsx`): muted, `loop`, `playsInline`, `preload="none"` and no `src` until the first `play()`, so 0 video bytes before the frame opens; plays while at least a quarter of the stage is on screen, pauses when it leaves, and stays paused once the visitor pauses it. Pause key (paper square, 44 px or more) always visible once started: top-right on phones, clear of the chatbot corner; bottom-right from tablets up. Reduced motion or data saver: no autoplay, the frame is open from the first paint, and a cobalt play key is shown. The poster is a lazy `next/image` under the video, sized per screen, instead of the 1920 px `poster` attribute.
- **Page order.** First screen: the name (h1, as large as the column allows), role, a one-paragraph offer, Book a call, the resume download, GitHub, LinkedIn and email, and the polaroid (it drops in with a CSS animation and stays painted, so it never delays LCP). Then the film with the story under it (heading "My entry point into marketing wasn't a campaign. It was a crisis line.", four paragraphs from the intro, four figure tags: 338K+, 85 %, 48 h, Top Performer 2023). Work experience as ticket stubs (dates on the stub, company and role; a native `<details>` opens each one to its description and achievements; the current role starts open). Technical skills on one clipped spec sheet. Studies (two index cards) and the 13 certifications grouped by issuer, each name linking to its credential. The closing sheet.
- **Cut or moved.** The fixed side table of contents. The Once UI buttons ("Schedule a call", social buttons, "Download Resume") became Book a call and text links. The language tags moved into the polaroid caption (the closing note repeats them). The intro was trimmed: its first paragraph became the offer, and "Today I work at the intersection…" and "The work I find most interesting…" were dropped. The EM watermark that sat on the video on the old home. Inside the stubs, figures drop the global mono `.metric` style and keep the paper's type and colour.
- **Tests.** `tests/e2e/lazy-video.spec.ts` targets `/about` and `data-testid="about-video"` (on the stage), every assertion and the byte cap unchanged; with `a11y-names` and `ssr-content` it passes on chromium and mobile-chromium (31 passed, the 3 skips are the existing ones). The `/about` entry of `ssr-content` still finds "Erick Mahecha" in the h1.
- **Checks.** No horizontal scroll at 360, 390, 412, 600, 720, 768, 900, 1024, 1280 and 1440 in either theme; no text under 16 px on phones; console clean apart from the local `/_vercel/insights` 404 and its MIME line. Masked captures checked at 390 and 1440, light and dark. Lighthouse not run (measured at the end).
- **Left in place, now unused:** `src/components/about/` (TableOfContents and its stylesheet) and `src/components/home/LazyVideo.*`; they can go when the legacy switch is removed.

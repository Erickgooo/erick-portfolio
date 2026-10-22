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

## Step 2: Visual Work, 404 and protected screens (2026-10-22)

Branch `feat/wb-gallery`. Code in `src/components/workbench/gallery/` and `src/components/workbench/system/`; `SiteMain` no longer lists `/gallery` and `/unauthorized` as legacy.

- **Visual Work (`/gallery`).** Same source as before, `gallery.images` in `content.tsx`, unchanged, with GalleryView's grouping pass (a run of items sharing `group` is one carousel, YouTube links are videos, the rest single posts): 12 videos, 6 carousels, 14 posts, all present (the new spec checks the counts against the buttons). The client of a piece is the name its alt text opens with. Order: clients by number of pieces (Quick Metal Shop, Artesa Panadería, then Aseneg and Dakoma Roofing side by side on desktop, since they have one or two pieces), and inside a client videos, carousels, posts, each in the data's order. Each client opens with a coloured paper divider (cobalt, mist, ink, white) with a tab, its formats and, where a case exists and is public, "Related case" (Quick Metal Shop → `quick-metal-shop-marketing`, Artesa → `leadbot-ai`, Dakoma → `dakoma-roofing`). The head keeps the page's words and adds an index card that counts the pieces and jumps to each client.
- **Prints.** Videos are phone-shaped prints with the YouTube thumbnail (lazy) and a cobalt play key; carousels are a cover print over two fanned sheets with an "N slides" tag; posts are taped or pinned prints on a wall of equal-height rows where each print grows by its own width-to-height ratio, so no file is cropped (pixel sizes read from the file headers with sharp, in `data.ts`). Every piece is a server-rendered `<button data-piece>`; the only client islands are the viewer and the reveal observer.
- **Viewer.** One native modal `<dialog>` for the page (focus kept inside, Escape, the close key or a click on the dimmed bench closes, focus returns to the print). A video's player (`youtube-nocookie`, autoplay, focus moved into it) mounts only when its print is opened, so the page loads no player; a carousel is a scroll-snap track (swipe) with previous/next keys, the arrow keys and a live "n / N" counter; a post shows at its own ratio. The page behind stops scrolling while it is open.
- **Motion.** Prints pin themselves on enter (rise and settle, 90 ms apart), the divider slides in and settles at its angle, the carousel sheets fan out last with the overshoot, the index card lands on load, the viewer lifts the piece. Hover (fine pointers only) lifts and straightens a print and fades in the deeper shadow; on touch a press shrinks it slightly and a tap opens it. With reduced motion everything sits in place and the viewer opens without the lift.
- **404.** `src/app/not-found.tsx` renders `workbench/system/NotFound` (also used by RouteGuard for disabled routes, so it carries the Workbench scope itself): the monogram, "404", "Nothing on the bench here.", the previous lines ("This page hasn't been built yet…", which `ssr-content.spec.ts` looks for), Back to the home and See the projects, and a bench with an empty dashed spot whose pin is still there; the objects rise on load and bob only while on screen.
- **Protected screen.** `PasswordPrompt`'s state, `handleSubmit`, the `/api/authenticate` call and its error messages are unchanged; the diff is the imports and the JSX. Once UI's `PasswordInput` became `workbench/system/PasswordField` with the same props: visible label, `aria-invalid` and `aria-describedby` on error as before, plus a named "Show password" key with `aria-pressed`, a live error region and `autocomplete="current-password"`. The sheet is ink paper with the field as a square slot and a cobalt Submit; a wrong password nudges it sideways (`data-error`, derived from the existing error state). `LockedScreen` wraps it on `/unauthorized` with the Workbench scope, because the middleware rewrite keeps the protected URL and SiteMain picks its wrapper by that URL. Not done: sliding the sheet away on success, since success reloads the page at once and that would need new state.
- **Cut.** GalleryView (removed; `YouTubeFacade` stays for the MDX embeds); the lightbox's thumbnail strip (replaced by the counter, keys and swipe); the hover scale with an animated box-shadow; the "1/N" badge (now "N slides"); the interleaved order of the data. The intro's second paragraph is shortened; the old 404 heading is now its first line.
- **New copy, for Erick to confirm.** "Nothing on the bench here.", "Enter the password you were given to open it.", "Don't have it? Write to {email}", the closing "Want pieces like these for your brand?", "Related case: {title}", "On the bench".
- **Checks.** tsc, Biome and build pass. On `next start` (3331): `gallery-workbench.spec.ts` (new), `youtube-facade`, `ssr-content`, `cls` and `no-broken-images` pass on chromium and mobile-chromium. From 360 to 1440 px in both themes: no horizontal scroll, no text under 16 px on phones, no target under 44 px, no console error besides the local `/_vercel/insights` 404 (and the 404 page's own status). Layout reviewed on masked captures only (`--mask-media`, and the open viewer with the same mask).

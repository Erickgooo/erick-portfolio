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

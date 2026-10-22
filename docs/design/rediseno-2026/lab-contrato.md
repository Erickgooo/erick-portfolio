# Lab 2026: three redesign proposals

Branch `lab/rediseno-2026` (from `main` at `5edfa92`). **It is never merged into `main`.** Erick picks one proposal (or a mix); phase 2 then brings only that code to a new branch from `main`, outside `/lab`.

| Route | What |
|---|---|
| `/lab` | Index of the three proposals |
| `/lab/<a\|b\|c>` | Home in that proposal's design |
| `/lab/<a\|b\|c>/work/leadbot-ai` | One real case study in that design |
| `/lab/<a\|b\|c>/map` | How every other page of the site would look, a few lines each |

Every `/lab` route is `noindex, nofollow` (`src/app/lab/layout.tsx`). The site's header, footer, intro and glow step aside on `/lab` (`src/components/LabAware.tsx`); the hydrated markup of every other route was diffed against `main` (9 routes, light and dark) and is identical. The chatbot stays mounted everywhere, as it is.

## What foundable.com does with motion (observed 2026-10-21)

Opened with Playwright's Chromium at 1440×900 and at 390×844 (iPhone emulation), scrolled in steps with frames at 120 ms and 1 s after each step, plus `getAnimations()` and computed transitions. Screens stay out of the repo. The page is a Vite/React app with no animation library: everything is CSS transitions and keyframes toggled by JavaScript.

**Load**
- Hero sky: cloud layers rise into place once (`cloudsRise`, 1.6 s, linear) while a canvas fades in (opacity 0.6 s). The headline and input are there from the first frame; nothing blocks reading.
- The mascot appears about 3 s in, then bobs forever on a 4.4 s loop. The input placeholder types itself, cycling example prompts.

**Scroll reveals** (trigger: the element enters the viewport, then it plays on its own time; it is not scrubbed by scroll)
- Section headers and blocks: `opacity 0.9–1 s` + `translate 1.1 s`, both `cubic-bezier(0.2, 0.7, 0.2, 1)`: a long, soft ease-out. Short travel (a few dozen px).
- Siblings stagger by **90 ms** (cards at 0, 0.09, 0.18, 0.27, 0.36 s).
- Inside a block, parts stagger by **120 ms** (label 0.3 s, word 0.42 s, line 0.54 s; table rows 0.66, 0.78, 0.9 s), with `opacity 0.6 s` + `translate 0.8 s`.
- A highlight pops last with overshoot: `scale 0.5 s cubic-bezier(0.3, 1.6, 0.5, 1)`, about 1 s after its block.
- FAQ lines: quicker, `opacity 0.3 s` + `translate 0.4 s cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Nav arrows: 0.28 s micro transitions.

**Pinned steppers** (desktop)
- "From idea to first customer": the section sticks; a list of five steps on the left, a stage on the right. Scrolling advances the step. The active step goes bold and gets an underline in its own colour; the stage crossfades (~0.6 s, both scenes visible mid-way) to the next scene while its background colour shifts (blue, violet, teal, peach).
- The product window under the hero slides up and sticks while text types itself into its input ("Thinking…" state after).
- A dark card "Everything … handled": list of five on the left with the same underline progress; on the right a grid of app icons where the tiles of the active item light up (opacity and scale) around a centre tile.

**Mobile (390 px)**: nothing is pinned. Each stepper becomes a plain stack: step title, line, then its own scene inline. Cards go single column. Same reveal curves; no hover-only content. The hero keeps the sky and the self-typing input.

**What we take**: the motion grammar (long soft ease-out, 90/120 ms staggers, a last overshoot pop, scroll-advanced steppers that unpin into stacks on phones, self-playing loops kept small). **What we don't take**: its brand, sky and clouds, mascot, copy, chat-input hero or layout.

## Already rejected by Erick (do not repeat)

- «Blueprint → Live System»: basic, cold, too technical (grid, rails, crop marks, `01 / 05` indices).
- Home as a landing over a scroll-scrubbed video (reverted 2026-10-10, `5edfa92`). **No scroll-controlled video.**
- The apple-design pass and its lab directions: "looks made by AI". Do not start from `feat/apple-pass` or `lab/apple-directions`; do not use the `apple-design` skill as a style guide.
- Hero figures in a grid of glass panels; the role inside a capsule: "looks very AI".
- Mono figures read as flat; outlined emphasis words were disliked.
- He **does** like: the glow that follows the pointer (kept in every proposal), visual impact, motion as a protagonist.

**Banned patterns** (they make a site look generic): cream or bone backgrounds; italic accent words inside headings; numbered section labels ("01 / 02 / 03"); monospace labels; capsule (pill) buttons; gradient text; frosted glass panels; bento grids.

## Shared rules for every proposal

**Files.** Routes in `src/app/lab/<x>/` (`layout.tsx`, `page.tsx`, `work/[slug]/page.tsx` with only `leadbot-ai`, `map/page.tsx`); everything else in `src/lab/<x>/`. Notes in `docs/design/lab-2026/<x>.md`. Touch nothing else.

**Never touch**: chatbot logic and look (`FaqChatbot*`, `/api/chatbot`), `next.config.mjs` (CSP, headers), `src/middleware.ts`, auth (`RouteGuard`, `PasswordPrompt`, `src/app/api/authenticate`, `src/utils/auth*`), `.env.local`, `src/components/LabAware.tsx`, `src/app/layout.tsx`. **No new npm dependencies** (CSS, IntersectionObserver and what is installed are enough; ask first otherwise). Fonts via `next/font/google` are fine.

**Chrome.** Each proposal has its own header, footer and intro (or an explicit decision to have none), mounted in its `layout.tsx`. Its root element covers the page: `position: relative; z-index: 1; isolation: isolate; width: 100%; min-height: 100vh; background: <its own>` (the body underneath has the old dots). Nav items for pages the lab does not build point to the matching section of `/lab/<x>/map`. Leave the bottom-right corner free on phones: the chatbot button lives there.

**Glow.** Reuse `src/components/SpotlightBackground.tsx` unchanged: `<SpotlightBackground glowRadius={…} glowColor="lab-x-glow" />` reads `var(--lab-x-glow)`, so define that custom property on the proposal root for both themes. It follows the cursor on desktop and the finger on phones. Content above it needs `position: relative; z-index: 1`.

**Theme.** Light and dark, with the proposal's own selector. Use Once UI's `useTheme()` (`setTheme("light" | "dark")`), which sets `data-theme` on `<html>` and remembers it; style with `:global([data-theme="dark"]) &` or tokens switched on that attribute.

**Media pieces** (Erick, 2026-10-21). The reels, photos, images and videos of Visual Work and of the case studies are finished work: do not open, watch, describe or evaluate them. What gets designed is how a page presents them (grid, player, order, entrance motion). Lay them out from what the code gives (paths, file type, proportions); if a ratio is missing, read it from the file's metadata without opening the piece.

**Content.** Real data only, from `src/resources/content.tsx` and the MDX files (`metric` in each project's frontmatter, the media under `public/images/`). No invented figures, clients, prices, testimonials or availability. English. You may merge, reorder, cut and shorten; list what you removed. Primary action: "Book a call" → `about.calendar.link`.

**Responsive** (360–1440 px):
- No horizontal scroll at any width from 360 to 1440.
- Touch targets at least 44×44 px; body text at least 16 px on phones.
- Every animation has a phone version that does not depend on hover.
- With `prefers-reduced-motion: reduce`, content appears without animation.
- Animate only `transform` and `opacity` (the individual `translate`/`scale` properties count). Loops pause off-screen.

**Done for one proposal**: `npx tsc --noEmit`, `npx @biomejs/biome check src/app/lab/<x> src/lab/<x>` and `npm run build` pass; the three routes load with zero console errors at 390 and 1440 px in both themes; no horizontal scroll from 360 to 1440; you looked at your own screenshots and fixed what looked wrong; `docs/design/lab-2026/<x>.md` is written.

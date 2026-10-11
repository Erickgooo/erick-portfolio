# Performance report

## Fase A — Quick wins (`perf/quick-wins`)

### Lighthouse (median of 3), local `next start`, same machine

- **Date:** 2026-09-26
- **Target:** this worktree's own fresh build (`npm run build && npm run start -- -p 3100`), `http://localhost:3100`
- **Tool:** Lighthouse 12.8.2 CLI (`scripts/perf/lighthouse.mjs`), headless Edge (`CHROME_PATH` = Edge, same binary as `base-local`), default simulated throttling (mobile = Moto G Power / slow 4G; desktop = `--preset=desktop`)
- **Method:** `LH_TAG=quickwins-local npm run perf:lh` (3 runs per page × form factor = 30 reports, all 30 written), `npm run perf:report -- quickwins-local base-local`. Lighthouse's Chrome/Edge process again exited non-zero on every run with the same pre-existing Windows temp-dir `EPERM` cleanup error documented in `docs/perf-baseline.md`; judged by report-file existence, as that doc specifies.

| Página | FF | base-local (Perf / A11y / LCP / CLS / TBT / JS / Total) | quickwins-local (Perf / A11y / LCP / CLS / TBT / JS / Total) |
|---|---|---|---|
| home | mobile | 67 / 96 / 5.38 s / 0.226 / 84 ms / 344 KB / 3812 KB | 84 / 100 / 4.21 s / 0.012 / 19 ms / 344 KB / 756 KB |
| home | desktop | 96 / 100 / 0.96 s / 0.111 / 0 ms / 344 KB / 3542 KB | 99 / 100 / 0.85 s / 0.014 / 0 ms / 344 KB / 764 KB |
| about | mobile | 70 / 96 / 4.84 s / 0.218 / 90 ms / 342 KB / 799 KB | 74 / 100 / 4.36 s / 0.197 / 21 ms / 342 KB / 805 KB |
| about | desktop | 96 / 100 / 0.88 s / 0.114 / 0 ms / 342 KB / 795 KB | 99 / 100 / 0.87 s / 0.003 / 0 ms / 342 KB / 801 KB |
| work | mobile | 52 / 96 / 6.54 s / 0.774 / 89 ms / 344 KB / 1129 KB | 78 / 100 / 5.58 s / 0.001 / 20 ms / 344 KB / 1016 KB |
| work | desktop | 75 / 100 / 1.37 s / 0.509 / 0 ms / 344 KB / 1315 KB | 98 / 100 / 1.14 s / 0.000 / 0 ms / 344 KB / 1031 KB |
| blog | mobile | 71 / 86 / 4.74 s / 0.214 / 75 ms / 347 KB / 644 KB | 84 / 100 / 4.37 s / 0.001 / 20 ms / 347 KB / 638 KB |
| blog | desktop | 96 / 90 / 0.94 s / 0.114 / 0 ms / 347 KB / 642 KB | 99 / 100 / 0.87 s / 0.001 / 0 ms / 347 KB / 637 KB |
| gallery | mobile | 70 / 96 / 4.81 s / 0.214 / 98 ms / 1233 KB / 1855 KB | 82 / 100 / 4.74 s / 0.000 / 18 ms / 342 KB / 645 KB |
| gallery | desktop | 94 / 100 / 1.17 s / 0.114 / 0 ms / 1291 KB / 2384 KB | 98 / 100 / 1.13 s / 0.000 / 0 ms / 342 KB / 1060 KB |

Read alongside `docs/perf-baseline.md`'s own caveat: this local run is noisier and slower across the board than production (no CDN/edge caching, shared dev machine running Playwright/Edge/Node concurrently), so it is a same-machine before/after comparison, not a stand-in for the mobile Perf ≥ 95 / LCP < 2.0 s / CLS < 0.05 / TBT < 200 ms budget in the task brief — that budget is checked against the Vercel Preview in Step 7 (out of scope for this task; see "Open items"). Even so, every metric improved or held on this machine: A11y is 100 on every page (was 86–96), mobile CLS dropped from 0.214–0.774 to 0.000–0.197 (all pages now pass the < 0.05 budget except `about` mobile, at 0.197 — see concerns), TBT roughly halved everywhere it was non-zero, and mobile Total bytes fell sharply (home 3812→756 KB, gallery 1855→645 KB). Mobile Perf scores rose 12–26 points per page but are still below the 95 budget on every page (74–84 on this machine); LCP is still 4.2–5.6 s on this loaded local machine, also below the < 2.0 s budget — both are expected to look materially different on the Preview's isolated, CDN-served environment, but that comparison has not been run yet (Step 7). The local mobile LCP numbers above are dominated by Lantern's simulated network/CPU throttling model, not real render cost: `lcp-breakdown-insight` on this same run attributes only 68 ms (home), 158 ms (about) and 7 ms (gallery, post-11b) of *element render delay* to the page itself, all comfortably under 200 ms — the multi-second LCP is simulated time-to-first-byte/resource-load waiting, which is why the < 2.0 s budget is checked on the Preview (real network, real CDN) rather than here.

### Follow-up 11b — font preload + Gallery LCP eager-load

- **Date:** 2026-09-26
- **Method:** same harness as above. `LH_PAGES=about,gallery,home LH_FORMS=mobile LH_TAG=quickwins-11b npm run perf:lh` (`scripts/perf/lighthouse.mjs` gained `LH_PAGES`/`LH_FORMS` filters for this task — see "Files changed"), then `npm run perf:report -- quickwins-11b quickwins-local`.

| Página | FF | quickwins-local (Perf / A11y / LCP / CLS / TBT / JS / Total) | quickwins-11b (Perf / A11y / LCP / CLS / TBT / JS / Total) |
|---|---|---|---|
| home | mobile | 84 / 100 / 4.21 s / 0.012 / 19 ms / 344 KB / 756 KB | 84 / 100 / 4.52 s / 0.007 / 0 ms / 302 KB / 595 KB |
| about | mobile | 74 / 100 / 4.36 s / 0.197 / 21 ms / 342 KB / 805 KB | 88 / 100 / 3.92 s / **0.000** / 0 ms / 305 KB / 466 KB |
| gallery | mobile | 82 / 100 / 4.74 s / 0.000 / 18 ms / 342 KB / 645 KB | 88 / 100 / 3.84 s / 0.000 / 0 ms / 303 KB / 544 KB |

**Note on the JS column:** the `home` row's Lighthouse-measured JS transfer moved 344 KB → 302 KB between these two runs, but `next build`'s First Load JS for `/` was unchanged at 311 kB in both of *these* runs (this follow-up only touched font preloads and the Gallery LCP image) — no code that would shrink Home's JS bundle changed between `quickwins-local` and `quickwins-11b`. Treat the 344→302 KB delta as Lighthouse run-to-run/measurement noise (e.g. caching or chunk-loading variance between runs), not a real bundle-size change; First Load JS from the build output is the authoritative number for bundle size. (`/`'s First Load JS later moved to 312 kB in the final fix wave below, from an unrelated accessibility addition — see "First Load JS" below.)

**Correction (post-review, verified against production):** production (`main`, built on Linux/Vercel) already emits font preloads before this branch existed. `curl -s https://www.erickmahecha.com/` and `/about` each show four `<link rel="preload" as="font">` tags: `07844ae7c4262727-s.p.woff2`, `36966cca54120369-s.p.woff2`, `bb3ef058b751a6ad-s.p.woff2`, `e4af272ccee01ff0-s.p.woff2`. The owner's condition — "font preloaded when the intro renders" — was therefore already satisfied on `main`, before Task 11/11b touched anything. `07844ae7c4262727` is the *duplicate* Space Grotesk 700 instance that `IntroLoader.tsx` used to declare on its own (see commit `9ee8ff5`, "perf: drop duplicate font instances"); the other three (`36966cca`, `e4af272c`, `bb3ef058`) are the shared Space Grotesk / Inter / JetBrains Mono instances now centralized in `src/app/fonts.ts`. This branch's net effect on production preload count is **4 → 3** (removing the IntroLoader duplicate), not "0 → 3/4" as earlier drafts of this report implied. Re-check `.next/static/media` after a local build to confirm the same three hashes/names still appear once the duplicate is gone.

The **local 0-preloads measurement below, and the About-mobile CLS 0.197 (pre-11b) → 0.000 (post-11b) result, were artefacts of a Windows-only Next.js build bug (vercel/next.js#57008), not evidence of a production regression or a production fix.** On this Windows dev machine, `next build` never populates `next-font-manifest.json` (see root cause below), so *every* local build — including `main` before this branch — measures 0 font preloads and the corresponding CLS penalty, even though production has always preloaded fonts. The **0.197 → 0.000 local delta reported here is real on this machine but is not a production improvement**: production's About-mobile CLS baseline was **0.240** (`docs/perf-baseline.md`), and that number decomposes as the **0.214 footer shift** (present on every route, fixed by Task 3's synchronous `RouteGuard`) plus **~0.026** from other sources — not the ~0.2 font-swap shift the local-only measurement suggested. In short: the About CLS fix that matters in production is RouteGuard (Task 3) and the other Phase A layout-shift work, not the font-preload change measured here.

**Root cause of the local-Windows 0 preloads (verified empirically, not the module-sharing theory the brief hypothesized):** moving the `next/font` calls into `src/app/fonts.ts` (imported directly by `layout.tsx`, re-exported from `once-ui.config.ts` for compatibility) is a harmless, worthwhile refactor (single source of truth for the three font instances), but on its own it did **not** produce any preload locally — reproduced with three different module structures (fonts still in `once-ui.config.ts` reachable from client components; isolated in `src/app/fonts.ts` with zero client reachability; forced into an actual client bundle via a throwaway test component) and all three produced an identically empty `.next/server/next-font-manifest.json` (`{"pages":{},"app":{}}`). The actual cause: on Windows, the webpack module `request` string for anything processed by `next-font-loader` uses backslashes (`...\next-font-loader\index.js?...`), but `next/dist/build/webpack/plugins/next-font-manifest-plugin.js` tests `mod.request.includes('/next-font-loader/index.js?')` — a forward-slash-only substring that can never match on Windows, so the manifest is never populated and no `<link rel=preload>`/preconnect is ever emitted on this machine, independent of source layout. This matches a publicly reported Next.js issue (vercel/next.js#57008, "font manifest files are empty"). On Linux (Vercel Preview/production), the same unpatched Next.js code already uses forward slashes, which is why production has preloaded these fonts all along, with or without this branch's `fonts.ts` refactor.

**How the local CLS/preload numbers below were measured:** the owner's binding constraint rules out any install-time script or committed patch of `node_modules` (no `postinstall`, no in-range `patch-package` dependency, no `patches/` directory — Vercel's build stays a plain `npm ci && next build`). To measure the *local* effect of the Windows bug despite it masking the preload, a one-line fix to `next-font-manifest-plugin.js`'s separator check was applied **temporarily, out-of-tree, and never committed** (edited directly under `node_modules/next`, `npm ci` afterward restores the pristine unpatched package — confirmed by `git diff d6b8c9e -- package.json package-lock.json` being empty and `patches/` not existing in this branch). The CLS/preload numbers below reflect that temporary local measurement only; they are **not** a checked-in fix, do not represent production behavior (production never needed this patch), and ship nothing to production.

**Preloads seen under that temporary local patch** (`.next/server/app/index.html` and `about.html`): `Space Grotesk` latin (`36966cca54120369-s.p.woff2`), `Inter` latin (`e4af272ccee01ff0-s.p.woff2`), and `JetBrains Mono` latin (`bb3ef058b751a6ad-s.p.woff2`) — the same three hashes confirmed live on production above, all `latin` subset only, no extra subsets (budget guard held). JetBrains Mono's preload is **load-bearing for About's CLS on this local, patched measurement**, not incidental: it was first shipped with `preload: false` (not visibly used above the fold on Home/Gallery), but Lighthouse's `layout-shifts`/`cls-culprits-insight` audit then attributed a residual **0.033** About-mobile CLS to that exact font file loading late on the sticky meta panel under the local patch. Restoring its preload (default `preload: true`, the shipped source state) brought the local, patched measurement's CLS to exactly 0.000. So the shipped `src/app/fonts.ts` intentionally preloads all three fonts on every route, not just Space Grotesk + Inter — matching what production already does.

### Lighthouse (median of 3), Vercel Preview vs production baseline

**Not run.** Per the controller's task split, this task (Task 11, Steps 1–5) stops before push/Preview/Step 7. The Preview Lighthouse run, its comparison against `docs/perf-baseline.md`'s production table, and the mobile Perf ≥ 95 / LCP < 2.0 s / CLS < 0.05 / TBT < 200 ms / First Load JS ≤ baseline budget check against a production-like environment are deferred to whoever runs Steps 6–8.

### First Load JS (`next build`)

| Route | Baseline | Quick wins | Δ |
|---|---|---|---|
| `/` | 311 kB | 312 kB | **+1 kB** |
| `/about` | 275 kB | 275 kB | 0 |
| `/work` | 309 kB | 310 kB | **+1 kB** |
| `/blog/[slug]` | 312 kB | 312 kB | 0 |
| `/gallery` | 286 kB | 286 kB | 0 |

`/`'s +1 kB is new as of the final fix wave (post-review): `LazyVideo.tsx` gained a small accessible pause/play toggle button (state, a derived label, and a `togglePlayback` handler) for WCAG 2.2.2, per finding 8 of the review. Confirmed via `npm run build` after that change. Within the same justified-allowance reasoning as `/work`'s +1 kB below — a small, accessibility-motivated addition, not chased further.

`/work/[slug]` (not in the budget table) also moved 309 kB → 310 kB, same +1 kB. All other routes are unchanged or match baseline exactly. The `/work` +1 kB is within the task brief's justified +10 kB allowance and was accepted: the YouTube facade (Task 7) removes the third-party YouTube iframe API from the initial bundle (~870 KB of third-party JS no longer loaded up front, see the Gallery JS row under "Assets" below), and the small shared-chunk growth from `YouTubeFacade.tsx`/`ProjectCard.tsx` is the tradeoff for that removal — not chased further since Step 11 is verification-only, not a code-change task.

### Assets

| | Baseline | Quick wins |
|---|---|---|
| `public/` total | 109 MB | 54 MB |
| Home video bytes on load | ~3.5 MB | 0 |
| Gallery JS incl. third parties | ~1212 KB | 342 KB |

### Video audio decisions

Source: `.perf/video-decisions.txt` (Task 6 optimization pass, plus a Task 6 fix round).

```
public/videohome.mp4: 3.44MB -> mp4 3.47MB / webm 4.42MB | crf 32 | 1280x720 | audio: none -> REMOVED  !! OVER TARGET
public/images/projects/project-01/leadbot.mp4: 3.31MB -> mp4 2.34MB / webm 4.12MB | crf 32 | 1402x720 | audio: none -> REMOVED  !! OVER TARGET
public/images/projects/project-01/chatbot-artesa.mp4: 0.23MB -> mp4 0.25MB / webm 0.29MB | crf 26 | 640x360 | audio: none -> REMOVED
public/images/projects/cuatrimotos-project/chatbot-video.mp4: 1.02MB -> mp4 0.90MB / webm 1.37MB | crf 28 | 854x480 | audio: none -> REMOVED
public/images/projects/project-01/video-01.mp4: 14.12MB -> mp4 6.97MB / webm 8.25MB | crf 32 | 1804x1080 | audio: none -> REMOVED  !! OVER TARGET

--- fix round 1 (2026-09-26) ---
Issue: canPlayWebm() preferred WebM for every non-Apple browser, but the VP9 pass produced a
LARGER file than the MP4 for all 5 videos, and 2 of the 5 MP4 re-encodes were themselves larger
than the pre-task originals. Fixed optimize-videos.mjs: (a) an MP4 re-encode is discarded and the
original bytes kept if the encode isn't strictly smaller ("KEPT ORIGINAL"); (b) a WebM sibling is
kept only if it ends up >=10% smaller than the final MP4, with one retry at crf+14 (vs the
original crf+8) before giving up and deleting it.

public/videohome.mp4: mp4 3,611,663 B -> 3,639,353 B at crf 32 (LARGER) -> KEPT ORIGINAL (3,611,663 B, 3.44MB) | 1280x720 | audio: none | !! OVER TARGET (1.2MB target)
  webm retry 1 (crf 40): 4,639,192 B (bigger than mp4, fail)
  webm retry 2 (crf 46): 3,433,590 B vs threshold 3,250,497 B (90% of mp4) -> still fails -> WEBM DELETED, not referenced

public/images/projects/project-01/leadbot.mp4: mp4 3,466,938 B -> 2,455,421 B at crf 32 -> KEPT RECOMPRESSED (shrank) | 1402x720 | audio: none | !! OVER TARGET (1.2MB target)
  webm retry 1 (crf 40): 4,321,492 B (bigger than mp4, fail)
  webm retry 2 (crf 46): 2,978,325 B vs threshold 2,209,879 B (90% of mp4) -> still fails -> WEBM DELETED, not referenced

public/images/projects/project-01/chatbot-artesa.mp4: mp4 242,932 B -> 262,976 B at crf 26 (LARGER) -> KEPT ORIGINAL (242,932 B, 0.23MB) | 640x360 | audio: none
  webm retry 1 (crf 34): 299,882 B (bigger than mp4, fail)
  webm retry 2 (crf 40): 229,285 B vs threshold 218,639 B (90% of mp4) -> still fails -> WEBM DELETED, not referenced

public/images/projects/cuatrimotos-project/chatbot-video.mp4: mp4 1,068,851 B -> 947,740 B at crf 28 -> KEPT RECOMPRESSED (shrank) | 854x480 | audio: none
  webm retry 1 (crf 36): 1,438,050 B (bigger than mp4, fail)
  webm retry 2 (crf 42): 902,973 B vs threshold 852,966 B (90% of mp4) -> still fails -> WEBM DELETED, not referenced

public/images/projects/project-01/video-01.mp4: mp4 14,805,693 B -> 7,304,559 B at crf 32 -> KEPT RECOMPRESSED (shrank) | 1804x1080 | audio: none | !! OVER TARGET (4MB target) | unreferenced in src (rg check), deletion candidate
  webm retry 1 (crf 40): 8,649,579 B (bigger than mp4, fail)
  webm retry 2 (crf 46): 5,952,327 B vs threshold 6,574,103 B (90% of mp4) -> PASSES (18.5% smaller) -> WEBM KEPT

Final state: only public/images/projects/project-01/video-01.webm is kept and referenced (though
video-01.mp4 itself is unreferenced in src, so this webm currently ships to nobody either — flagged
alongside the mp4 as part of the same deletion candidate). public/videohome.webm and the other two
project WebMs no longer exist; src/app/page.tsx no longer passes `webm` to LazyVideo for Home.
```

On top of the recompression above, Task 6's lazy-video work (`preload="none"`, play only once in viewport, no autoplay under reduced-motion/save-data) means the Home video downloads **0 bytes in the initial HTML/document load** regardless of its 3.44 MB file size — confirmed both by `tests/e2e/lazy-video.spec.ts` (passing on chromium/mobile-chromium/firefox in this run) and by the Home "Media" transfer column not appearing among Lighthouse's byte totals above. **Qualification:** `LazyVideo`'s `IntersectionObserver` (threshold `0.25`) is attached in a post-hydration `useEffect`, not gated on a user scroll — so on a tall enough desktop viewport where the hero video is already ≥25% visible at load, it starts fetching/playing as soon as hydration completes, not only "when scrolled into view." The measured Lighthouse runs above (mobile/desktop presets, standard viewport heights) did not hit this case, but it should be described as "0 bytes until the video is ≥25% visible (in practice, after hydration on most viewports; immediately after hydration on tall desktop viewports where it's already in view)," not as an unconditional guarantee.

### Security checks

Source: `.perf/security-notes.txt` (Task 3 Step 8, server-side RouteGuard/protected-route verification) plus this task's Steps 2–3.

**Task 3 Step 8 summary (full text in `.perf/security-notes.txt`):**
- Without an auth cookie: `/work` returns `200` with `Cache-Control: no-store`, and 0 matches for protected content (`LeadBot AI`) across plain HTML, a dynamic child route (`/work/leadbot-ai`), and the RSC payload (`RSC: 1` header) — protected content is never sent to an unauthenticated request in any response shape.
- With a valid cookie (via `/api/authenticate` with the correct password, `200`): `/work` then returns ≥1 match for the protected content — the unlock path works.
- Disabled-route check (`/gallery: false`): comparing the new synchronous `RouteGuard` against the old (pre-fix) version at commit `e1a6d5a`, both return HTTP `200`, but only the new version renders the NotFound UI as real, visible server HTML (outside `<script>` tags) — the old version's server HTML instead contains the loading Spinner, with NotFound only present inside the client-hydration JSON payload. This is exactly the CLS root cause (0.214 footer shift) that Task 3 fixes; the branch's disabled-route status code is not worse than pre-fix (both 200).
- Cleanup was verified: temporary env-var-only credentials were never written to `.env.local`; `protectedRoutes.ts`/`once-ui.config.ts` test edits were reverted (confirmed via `git status --short`); `RouteGuard.tsx` restored to the fixed version; a final `npm run build` left the tree in the fixed, rebuilt state; test ports (3100, 3300) verified free afterward.

**Task 11 Steps 2–3 (this run):**
- **Step 2 — security headers vs production:** `curl -sI https://www.erickmahecha.com/` vs `curl -sI http://localhost:3100/` for `content-security-policy`, `x-frame-options`, `x-content-type-options`, `referrer-policy`, `permissions-policy`, `strict-transport-security`, `x-dns-prefetch-control`. Only one byte-level diff: `X-Dns-Prefetch-Control` (production, likely re-cased by Vercel's edge) vs `X-DNS-Prefetch-Control` (this branch, from Next.js directly) — HTTP header names are case-insensitive per RFC 7230, so this is not a functional difference. Every header's **value** is byte-identical, including the full CSP string. Not `HEADERS IDENTICAL` verbatim from `diff`, but semantically identical.
- **Step 3 — auth endpoints, branch vs production:**
  | Endpoint | Local branch (3100) | Production |
  |---|---|---|
  | `GET /api/check-auth` | 401 | 401 |
  | `POST /api/authenticate` (wrong password) | 500 | 500 |

  Codes match production in both cases — no regression. (The `500` on a wrong password, on both branch and production, is pre-existing behavior, not introduced by this branch; not investigated further as it's identical on both sides.)
- **Chatbot live check:** deferred to the Preview (Step 7, out of scope here) — this worktree has no `.env.local` (confirmed: only `.env.example` is present) and the brief requires it never be read, created, or copied.
- **`npm audit`:** see "Open items" — the `--omit=dev` count is **not** zero as the brief anticipated; the 3 production-dependency vulnerabilities are unrelated to this branch's new devDependencies (confirmed pre-existing: `package.json`'s `dependencies` and `overrides` are byte-identical to `main`; only `devDependencies` gained `@playwright/test` and `lighthouse`).

### Open items

- `videohome.mp4` remains **OVER TARGET** (3.44 MB, original kept — the recompression attempt was larger and was discarded; 0 bytes in the initial load in the common case, thanks to lazy-load — see the qualification above about tall desktop viewports where it's already ≥25% visible at hydration). Meeting the 1.2 MB target needs a resolution/trim decision by the owner.
- `leadbot.mp4` is 2.34 MB (**OVER TARGET**); `video-01.mp4`/`.webm` are unreferenced anywhere in `src` — deletion candidates (Erick decides).
- **Closed, corrected:** the owner condition "font preloaded when the intro renders" was already true on production **before this branch** — `curl` against `https://www.erickmahecha.com/` and `/about` confirms 4 `<link rel="preload" as="font">` tags on `main` today (see "Follow-up 11b" above for the hashes). This branch's `src/app/fonts.ts` refactor is a harmless consolidation of the three font instances (not the fix that made preloading happen — production never needed one), and its one functional effect on preload count is removing the duplicate IntroLoader Space Grotesk 700 instance, taking production from 4 preloads to 3. The local Windows measurement showing 0 preloads (and the About-mobile CLS 0.197→0.000 swing) never reflected production; it was entirely an artefact of the Windows-only Next.js font-manifest bug (vercel/next.js#57008 — `next-font-manifest-plugin.js`'s path-separator check never matches on Windows). No install-time patch was shipped (confirmed: `git diff d6b8c9e -- package.json package-lock.json` is empty, no `patches/` directory, no `postinstall` script). **Next step (optional, low priority):** confirm on the Vercel Preview that the 3 expected preload hashes (`36966cca`, `e4af272c`, `bb3ef058`) are present and `07844ae7` is gone, matching the production `curl` check already done against `main`.
- `public/images/og/home.jpg` (1.6 aspect ratio) is cropped ~10% by the 16:9 carousel on the oldest `/work` card; the Plan 2 index change is expected to replace this carousel.
- `npm audit`: **full** `npm audit` reports **24 vulnerabilities (17 moderate, 6 high, 1 critical)**. `npm audit --omit=dev` reports **3 vulnerabilities (2 high, 1 critical)** — **not 0**, contrary to what the brief anticipated. These 3 (`next` critical RCE advisory, `sharp` high, `js-yaml` via `gray-matter`) are pre-existing production-dependency issues, unrelated to this branch (verified: `package.json`'s `dependencies`/`overrides` sections are unchanged from `main`; only `devDependencies` gained `@playwright/test` and `lighthouse`). The remaining 21 (17 moderate + 4 high) come from the new devDependencies' own dependency chain (Lighthouse → puppeteer-core → `@puppeteer/browsers` → `extract-zip`), all dev-only, not shipped to production.
- iOS YouTube single-tap check pending (Erick, on the Preview); `MUTE_ON_IOS = false` in `src/components/YouTubeFacade.tsx`.
- Extra line-level `biome-ignore` suppressions added in Task 1 (FaqChatbot regex loop, greeting bubble) and import-order-only formatting of the middleware/auth route files. Biome also reformatted `src/app/api/chatbot/route.ts` (Task 1, commit `d27818a`): a multi-line, backslash-continued template-string concatenation in `buildSystemPrompt()` was collapsed into a single template literal. Verified byte-identical output — concatenating the original segments in order produces the exact same string as the new single template literal, including the embedded `${message}` interpolation and `\n` boundaries; no wording, whitespace, or prompt-injection-marker text changed.
- **New, found during this task's Step 1 gate run:** `/work` and `/work/[slug]` First Load JS grew **309 kB → 310 kB** (+1 kB), a small miss against the "≤ baseline" budget. Every other route matches or beats baseline exactly. Not chased further — Task 11 is verification-only.
- **New, found during this task's Step 1 gate run:** `tests/e2e/intro-font.spec.ts` failed on `mobile-chromium` (3 tests) — a genuine test defect from Task 10, not a product regression: its `test.skip(({ browserName }) => browserName !== "chromium", …)` only excludes Firefox/WebKit, because `mobile-chromium`'s underlying engine is also named `"chromium"` by Playwright, but Task 10 only captured/committed baseline screenshots for the desktop `chromium` project. Fixed here by skipping on `testInfo.project.name !== "chromium"` instead (same pattern already used in `tests/e2e/a11y-names.spec.ts`), matching the test's own stated intent ("reference frames are Chromium-only" = one desktop project, not every Chromium-engine project). No product code changed. Full suite is green after the fix: 105 passed, 27 skipped (declared), 0 failed.
- **Task 11b:** an install-time patch of `node_modules/next` (via `patch-package` + `postinstall`) was tried during this task to work around the Windows-only font-manifest bug (vercel/next.js#57008) so the preload fix could be measured locally, but was rejected on review (binding constraint: no postinstall/install-time scripts, no in-range devDependencies, Vercel build stays plain `next build`) and removed — `package.json`/`package-lock.json` are back to byte-identical with `d6b8c9e`, no `patches/` directory exists on this branch. The Windows bug therefore remains **unworked-around** in this repo; local measurement of the preload fix used a temporary, never-committed edit under `node_modules/next` instead (see "Follow-up 11b"). Preload emission on Linux (Preview/production) is expected to work without any patch, since the bug is Windows-path-specific, but has not yet been directly confirmed there — see the updated font-preload Open item above.

## Rediseño (`feat/disruptive-redesign`) — CP2 (Fase B + Home, Tasks 1–13)

Measured 2026-10-09 on the branch after merging `main` (`dea8a88`: security audit, Lighthouse 12.8.2 → 13.5.0). Lighthouse 13.5.0, Playwright's Chromium, median of 3. The 12.8.2 figures above and in `docs/perf-baseline.md` are not comparable with these.

### Lighthouse 13 baseline (`main`)

| Page (mobile) | Production `prod-lh13` (Perf / A11y / LCP / CLS / TBT) | Local `next start` `base-lh13` |
|---|---|---|
| home | 88 / 98 / 3.83 s / 0.021 / 52 ms | 82 / 100 / 4.62 s / 0.026 / 55 ms |
| about | 91 / 98 / 3.38 s / 0.026 / 69 ms | 74 / 98 / 4.37 s / 0.197 / 54 ms |
| work | 89 / 98 / 3.76 s / 0.000 / 71 ms | 77 / 98 / 5.55 s / 0.001 / 58 ms |
| blog | 88 / 98 / 3.83 s / 0.000 / 72 ms | 84 / 98 / 4.36 s / 0.001 / 60 ms |
| gallery | 85 / 98 / 4.36 s / 0.000 / 46 ms | 81 / 98 / 4.66 s / 0.000 / 75 ms |

`main` itself misses the plan's budget (Perf ≥ 95, LCP < 2.0 s) on every page with Lighthouse 13, in production and locally. With 12.8.2 production scored home 97 / 2.48 s after the quick wins. Local runs are worse than production because Windows builds emit no font preloads (vercel/next.js#57008), which also explains the local About CLS of 0.197.

### Branch vs baseline, local, same machine (`cp2-lh13` vs `base-lh13`)

| Page | FF | `main` (Perf / A11y / LCP / CLS / TBT / JS / Total) | Branch |
|---|---|---|---|
| home | mobile | 82 / 100 / 4.62 s / 0.026 / 55 ms / 349 KB / 729 KB | 73 / 100 / 5.14 s / 0.110 / 123 ms / 352 KB / 743 KB |
| home | desktop | 99 / 100 / 0.98 s / 0.016 / 0 ms / 349 KB / 734 KB | 99 / 100 / 0.98 s / 0.022 / 0 ms / 352 KB / 743 KB |
| about | mobile | 74 / 98 / 4.37 s / 0.197 / 54 ms / 347 KB / 792 KB | 80 / 98 / 4.39 s / 0.100 / 68 ms / 351 KB / 802 KB |
| about | desktop | 99 / 98 / 0.89 s / 0.003 / 0 ms / 347 KB / 788 KB | 99 / 98 / 0.88 s / 0.008 / 0 ms / 351 KB / 799 KB |
| work | mobile | 77 / 98 / 5.55 s / 0.001 / 58 ms / 349 KB / 959 KB | 77 / 98 / 5.83 s / 0.001 / 57 ms / 352 KB / 974 KB |
| work | desktop | 98 / 98 / 1.10 s / 0.000 / 0 ms / 349 KB / 969 KB | 98 / 98 / 1.13 s / 0.000 / 0 ms / 352 KB / 1019 KB |
| blog | mobile | 84 / 98 / 4.36 s / 0.001 / 60 ms / 352 KB / 607 KB | 83 / 98 / 4.44 s / 0.001 / 57 ms / 356 KB / 638 KB |
| blog | desktop | 99 / 98 / 0.88 s / 0.001 / 0 ms / 352 KB / 606 KB | 99 / 98 / 0.87 s / 0.001 / 0 ms / 356 KB / 636 KB |
| gallery | mobile | 81 / 98 / 4.66 s / 0.000 / 75 ms / 347 KB / 626 KB | 81 / 98 / 4.81 s / 0.000 / 73 ms / 351 KB / 636 KB |
| gallery | desktop | 98 / 98 / 1.12 s / 0.000 / 0 ms / 347 KB / 962 KB | 98 / 98 / 1.13 s / 0.000 / 0 ms / 351 KB / 1061 KB |

**Open: Home mobile regresses** (Perf −9, LCP +0.52 s, CLS 0.026 → 0.110, TBT +68 ms). Lighthouse attributes 0.095 of the CLS to the hero's `KineticText` words: each word is an inline-block, so every one of them moves when the web font replaces the fallback, whereas a plain text node does not count as shifted. The other four pages are within noise of `main`. The Vercel Preview has not been measured yet (Deployment Protection; needs the bypass secret) — it preloads the fonts, so the shift may not show there.

### First Load JS (`next build`)

| Route | Plan baseline | `main` now | Branch | Δ vs `main` |
|---|---|---|---|---|
| `/` | 311 kB | 312 kB | 314 kB | +2 kB |
| `/about` | 275 kB | 275 kB | 275 kB | 0 |
| `/work` | 309 kB | 310 kB | 311 kB | +1 kB |
| `/blog/[slug]` | 312 kB | 313 kB | 313 kB | 0 |
| `/gallery` | 286 kB | 286 kB | 286 kB | 0 |

All routes are within the plan's baseline + 10 kB.

### Motion ledger

Lighthouse ran at the checkpoint, not per task (execution ruling), so the per-task column is the build delta; the Lighthouse figures for all of these together are the table above.

| Task | Effect | Technique | Δ First Load JS |
|---|---|---|---|
| 2 | Motion boot flags, Blueprint Grid, global spotlight removed | Inline `<head>` script; CSS background; rAF loop deleted | 0 |
| 3 | `Reveal` | CSS `animation-timeline: view()`, IntersectionObserver fallback (`MotionRuntime`) | `/about` +1 kB |
| 4 | `KineticText` | Per-word `transform`, CSS only | 0 |
| 9 | Page transitions | View Transitions API, one global click listener | `/about` +2 kB, recovered in Task 10 by importing primitives by path instead of the barrel |
| 10 | Home hero: kinetic headline, decoding stats, blueprint frame | CSS + `DecodeText` (client) | `/` +1 kB |
| 11 | Home rail, branches, docking reel frame | CSS scroll-driven, `transform` only | 0 |
| 12 | Featured project spec sheet, parallax, CTA with `GlowTrack`/`Magnetic` | CSS scroll-driven; pointer handlers on fine pointers only | `/` +1 kB, `/blog/[slug]` +1 kB |
| 13 | IntroLoader → hero hand-off | `html.intro-pending` class | `/work`, `/work/[slug]` +1 kB |

### KineticText LCP check (Task 10)

Lighthouse 12.8.2, Home, median of 3, run at the first CP2 (2026-09-27) as `cp2-kinetic` / `cp2-static`.

| Home | Variant | Perf | LCP | CLS |
|---|---|---|---|---|
| mobile | `KineticText` | 91 | 3.09 s | 0.103 |
| mobile | static `h1` | 84 | 4.29 s | 0.010 |
| desktop | `KineticText` | 99 | 0.98 s | 0.019 |
| desktop | static `h1` | 99 | 0.98 s | 0.014 |

The plan's rule (keep the static `h1` if LCP with `KineticText` is more than 50 ms slower) does not trigger: on mobile the LCP element is the subline paragraph, not the `h1`, and the mobile difference is run-to-run noise; on desktop, where the `h1` is the LCP element, the difference is +3 ms. `KineticText` stays under that rule. Its CLS cost is the open item above.

### Security after the merge

- Response headers are identical to `main`'s build (CSP, Permissions-Policy, COOP and the other six), and `/api/check-auth`, `/api/authenticate`, `/api/chatbot`, `/api/rss` and `/api/og/generate` return the same status codes on both.
- `node scripts/quality/csp-check.mjs`: 0 CSP violations and 0 console errors over 15 page loads (5 routes × Chromium desktop, Chromium mobile, Firefox), each scrolled to the bottom and left through a header link. The inline boot script set `data-fx` on every load and a View Transition started on every navigation. WebKit is covered only over https (pending on the Preview).
- `FeaturedProject` takes the same `hideProtected` filter `main` added to `Projects`, so a password-protected project is never the featured one on Home.

### Ideas descartadas

None beyond the spec's §11 list so far: no effect has been reverted by a perf gate. The hero `KineticText` is the candidate if its CLS cannot be brought under 0.05.

## Landing con película de scroll (`feat/disruptive-redesign`, 2026-10-09)

Replaces the "Blueprint" Home measured in the CP2 section above, which Erick rejected. Same machine, same day and same Lighthouse 13.5.0 setup as `base-lh13`; local `next start`, median of 3. The Home rows are from the final commit (`landing-final-lh13`); the other four pages were measured one commit earlier (`landing-lh13`), before a review pass that did not touch them.

### Lighthouse 13: branch vs `main`

| Page | FF | `main` `base-lh13` (Perf / A11y / LCP / CLS / TBT / JS / Total) | Branch `landing-lh13` |
|---|---|---|---|
| home | mobile | 82 / 100 / 4.62 s / 0.026 / 55 ms / 349 KB / 729 KB | 85 / 100 / 4.33 s / 0.000 / 57 ms / 352 KB / 10504 KB |
| home | desktop | 99 / 100 / 0.98 s / 0.016 / 0 ms / 349 KB / 734 KB | 100 / 100 / 0.66 s / 0.001 / 0 ms / 352 KB / 12624 KB |
| about | mobile | 74 / 98 / 4.37 s / 0.197 / 54 ms / 347 KB / 792 KB | 86 / 98 / 4.13 s / 0.045 / 52 ms / 351 KB / 746 KB |
| about | desktop | 99 / 98 / 0.89 s / 0.003 / 0 ms / 347 KB / 788 KB | 99 / 98 / 0.83 s / 0.026 / 0 ms / 351 KB / 743 KB |
| work | mobile | 77 / 98 / 5.55 s / 0.001 / 58 ms / 349 KB / 959 KB | 80 / 98 / 5.30 s / 0.000 / 61 ms / 353 KB / 917 KB |
| work | desktop | 98 / 98 / 1.10 s / 0.000 / 0 ms / 349 KB / 969 KB | 98 / 98 / 1.10 s / 0.000 / 0 ms / 353 KB / 963 KB |
| blog | mobile | 84 / 98 / 4.36 s / 0.001 / 60 ms / 352 KB / 607 KB | 86 / 98 / 4.13 s / 0.000 / 49 ms / 356 KB / 598 KB |
| blog | desktop | 99 / 98 / 0.88 s / 0.001 / 0 ms / 352 KB / 606 KB | 99 / 98 / 0.83 s / 0.000 / 0 ms / 356 KB / 596 KB |
| gallery | mobile | 81 / 98 / 4.66 s / 0.000 / 75 ms / 347 KB / 626 KB | 83 / 98 / 4.59 s / 0.000 / 54 ms / 351 KB / 597 KB |
| gallery | desktop | 98 / 98 / 1.12 s / 0.000 / 0 ms / 347 KB / 962 KB | 98 / 98 / 1.12 s / 0.011 / 0 ms / 351 KB / 1021 KB |

Budget agreed for this work (no page worse than `main` by more than 3 Perf points or 0.3 s of LCP; CLS < 0.05; A11y ≥ 95; TBT < 200 ms): **met on all ten rows.** No page is worse than `main` on Perf or LCP. The Home's CLS regression from the previous direction (0.110, word-split headline) is gone: the hero heading is plain text again.

**The cost is page weight on Home: 10.5 MB on mobile and 12.6 MB on desktop, against 0.7 MB on `main`.** That is the film (10.2 MB portrait, 12.3 MB landscape). It is requested after `load`, so it does not hold back LCP, and it is never requested under reduced motion, on the lite device tier, with Save-Data or on a connection the browser reports as 2g/3g (Chromium only). Everyone else downloads it on every visit to the Home, whether or not they scroll. Not measured: real mobile networks, and the Vercel Preview (Deployment Protection).

The local numbers stay below production's for the reason given above: Windows builds emit no font preloads.

### First Load JS (`next build`)

| Route | `main` | Branch | Δ |
|---|---|---|---|
| `/` | 312 kB | 314 kB | +2 kB |
| `/about` | 275 kB | 275 kB | 0 |
| `/work` | 310 kB | 310 kB | 0 |
| `/blog/[slug]` | 313 kB | 312 kB | −1 kB |
| `/gallery` | 286 kB | 286 kB | 0 |

### What moves, and how

| Effect | Technique | Notes |
|---|---|---|
| Film scrubbed by scroll | `video.currentTime` set from the section crossing the top of the viewport; clip fetched once and played from a Blob, with the plain URL as a fallback where a Blob will not play (Playwright's WebKit) | One rAF per scroll frame, seeks coalesced while the decoder is busy |
| Section copy in and out | CSS `view-timeline` on each section, `transform` and `opacity` | Static in browsers without scroll timelines |
| Tagline word by word | CSS `view-timeline`, per-word `animation-range` | IntersectionObserver fallback |
| Benefit figures | `DecodeText` scramble on entry | Skipped under reduced motion |
| Cursor glow | `SpotlightBackground`, restored from production | A permanent rAF loop, as in production today |
| Scroll reveals | CSS `view()` timeline; blur on the full tier only | Entry range capped at 30vh so tall blocks are sharp at load |

### Security

Headers are identical to `main` except one directive: `media-src 'self'` became `media-src 'self' blob:`, approved by Erick for the in-memory film. `node scripts/quality/csp-check.mjs`: 0 CSP violations and 0 console errors over 15 page loads (5 routes on Chromium desktop, Chromium mobile and Firefox). WebKit over https is still unchecked (Preview behind Deployment Protection).

### Ideas descartadas

| Idea | Motivo |
|---|---|
| Dirección «Blueprint → Live System» completa (retícula, riel con nodo, marcos, índices) | Erick: se ve básica, fría y demasiado técnica |
| Titular partido en palabras (`KineticText`) en el hero | CLS 0.110 en móvil por el cambio de fuente; ahora es texto plano |
| Nav en píldora con menú hamburguesa | Erick prefiere la barra con iconos del sitio actual |
| Fondos planos sin textura | Erick prefiere el fondo de puntos y la luz que sigue al mouse |
| Cifras en fuente monoespaciada | Erick: se ven planas |
| Recorte central del video en el teléfono | Dejaba al sujeto fuera de cuadro; ahora el encuadre sigue cada plano |
| Motor de `scroll-world` tal cual y sus escenas generadas con IA | Su texto se genera con JS (malo para SEO y LCP) y las escenas cuestan dinero; se portó solo la técnica de scrub |

### Not verified

- A real iPhone or Mac Safari. Playwright's WebKit refuses the Blob URL and plays the film through the plain-URL fallback; whether real Safari takes the Blob or the fallback is unknown.
- The Vercel Preview (Deployment Protection): no Lighthouse and no CSP check over https there.
- Real mobile networks. The 10 to 12 MB film is the one number here that a local run cannot judge.


## Apple-design pass (`feat/apple-pass`, 2026-10-10)

Same machine and setup as the sections above: Lighthouse 13 CLI against a local `next start`, headless Edge (`CHROME_PATH`), median of 3. The baseline is `perf-final`, the local measurement of `main` after the load-time pass (same code as `main` today, measured 2026-10-09). The branch was measured twice: all five pages at `34b1ccd` (tag `apple-pass`), then Home and About again on the final build `bbee76a` (tag `apple-pass-final`) after the last round of fixes, which added the `<main>` landmark and changed nothing that loads.

| Page | FF | `main` `perf-final` (Perf / A11y / LCP / CLS / TBT / JS / Total) | Branch |
|---|---|---|---|
| home | mobile | 85 / 100 / 4.21 s / 0.000 / 23 ms / 268 KB / 4950 KB | 89 / 100 / 3.62 s / 0.000 / 39 ms / 263 KB / 4911 KB (final build) |
| home | desktop | 99 / 100 / 0.85 s / 0.001 / 0 ms / 268 KB / 12546 KB | 100 / 100 / 0.78 s / 0.001 / 0 ms / 263 KB / 12508 KB (final build) |
| about | mobile | 89 / 98 / 3.61 s / 0.048 / 24 ms / 268 KB / 667 KB | 91 / 96 / 3.32 s / 0.031 / 15 ms / 263 KB / 420 KB (final build) |
| about | desktop | 100 / 98 / 0.73 s / 0.026 / 0 ms / 268 KB / 663 KB | 100 / 96 / 0.71 s / 0.010 / 0 ms / 263 KB / 417 KB (final build) |
| work | mobile | 83 / 98 / 4.51 s / 0.000 / 28 ms / 269 KB / 835 KB | 89 / 98 / 3.63 s / 0.000 / 51 ms / 265 KB / 781 KB (`34b1ccd`) |
| work | desktop | 99 / 98 / 0.90 s / 0.000 / 0 ms / 269 KB / 845 KB | 99 / 98 / 0.95 s / 0.000 / 0 ms / 265 KB / 890 KB (`34b1ccd`) |
| blog | mobile | 88 / 98 / 3.69 s / 0.000 / 25 ms / 272 KB / 500 KB | 88 / 98 / 3.78 s / 0.000 / 31 ms / 268 KB / 486 KB (`34b1ccd`) |
| blog | desktop | 100 / 98 / 0.77 s / 0.000 / 0 ms / 272 KB / 499 KB | 100 / 98 / 0.78 s / 0.000 / 0 ms / 268 KB / 485 KB (`34b1ccd`) |
| gallery | mobile | 87 / 98 / 3.84 s / 0.000 / 47 ms / 268 KB / 518 KB | 87 / 98 / 3.92 s / 0.000 / 68 ms / 263 KB / 505 KB (`34b1ccd`) |
| gallery | desktop | 99 / 98 / 0.94 s / 0.011 / 0 ms / 268 KB / 855 KB | 99 / 98 / 0.96 s / 0.000 / 0 ms / 263 KB / 842 KB (`34b1ccd`) |

Budget (no page worse than `main` by more than 3 Perf points or 0.3 s of LCP; CLS < 0.05; A11y >= 95; TBT < 200 ms): **met on all ten rows.** No page loses a Perf point; the largest LCP increase is 0.09 s (blog, mobile).

- **Accessibility.** At `34b1ccd` About scored 94 on mobile, under the budget: every page but the Home failed "Document does not have a main landmark", and Lighthouse sometimes caught the chatbot greeting mid fade-in and counted it as low contrast. The final build has one `<main>` around the page content: Home 100 / 100, About 96 / 96. The remaining About failure is that same greeting (steady state 16.87:1 in the dark theme); the chatbot is out of this work's scope. It shows up now because the greeting's background, `--surface-background`, became opaque and axe can compute it.
- **Not re-measured on the final build:** Performance for work, blog and gallery. The last round changed their markup (a `<main>` tag, link attributes, the first blog thumbnail now loads with priority) but nothing that adds weight.
- **Home, mobile, TBT 23 -> 39 ms** and **About, total weight 667 -> 420 KB:** measured, cause not investigated.
- A second runner worth adding: `/work/leadbot-ai`, whose hero is now a paused clip with a poster that is not preloaded.

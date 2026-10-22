# Proposal C: Workbench

Routes: `/lab/c`, `/lab/c/work/leadbot-ai`, `/lab/c/map`. Code in `src/app/lab/c/` and `src/lab/c/`. Branch `lab/rediseno-2026-c`.

**Idea in one sentence.** Erick's real work laid out as objects on a workbench (the bot running on a tablet, printed posts, campaign creatives, and paper tags carrying his figures) that rise into place, idle, and answer the pointer or the finger.

Working name was «Workshop»; renamed **Workbench** because the page is literally objects laid on a bench, and the copy uses it as a thread ("What's on the bench", "Work on the bench", "The rest of the bench").

## What it takes from foundable

- **Load sequence.** Like foundable's layers rising, the hero's eight objects rise one after another: 0.8 s each, 90 ms apart from 120 ms, landing with `cubic-bezier(0.3, 1.6, 0.5, 1)`; the sequence ends at about 1.55 s. The text is readable from the first frame, as foundable's headline is.
- **Self-playing loops, kept small.** Each object then bobs on its own loop (4.2 to 5.2 s, offset phases, about 1 % of the bench width and 0.7°), like the mascot's 4.4 s bob. The loops pause while the bench is off-screen.
- **Scroll reveals.** Opacity 0.95 s + translate 1.1 s, `cubic-bezier(0.2, 0.7, 0.2, 1)`, siblings 90 ms apart; triggered when the element enters, never scrubbed by scroll.
- **The last pop.** A highlight lands with an overshoot on scale: the 85 % on the case folder (at 1 s), the figure tags in the case margin, the tool tiles.
- **Pinned stepper with an icon grid.** The tool wall pins on desktop and scrolling advances four groups: the active group gets an underline in its own colour and its tiles light up one by one (90 ms) on a 6×4 wall where the groups are scattered, as in foundable's "Everything handled" card. On phones it unpins into a plain stack: each group with its own tiles, which light up as they enter.
- **Not taken:** the sky and clouds, the mascot, the chat-input hero, the copy, the layout.

## Palette

Solid fills only, no gradients on any object. The page glow is the shared `SpotlightBackground`, tinted like a desk lamp.

| Token | Light | Dark |
|---|---|---|
| Page | `#FFFFFF` | `#131316` |
| Ink | `#131316` | `#F5F5F7` |
| Secondary ink | `#55555F` | `#A6A6B0` |
| Lines | `#E6E6EB` | `#2B2B31` |
| Surface | `#F3F3F5` | `#1C1C21` |
| Band (tool wall) | `#131316`, ink `#FFFFFF`, tiles `#212126` | `#FFFFFF`, ink `#131316`, tiles `#F0F0F3` |
| Glow `--lab-c-glow` | `rgba(255,197,49,0.30)` | `rgba(255,197,49,0.11)` |

Paper colours, the same sheets in both themes: sun `#FFC531`, tomato `#FF5B3A`, cobalt `#2D5BFF` (`#3D67FF` on the dark page), mint `#2FD3A0`, paper `#FFFFFF`, charcoal `#131316` / `#1D1D22`; folder back `#E8A70F`. Charcoal text on sun, tomato, mint and white; white text on cobalt and charcoal (all at least 4.5:1). The band is always the opposite of the page, so the rhythm survives in both themes.

## Typography

- **Bricolage Grotesque** (display), variable with its optical-size axis, weights 600 to 800, tracking −0.025 to −0.05 em. Headlines, figures, card titles, monograms on the tool tiles.
- **Onest** (body), 17 px on phones and 18 to 20 px on desktop, weights 400 to 600.
- Both via `next/font/google`. No monospace, no italics, no outlined or gradient words.

## How it moves

**Desktop**
- Hero: the load sequence above, then the bob. With a fine pointer the cluster leans with the pointer (parallax by depth: up to 12 px across, 9 px down, 0.9 s soft ease). Hovering an object lifts it and fades in a deeper shadow (opacity of a shadow layer, never `box-shadow`). Clicking brings it forward.
- What I build: four index cards are dealt onto the bench (rise, then settle at their angle with an overshoot).
- Tool wall: the pinned stepper.
- Projects: from 1280 px the six cards wait as a stack and fan out when it enters (translate + rotate 1.1 s, 90 ms apart), dealt left to right so every card shows its figure. Hover or focus lifts a card 32 px and straightens it.
- Case: the cover print slides out of the folder with an overshoot, the cobalt sheet behind it follows, the 85 % pops last. Prints in the margin pin themselves on enter (rise, then settle at their angle). Videos play muted only while on screen, with a pause key.
- The «Book a call» key lifts 2 px on hover and its sun square tilts; it sits in the sticky header on every page, so it stays reachable through the whole case.

**Phones**
- Same load sequence and bob, no parallax and nothing that needs hover. A tap brings an object forward; a second tap sets it down.
- The four figure tags leave the bench and lie in a 2×2 row of tags under it, at 16 px.
- Tool wall unpinned; projects become a horizontal scroll-snap row (78 vw cards); the case prints sit inline after their section; the pull-quote that repeats the text beside it is dropped.

**Reduced motion** (`prefers-reduced-motion: reduce`): no rise, bob, parallax, reveals, dealing, fan spread or folder slide; everything sits in its final place. Videos never start on their own (the play key stays). The stepper still switches state, without transitions, and every group reads at full opacity.

**Rules kept:** only `transform` (`translate`, `rotate`, `scale`) and `opacity` animate. Once UI gives every link `transition: all` and a brand colour; here links take colour, underline and timing from custom properties, and only transform properties and opacity may transition. Loops run only while visible.

**Intro decision:** no overlay. The objects rising onto the bench are the intro; the header and the hero text are there from the first paint.

## What changed from the current Home (`src/app/page.tsx`)

- **Featured badge** (Quick Metal Shop): removed; the case lives in the fan with its figure.
- **Headline**: kept the first sentence, "I build marketing infrastructure from zero." Cut "And make it outperform full departments."
- **Subline**: shortened to one sentence (the offer). The Quick Metal Shop story is carried by the 338K+ tag and the fan.
- **Stats row** (four capsules): became four paper tags on the bench, next to the work they come from.
- **About button with avatar**: replaced by the name line with the avatar in the hero and the About section.
- **Showreel video** (`/videohome.mp4`): removed from the home (it belongs on Visual work).
- **Projects** (one card): replaced by the fan of six cases that have a metric.
- **Latest from the blog**: removed from the home; Blog stays in the header.
- **"View all projects"** button: became the link "All nine projects".
- **CallToAction**: became the closing sun sheet ("Show me where your team's time goes.") with Book a call and the email. Mailchimp was not displayed and is not rendered.
- **Added:** What I build (four index cards), the tool wall (24 tools, all named in `content.tsx` or the MDX), a short About with the photo and every company.

## Does the chatbot clash?

Mildly. It stays mounted, untouched, in the bottom-right corner. Its launcher is a neutral grey Once UI circle with the photo, and its greeting bubble is a grey card whose text falls back to Times New Roman (that happens on every page of the site, not only here). Next to white paper and solid colours it reads as another system. If Workbench is chosen, phase 2 would give the launcher a paper treatment (a white or charcoal disc with a sun ring) and fix the bubble's font family, without touching its logic. The bottom-right corner is left free on phones and the footer leaves room for it.

## Page map

The same text as `/lab/c/map`. Header items for pages the lab does not build (Work, About, Blog, Visual work) link to these sections; project cards other than LeadBot link to Projects.

**About** (`/about`). Opens on the pinned photo from the home, beside the story that starts at a crisis line. Experience is a stack of ticket stubs (company, role, dates) dealt onto the bench as you scroll; each one opens to its achievements. Studies and the 13 certifications are index cards you flip through; the skills reuse the tool wall. Book a call and the resume download stay on the first screen.

**Projects** (`/work`). All nine cases as cover prints on one long bench. On desktop the home's fan opens into loose rows that keep a slight tilt. Each print carries its metric as a paper tag; the three cases without one carry the client's name instead. On phones it is a single column of prints with the tag pinned to the corner. Opening a print leads to a folder like LeadBot's.

**Blog** (`/blog`). Posts as printed sheets stacked on the bench, newest on top, with the title in Bricolage and the date on a small rotated label. A sheet lifts on hover and on tap. A post reads like the LeadBot case: one column of Onest at 19 px, images pinned in the margin, a sticky note for the line that matters.

**Visual work** (`/gallery`). The fullest bench. Carousels are fanned stacks you deal through with a swipe or the arrow keys; vertical videos are phone-shaped prints that play muted only while on screen; single posts are square prints with tape. A coloured paper divider separates each client. Opening any piece lifts it to the middle of the screen over a dimmed bench.

**404** (any missing page). A bench with one empty spot: the dashed outline where a print should be, bobbing like the hero objects. One line, "Nothing on the bench here", and two ways out: Home and Book a call.

**Protected content** (`/unauthorized`). A locked drawer: a charcoal sheet with the password field cut into it as a square-cornered slot, one line on why the case is private, and the submit key in sun yellow. A wrong password nudges the sheet sideways; the right one slides it down out of view. Transform only.

## Notes for phase 2

- Media frames keep each file's own proportions (read from the file headers); nothing is cropped.
- The case renders the MDX with its own component map (`src/lab/c/case/CaseMDX.tsx`), split at the `##` headings so media can sit beside each part.
- Local `next start` logs a 404 for `/_vercel/insights/script.js`, from the root layout's Analytics, on every route of the site; it does not come from this proposal.

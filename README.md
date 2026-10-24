# Erick's Portfolio

The website of Erick Mahecha, Growth Marketing & AI Automation Specialist: [erickmahecha.com](https://www.erickmahecha.com).

It shows his work as a bench of real artifacts: case studies with drawn, animated scenes, a blog, the Visual Work gallery, an About page with his experience, and ErickBot, an assistant that answers questions about him.

## Stack

- [Next.js 15](https://nextjs.org) (App Router) and React 19, written in TypeScript.
- Styles in CSS Modules with Sass; the design tokens live in `src/resources/custom.css` and the document's base rules in `src/resources/base.css`.
- Case studies and posts in MDX, rendered with `next-mdx-remote`.
- ErickBot runs on Google Gemini (`/api/chatbot`).
- Hosted on [Vercel](https://vercel.com).

## Where things are

| Path | What it holds |
|---|---|
| `src/resources/` | The site's data: `profile.ts` (who it is about), `site.ts` (pages, settings), `about.tsx`, `gallery.ts`, `home.tsx`, `protectedRoutes.ts` |
| `src/app/work/projects/*.mdx` | The case studies, one file each |
| `src/app/blog/posts/*.mdx` | The blog posts |
| `src/components/workbench/` | The pages' sections, the scenes and their styles |
| `src/components/` | The header, footer, chatbot, intro and theme key |
| `src/utils/` | Reading posts, dates, SEO metadata, auth and rate limits |
| `public/` | Images, videos and the resume |

## Run it

Requires Node.js 18.18 or later (the minimum for Next.js 15).

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

Environment variables (see `.env.example`):

- `PAGE_ACCESS_PASSWORD`: the password for routes listed in `src/resources/protectedRoutes.ts`.
- `AUTH_SECRET`: the key that signs the access cookie.
- `GEMINI_API_KEY`: turns ErickBot on (without it the chatbot route answers 503).

## Checks

```bash
npm run build       # production build
npm run lint        # Next.js lint rules
npm run test:unit   # unit tests
npm run test:e2e    # end-to-end tests on Chromium, a phone, Firefox and WebKit (needs a build)
npm run perf:lh     # Lighthouse on mobile and desktop, results in .perf/
```

## Deploys

Every push to `main` deploys to production on Vercel; every other branch gets a preview deployment.

## License

Copyright © 2025–2026 Erick Santiago Mahecha Tafur. All rights reserved; see [LICENSE](LICENSE).

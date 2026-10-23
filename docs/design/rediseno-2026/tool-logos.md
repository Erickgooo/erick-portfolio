# Tool logos for the "tools I've shipped real work with" wall

Files in `src/components/workbench/home/tools/` (in `public/images/tools/` until 2026-10-22; moved so the build serves them with a content hash and a long cache), one per brand, collected on 2026-10-22. All 24 are official (none uses the Simple Icons fallback), and none is missing.

How they were prepared:

- **Sources.** Each mark comes from the brand's press kit or brand page, or from its own website (inline SVG, logo file or site icon). The marks are unmodified: nothing was redrawn, recoloured or generated.
- **Cropping.** Where the only file was a lockup, it was cropped to the symbol. Every SVG has a square `viewBox` around the mark with a 3 % margin, so all marks sit the same way in a square tile.
- **SVG cleanup.** Removed scripts, event handlers, metadata, comments, editor attributes, `<style>` blocks (their rules are inlined as attributes) and unused ids. The remaining ids are prefixed with the slug (`gemini-1`, `meta-12`…), and no file has external references. All SVGs are under 8 KB.
- **PNG.** Used only where the brand publishes no real vector: transparent, square, at least 128 px, downscaled to at most 256 px.
- **Checks.** Each cleaned SVG was compared pixel by pixel with its source, over the same area. The difference is 0 except for Meta (rounding), Kling and CapCut, all at most 7/255. A contact sheet on white and on `#131316`, at large size and at 32 px, was checked by eye.

## Logos

| Brand (as on the site) | File | Mark | Source | Status | Notes |
|---|---|---|---|---|---|
| WhatsApp Business API | `whatsapp.svg` | Symbol (glyph) | [WhatsApp Brand Resource Center](https://www.meta.com/brand/resources/whatsapp/whatsapp-brand/), `WhatsApp-Brand-Resource-Center.zip` → `01_Glyph/01_Digital RGB/03_SVG/Digital_Glyph_Green_RGB_2026.svg` | Official | Green `#25D366`, 2026 glyph. whatsappbusiness.com, the WhatsApp Business Platform site, uses this same glyph as its icon. The WhatsApp Business *app* "B" icon was not used, because the site names the API. |
| Bitrix24 | `bitrix24.svg` | App icon | [bitrix24.com/favicon.svg](https://www.bitrix24.com/favicon.svg), the site icon, also used on the [brand guidelines page](https://www.bitrix24.com/about/brand-guidelines.php) | Official | "24" in white on `#006DFF`. The press-kit `bitrix24-logo.zip` only has the older light-blue wordmark with the clock, so the current app icon came from the site's own icon. |
| Kommo CRM | `kommo.png` (190 px) | App icon | [developers.kommo.com/apple-touch-icon.png](https://developers.kommo.com/apple-touch-icon.png) (Kommo's developer portal) | Official, doubtful quality | White "k" on purple `#5F43D0`. Kommo has no press kit and publishes no vector symbol; kommo.com only has the "kommo" wordmark as SVG. The 180 px source is soft (Kommo upscaled it), and the other official copies are 96–100 px. The white corners of the source were made transparent, with the edge blended against the icon's own purple. |
| BotSL IA | `botsl.png` (166 px) | Symbol (robot) | Bitrix24 Market listing by the developer, System Leads: [systems_leads.whatsai](https://www.bitrix24.com/apps/app/systems_leads.whatsai/), icon `https://util.bitrixsoft.com/upload/bx24vendor/97e/7n2w49h4r2mcbcau785plg39sf0bfa0z/logo%208%20(1)%20(1).png` (250 px) | Official, doubtful quality | Black, green and white. Cropped to the robot (the "BotSL IA" caption was removed) and the white background made transparent. System Leads' own site, [systemsleads.com](https://systemsleads.com/botsl-ia/), shows no BotSL logo. The only source is a 250 px raster, and the detailed robot reads busy at 32 px. |
| Zapier | `zapier.svg` | App icon | [Zapier Brand Guidelines](https://brand.zapier.com/), file `App Icon.svg` (`https://firebasestorage.googleapis.com/v0/b/standards-site-beta.appspot.com/o/documents%2F279072ea39f%2F8fc2c38ae5f%2FApp%20Icon.svg?alt=media&token=282c3c58-da3a-4520-8105-087623697bdf`) | Official | That file is a sheet of sizes; this is the 150 px version (white wordmark on `#FF4F00`). Zapier has no separate symbol. Its guidelines limit the icon to "favicons and app stores" and otherwise require the full `_zapier` logo, so check that a tool tile counts as an icon context. |
| Odoo | `odoo.svg` | **Wordmark** | [Odoo Brand Assets](https://www.odoo.com/page/brand-assets) → `https://odoocdn.com/openerp_website/static/src/img/assets/svg/odoo_logo.svg` | Official | Odoo has no symbol: its brand assets only offer the wordmark, and its favicon is 16/32 px. Purple `#714B67` and grey `#8F8F8F`. Small at 32 px. |
| GPT-4o mini | `openai.svg` | Symbol (Blossom) | [OpenAI Design Guidelines](https://openai.com/brand/) → `https://cdn.openai.com/brand/openai-logos.zip` → `SVGs/OAI_OpenAI-Blossom_Black.svg` | Official | **Black mark.** There is no separate GPT-4o mini mark, so this is the OpenAI mark. OpenAI's guidelines forbid adding colours to the Blossom. |
| Gemini | `gemini.svg` | Symbol (spark) | [gemini.google/overview](https://gemini.google/overview/), inline footer spark SVG | Official | Current four-colour spark, drawn with an SVG mask and blur filters. It matches the gemini.google.com app icon. Two empty filter steps left by Figma were removed, with no visual change. 8.06 KB. |
| Claude | `claude.svg` | Symbol (spark) | [claude.com](https://claude.com/), inline header SVG (the Claude wordmark lockup) | Official | Claude spark in `#D97757`, cropped from the lockup; the "Claude" text was removed. It is not the Anthropic wordmark. |
| ElevenLabs | `elevenlabs.svg` | Symbol | [ElevenLabs Brand](https://elevenlabs.io/brand) → `elevenlabs-symbol.svg` | Official | **Black mark** (two bars), cropped from its clear-space canvas. |
| Soro AI | `soro.svg` | Symbol (site icon) | [trysoro.com](https://trysoro.com/) → `https://trysoro.com/icon.svg` | Official | Purple gradient `#6054FF` → `#8641FF`. This is Soro, the AI SEO and blog autopilot. It matches the portfolio's description: automated SEO blog publishing, a snippet in Odoo and Shopify, linked to Search Console. No other product called Soro turned up ("Sora" is OpenAI's video model). |
| Holo AI | `holo.png` (256 px) | Symbol | [tryholo.ai](https://tryholo.ai/) → `https://tryholo.ai/brand/holo-mark-black.png` (286×221) | Official, **confirm with Erick** | **Black mark**, raster only (the site's SVG favicon only wraps this PNG), padded to a square. Several products share the name, see below. This one was picked because the portfolio says Holo AI automated LinkedIn content, which matches tryholo.ai (an "AI CMO" that writes social posts, ads and emails). |
| Meta Ads | `meta.svg` | Symbol | Site icon of [meta.com](https://www.meta.com/) and the Meta Brand Resource Center: `https://static.xx.fbcdn.net/rsrc.php/yf/r/-7pQO6hUGK_.svg` | Official | Meta symbol in its blue gradient. The brand center's `Meta_Company-Lockup.zip` only has the symbol plus wordmark, and its colour SVG embeds a raster gradient (374 KB). Coordinates were rounded to 3 decimals to fit under 8 KB (difference at most 4/255). |
| Instagram | `instagram.png` (256 px) | Symbol (glyph) | [Instagram brand resources](https://www.meta.com/brand/resources/instagram/instagram-brand/), `IG_brand_asset_pack_2023.zip` → `01 Static Glyph/01 Gradient Glyph/Instagram_Glyph_Gradient.png` (5000 px) | Official | Gradient glyph. PNG because the pack's gradient "SVG" is a 10.9 MB wrapper around an embedded raster. |
| Facebook | `facebook.png` (256 px) | Symbol | [Facebook brand resources](https://www.meta.com/brand/resources/facebook/logo/), `Facebook-Brand-Asset-Pack.zip` → `Logo/Primary Logo/Facebook_Logo_Primary.png` (2084 px) | Official | White "f" on blue `#0866FF`. The official pack has no vector. |
| Google Analytics | `google-analytics.svg` | Symbol | `https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg`, the icon Google Analytics uses in its own app header | Official | `#F9AB00` and `#E37400`. The file is on Google's CDN; the [product page](https://marketingplatform.google.com/about/analytics/) has no standalone logo download. |
| Search Console | `search-console.svg` | Symbol | [Search Console about page](https://search.google.com/search-console/about) → `https://gstatic.com/search-console/scfe/logo_search_console.svg` | Official | Cropped from the lockup to the symbol, in Google's four colours. |
| Shopify | `shopify.svg` | Symbol (bag) | [Shopify Brand Assets](https://www.shopify.com/brand-assets) → `shopify-shopping-bag.zip` → `02 - Glyph/svg/shopify_glyph.svg` | Official | `#95BF47` and `#5E8E3E` with a white S. |
| Higgsfield | `higgsfield.svg` | Symbol (glyph) | [higgsfield.ai](https://higgsfield.ai/), inline header SVG (`hf-logo__glyph`) | Official | **Black mark.** The site draws it in `currentColor`, so it is set to black, as on Higgsfield's [app icon](https://higgsfield.ai/icon.png) (black glyph on lime). No press kit. |
| Kling 3.0 | `kling.svg` | Symbol | [kling.ai](https://kling.ai/) (Kuaishou's Kling AI), inline header SVG `IconKlingLogoEn` | Official | **Black mark.** Cropped from the symbol plus "Kling AI" wordmark. The site draws it in `currentColor`, so it is set to black; the [app icon](https://s16-kling.klingai.com/kos/s101/nlav112918/kling-homepage-aio/logo-180x180.png) is the same mark in white on black. |
| DaVinci Resolve | `davinci-resolve.png` (256 px) | App icon | [Blackmagic Design press images](https://www.blackmagicdesign.com/media/images), "DaVinci Resolve Logo Square": `https://downloads.blackmagicdesign.com/press/press-images/davinci-resolve-logo-square/20210518-sdl66n/DaVinci-Resolve-Logo-Square.zip` (852 px TIFF) | Official | Full-colour icon. The press file dates from 2021, but blackmagicdesign.com/products uses the same design today, only at 46 px. |
| CapCut | `capcut.svg` | Symbol | [capcut.com](https://www.capcut.com/), inline header SVG (symbol plus "CapCut") | Official | **Black mark**, cropped to the symbol. The site draws it in `currentColor`, so it is set to black, as in CapCut's own favicon. |
| Next.js | `nextjs.svg` | Symbol | [Vercel brand page](https://vercel.com/geist/brands) → `next-js-light.svg` | Official | **Black mark** (black circle, white N with a gradient fade). |
| Netlify | `netlify.svg` | Symbol (monogram) | [Netlify press kit](https://www.netlify.com/press/) → `logo-netlify-monogram-fullcolor-lightmode.svg` | Official | Teal `#05BDBA` with a dark-teal `#014847` "n". This is the light-mode version, meant for the white tile; the dark "n" almost disappears on dark backgrounds. A dark-mode version exists. |

## Colour notes for the white tile

- **Black marks:** OpenAI, ElevenLabs, Holo, Higgsfield, Kling, CapCut, Next.js. They need the white tile; on `#131316` they disappear.
- **Low contrast on dark:** Netlify (its dark-teal "n") and Odoo (its grey letters).
- **Rasters (PNG):** Kommo, BotSL IA, Holo, Instagram, Facebook, DaVinci Resolve. Use them at no more than about 64 px (`kommo.png` is 190 px and `botsl.png` 166 px).

## Doubtful or open

- **Holo AI: shared name, picked from context.** Products called Holo or Holo AI:
  - **tryholo.ai** (Vilnius), an AI marketing tool that writes social posts, ads and emails. This is the one picked.
  - **Holoworld AI** (HOLO token, AI agents).
  - **H Company's Holo** model family.
  - A Solana "Holo AI" agent protocol.

  If Erick means another one, delete `holo.png`.
- **Kommo CRM:** soft source raster, with no vector symbol anywhere official. A sharper official file would need Kommo's press contact.
- **BotSL IA:** raster only, 250 px, from the marketplace listing. The developer's site has no logo.
- **Zapier:** the brand guidelines limit the app icon to icon contexts (see the row above).

## Not found

Nothing. All 24 brands have an official mark.

# Incentiva Group en el portafolio (Erick, 2026-11-02)

Encargo de Erick (vía Lyra): publicar su experiencia como Operations Manager en Incentiva Group, con 7 casos completos, un índice de todo lo demás y una escena en código por caso, hasta producción.

- **Rama:** `feat/incentiva-2026` (worktree `.claude/worktrees/incentiva`), desde `origin/main`.
- **Punto de regreso:** `d34c3de` (main al empezar, el que está en producción).
- **Fuente de verdad:** `Incentiva_Experience_Knowledge_Base.md` («la base»), fuera del repo. Cifras solo de sus líneas «Publishable results» y de su «Portfolio-ready copy».
- **Lenguaje de movimiento:** `pulido-animaciones.md`. Motor de escenas: `src/components/workbench/scenes/start.ts` (una escena a la vez).

Estado: ☐ pendiente · ☑ hecho · ➖ fuera (con motivo).

## Tareas

| # | Pieza | Estado |
|---|---|---|
| T1 | Caso P14 `scope-multi-client-platform` (MDX + escena `TenantGate`) | ☑ |
| T2 | Caso P30 `scope-ios-launch` (MDX + escena `StoreReleases`) | ☑ |
| T3 | Caso P33+P32 `chatflow-whatsapp-ai-platform` (MDX + escena `PlatformTakeover`) | ☑ |
| T4 | Caso P10+P11+P18 `directv-click-to-whatsapp` (MDX + escena `WhatsAppFunnel`) | ☑ |
| T5 | Caso P02 `ai-cv-screening` (MDX + escena `CvScreen`) | ☑ |
| T6 | Caso P08 `incentiva-launch-campaign` (MDX + escena `LaunchChain`) | ☑ |
| T7 | Caso P07+P19 `incentiva-website-brand` (MDX + escena `MedalScroll`, la medalla oficial que se desarma y se arma con el scroll) | ☑ |
| T8 | Índice `/work/incentiva-group`: 32 tarjetas (P01–P33 menos P24) por área, estado, línea y stack; escena `InheritedPlatforms`; en el sitemap | ☑ |
| T9 | `/work`: tarjetas y franja de cifras con los casos nuevos; enlace al índice | ☑ |
| T10 | Contenido: cargo «Operations Manager», «Role summary» y «Experience bullets» (sin el de RFM) | ☑ |
| T11 | Home: hero (2 cifras nuevas, línea de rol, oferta), «What I build» (5.º bloque y ejemplos), «What's on the bench» (stack nuevo), «Work on the bench» (P14, P10, P02 + 3) | ☑ |
| T12 | About: experiencia de Incentiva y habilidades técnicas («Skills matrix») | ☑ |
| T13 | ErickBot: cargo, proyectos nuevos, cifras confidenciales; snapshot | ☑ |
| T14 | Visual Work: imágenes de P07 y P19 que pasen las reglas (P08: sus piezas finales no están en esta máquina, D6) | ☑ |
| T15 | e2e: cada caso y el índice cargan, su escena arranca y queda quieta con movimiento reducido | ☑ |
| T16 | Puerta: tsc, build, lint, unit, e2e ×4, Lighthouse intercalado, frames ≤ 50 ms, búsqueda de términos y cifras | ☑ |
| T17 | Merge `--no-ff` a main, push y comprobaciones en producción | ☑ |

## Decisiones

- **D1. Sin Higgsfield.** Las portadas y los visuales de los productos (Scope, Portal, ChatFlow) se hacen en código: cada portada es el estado final de la escena del caso sobre su papel. Gasto de créditos: 0.
- **D2. Escenas.** Retrato 4:5, con los tokens y el motor existentes; ninguna usa interfaces reales ni datos de clientes (nombres de campaña ficticios, «Client A», «Client B»). La medalla (P07, P08) se anima con los trazados del SVG oficial del tema (`incentiva_medalla_m2-navy-amarillo.svg`), copiados tal cual: dos piezas, la cinta y el disco.
- **D3. Medalla con el scroll.** Para que se desarme y se arme con el scroll (como en la web) el motor gana un modo `scrub`: el paso de la escena sale del avance de su parte del texto por la pantalla, en los dos sentidos. Sigue las reglas del motor (una escena a la vez; quieta en su estado final con movimiento reducido).
- **D4. Clientes como en el «Portfolio-ready copy».** En los casos, «a second fintech client», «the brand's commercial team», «Incentiva's DIRECTV dealership»; en las tarjetas del índice, Wompi, Nequi, Ingredion, Samsung y Mall Indiana, que el copy nombra. Colmaíz y LifeMiles no se nombran (el copy no lo hace). Ningún número P aparece en el sitio: son claves internas.
- **D5. Estados.** Las cuatro etiquetas de la base. P05, P16, P22, P25 y P26: «Proposal / pitch». P09 («delivered for review», entrega no confirmada): «Internal». P29 (cerró con la promoción): «In production», con la línea diciendo que cerró.
- **D6. Visual Work.** Web P07: portada, el capítulo de la medalla, los servicios, una página de servicio y una vista de celular, capturados del Studio local sin la franja de logos ni cifras de casos. Manual P19: medalla, contraste de color, tipografía y merch; la portada del manual queda fuera (tres personas de identidad no confirmada). P08: las cuatro piezas finales no están en esta máquina (se produjeron en otra); queda para Erick.
- **D7. Logos de la pared.** Doce nuevos y oficiales; Azure, Azure DevOps, App Store Connect y Google Play van solo con su nombre porque sus reglas de marca no permiten su logo en una lista de herramientas (`tool-logos.md`).
- **D8. Pared con seis grupos.** En escritorio cada grupo muestra solo su título y la línea del activo aparece en un hueco bajo la lista (fundido de opacidad); el tablero no es más ancho de lo que permite la altura de la pantalla. Con las seis líneas, en 720 px el título se recortaba y su aparición no llegaba nunca (lo cazó `motion.spec`).
- **D9. Hero.** Antes: «Growth Marketing & AI Automation Specialist» · «A one-person growth department for founders: AI content pipelines, CRM automation and paid media, plus the software itself when nothing exists yet.» · cifras 85 %, 338K+, 3.92x, $3.45. Después: «Operations Manager · Growth & AI Systems» · «Growth systems and the software that runs them: AI content pipelines, WhatsApp assistants and paid media, and the field and client platforms I lead as Operations Manager at Incentiva Group.» · cifras 85 %, 338K+, 13 store releases, 11 days. El titular no cambia.
- **D10. `content.tsx`.** El encargo lo nombra, pero el contenido vive en `src/resources/about.tsx` (experiencia, habilidades), `profile.ts` (cargo) y `incentiva.ts` (nuevo: índice y datos para ErickBot).
- **D11. Inglés B2 (Erick, durante el encargo).** ErickBot lo sabe por `profile.languageLevels`; las páginas siguen diciendo «works in Spanish and English».

## Resultados (2026-11-02)

- **Puerta:** tsc limpio; build sin avisos (el de la raíz del workspace solo aparece en el worktree anidado; fuera del repo, 0 como main); lint 0 errores; unit 32/32; e2e 401/0 (39 saltos por navegador, los de siempre) en chromium, mobile-chromium, firefox y webkit, puerto 3100, `--workers=2`.
- **Lighthouse móvil, 3 rondas intercaladas (local):** medianas main/rama iguales en Home 85, About 89, Projects 89, Visual Work 85, post 88 y LeadBot 85. Rutas nuevas 85–90 (índice 90). CLS ≤ 0,0005 en las nuevas (el índice tenía 0,023 por el corte del título y de la línea del cargo al llegar la fuente; corregido a 0).
- **Frames (Chromium, LoAF + rAF):** 0 frames largos en las 8 rutas nuevas y la Home, a 1440 y 390; p95 16,7 ms, máximo 33,4 ms.
- **Producción:** merge `d5c71ec` (punto de regreso `d34c3de`), Vercel en verde; 23 URLs del sitemap en 200; cabeceras idénticas; ErickBot responde con el cargo, el B2 y la confidencialidad; e2e de Incentiva 36/36 contra producción; Lighthouse en producción: Home 99, Projects 97, índice 97, Scope 95, web 94.

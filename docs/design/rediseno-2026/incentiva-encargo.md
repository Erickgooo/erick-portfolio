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
| T1 | Caso P14 `scope-multi-client-platform` (MDX + escena `TenantGate`) | ☐ |
| T2 | Caso P30 `scope-ios-launch` (MDX + escena `StoreReleases`) | ☐ |
| T3 | Caso P33+P32 `chatflow-whatsapp-ai-platform` (MDX + escena `PlatformTakeover`) | ☐ |
| T4 | Caso P10+P11+P18 `directv-click-to-whatsapp` (MDX + escena `WhatsAppFunnel`) | ☐ |
| T5 | Caso P02 `ai-cv-screening` (MDX + escena `CvScreen`) | ☐ |
| T6 | Caso P08 `incentiva-launch-campaign` (MDX + escena `LaunchChain`) | ☐ |
| T7 | Caso P07+P19 `incentiva-website-brand` (MDX + escena `MedalScroll`, la medalla oficial que se desarma y se arma con el scroll) | ☐ |
| T8 | Índice `/work/incentiva-group`: 32 tarjetas (P01–P33 menos P24) por área, estado, línea y stack; escena `InheritedPlatforms`; en el sitemap | ☐ |
| T9 | `/work`: tarjetas y franja de cifras con los casos nuevos; enlace al índice | ☐ |
| T10 | Contenido: cargo «Operations Manager», «Role summary» y «Experience bullets» (sin el de RFM) | ☐ |
| T11 | Home: hero (2 cifras nuevas, línea de rol, oferta), «What I build» (5.º bloque y ejemplos), «What's on the bench» (stack nuevo), «Work on the bench» (P14, P10, P02 + 3) | ☐ |
| T12 | About: experiencia de Incentiva y habilidades técnicas («Skills matrix») | ☐ |
| T13 | ErickBot: cargo, proyectos nuevos, cifras confidenciales; snapshot | ☐ |
| T14 | Visual Work: imágenes de P07, P08 y P19 que pasen las reglas | ☐ |
| T15 | e2e: cada caso y el índice cargan, su escena arranca y queda quieta con movimiento reducido | ☐ |
| T16 | Puerta: tsc, build, lint, unit, e2e ×4, Lighthouse intercalado, frames ≤ 50 ms, búsqueda de términos y cifras | ☐ |
| T17 | Merge `--no-ff` a main, push y comprobaciones en producción | ☐ |

## Decisiones

- **D1. Sin Higgsfield.** Las portadas y los visuales de los productos (Scope, Portal, ChatFlow) se hacen en código: cada portada es el estado final de la escena del caso sobre su papel. Gasto de créditos: 0.
- **D2. Escenas.** Retrato 4:5, con los tokens y el motor existentes; ninguna usa interfaces reales ni datos de clientes (nombres de campaña ficticios, «Client A», «Client B»). La medalla (P07, P08) se anima con los trazados del SVG oficial del tema (`incentiva_medalla_m2-navy-amarillo.svg`), copiados tal cual: dos piezas, la cinta y el disco.
- **D3. Medalla con el scroll.** Para que se desarme y se arme con el scroll (como en la web) el motor gana un modo `scrub`: el paso de la escena sale del avance de su parte del texto por la pantalla, en los dos sentidos. Sigue las reglas del motor (una escena a la vez; quieta en su estado final con movimiento reducido).

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

## Ronda 2: correcciones de Erick (2026-11-02, tarde)

Rama `feat/incentiva-ajustes` (worktree `.claude/worktrees/incentiva-ajustes`) desde `origin/main` `d5c71ec`, el punto de regreso de esta ronda. Las decisiones de Erick prevalecen sobre la base y sobre D4.

- **D12. Samsung, siempre desde Incentiva Group.** Fuera del índice y de la entrada de About, la primera mención en cada superficie va en una frase que nombra a Incentiva Group: el título del caso («Samsung: LifeMiles on WhatsApp, a Promotion I Led at Incentiva Group»; el nombre corto evita que el título cambie de líneas al llegar la fuente, CLS 0,05 → 0), la etiqueta de su cifra («LifeMiles miles in a Samsung campaign at Incentiva Group», que es lo primero que lee la franja de `/work`), la cifra del hero, el caso ChatFlow y ErickBot.
- **D13. Cifras de clientes autorizadas:** «2M+ LifeMiles miles» (Samsung × LifeMiles) y «35,000+ contacts», «6,000+ served» (Colmaíz). Colmaíz y LifeMiles se nombran. Cualquier otra cifra de cliente sigue fuera, también las demás de la tarjeta P29.
- **D14. El caso de cribado de CV (P02) sale del sitio:** página, tarjetas, bullet de About, escena, portada, franja, sitemap y ErickBot. `/work/ai-cv-screening` redirige con 308 a `/work/incentiva-group` (`next.config.mjs`). El índice pasa a 31 tarjetas.
- **D15. Caso nuevo `samsung-lifemiles-whatsapp`** en su puesto (siguen siendo 7). Escena `MilesClaim`: compra, WhatsApp en un teléfono genérico dibujado, factura por OCR, un IMEI que no pasa el algoritmo de Luhn y se rechaza, el IMEI válido (el número de ejemplo de los manuales, no el de un comprador), identidad verificada por un segundo modelo y, al final, las millas. Las marcas van solo en texto.
- **D16. Resultados, no tiempo de construcción o entrega.** Se quitaron en todo el sitio las cifras y frases que miden la velocidad de construcción o de entrega. Los tiempos que vive el cliente final se quedan (por ejemplo, el seguimiento a los 60 minutos del bot de ATV). ArquiExpo pasa a su cifra de alcance publicada (285 variantes) y su reloj de 48 marcas se convierte en el anillo «100%» de compatibilidad entre dispositivos, también publicado en el caso. ai-portfolio no tiene otra cifra: se queda sin métrica y su escena termina en «Live».

| Dónde | Antes | Después |
|---|---|---|
| Hero | 13 · store releases in two months | 13 · production releases, iOS and Android |
| Hero | 11 days · to a second client on one platform | 2M+ · LifeMiles miles in a Samsung campaign I led at Incentiva Group |
| Caso Scope multi-cliente | 11 days · to a second client live | 146/146 · rollout checks passed |
| Caso Scope iOS | 13 · store releases in two months | 13 · production releases |
| Caso CV (P02) | 265 · tests, shipped in one afternoon | fuera (redirige al índice) |
| Caso Samsung × LifeMiles | — | 2M+ · LifeMiles miles in a Samsung campaign at Incentiva Group |
| Caso ChatFlow (Results) | 3,177 tests; 643 cifras; 270 → 318 de 320 | lo mismo + 35,000+ contacts y 6,000+ served (Colmaíz) + 2M+ miles (Samsung) |
| ArquiExpo | 48h · dev to deploy | 285 · panel variants on one touchscreen |
| ai-portfolio | <2min · deploy time | sin métrica |
| About, película | 48 h · to design, build and deploy the ArquiExpo app | 285 · panel variants in the ArquiExpo touchscreen gallery app |
| About, Incentiva | 11 days; in two months; CV in one afternoon | 146 of 146 checks; sin plazo; Samsung × LifeMiles, 2M+ miles |
| About, Quick Metal Shop | Brand Manual in the first week; app in under 48 hours | sin plazo; 285 panel variants |
| Escenas | TenantGate 11 days; StoreReleases Aug 20 to Oct 16; KioskStand 48h; PromptDeploy <2min | 146/146; App Store and Google Play; 100%; Live |
| ErickBot | 11 days, in two months, in one afternoon, under 48 hours | 13 production releases, 2M+ miles, cifras de Colmaíz; sin plazos |

## Ronda 3: correcciones de Erick (2026-11-02, noche)

Rama `feat/incentiva-ronda3` (worktree `.claude/worktrees/incentiva-ronda3`) desde `origin/main` `6291a0a`, el punto de regreso de esta ronda. Las decisiones de Erick prevalecen sobre D4, D7 y, solo para la franja de marcas, D15.

- **D17. Fin del anonimato de D4.** Los clientes con los que Erick dirigió proyectos desde Incentiva se nombran: Nequi, Wompi, Colmaíz (Ingredion) y Samsung, y DIRECTV con su marco exacto (Incentiva es distribuidor autorizado; la campaña fue para ese canal de venta, no para un cliente que contrató a Erick). «A second fintech client» pasa a Wompi y «the existing client», a Nequi. Scope se presenta como la app hecha a medida de Incentiva para operar los equipos de campo de Nequi y Wompi (no como «construida en casa»: su Firebase era del proveedor original). En ChatFlow, el resumen y la primera frase dicen que Erick dirigió la plataforma y, en ella, el asistente de Colmaíz.
- **D18. La cifra de Samsung dice lo que pasó:** más de 2 millones de millas LifeMiles otorgadas a compradores de Samsung a través del chatbot de WhatsApp que Erick dirigió desde Incentiva. ErickBot lo explica así y nunca como millas «ganadas» por Erick.
- **D19. Evolución, no fallos.** El caso Samsung cuenta lo que Erick llevó al asistente para una promoción de alto valor y alto volumen (los hechos de la tarjeta P29): OCR reconstruido para leer cualquier factura, resúmenes de cierre solo con datos verificados, mensajes sin datos internos, IMEI con Luhn, un segundo modelo para la identidad, bloqueo por vigencia y cierre limpio del canal. ChatFlow y Scope cuentan su punto de partida (sin repositorio, sin tests, una API pensada para un solo cliente) sin adjetivos que culpen a nadie.
- **D20. Franja de marcas** («Brands I've led projects for at Incentiva Group»): en la Home, entre el hero y «What I build», y en la cabecera del índice, bajo el cargo. Logos oficiales de la web de Incentiva (Nequi, Wompi, Colmaíz normal sin Ingredion, Samsung) con la fórmula de área igual del bloque `incentiva/marcas`, sobre tarjeta blanca en los dos temas, cada uno enlazado a su caso. DIRECTV queda fuera de la franja: no hay archivo de su logo en las carpetas de Incentiva de esta máquina. Fuentes en `tool-logos.md`, «Brands».
- **D21. Muro sin casillas vacías.** Las dos casillas de solo texto pasan a cuatro (Azure, Azure DevOps, App Store Connect, Google Play), cada una con un pictograma neutro de Feather (el juego de iconos del sitio), porque sus condiciones de marca no permiten sus iconos en una lista de herramientas. Con 38 herramientas, el tablero de escritorio pasa a 6 × 7 con cuatro casillas anchas y celdas 7:6, del mismo tamaño total. En oscuro cada logo va sobre una tarjeta blanca en sus colores (antes eran siluetas claras, y Bitrix24, Kommo, Zapier, Facebook, .NET, DaVinci y Next.js quedaban como manchas); las casillas apagadas muestran el logo en gris, sin perder sus formas internas.
- **D22. Línea de rol de la Home:** la frase de Incentiva en la sección «Growth, and the systems behind it» («At Incentiva Group, I led projects for Nequi, Wompi, Colmaíz and Samsung…»). La oferta del hero no cambia, para no mover el primer pantallazo; la franja de marcas va justo debajo.

| Dónde | Antes | Después |
|---|---|---|
| Hero | 2M+ · LifeMiles miles in a Samsung campaign I led at Incentiva Group | 2M+ · LifeMiles miles awarded through the WhatsApp chatbot I led for Samsung at Incentiva Group |
| Caso Samsung (cifra, franja de `/work`) | LifeMiles miles in a Samsung campaign at Incentiva Group | LifeMiles miles awarded through the WhatsApp chatbot I led at Incentiva Group |
| Caso Samsung («Result») | buyers earned 2M+ LifeMiles miles | more than 2 million LifeMiles miles were awarded to Samsung buyers through the chatbot |
| Escena `MilesClaim` | LifeMiles miles earned by buyers | LifeMiles miles awarded through the chatbot |
| ChatFlow (Results) | buyers earned 2M+ LifeMiles miles | whose chatbot awarded buyers 2M+ LifeMiles miles |
| About, Incentiva | Buyers earned 2M+ LifeMiles miles | 2M+ LifeMiles miles were awarded to buyers through the chatbot |
| Scope multi-cliente | a second fintech client | Wompi, next to Nequi |
| ErickBot | 2M+ LifeMiles miles earned by buyers | 2M+ LifeMiles miles awarded to Samsung buyers through the chatbot he led; Nequi, Wompi y Colmaíz con el marco de Incentiva |

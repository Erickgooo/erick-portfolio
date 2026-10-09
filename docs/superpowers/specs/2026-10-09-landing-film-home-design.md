# Home como landing con película de scroll — diseño

**Fecha:** 2026-10-09 · **Rama:** `feat/disruptive-redesign` (mismo worktree) · **Estado:** pendiente de revisión de Erick

**Reemplaza a** `2026-09-26-disruptive-redesign-design.md`. Erick rechazó en CP2 la dirección «Blueprint → Live System» completa: se ve básica, fría y demasiado técnica. Las tareas 14–22 de aquel plan quedan canceladas.

## 1. Qué se construye

La Home deja de ser una portada de portafolio y pasa a ser una **landing de conversión**: una oferta, una audiencia principal y una sola acción. El video donde Erick trabaja en su escritorio queda fijo de fondo y **avanza con el scroll**; el argumento de venta aparece encima, plano por plano.

| Decisión | Valor | Quién la tomó |
|---|---|---|
| Acción única | «Book a call» → `about.calendar.link` (Calendly, 30 min) | Erick |
| Audiencia | Founders que contratan, primero. Bloque secundario para quien recluta | Erick |
| Tipografía | Una de la lista de la skill: **Geist** (Geist Mono solo para cifras) | Erick eligió «fuente nueva»; Geist es propuesta |
| Color | Cobalto `#2D5BFF` como único acento | Erick |
| Intensidad | Movimiento como protagonista | Erick |
| Video de fondo | `D:\Portafolio\Video Home\Video Renderizado\Video-Renderizado.mp4`, a 720p | Erick |
| Alcance de la película | Hero, tagline, problema → solución, beneficios y proceso | Erick |
| Idioma | Inglés, como el sitio actual | Supuesto |

Guía de diseño: skill `landing-page-design` (`.claude/skills/landing-page-design/SKILL.md`). Cuando una regla de la skill choque con una decisión de esta tabla, gana la tabla.

**Éxito:** Erick ve el hero y la sección de tagline en el Preview y dice que sí antes de que se construya el resto (§8).

## 2. Estructura de la página

Layout tipo A de la skill (hero clásico + secciones), con el tramo de argumento montado sobre la película.

| # | Sección | Fondo | Contenido |
|---|---|---|---|
| 1 | Hero | Película | `h1`, subtítulo, CTA, tira de 4 cifras |
| 2 | Tagline | Película | Frase de dos líneas que se enciende palabra por palabra |
| 3 | Problema → solución | Película | Dos bloques cortos |
| 4 | Beneficios | Película | 4 bloques, cada uno con cifra y enlace a su caso |
| 5 | Cómo trabajo | Película | 3 pasos |
| 6 | Prueba | Plano | 3 casos de estudio con métrica |
| 7 | Para equipos que contratan | Plano | Una línea de experiencia, enlace al CV y a `/about` |
| 8 | FAQ | Plano | 7 preguntas |
| 9 | CTA final | Plano | Mismo CTA del hero |

Arriba del primer pliegue hay un solo CTA. El enlace al CV de la sección 7 es texto, no botón.

## 3. Copy (borrador, lo aprueba Erick)

Solo usa datos que ya están en `src/resources/content.tsx` y en los MDX de `/work`. Reglas de la skill: sin guiones dentro de las frases, títulos en minúscula tipo oración, sin signos de exclamación, sin clichés de IA.

**Hero**
- `h1`: I build your marketing engine from zero and make it outperform a full department.
- Subtítulo: For founders who need content, CRM and paid media working as one system. At Quick Metal Shop that meant 338K+ organic views with $0 in ad spend.
- CTA: Book a 30 minute call
- Cifras: 338K+ organic views · $0 ad spend · 3.92x ROAS · $3.45 cost per lead

**Tagline:** Most companies hire a department. / I build the system that does the work of one.

**Problema → solución**
- Your marketing lives in five tools and three freelancers, and none of them talk to each other.
- I design the whole system, build it, and keep it running: brand, content, paid media, CRM and the software in between.

**Beneficios**
1. **Content at agency scale.** 338K+ organic views for Quick Metal Shop with $0 in ad spend, from an AI production pipeline. → `quick-metal-shop-viral-videos`
2. **Paid media that pays back.** 3.92x ROAS on AI generated ad creatives for Quick Metal Shop and Dakoma Roofing. → `ai-powered-ad-creatives`
3. **Leads answered while you sleep.** A WhatsApp assistant that handles 85% of inbound conversations on its own, and a CRM flow that sorts 200+ leads a day. → `leadbot-ai`, `atv-riders`
4. **Software when nothing exists yet.** A touchscreen trade show app designed, built and deployed in 48 hours. → `quick-metal-shop-arquiexpo`

**Cómo trabajo:** 1. Map — I audit where your team's time goes and what a system could take over. 2. Build — brand, pipelines, CRM and tracking, wired together. 3. Run — I operate it, measure it and keep improving it.

**FAQ** (respuestas cortas, del contenido existente): What exactly do you do? · Who do you work with? (construction, food, retail) · Do you work alone? · Which tools do you use? · How fast can you start showing results? (manual de marca en la primera semana, app en 48 h) · Where are you based and what languages do you work in? (Medellín, America/Bogota, español e inglés) · What happens on the call?

**Reducción de riesgo** junto al CTA: «30 minutes. No commitment.» **Requiere confirmación de Erick**, igual que cualquier mención a precio o disponibilidad; no se inventa ninguna.

**SEO:** página indexable. `title` y `description` actuales se conservan. Se añade schema `FAQPage` con las 7 preguntas.

## 4. La película de scroll

### 4.1 Material
Video 4K de 24,8 s, montaje de unos 8 planos (cortes detectados en 3.2, 5.2, 7.0, 12.4, 15.5, 20.8 y 23.7 s; hay al menos una transición más sin corte seco cerca del segundo 8) y dos destellos blancos. Como tiene cortes, **cada tramo de texto se asigna a uno o dos planos** y el corte coincide con el cambio de mensaje. El mapa plano → sección se fija mirando los fotogramas, no solo con la detección automática.

### 4.2 Codificación
| Variante | Resolución | GOP | Peso medido | Uso |
|---|---|---|---|---|
| Desktop | 1280×720 | 8 | 14,2 MB (con GOP 4; se espera menos) | Punteros finos, ancho > 860 px |
| Móvil | 720×1280, reencuadrado plano por plano | 4 | 11,9 MB (recorte central de prueba) | Táctil o ancho ≤ 860 px |
| Fotogramas | WebP, uno por sección, en ambas proporciones | — | — | Póster, movimiento reducido, tier lite |

Sin audio, `+faststart`, `yuv420p`. Topes: **desktop ≤ 15 MB, móvil ≤ 12 MB**. Los archivos van a `public/video/`.

### 4.3 Comportamiento
- Una capa `position: sticky` a pantalla completa contiene el `<video>` y, encima, un **velo plano** oscuro (sin degradado). Las secciones 1–5 son bloques normales del documento que pasan por delante. Todo el texto es HTML renderizado en servidor.
- El scroll fija `video.currentTime` con suavizado por `requestAnimationFrame`. El mapeo es por tramos: el progreso dentro de cada sección recorre el rango de tiempo de sus planos.
- El archivo se descarga completo con `fetch` y se reproduce desde un `Blob` en memoria, para que cualquier salto sea instantáneo. Se pide **después del primer pintado**.
- Protecciones tomadas del motor de `scroll-world` (se porta la técnica a un componente React propio; no se usa su DOM generado por JS porque dejaría el texto y el LCP dependiendo de JavaScript): no encolar un salto mientras el decodificador sigue buscando, mantener el póster hasta que el video pinte su primer fotograma, «cebar» el video en el primer toque en iOS, e ignorar los `resize` que solo cambian el alto.
- En los destellos blancos el velo sube de opacidad para que el texto siga leyéndose.

### 4.4 Degradación
| Caso | Qué se ve |
|---|---|
| Sin JavaScript | Póster fijo del primer plano; todo el texto visible |
| `prefers-reduced-motion` | Sin video; cada sección muestra su fotograma fijo |
| `data-fx="lite"` o `saveData` | Igual que movimiento reducido; el video no se descarga |
| El video falla o tarda | Se queda el póster; la página funciona igual |

### 4.5 CSP — **necesita aprobación explícita de Erick**
Reproducir desde un `Blob` requiere añadir `blob:` a `media-src` en `next.config.mjs` (`media-src 'self' blob:`). Hoy es `media-src 'self'` y lo bloquearía. Es el único cambio de headers; no se toca `script-src`, el middleware ni la autenticación. Sin este cambio la alternativa es reproducir por rangos HTTP, que funciona en Vercel pero deja saltos mientras se descarga. No se edita `next.config.mjs` hasta tener el sí.

## 5. Sistema visual

- **Tipografía:** Geist en títulos y cuerpo vía `next/font/google`; Geist Mono solo en cifras. Salen Space Grotesk y JetBrains Mono. Afecta también al wordmark del IntroLoader, a sus capturas de referencia (`intro-font.spec.ts`) y a la imagen OG.
- **Escala y espaciado:** los valores de la skill (escala de tipos de Tailwind y su tabla de espaciado) escritos en SCSS; no se instala Tailwind.
- **Fondos:** planos. Oscuro `#000000` / `#181818` / `#1F1F1F`. Se conserva el tema claro.
- **Hero:** `h1` con degradado de texto blanco → `#9B9B9B` (negro → `#666666` en claro), ancho máximo 680 px, saltos de línea donde corta la idea. El `h1` es texto plano, sin partir en palabras: así desaparece el CLS de 0.110 que causaba `KineticText`.
- **Nav:** píldora flotante de vidrio; en móvil, hamburguesa que se transforma en X y menú a pantalla completa con enlaces escalonados.
- **Movimiento:** curva `cubic-bezier(0.32, 0.72, 0, 1)`. Las entradas por scroll suben, se desenfocan y aparecen en ≥ 800 ms; el desenfoque solo en el tier `full`.
- **Tagline:** palabras al 30 % de opacidad que pasan a color pleno una a una, ligadas al scroll.
- **Iconos:** Phosphor (`react-icons/pi`), que ya está en las dependencias.
- **Estados:** hover, activo, foco visible y error en cada elemento interactivo.

## 6. Qué sale y qué se queda

| Sale | Se queda |
|---|---|
| Blueprint Grid, `HomeRail`, `HomeSection` con índices, `BlueprintLine`, `BlueprintFrame`, `DockFrame`, `FeaturedProject`, `KineticText`, línea de barrido del header | Merge de `main` (CSP, validaciones, filtro `hideProtected`), `motionBoot` y tiers, `Reveal`, `MotionRuntime`, View Transitions, `Magnetic`, `GlowTrack`, arnés de medición, `csp-check.mjs`, suite e2e |
| `LazyVideo` y `videohome.mp4` en la Home (si nada más los usa, se borran) | `DecodeText` solo si se usa en las cifras del hero |
| Tests e2e de los componentes eliminados | Chatbot, autenticación, middleware, rutas de API: sin cambios |

Las demás páginas (`/work`, `/about`, `/blog`, `/gallery`) heredan tipografía, nav y fondos. Su rediseño propio es un spec aparte, después de aprobar la Home. Los casos de estudio de la sección 6 usan `hideProtected` igual que hoy.

## 7. Presupuesto y verificación

- **Performance (propuesta, falta el sí de Erick):** medido con Lighthouse 13 contra `base-lh13`. Home móvil no peor que `main` en más de 3 puntos de Perf ni 0.3 s de LCP; CLS < 0.05; A11y ≥ 95; TBT < 200 ms. El elemento LCP es el `h1` o el póster, visible sin JS. El video no cuenta en la carga inicial porque se pide después del primer pintado; se comprueba en el log de red de Lighthouse.
- **Tests e2e nuevos:** `currentTime` sigue al scroll en cada tramo y `seekable.end(0) > 0`; con movimiento reducido o tier lite no se pide ningún `.mp4`; el `h1` y el CTA están en el HTML sin JS; hay un solo CTA primario sobre el pliegue; el CTA apunta a Calendly; en móvil se sirve la variante vertical (`videoWidth < videoHeight`); sin scroll horizontal a 390 y 1024 px; schema `FAQPage` válido.
- **Revisión visual:** capturas del scroll en cada cambio de plano, desktop y móvil, miradas a ojo.
- **Gates de siempre:** Biome, `tsc`, build, unit, e2e, `csp-check` con 0 violaciones, First Load JS por ruta ≤ base + 10 kB.
- **iOS Safari real:** lo prueba Erick en el Preview (video en negro si falla el cebado).

## 8. Orden de entrega

1. **Puerta de aspecto:** tipografía, nav en píldora, película con el hero y el tagline. Push y Preview. **Se detiene hasta el sí de Erick.**
2. Resto de la película: problema → solución, beneficios, proceso.
3. Secciones planas: prueba, bloque de contratación, FAQ, CTA final.
4. Limpieza de lo «Blueprint», variante móvil reencuadrada, verificación completa y entrega.

## 9. Pendiente de Erick

1. Aprobar el cambio de CSP de §4.5.
2. Confirmar el presupuesto de performance de §7.
3. Revisar el copy de §3, en especial «No commitment».
4. El intro animado de 5 s: se deja como está y se decide viendo el Preview, porque retrasa el CTA.

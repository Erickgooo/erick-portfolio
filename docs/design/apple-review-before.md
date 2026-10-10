# Revisión de diseño: erickmahecha.com (antes)

Fecha: 2026-10-10 · Rama revisada: `main` (`3881705`) · Skill: `apple-design`

## Contexto

- **Plataforma:** sitio web (Next.js 15, React 19, SCSS modules, Once UI). De la skill se aplican los 8 principios, los fundamentos (accesibilidad, color, tipografía, layout, escritura) y el «craft lens». Las convenciones de iOS y macOS (tab bars, barra de menús, sheets) no se aplican.
- **Audiencia:** founders que necesitan marketing funcionando (principal) y equipos que contratan (secundaria).
- **Artefacto:** el sitio corriendo en local (`next build` + `next start`), capturado con Playwright Chromium 153 a 390×844 y 1440×900, en tema claro y oscuro. 152 capturas y mediciones en `docs/design/screens/before/` (no versionadas). El script es `scripts/design/capture.mjs`.
- **Páginas:** Home, Work, un caso (`/work/quick-metal-shop-viral-videos`), About, Blog, un post, Gallery, 404, más la nav y el footer.
- **Tesis de la Home hoy:** convencer a un founder de que una sola persona construye y opera todo su marketing, y llevarlo a agendar 30 minutos. Lo más característico que tiene es el video del escritorio que avanza con el scroll.
- **Referencias leídas:** `design-principles.md`, `accessibility.md`, `layout.md`, `typography.md`, `color.md`, `materials.md`, `liquid-glass.md`, `dark-mode.md`, `motion.md`, `branding.md`, `writing.md`.

### Cómo se midió y qué no se midió

- El contraste es WCAG 2. Sobre el video se midió con píxeles reales: una segunda captura del mismo fotograma con el texto invisible, y la relación contra el píxel mediano y contra el percentil 95 (el peor caso) del fondo detrás de cada texto.
- Cada tramo del video se midió en una sola posición de scroll (35 % del tramo). Además se barrió todo el video en 280 posiciones para encontrar el fondo más brillante.
- No se midió: Safari real ni un iPhone (Chromium con viewport de teléfono), texto ampliado al 200 %, estados hover y focus, respuestas cerradas del FAQ, el panel abierto del chatbot.
- Objetivos táctiles, inventario de tipos y de efectos se leyeron solo en tema oscuro (no cambian con el tema).

## Resumen

**Valoración: Critical issues.** La Home tiene un activo real y propio, el video del escritorio de Erick, pero lo tapa: un velo negro al 58 %, nueve superficies de vidrio, cifras de 216 px con degradado y 130 elementos animados compiten con él. Lo que se recuerda no es el video sino la plantilla (vidrio, número gigante con degradado, píldoras, brillo Cobalto), y por eso se ve «hecha por IA». El resto del sitio hereda el fondo de puntos y el brillo, y en tema claro usa un gris secundario que no llega a 4.5:1.

## Critical

- **Qué:** la intro de la Home dura 5 s (4 s de dibujo y brillo, 1 s de salida), bloquea los clics de toda la página, no se puede saltar y se reproduce también con `prefers-reduced-motion` (`src/components/IntroLoader.tsx:92`: «Deliberately NOT gated behind prefers-reduced-motion»).
  - **Por qué:** `motion.md › Best practices`: "Make motion optional." y `motion.md › Providing feedback`: "Let people cancel motion. As much as possible, don't make people wait for an animation to complete before they can do anything". También `branding.md › Best practices`: "Avoid using a launch screen as a branding opportunity."
  - **Arreglo:** quitar `IntroLoader` y la clase `intro-pending`. El héroe queda visible desde el primer fotograma.

- **Qué:** en tema claro, el texto secundario `#6e7681` no llega a 4.5:1 donde el fondo no es blanco puro. Mide 4.59:1 sobre blanco y baja con el brillo azul o un chip detrás.

  | Página | Elemento | Tamaño | Relación |
  | --- | --- | --- | --- |
  | Caso de estudio | etiquetas de `ResultsStats` (16 a 18 por página) | 11.25–12 px | 3.16–3.73:1 |
  | Work y caso | etiqueta del chip de métrica sobre `#d0dafe`–`#e0e7ff` | 12.4–13.2 px | 3.31–3.73:1 |
  | Work, caso, Home | resumen de las tarjetas | 15–16 px | 4.04–4.48:1 |
  | Home | párrafo del CTA final | 16.9–18 px | 4.18–4.37:1 |
  | About | fechas, instituciones, listas de skills | 13–16 px | 4.11–4.48:1 |
  | Blog y post | fecha, «Share this post:» | 11.25–14 px | 4.14–4.15:1 |
  | Gallery | línea del stack | 16.9 px | 4.18:1 |

  - **Por qué:** `accessibility.md › Vision`: "Strive to meet color contrast minimum standards", con 4.5:1 hasta 17 pt. `dark-mode.md › Dark Mode colors` pide además: "For custom foreground and background colors, strive for a contrast ratio of 7:1, especially in small text."
  - **Arreglo:** texto secundario en claro de `#6e7681` a `#4b5058` (7.44:1 sobre `#f4f5f7`, 8.12:1 sobre blanco) y quitar el brillo y los chips teñidos de detrás del texto.

- **Qué:** la tagline «se enciende» palabra por palabra con el scroll, y las palabras que esperan quedan a opacidad 0.3: 2.04–2.63:1 a 1440 px (72 px) y 2.58–2.62:1 a 390 px (33.75 px). Como depende del scroll, quien se detiene ahí lee texto por debajo de 3:1.
  - **Por qué:** `accessibility.md › Vision`, 3:1 para texto de 18 pt o más. `motion.md › Best practices`: "it's essential to avoid using it as the only way to communicate important information."
  - **Arreglo:** el texto sobre el video aparece completo y a opacidad 1. Nada se enciende por partes.

- **Qué:** objetivos táctiles a 390 px por debajo del mínimo de 28×28: iconos del footer 22.5×22.5 (3), enlaces de texto de 16.9 a 26.3 px de alto («Read the case study» ×4 en el video, «Read case study» ×9 en Work, «See all projects», «Download my resume», «More about me», enlaces del footer, migas y autor del caso). A 1440 px, los iconos del footer miden 24×24 y varios enlaces 18 px de alto.
  - **Por qué:** `accessibility.md › Mobility`: "Offer sufficiently sized controls", 44×44 pt por defecto y 28×28 pt mínimo en móvil; 28×28 y 20×20 en escritorio.
  - **Arreglo:** `min-height: 44px` con `display: inline-flex; align-items: center` en todo enlace suelto y botón de icono en móvil (28 px en escritorio). El tamaño visual del texto no cambia.

## Improvements

- **High · Vidrio en la capa de contenido.** Nueve superficies con `backdrop-filter: blur(24px) saturate(1.4)` o `blur(12px)` dentro del contenido de la Home: la fila de stats, 2 paneles, 3 tarjetas de proceso y 3 píldoras. En Work y el caso hay más (26 y 21 elementos, de componentes de Once UI).
  - **Por qué:** `materials.md › Liquid Glass`: "Don't use Liquid Glass in the content layer. Liquid Glass works best when it provides a clear distinction between interactive elements and content, and including it in the content layer can result in unnecessary complexity and a confusing visual hierarchy."
  - **Arreglo:** el único `backdrop-filter` del sitio queda en la nav. El contenido va sobre superficies opacas o directamente sobre la página.

- **High · El margen de contraste sobre el video depende del fotograma.** El fondo más brillante del video llega a luminancia 0.1496 (`#6b6c6d`), que es blanco puro bajo el velo de 0.58, y se sostiene en tramos largos de `benefit-1` y `benefit-2`. En las posiciones medidas ningún texto sólido falla (el más justo: cuerpo `#dcdddf` de 18 px en `benefit-2`, 4.70:1), pero contra ese máximo los colores secundarios no alcanzan:

  | Color | Uso | Tamaño mínimo | Contra el máximo |
  | --- | --- | --- | --- |
  | `#ffffff` | títulos, enlaces | 13.1 px | 5.26:1 |
  | `#dcdddf` | subtítulo y cuerpo | 15 px | 3.87:1 |
  | `#c1cfff` | unidad de la cifra | 13.1 px | 3.42:1 |
  | `#c7ccd1` | «30 minutes. No commitment.» | 11.25 px | 3.25:1 |

  Es un límite teórico, no un solapamiento observado.
  - **Por qué:** `accessibility.md › Vision`, 4.5:1 hasta 17 pt.
  - **Arreglo:** el contraste del texto sobre video no debe depender del fotograma. O el texto lleva su propia superficie opaca, o no va sobre el video.

- **High · El Cobalto significa demasiadas cosas.** En la Home aparece como relleno del CTA, subrayado de palabras, borde y fondo de las píldoras, brillo de las cifras, color de la unidad y de los números de paso, hover de enlaces, brillo del cursor y sombra del CTA. En Work, además, en chips y bordes.
  - **Por qué:** `color.md › Best practices`: "Avoid using the same color to mean different things." `branding.md › Best practices`: "Apply your app's accent color judiciously. Using your brand color too broadly can overwhelm your interface and dilute its impact."
  - **Arreglo:** Cobalto `#2d5bff` solo como relleno de la acción principal (blanco encima, 5.18:1) y como indicador de estado. Los enlaces se distinguen por subrayado, no por color.

- **High · Movimiento sin función.** 130 elementos animados en la Home (110 atados al scroll): 74 palabras que salen de `filter: blur(18px)`, 21 bloques que suben, 4 cifras que «se llenan», 7 bloques `[data-reveal]` con `blur(12px)`. A eso se suman el brillo que sigue al cursor, el efecto magnético del CTA final y `KineticText` en About.
  - **Por qué:** `motion.md › Best practices`: "Add motion purposefully, supporting the experience without overshadowing it. Don't add motion for the sake of adding motion." `accessibility.md › Cognitive` lista entre las prácticas para reducir movimiento: "Avoiding animating into and out of blurs".
  - **Arreglo:** el único movimiento orquestado es el video. El texto no se anima o solo cambia de opacidad; nada anima `filter`.

- **High · La escala tipográfica de la Home no es una escala.** 13 tamaños a 1440 px (216, 77.4, 72, 48.96, 48, 46.08, 36, 24, 20, 18, 16, 14, 13.2) y 20 combinaciones de tamaño, peso y espaciado; pesos 300, 400, 600 y 700; `letter-spacing` de −0.02, −0.03 y −0.05 em en todos los niveles de título.
  - **Por qué:** `typography.md › Conveying hierarchy`: "Adjust font weight, size, and color as needed to emphasize important information and help people visualize hierarchy." Como referencia, `typography.md › Tracking values` da para SF Pro +0.35 pt a 48 pt y 0 a 80 pt o más; el apretado de −0.05 em a 216 px (−10.8 px) es una decisión del sitio, no una práctica de la guía. Esto último es criterio propio.
  - **Arreglo:** cinco o seis tamaños con función (display, título, cuerpo grande, cuerpo, nota), dos pesos, y espaciado negativo solo en display.

- **Medium · La nav en móvil mide 32×30 por control** (6 controles, todas las páginas). Supera el mínimo de 28×28 pero queda lejos de los 44×44 por defecto, y es la navegación principal. `accessibility.md › Mobility`. Arreglo: 44×44 por control; caben seis en 390 px.

- **Medium · El cuerpo en móvil es de 15 px.** La raíz baja a 15 px en 390 (escalado de Once UI), así que el cuerpo queda en 15 px y hay texto de 11.25 px (fechas, etiquetas, la línea bajo el CTA). `typography.md › Ensuring legibility` da 17 pt por defecto y 11 pt mínimo. Arreglo: cuerpo de 17 px en móvil y nada por debajo de 13 px.

- **Medium · Peso 300 en texto pequeño.** Fechas, listas y párrafos secundarios de About, Blog, el post y Gallery usan peso 300 entre 11.25 y 18 px, sobre el mismo gris que ya falla contraste. `typography.md › Ensuring legibility`: "In general, avoid light font weights." Arreglo: peso 400 como mínimo en todo el texto corrido.

- **Medium · El caso de estudio cae a Arial** en 10 bloques a 390 px y 4 a 1440 px. `typography.md › Conveying hierarchy`: "Minimize the number of typefaces you use". Arreglo: heredar la familia del sitio en los componentes MDX afectados.

- **Medium · Títulos que son el `<title>` del navegador.** «Projects – Erick Mahecha» y «Visual Work – Erick Mahecha» como h1 visibles. `writing.md › Getting started`: "Check each word to be sure it needs to be there." Arreglo: «Work» y «Visual work».

- **Medium · Blog muestra «Earlier posts» sin nada debajo** (hay un solo post). `writing.md › Best practices`: "Provide clear next steps on any blank screens." Arreglo: no pintar el encabezado si la lista está vacía.

- **Medium · Flechas del carrusel de resultados a opacidad 0.3** (2.07:1 en claro, 2.65:1 en oscuro, 30×30 px). Probablemente es el estado deshabilitado; no se verificó. Si lo es, conviene ocultarlas en vez de atenuarlas.

- **Low · Interruptor de tema propio.** `dark-mode.md › Best practices`: "Avoid offering an app-specific appearance setting." En la web es una convención conocida y el sitio ya arranca con el tema del sistema, así que se queda. Es un compromiso asumido.

- **Low · El saludo del chatbot tapa contenido en móvil** durante 8 s (20 % del primer párrafo de About, 26 % del del caso) y el botón queda sobre los enlaces de licencia del footer. El chatbot está fuera del alcance de este trabajo; queda anotado.

## Craft notes

- **High · No tiene punto de vista propio; tiene una plantilla.** La skill describe el patrón tal cual: «a hero built from a big number over a small label with a gradient accent». Aquí son las cuatro cifras de 216 px con degradado `#fff → #6688ff` y sombra Cobalto, y la fila de stats del héroe. Encima, el look «casi negro con un acento». Nada de eso sale de Erick; saldría igual para cualquier producto.
- **High · La audacia se gasta en seis sitios.** Video, vidrio, cifras gigantes, CTA con resplandor, subrayados de marcador y brillo del cursor. `design-principles.md › Simplicity`: "A well-designed experience removes the unnecessary, with every element earning its place." El video es lo único que es de él, y es lo más apagado de la página.
- **High · La estructura es el guion de una landing SaaS.** Problema, solución, cuatro beneficios, proceso en tres pasos y «30 minutes. No commitment.» bajo el botón. `design-principles.md › Purpose`: "Investigate existing solutions, and avoid re-creating them. Define what sets your product apart".
- **Medium · Etiquetas que no dicen nada.** Las píldoras «The problem» y «What I do» anuncian lo que el título ya dice. `design-principles.md › Simplicity`: "every element earning its place".
- **Medium · La tipografía es un vehículo neutro.** Geist con espaciado muy negativo es el aspecto por defecto de muchas landings recientes. No hay ningún rasgo que la ate al logotipo o al trabajo de Erick. Es criterio propio.
- **Medium · Deleite confundido con decoración.** `design-principles.md › Delight`: "Don't mistake delight for decoration." El fondo de puntos, el brillo y el borde luminoso están en todas las páginas y no informan de nada.
- **Quitar un accesorio:** se pueden quitar las píldoras, la fila de stats, el brillo del cursor, el fondo de puntos y la línea bajo el CTA sin perder información.

## What works

- **El video es real.** Es el escritorio de Erick, con sus pantallas y su trabajo. Es el único elemento del sitio que no podría ser de otra persona.
- **La mecánica del video está bien resuelta:** avanza con el scroll sin autoplay ni sonido, el póster es el LCP y no depende de JS, con movimiento reducido se cambia por un fotograma fijo por sección (verificado: no se pide el mp4), y el velo sube a 0.82 en los destellos del montaje.
- **Un solo CTA** con verbo («Book a 30 minute call»), repetido al final y nunca junto a otro. `writing.md › Best practices`: "When labeling buttons and links, it's almost always best to use a verb."
- **Las cifras son exactas y tienen fuente:** 338K+, $0, 3.92x, $3.45, 85 %, 48 h.
- **El texto partido en palabras sigue siendo texto:** se lee, se copia y se anuncia como una frase.
- **Todos los controles tienen nombre accesible** en todas las páginas.
- **El tema oscuro pasa contraste en todo el sitio** salvo las flechas atenuadas del carrusel.
- **El sitio respeta el tema del sistema** al cargar.

## Platform notes

- **Web:** no se revisaron convenciones de iOS ni macOS.
- **Móvil:** la nav va abajo, solo con iconos (con `aria-label`). Es un patrón conocido; le falta tamaño.
- **La Home es oscura durante todo el video en ambos temas,** así que el tema claro solo se nota después. No es un defecto, pero limita lo que el tema claro puede aportar a la Home.

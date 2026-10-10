# Pase apple-design: Home «Departamento de uno» y un solo sistema para todo el sitio — diseño

**Fecha:** 2026-10-10 · **Rama:** `feat/apple-pass` (sale de `main` `3881705`) · **Estado:** aprobado por Erick (eligió la dirección C el 2026-10-10)

**Parte de:** `docs/design/apple-review-before.md` (revisión con la skill `apple-design`) y de las tres direcciones del lab (`lab/apple-directions`, `/lab/c`). La implementación de referencia de la Home es `src/components/lab/DirectionC.tsx`, `c.module.scss`, `lab.module.scss`, `Closing.tsx` y `copy.ts` de esa rama.

## 1. Qué se construye

La Home deja de ser una landing SaaS sobre un video apagado. El video del escritorio de Erick corre a sangre y **sin nada encima**; entre plano y plano sube una **tarjeta opaca del color de la página** (blanca en modo día, negra en modo noche) que nombra un puesto del departamento de marketing y lo que Erick hizo en él. El resto del sitio adopta los mismos tokens, la misma tipografía y ningún efecto: páginas tranquilas donde manda el contenido.

| Decisión | Valor | Quién la tomó |
| --- | --- | --- |
| Dirección de la Home | C, «Departamento de uno», con tarjetas opacas | Erick (2026-10-10; descartó la variante C2 con el video detrás) |
| Color de las tarjetas y de la banda del héroe | El de la página en cada tema: `#f4f5f7` en modo día, `#000000` en modo noche | Erick (2026-10-10: «en modo día las tarjetas deberían ser blancas») |
| Elemento firma | El video que avanza con el scroll. Es lo único audaz del sitio | Erick (brief) |
| Se conserva | Nombre, logo y favicon, un Cobalto reconocible | Erick (brief) |
| Acción única | «Book a 30 minute call» → `about.calendar.link` | Erick (decisión anterior, se mantiene) |
| Tipografía | Geist en todo el sitio; Geist Mono solo para código | Propuesta: Erick la eligió el 2026-10-09 y lo que la hacía genérica era el espaciado y los efectos, no la letra |
| Idioma | Inglés, como el sitio | Brief |
| Intro de 5 s | Se quita | Propuesta (hallazgo crítico de la revisión) |
| Chatbot, CSP, headers, `middleware.ts`, auth, `.env.local` | No se tocan | Erick (brief) |

**Éxito:** la definición de terminado del §9.

## 2. Sistema

### 2.1 Color

Seis valores con función, en claro y oscuro. Contrastes calculados (WCAG 2).

| Función | Claro | Oscuro | Contraste del texto |
| --- | --- | --- | --- |
| Superficie (página) | `#f4f5f7` | `#000000` | — |
| Superficie elevada | `#ffffff` | `#141416` | — |
| Contenido | `#0b0c0e` | `#f4f5f7` | 17.94:1 / 19.25:1 sobre superficie |
| Contenido secundario | `#4b5058` | `#a8adb5` | 7.44:1 / 9.31:1 sobre superficie; 8.12:1 / 8.16:1 sobre elevada |
| Acento | `#2d5bff` (hover `#2549cb`) | igual | texto `#ffffff` encima: 5.18:1 (hover 7.26:1) |
| Línea | contenido al 14 % | contenido al 18 % | — |

Reglas:

- **Cobalto significa dos cosas:** la acción principal (relleno del botón) y el estado del video (barra de progreso). En ningún otro lugar: ni en texto corrido, ni en chips, ni en bordes, ni en sombras.
- **Los enlaces se distinguen por subrayado,** no por color. En hover pueden tomar `#2549cb` (claro) o `#a6baff` (oscuro).
- **Ningún texto por debajo de 4.5:1** (3:1 desde 24 px, o 18.66 px en negrita) en ninguna página ni tema.
- Sobre el video de la Home el texto solo va sobre la superficie opaca del tema (la banda del héroe y las tarjetas). No hay texto sobre fotogramas, salvo las etiquetas de la nav, que llevan su propio degradado (§3.2).

### 2.2 Tipografía

- **Familias:** Geist (títulos y texto), Geist Mono (solo código). Ningún bloque puede caer a Arial ni a otra fuente del sistema.
- **Pesos:** 400, 500 y 600. No se usa 300 en ningún texto.
- **Escala de la Home** (px a 390 → 1440):

  | Rol | Tamaño | Interlineado | Peso | Espaciado |
  | --- | --- | --- | --- | --- |
  | Puesto (tarjeta) | 48 → 128 | 0.98 | 600 | −0.025 em |
  | Título del héroe y del CTA final | 32 → 76 / 36 → 72 | 1.02 | 600 | −0.02 em |
  | Título de sección | 28 → 40 | 1.12 | 600 | −0.01 em |
  | Frase de la tarjeta | 20 → 28 | 1.42 | 400 | 0 |
  | Texto | 17 → 18 | 1.55 | 400 | 0 |
  | Nota, enlace, botón | 16 → 17 | 1.5 | 500 (botón 600) | 0 |

- **Espaciado negativo solo en display** (32 px o más). El texto corrido va a 0.
- **Mínimos:** texto corrido de 16 px o más en móvil (17 px en la Home); nada por debajo de 13 px en ninguna página.

### 2.3 Forma y controles

- **Radios:** 6 px en botones, 4 px en imágenes. Sin píldoras (`9999px`) en contenido.
- **CTA:** rectángulo Cobalto, texto blanco 600, 48 px de alto mínimo, sin sombra ni resplandor.
- **Objetivos:** todo enlace suelto, botón e icono mide al menos 44×44 px en pantallas de hasta 768 px y 28×28 px por encima. El tamaño visual del texto no cambia; crece el área.
- **Foco:** contorno de 2 px con 3 px de separación, del color del contenido (blanco sobre negro o sobre el video).

### 2.4 Movimiento

- Solo `transform` y `opacity`. Ninguna animación de `filter`.
- El único movimiento orquestado del sitio es el video. El texto no se anima.
- Con `prefers-reduced-motion` el video se cambia por un fotograma fijo por tramo (comportamiento actual, se conserva).
- Sin transparencias en contenido: no hace falta rama para `prefers-reduced-transparency` fuera de la nav.

### 2.5 Lo que desaparece de todo el sitio

Intro de 5 s, fondo de puntos, brillo que sigue al cursor, `--glow-border`, píldoras con `backdrop-filter`, paneles de vidrio, degradados en texto (`background-clip: text`), palabras que salen de un desenfoque, tagline que se enciende, subrayados de marcador, fila de stats, cifras gigantes con degradado, efecto magnético, texto que se descifra (`DecodeText`), `KineticText`, revelados con desenfoque (`[data-reveal]`) y la línea «30 minutes. No commitment.». `backdrop-filter` queda solo en la nav.

## 3. Home

### 3.1 Estructura

| # | Sección | Fondo | Contenido |
| --- | --- | --- | --- |
| 1 | Héroe | Video a sangre; banda opaca del color de la página pegada al borde inferior de la primera pantalla | h1, línea de autor, CTA |
| 2–11 | Cinco tarjetas alternadas con cinco tramos de video limpio | Tarjeta: superficie de la página (`--page-background`), opaca, alto mínimo de una pantalla. Tramo: el video, sin nada | Tarjeta: h2 con el puesto, una frase, enlace al caso |
| 12 | Trabajo | Superficie del tema | Los 6 proyectos públicos más recientes: imagen 16:9, título, resultado si existe. Enlace a `/work` |
| 13 | Equipos que contratan | Superficie del tema | Título, una frase, CV y About |
| 14 | Preguntas | Superficie del tema | `<details>` nativos y el JSON-LD `FAQPage` |
| 15 | CTA final | Superficie del tema | Título, una frase, el botón |

La sección de newsletter (`Mailchimp`) sale de la Home: está desactivada y solo dejaba un hueco.

### 3.2 El video

- **Tramos** (segundos del video; los cortes del montaje caen en 3.17, 7.03, 12.40, 15.50 y 20.77):

  | Tramo | Desde | Hasta | Fotograma fijo sin video |
  | --- | --- | --- | --- |
  | `hero` | 0 | 3.17 | `hero` |
  | `after-brand` | 3.17 | 7.03 | `tagline` |
  | `after-content` | 7.03 | 12.40 | `solution` |
  | `after-paid-media` | 12.40 | 15.55 | `benefit-1` |
  | `after-crm` | 15.55 | 20.77 | `benefit-3` |
  | `after-software` | 20.77 | 24.8 | `process` |

- **Alto de scroll:** héroe 175 % de la pantalla; tramos limpios 125 % (el último 160 %); tarjetas 100 % como mínimo.
- **Velo:** 0 en reposo y 0.55 durante los destellos del montaje (los intervalos de `FILM_FLASHES`).
- **Degradado bajo la nav:** 132 px, de negro al 74 % a transparente, dentro del escenario, para las etiquetas de lugar y hora (14 px, blancas). Peor caso calculado con video blanco: 5.33:1.
- **Etiquetas de la nav y tema claro:** sobre el video las etiquetas de lugar y hora son blancas en los dos temas (regla actual de `custom.css`). Cuando una tarjeta clara pasa bajo la nav, vuelven al color del tema: `ScrollFilm` marca `html[data-nav-over-card]` mientras una superficie `[data-opaque]` cubre la línea de las etiquetas, y la regla de `custom.css` deja de aplicarse. Sin JS el primer fotograma es correcto, porque arriba siempre hay video. En teléfonos la barra va abajo con su propio fondo y no necesita nada.
- **Barra de progreso:** 3 px en el borde inferior del escenario, Cobalto, `scaleX` según el tiempo del video.
- **Peso:** los archivos de video no cambian (`tests/unit/filmBudget.spec.ts`).
- **LCP:** el póster (`<img fetchpriority="high">`) y el h1 vienen en el HTML del servidor. Nada del héroe espera a JS ni a una animación.
- La capa del brillo del cursor dentro del escenario desaparece.

### 3.3 Texto

```text
h1      The marketing department is one person.
autor   Erick Mahecha. Growth marketing and AI automation, from Medellín.
botón   Book a 30 minute call

Brand        Quick Metal Shop had no brand manual. I wrote it in my first week, and the
             ArquiExpo 2026 stand was built from it.                → /work/quick-metal-shop-the-brand-comes-to-life
Content      Three reels cut from before-and-after photos reached 338K+ organic views.
             Ad spend was $0.                                       → /work/quick-metal-shop-viral-videos
Paid media   A sales campaign made with AI video returned 3.92x ROAS. A second one brought
             260 B2B leads at $3.45 each.                           → /work/ai-powered-ad-creatives
CRM          At Artesa, a WhatsApp assistant handles 85% of conversations. At ATV Riders,
             200+ leads a day arrive sorted.                        → /work/leadbot-ai
Software     For ArquiExpo I shipped a touchscreen app 48 hours after the idea.
                                                                    → /work/quick-metal-shop-arquiexpo
enlace       Read the case study   (nombre accesible: «Read the case study: <título del proyecto>»)

Work                  See all projects
For hiring teams      I lead growth and operations at Incentiva Group. Before that I was the
                      first marketing hire at Quick Metal Shop.     Download my resume · More about me
Questions             (las siete preguntas actuales de `landing.faq`, sin cambios de datos)
Tell me where your funnel leaks.
                      In 30 minutes I'll tell you what I would automate first.   [Book a 30 minute call]
```

- Todas las cifras, clientes y fechas salen de `src/resources/` y del MDX. No se añade ninguna.
- Un enlace a un caso protegido por contraseña no se pinta (regla actual: `isProtectedPath`).
- Voz: frases cortas, primera persona, verbo en pasado. Sin tríadas retóricas, sin «no es X, es Y», sin preguntas retóricas.

### 3.4 Accesibilidad de la Home

- Un solo h1; cada tarjeta es una `<section>` con su h2.
- Texto de la banda y de las tarjetas con los tokens de contenido: 17.94:1 (día) y 19.25:1 (noche); línea de autor con el token secundario: 7.44:1 y 9.31:1.
- Los tramos de video limpio no tienen contenido y van `aria-hidden`.
- El FAQ funciona sin JavaScript y con teclado.
- En teléfonos la nav va abajo: la banda del héroe y el último bloque dejan libre ese espacio.

## 4. Resto del sitio

Mismos tokens, misma tipografía, ningún efecto. No hay elemento firma.

| Página | Cambios |
| --- | --- |
| Todas | Fondo plano del tema (sin puntos ni brillo). Texto secundario con el token nuevo. Peso mínimo 400. Raíz de 16 px también en móvil. Superficies de Once UI opacas (`surface: "filled"`). Cifras en línea (`.metric`) en el color y la familia del texto, peso 600. Enlaces de texto en el color del contenido, subrayados. Objetivos táctiles del §2.3. Sin `Reveal` ni entradas animadas |
| Nav | Controles de 44×44 px hasta 768 px. Es la única capa donde puede haber `backdrop-filter` |
| Footer | Iconos y enlaces con el área mínima. Se conserva la atribución a Once UI y la licencia CC BY-NC 4.0 |
| Work | h1 «Projects», igual que la etiqueta de la nav. Tarjetas sin chip teñido ni resplandor: la métrica es texto. Sin vidrio |
| Caso de estudio | Etiquetas de `ResultsStats` con el token secundario y 13 px o más. Flechas del carrusel: ocultas cuando no aplican, no atenuadas. Todo en Geist. Botones de copiar enlace y «View on Instagram» con área mínima |
| About | Nombre y rol sin `KineticText`. «Schedule a call» con el estilo del CTA. Botones sociales con área mínima |
| Blog | Sin los encabezados «Earlier posts» y «Recent posts» cuando su lista está vacía. Fechas de 13 px o más |
| Gallery | h1 «Visual Work», igual que la etiqueta de la nav. Insignia del contador opaca, sin `backdropFilter` |
| 404 | Título «Page not found», una línea que explica qué pudo pasar y un enlace a la Home |
| Contraseña | Mismos tokens y botón |

## 5. Primitivas que se retiran

`IntroLoader`, `SpotlightBackground`, `Magnetic`, `DecodeText` y `decode.ts`, `KineticText`, `Reveal`, `Words`, `Tagline`, `Argument`, `FilmSection`, `type.module.scss`, la clase `intro-pending` y, si nada más las usa, `MotionRuntime` y la rama `mo-io` de `motionBoot`. `ViewTransitions` se queda solo si anima `opacity` y `transform`.

## 6. Pruebas

- Se borran las pruebas de lo que desaparece y se reescriben las de la Home para la estructura nueva.
- Pruebas nuevas, como mínimo: orden y contenido de la Home; el h1 visible sin JS y sin esperar; los cinco tramos y el final del video; fotograma fijo con movimiento reducido; ningún `backdrop-filter` calculado fuera de la nav y el chatbot; ningún texto con `background-clip: text`; texto secundario con el color del token en claro y oscuro; controles de la nav de 44×44 px a 390 px.
- Se mantienen la prueba de CSP y la de errores de consola.

## 7. Presupuesto

El de `docs/perf-report.md`: ninguna página peor que `main` por más de 3 puntos de Performance o 0.3 s de LCP; CLS < 0.05; Accesibilidad ≥ 95; TBT < 200 ms.

## 8. Excepciones conocidas

- `src/components/FaqChatbot.module.scss` usa `backdrop-filter` en dos reglas. El chatbot no se toca, así que queda como excepción a la comprobación con `rg`. Se informa a Erick.
- El interruptor de tema se queda (convención web; el sitio arranca con el tema del sistema).
- El saludo del chatbot sigue tapando contenido en móvil durante 8 s.

## 9. Definición de terminado

- La Home del §3 está construida y el resto de páginas usa el sistema del §2.
- `rg` sobre `src/components` y `src/app` no encuentra `background-clip: text`, ni `filter: blur` en animaciones, ni `backdrop-filter` fuera de la nav (excepción del §8).
- La revisión final con la skill (`docs/design/apple-review-after.md`) no tiene hallazgos Critical ni High, y todo texto sobre el video cumple 4.5:1 (3:1 si es grande), con los números.
- Biome gate, `tsc --noEmit`, `npm run build`, `test:unit` y `test:e2e` en verde.
- Presupuesto del §7 medido contra `main`.
- `feat/apple-pass` subida, con Preview, capturas de antes y después por página y un resumen. Sin merge hasta el «sí» de Erick.

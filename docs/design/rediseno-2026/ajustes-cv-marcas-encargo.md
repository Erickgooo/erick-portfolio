# Ronda 6: CV, propuestas, marcas, muro y héroe (Erick, 2026-11-03)

Encargo de Erick (vía Lyra), tras revisar la ronda de posicionamiento en producción (`5775b2d`). Llega hasta producción.

- **Rama:** `feat/ajustes-cv-marcas` (worktree `.claude/worktrees/ajustes-cv-marcas`), creada desde `origin/main`.
- **Punto de regreso:** `5775b2d`, el main que estaba en producción al empezar.
- **Qué pidió:**
  - la hoja de vida con el estilo de la original, la cabecera centrada y un resumen estratégico;
  - fuera las propuestas comerciales y el botón «Experience & Resume»;
  - los logos de marcas sin parche blanco;
  - en el muro, Xcode, ChatGPT 6.1 Sol y los íconos oficiales de App Store Connect y Google Play;
  - el héroe sin la línea «Growth / AI / Systems».

## Decisiones

- **D40. El CV vuelve al estilo de la original.**
  - **La original** es el PDF de Word que estuvo en producción hasta `c17e168`: 3 páginas Letter, Times New Roman (regular, negrita, cursiva y negrita cursiva; Arial solo en un espacio tras la viñeta), todo en negro.
    - El nombre va en negrita y mayúsculas a 16 pt; el título, en cursiva a 11 pt; la línea de contacto, a 9 pt con LinkedIn y Portfolio en el azul de hipervínculo de Word, `#0563c1`.
    - Los títulos de sección van en negrita y mayúsculas a 11 pt, en `#1f1f1f`, sobre una regla gris `#999999`.
    - En cada cargo, la empresa va en negrita a 11 pt; el rol, en negrita cursiva gris `#444444`; las fechas, en cursiva a la derecha, con los meses completos; el lugar, a 9 pt en gris.
    - Las viñetas son círculos; el cuerpo va a 10 pt con interlineado de 1,15 y márgenes laterales de 0,625 in.
    - El orden de secciones es Professional Profile, Professional Experience, Technical Stack, Education, Certifications y Languages.
  - **Fuente sustituta:** Times New Roman no está en el repo ni se puede redistribuir con él, así que va **Tinos** (SIL OFL 1.1, métricamente compatible con Times New Roman), de `@fontsource/tinos` 5.3.0, en `scripts/resume/fonts/` con su licencia. Las viñetas se dibujan con CSS, porque el subconjunto latino de Tinos no trae «●».
  - **Fuera** Montserrat Black, Poppins y los acentos cobalto `#2d5bff`.
  - **La cabecera va centrada:** nombre, título y contacto. El cuerpo, alineado a la izquierda, como la original.
  - **Dos páginas.** La original tiene 3, así que el máximo son 2 páginas Letter. Para que quepa:
    - las certificaciones van en dos columnas, con las mismas viñetas;
    - de los cargos anteriores se imprimen menos bullets (`PICK`): Quick Metal Shop pasa de 4 a 3, sin el de Soro AI, y Dakoma de 2 a 1, sin el de los anuncios en video;
    - Incentiva Group va primero y completo.
  - **El «Profile»** está escrito en el script (About tiene su propia historia, más larga). Son 4 frases:
    - Growth & AI Systems Lead como marco;
    - las marcas como trabajo de Incentiva Group;
    - solo las tres cifras de cliente autorizadas;
    - ni métricas de tiempo ni frases de departamento.
  - **Las cifras de los bullets** son las que ya publica About: 13,000, 146 de 146, 13, 7 y 62, 2M+, 78, 357, 28 y 750,000 en Incentiva; 285 en Quick Metal Shop; 85 % en Artesa. Las de Quick Metal Shop y Artesa son de empleadores anteriores a Incentiva y siguen pendientes de la validación de Erick (nota de la ronda anterior).
- **D41. Fuera las propuestas comerciales.**
  - Se borró el grupo «Commercial proposals and cost models» del índice (P05, P16, P22, P25 y P26), con su estado «Proposal / pitch» y su estilo de punto discontinuo. El índice pasa de 31 a 26 proyectos y de cuatro estados a tres.
  - En About se borró el bullet de propuestas. El grupo de skills pasa a «Marketing & Growth», sin «Cost Modeling & Pricing», «Proposals & Sales Decks» ni «Automated Document Generation with Figure Checks».
  - El resumen del cargo (`incentivaRole.summary`) deja de decir «commercial proposals and cost models».
  - La descripción de `/work/incentiva-group` deja de nombrar las propuestas, y el prompt de ErickBot también. Su regla final pasa a «Only talk about the clients and projects listed above; for any other client, project or tender…».
  - «I approved the proposal», en el caso de la campaña de lanzamiento, se queda: es la propuesta creativa del video.
- **D42. Fuera «Experience & Resume».**
  - **Cabecera:** vuelve a la de `c17e168`, sin la tecla. La ubicación y la hora se ven otra vez desde el corte de la barra inferior (769 px), no desde 1024 px.
  - **Héroe y cierres:** el héroe queda con dos teclas, y en los cierres el correo vuelve junto a «Book a call», como en `c17e168`.
  - **About:** la sección se titula «Experience»; conserva el ancla `#experience`, su `scroll-margin` y «Download the resume (PDF)».
  - El CV sigue enlazado desde el bloque About del Home, la intro de About y el pie.
  - ErickBot da «Experience: …/about#experience. Resume (PDF): …/resume/Erick_Mahecha_Resume.pdf».
  - `experience` se borró de `site.ts`.
- **D43. Marcas sin tarjeta, un archivo por tema.**
  - El detalle, con fuente y tratamiento por marca y tema, está en `tool-logos.md`, «Brands».
  - Cada logo se apoya en la página. Dos `<img>` por marca, salidos de un solo elemento JSX para no sumar un aviso de lint, que `html[data-theme]` muestra u oculta. Siguen siendo `loading="lazy"`, y el oculto (`display: none`) no se descarga.
  - **Tema claro:** el logo a color transparente de siempre. Nequi, Wompi y Samsung ya tenían canal alfa.
  - **Tema oscuro:**
    - **Nequi:** la versión clara de su kit de prensa, con su fondo morado separado por desmezcla de sus dos tintas oficiales.
    - **Wompi:** `logo-secondary.svg`, la blanca de sus activos públicos.
    - **Samsung:** la marca blanca que samsung.com/co usa en su cabecera oscura.
    - **DIRECTV:** no publica versión clara, así que va su archivo oficial en una sola tinta blanca.
  - **Colmaíz:** un solo archivo, con el blanco del borde vuelto transparente por relleno desde el borde y los blancos interiores conservados.
  - **Altura de la fila del logo:** sin tarjeta, baja de `73 × escala + 32 px` a `73 × escala + 8 px`, y en el escenario fijo, de 117 a 85 px.
- **D44. El muro.**
  - «GPT-4o mini» pasa a «ChatGPT 6.1 Sol», con el mismo `openai.svg`. Se nombra en el grupo de skills de IA de About y en la respuesta de herramientas de ErickBot. LeadBot AI sigue diciendo GPT-4o mini.
  - Xcode entra en «Apps and platforms», que pasa a 7 herramientas, y en «Mobile Release Management (Xcode, App Store Connect, Google Play)».
  - App Store Connect y Google Play llevan sus íconos oficiales; Azure y Azure DevOps siguen con pictograma. La decisión es de Erick y está registrada en `tool-logos.md`, con fecha y fuente.
    - La página de marca de Google Play (Partner Marketing Hub) entrega sus archivos solo tras una solicitud de socio y un acuerdo de confidencialidad, que no se firmó en nombre de Erick. El prisma sale de la cabecera de play.google.com, que es el mismo de la fuente anterior.
  - **Tablero:** 39 herramientas en 42 celdas, con 3 `wide`. **DaVinci Resolve deja de serlo.** `WALL_ORDER` se reordenó para que las 7 filas sumen 6 celdas.
  - **Teléfono y tablet:** las listas tienen 3 columnas en teléfono y 6 en tablet (4 para el grupo de 8). En el grupo de 7, el primer mosaico (Claude Code) ocupa la fila entera de 3 en teléfono y 2 de las 4 columnas en tablet. Así ningún grupo deja huecos.
- **D45. Héroe sin «Growth / AI / Systems».**
  - Se borraron la línea y su estilo `.kicker`.
  - El espacio sobre el avatar vuelve al de `c17e168`, que no tenía esa línea: 28 px en teléfono, 56 px en tablet y, en escritorio, el texto centrado junto al banco.
  - La regla de las dos teclas compactas en teléfono pasa a `> a`, porque ya no hay enlace de texto al final.
  - La imagen OG de la Home (`scripts/design/covers.mjs`) todavía lleva esa línea. No se tocó, porque no es el héroe; queda anotado para Erick.

## Resultados (2026-11-03)

- **Tipos, lint y build:**
  - `tsc` limpio;
  - lint y build en copias fuera del repo (dentro de `.claude/worktrees` Next ve dos lockfiles y ESLint dos configuraciones), con los mismos 5 avisos `<img>` que `5775b2d` y 0 errores;
  - Biome gate OK (15 archivos contra `5775b2d`).
- **Unit:** 32/32. La instantánea del prompt de ErickBot se revisó: salen las propuestas, el grupo de skills pasa a «Marketing & Growth», entran Xcode y ChatGPT 6.1 Sol, y la línea de experiencia da la URL del PDF.
- **Batería completa** (unit, chromium, mobile-chromium, firefox y webkit; puerto 3100, `--workers=2`): **583 pasan, 45 se omiten (las de siempre) y 0 fallan**.
  - Una primera corrida se paró en `/gallery`: el optimizador de imágenes se colgó con `idea1.webp` (w=384), el mismo fallo de la ronda anterior, en una página que esta rama no toca.
  - Se reinició el servidor con la caché de imágenes vacía y se precalentó una por una (575 URL `/_next/image` de las 26 páginas del sitemap, `docs/design/screens/ajustes-cv-marcas/tools/warm-images.mjs`, fuera de git). La corrida completa salió en verde.
- **e2e nuevas:** `tests/e2e/ajustes-cv-marcas.spec.ts` (7 por navegador) y `tests/e2e/axe-themes.spec.ts` (8 por navegador), 60 en total. Cubren:
  - el texto del CV, con «Incentiva Group» y sin «proposal», «quotation», «Indiana» ni «cost model»;
  - el CV en 2 páginas, con el nombre y el título centrados a ±2 pt (`pdfLineBoxes` en `tests/e2e/pdf-text.ts` los ubica desde las matrices, los `Td` y los anchos `/W` y `/DW`; coincide al centésimo con PyMuPDF: el nombre queda a 305,99 pt de 306);
  - ningún «Experience & Resume» en Home, About, `/work`, `/work/incentiva-group` ni `/blog`, y `#experience` titulada «Experience» con el CV;
  - el muro: 39 mosaicos, 2 pictogramas, 3 anchos en el tablero y los nombres nuevos;
  - ningún hueco en las listas a 390 y 800 px, medido con cajas de layout;
  - las marcas sin fondo ni borde en los dos temas, con el archivo de su tema, en Home y en el índice;
  - axe en los dos temas.
- **Pruebas actualizadas:** `posicionamiento.spec.ts` (héroe sin antetítulo ni enlace, `#experience` directo), `brands-wall.spec.ts` (39 y 2), `incentiva.spec.ts` (26 proyectos y tres estados) y `brand-stage.spec.ts` (el logo visible de cada tema).
- **axe** (WCAG 2.0 y 2.1, A y AA): 0 violaciones serias o críticas en Home, About, `/work` y `/work/incentiva-group`, en claro y en oscuro.
- **Lighthouse móvil**, 5 rondas intercaladas contra `5775b2d`, dos builds locales. Medianas, de main a la rama:

  | Página | main | rama | CLS máx. (rama) |
  |---|---|---|---|
  | Home | 92 | 95 | 0,0001 |
  | About | 89 | 88 | 0,0001 |
  | `/work/incentiva-group` | 88 | 88 | 0 |

  - **About, −1:** las peticiones son las mismas en los dos builds y los bytes difieren en 1 KB. El LCP simulado (Lantern) pasa de 3.539 a 3.690 ms con el mismo FCP, de 2.108 ms.
- **Búsquedas** (`src/` y el texto del CV, con los saltos de línea normalizados): 0 resultados de «Experience & Resume», «Growth / AI / Systems», «Mall Indiana», «Proposal / pitch», «Proposals & Sales Decks» y «Built proposals». «GPT-4o mini» aparece solo en `leadbot-ai.mdx` (2 veces).
- **Hojas de capturas** en `docs/design/screens/ajustes-cv-marcas/`, fuera de git, revisadas a ojo:
  - el CV nuevo junto al original;
  - las marcas en escritorio, una por una, en claro y en oscuro;
  - las marcas en teléfono y en el índice;
  - el muro en escritorio, teléfono y tablet;
  - el héroe a 375, 768 y 1280 px.
  - Las tomas largas del muro se hicieron con `content-visibility` forzado a visible y movimiento reducido, porque si no salían en blanco.
  - Todos los logos se leen. Colmaíz en oscuro se lee con poco contraste y con sus contraformas blancas (queda abierto).

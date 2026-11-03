# Ronda 7: CV con resultados estratégicos, fuera el «285», Colmaíz en oscuro y cargos alineados (Erick, 2026-11-03)

Encargo de Erick (vía Lyra), tras revisar la ronda 6 en producción (`ad169d5`). Llega hasta producción.

- **Rama:** `feat/cv-estrategico` (worktree `.claude/worktrees/cv-estrategico`), creada desde `origin/main`.
- **Punto de regreso:** `ad169d5`, el main que estaba en producción al empezar.
- **Qué pidió:**
  - que el CV muestre resultados estratégicos, no datos de volumen;
  - que el «285 panel variants» desaparezca del sitio y que la app de ArquiExpo se cuente desde su propósito;
  - que el logo de Colmaíz se distinga en el tema oscuro;
  - que en «Growth, and the systems behind it» los cargos de Dakoma Roofing y ATV Riders queden alineados como los demás.

## Decisiones

- **D46. Cada cargo anterior abre con su resultado.**
  - **Quick Metal Shop**, 4 bullets en el CV (`PICK` `[0, 1, 7, 9]`):
    1. uno nuevo, primero también en About: el pipeline de video con IA cuyos tres reels principales sumaron 338K+ vistas orgánicas con $0 de pauta (la cifra y los tres reels ya los publica `quick-metal-shop-viral-videos.mdx`);
    2. el manual de marca, adoptado como estándar de toda la empresa, incluido el stand de ArquiExpo 2026;
    3. la automatización Zapier → Odoo;
    4. la app de ArquiExpo (D47).
    - El de Meta Ads sale del CV y se queda en About. Con los cuatro, el CV sigue en 2 páginas, así que el de Zapier no hizo falta sacrificarlo.
  - **Cuatrimotos ATV Riders:** el bullet «Sales advisors start their day…» pasa a decir que el sistema organiza los 200+ leads de WhatsApp que llegan al día en una cola priorizada por intención (la cifra ya estaba en la descripción del cargo). En el CV va solo ese (`[4]`). Con el de Kommo detrás, el CV pasaba a 3 páginas.
  - **Artesa:** su primer bullet ya era el del 85 %. **Concentrix:** primero el Top Performer 2023 (`[3, 0]`).
  - **Dakoma y Aseneg** no tienen un resultado publicado: quedan como estaban.
  - **`PROFILE`:** «the Colmaíz assistant has reached 35,000+ contacts and served 6,000+ of them». `incentiva.ts` y el caso de ChatFlow no cambian.
  - Sin cifras nuevas, sin porcentajes nuevos, sin métricas de tiempo ni frases de «departamento de una persona». De clientes de Incentiva, solo las tres autorizadas.
- **D47. Fuera el «285».** La app se cuenta desde su propósito: Erick la diseñó y construyó a medida para el stand de Quick Metal Shop en ArquiExpo 2026, para que el equipo comercial mostrara el catálogo completo y los proyectos reales en una pantalla táctil vertical.
  - **`about.tsx`:** el bullet `arquiexpo-app` y la frase de la intro.
  - **About, película:** la etiqueta del 285 pasa a **2M+**, «LifeMiles miles awarded to buyers by the chatbot I led at Incentiva Group» (la cifra ya está en el cargo de Incentiva y en el caso de Samsung).
  - **`quick-metal-shop-arquiexpo.mdx`:**
    - `summary` nuevo;
    - `metric: ""`, así que el caso sale del contador de cifras de `/work` y su tarjeta no lleva cifra;
    - la tarjeta «285 Panel Variants» pasa a «Built For: The Sales Team: Full Catalog & Real Projects»;
    - «Showcased 285 architectural panel variants» pasa a «Gave the sales team the full catalog and real-world projects»;
    - los detalles técnicos se quedan sin el número: imágenes a 1080 × 1080 y las dos vistas con el catálogo completo.
  - **Escena `KioskStand`:** sin el contador ni su leyenda. La cuadrícula dibujada (15 × 19 mosaicos, `KioskScreen.tsx`) se queda. Las dos teclas de modo suben al hueco del contador, bajo la misma línea fina que lo separaba del anillo.
  - Los comentarios de `KioskStand.tsx`, `KioskScreen.tsx` y `BoothApp.tsx` ya no citan el 285 como dato del caso.
- **D48. Colmaíz en oscuro: el negativo oficial.**
  - El orden de Erick era buscar primero una versión en negativo oficial y, solo si no existía, derivarla del JPG.
  - **colmaiz.co** (el sitio de la marca: tema `colmaiz`, fichas técnicas, la Escuela de Panaderos) publica una: `wp-content/uploads/2019/02/Colmaiz-Logo-preload.png` (516 × 240, RGBA), el logo blanco de su pantalla de carga.
    - Es el mismo dibujo que el logo a color de su cabecera (`Colmaiz-Logo-2x.png`): los dos canales alfa son idénticos píxel por píxel.
    - Todos sus píxeles visibles son `#FFFFFF`, así que las contraformas son transparentes y los bordes conservan el suavizado del archivo.
  - **Tratamiento:** solo se recortó a sus píxeles visibles (404 × 134), sin redibujar, recolorear ni reescalar, y se guardó como WebP sin pérdida: `colmaiz-on-dark.webp`, 8 KB.
  - **Tema claro:** sigue el archivo a color de siempre.
  - **Igual área:** el negativo ocupa la misma caja de 218 × 73 con `object-fit: contain`. Mide 3,01:1 frente a 2,98:1 del claro, así que queda un 1 % más bajo.
  - El detalle está en `tool-logos.md`, «Brands».
- **D49. Cargos alineados: una sola cuadrícula para la lista.**
  - **Medido en `ad169d5`** (`docs/design/screens/cv-estrategico/shots/jobs-before.json`, fuera de git): desde 720 px cada fila era su propio grid, con `minmax(0, 1.1fr) minmax(0, 1.3fr) auto`.
    - La columna `auto` de las fechas medía lo de cada fila: unos 170 px en las filas con dos meses, pero 76,5 px en Dakoma («May 2026») y 71,7 px en ATV Riders («Feb 2026»).
    - El espacio sobrante se repartía distinto, así que sus cargos empezaban unos 44 px más a la derecha. A 768 px, 314,7 y 316,9 px frente a 271–277 px; a 1024 px, 646–649 frente a 603–609; a 1280 px, 814–816 frente a 770–776.
    - Las demás filas tampoco coincidían entre sí: había hasta 6 px de diferencia.
    - La alineación vertical sí era igual en todas, 21 px desde el borde de la fila.
  - **A 375 px**, en una sola columna, ya estaban bien: el cargo de cada fila empieza a 0 px del borde y a 47,9 px de su parte superior.
  - **Corrección:** desde 720 px las tres columnas son de la lista y cada fila las toma con `grid-template-columns: subgrid`. La columna de fechas mide lo de la fecha más larga, y todos los cargos empiezan en la misma columna. Donde el navegador no tiene `subgrid`, las filas usan una columna de fechas fija de `11em`. Los nombres de los cargos no cambian.

## Resultados (2026-11-03)

- **Tipos, lint y build:**
  - `tsc` limpio;
  - lint y build en copias fuera del repo, con los mismos 5 avisos `<img>` que `ad169d5` y 0 errores;
  - Biome gate OK (6 archivos contra `ad169d5`) y `biome check` limpio en los 12 archivos de código tocados.
- **Batería completa** (unit, chromium, mobile-chromium, firefox y webkit; puerto 3100, `--workers=2`, con el optimizador de imágenes precalentado: 575 URL, 0 fallos): **615 pasan, 45 se omiten (las de siempre) y 0 fallan**, en 11 minutos.
  - Unit: 32 de 32.
  - Chromium 154, mobile-chromium 147, Firefox 143 y WebKit 139.
- **axe** (WCAG 2.0 y 2.1, A y AA), en los cuatro navegadores: 0 violaciones serias o críticas en Home, About, `/work`, `/work/incentiva-group` y el caso de ArquiExpo, en claro y en oscuro (40 de 40).
- **Lighthouse móvil**, 5 rondas intercaladas contra `ad169d5`, dos builds locales. Medianas, de main a la rama:

  | Página | main | rama | CLS máx. (rama) |
  |---|---|---|---|
  | Home | 97 | 96 | 0,0001 |
  | About | 88 | 88 | 0,0001 |
  | Caso de ArquiExpo | 87 | 87 | 0 |

  - **Home, −1:** dentro del margen de 3 puntos. Una de las cinco rondas de la rama dio 88; las otras, 93 a 96.
- **El CV:** 2 páginas Letter, Tinos, negro y cabecera centrada, como en la ronda 6. La página 1 termina en Dakoma; la 2 empieza en ATV Riders.
- **Búsquedas** (`docs/design/screens/cv-estrategico/tools/gate-search.mjs`, fuera de git):
  - 0 resultados de «285 panel» y «panel variants» en los 275 archivos de texto de `src/`, comentarios incluidos, y en el texto del CV;
  - 0 de «serves a community» en el texto del CV;
  - 0 del número 285 suelto en `src/` y en el CV, sin contar los decimales ni las coordenadas de trazados SVG.
- **Pruebas nuevas:** `tests/e2e/cv-estrategico.spec.ts` (8 por navegador). Cubren:
  - el 338K+ dentro del bloque de Quick Metal Shop en el PDF, encima del manual de marca;
  - el CV sin 285, sin «panel variants» ni «serves a community»;
  - el borde izquierdo y la altura del cargo iguales (±1 px) en las 7 filas a 768, 1024 y 1280 px, y a 375 px la misma sangría y el mismo espacio;
  - ni 285 ni «panel variants» en About, `/work` ni el caso, y el 2M+ en las cifras de About;
  - Colmaíz en los dos temas, con el negativo en el oscuro.
  - Contra `ad169d5` fallan las 6 que deben fallar (el CV, los tres anchos, el 285 y el oscuro), y pasan las de 375 px y el tema claro, que no cambian.
- **Para ubicar las líneas del PDF**, `pdfLineBoxes` (`tests/e2e/pdf-text.ts`) da ahora también la línea base de cada una (`y`). Chromium pinta primero las cabeceras de todos los cargos y luego los bullets, así que el orden del texto no es el de la página.
- **Pruebas actualizadas:**
  - `case-scenes.spec.ts`: el caso de ArquiExpo solo cuenta el 100 %;
  - `ajustes-cv-marcas.spec.ts`: Colmaíz también usa archivo `on-dark`;
  - `axe-themes.spec.ts`: suma el caso de ArquiExpo;
  - la instantánea de ErickBot. Se revisó la diferencia: entra el bullet de los videos, cambian el de la app, el de la cola de ATV Riders y la frase de la intro, y no queda ningún 285.
- **Hojas de capturas** en `docs/design/screens/cv-estrategico/`, fuera de git, revisadas a ojo:
  - el CV de la ronda 6 junto al nuevo;
  - Colmaíz antes y después en escritorio, en los dos temas, y sus bordes al doble;
  - Colmaíz en teléfono y en el índice;
  - la lista de cargos antes y después a 375, 768, 1024 y 1280 px, y la de después en oscuro;
  - la escena del kiosco, las cifras de About, la tarjeta de `/work` y la cabecera del caso, antes y después.
  - Todos los logos se leen. La tarjeta y la cabecera del caso sin cifra se ven completas: el resumen ocupa el espacio y la imagen queda centrada junto al texto.
  - En las tomas altas del teléfono, el enlace «Skip to content» sale en medio. Es un efecto de las capturas más altas que la ventana: en una ventana normal se queda a −74 px, igual que en `ad169d5`.

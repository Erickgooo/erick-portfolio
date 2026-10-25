# Pulido de animaciones (Erick, 2026-10-25)

Encargo autónomo de Erick (vía Lyra): pulir todas las animaciones del portafolio hasta que se vean muy *clean* y dejarlo en producción. Este archivo es el inventario y la lista de tareas: cada fila dice qué es la animación, dónde está, qué la hacía no verse limpia y qué se hizo con ella. Las decisiones llevan su motivo para que Erick pueda revisarlas.

- **Rama:** `feat/pulido-animaciones` (worktree `.claude/worktrees/pulido-animaciones`), desde `origin/main`.
- **Punto de regreso:** `fe69211` (main al empezar, el que está en producción).
- **Reglas de forma vigentes:** `sobrio-encargo.md` (estilo sobrio A, «Línea»).
- **Evidencia:** `docs/design/screens/pulido-animaciones/` (fuera de git): `before/` (main) y `after/` (la rama) con los fotogramas de cada grabación y su `perf.json` (frames, Long Animation Frames, desplazamientos de layout), `sheets/` con las hojas de contacto que se revisaron, y la salida del build de main (`build-main-baseline.log`). Las grabaciones son del Chromium de Playwright por CDP (screencast), a 1440 × 900 y 390 × 844, en claro y oscuro, y con movimiento reducido.

Estado: ☐ pendiente · ☑ hecho · ➖ se queda como está (con motivo) · ⛔ bloqueado.

## El lenguaje de movimiento

Lo que «clean» quiere decir en este sitio, y lo que comprueban las pruebas:

1. **Una sola curva para casi todo.** `--wb-ease-soft` es una salida suave (`cubic-bezier(0.25, 1, 0.5, 1)`): la pieza hace casi todo el recorrido en la primera mitad y se posa despacio, sin pasarse. No hay curvas con sobreimpulso: `--wb-ease-settle` se borró y ninguna curva del sitio sale de sus valores de inicio y fin. `--wb-ease-move` (un objeto que se lleva de un sitio a otro) y `--wb-ease-fade` (fundidos de capas) completan el juego.
2. **Recorridos cortos.** Una entrada sube 12 px (`--wb-travel`) o 20 px en bloques grandes y en las piezas de las escenas (`--wb-travel-lg`). Nada entra girando ni creciendo desde lejos; una escala, si queda, va de 0,98 a 1.
3. **Duraciones cortas.** Hover, foco y toque: 0,18 s (`micro`). Un cambio de estado: 0,3 s (`state`). Una pieza que entra en una escena: 0,45 s (`enter`). Una aparición: opacidad 0,5 s (`fade`) y recorrido 0,7 s (`travel`). Escalonado: 60 ms entre elementos, 100 ms entre piezas de una escena.
4. **Un solo protagonista.** Al cargar la Home la intro es lo único que se mueve; el banco, la capa ambiental, el resplandor y la burbuja del chatbot esperan a que termine y entran en ese orden. El resplandor del puntero es ambiente: aparece tras la intro y se atenúa mientras la página se desplaza. En un paso a paso, el escenario no se mueve: solo la escena que entra.
5. **Hover y toque iguales en todo el sitio.** Mismo tiempo (0,18 s) y mismo gesto: una tarjeta sube 4 px y al pulsarla vuelve a su sitio; un botón sube 2 px y al pulsarlo baja 1 px; una flecha avanza 4 px. Nunca crece nada. Los colores cambian al instante (como las teclas del header). El hover solo existe con puntero fino; el `:active` responde igual en táctil.
6. **Barato.** En CSS solo se animan `transform` (`translate`, `scale`, `rotate`) y `opacity`; en líneas SVG, `stroke-dashoffset`. Los canvas se detienen fuera de pantalla. `tests/unit/motion-rules.spec.ts` lo comprueba en todas las hojas de estilo.
7. **Movimiento reducido.** Con `prefers-reduced-motion: reduce` todo aparece en su estado final, también la intro (D5).

## Inventario

### Común a todo el sitio

| # | Animación | Archivo | Qué no se veía clean | Qué se hizo | Estado |
|---|---|---|---|---|---|
| C1 | Tokens de movimiento | `src/resources/custom.css`, `workbench/_shared.scss` | `--wb-ease-settle` se pasaba de su destino (y 1,22); recorridos de 32 y 56 px; 1,1 s de recorrido y 0,9 s de opacidad; escalonado de 90 ms | Escala nueva (arriba); `settle` borrado y sus 66 usos pasados a `soft`; prueba unitaria de reglas (D1) | ☑ |
| C2 | Aparición al hacer scroll (`reveal`) | `workbench/_shared.scss`, `RevealObserver.tsx` | Heredaba los tokens largos | Afinada con los tokens | ☑ |
| C3 | Hover, foco y toque | `scope.module.scss`, `ui.module.scss`, `Header`, `Footer`, `FaqChatbot`, tarjetas de Work, Blog, Gallery, caso y prosa | Tiempos mezclados (0,2 s `ease-in-out`, 0,28 s, 0,45 s, `transition: all`) y gestos mezclados (escalas 1,04 / 1,05 / 1,06 / 0,98 / 0,94, subir 4 px, bajar 2 px) | Regla 5 en todo el sitio | ☑ |
| C4 | Resplandor del puntero | `SpotlightBackground.tsx` | Se veía en el centro mientras se levantaba el velo; en celular seguía al dedo durante el scroll y competía con las apariciones | Oscuro hasta que la intro se fue, entra con un fundido de 1 s y baja al 45 % mientras la página se desplaza (D3) | ☑ |
| C5 | Intro | `IntroLoader.tsx`, `IntroLoader.module.scss` | Con movimiento reducido se reproducía entera; el monograma se iba un paso antes que el velo; al llegar Space Grotesk el nombre se estrechaba 1,5 em y el monograma se movía (CLS 0,0003–0,0006, 0,001 en Lighthouse) | Coreografía y duración sin cambios (D4); quieta con movimiento reducido (D5); el monograma se va con el velo; la caja del nombre tiene su ancho final desde el primer pintado (CLS de la Home ≈ 0) | ☑ |
| C6 | Header: teclas y barra de la página actual | `Header.module.scss` | Teclas a 0,2 s `ease-in-out`, fuera de los tokens | `micro` / `soft` | ☑ |
| C7 | Reloj del header | `Header.tsx`, `Header.module.scss` | El subconjunto latino de Poppins no trae cifras tabulares: la hora cambiaba de ancho cada segundo (71,5 → 67,1 → 70,5 px) y movía el texto, un desplazamiento de layout por segundo en todas las páginas | Caja más ancha que cualquier hora y texto alineado al inicio | ☑ |
| C8 | Chatbot: burbuja de saludo | `FaqChatbot.tsx`, `FaqChatbot.module.scss` | Salía a los 2,5 s: en la Home, justo cuando el velo se levantaba y el banco entraba | Sale 2,5 s después de que la página queda a la vista (tras la intro en la Home), con la subida corta | ☑ |
| C9 | Chatbot: botón flotante, panel y sugerencias | `FaqChatbot.module.scss` | Botón que crecía a 1,05; transiciones de color y `transition: all`; el panel aparecía de golpe | Regla 5; el panel abre con la subida corta de la burbuja y cierra al instante | ☑ |
| C10 | Footer: logotipo | `Footer.module.scss` | Subía en 0,3 s, más lento que los demás hovers | `micro` | ☑ |
| C11 | Escenas: fundido del bucle | `scenes/scenes.module.scss` | — | Se queda (ya era un fundido corto con `state`) | ➖ |
| C12 | Paso a paso (`SceneStepper`) | `scenes/stepper.module.scss`, `SceneDriver.tsx` | Al cambiar de paso la hoja nueva subía 26 px y crecía de 0,98 a 1 durante 0,9 s mientras la escena ya empezaba su entrada | Fundido cruzado de 0,5 s con el escenario quieto; la capa saliente se va cuando la nueva la cubre (`LAYER_FADE_MS` 1050 → 800) | ☑ |
| C13 | Paso a paso en el margen (`MarginStepper`) | `scenes/work/marginstepper.module.scss` | El mismo patrón | Igual que C12 | ☑ |
| C14 | Canvas (`CanvasLoop`) | `scenes/CanvasLoop.tsx` | — (se detiene fuera de pantalla; ningún frame largo medido) | Se queda | ➖ |
| C15 | Texto que se escribe y cursor | `scenes/SceneDriver.tsx`, `scenes.module.scss` | — | Se queda | ➖ |
| C16 | Cifras que cuentan | `scenes/SceneDriver.tsx` | — | Se queda | ➖ |
| C17 | Scroll suave a anclas | `resources/base.css`, `ScrollToHash.tsx` | — (instantáneo con movimiento reducido) | Se queda | ➖ |

### Home (`/`)

| # | Animación | Archivo | Qué no se veía clean | Qué se hizo | Estado |
|---|---|---|---|---|---|
| H1 | Banco del héroe: entrada | `home/Bench.tsx`, `bench.module.scss` | Los 8 objetos subían unos 100 px (16 cqi) creciendo desde 0,96 con sobreimpulso, y empezaban con el velo aún a medio desvanecer: cruzaban el «ERICK MAHECHA» de la intro | Se ocultan bajo el velo aún opaco cuando empieza a irse y suben 20 px, sin escala, cuando ya se fue (D2) | ☑ |
| H2 | Banco: flotación | `bench.module.scss`, `Bench.tsx` | Arrancaba junto con la entrada, sumándose a ella, con retrasos negativos (saltos) | Empieza cuando todos se asentaron (`data-settled`), cada objeto desde el reposo | ☑ |
| H3 | Banco: paralaje con el puntero | `Bench.tsx`, `bench.module.scss` | — | Se queda (responde al visitante) | ➖ |
| H4 | Banco: tocar un objeto | `bench.module.scss` | Crecía a 1,03 con rebote | Al tocarlo pasa al frente y sube como con el hover (regla 5), a velocidad `micro`; ya no crece | ☑ |
| H5 | Capa ambiental (canvas) | `home/BenchAmbient.tsx`, `ambient.module.scss` | Subía 48 px durante 1,6 s a la vez que el banco | Solo un fundido lento, cuando el banco ya casi se asentó | ☑ |
| H6 | Ventana de actividad | `home/ActivityLog.tsx`, `activity.module.scss` | Subía 56 px en 1,1 s; marcas con rebote; punto «live» que parpadeaba fuerte cada 1,6 s | Tokens; el punto late cada 2,4 s y solo baja a 0,45 | ☑ |
| H7 | «What I build»: paso a paso y sus escenas | `home/Builds.tsx` + LeadSort, ReelBuild, AdReturn, BoothApp | Ver C12 y K5 | C12 y K5 | ☑ |
| H8 | Pared de herramientas | `home/toolwall.module.scss`, `WallController.tsx` | Celdas que crecían de 0,94 con rebote; en celular, de 0,92 | Crecen de 0,98, sin rebote | ☑ |
| H9 | Proyectos (tarjetas) | `home/projects.module.scss` | Recorrido largo; hover a 0,3 s | Tokens y regla 5 | ☑ |
| H10 | About y cierre | `home/about.module.scss`, `closing.module.scss` | Recorridos largos | Tokens | ☑ |

### About (`/about`)

| # | Animación | Archivo | Qué no se veía clean | Qué se hizo | Estado |
|---|---|---|---|---|---|
| A1 | Foto de la cabecera | `about/intro.module.scss` | Subía 56 px en 1,1 s con rebote | Tokens: 20 px en 0,7 s, sin rebote (sigue pintada todo el tiempo, solo se mueve) | ☑ |
| A2 | Película: el marco que se abre | `about/film.module.scss`, `FilmFrame.tsx` | Crecía de 0,4 a 1 en 1,3 s | Se queda la idea; 1 s (D7) | ☑ |
| A3 | Textos y cifras de la película | `about/film.module.scss` | Recorridos largos | Tokens | ☑ |
| A4 | Experiencia: acordeón | `about/experience.module.scss` | El contenido bajaba 10 px fuera de los tokens | Baja `--wb-travel` | ☑ |
| A5 | Credenciales y habilidades | `about/credentials.module.scss`, `skills.module.scss` | Recorridos largos | Tokens; la flecha diagonal de un enlace externo se queda (dice «sale del sitio») | ☑ |
| A6 | Escena de la cola de soporte | `scenes/about/SupportQueue.tsx` | Ya usaba los tokens | Tokens | ☑ |

### Projects (`/work`) y casos (`/work/[slug]`)

| # | Animación | Archivo | Qué no se veía clean | Qué se hizo | Estado |
|---|---|---|---|---|---|
| W1 | Contador de cifras | `scenes/projects/FigureCounter.tsx`, `figurecounter.module.scss` | Su caja subía a la vez que las tarjetas de abajo (dos entradas juntas) | La caja queda quieta desde el primer pintado; cuando las tarjetas casi entraron se dibuja la línea y luego se escribe la cifra | ☑ |
| W2 | Lista de proyectos | `work/work.module.scss` | Recorrido largo; hover a 0,3 s | Tokens y regla 5 | ☑ |
| K1 | Portada del caso | `work/case.module.scss` | Subía 8 cqi en 1,1 s mientras todo el panel subía también | Solo la portada sube, 12 px | ☑ |
| K2 | Panel de datos del caso | `work/case.module.scss` | Subía 32 px en 0,9 s | Ya no se mueve entero | ☑ |
| K3 | Cifra destacada | `work/case.module.scss` | El pie («conversations automated») aparecía solo y la cifra entraba un segundo después creciendo de 0,9 con rebote | Cifra y pie entran juntos, subiendo, justo después de la portada | ☑ |
| K4 | Etiqueta de resultados e impresiones | `work/case.module.scss` | La etiqueta crecía de 0,94 | Aparición estándar | ☑ |
| K5 | Escenas de los casos | `scenes/work/*` | Las piezas entraban 4–5 cqi (≈ 25 px) con rebote; en celular, con los pasos apilados, se movían a la vez el final de una escena, la escena a la vista y el comienzo de la siguiente | Sin rebote (C1); 20 px (`--wb-travel-lg`) en las 20 entradas de escena; una escena a la vez (D9). Revisadas una por una en fotogramas (LeadSort, ChatTriage, AdReturn, PresenterBuild ×4, ReelBuild, BeatCuts, KioskStand con su canvas, BrandWall, ArticleEngine, PromptDeploy, MarketingSteps ×5): cada una avanza en orden, una cosa a la vez. Sus bucles pequeños (ondas de audio, puntos de «escribiendo», el avatar que parpadea y habla) son contenido de la escena y se quedan | ☑ |
| K6 | Enlace «All projects» | `work/case.module.scss` | — (ya era `micro`) | Se queda | ➖ |

### Visual Work (`/gallery`)

| # | Animación | Archivo | Qué no se veía clean | Qué se hizo | Estado |
|---|---|---|---|---|---|
| G1 | Tarjetas de la cabecera | `gallery/gallery.module.scss` | Subían 56 px con rebote | Tokens: 20 px, sin rebote | ☑ |
| G2 | Piezas de cada cliente | `gallery/gallery.module.scss` | Subían y crecían de 0,97 con rebote; la cabecera de cada cliente entraba de lado | Aparición estándar; la cabecera sube como todas | ☑ |
| G3 | Botón de pieza (hover y toque) | `gallery/gallery.module.scss` | Subía a 0,3 s; el «play» crecía a 1,06; al pulsar se encogía a 0,98; las hojas de un carrusel tardaban 0,45 s en abrirse y en volver | Regla 5; las hojas se reparten con un keyframe al entrar y se abren a velocidad de hover | ☑ |
| G4 | Visor | `gallery/viewer.module.scss`, `Viewer.tsx` | La lámina subía 32 px y crecía de 0,97 con rebote; los botones se encogían a 0,94 al pulsar | Sube 12 px; regla 5 | ☑ |
| G5 | «How the pieces are made»: paso a paso y escenas | `gallery/Making.tsx`, `scenes/gallery/*` | Ver C12; en celular varias escenas a la vez | C12, 20 px de entrada y D9. Los bucles de `PieceMaking` (la cara que flota, la voz en ondas, la barra de reproducción) son el contenido de cada paso y se quedan | ☑ |

### Blog (`/blog` y cada post)

| # | Animación | Archivo | Qué no se veía clean | Qué se hizo | Estado |
|---|---|---|---|---|---|
| B1 | Índice y tarjetas | `blog/blog.module.scss` | Recorridos largos; hover a 0,3 s; al pulsar bajaba a medias | Tokens y regla 5 | ☑ |
| B2 | Portada del post | `blog/blog.module.scss` | Recorrido largo | Tokens | ☑ |
| B3 | Índice del post (marcador) | `blog/blog.module.scss`, `PostIndex.tsx` | — (un marcador que sigue la lectura, a velocidad `micro`) | Se queda | ➖ |
| B4 | Escenas del blog | `scenes/blog/TitleSheet.tsx`, `scenes/post/DeskScene.tsx` | Entraban 24 px | 20 px (`--wb-travel-lg`) | ☑ |
| B5 | Figuras de la prosa y video | `prose/prose.module.scss` | Las cifras crecían de 0,94; el botón de reproducir crecía a 1,04 | Suben como las demás apariciones; el botón sube 2 px | ☑ |
| B6 | Título del post al llegar la fuente | `blog/blog.module.scss` | En escritorio el bloque del título cambia de altura al cambiar la fuente de respaldo por Montserrat y, como está centrado verticalmente, baja 35 px (CLS 0,0069; 0 en celular; igual en main) | Fuera de alcance: es de carga de fuentes y arreglarlo cambia la maquetación del héroe (anotado para Erick) | ➖ |

### Puerta, `/unauthorized` y 404

| # | Animación | Archivo | Qué no se veía clean | Qué se hizo | Estado |
|---|---|---|---|---|---|
| S1 | Cajón de la puerta | `system/locked.module.scss`, `scenes/system/LockedDrawer.tsx` | Bajaba 48 px con rebote | Baja 20 px | ☑ |
| S2 | Contraseña incorrecta | `system/locked.module.scss` | Sacudida de ±14 px cuatro veces en 0,45 s | Un vaivén de 6 px y vuelta (D8) | ☑ |
| S3 | Escena del 404 | `scenes/system/LostScene.tsx`, `lost.module.scss` | El marco vacío entraba 4 cqi con rebote | 20 px sin rebote; la deriva lenta de las marcas (ambiente) se queda | ☑ |

## Decisiones

- **D1. Una curva, sin sobreimpulso.** `--wb-ease-settle` (que se pasaba de su destino) se borró en vez de suavizarse: con dos curvas de entrada parecidas, cada componente elegía una distinta. Ahora toda entrada usa `soft`. La prueba `tests/unit/motion-rules.spec.ts` falla si vuelve una curva que se pase, si se anima algo que no sea `transform`/`opacity` o si aparece `transition: all`.
- **D2. El banco espera a que el velo se vaya.** Los objetos siguen pintados en su sitio bajo la intro (así cuentan para el LCP, como antes) y se ocultan en el mismo frame en que el velo empieza a desvanecerse, todavía opaco; suben cuando el velo terminó (0,5 s después). Así la intro es lo único que se mueve mientras está en pantalla.
- **D3. El resplandor es ambiente.** Aparece tras la intro (en las demás páginas, al hidratar) con un fundido de 1 s y baja al 45 % mientras la página se desplaza (vuelve 0,4 s después del último scroll). En celular sigue al dedo como antes, pero atenuado mientras el dedo desplaza la página.
- **D4. La intro conserva su duración y su coreografía** (trazo, nombre, destello, pausa y fundido; 4,5 s). Es la decisión de marca del 2026-10-24 y no tenía defectos propios; lo que no se veía limpio era lo que pasaba debajo de ella (D2). Único cambio: el monograma ya no se desvanece antes que el velo.
- **D5. Intro con movimiento reducido.** Se sigue mostrando (la decisión de marca era que todo visitante la vea) pero quieta: el monograma terminado y el nombre aparecen juntos, se mantienen 2 s y el velo se desvanece. Antes, con movimiento reducido, se reproducía entera con trazo, destello y subida.
- **D6. Hover sin escalas.** Las escalas al pasar el cursor (1,04 a 1,06) y al pulsar (0,98, 0,94) se cambiaron por los gestos que ya usaba la mayoría del sitio: subir y volver. Un solo gesto por tipo de elemento hace que todo responda igual.
- **D7. La película de About se abre en 1 s.** Es el único movimiento largo del sitio y la idea de esa página (el marco pequeño que se abre al video), así que se queda; pasa de 1,3 s a 1 s y sin sobreimpulso. Su escala inicial (0,4 en escritorio) no cambia porque cambiarla cambia la composición del marco cerrado.
- **D8. La sacudida de error se calma.** Un error de contraseña necesita una señal además del mensaje, pero cuatro sacudidas de 14 px se ven nerviosas; queda un vaivén de 6 px y vuelta con la curva `move`.
- **D9. Una escena a la vez.** Antes, toda escena en pantalla corría: en la Home la ventana de actividad y la primera escena del paso a paso a la vez, y en celular hasta tres escenas apiladas. Ahora el motor (`scenes/start.ts`) elige, de las escenas en pantalla, la más cercana al centro (cambia de manos solo con una diferencia clara, para que dos escenas a la misma distancia no se turnen); las demás esperan para empezar o se quedan quietas donde estaban, con sus bucles en pausa (`data-held`) para que nada salte al volver. Un canvas dentro de una escena sigue a su escena. La prueba «no more than one scene moves at a time» falla en el main anterior y pasa en la rama.
- **D10. Fuera de alcance.** El salto del título del post al llegar la fuente (B6) no es una animación: arreglarlo cambia la alineación del héroe del post. Queda anotado para Erick.

## Pruebas que cambian

- `tests/unit/motion-rules.spec.ts` (nueva): reglas del lenguaje (D1).
- `tests/e2e/motion.spec.ts` (se agregan pruebas; ninguna se quita ni se debilita): nada se mueve bajo la intro mientras se desvanece y el banco flota solo tras asentarse; el resplandor se atenúa al hacer scroll; el reloj no desplaza nada; el escenario de un paso a paso no se mueve; con movimiento reducido la intro no mueve nada; toda aparición llega al recorrer la página (seis páginas); nunca hay más de una escena moviéndose.
- Ninguna prueba existente se cambió: las de la auditoría del 2026-10-24 (scroll instantáneo y burbuja sin deslizar con movimiento reducido, Home sin velo sin JavaScript, resplandor que se detiene al llegar al puntero) siguen pasando tal cual.

## Bloqueado

(Nada por ahora.)

## Mediciones

- **Pruebas** (árbol final, `1551f67`): `npx tsc --noEmit` limpio; `npm run test:unit` 32/32 (28 de antes + 4 de reglas de movimiento); `npm run test:e2e -- --workers=2` en Chromium, Chromium móvil, Firefox y WebKit: 318 pasan, 38 omitidas (las que solo aplican a un proyecto o plataforma), 0 fallos.
- **Lighthouse móvil, solo Performance** (`npm run perf:lh`, `next start` de main en :3200 y de la rama en :3100 a la vez, Chromium de Playwright, 5 rondas intercaladas alternando quién va primero, mismas condiciones y misma hora). Medianas, main → rama:

  | Página | Performance | LCP (ms) | CLS |
  |---|---|---|---|
  | Home | 85 → 85 | 3853 → 3847 | 0,001 → 0,001 |
  | About | 89 → 89 | 3532 → 3531 | 0 → 0 |
  | Projects | 88 → 89 | 3614 → 3537 | 0 → 0 |
  | Post (`/blog/my-workspace`) | 88 → 88 | 3610 → 3608 | 0,024 → 0,025 |
  | Visual Work | 84 → 84 | 3991 → 3985 | 0 → 0 |

  Ninguna mediana baja. Tras esa tanda se corrigió el salto del monograma de la intro (C5): dos rondas más de la Home, intercaladas, dan 83,5 → 84,5 y CLS 0,001 → 0. El CLS del post (0,024 en ambos) es el cambio de fuente del título (B6, D10), igual en main.
- **Build** (`npm run build` en una copia de la rama fuera del repo anidado, como la línea base de main): pasa, con los mismos 4 avisos `<img>` que main (`build-main-baseline.log`) y ninguno nuevo.
- **Lint** (`npm run lint` desde un `git worktree add` en el scratchpad con su propio `npm ci`): 0 errores, los mismos 4 avisos `<img>` de main.
- **JS** (gzip, por ruta): el layout pasa de 13,4 a 14,0 kB contando su fragmento compartido, y cada página sube entre 0,5 y 1 kB, sobre todo por el coordinador de escenas (D9).
- **Frames** (Chromium de Playwright sin throttling, escritorio, `requestAnimationFrame` y Long Animation Frames): en las 33 tomas de animaciones fuera de la carga (apariciones, recorridos de página, pasos a paso, chat, visor, header) ningún frame pasa de 50 ms; el más largo es de 33,4 ms (dos tomas) y el percentil 95 es 16,8 ms en todas. El único frame de más de 50 ms de cada carga ocurre a los 35–120 ms de navegar, durante la hidratación y antes de que empiece ninguna entrada (las entradas de carga esperan al menos 150 ms), igual en main.
- **Desplazamientos de layout**: el reloj del header ya no produce ninguno; los que quedan al cargar son del cambio de fuente (0,0001–0,0003, y 0,0069 en el post en escritorio, B6), iguales en main.

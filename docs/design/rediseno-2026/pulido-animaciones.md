# Pulido de animaciones (Erick, 2026-10-25)

Encargo autónomo de Erick (vía Lyra): pulir todas las animaciones del portafolio hasta que se vean muy *clean* y dejarlo en producción. Este archivo es el inventario y la lista de tareas: cada fila dice qué es la animación, dónde está, qué la hace no verse limpia y qué se hizo con ella. Las decisiones llevan su motivo para que Erick pueda revisarlas.

- **Rama:** `feat/pulido-animaciones` (worktree `.claude/worktrees/pulido-animaciones`), desde `origin/main`.
- **Punto de regreso:** `fe69211` (main al empezar, el que está en producción).
- **Reglas de forma vigentes:** `sobrio-encargo.md` (estilo sobrio A, «Línea»).
- **Evidencia:** `docs/design/screens/pulido-animaciones/` (fuera de git): `before/` y `after/` con los fotogramas de cada grabación y su `perf.json` (frames, Long Animation Frames, desplazamientos de layout), `sheets/` con las hojas de contacto, y la salida del build de main (`build-main-baseline.log`).

Estado: ☐ pendiente · ☑ hecho · ➖ se queda como está (con motivo) · ⛔ bloqueado.

## El lenguaje de movimiento

Lo que «clean» quiere decir en este sitio, y lo que comprueban las pruebas:

1. **Una sola curva para casi todo.** `--wb-ease-soft` es una salida suave (`cubic-bezier(0.25, 1, 0.5, 1)`): la pieza hace casi todo el recorrido en la primera mitad y se posa despacio, sin pasarse. No hay curvas con sobreimpulso: `--wb-ease-settle` se borró y ninguna curva del sitio sale de sus valores de inicio y fin.
2. **Recorridos cortos.** Una entrada sube 12 px (`--wb-travel`) o 20 px en bloques grandes (`--wb-travel-lg`). Nada entra girando ni creciendo desde lejos; una escala, si queda, va de 0,98 a 1.
3. **Duraciones cortas.** Hover, foco y toque: 0,18 s. Un cambio de estado: 0,3 s. Una pieza que entra en una escena: 0,45 s. Una aparición al hacer scroll: opacidad 0,5 s y recorrido 0,7 s. Escalonado: 60 ms entre elementos, 100 ms entre piezas de una escena.
4. **Un solo protagonista.** Al cargar la Home la intro es lo único que se mueve; el banco, la capa ambiental, el resplandor y la burbuja del chatbot esperan a que termine, y entran en ese orden. El resplandor del puntero es ambiente: aparece tras la intro y se atenúa mientras la página se desplaza.
5. **Hover igual en todo el sitio.** Mismo tiempo (0,18 s) y mismo gesto: una tarjeta sube 3 px, una flecha avanza 4 px, un botón sube 1 px y vuelve al pulsarlo. Sin escalas al pasar el cursor. Solo con puntero fino; en táctil, el `:active` responde con el mismo tiempo.
6. **Barato.** En CSS solo se animan `transform` (`translate`, `scale`) y `opacity`; en líneas SVG, `stroke-dashoffset`. Los canvas se detienen fuera de pantalla.
7. **Movimiento reducido.** Con `prefers-reduced-motion: reduce` todo aparece en su estado final, también la intro (ver decisión D5).

## Inventario

### Común a todo el sitio

| # | Animación | Archivo | Qué no se ve clean | Acción | Estado |
|---|---|---|---|---|---|
| C1 | Tokens de movimiento | `src/resources/custom.css`, `workbench/_shared.scss` | `--wb-ease-settle` se pasa de su destino (y 1,22); recorridos de 32 y 56 px; 1,1 s de recorrido y 0,9 s de opacidad; escalonado de 90 ms | Rehacer: escala nueva (arriba), `settle` borrado y sus 66 usos pasados a `soft` | ☐ |
| C2 | Aparición al hacer scroll (`reveal`) | `workbench/_shared.scss`, `RevealObserver.tsx` | Hereda los tokens largos | Afinar con los tokens | ☐ |
| C3 | Hover, foco y toque | `scope.module.scss`, `ui.module.scss`, `Header`, `Footer`, `FaqChatbot`, tarjetas de Work, Blog, Gallery, caso y prosa | Tiempos mezclados (0,2 s `ease-in-out`, 0,28 s, 0,45 s, `transition: all`) y gestos mezclados (escalas 1,04 / 1,05 / 1,06, subir 4 px, subir 2 px) | Unificar (regla 5) | ☐ |
| C4 | Resplandor del puntero | `SpotlightBackground.tsx` | Se ve en el centro mientras se levanta el velo de la intro; en celular sigue al dedo durante el scroll y compite con las apariciones | Afinar: entra con un fundido cuando termina la intro; se atenúa mientras la página se desplaza | ☐ |
| C5 | Intro | `IntroLoader.tsx` | Con movimiento reducido se reproduce entera (decisión de marca del 2026-10-24); destello que crece de 0,2 a 2,4 | Afinar (ver D5) | ☐ |
| C6 | Header: teclas y barra de la página actual | `Header.module.scss` | Teclas a 0,2 s `ease-in-out`, fuera de los tokens | Afinar a `micro` / `soft` | ☐ |
| C7 | Reloj del header | `Header.tsx`, `Header.module.scss` | Cambia de ancho cada segundo (cifras proporcionales): un desplazamiento de layout pequeño cada segundo en todas las páginas | Arreglar: cifras tabulares y ancho reservado | ☐ |
| C8 | Chatbot: burbuja de saludo | `FaqChatbot.tsx`, `FaqChatbot.module.scss` | Sale a los 2,5 s: en la Home, justo cuando el velo se levanta y el banco entra | Afinar: espera a que termine la intro y se asiente el héroe | ☐ |
| C9 | Chatbot: botón flotante, panel y sugerencias | `FaqChatbot.module.scss` | Botón que crece a 1,05 al pasar el cursor; `transition: all` | Afinar (regla 5) | ☐ |
| C10 | Footer: logotipo | `Footer.module.scss` | Sube en 0,3 s, más lento que los demás hovers | Afinar a `micro` | ☐ |
| C11 | Escenas: fundido del bucle | `scenes/scenes.module.scss` | — | Mantener | ☐ |
| C12 | Paso a paso (`SceneStepper`) | `scenes/stepper.module.scss` | Al cambiar de paso la hoja nueva sube 26 px y crece de 0,98 a 1 durante 0,9 s mientras se funde: dos movimientos a la vez sobre la escena que ya empieza | Simplificar: fundido cruzado y recorrido corto | ☐ |
| C13 | Paso a paso en el margen (`MarginStepper`) | `scenes/work/marginstepper.module.scss` | El mismo patrón | Simplificar igual | ☐ |
| C14 | Canvas (`CanvasLoop`) | `scenes/CanvasLoop.tsx` | — (se detiene fuera de pantalla) | Mantener; medir frames | ☐ |
| C15 | Texto que se escribe y cursor | `scenes/SceneDriver.tsx`, `scenes.module.scss` | — | Mantener | ☐ |
| C16 | Cifras que cuentan | `scenes/SceneDriver.tsx` | — | Mantener | ☐ |
| C17 | Scroll suave a anclas | `resources/base.css`, `ScrollToHash.tsx` | — (instantáneo con movimiento reducido) | Mantener | ☐ |

### Home (`/`)

| # | Animación | Archivo | Qué no se ve clean | Acción | Estado |
|---|---|---|---|---|---|
| H1 | Banco del héroe: entrada | `home/Bench.tsx`, `bench.module.scss` | Los 8 objetos suben unos 100 px (16 cqi) creciendo desde 0,96 con sobreimpulso, y empiezan cuando el velo empieza a desvanecerse: cruzan el «ERICK MAHECHA» de la intro | Rehacer: esperan a que el velo termine, suben 3 cqi sin escala | ☐ |
| H2 | Banco: flotación | `bench.module.scss` | Arranca junto con la entrada (se suma a ella) y con retrasos negativos | Afinar: empieza cuando el banco se asentó, sin saltos | ☐ |
| H3 | Banco: paralaje con el puntero | `Bench.tsx`, `bench.module.scss` | — | Mantener (responde al visitante) | ☐ |
| H4 | Banco: tocar un objeto | `bench.module.scss` | Crece a 1,03 con rebote | Afinar: sin rebote | ☐ |
| H5 | Capa ambiental (canvas) | `home/BenchAmbient.tsx`, `ambient.module.scss` | Sube 48 px durante 1,6 s a la vez que el banco | Simplificar: solo fundido, después del banco | ☐ |
| H6 | Ventana de actividad | `home/ActivityLog.tsx`, `activity.module.scss` | Sube 56 px en 1,1 s; marcas con rebote; punto «live» que parpadea | Afinar | ☐ |
| H7 | «What I build»: paso a paso y sus escenas | `home/Builds.tsx` + LeadSort, ReelBuild, AdReturn, BoothApp | Ver C12 y las escenas | Afinar | ☐ |
| H8 | Pared de herramientas | `home/toolwall.module.scss`, `WallController.tsx` | Celdas que crecen de 0,94 con rebote; en celular, de 0,92 | Afinar: sin rebote, escala corta | ☐ |
| H9 | Proyectos (tarjetas) | `home/projects.module.scss` | Recorrido largo; hover distinto | Tokens y regla 5 | ☐ |
| H10 | About y cierre | `home/about.module.scss`, `closing.module.scss` | Recorridos largos | Tokens | ☐ |

### About (`/about`)

| # | Animación | Archivo | Qué no se ve clean | Acción | Estado |
|---|---|---|---|---|---|
| A1 | Foto de la cabecera | `about/intro.module.scss` | Sube 56 px en 1,1 s con rebote | Afinar | ☐ |
| A2 | Película: el marco que se abre | `about/film.module.scss`, `FilmFrame.tsx` | Crece de 0,4 a 1 en 1,3 s | Afinar (ver D7) | ☐ |
| A3 | Textos y cifras de la película | `about/film.module.scss` | Recorridos largos | Tokens | ☐ |
| A4 | Experiencia: acordeón | `about/experience.module.scss` | El contenido baja 10 px al abrir; la cruz se pliega a 0,3 s | Afinar | ☐ |
| A5 | Credenciales y habilidades | `about/credentials.module.scss`, `skills.module.scss` | Recorridos largos; hover en diagonal | Tokens y regla 5 | ☐ |
| A6 | Escena de la cola de soporte | `scenes/about/SupportQueue.tsx` | Revisar | — | ☐ |

### Projects (`/work`) y casos (`/work/[slug]`)

| # | Animación | Archivo | Qué no se ve clean | Acción | Estado |
|---|---|---|---|---|---|
| W1 | Contador de cifras | `scenes/projects/FigureCounter.tsx` | Revisar | — | ☐ |
| W2 | Lista de proyectos | `work/work.module.scss` | Recorrido largo; hover distinto | Tokens y regla 5 | ☐ |
| K1 | Portada del caso | `work/case.module.scss` | Sube 8 cqi en 1,1 s | Afinar | ☐ |
| K2 | Panel de datos del caso | `work/case.module.scss` | Sube 32 px en 0,9 s | Afinar | ☐ |
| K3 | Cifra destacada | `work/case.module.scss` | El pie («conversations automated») aparece solo y la cifra entra un segundo después creciendo de 0,9 con rebote | Rehacer: cifra y pie entran juntos, sin escala | ☐ |
| K4 | Impresiones y figuras del caso | `work/case.module.scss` | Crecen de 0,94 con rebote | Afinar | ☐ |
| K5 | Escenas de los casos | `scenes/work/*` | Revisar una por una con los tokens nuevos | — | ☐ |
| K6 | Enlace «All projects» | `work/case.module.scss` | Hover a otro tiempo | Regla 5 | ☐ |

### Visual Work (`/gallery`)

| # | Animación | Archivo | Qué no se ve clean | Acción | Estado |
|---|---|---|---|---|---|
| G1 | Tarjetas de la cabecera | `gallery/gallery.module.scss` | Suben 56 px con rebote | Afinar | ☐ |
| G2 | Piezas de cada cliente | `gallery/gallery.module.scss` | Suben y crecen de 0,97 con rebote | Afinar | ☐ |
| G3 | Botón de pieza (hover) | `gallery/gallery.module.scss` | Sube 4 px con rebote; el «play» crece a 1,06 | Regla 5 | ☐ |
| G4 | Visor | `gallery/viewer.module.scss`, `Viewer.tsx` | La lámina sube 32 px y crece de 0,97 con rebote | Afinar | ☐ |
| G5 | «How the pieces are made»: paso a paso y escenas | `gallery/Making.tsx`, `scenes/gallery/*` | Bucles de personaje (flota, habla, saluda) | Revisar | ☐ |

### Blog (`/blog` y cada post)

| # | Animación | Archivo | Qué no se ve clean | Acción | Estado |
|---|---|---|---|---|---|
| B1 | Índice y tarjetas | `blog/blog.module.scss` | Recorridos largos; hover distinto | Tokens y regla 5 | ☐ |
| B2 | Portada del post | `blog/blog.module.scss` | Recorrido largo | Afinar | ☐ |
| B3 | Índice del post (marcador) | `blog/blog.module.scss`, `PostIndex.tsx` | Revisar | — | ☐ |
| B4 | Escenas del blog | `scenes/blog/TitleSheet.tsx`, `scenes/post/DeskScene.tsx` | Revisar | — | ☐ |
| B5 | Figuras de la prosa | `prose/prose.module.scss` | Crecen de 0,94 con rebote; el botón de ampliar crece a 1,04 | Afinar y regla 5 | ☐ |

### Puerta, `/unauthorized` y 404

| # | Animación | Archivo | Qué no se ve clean | Acción | Estado |
|---|---|---|---|---|---|
| S1 | Cajón de la puerta | `system/locked.module.scss`, `scenes/system/LockedDrawer.tsx` | Baja 48 px con rebote | Afinar | ☐ |
| S2 | Contraseña incorrecta | `system/locked.module.scss` | Sacudida de ±14 px | Afinar (ver D8) | ☐ |
| S3 | Escena del 404 | `scenes/system/LostScene.tsx`, `lost.module.scss` | Revisar | — | ☐ |

## Decisiones

(Se completan al avanzar.)

## Pruebas que cambian

(Ninguna por ahora.)

## Bloqueado

(Nada por ahora.)

## Mediciones

(Se completan al avanzar.)

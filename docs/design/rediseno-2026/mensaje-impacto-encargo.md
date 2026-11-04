# Ronda 8: mensaje, impacto y SEO (Erick, 2026-11-04)

Encargo de Erick (vía Lyra): que un reclutador o un gerente general entienda el alcance de su trabajo y qué ganó el negocio con él. Parte de una revisión externa que él aceptó y que leyó en parte versiones viejas, así que aquí solo entra lo que seguía abierto. Llega hasta producción si pasa la puerta.

- **Rama:** `feat/mensaje-impacto` (worktree `.claude/worktrees/mensaje-impacto`), creada desde `origin/main`.
- **Punto de regreso:** `55eb85b`, el main que estaba en producción al empezar.
- **Qué pidió:**
  - un titular y una entradilla nuevos en el héroe, con la misma frase en la descripción de la Home, `/work`, ErickBot y la imagen OG;
  - una línea «What the business gained» en los casos donde lo publicado la sostiene;
  - la tabla de datos por conseguir;
  - las líneas nuevas en la lista de validación;
  - comparar el CV de producción con el del repo, sin regenerarlo.
- **Fuera de alcance:** los botones, el título profesional, el blog, los clientes nombrados y el pase de confidencialidad, la versión en español, el correo propio, `src/lab` y cualquier rediseño.

## Decisiones

- **D50. El mensaje del héroe, con el texto exacto del encargo.**
  - Titular: «I build and run the systems behind business growth.»
  - Entradilla: «From growth operations and AI automation to production software. I lead the strategy, architecture and delivery of systems businesses depend on.»
- **D51. Tamaño del titular: tres líneas en teléfono y cuatro en escritorio.** El titular es más largo y en teléfono la tablet del banco es el elemento LCP.
  - **Medido antes de cambiar nada**, a 360 × 780 en `55eb85b`: el banco empieza a 472,5 px, dentro de la primera pantalla; la tablet se ve entera, de 523,9 a 712 px, y es el LCP.
  - **Sin ajustar**, a 36 px el titular nuevo pasaba a cuatro líneas, con «growth.» solo en la última. El banco bajaba a 510 px, la tablet terminaba en 750 px y el área del titular (48.050 px²) quedaba a un 7 % de la de la tablet (51.831 px²).
  - **Teléfono:** el tamaño pasa de `clamp(34px, (100vw − 32px) × 0,11, 64px)` a `clamp(32px, (100vw − 32px) × 0,102, 64px)`.
    - «I build and run the», la línea más larga, mide 9,57 em. Con 10,2 % de la columna cabe con un 2 % de margen y quedan tres líneas: «I build and run the / systems behind / business growth.»
    - A 360 px son 33,5 px (antes 36,1) y el `h2` de la página sigue en 32 px.
    - A 320 px son 32 px y cuatro líneas. Con el mínimo anterior de 34 px eran cinco.
  - **Escritorio:** el factor pasa de 0,054 a 0,051 (58 px desde 1280 px, antes 61). «behind business», la línea más larga, mide 8,51 em y cabe en la columna de 389 px de una ventana de 1024 px. Sin el ajuste eran cinco líneas con «behind», «business» y «growth.» sueltas.
  - **Tablet (768 px):** no cambia; sigue a 64 px y tres líneas.
  - **Entradilla:** `text-wrap: pretty`, para que a 375 px «on.» no quede solo en la última línea.
  - Se ajustó solo la tipografía. El espaciado del héroe es el mismo.
- **D52. La misma frase en los demás textos, con el texto exacto del encargo.**
  - `pages.home.description` en `site.ts`, que también alimenta `og:description`.
  - La primera frase de la entradilla de `/work`. La frase del conteo de casos sigue igual.
  - `prompt.ts` y `faqChatbot.ts`: solo cambia la paráfrasis. La instantánea de ErickBot se actualizó tras revisar su diferencia, que es únicamente esa frase.
- **D53. La imagen OG.** `social-preview.jpg` se regeneró con `covers.mjs`, con el titular nuevo y sin «Growth / AI / Systems».
  - El titular ocupa tres líneas a 64 px y no toca el retrato.
  - El script también vuelve a escribir las tres portadas del blog, que salieron idénticas byte a byte. Es la única imagen que cambia.
- **D54. «What the business gained» en los cuatro casos.** Todos tienen hechos publicados que la sostienen, así que ninguno se queda sin línea. Ninguna línea lleva cifras ni los términos que el encargo prohíbe, y ninguna reescribe un resultado medido.

  | Caso | Línea publicada | Hechos publicados en el caso |
  |---|---|---|
  | `scope-multi-client-platform` | Incentiva can now serve a second financial client on the platform it already runs, with each client's data kept apart. Adding a campaign became configuration instead of a project. | «Wompi went live on the same platform as Nequi»; «Between two financial companies»; «with data separated by database»; «a new campaign is configuration, not a project» |
  | `chatflow-whatsapp-ai-platform` | Incentiva runs several client lines on one platform, and a small team can change it with confidence that no client will notice. Colmaíz's commercial team now has its own view of its conversations and uses it daily. | «One platform runs the assistants of several client lines»; «lets a small team change a multi-client platform with confidence that no client will notice»; «Colmaíz's team did not yet have a view of its own conversations»; «a client portal that Colmaíz's commercial team uses daily» |
  | `scope-ios-launch` | Field staff on iPhones can now work in the app, and Incentiva owns what it needs to keep shipping it. When a coordinator reports a problem from the field, the answer is a version and a date. | «not all of those phones run Android»; «a field worker with an iPhone can start the working day»; «After the move, nothing about shipping Scope depended on a third party»; «but a version and a date» |
  | `directv-click-to-whatsapp` | Incentiva owns a digital sales channel it can read: each lead arrives pre-qualified and with consent, and each sale reports back to the ad platform that produced it. The advisor who closes the sale gets only the conversations worth closing. | «a digital sales channel for the dealership»; «a funnel the company owns and can read: every lead arrives pre-qualified, with consent, and every sale reports back to the ad platform that produced it»; «A human still closes every sale, and gets only the conversations worth closing» |

- **D55. Lista de validación.** `validacion-confidencial.md` suma 4 filas, una en la sección de cada caso, todas en «pendiente». Solo la de ChatFlow nombra a un cliente (Colmaíz), así que es la única con tipo `cliente` y con el contacto del cliente entre quienes validan.
- **D56. `biome check src` en verde.**
  - En `55eb85b` no lo estaba: daba 3 errores, todos de formato u orden, en `Bench.tsx`, `ToolWall.tsx` (el orden de un import) y `custom.css`. Se corrigieron con `biome check --write`, sin cambio de comportamiento.
  - En este checkout de Windows (`core.autocrlf=true`) los archivos tienen CRLF y Biome reporta además unos 150 errores de formato que no existen en git. Por eso el comando se corre sobre una copia con LF (`git -c core.autocrlf=false archive`), que es el contenido del repo y lo que recibe Vercel. `biome.json` no se tocó.
- **D57. El CV no se regenera.** El SHA-256 del PDF de producción y el del repo coinciden: `ef2ef4bc…208897eb`.

## Datos por conseguir

Hoy no hay indicadores verificados para estos casos, y D35 prohíbe publicar cifras sin verificar. Esto es lo que haría falta conseguir.

| Caso | Indicador | Quién podría darlo |
|---|---|---|
| ChatFlow | Incidentes y tiempo de entrega | Operations Manager de Incentiva, desde Application Insights y Azure DevOps; el CEO de Incentiva aprueba publicarlo |
| ChatFlow | Conversaciones resueltas y costos operativos | Operations Manager de Incentiva, desde el panel de métricas y el uso de IA por cliente; CEO de Incentiva, para los costos; contacto de Colmaíz (Ingredion), si la cifra es de su línea |
| `scope-ios-launch` | Adopción y estabilidad de la app | Operations Manager de Incentiva, desde App Store Connect y Google Play Console; coordinadores de campo, para la adopción; contactos de Nequi y Wompi, si se cita su operación |
| `scope-multi-client-platform` | Tiempo de incorporación de nuevos clientes | Coordinadores de campaña y Operations Manager de Incentiva; el CEO de Incentiva aprueba publicarlo |
| DIRECTV | Leads calificados y ventas | Asesor comercial que cierra las ventas, desde el registro compartido; CEO de Incentiva, como distribuidor autorizado |

**A decidir antes de publicar dos de ellos.** «Tiempo de entrega» y «tiempo de incorporación» miden velocidad, y D16 sacó del sitio las cifras de velocidad de construcción o entrega. Sirven para conversar con Incentiva, pero publicarlos exige que Erick revise antes esa regla. Además, cualquier cifra de cliente fuera de las tres autorizadas necesita autorización propia.

## Resultados (2026-11-04)

Pendientes de la puerta.

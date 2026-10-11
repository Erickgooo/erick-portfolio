# Revisión de diseño: erickmahecha.com (después)

Fecha: 2026-10-10 · Rama revisada: `feat/apple-pass` (`bbee76a`) · Skill: `apple-design` · Antes: `docs/design/apple-review-before.md`

## Contexto

- **Plataforma:** sitio web (Next.js 15, React 19, SCSS modules, Once UI). Se aplican los 8 principios, los fundamentos y el «craft lens» de la skill; no las convenciones de iOS y macOS.
- **Artefacto:** el build de producción de la rama corriendo en local, capturado con el mismo script y la misma matriz que el «antes»: 390×844 y 1440×900, tema claro y oscuro. 180 capturas y mediciones en `docs/design/screens/after/` (no versionadas). Script: `scripts/design/capture.mjs`.
- **Páginas:** Home, Projects, dos casos (`/work/quick-metal-shop-viral-videos` y `/work/leadbot-ai`), About, Blog, un post, Visual Work, 404 y la pantalla de contraseña, más la nav y el footer.
- **Tesis de la Home:** una persona hace el trabajo de un departamento de marketing. El video de su escritorio corre limpio y, entre plano y plano, una tarjeta del color de la página nombra un puesto y lo que Erick hizo en él.
- **Referencias:** las mismas once páginas de la HIG que en el «antes».

### Cómo se midió y qué no se midió

- Contraste WCAG 2 medido con píxeles: una segunda captura del mismo fotograma con el texto invisible, y la relación contra el píxel mediano y contra el percentil 95 (el peor caso).
- Las etiquetas de la nav (lugar y hora) se comprobaron en 393 posiciones de scroll por tema a 1440 px, incluidas la última pantalla del video y siete posiciones alrededor de cada uno de los 12 bordes de superficie: si se ven o no, qué hay debajo y, donde se ven, su contraste.
- No se midió: Safari real ni un iPhone (Chromium con viewport de teléfono), texto ampliado al 200 %, estados hover y focus, respuestas cerradas del FAQ, el diálogo de la galería, el panel abierto del chatbot.
- Tipos, objetivos táctiles y efectos se leyeron en tema oscuro (no cambian con el tema).

## Resumen

**Valoración: Excellent,** por la regla de la skill (nada por encima de Medium y hay un punto de vista), con las salvedades de lo que no se verificó: Safari, un iPhone real y texto al 200 %. La Home tiene ahora un punto de vista que solo puede ser de Erick: su video, sin nada encima, y cinco tarjetas que convierten su propuesta («hago el trabajo de un departamento») en la estructura de la página. Lo que se recuerda es el video. El resto del sitio comparte tokens y tipografía y no tiene ningún efecto. No queda ningún hallazgo Critical ni High.

## Lo que se cerró del «antes»

| Hallazgo del «antes» | Severidad | Estado | Evidencia |
| --- | --- | --- | --- |
| Intro de 5 s que bloquea clics y corre con movimiento reducido | Critical | Cerrado | `IntroLoader` borrado; el h1 es visible en el primer fotograma, también sin JS |
| Texto secundario `#6e7681` bajo 4.5:1 en tema claro | Critical | Cerrado | Token nuevo `#4b5058` (7.44:1). Fallos de contraste por página, claro 390 / 1440: Home 4 / 2 → 0 / 0; Projects 8 / 8 → 0 / 0; caso 26 / 25 → 0 / 0; About 16 / 14 → 0 / 0; Blog 1 / 0 → 0 / 0; post 1 / 0 → 0 / 0; Visual Work 2 / 0 → 0 / 0 |
| Tagline a opacidad 0.3 (2.04–2.63:1) | Critical | Cerrado | La tagline no existe; ningún texto se anima |
| Objetivos táctiles bajo el mínimo | Critical | Cerrado | Bajo el mínimo a 390 px: Home 18 → 0, Projects 20 → 0, caso 41 → 0, About 29 → 0, Blog 11 → 0, post 22 → 0, Visual Work 11 → 0, 404 12 → 0. A 1440 px: todos a 0 |
| Vidrio en la capa de contenido | High | Cerrado | `backdrop-filter` calculado en la Home 10 → 0, Projects 26 → 1, caso 21 → 1, Visual Work 7 → 1. El que queda es el desvanecido de la nav |
| Contraste sobre el video dependía del fotograma | High | Cerrado | Textos sobre fotogramas: 72 → 0 por ancho y tema. Banda y tarjetas: 17.94:1 (día) y 19.25:1 (noche); línea de autor 7.44:1 y 9.31:1; el botón, 5.18:1. Las etiquetas de la nav no se muestran sobre el video: 0 de 786 lecturas por tema; donde se ven, el peor caso es 11.22:1 |
| Cobalto con demasiados significados | High | Cerrado | Solo en el relleno del CTA y en la barra de progreso del video |
| Movimiento sin función | High | Cerrado | Elementos animados en la Home 130 → 0; con `filter: blur` 81 → 0 |
| Escala tipográfica de la Home | High | Cerrado | Tamaños a 1440 px 13 → 10 y combinaciones 20 → 13; a 390 px 10 → 8. Pesos 400, 500 y 600 |
| Nav en móvil de 32×30 | Medium | Cerrado | 44×44 por control |
| Cuerpo de 15 px y texto de 11.25 px en móvil | Medium | Cerrado | Raíz de 16 px. Tamaño mínimo a 390 px: Home 11.25 → 14, caso 10.8 → 13, Blog 11.25 → 13.2 |
| Peso 300 en texto pequeño | Medium | Cerrado | Peso mínimo 400 en todo el sitio |
| El caso de estudio caía a Arial | Medium | Cerrado | Solo Geist en todas las páginas |
| Títulos que eran el `<title>` | Medium | Cerrado | «Projects» y «Visual Work» |
| «Earlier posts» sin nada debajo | Medium | Cerrado | El encabezado solo se pinta si hay lista |
| Flechas del carrusel a opacidad 0.3 | Medium | Cerrado | Se ocultan cuando no aplican |
| Interruptor de tema propio | Low | Se queda | Compromiso asumido: convención web y el sitio arranca con el tema del sistema |
| Saludo del chatbot sobre el contenido en móvil | Low | Se queda | El chatbot está fuera del alcance |

## Improvements

- **Medium · Sin verificar en Safari ni en un iPhone real.** Todo se midió en Chromium, y los tests corren en el WebKit de Playwright, que no reproduce el video desde memoria y usa la ruta de respaldo. En esa ruta el navegador de pruebas se congela unos 5 s en algunos saltos del video; no se sabe si Safari real lo hace.
  - **Por qué:** `layout.md › Adaptability`: "Preview your app on multiple devices, using different size classes, localizations, and text sizes."
  - **Arreglo:** recorrer la Home en un iPhone y en Safari de escritorio antes del merge, con el scroll rápido y lento.

- **Medium · El saludo del chatbot tapa la línea de autor del héroe** durante 8 s: 75 % de la línea a 390 px y 63 % a 1440 px. Sin la intro, ahora aparece sobre el primer pantallazo. Además, Lighthouse a veces lo captura a mitad de su aparición y lo cuenta como contraste bajo (ya visible mide 16.87:1 en modo noche).
  - **Por qué:** `design-principles.md › Agency`: "Stay out of the way. People use your product to get things done."
  - **Arreglo:** fuera del alcance de este trabajo (el chatbot no se toca). Propuesta: mostrar el saludo después del primer scroll, o no mostrarlo en la Home.

- **Medium · Imágenes sin dimensiones en tres casos de estudio.** `dakoma-roofing`, `quick-metal-shop-arquiexpo` y `quick-metal-shop-marketing` usan `<img>` escrito a mano en el MDX: ya siguen el sistema (esquinas de 4 px, ancho de la columna), pero no pasan por el optimizador de imágenes ni reservan su alto. Es criterio propio, no una guía de la HIG.
  - **Arreglo:** cambiar esas cinco imágenes a la sintaxis de imagen de Markdown en el contenido.

- **Low · Un destello sin atenuar al tomar el relevo el video.** Si el video termina de cargar con la página detenida justo en un fotograma de destello del montaje, se ve sin velo unos 200 ms. `accessibility.md › Cognitive`: "Be cautious with fast-moving and blinking animations." Arreglo: sin transición en el primer fotograma tras `data-film-ready`.

- **Low · Aviso de consola en todas las páginas salvo la Home:** Chrome informa de una hoja de estilos «precargada y no usada». Es la de la Home, que Next precarga al anticipar el clic en el enlace Home de la nav. No afecta a nadie que visite el sitio.

- **Low · Sin leer por un nativo: los textos nuevos** («More from this project», el 404) y los que no cambiaron (FAQ, About). Las cifras están trazadas a sus fuentes; el tono lo decide Erick.

## Craft notes

- **Tiene punto de vista.** Lo que se recuerda es el video del escritorio corriendo limpio. La estructura dice algo cierto: cada tarjeta es un puesto que Erick ocupó (Brand, Content, Paid media, CRM, Software), con un hecho y su caso.
- **No es una de las tres plantillas.** No hay vidrio, ni número gigante con degradado, ni filetes. El negro con un acento azul sigue ahí en modo noche, pero ya no es lo que sostiene la página: en modo día las tarjetas son claras y el video hace el mismo trabajo.
- **La audacia está en un solo sitio.** El video. Todo lo demás es texto sobre una superficie plana.
- **Quitar un accesorio:** el icono de copiar enlace junto a cada título, en casos y posts, es lo único que queda de adorno funcional en esas páginas; podría mostrarse solo con foco o cursor en pantallas con puntero. En la Home no encuentro nada que sobre.
- **Low · La parte de abajo de la Home es correcta pero genérica.** Rejilla de proyectos, preguntas y CTA podrían ser de otro sitio. No es un defecto; es donde hay margen si se quiere seguir.
- **Low · La tipografía sigue siendo un vehículo neutro.** Geist sin el espaciado extremo ya no delata la plantilla, pero tampoco aporta carácter. La dirección B del lab (Archivo ancha, con las proporciones del logotipo) queda como opción si algún día se quiere.

## What works

- **Ningún texto sobre fotogramas.** Es una propiedad comprobada por tests, no una intención: todo texto de la pista del video tiene una superficie opaca debajo, en los dos temas y sin JavaScript, y las etiquetas de la nav solo aparecen sobre la página.
- **El video sigue siendo ligero de leer:** sin autoplay, sin sonido, con fotograma fijo por tramo para movimiento reducido, equipos lentos y mientras carga.
- **Un solo CTA** con verbo, del mismo tamaño y color en la Home, About, el 404 y la pantalla de contraseña.
- **El tema claro ya llega a la Home:** banda y tarjetas toman el color de la página.
- **Las cifras son las de las fuentes** (338K+, $0, 3.92x, 260, $3.45, 85 %, 200+, 48 horas), y las de los casos ya no «cuentan» hacia arriba.
- **La galería se puede usar con teclado** y los videos de los casos tienen controles y no arrancan solos.

## Platform notes

- **Web:** no se revisaron convenciones de iOS ni macOS.
- **Excepción conocida:** el chatbot conserva dos `backdrop-filter` (`FaqChatbot.module.scss:74,269`) y su botón redondo; no se toca. Es una capa flotante funcional, así que no contradice la regla de la HIG, pero sí la comprobación literal con `rg`.
- **Lighthouse:** en local, Edge, mediana de 3. Performance y LCP iguales o mejores que `main` en las diez filas (peor diferencia de LCP: +0.09 s); CLS máximo 0.031; TBT máximo 68 ms. Accesibilidad sobre el build final: Home 100 / 100, About 96 / 96 (móvil / escritorio). El único audit que falla en About es `color-contrast` sobre el saludo del chatbot, capturado a mitad de su aparición. Performance de Projects, Blog y Visual Work se midió antes de la última ronda de correcciones, que no tocó la carga. Tabla completa en `docs/perf-report.md`.

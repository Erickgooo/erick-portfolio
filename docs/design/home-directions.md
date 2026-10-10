# Home: tres direcciones (Fase 2)

Fecha: 2026-10-10 · Rama: `lab/apple-directions` · Ruta: `/lab?v=a`, `/lab?v=b`, `/lab?v=c`

Sigue el «Design improvement mode» de la skill `apple-design`. La revisión de la que parte está en `docs/design/apple-review-before.md`.

## 1. De dónde sale

- **Producto:** Erick Mahecha, growth marketing y automatización con IA, una sola persona, desde Medellín.
- **Audiencia:** founders (principal) y equipos que contratan (secundaria).
- **Trabajo único de la Home:** que un founder crea que una persona construye y opera todo su marketing, y agende 30 minutos.
- **Material propio de Erick**, de donde sale lo visual:
  - El video de su escritorio: tres monitores, una línea de tiempo de edición, gráficas, un teclado, su cara. Es real y no podría ser de otro.
  - Su mejor resultado son reels: video vertical con subtítulos. 338K+ vistas orgánicas.
  - Su propuesta de valor es una frase estructural: hace el trabajo de un departamento.
  - Su logotipo es de proporciones anchas y su monograma es angular, sin redondeos.
  - Su voz, según el manual de marca: frases cortas, primera persona, verbo en pasado, cifra exacta.

Las tres direcciones se distinguen por una sola decisión de fondo: **dónde vive el texto respecto al video**. Encima (A), al lado (B) o entre plano y plano (C). De esa decisión salen la tipografía, el contraste, el tema y el guion de cada una.

## 2. Sistema común

### Color

Seis valores con función. Los neutros son los del manual de marca (Obsidiana, Titanio); cambia el gris secundario, que hoy no llega a 4.5:1.

| Función | Claro | Contraste | Oscuro | Contraste |
| --- | --- | --- | --- | --- |
| Superficie | `#f4f5f7` | — | `#000000` | — |
| Superficie elevada | `#ffffff` | — | `#141416` | — |
| Contenido | `#0b0c0e` | 17.94:1 sobre superficie, 19.57:1 sobre elevada | `#f4f5f7` | 19.25:1 y 16.87:1 |
| Contenido secundario | `#4b5058` | 7.44:1 y 8.12:1 | `#a8adb5` | 9.31:1 y 8.16:1 |
| Acento (relleno) | `#2d5bff` | texto blanco encima: 5.18:1 | `#2d5bff` | texto blanco encima: 5.18:1 |
| Acento (texto, solo hover de enlace) | `#2549cb` | 6.65:1 y 7.26:1 | `#a6baff` | 11.09:1 y 9.72:1 |

- **Cobalto significa dos cosas y nada más:** la acción principal (relleno del botón) y el estado del video (la barra de progreso). `branding.md › Best practices`: "use it intentionally for primary actions or status indicators".
- Los enlaces se distinguen por subrayado, no por color.
- Líneas divisorias: el color de contenido al 14 % (claro) y 18 % (oscuro).

### Lo que se quita en las tres

Píldoras, paneles de vidrio, degradados en texto, palabras que salen de un desenfoque, tagline que se enciende, subrayados de marcador, fila de stats, cifras gigantes, brillo del cursor, fondo de puntos, borde luminoso, efecto magnético, texto que se descifra y la línea «No commitment» bajo el botón. Ninguna dirección los cambia por otra versión del mismo truco.

### Lo que comparten

- **Un solo CTA:** «Book a 30 minute call», rectángulo Cobalto con radio de 6 px, 48 px de alto. Aparece en el héroe y al final.
- **Firma:** el video que avanza con el scroll. Nada más es audaz.
- **Bajo el video:** trabajo, una línea para equipos que contratan, preguntas y el CTA final. En el lab esta parte es la misma en las tres (en B el trabajo va en tabla); se termina en la Fase 3 con la dirección elegida.
- **Movimiento:** solo `transform` y `opacity`. Con `prefers-reduced-motion` el video se cambia por un fotograma fijo por tramo, como hoy.

## 3. Dirección A · Voz en off

**El texto va encima del video, como subtítulos.** Una frase por plano, blanca, sobre una tira negra propia por cada línea.

```text
1440                                         390
┌────────────────────────────────────────┐   ┌──────────────┐
│ Medellín        [ nav ]         12:51  │   │              │
│                                        │   │    VIDEO     │
│              V I D E O                 │   │   a sangre   │
│        a sangre, casi sin velo         │   │              │
│                                        │   │▓▓▓▓▓▓▓▓▓▓▓   │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                     │   │▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│▓ I build the marketing ▓▓▓             │   │▓▓▓▓▓▓▓       │
│▓ department your company ▓             │   │▓ byline ▓▓▓  │
│▓ doesn't have. ▓                       │   │[ Book call ] │
│▓ Erick Mahecha. Growth… ▓              │   │              │
│[ Book a 30 minute call ]               │   │   [ nav ]    │
│━━━━━━━ progreso ━━━━───────────────────│   │━━━━──────────│
└────────────────────────────────────────┘   └──────────────┘
```

- **Tipografía:** solo Geist. Título 600, 28–56 px, interlineado 1.5, espaciado −0.01 em. Subtítulos 500, 20–34 px, interlineado 1.52, espaciado 0. Línea de autor 17 px. Enlace 16 px en una tira de 44 px de alto.
- **Velo:** baja de 0.58 a 0.16 (0.5 en los destellos del montaje). El video se ve.
- **Contraste:** blanco sobre tira negra al 88 %. Peor caso calculado, con video blanco puro detrás: 17.40:1 (16.48:1 sin velo). No depende del fotograma. Con `prefers-reduced-transparency` la tira es negra opaca.
- **Etiquetas de la nav sobre el video** (lugar y hora, 14 px): un degradado negro de 132 px bajo la barra. Peor caso calculado: 6.90:1.
- **Movimiento:** cada subtítulo sube con su tramo y cambia de opacidad al entrar y al salir. Nada más.
- **Largo:** 9 tramos, unas 15 pantallas de scroll (hoy son unas 16.5).

**Texto propuesto**

> **I build the marketing department your company doesn't have.**
> Erick Mahecha. Growth marketing and AI automation, from Medellín.
> [Book a 30 minute call]
>
> I work alone, from this desk.
> In January 2026 Quick Metal Shop hired me as its first marketer. It had no brand manual and no analytics.
> I wrote the brand manual in my first week. SEO publishing, Meta ads and the CRM came after it.
> A sales campaign made with AI video returned 3.92x ROAS.
> A second one brought 260 B2B leads at $3.45 each.
> Three reels cut from before-and-after photos reached 338K+ organic views. Ad spend was $0.
> For ArquiExpo I shipped a touchscreen app 48 hours after the idea.
> At Artesa, a WhatsApp assistant I built handles 85% of conversations without a person.

**Por qué es de Erick y qué descarté.** Su mejor resultado son reels, y un reel se lee en subtítulos: la Home habla en el formato de su propio trabajo, con el guion en primera persona y en pasado que pide su manual. Descarté los subtítulos fijos que se cruzan con un fundido (necesitan `timeline-scope`, que Firefox no tiene), las tiras semitransparentes que se pisan entre líneas (dejan bandas más oscuras) y un contador de tiempo en monoespaciada, que llevaba la página al aspecto de terminal de cualquier portafolio técnico.

## 4. Dirección B · Escritorio y libro mayor

**El texto va al lado del video, nunca encima.** El video es una ventana; la página es un documento sobre su propia superficie y por eso toda la Home sigue el tema claro u oscuro.

```text
1440                                         390
┌────────────────────────────────────────┐   ┌──────────────┐
│ Medellín        [ nav ]         13:02  │   │    VIDEO     │
│                                        │   │   ventana    │
│ Marketing,          ┌────────────────┐ │   │  fija, 42 %  │
│ built and run       │                │ │   │━━────────────│
│ by one person.      │     VIDEO      │ │   │ Marketing,   │
│                     │    ventana     │ │   │ built and run│
│ I'm Erick Mahecha…  │     fija       │ │   │ by one       │
│ [ Book a call ]     │                │ │   │ person.      │
│                     │                │ │   │ I'm Erick…   │
│ Quick Metal Shop,   │                │ │   │ [ Book call ]│
│ January to July…    └━━━─────────────┘ │   │   [ nav ]    │
└────────────────────────────────────────┘   └──────────────┘
```

- **Tipografía:** títulos en Archivo con el eje de ancho al 116–122 %, peso 600–640, 34–62 px (título) y 22–30 px (secciones), espaciado 0. Texto corrido en Geist, 19 px e interlineado 1.6 (17 px en móvil). Archivo es libre (OFL) y se sirve desde el propio sitio con `next/font`, igual que Geist.
- **Contraste:** el de los tokens de la tabla. No hay texto sobre video.
- **Video:** ventana de 7/12 del ancho, fija bajo la nav, radio de 6 px. En móvil queda fija arriba al 42 % del alto y el texto pasa por debajo. Sin velo (0.55 solo en los destellos).
- **Movimiento:** ninguno en el texto. El video avanza con la sección que se está leyendo.
- **Largo:** 5 tramos, unas 4 pantallas.

**Texto propuesto**

> **Marketing, built and run by one person.**
> I'm Erick Mahecha. I work from Medellín with founders who need brand, content, paid media and CRM running as one system. I build it and I keep it running.
> [Book a 30 minute call]
>
> **Quick Metal Shop, January to July 2026.** I was the first marketing hire. I wrote the brand manual in my first week, set up analytics and automated SEO publishing, ran the Meta ads and routed their leads into the CRM.
> **Video without a shoot.** Three reels cut from before-and-after photos reached 338K+ organic views with $0 in ad spend. A sales campaign made with AI video returned 3.92x ROAS.
> **Leads that arrive sorted.** At Artesa, a WhatsApp assistant handles 85% of conversations. At ATV Riders, a Kommo CRM flow qualifies 200+ leads a day before a salesperson reads them.
> **Software when none exists.** For ArquiExpo 2026 I shipped a touchscreen gallery of 285 panel variants, 48 hours after the idea.
>
> **Every project** (tabla: proyecto y resultado; «Not measured» donde el caso no tiene métrica).

**Por qué es de Erick y qué descarté.** Los títulos tienen las proporciones anchas de su logotipo, así que el titular y la marca parecen de la misma familia. Las cifras dejan de ser decoración y pasan a una tabla con los nueve proyectos, donde las que no existen dicen «Not measured»: precisión sobre exageración, como pide su manual. Descarté una serif editorial sobre fondo claro (es una de las tres plantillas que la skill señala), un registro de operaciones con hora en cada fila (filetes finos y monoespaciada, otra de las tres) y usar Space Grotesk del manual, que Erick ya reemplazó por Geist el 2026-10-09.

## 5. Dirección C · Departamento de uno

**El texto va entre plano y plano.** El video corre a sangre y sin nada encima; entre tramos sube una tarjeta negra que nombra un puesto del departamento y lo que Erick hizo en él.

```text
1440                                         390
┌────────────────────────────────────────┐   ┌──────────────┐
│ Medellín        [ nav ]         12:52  │   │              │
│                                        │   │    VIDEO     │
│              V I D E O                 │   │   limpio     │
│          limpio, sin texto             │   │              │
│                                        │   │██████████████│
│████████████████████████████████████████│   │ The marketing│
│ The marketing            Erick Mahecha.│   │ department   │
│ department               Growth…       │   │ is one person│
│ is one person.           [ Book call ] │   │ Erick…       │
└────────────────────────────────────────┘   │ [ Book call ]│
                                             │   [ nav ]    │
   luego, alternando con video limpio:       └──────────────┘
┌────────────────────────────────────────┐
│████████████████████████████████████████│
│                      Three reels cut…  │
│ Content              Read the case…    │
│████████████████████████████████████████│
└────────────────────────────────────────┘
```

- **Tipografía:** solo Geist. Título 600, 32–76 px, interlineado 1.02, espaciado −0.02 em. Nombre del puesto 600, 48–128 px, interlineado 0.98, espaciado −0.025 em. Frase 400, 20–28 px, interlineado 1.42. El espaciado negativo queda solo en estos dos tamaños de display.
- **Contraste:** todo el texto va sobre negro `#000000`: blanco 21:1, línea de autor `#c7ccd1` 12.99:1. No hay texto sobre video.
- **Video:** sin velo (0.55 solo en los destellos). Las tarjetas son negras en los dos temas, como los intertítulos de una película; el tema se nota después del video.
- **Movimiento:** ninguno propio. Las tarjetas suben con el scroll y tapan el video.
- **Largo:** héroe, 5 tarjetas y 5 tramos de video limpio, unas 13 pantallas.

**Texto propuesto**

> **The marketing department is one person.**
> Erick Mahecha. Growth marketing and AI automation, from Medellín.
> [Book a 30 minute call]
>
> **Brand.** Quick Metal Shop had no brand manual. I wrote it in my first week, and the ArquiExpo 2026 stand was built from it.
> **Content.** Three reels cut from before-and-after photos reached 338K+ organic views. Ad spend was $0.
> **Paid media.** A sales campaign made with AI video returned 3.92x ROAS. A second one brought 260 B2B leads at $3.45 each.
> **CRM.** At Artesa, a WhatsApp assistant handles 85% of conversations. At ATV Riders, 200+ leads a day arrive sorted.
> **Software.** For ArquiExpo I shipped a touchscreen app 48 hours after the idea.

**Por qué es de Erick y qué descarté.** Su propuesta de valor, hacer el trabajo de un departamento, se vuelve la estructura: cada tarjeta es un puesto que él ocupó, con lo que hizo en ese puesto. Es la dirección donde el video se ve más limpio. Descarté las tarjetas en Cobalto a pantalla completa (un segundo elemento audaz que competía con el video), numerar los puestos 01 a 05 (no son una secuencia) y que las tarjetas siguieran el tema claro, porque las etiquetas blancas de la nav desaparecían sobre una tarjeta blanca.

## 6. Autocrítica

**¿Habría propuesto lo mismo para otro producto?**

- **La pregunta de partida no es genérica:** dónde vive el texto respecto al video solo tiene sentido porque Erick tiene este video. Para un consultor sin él, ninguna de las tres existiría.
- **Lo que cambié por el camino:** las tiras de A iban semitransparentes y pegadas, y pasaron a llevar una rendija entre líneas para no pisarse; las tarjetas de C seguían el tema y pasaron a negro fijo; en B el video iba una sección por detrás de lo que se lee y ahora cambia cuando el título llega a la mitad de la ventana.
- **A** depende de que su trabajo sean reels con subtítulos. Para un producto sin video no existiría.
- **B** depende de su logotipo ancho y de que tenga nueve casos con cifras verificables que llenan una tabla.
- **C** depende de que su propuesta sea, literalmente, ser un departamento.
- **Lo que sigue siendo genérico:** la parte de abajo (rejilla de trabajo, preguntas, CTA) es correcta pero no tiene nada propio todavía. Y el negro con un acento azul es el aspecto de muchas páginas; aquí lo sostienen el video y que son los colores de su manual, pero no lo voy a presentar como un rasgo distintivo.

**Una cosa por quitar.** En A, el enlace «Read the case study» bajo cada subtítulo: siete enlaces iguales sobre el video. Podrían ir solo en la lista de trabajo de abajo. En C, la línea de autor del héroe repite lo que la nav ya dice (Medellín). En B no encuentro nada que sobre.

**Piso de calidad: qué está verificado y qué no.**

- Verificado: las tres direcciones compilan en producción y se ven a 390 y 1440 px en claro y oscuro (48 capturas en `docs/design/screens/lab/`). El título y el póster del héroe vienen en el HTML y no dependen de JS.
- Calculado, no medido sobre fotogramas: los contrastes de arriba (peor caso con video blanco puro).
- Sin verificar todavía: foco visible con teclado en cada control, texto ampliado al 200 %, Safari y un iPhone real, Lighthouse de las tres rutas.

## 7. Limitaciones del lab

- La nav, el footer y el chatbot son los del sitio actual. Los puntos y el brillo del cursor se ocultan solo en `/lab`.
- En B la tabla pasa a filas apiladas en móvil con `display: block`, que algunos lectores de pantalla dejan de anunciar como tabla. Se resuelve en la Fase 3 si se elige B.
- En C los tramos de video limpio están marcados `aria-hidden` y no tienen texto alternativo del plano.
- La intro de 5 s no aparece en `/lab` porque solo corre en `/`. La propuesta es quitarla en la Fase 3.
- Las preguntas frecuentes usan el texto actual sin editar.

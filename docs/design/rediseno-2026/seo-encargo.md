# Ronda 10: SEO técnico y metadatos (Erick, 2026-11-05)

Encargo de Erick (vía Lyra): que un reclutador o un gerente general que busque «Erick Mahecha» o «Growth & AI Systems Lead» encuentre este sitio, con la página, el título y la descripción correctos, sin cambiar lo que el visitante ve. Llega hasta producción si pasa la puerta.

- **Rama:** `feat/seo-tecnico` (worktree `.claude/worktrees/seo`), creada desde `origin/main`.
- **Punto de regreso:** `dd4ace9`, el main que estaba en producción al empezar.
- **«100 %» significa:** todos los criterios del encargo en verde en producción, y ningún problema que dependa del código sin resolver o sin reportar. Ningún trabajo garantiza un puesto en Google.
- **Fuera de alcance:** keywords meta, texto oculto, páginas nuevas, artículos, versión en español, FAQPage, Review, AggregateRating, JobPosting, Vercel y DNS.

## Línea base (producción, 2026-11-05, antes de cambiar nada)

Respuestas crudas del servidor, sin JavaScript, sobre `dd4ace9`.

| Comprobación | Resultado |
|---|---|
| URL en el sitemap | 26, todas 200 en `www` |
| `<loc>` del sitemap | las 26 en el dominio sin www, y cada una responde 307 hacia `www` |
| `Sitemap:` de robots.txt | dominio sin www |
| `lastmod` | la fecha del build en las 5 páginas; `publishedAt` en los 20 casos y artículos, aunque se editaron después; una fecha fija en el índice de Incentiva |
| Canonical | 0 de 26 |
| `og:url` | las 26 en el dominio sin www |
| `og:type` | `website` en las 26, también en casos y artículos |
| `og:site_name` y `og:locale` | 0 de 26 |
| Títulos | únicos; 18 de 26 pasan de 60 caracteres (máximo 118) |
| Descripciones | únicas; 20 de 26 fuera de 70 a 160 (máximo 286) |
| `h1` | exactamente uno en las 26, en el HTML del servidor y con JavaScript |
| JSON-LD | `WebPage` en 5 y `BlogPosting` en 21: también en los casos y en el índice del blog. `dateModified` igual a `datePublished` en los 20 con fecha. `sameAs` solo en `/about`, sobre la página. Sin `Person` propio, `WebSite`, `ProfilePage` ni `BreadcrumbList` |
| `/unauthorized` | noindex, pero hereda la descripción y el Open Graph de la Home |
| URL inexistente | 404 y noindex, pero con el título, la descripción y el Open Graph de la Home |
| Dominio sin www | `https://erickmahecha.com/` 307 hacia `www`; `http://erickmahecha.com/` 308, luego 307, luego 200 |
| `/about/` | 308 hacia `/about` |
| `/api/rss` | 200 `application/xml`; enlaces sin www; 3 de 4 `enclosure` declaran `image/jpeg` con un archivo `.webp` |
| `/api/og/generate` | 200 `image/png` |
| Enlace `alternate` al RSS | 0 de 26 |
| Rutas de laboratorio | `/lab`, `/lab/rediseno-2026` y `/lab/rediseno-2026/a` responden 404 |
| Enlaces internos | 28 destinos, todos vivos; uno en el dominio sin www (`href="http://erickmahecha.com"` en `ai-powered-ad-creatives.mdx`) |
| Enlaces externos | 20 revisados con una petición cada uno, todos 200, salvo LinkedIn (999, su rechazo a clientes automáticos) |
| Imágenes | 185 de 294 con `alt` vacío en el HTML del servidor; de las distintas, 36 son logos dentro de un contenedor `aria-hidden` |
| Cabeceras de seguridad | las mismas en las 26: CSP, HSTS con preload, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP |
| Lighthouse SEO móvil | 100 en las 26. La auditoría no pide canonical ni penaliza los 307, así que este 100 no detecta nada de lo anterior |

## Decisiones

- **D64. Dominio: `www` en todo lo que se publica.**
  - Cambia `siteUrl`, de donde salen sitemap, robots, canonical, Open Graph, JSON-LD, RSS, los enlaces para compartir y las URL de ErickBot.
  - Cambia el `href` de `ai-powered-ad-creatives.mdx`. El texto visible sigue siendo «erickmahecha.com», igual que la mención sin enlace de `ai-portfolio.mdx`.
  - La instantánea de ErickBot cambió en 14 líneas y se comprobó que la diferencia es solo el dominio: al quitarlo, cada línea tiene su pareja idéntica.
  - **CV:** el PDF publicado enlaza a `https://erickmahecha.com/`. No se regeneró, como pide el encargo. `build-resume.mjs` ya tiene `www`, así que el próximo CV saldrá bien; el enlace actual funciona con el 307.
  - **RSS:** el `guid` de cada artículo es su URL, así que cambia una vez con el dominio. Un lector de feeds podría mostrar esos 4 artículos como nuevos una vez.
- **D65. Canonical y valores por defecto.**
  - `metadataBase` en el layout y canonical a sí misma, absoluta y sin parámetros, en cada página indexable.
  - El layout ya no da los metadatos de la Home: solo `metadataBase` y un título base.
  - `not-found.tsx` trae título propio y noindex, y `/unauthorized` conserva su título y su noindex. Ninguna hereda ya la descripción ni el Open Graph de la Home.
  - `robots.ts` y `middleware.ts` no se tocaron: las rutas protegidas siguen sin listarse y responden con `X-Robots-Tag: noindex`.
- **D66. Fechas guardadas, no leídas en el build.**
  - Viven en `modifiedAt`: en el frontmatter de cada MDX y en `pages` de `site.ts`. El sitemap, `dateModified` y `article:modified_time` salen de ahí.
  - **Regla:** la fecha del último commit de `origin/main` que cambió lo que el lector recibe de esa página. No cuentan los cambios de solo espacios, los de `.png` a `.webp`, el video de About recodificado ni los commits de esta rama. Una escena nueva dentro de un caso sí cuenta, porque añade contenido visible.
  - **Se escriben a mano.** Quien cambie el contenido de una página debe subir su `modifiedAt`.
  - Commits que se descartaron por ser solo de formato: `3f7fba4` en `atv-riders`, `leadbot-ai` y `quick-metal-shop-the-brand-comes-to-life` (extensiones de imagen), y `ab0355d` en `/about` (el mismo video, en otro códec).

  | Página | `modifiedAt` | Commit | Origen |
  |---|---|---|---|
  | `/` | 2026-11-04 | `0ddb3cf` | `Hero.tsx`, `Bench.tsx`, `ToolWall.tsx` |
  | `/about` | 2026-11-03 | `7d94e3b` | `about.tsx` |
  | `/work` | 2026-11-04 | `0ddb3cf` | `WorkIndex.tsx` y 3 MDX |
  | `/blog` | 2026-11-03 | `1f63126` | los 3 artículos nuevos |
  | `/gallery` | 2026-11-03 | `1f63126` | `gallery/Head.tsx` |
  | `/work/incentiva-group` | 2026-11-03 | `c3ff0fb` | `incentiva.ts` |
  | `chatflow-whatsapp-ai-platform`, `directv-click-to-whatsapp`, `scope-ios-launch`, `scope-multi-client-platform` | 2026-11-04 | `0ddb3cf` | su MDX |
  | `ai-powered-ad-creatives`, `dakoma-roofing`, `quick-metal-shop-marketing`, `quick-metal-shop-viral-videos`, `samsung-lifemiles-whatsapp` | 2026-11-03 | `1f63126` | su MDX |
  | `quick-metal-shop-arquiexpo` | 2026-11-03 | `7d94e3b` | su MDX |
  | `ai-portfolio`, `incentiva-launch-campaign` | 2026-11-02 | `434c296` | su MDX |
  | `incentiva-website-brand` | 2026-11-02 | `0e6a858` | su MDX |
  | `atv-riders` | 2026-10-22 | `40ee3d9` | la escena `ChatTriage` |
  | `leadbot-ai` | 2026-10-22 | `13b6dee` | la escena `LeadSort`; el texto de esa versión es de `cb2e578`, el mismo día |
  | `quick-metal-shop-the-brand-comes-to-life` | 2026-10-22 | `7a06ffe` | las escenas `BrandWall` y `BeatCuts` |
  | `designing-a-multi-client-platform`, `operable-whatsapp-ai-assistants`, `running-projects-with-ai-agents` | 2026-11-03 | `1f63126` | su MDX |
  | `my-workspace` | 2026-10-22 | `acbc82c` | la escena `DeskScene` |

- **D67. Títulos y descripciones.** Únicos en todo el sitio, con títulos de 60 caracteres como máximo y descripciones de 70 a 160.
  - **El título y la descripción de la Home no cambian:** Erick aprobó ese mensaje en la ronda 8.
  - **Casos y artículos:** el `title` alimenta la pantalla y la tarjeta OG, y `summary` se muestra en pantalla. Por eso se añadieron los campos opcionales `seoTitle` (18 entradas) y `seoDescription` (18 entradas), y ninguno de los dos llega a la pantalla ni a la tarjeta. `seoTitle` se publica tal cual.
  - **`/work` y el índice de Incentiva:** su descripción no se muestra en pantalla ni alimenta la tarjeta, así que se acortó en su propio campo. El texto del índice pasó a `pages.incentiva`.
  - **Sin cambios:** los títulos de `/about`, `/work`, `/blog`, `/gallery` y el índice de Incentiva, que ya llevan el nombre; y las descripciones de `/about`, `/blog`, `/gallery`, `leadbot-ai` y `my-workspace`, que ya estaban en rango.
  - **Contenido:** cada descripción recorta el `summary` de su página, sin añadir hechos. Las 4 cifras que aparecen ya estaban publicadas en la misma página: 200+, 338K+ y 3 reels, 2M+ y 13 versiones.
  - **Título visible en JSON-LD:** `headline` sigue siendo el título del `h1`, que es lo que la página muestra.
- **D68. Open Graph.** `article` con `published_time`, `modified_time` y `author` en casos y artículos; `website` en el resto; `site_name` y `locale` `en_US` en todas. Las imágenes no cambian: la tarjeta dibujada sigue tomando el título corto.
- **D69. JSON-LD: un `@graph` por página, siempre con la misma `Person`** (`@id` `https://www.erickmahecha.com/#person`).
  - `Person` lleva nombre, `jobTitle` desde `profile.role`, `url`, imagen, `sameAs` y `worksFor`. Este último es solo el nombre, «Incentiva Group», porque el sitio publica ese cargo como vigente («July 2026 - Present») y no enlaza al sitio de la empresa.
  - Según la página: `WebPage` y `WebSite` en la Home; `ProfilePage` en `/about`; `CollectionPage` en `/work`, `/blog`, `/gallery` y `/work/incentiva-group`; `Article` en los casos; `BlogPosting` en los artículos; `BreadcrumbList` en todas las internas. `author` y `publisher` apuntan a la `Person` por `@id`.
  - `WebSite` va solo en la Home, así que las demás páginas no llevan `isPartOf` hacia un nodo que no contienen.
- **D70. Texto alternativo solo desde texto ya publicado.**
  - `lab-contrato.md` (Erick, 2026-10-21) dice que las piezas de Visual Work y de los casos no se abren, describen ni evalúan, y el encargo pide `alt` descriptivo. Las dos cosas se cumplen usando lo que el código ya tiene: el `alt` nombra la imagen, pero no describe lo que muestra.
  - Portadas de casos y artículos en índices y tarjetas: «Cover of {título}». Miniaturas de YouTube: el título del video. Piezas del banco: el `alt` que ya tenían en `piece.alt`. Retrato en el héroe y en los artículos: «Portrait of Erick Mahecha», como en About.
  - Se quedan vacíos: los 36 logos del muro y de las escenas, dentro de un `aria-hidden`, y el póster del video de About, que está en lugar de un video con nombre accesible propio.
  - **Error de esta ronda, corregido:** abrí una hoja con las portadas y escribí descripciones a partir de ella antes de encontrar esa regla. Se borró la hoja y se retiraron esas descripciones, que nunca llegaron a un commit. Para tener `alt` que digan lo que cada imagen muestra, Erick tendría que levantar la regla o escribirlos él.
- **D71. Otros arreglos que salieron de la auditoría.**
  - Enlace `alternate` al RSS en cada página indexable.
  - El `enclosure` del RSS declara el tipo real de cada portada, según su extensión. Sigue sin `length`: leer el tamaño exigiría acceder a los archivos desde la ruta, y RSS no se usa aquí para distribuir esas imágenes.
  - No hubo enlaces rotos ni rutas de laboratorio indexables que corregir.
- **D72. `tests/e2e/seo.spec.ts`.** Recorre el sitemap que publica el sitio, en el HTML del servidor y sin JavaScript. También comprueba sitemap, robots, RSS, `/unauthorized` y dos URL inexistentes. Las imágenes OG se descargan una vez, solo en el proyecto chromium, con una pausa de 2,1 s tras cada imagen dibujada, para respetar el límite de 30 por minuto.

## Propuestas para Erick

Cambian lo que se ve, así que no se aplicaron.

| Página | Texto actual | Propuesta | Por qué |
|---|---|---|---|
| `/` | `h1`: «I build and run the systems behind business growth.» El nombre y el cargo van encima, en un párrafo | Sin cambiar el mensaje aprobado, marcar como `h1` la línea «Erick Mahecha · Growth & AI Systems Lead» y dejar el titular como subtítulo; o escribir «Erick Mahecha: I build and run…» | El `h1` es la señal más fuerte de la página, y hoy no lleva ni el nombre ni el cargo, las dos búsquedas objetivo |
| `/work` | `h1`: «Projects» | «Projects by Erick Mahecha» o «Growth and AI systems case studies» | Un `h1` de una palabra no dice de quién ni de qué |
| `/blog` | `h1`: «Insights», y «Blog» en la cabecera | «Insights by Erick Mahecha», y una sola palabra en los dos sitios | Asocia los artículos al nombre y quita la doble denominación |
| `/gallery` | `h1`: «Visual Work» | «Visual Work: ad creatives and AI video» | Describe el contenido a quien llega desde un buscador |
| `/work/ai-powered-ad-creatives` | Firma al final: «Erick Mahecha · Growth Marketing Specialist · …» | Usar «Growth & AI Systems Lead», o quitar el cargo de la firma | Es el cargo de entonces, escrito como si fuera el actual, y contradice la identidad única de D27 |
| `/work/incentiva-group` (tarjeta para compartir) | Dibuja el título de la Home, porque «Incentiva Group» no está entre los títulos que acepta `/api/og/generate` | Agregar ese título a la lista | Quien comparta el enlace ve una tarjeta de otra página. No se tocó porque el encargo pide que las imágenes no cambien |

## Excepciones

Ninguna URL necesitó excepción: todas tienen un solo `h1`.

## Resultados de la puerta

Se completan al correr la puerta sobre el commit final.

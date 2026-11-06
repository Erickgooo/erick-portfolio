# Limpieza del repo: plan de ejecución

> **Para quien ejecute:** usar `superpowers:executing-plans`, en esta misma sesión y sin subagentes salvo la única revisión final. Los pasos usan casillas (`- [ ]`).

**Objetivo:** dejar el repo sin código muerto ni duplicado, con las dependencias justas y menos JS y CSS de primera carga, sin que cambie nada de lo que ve el visitante.

**Enfoque:** lotes pequeños y secuenciales sobre `chore/limpieza-repo`, cada uno con su commit y sus suites. Primero lo mecánico y lo que ya se midió en copias temporales; después lo que reorganiza módulos. La opción que más mueve el CSS va al final, para aislarla en la puerta.

**Stack:** Next.js 15 (App Router), React 19, TypeScript, módulos Sass, MDX, Biome, ESLint, Playwright.

**Especificación:** `docs/design/rediseno-2026/limpieza-encargo.md`: hallazgos, línea base y decisiones D73 en adelante.

**BASE y punto de regreso:** `032a634a3443bad843b69be0f25fd93bd461e654`.

**Solo se ejecutan los lotes que Erick apruebe.** Un lote rechazado se salta y se anota en el documento.

## Restricciones globales

- Sin cambios visibles: aspecto, texto, animaciones, URL y metadatos SEO quedan idénticos.
- No se toca: `FaqChatbot*`, `src/resources/faqChatbot.ts`, `/api/chatbot`, la CSP y las cabeceras de `next.config.mjs`, `src/middleware.ts`, `RouteGuard`, `PasswordPrompt`, `src/app/api/authenticate`, `src/app/api/check-auth`, `src/utils/auth*`, `.env.local`.
- La instantánea de ErickBot (`tests/unit/chatbot-prompt.expected.txt`) no cambia. Si cambia, se alteró lo que el bot sirve.
- No se agregan dependencias a `package.json` ni hay saltos de versión mayor. Las herramientas temporales corren con `npx` o desde el scratchpad.
- No se abren, describen ni recodifican piezas multimedia. `public/videohome.mp4` se queda.
- No se sube `modifiedAt`. `siteUrl` sigue en `www`.
- Las lecturas `fs` de una ruta `process.cwd()` siguen dentro de un helper que recibe la carpeta como parámetro.
- No se borran ni se omiten pruebas para que pasen.
- Sin abstracciones para un solo uso ni comentarios nuevos en código evidente.
- Se edita con Edit y Write. `npm uninstall` y `git mv` están bien. Con `--package-lock-only`, `npm` respeta el fin de línea del archivo.
- Ramas y worktrees: sin `--force` ni `-D`; lo que traiga algo no advertido se deja y se reporta.
- No se tocan los archivos sin seguimiento del checkout raíz.

## Foco de revisión

Fallos que las suites no cubren por sí solas, y dónde se prueba cada uno:

1. **La cascada según el camino del visitante.** Con `cssChunking: false`, las hojas se acumulan en el orden de la navegación interna. Una carga directa no lo detecta. Se prueba con los 3 recorridos de `look-gate.mjs --walks` (L7 y puerta).
2. **Build de Linux frente a build local de Windows.** Vercel emite preloads de fuentes y puede ordenar los chunks de otra forma. Se prueba en producción tras el push: CSS enlazado en el HTML de la Home, `seo.spec.ts` y todas las URL del sitemap (Fase 4).
3. **Trazado de funciones en Vercel.** Reorganizar `getPosts` puede arrastrar el proyecto entero a una función. Se prueba con la comparación de `.nft.json` en L5 y con `/api/rss` y `/api/og/generate` desplegados.
4. **Datos que dejan de llegar.** La anotación pura de L2 debe quitar los datos solo donde nadie los usa. Se prueba con la instantánea de ErickBot y con el texto visible de `/about` y `/work/incentiva-group`.
5. **Firefox y WebKit.** La huella de estilos corre en Chromium. Los otros dos motores quedan cubiertos solo por la batería e2e, también después de L7.

## Herramientas

En la carpeta `tools` del scratchpad de la sesión, fuera del repo (ruta en la nota de memoria):

| Herramienta | Para qué |
|---|---|
| `measure.mjs`, `compare-measure.mjs` | JS y CSS de primera carga por ruta, CSS total, `.nft.json`, dependencias, líneas, `public/` |
| `battery.sh <dir> <tag>` | calienta imágenes; `test:unit`; `test:e2e --workers=2` en el puerto 3100 |
| `look-gate.mjs` | texto, `<head>`, huella de estilos y píxeles; `--walks` para navegación interna y contraseña incorrecta; `--eval-b` para el control negativo |
| `lh-gate.sh <rondas> <refPort> <ramaPort> <tag>` | Lighthouse móvil intercalado |
| `prod-headers.mjs <origen> <salida>` | cabeceras de seguridad de todas las URL |

**Cierre de cada lote.** En una copia LF fuera del repo (`git -c core.autocrlf=false archive HEAD | tar -x -C <copia>`, más `.env.local` copiado sin leerlo; `npm ci` solo si cambió el lock):

```bash
npx next build                 # primero: genera next-env.d.ts, sin él tsc falla
npx tsc --noEmit               # 0 errores
npx @biomejs/biome check src   # código 0
npm run test:unit              # 32 de 32, más las pruebas nuevas
```

Después, las e2e de las rutas tocadas. Si el lote toca el layout, estilos globales o módulos compartidos, toda la suite en `--project=chromium`. Antes de cada commit: `git diff --stat` y, tras él, `git show --stat`.

---

### Tarea 1: L0, parche de `next` (D74)

**Archivos:** `package.json`, `package-lock.json`.

- [ ] `npm install next@15.5.29 eslint-config-next@15.5.29 --package-lock-only --no-audit`
- [ ] Subir `overrides.sharp` a `^0.35.5` con Edit y volver a correr `npm install --package-lock-only --no-audit`.
- [ ] Comprobar en la copia LF: `npm ls next sharp` da 15.5.29 y 0.35.5 o superior; `npm audit` da 0 críticas.
- [ ] Cierre del lote con toda la suite en chromium.
- [ ] Commit: `chore(deps): next and eslint-config-next 15.5.29, sharp floor 0.35.5`

### Tarea 2: L1, dependencias sin uso (D75)

**Archivos:** `package.json`, `package-lock.json`, `next.config.mjs`.

- [ ] `npm uninstall @next/mdx @mdx-js/loader --package-lock-only --no-audit`
- [ ] En `next.config.mjs`: quitar `import createMDX`, el comentario de `withMDX`, `withMDX`, `pageExtensions`, y dejar `export default nextConfig`.
- [ ] Comprobar que `git diff next.config.mjs` no toca `csp`, `securityHeaders` ni `headers()`.
- [ ] Comprobar que la lista de rutas del build es igual a la de BASE (27 entradas) y `npm ls @mdx-js/mdx` sigue resolviendo por `next-mdx-remote`.
- [ ] Cierre del lote con `seo`, `ssr-content` y `smoke` en chromium.
- [ ] Commit: `chore(deps): drop @next/mdx, every MDX file goes through next-mdx-remote`

### Tarea 3: L2, datos muertos en el JS de todas las rutas (D76)

**Archivos:** `src/resources/incentiva.ts:346`.

- [ ] Escribir `/*#__PURE__*/` antes de `INCENTIVA_AREAS.flatMap(...)`, con un comentario de una línea que diga por qué: esa llamada era lo único que impedía descartar estos datos del barril en los componentes cliente.
- [ ] Comprobar en `.next/static/chunks/app/layout-*.js`: `grep -cE 'caseSlug|P14'` da 0.
- [ ] Comprobar con `compare-measure.mjs`: cerca de −3 KB de JS por ruta frente a BASE y ninguna función crece.
- [ ] Cierre del lote; `chatbot-prompt.spec.ts` pasa sin regenerar la instantánea; `incentiva` y `ssr-content` en chromium.
- [ ] Commit: `perf: mark the Incentiva list pure so its data leaves the layout chunk`

### Tarea 4: L3, exportaciones y tipos sin uso

**Archivos:** los de las filas de L3 del documento.

- [ ] Quitar `export` de: `BRANDS`, `BRANDS_TITLE`, `absoluteUrl`, `ogImage`, `readPosts` (blog), `INCENTIVA_CASES`, `plainText`, `MediaPrint`, `zeroOf`, `CASE_SCENES`, `MEDAL_VIEWBOX`. `findIntro` lo resuelve la Tarea 6.
- [ ] Borrar la línea 31 de `Scene.tsx` (`export { TYPE_MS }`). El `import` se queda.
- [ ] Quitar `export` de los tipos de la fila y las re-exportaciones de `Profile`, `ProfileLink`, `PagePath`, `HomeCategory` y `HomeFeature` en `src/resources/index.ts`.
- [ ] No tocar `FAQItem`, `RateLimitResult` ni `backButtonLabel`: zona protegida.
- [ ] `npx knip@5` en la copia LF: solo quedan esos tres y los falsos positivos conocidos de MDX y scripts.
- [ ] Cierre del lote.
- [ ] Commit: `chore: exports nobody imports`

### Tarea 5: L4, código, estilos y comentarios muertos

**Archivos:** `scenes/CanvasLoop.tsx`, `scenes/Scene.tsx`, `scenes/SceneDriver.tsx`, `prose/Prose.tsx`, `src/resources/site.ts`, `blog/Share.tsx`, `src/components/Header.tsx`, `src/utils/posts.ts`, `src/resources/custom.css`, `workbench/_shared.scss`, `scenes/work/MarketingSteps.tsx:28`, `scenes/work/AdReturn.tsx:56`, `src/components/index.ts`, `src/app/layout.tsx`, `src/resources/Metric.tsx`, y los de la fila de comentarios.

Commits separados, en este orden:

- [ ] **Props sin llamador.** `CanvasLoop`: `threshold`, `paused`, `stillAt`, `style` y sus ramas. `Scene`: `threshold` y su lectura `data-threshold` en `SceneDriver`. `Typed`: `speed` (en el driver queda `TYPE_MS`) y `caret`.
- [ ] **Entradas MDX sin uso.** `Row` y `DataTable` en `Prose.tsx`. `table: TableWrap` se queda.
- [ ] **Configuración apagada (D79).** `sharing.on`: las 5 plataformas en `false` y su tabla en `Share.tsx`; `sharing.enabled`; `headerShows` y sus ramas en `Header`. `enabledRoutes` no se toca: lo lee `RouteGuard`.
- [ ] **Frontmatter.** `PostMetadata.link` en el tipo y en `readPosts`.
- [ ] **Estilos.** Los 15 tokens de `custom.css` y los mixins `h2` y `lede`. Comprobar antes con `grep` que siguen sin lecturas. Quitar `s.pageLeft` y `s.figMain`, cuyo resultado es la cadena `undefined` en el `class`.
- [ ] **Barril de componentes.** Borrar `src/components/index.ts`; `layout.tsx` importa directo, **en el mismo orden**, porque ese orden fija el del CSS. Actualizar el comentario de `Metric.tsx`.
- [ ] **Comentarios obsoletos** de la fila: reescribir en presente.
- [ ] Cierre del lote con toda la suite en chromium (toca el layout y los estilos globales).

### Tarea 6: L5, duplicados

**Archivos:** `prose/media.ts`, `workbench/data.ts`, `gallery/data.ts`, `scenes/intro.ts`, `home/Bench.tsx`, `src/utils/posts.ts` y sus 11 llamadores, `src/app/api/rss/route.ts`, `blog/posts.ts`, `work/cases.ts`, `src/utils/motion.ts` (nuevo), `prose/CopyLink.tsx`, `blog/CopyPostLink.tsx`, `workbench/useCopied.ts` (nuevo); pruebas en `tests/unit/`.

**Interfaces que se crean:**
- `mediaSize(src: string, fallback?: { width: number; height: number })` en `prose/media.ts`
- `BLOG_DIR`, `WORK_DIR: string[]` y `byNewest(a, b)` en `src/utils/posts.ts`
- `prefersReducedMotion(): boolean` en `src/utils/motion.ts`
- `useCopied(ms: number)` en `workbench/useCopied.ts`

- [ ] **Fijar el comportamiento antes de mover.** En `tests/unit/workbench-media.spec.ts`, una prueba que recorre `images[0]` de todos los MDX y las piezas de la galería, y exige las medidas exactas de hoy, incluido el 2400×1357 de reserva de las portadas. Debe pasar sobre BASE.
- [ ] **Una sola tabla de tamaños.** Borrar `COVER_SIZE`, fundir `SIZE` en `MEDIA_SIZE`, `data.ts` usa `mediaSize(src, DEFAULT_COVER)`. Antes, comprobar que ningún `images:` termina en `.gif`, e importar `isImage` de `prose/media`. La prueba sigue en verde. Commit.
- [ ] **`findIntro`.** `Bench.tsx` importa `findIntro` e `introLeaving` de `scenes/intro`. Cierre con `home-workbench` e `intro-font`. Commit.
- [ ] **Lectura de posts.** Prueba unitaria de `byNewest` primero. Después `BLOG_DIR`, `WORK_DIR` y `byNewest` en los 11 llamadores y las 3 copias. `getPosts` sigue recibiendo la carpeta como parámetro. Comparar `.nft.json` con BASE: si alguna función crece, volver al literal en esa llamada. Commit.
- [ ] **`prefersReducedMotion`.** Las 7 lecturas puntuales. Los `matchMedia` con listener se quedan. No importar `scenes/start.ts` desde el layout. `motion` en chromium y mobile-chromium. Commit.
- [ ] **`useCopied`.** Conservar 1800 y 2000 ms y el mensaje de fallo que solo tiene uno. Si el JS de `/work/[slug]` o `/blog/[slug]` sube, se descarta este paso y se anota. Commit.

### Tarea 7: L6, `GlassController` en tres módulos (D78)

**Archivos:** `src/components/glass/GlassController.tsx`, `src/components/glass/tone.ts` y `lens.ts` (nuevos); una prueba en `tests/e2e/motion.spec.ts`.

- [ ] **Fijar antes.** Prueba en chromium: tras desplazarse sobre una sección oscura y una clara, se fijan los atributos que el controlador escribe en la píldora y el `backdrop-filter` con `url(#lg-pill)`. Debe pasar sobre el código actual.
- [ ] Mover sin cambios `toneAt`, `readTone` y sus colores a `tone.ts`, y `drawLensMap` y `lensFor` a `lens.ts`. Solo cambian `import` y `export`.
- [ ] `motion`, `axe-themes` y la prueba nueva en chromium; `look-gate.mjs --paths /,/work/leadbot-ai` con 0 diferencias.
- [ ] Commit: `refactor(glass): tone and lens in their own modules, moved as they were`

### Tarea 8: L7, CSS por ruta (D77)

**Archivos:** `next.config.mjs` (solo `experimental` y su comentario).

- [ ] Cambiar a `cssChunking: false` y reescribir el comentario con la causa medida: `strict` deja que un chunk de menos de 30 KB absorba módulos de otras rutas hasta 100 KB.
- [ ] Comprobar que `git diff next.config.mjs` no toca `csp` ni las cabeceras.
- [ ] `look-gate.mjs` completo y `--walks`: 0 diferencias.
- [ ] Batería completa en los 4 motores.
- [ ] Commit: `perf(css): no CSS chunk merging, each route loads only its own stylesheets`

### Tarea 9: L8, documentación, scripts y configuración

**Archivos:** `docs/README.md` (nuevo), `README.md`, `biome.json`, `.gitignore`, `tsconfig.json`, `scripts/media/apply-image-renames.mjs`.

- [ ] `docs/README.md`: el inventario de documentos con su estado (`vigente`, `histórico`, `obsoleto`, solo marcados), la tabla de scripts y el orden build → `tsc`. Se conserva todo `docs/design/rediseno-2026/`; no se edita `validacion-confidencial.md`. Los `perf-*.md` no se mueven porque los cita el código.
- [ ] `README.md`: enlace a `docs/README.md`.
- [ ] `biome.json`: `files.ignore` con `.next`, `test-results`, `.claude`, `public`. `biome format .` sin `--write` ya no recorre esas carpetas y `biome check src` sigue igual.
- [ ] `.gitignore`: quitar `/.pnp`, `.pnp.js`, `.yarn/install-state.gz`, `/coverage`, `/out/`, `/build`, `yarn-debug.log*`, `yarn-error.log*` y la línea redundante `security-audit.local.md`. Se quedan `*.pem` y `*.local.md`.
- [ ] `tsconfig.json`: quitar `typeRoots`. `allowJs` se queda: `next build` lo vuelve a escribir.
- [ ] `git rm scripts/media/apply-image-renames.mjs`. `image-renames.json` se queda: lo lee `image-refs.spec.ts`.
- [ ] Cierre del lote; `git status` limpio tras el build, para confirmar que Next no reescribió `tsconfig.json`.
- [ ] Commit: `docs: an index of docs and scripts; config without leftovers`

### Tarea 10: L9, archivos de `public/` (D80)

**Archivos:** los 9 de la lista aprobada, `scripts/media/optimize-videos.mjs:42`.

- [ ] `git rm` solo de los archivos aprobados y quitar la entrada de `video-01.mp4` en `optimize-videos.mjs`.
- [ ] `no-broken-images` en chromium y `image-refs.spec.ts`.
- [ ] Commit: `chore(public): files of a case that no page serves`

### Tarea 11: revisión única

- [ ] `superpowers:requesting-code-review` con un subagente sobre `032a634a..HEAD`: el código, sin mis conclusiones.
- [ ] `superpowers:receiving-code-review`: una sola ronda de arreglos, sin re-revisión.

### Tarea 12: L10, ramas y worktrees (D81)

- [ ] `ListAgents`: ninguna sesión viva trabajando en lo que se va a quitar.
- [ ] `git worktree remove <ruta>` sin `--force`, solo los aprobados; `seo/.claude/worktrees/merge-seo` antes que `seo`. Si Git se niega, se deja y se reporta.
- [ ] Si se aprueba mover las capturas: mover `docs/design/screens/`; en `rediseno` y `sobrio`, quitar primero la unión con `(Get-Item <ruta>\node_modules).Delete()`, para no borrar nunca a través de ella.
- [ ] `git branch -d` solo de las aprobadas, ejecutado desde este worktree.
- [ ] `git fetch origin main:main`: avance rápido de la `main` local, sin reescribir nada.
- [ ] `rmdir .claude/worktrees/merge-carga` (vacía y sin registrar).

---

### Tarea 13: puerta (Fase 3)

Sobre el último commit de código y frente a BASE, con dos builds de copias LF y `next start` en 3100 (rama) y 3200 (BASE).

- [ ] **1.** `npx tsc --noEmit`, `npm run lint`, `npm run build`: 0 errores y ningún aviso nuevo (5 de `no-img-element` en BASE).
- [ ] **2.** `npx @biomejs/biome check src` con código 0; `node scripts/quality/biome-gate.mjs 032a634a` OK.
- [ ] **3.** `battery.sh`: 0 fallos y no más de 50 omitidas. Una prueba que falle se repite sola: 3 de 3 es inestable y se reporta con su nombre; si no, es un fallo.
- [ ] **4, 5 y 6.** Control negativo con `--eval-b`, que debe fallar. Luego `look-gate.mjs --a :3200 --b :3100 --walks`: texto, huella, píxeles (0,1 % como máximo por captura), `<head>`, chatbot, contraseña y pasada con movimiento. No existe un menú móvil aparte: la píldora se compara a 390 px. Cabeceras con `prod-headers.mjs` sobre las dos builds locales.
- [ ] **7.** `lh-gate.sh 5 3200 3100 gate`. La mediana de Performance no baja más de 2 puntos en ninguna de las 4 páginas, CLS máximo por debajo de 0,01 y SEO 100. Si `/work` cae en su modo bajo, 7 rondas más: es bimodal en las dos builds.
- [ ] **8.** `compare-measure.mjs`: JS de primera carga, CSS y `.nft.json`, según lo que Erick decida en D74 y D77.
- [ ] Anotar los resultados en `limpieza-encargo.md`. Después de la puerta solo puede cambiar ese archivo. Si un arreglo cambia código, se repiten los puntos 1 a 3 y los afectados.

### Tarea 14: publicación (Fase 4)

Erick autorizó publicar si la puerta pasa completa. Si falla algo que no se pueda arreglar, se reporta y no se publica.

- [ ] `git fetch`. Si `origin/main` ya no es BASE, incorporar esos commits, avisar a Erick y repetir la puerta contra el nuevo `origin/main`.
- [ ] Merge `--no-ff` en un worktree temporal del scratchpad y `git push origin HEAD:main`, **una sola vez**. Quitar el worktree temporal.
- [ ] Si lo deniegan: no reintentar por otra vía ni pedírselo a otra sesión. Pedirle a Erick que escriba en esta sesión «autorizo el deploy a producción», o darle el comando exacto.
- [ ] En `https://www.erickmahecha.com`: Vercel en `success` para ese commit; `/api/og/generate` 200 `image/png`; `/api/rss` 200 `application/xml`; `seo.spec.ts` en chromium con `E2E_BASE_URL`; todas las URL del sitemap en 200; cabeceras iguales a la captura de la Fase 1; CSS enlazado en la Home como en el build local.
- [ ] Sin estado de Vercel en 3 minutos: avisar a Erick. Producción rota: avisarle de inmediato y proponer `git revert -m 1 <merge>`.
- [ ] Informe final y nota de memoria. El worktree `limpieza` se conserva hasta que Erick lo dé por cerrado.

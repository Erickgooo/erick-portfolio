# Ronda 11: limpieza del repo (Erick, 2026-11-06)

Encargo de Erick (vía Lyra): auditar, limpiar y optimizar todo el repo sin cambiar nada de lo que ve el visitante, y publicar si pasa la puerta completa.

- **Rama:** `chore/limpieza-repo` (worktree `.claude/worktrees/limpieza`), creada desde `origin/main`.
- **BASE y punto de regreso:** `032a634a3443bad843b69be0f25fd93bd461e654`.
- **Plan:** `docs/superpowers/plans/2026-11-06-limpieza-repo.md`.
- **Estado:** Erick aprobó las decisiones y todos los lotes el 2026-11-06, en la sesión de trabajo. Fase 2 en curso.
- **Fuera de alcance:** cambios visibles, textos, diseño, funciones nuevas, URL, metadatos SEO, reescribir el historial, Vercel y DNS, y la tabla de propuestas de `seo-encargo.md`.

## Resumen

71 hallazgos: 6 de prioridad 1, 18 de prioridad 2 y 47 de prioridad 3.

| Área | Hallazgos | P1 | P2 | P3 |
|---|---:|---:|---:|---:|
| Código | 25 | 1 | 7 | 17 |
| Configuración | 13 | 0 | 3 | 10 |
| Estilos | 9 | 1 | 2 | 6 |
| Rendimiento | 6 | 1 | 2 | 3 |
| Dependencias | 4 | 1 | 1 | 2 |
| Pruebas | 4 | 0 | 0 | 4 |
| Documentación | 3 | 1 | 2 | 0 |
| Scripts | 3 | 0 | 0 | 3 |
| `public/` | 3 | 1 | 0 | 2 |
| Ramas y worktrees | 1 | 0 | 1 | 0 |

De esos 71, 39 caen en un lote, 10 son propuestas que no se aplican y 22 no piden acción: se revisó el punto y no había nada que ganar.

**Lo que más se encontró es poco y concreto.** No hay `any` ni `@ts-ignore`, los 30 `"use client"` son necesarios, no hay clases CSS muertas, no hay `@keyframes` sin uso, ninguna librería pesada llega al cliente y los listeners ya están bien resueltos. Los restos de las rondas anteriores son sobre todo exportaciones, props sin llamador, tablas repetidas y 2 dependencias.

## Línea base (BASE, build local, 2026-11-06)

**JS y CSS de primera carga.** Medida propia: unión de los chunks raíz, de layout y de página, en bytes gzip. La columna del build es la que imprime `next build`, que cuenta distinto.

| Ruta | JS (B) | CSS (B) | «First Load JS» del build |
|---|---:|---:|---:|
| `/` | 154.065 | 56.171 | 130 kB |
| `/about` | 143.231 | 43.472 | 117 kB |
| `/work` | 140.308 | 43.641 | 116 kB |
| `/work/[slug]` | 153.040 | 51.634 | 130 kB |
| `/work/incentiva-group` | 142.947 | 45.952 | 114 kB |
| `/blog` | 140.297 | 45.040 | 116 kB |
| `/blog/[slug]` | 144.484 | 45.981 | 121 kB |
| `/gallery` | 144.734 | 46.019 | 121 kB |
| `/unauthorized` | 141.550 | 26.811 | 113 kB |
| `/_not-found` | 139.434 | 26.811 | 103 kB |

| Medida | Valor |
|---|---|
| CSS total | 14 archivos, 381.263 B crudos, 65.988 B gzip |
| JS total en `static/chunks` | 40 archivos, 331.232 B gzip |
| Funciones (`.nft.json`) | 23 archivos, 41.105.657 B en total. La mayor: `/api/og/generate`, 139 archivos y 3,7 MiB |
| Dependencias | 12 directas, 9 de desarrollo, 637 paquetes en el lock |
| `src` | 296 archivos; líneas: `.scss` 18.491, `.tsx` 12.084, `.ts` 3.202, `.mdx` 1.608, `.css` 434 |
| `public/` | 113 archivos, 67.606.635 B |

**Batería completa** (unit más 4 motores, puerto 3100, `--workers=2`, optimizador precalentado con 575 URL y 0 fallos):

- unit: 32 de 32;
- e2e: **698 pasan, 50 se omiten, 0 fallan**, en 13,0 minutos. Chromium 184 y 3 omitidas, mobile-chromium 176 y 11, Firefox 171 y 16, WebKit 167 y 20.

**Calidad:** `biome check src` con código 0 y 2 avisos, los dos en `FaqChatbot.tsx`. `next lint` y `next build` con los mismos 5 avisos `no-img-element`.

**Cabeceras de seguridad de producción:** capturadas en las 26 URL del sitemap, `/unauthorized` y una URL inexistente. Hay un solo juego de valores en las 28, con 200 en todas salvo la inexistente (404).

**`npm audit`:** el informe está fuera de git, en `security-audit.local.md`, porque el repo es público y `.gitignore` pide no publicarlo.

**`graphify-out/`** refleja el checkout raíz, en `lab/rediseno-2026`. No sirvió para esta auditoría: todo se comprobó en el código de BASE.

## Decisiones

- **D73. Método de la auditoría.** Primero herramientas (knip, depcheck, Biome y un script que compila los 64 módulos Sass y cruza clases, tokens y referencias), luego tres auditores de solo lectura por área, y por último medición en copias temporales de lo que iba a proponerse. Tres conclusiones de los auditores cambiaron al medir: ver D76, D77 y D82.

- **D74. Parche de `next` (Erick: sí, 2026-11-06).** `next` y `eslint-config-next` de 15.5.27 a 15.5.29 y `overrides.sharp` a `^0.35.5`, como lote propio. Es un parche, no un salto de versión mayor.
  - Medido solo: +74 a +92 B de JS por ruta, +8 B de CSS gzip, cerca de +1 KB por función en `.nft.json`, misma lista de rutas.
  - **Choca con la letra del punto 8 de la puerta,** que pide que ninguna función crezca: ese KB son archivos del propio Next y ningún cambio del repo lo compensa. Erick lo aceptó como excepción explicada. Lo de JS sí queda compensado por D76.

- **D75. Quitar `@next/mdx` y `@mdx-js/loader`.** No hay ningún `page.mdx` ni import de `.mdx`: los 20 MDX los leen `gray-matter` y `next-mdx-remote`. Sale `withMDX` y `pageExtensions` de `next.config.mjs`, sin tocar la CSP ni las cabeceras. Medido: 2 dependencias directas menos, misma lista de rutas (27), ninguna función crece, +4 B de JS.
  - `sharp` no se agrega a `devDependencies` aunque lo importe una prueba: el encargo no permite agregar dependencias.

- **D76. Una anotación pura en vez de reorganizar el barril.** El barril `@/resources` metía los datos de About e Incentiva en el JS del layout, es decir, en todas las rutas.
  - La auditoría proponía cambiar los imports de `Header` y `RouteGuard`, y `RouteGuard` está protegido. La alternativa de sacar `about` del barril tampoco sirve: lo importa `src/app/api/chatbot/prompt.ts`.
  - **La causa es una sola línea:** `INCENTIVA_AREAS.flatMap(...)` en `incentiva.ts:346`, la única llamada de nivel superior que impedía descartar esos datos. Con `/*#__PURE__*/` se resuelve.
  - Medido: **−2.987 a −3.000 B de JS en todas las rutas**, 0 cambios en CSS, ninguna función crece (−99.923 B en total) y los datos desaparecen del chunk del layout.

- **D77. `cssChunking: false` (Erick: sí, 2026-11-06).** Es el cambio con más efecto de la ronda, y también el que más hay que vigilar.
  - **Causa, leída en `css-chunking-plugin.js` de Next:** en modo `strict`, un chunk de menos de 30 KB puede absorber módulos de otra ruta y seguir creciendo hasta 100 KB. Los 11 KB de CSS que necesita el layout arrastraban unos 90 KB de escenas a todas las páginas, incluida la 404. La hipótesis de la auditoría (orden de imports) quedó refutada: ver D82.
  - **Efecto medido en el CSS de primera carga, con D76 aplicado:**

    | Ruta | Antes (B gzip) | Después (B gzip) | Cambio |
    |---|---:|---:|---:|
    | `/` | 56.171 | 26.093 | −54 % |
    | `/about` | 43.472 | 15.186 | −65 % |
    | `/work` | 43.641 | 12.591 | −71 % |
    | `/work/[slug]` | 51.634 | 36.835 | −29 % |
    | `/work/incentiva-group` | 45.952 | 15.035 | −67 % |
    | `/blog` | 45.040 | 13.571 | −70 % |
    | `/blog/[slug]` | 45.981 | 16.236 | −65 % |
    | `/gallery` | 46.019 | 17.180 | −63 % |
    | `/unauthorized` | 26.811 | 12.510 | −53 % |
    | `/_not-found` | 26.811 | 10.784 | −60 % |

  - **Coste:** el CSS total en disco sube de 381.263 a 479.526 B crudos (+26 %) y de 65.988 a 84.448 B gzip, porque algunos módulos se repiten en varias hojas. Alguien que recorra casi todo el sitio puede acabar bajando hasta 18 KB más en total, a cambio de una primera carga mucho menor. **Esto incumple la letra del punto 8 («el CSS total no sube»):** Erick aprobó medir el CSS de primera carga por ruta, que es lo que recibe cada visitante.
  - **Aspecto, contra BASE, con la herramienta de la puerta:** 172 comparaciones (112 de página en 2 viewports y 2 temas, 4 de chatbot abierto, 56 de `animation-*` y `transition-*` sin movimiento reducido) y 90 más en navegación interna (88 pasos de 3 recorridos, en los que las hojas se acumulan de 8 a 11 sin recargar el documento, y 2 de contraseña incorrecta). **0 diferencias** de texto, `<head>` y estilos; 0,0010 % de píxeles en el peor caso.
  - **Lighthouse móvil no mejora, y conviene no prometerlo:** Home 87 → 87, `/about` 87 → 87, `leadbot-ai` 85 → 85 (3 rondas intercaladas) y `/work` 88 → 88 (7 rondas). CLS igual y SEO 100. `/work` dio 88 → 76 en la primera tanda de 3 rondas; con 7 rondas, las dos builds tienen un solo 75: es la bimodalidad ya conocida. La ganancia es de bytes de CSS que bloquean el render en redes y móviles reales, y eso no lo he medido en un dispositivo.
  - **Sin comprobar todavía:** el build de Linux de Vercel. Se revisa tras el push. Para volver atrás basta una línea.

- **D78. Partir `GlassController.tsx` (Erick: sí, 2026-11-06).** Sus 516 líneas mezclan tres trabajos ya rotulados en el archivo: tono, lente y componente. Se sacan `tone.ts` y `lens.ts` moviendo el código tal cual. Riesgo medio por lo delicado de la lente, sin ganancia para el visitante. Es el único módulo grande que lo justifica: `SceneDriver`, `IntroLoader` y los archivos de datos son un solo motor o datos.

- **D79. Configuración apagada (Erick: sí, 2026-11-06).** 5 plataformas en `false` en `sharing.on` con su tabla, `sharing.enabled` y `headerShows`, siempre iguales. Se quitan: nada visible cambia y siguen en git si algún día hacen falta. `enabledRoutes` se queda porque lo lee `RouteGuard`.

- **D80. Archivos de `public/` (Erick: sí, 2026-11-06).** Ver «Archivos de public/». Pueden tener enlaces externos, así que no se borra nada sin su aprobación con nombres.

- **D81. Ramas y worktrees (Erick: sí, 2026-11-06).** Ver «Ramas y worktrees».

- **D82. Lo que se midió y se descartó.**
  - **404 diferida con `next/dynamic`** desde `src/app/not-found.tsx`: −0,37 KB de CSS en las rutas de contenido, +0,39 KB en `/unauthorized`, +1,2 KB de JS total y riesgo de parpadeo en la 404. La hipótesis del auditor era de 13 a 30 KB. No compensa.
  - **Alarma sobre `tsconfig.json`:** `tsc` no recorre `.claude/worktrees` (0 archivos con un `.ts` puesto ahí a propósito).
  - **Centralizar bloques repetidos de SCSS:** salen del mixin `reveal`. Como mucho ahorran 1,2 KiB gzip y moverían reglas entre chunks.
  - **Abstraer `IntersectionObserver`:** los 8 usos difieren en opciones y ciclo de vida.
  - **`engines.node` en `package.json`:** puede cambiar la versión de Node en Vercel.
  - **Quitar `allowJs` de `tsconfig.json`:** `next build` lo vuelve a escribir.
  - **Props de Once UI en los MDX:** es contenido y no se gana nada.

- **D83. La puerta, ya escrita.** `look-gate.mjs` compara dos builds en todas las URL, a 1280 × 900 y 390 × 844, en claro y oscuro, con movimiento reducido y videos en pausa. Nunca escribe ni abre capturas: compara los píxeles en memoria.
  - **Control negativo, porque una herramienta que nunca falla no prueba nada:** un `cursor` distinto en los enlaces (invisible) marca 140 elementos y 0 píxeles; una palabra de más hace fallar el texto y el título; 1 px de margen en los párrafos marca 57 elementos y todas las medidas de la página. Sin alterar nada, 0 diferencias.
  - **Añadidos al encargo:** recorridos de navegación interna y contraseña incorrecta.
  - **No existe un menú móvil aparte:** la píldora se compara a 390 px.
  - **Punto 8, ajustado por Erick:** se acepta el KB por función que suma Next (D74) y se mide el CSS de primera carga por ruta en vez del total en disco (D77).

## Lotes

Se ejecutan en este orden, solo los aprobados. El detalle está en el plan.

| Lote | Qué | Riesgo | Efecto medido o esperado |
|---|---|---|---|
| L0 | Parche de `next` (D74) | bajo | +90 B de JS por ruta, +1 KB por función |
| L1 | Quitar `@next/mdx` y `@mdx-js/loader` (D75) | bajo | 2 dependencias menos |
| L2 | Anotación pura en `incentiva.ts` (D76) | bajo | −3 KB de JS en todas las rutas |
| L3 | Exportaciones y tipos sin uso | bajo | ninguno en el bundle |
| L4 | Props, entradas MDX, configuración apagada, tokens, mixins, comentarios, barril de componentes | bajo | pequeño |
| L5 | Duplicados: tablas de tamaños, `findIntro`, lectura de posts, movimiento reducido, copiar enlace | medio | pequeño; la lectura de posts vigila `.nft.json` |
| L6 | `GlassController` en tres módulos (D78) | medio | ninguno para el visitante |
| L7 | `cssChunking: false` (D77) | **alto** | −29 a −71 % de CSS de primera carga |
| L8 | `docs/README.md`, `biome.json`, `.gitignore`, `tsconfig.json`, un script cumplido | bajo | ninguno en el sitio |
| L9 | 9 archivos de `public/` (D80) | medio | −7,9 MB en el repo; 0 para el visitante |
| L10 | Ramas y worktrees (D81) | medio | solo disco local |

Ahorro total esperado: **unos 3 KB de JS por ruta y de 14 a 31 KB de CSS por ruta**. Fuera de L7 apenas hay más CSS que ganar: los tokens muertos son 0,3 KiB.

## Propuestas para Erick

No se aplican: tocan zonas protegidas o cambian algo. Aparte queda la tabla pendiente de `seo-encargo.md`.

| Tema | Propuesta | Por qué no se aplica |
|---|---|---|
| Chatbot | Cargar `faqData` con `import()` al abrir el panel. Ahorro estimado de 2 a 3 KiB gzip, sin medir | Chatbot intocable; puede cambiar el tiempo del saludo |
| Chatbot | Quitar `backButtonLabel`, que nadie lee, y resolver los 2 avisos de Biome en `FaqChatbot.tsx` | Chatbot intocable; cambiar esas dependencias cambia cuándo corre el efecto |
| `RouteGuard` | Si `enabledRoutes` nunca se apaga, `RouteGuard`, `routeEnabled` y el flag pueden irse juntos | Zona protegida |
| Comentario de la CSP | Quitar la mención a Mailchimp | Zona protegida, aunque sea un comentario |
| Lente | Cargar `drawLensMap` con `import()`. Ahorro estimado de 1 a 1,5 KiB gzip | Cambia cuándo se dibuja la lente |
| Checkout raíz | Pasarlo a `main` y regenerar el grafo, que hoy describe una rama vieja | Hay archivos sin seguimiento en la raíz |
| `next lint` | Migrar a ESLint CLI al subir a Next 16 | Salto de versión mayor |
| `perf-report.md` | Traer a `main` los commits `c487be8` (`perf/carga-2026`) y `f013b91` (`perf/home-load`), que solo agregan notas a ese archivo | Es decisión de Erick; sin eso, esas ramas deben quedarse |
| `CLAUDE.md` y `.claude/settings.json` | Decidir si deben estar en un repo público | Son herramientas locales, sin secretos |

## Archivos de public/

Total: 113 archivos, 67.606.635 B. `images/gallery` 25,3 MB, `images/projects` 22,0 MB, los 4 `videohome*.mp4` de la raíz 19,6 MB. Sin referencias rotas. Se trabajó solo con ruta, tipo y tamaño.

**Aprobado por Erick: se borran 9 archivos, 7.938.573 B.** Ninguna página los sirve, pero siguen accesibles por URL y pueden tener enlaces externos. Salen de `public/images/projects/project-01/`:

| Archivo | Bytes | Quién lo nombra |
|---|---:|---|
| `video-01.mp4` | 7.304.559 | `scripts/media/optimize-videos.mjs:42`, cuya entrada se quita con él, y documentos de rendimiento |
| `avatar-01.webp` | 128.748 | `scripts/media/image-renames.json` |
| `cover-02.webp` | 94.478 | `image-renames.json` |
| `image-02.webp` | 92.086 | `image-renames.json` |
| `image-01.webp` | 87.330 | `image-renames.json` |
| `cover-01.webp` | 67.050 | `image-renames.json` |
| `cover-04.webp` | 64.672 | `image-renames.json` |
| `cover-03.webp` | 55.502 | `image-renames.json` |
| `image-03.webp` | 44.148 | `image-renames.json` |

`image-renames.json` se queda: lo lee `tests/unit/image-refs.spec.ts`, que solo comprueba que el JSON exista y que nadie use las rutas viejas. Borrar esos destinos no rompe la prueba.

**Sin referencia real, y se quedan:** `videohome.mp4` (3.611.663 B), por decisión de Erick, y `images/projects/incentiva-brand/incentiva_medalla_m1-azul-cian.svg` (1.176 B), la fuente que cita el comentario de `IncentivaMedal.tsx`.

## Ramas y worktrees

Inventario del 2026-11-06. «En `main`» quiere decir antepasado de BASE.

### Worktrees

**A. Propuestos para quitar. Limpios, con todo en `main` (16):**

`carga-base`, `main-base`, `t2-base`, `merge-ajustes-cv-marcas`, `merge-cv-estrategico`, `merge-mensaje-impacto`, `merge-posicionamiento`, `merge-stage`, `merge-video-about`, `incentiva-ajustes`, `incentiva-ronda3`, `mensaje-impacto`, `seo/.claude/worktrees/merge-seo` (primero este), `seo`, `sin-once-ui`, `video-about`.

**B. Propuestos para quitar. Limpios, con commits fuera de `main` que se conservan en su rama (2):**

| Worktree | Rama | Fuera de `main` |
|---|---|---|
| `incentiva` | `feat/incentiva-2026` | 1 commit, de contenido ya equivalente en `main` |
| `perf-quick-wins` | `perf/quick-wins` | 32 commits, también en el remoto |

**C. Tienen capturas sin seguimiento en `docs/design/screens/` (9).** `git worktree remove` sin `--force` se niega a quitarlos, y las capturas existen solo aquí. Erick aprobó moverlas a `C:SERSTH1AG0DOCUMENTSMAGIC-PORTFOLIO-CAPTURAS` Y QUITAR DESPUéS ESTOS WORKTREES. **Capturas en total: unos 2,6 GB.**

| Worktree | Capturas | `node_modules` | Nota |
|---|---:|---|---|
| `pulido-animaciones` | 1,5 GB | carpeta | |
| `carga` | 623 MB | carpeta | `perf/carga-2026` tiene 1 commit fuera de `main`; la rama se queda |
| `sobrio` | 216 MB | **unión** | quitar la unión primero, nunca borrar a través de ella |
| `rediseno` | 71 MB | **unión** | igual |
| `liquid-glass` | 54 MB | carpeta | |
| `posicionamiento` | 43 MB | carpeta | |
| `cv-estrategico` | 18 MB | carpeta | |
| `ajustes-cv-marcas` | 17 MB | carpeta | |
| `marcas-escenario` | 9,3 MB | carpeta | |

**No se proponen:**
- `limpieza`: el de esta ronda, hasta que Erick la dé por cerrada.
- El checkout raíz.
- Los 9 de fuera de `.claude/worktrees`, que pueden ser de otras sesiones vivas: 4 en `~/.claude/jobs/0010046f/tmp` (`base-577`, `base-c17`, `branch-ajustes`, `branch-out`; `branch-ajustes` tiene 4 cambios sin commit) y 5 en carpetas temporales de sesiones (`branch-check` y dos `main-base`, con unos 390 archivos marcados como borrados; `branch-d7f` y `main-86a`, con registros sin seguimiento).

**Además:** `.claude/worktrees/merge-carga` es una carpeta vacía y sin registrar: se puede quitar con `rmdir`.

**Disco:** una carpeta `node_modules` medida ocupa 724 MB. A y B tienen 10, así que recuperan unos 8 GB. C recuperaría unos 5 GB más.

### Ramas locales (28)

**Propuestas para borrar con `git branch -d` (17, todas en `main`):**
- Sin worktree: `feat/home-type-motion`, `restore/sep-27`, `security/hardening`.
- Tras quitar su worktree del grupo A: `feat/incentiva-ajustes`, `feat/incentiva-ronda3`, `feat/mensaje-impacto`, `feat/seo-tecnico`, `feat/sin-once-ui`, `feat/video-about-calidad`.
- Solo si se quita su worktree del grupo C: `feat/ajustes-cv-marcas`, `feat/cv-estrategico`, `feat/liquid-glass`, `feat/marcas-escenario`, `feat/posicionamiento-2026`, `feat/pulido-animaciones`, `feat/rediseno-workbench`, `feat/wb-sobrio`.

**Se quedan (11):**

| Rama | Fuera de `main` | Remoto | Por qué |
|---|---:|---|---|
| `main` | 0 (28 por detrás) | sí | se actualiza por avance rápido |
| `chore/limpieza-repo` | esta ronda | no | |
| `lab/rediseno-2026` | 14 | no | checkout raíz; nunca se fusiona |
| `feat/apple-pass` | 23 | sí | trabajo rechazado, único |
| `perf/quick-wins` | 32 | sí | trabajo único |
| `lab/apple-directions` | 4 | sí | trabajo único |
| `lab/hero-figures` | 2 | **no** | solo existe aquí |
| `lab/home-variants` | 1 | sí | trabajo único |
| `perf/carga-2026` | 1 | sí | notas en `perf-report.md` que `main` no tiene |
| `perf/home-load` | 1 | **no** | solo existe aquí; notas en `perf-report.md` |
| `feat/incentiva-2026` | 1, equivalente en `main` | no | `-d` se niega, y el encargo no permite forzar |

Las 11 ramas viejas del remoto no se tocan: borrarlas sería empujar al repo.

## Inventario de documentos

Base del futuro `docs/README.md`. No se propone borrar ninguno: viven en git y el índice ya los marcará. Los `perf-*.md` no se mueven porque los cita el código.

| Ruta | Qué es | Estado |
|---|---|---|
| `docs/design/rediseno-2026/README.md` | Fase 2 «Workbench» en todo el sitio: orden, lo que se conserva, reglas heredadas y decisiones numeradas. El documento maestro de decisiones. 51 KB. | vigente (no tocar) |
| `docs/design/rediseno-2026/workbench-propuesta.md` | Notas de la propuesta C «Workbench» tal como se construyo en el lab (idea, paleta, tipo, mapa). Lo cita el README. | vigente |
| `docs/design/rediseno-2026/lab-contrato.md` | Contrato del lab 2026 (3 propuestas, gramática de movimiento, patrones prohibidos, regla de medios). El README dice que sigue aplicando. | vigente |
| `docs/design/rediseno-2026/escenas-encargo.md` | Encargo 2026-10-22: escenas animadas con código. | vigente (historial de decision) |
| `docs/design/rediseno-2026/sobrio-encargo.md` | Encargo 2026-10-22: Workbench sobrio; llevó al estilo A en producción. | vigente (historial de decision) |
| `docs/design/rediseno-2026/pulido-animaciones.md` | Pulido de animaciones 2026-10-25; lo cita una prueba. 29 KB. | vigente |
| `docs/design/rediseno-2026/liquid-glass-encargo.md` | Encargo 2026-10-25: Liquid Glass en la capa flotante. | vigente (historial de decision) |
| `docs/design/rediseno-2026/tool-logos.md` | Muro de logos de herramientas; lo cita `scripts/perf/tool-logos.mjs`/pruebas. 34 KB. | vigente |
| `docs/design/rediseno-2026/incentiva-encargo.md` | Ronda: Incentiva Group en el portafolio (2026-11-02); lo cita `incentiva.spec`. | vigente |
| `docs/design/rediseno-2026/ajustes-cv-marcas-encargo.md` | Ronda 6: CV, marcas, muro, héroe (2026-11-03); lo cita su spec. | vigente |
| `docs/design/rediseno-2026/cv-estrategico-encargo.md` | Ronda 7: CV con resultados, sin «285», Colmaíz oscuro (2026-11-03); lo cita su spec. | vigente |
| `docs/design/rediseno-2026/posicionamiento-encargo.md` | Posicionamiento «Growth & AI Systems Lead» (2026-11-03). | vigente |
| `docs/design/rediseno-2026/validacion-confidencial.md` | Lista de validacion confidencial (2026-11-03). No se leyó ni se edita. | vigente (no tocar) |
| `docs/design/rediseno-2026/mensaje-impacto-encargo.md` | Ronda 8: mensaje, impacto y SEO (2026-11-04); lo cita su spec. | vigente |
| `docs/design/rediseno-2026/video-about-encargo.md` | Ronda 9: video de About con más calidad (2026-11-05). | vigente |
| `docs/design/rediseno-2026/seo-encargo.md` | Ronda 10: SEO tecnico y metadatos (2026-11-05); en producción (`032a634`). | vigente |
| `docs/perf-baseline.md` | Línea base de Lighthouse 12.8.2 en producción, 2026-09-26; citada desde `smoke.spec.ts`. | histórico (lo cita el código) |
| `docs/perf-report.md` | Informe de rendimiento Fase A «quick wins» (2026-09-26); citado desde `src/app/fonts.ts`. 50 KB. | histórico (lo cita el código) |
| `docs/superpowers/plans/2026-09-26-perf-quick-wins.md` | Plan 1 de 2: quick wins de rendimiento (WebP, videos, script de renombres). Se ejecutó. 90 KB. | histórico |
| `docs/superpowers/plans/2026-09-26-disruptive-redesign.md` | Plan 2 de 2 «disruptivo» Blueprint→Live System; 173 KB. Dirección rechazada en CP2. | obsoleto (dirección rechazada; sustituido por Workbench) |
| `docs/superpowers/specs/2026-09-26-disruptive-redesign-design.md` | Diseño de aquel rediseño (A «Blueprint»). | obsoleto (idem; la spec de landing-film lo «reemplaza») |
| `docs/superpowers/specs/2026-10-09-landing-film-home-design.md` | Diseño de la Home como landing con película de scroll; estado «pendiente de revisión», luego revertida el 2026-10-10. | obsoleto (revertida) |
| `docs/superpowers/plans/2026-10-09-landing-film-look-gate.md` | Plan A de la landing con película (puerta de aspecto). 66 KB. | obsoleto (revertida) |
| `docs/superpowers/plans/2026-10-09-landing-film-full-video.md` | Plan B1: la película recorre el video entero. | obsoleto (revertida) |
| `docs/superpowers/plans/2026-10-09-landing-film-closing.md` | Plan B2: cierre de la Home, limpieza y entrega. | obsoleto (revertida) |

## Pruebas omitidas

22 llamadas a `test.skip`, 0 `fixme`, todas condicionales y con motivo. Dan las 50 omitidas de la batería al multiplicarse por motores.

| Grupo | Motivo | Archivos |
|---|---|---|
| Solo escritorio / solo teléfono | etapa fijada, riel, reloj, textos laterales, stepper desde 1024 px, rueda del ratón, teléfono solo | `brand-stage.spec.ts:83,104,144`; `motion.spec.ts:133,145,180,287` |
| Solo Chromium | entradas `layout-shift` solo en Chromium; medición con emulacion de teléfono; comprobación de un botón con un motor basta | `cls.spec.ts:5`; `motion.spec.ts:144`; `mensaje-impacto.spec.ts:113`; `lazy-video.spec.ts:110` |
| WebKit | sin decodificador H.264 en Windows; Tab no llega a enlaces sin Full Keyboard Access; CSP quitada en webkit-localhost | `lazy-video.spec.ts:44,89`; `posicionamiento.spec.ts:147`; `ssr-content.spec.ts:42` |
| Plataforma | fotogramas de referencia solo en win32; bug de Next #57008 en Windows (corre en Linux/Vercel) | `intro-font.spec.ts:19,35`; `ssr-content.spec.ts:28` |
| Proyecto concreto | `hover:none` solo en `mobile-chromium`; descarga una sola vez en `chromium` | `a11y-names.spec.ts:50`; `seo.spec.ts:245` |
| Estado de la visita | la intro no se reprodujo en esta visita | `motion.spec.ts:80,100` |

## Hallazgos

`No aplica`: se revisó y no pide acción. `Propuesta`: ver «Propuestas para Erick». Las filas que se midieron después de la auditoría ya traen el resultado en su columna de propuesta.

| Área | Hallazgo | Archivo | Evidencia | Propuesta | Riesgo | Prioridad | Lote |
|---|---|---|---|---|---|---|---|
| dependencias | `next` y `eslint-config-next` van por detrás del último parche de 15.5. | `package.json`, `package-lock.json` | 15.5.27 frente a 15.5.29. Detalle de `npm audit` en `security-audit.local.md`, fuera de git porque el repo es público. | Subir ambos a 15.5.29 y `overrides.sharp` a `^0.35.5`. Medido: +74 a +92 B de JS por ruta y ~1 KB por función, de los propios archivos de Next (D74). | bajo | P1 | L0 |
| dependencias | `@next/mdx` y `@mdx-js/loader` se pueden quitar. Ningun `page.mdx` ni `import ... .mdx` en `src`/`tests`. Los 20 `.mdx` (4 posts, 16 casos) los lee `src/utils/posts.ts` con `gray-matter` y los renderiza `next-mdx-remote` (`src/components/workbench/prose/Prose.tsx`). `withMDX` solo envuelve la config. | `package.json`, `next.config.mjs:1-5,94,~118` | `find src -name "page.mdx*"` vacio; `grep -rn "import .* from .*\.mdx" src tests` vacio. En el lock, `@next/mdx` solo lo pide la raiz y `@mdx-js/loader` solo `@next/mdx`; `@mdx-js/mdx` se queda por `next-mdx-remote`. Los `.mdx` bajo `app/` no se vuelven rutas: solo lo son `page`/`route`/`layout` con extension permitida. | Quitar ambos paquetes, `createMDX`/`withMDX` y la linea `export default withMDX(nextConfig)` (pasa a `export default nextConfig`). `pageExtensions` con `md`/`mdx` puede quedarse (inocuo) o simplificarse. Comprobar: `next build` y que la lista de rutas del build sea identica; `npm ls @mdx-js/mdx`; la bateria e2e (sobre todo `seo.spec`, `ssr-content.spec`, `smoke.spec`). La CSP y las cabeceras no se tocan. Además `@next/mdx` está en 15.5.15 y `next` en 15.5.27 (desfase menor). | bajo | P2 | L1 |
| dependencias | `sharp` no esta en `dependencies`/`devDependencies`, pero lo importan `tests/unit/workbench-media.spec.ts:12`, `scripts/design/covers.mjs`, `scripts/media/optimize-*.mjs`. Hoy resuelve por ser dependencia opcional de `next` (lock: `node_modules/sharp` 0.35.5, `optional`), fijada por `overrides.sharp ^0.35.3`. | `package.json` | knip «Unlisted dependencies: sharp». `next` declara `optionalDependencies.sharp ^0.34.3 \|\| ^0.35.4`. | No aplicar: el encargo no permite agregar dependencias a `package.json`. `overrides.sharp` se queda, y sube a `^0.35.5` en L0. | bajo | P3 | No aplica |
| dependencias | Resto de dependencias: todas en uso. `transliteration` (`prose/source.ts`), `gray-matter` (`utils/posts.ts`, prueba unitaria), `react-icons` (Header, ThemeToggle, FaqChatbot y otros), `sass` (68 `.scss` + `sassOptions` en `next.config.mjs`), `@google/generative-ai` (`api/chatbot/route.ts`), `@vercel/analytics` (`layout.tsx`), `lighthouse` (`scripts/perf/lighthouse.mjs`), `@playwright/test` (pruebas y 6 scripts), `@biomejs/biome` (`scripts/quality/biome-gate.mjs:26` y `biome-write`), `eslint`+`eslint-config-next` (`next lint` + `.eslintrc.json`), `@types/react-dom` (tipos implicitos de `react-dom`). | `package.json` | knip y depcheck los dan como falsos positivos o sin evidencia; confirmado con grep. | No quitar ninguna. | bajo | P3 | No aplica |
| código | Tabla de tamaños de portadas `COVER_SIZE` duplicada: sus 6 entradas ya están en `MEDIA_SIZE` con las mismas medidas (0 conflictos, comprobado por script). Además hay otras 2 tablas manuales (`gallery/data.ts` `SIZE`, 19 entradas, 4 repetidas en `MEDIA_SIZE`, 0 conflictos) y `media.ts` `MEDIA` (whatsapp repetido). | `src/components/workbench/data.ts:10-17,79`; `src/components/workbench/prose/media.ts:9-42`; `src/components/workbench/gallery/data.ts:41-62` | `COVER_SIZE[coverSrc] ?? DEFAULT_COVER` solo en data.ts:79; `mediaSize()` ya devuelve lo mismo (el fallback `FALLBACK` es 1600x900, no 2400x1357: hay que conservar `DEFAULT_COVER` o añadir las entradas faltantes al llamar) | Borrar `COVER_SIZE` y usar `mediaSize(coverSrc)`; para rutas ausentes de `MEDIA_SIZE` mantener el 2400x1357 actual (`mediaSize` con fallback parametrizable). Fusionar `SIZE` de galería en `MEDIA_SIZE` (una sola tabla; la prueba `tests/unit/workbench-media.spec.ts` ya valida esa tabla contra los archivos). Sin cambio visible si las medidas siguen iguales. | bajo | P1 | L5 |
| código | `isImage` duplicado con regex distinta: `data.ts` no acepta `gif`, `prose/media.ts` sí. | `src/components/workbench/data.ts:47-49` vs `src/components/workbench/prose/media.ts:64-66` | grep `function isImage` = 2 resultados | Importar `isImage` de `prose/media` en data.ts. Si alguna portada fuera `.gif` cambiaría la elección de portada: no hay ninguna `.gif` en `images:` de los MDX (por confirmar con `grep gif src/app/**/*.mdx`). | bajo | P2 | L5 |
| código | `findIntro()` copiada: misma consulta `[class*="IntroLoader_overlay"]` y misma lógica "leaving" en dos módulos. | `src/components/workbench/home/Bench.tsx:111-117,119-121` vs `src/components/workbench/scenes/intro.ts:6-12` (`introLeaving`) | Selector idéntico en 2 archivos; Bench.tsx no importa `intro.ts` | Que Bench importe `findIntro` e `introLeaving` de `scenes/intro` (exportar `introLeaving`). Sin cambio visible. | bajo | P2 | L5 |
| código | Lectura de posts: la carpeta se repite como literal en 11 llamadas de `getPosts` (blog 5, work 6: `["src","app","blog","posts"]` / `["src","app","work","projects"]`) y la ordenación "más nuevo primero" está copiada 3 veces. | `src/app/api/rss/route.ts:31-36`; `src/components/workbench/blog/posts.ts:16-21`; `src/components/workbench/work/cases.ts:57-60`; literales en `app/blog/[slug]/page.tsx:16,32,47`, `app/work/[slug]/page.tsx:15,31,50`, `app/sitemap.ts:26-27`, `workbench/data.ts:52`, `gallery/data.ts:175`, `app/api/og/generate/route.tsx:37` | grep `getPosts(` = 15 usos; grep `getTime()` = 3 copias del mismo comparador | En `utils/posts.ts` añadir `BLOG_DIR`/`WORK_DIR` y `byNewest` (o `getBlogPosts()`/`getCaseStudies()`). Ojo con el trazado de Vercel: los literales deben seguir llegando a `getPosts` (la separación de `readPosts` no se toca; ver el aviso de trazado en este documento). Sin cambio visible. | medio | P2 | L5 |
| código | Props de `CanvasLoop` que nadie pasa: `threshold`, `paused`, `stillAt`, `style` (los 2 usos pasan solo `draw`, `afterIntro`, `onStart`, `className`). | `src/components/workbench/scenes/CanvasLoop.tsx:39-55,135,152`; usos `home/BenchAmbient.tsx:110`, `scenes/work/KioskScreen.tsx:258` | grep `<CanvasLoop` = 2 usos; ningún `stillAt=`/`paused=`/`threshold=` | Quitar las 4 props y sus ramas (`stillAt` en la rama de movimiento reducido, `paused` en el reloj). Sin cambio visible con los valores por defecto actuales. | bajo | P2 | L4 |
| código | Mapa MDX con entradas que ningún MDX usa: `Row`, `Table`/`DataTable` (27 líneas) y `table: TableWrap` (ningún MDX tiene tablas Markdown ni `<Table>`). Los MDX que usan `Column`, `Card`, `Grid`, `Text` llevan props de Once UI (`gap`, `onBackground`, `padding`, `radius`, `background`, `border`, `columns`, `s={{}}`, `fillWidth`, `marginBottom`) que los componentes ignoran. | `src/components/workbench/prose/Prose.tsx:185-221,244-262,298-308`; MDX en `src/app/work/projects/*.mdx` | grep `<Table`/`<Row` en MDX = 0; `<Text` 26, `<Card` 13, `<Column` 13, `<Grid` 3 | Borrar `Row` y `DataTable`. `table: TableWrap` se queda, para futuros artículos. Las props de Once UI en los MDX no se tocan: es contenido y no se gana nada. | bajo | P2 | L4 |
| código | Exportaciones sin uso, **solo sobra la palabra `export`** (el símbolo se usa dentro de su archivo): `BRANDS`, `BRANDS_TITLE`, `absoluteUrl`, `ogImage`, `readPosts` (blog), `INCENTIVA_CASES`, `plainText`, `findIntro` (intro.ts), `MediaPrint`, `zeroOf`, `CASE_SCENES`, `MEDAL_VIEWBOX`. | `workbench/BrandStage.tsx:58,123`; `utils/seo.tsx:9,24`; `workbench/blog/posts.ts:16`; `work/IncentivaIndex.tsx:25`; `prose/source.ts:17`; `scenes/intro.ts:6`; `prose/Prose.tsx:114`; `scenes/Scene.tsx:122`; `work/caseScenes.tsx:62`; `scenes/work/IncentivaMedal.tsx:16` | grep -w en `src` y `tests` (también .mdx): solo definición + usos en el mismo archivo; `tests/e2e/brand-stage.spec.ts:11` declara su propio `BRANDS`, no importa | Quitar `export` en cada uno. Nota: si se adopta lo de `findIntro` (fila de Bench), `findIntro` de intro.ts sí queda exportado y usado. | bajo | P2 | L3 |
| código | Exportación sin uso, **se borra el símbolo entero**: re-exportación `TYPE_MS` en Scene.tsx (`export { TYPE_MS }`); nadie la importa de `./Scene` (SceneDriver la toma de `./start`). | `src/components/workbench/scenes/Scene.tsx:31` | grep `TYPE_MS` fuera de Scene.tsx: SceneDriver.tsx:15,47 (de `./start`) y start.ts:87 | Borrar la línea 31 (el `import` de la 29 se queda, se usa en 34 y 87). | bajo | P2 | L3 |
| código | Avisos de Biome en el chatbot: dependencias de `useEffect` que sobran (`activeView`, `isOpen`). | `src/components/FaqChatbot.tsx:252` | `biome check src`: los 2 únicos avisos del proyecto. | Solo propuesta: zona protegida, y cambiar esas dependencias cambia cuándo corre el efecto. | medio | P3 | Propuesta |
| código | Botones "copiar enlace" con la misma lógica (estado, temporizador 1.8/2 s, limpieza, `<output>` de estado) en dos islas. | `src/components/workbench/prose/CopyLink.tsx:10-27` y `src/components/workbench/blog/CopyPostLink.tsx:9-21` | Mismo patrón `useRef` timer + `clipboard.writeText`; difieren en URL (calculada vs prop), mensaje de fallo y duración | Hook `useCopied(ms)` compartido (2 usos reales). Los textos y duraciones (1800/2000 ms, `failed` solo en uno) se conservan por separado para no cambiar nada. | bajo | P3 | L5 |
| código | `prefers-reduced-motion` consultado a mano en 8 sitios; ya existe `prefersReducedMotion()` en `scenes/start.ts:89` que solo usan 2 módulos. | `scenes/start.ts:89-91`; copias en `gallery/Viewer.tsx:18-20`, `about/FilmFrame.tsx:27,109`, `work/VideoPrint.tsx:47`, `components/ScrollToHash.tsx:11`, `components/IntroLoader.tsx:109`, `glass/GlassController.tsx:283`; con `matchMedia` vivo (cambios en caliente): `SpotlightBackground.tsx:67`, `home/Bench.tsx:197`, `BrandStageController.tsx:13-14` | grep `prefers-reduced-motion: reduce` en ts/tsx = 11 | Mover a `src/utils/motion.ts` (`prefersReducedMotion()`) y reutilizarlo en las 7 lecturas puntuales; dejar los `matchMedia` con listener como están. `start.ts` es módulo de escenas: no conviene importarlo desde el layout (carga extra), de ahí el util aparte. | bajo | P3 | L5 |
| código | `IntersectionObserver` repetido en 8 sitios con opciones distintas; solo hay un patrón realmente repetido: observar-un-elemento-y-desconectar (`RevealObserver`, `VideoPrint` x2, `FilmFrame` x2). | `workbench/RevealObserver.tsx:18`, `work/VideoPrint.tsx:32,49`, `about/FilmFrame.tsx:121,129`, `scenes/start.ts:156`, `home/Bench.tsx:165`, `BrandStageController.tsx:160` | grep `new IntersectionObserver` = 8 | No abstraer: las opciones, el ciclo de vida y los efectos difieren. Solo valdría un `useInView` para `VideoPrint`/`FilmFrame` si se tocan por otra razón. | bajo | P3 | No aplica |
| código | Props de `Scene`/`Typed` sin ningún llamador: `Scene.threshold` (y su lectura `data-threshold` en `SceneDriver.tsx:384`), `Typed.speed` y `Typed.caret`. | `src/components/workbench/scenes/Scene.tsx:43,49,69,87-88,95-96,106,112`; `SceneDriver.tsx:47,384` | grep `threshold` en tsx: ningún `<Scene threshold`; grep `caret=` y `speed=` = 0 | Quitar las tres props; en el driver `speed` pasaría a `TYPE_MS` fijo. Sin cambio visible. | bajo | P3 | L4 |
| código | Configuración con ramas apagadas: en `sharing.on` cinco plataformas en `false` (facebook, pinterest, whatsapp, reddit, telegram) con su tabla `PLATFORMS`, sus 5 iconos y `sharing.enabled`/`headerShows.{location,time,themeKey}` siempre `true`. Nadie las cambia. | `src/resources/site.ts:80-110`; `src/components/workbench/blog/Share.tsx:6-14,34-59,68-71`; `src/components/Header.tsx:65,104,113` | grep: único lector de `sharing` es Share.tsx; `headerShows` solo Header.tsx; todo `true`/`false` literal | Quitar las 5 plataformas apagadas y `sharing.enabled`, o dejarlas como están si Erick quiere poder activarlas. Share.tsx es componente de servidor (sin "use client"): no pesa en el bundle de cliente. `headerShows` vive en un cliente (Header): el `false` nunca ocurre. Sin cambio visible. | bajo | P3 | L4 |
| código | `enabledRoutes` (5 rutas todas `true`) alimenta `RouteGuard`, sitemap, Header y Footer; nunca está en `false`. | `src/resources/site.ts:69-76`; `src/utils/routeEnabled.ts`; `src/components/RouteGuard.tsx:9,16` | lectores: sitemap.ts:12,22, Header.tsx:46,76,89, Footer.tsx:16, RouteGuard.tsx | Solo propuesta (RouteGuard intocable): mantener; si algún día se simplifica, `RouteGuard` + `routeEnabled` + flag se van juntos. | bajo | P3 | Propuesta |
| código | Campo de frontmatter sin lector: `PostMetadata.link` (ningún MDX lo define y nadie lo lee). `TeamMember` solo se lee por `role` (`name`, `avatar`, `linkedIn` no se leen aunque el MDX los lleva). | `src/utils/posts.ts:9,31,70` ; lector de `team`: `src/components/workbench/work/cases.ts:76` | grep `\.link\b` sobre metadata = 0; `^link:` en MDX = 0 | Quitar `link` del tipo y de `readPosts`. `team` conservar (el MDX lo trae). Sin cambio visible. | bajo | P3 | L4 |
| código | Tipos exportados sin uso (35 de knip, todos confirmados: 0 importadores en `src` y `tests`; `LineBox` es de tests). Se quita solo `export`. En `resources/index.ts` además sobran 5 re-exportaciones de tipo: `Profile`, `ProfileLink`, `PagePath`, `HomeCategory`, `HomeFeature` (`data.ts` importa `HomeCategory` directo de `@/resources/home`). | `src/resources/index.ts:4,6,9`; `protectedRoutes.ts:17`; `utils/seo.tsx:29`; `utils/posts.ts:9`; `utils/rateLimit.ts:14`; `prose/source.ts:35`; `components/theme.ts:10`; `resources/{incentiva.ts:23,about.tsx:8-22,gallery.ts:3,home.tsx:7,profile.ts:5,34}`; `workbench/data.ts:31,113`; `scenes/{post/parts.ts:5,SceneStepper.tsx:26,CanvasLoop.tsx:35,start.ts:93,100,work/MarginStepper.tsx:21,work/PresenterBuild.tsx:19,projects/FigureCounter.tsx:15}`; `gallery/open.ts:5`; `work/caseScenes.tsx:35`; `tests/e2e/pdf-text.ts:172` | grep -w de cada nombre: solo definición y usos internos (p. ej. `Draw` aparece en DeskScene solo como alias local de `draw`) | Quitar `export` de cada tipo y las 5 líneas de re-exportación de tipo del barrel. `FAQItem` (`faqChatbot.ts:1`) y `RateLimitResult` (rateLimit.ts, API chatbot) son zona intocable: Solo propuesta. | bajo | P3 | L3 |
| código | `backButtonLabel` sin ningún lector: la cadena "Back to questions" no aparece en ningún otro archivo. | `src/resources/faqChatbot.ts:68` | grep -w `backButtonLabel` = 1 resultado; grep `Back to questions` = 1 | Solo propuesta (zona intocable): borrar el símbolo entero. | bajo | P3 | Propuesta |
| código | Comentarios obsoletos que nombran cosas que ya no existen (agrupados): `src/components/blog/OnThisPage.tsx` (la carpeta `src/components/blog` no existe), `GalleryView` (x2), "variant A / variant B" y "style A" (la versión sobria quedó como única; no hay `?v=`), "the previous home/index/page/site" y "sober, 2026-10-22" en cabeceras. | `workbench/blog/PostIndex.tsx:6`; `workbench/gallery/data.ts:4,111`; `scenes/work/BoothApp.tsx:13-14`; `scenes/work/LeadSort.tsx:7`; `scenes/work/AdReturn.tsx:10`; `scenes/work/KioskScreen.tsx:7`; `scenes/gallery/PieceMaking.tsx:6`; `scenes/system/LostScene.tsx:6`; `workbench/data.ts:58`; `gallery/Head.tsx:1-2`; `prose/source.ts:6`; `home/About.tsx:1`; `home/Bench.tsx:3`; `home/BenchAmbient.tsx:4`; `gallery/ClientSection.tsx:1` | grep `OnThisPage` / `GalleryView` = solo comentarios; grep `variant` en tsx: ningún `?v=` ni `data-variant` | Reescribir los comentarios en presente (qué hace hoy, no qué reemplazó). Solo comentarios, sin cambio visible. | bajo | P3 | L4 |
| código | Comentario de CSP obsoleto: "enabling the Mailchimp newsletter needs `form-action`..." (no hay newsletter ni Mailchimp en el código; solo queda una frase en `ai-portfolio.mdx:47`, que es texto de contenido y no se toca). | `next.config.mjs:25` | grep `mailchimp|newsletter` en src+config: 1 comentario + 1 frase de MDX | Solo propuesta (cabeceras de next.config intocables): quitar la línea del comentario. | bajo | P3 | Propuesta |
| código | `GlassController.tsx` (516 líneas) mezcla tres responsabilidades ya rotuladas en el propio archivo: tono bajo la píldora (líneas 47-108), lente SVG/canvas (109-198) y el componente (215-516, ~300 líneas con varios efectos). | `src/components/glass/GlassController.tsx` | Secciones `// ── What passes under the pill`, `// ── The lens`, `// ── The component` | Sacar `tone.ts` (colores, `toneAt`, `readTone`) y `lens.ts` (`drawLensMap`, `lensFor`) como módulos puros; el componente queda ~300 líneas. Aclara de verdad y es mecánico, pero toca un componente delicado (lente, rendimiento): hacerlo solo con la batería visual a mano. Sin cambio visible si es solo mover código. | medio | P3 | L6 |
| código | Archivos grandes de TS revisados: `FaqChatbot.tsx` (536, intocable), `SceneDriver.tsx` (443), `IntroLoader.tsx` (338), `resources/about.tsx` (402), `gallery.ts` (393), `incentiva.ts` (347). Sólo `GlassController` justifica partirse; los demás son datos o un único motor cohesivo. | `src/components/workbench/scenes/SceneDriver.tsx`, etc. | `largest-files.json` | No partir. | bajo | P3 | No aplica |
| código | `Header` es `"use client"` completo (123 líneas) por `usePathname` (clave activa) y el reloj, y a la vez importa el barrel `@/resources`, que reexporta `about.tsx` (JSX), `gallery.ts`, `protectedRoutes`, `homeFeatured`. | `src/components/Header.tsx:1,5` | `use-client.json`: imports `@/resources`, `@/resources/EMIcon`, `react-icons/pi` | No hace falta: la anotación de L2 ya saca esos datos del bundle (medido: 0 apariciones en el chunk del layout). | bajo | P3 | No aplica |
| código | Barril `src/components/index.ts` con un solo consumidor (`app/layout.tsx:5`): cuatro re-exportaciones para un import. Barril `src/resources/index.ts` sí tiene ~30 consumidores y es útil (ver fila de tipos). | `src/components/index.ts` | grep `from "@/components"` = 1 | Opcional: importar directo en layout.tsx y borrar el barril. Atención: el comentario de `resources/Metric.tsx:5-7` justifica evitar el barril de componentes por un ciclo; si se borra, actualizar ese comentario. | bajo | P3 | L4 |
| código | Menores fuera de area (de knip, verificados con grep): `src/resources/faqChatbot.ts:68 backButtonLabel` no se usa en ningun sitio (1 coincidencia, su definicion); `src/components/workbench/scenes/intro.ts` exporta `findIntro` pero `Bench.tsx:111` define su propia copia local de `findIntro`/`isLeaving` (duplicacion; el export `findIntro` de `intro.ts` no lo importa nadie, `whenIntroLeaves` si). Otros 13 «exports sin uso» y 35 tipos exportados son exports que solo se usan dentro de su archivo. | `src/resources/faqChatbot.ts`, `src/components/workbench/scenes/intro.ts`, `home/Bench.tsx` | grep `-w` | Para otro area (código). Sin efecto visible si se arregla. | bajo | P3 | No aplica |
| estilos | El layout carga en cada ruta (también `/_not-found` y `/unauthorized`) el chunk `e2915df09e5d80b8.css` de 101.643 B crudos / 15,2 KiB gz. Contiene 15 módulos de escenas: marketingsteps 15,3 KB, adreturn 11,4, leadsort 10,9, chattriage 10,6, boothapp 8,2, medalscroll 7,2, milesclaim 6,1, inheritedplatforms 6,0, beatcuts 5,7, launchchain 5,3, locked 4,9, kioskstand 3,8, lost 3,0, scenes 1,9, scope 1,4. El layout solo necesita locked, lost, scenes y scope (11,2 KB). | `.next/static/css/e2915df09e5d80b8.css`; `.next/app-build-manifest.json` `pages["/layout"]`; entradas `src/app/not-found` y `src/app/layout` de `*_client-reference-manifest.js` | `entryCSSFiles` de la entrada `src/app/not-found` lista `e2915...` + `7b2e9...`, y la del layout `40a09 + e2915 + 7b2e9 + d567`. HTML prerenderizado: `_not-found.html`, `about.html`, `blog.html`, `gallery.html`, `work.html`, `index.html` enlazan `e2915`. Cálculo por alcance de imports desde cada ruta (`_graph.js`): reglas de módulos que la ruta no importa, sobre lo cargado: `/_not-found` 108,7 de 155,5 KB crudos (70 %), `/about` 186,5 de 260,3, `/blog` 204,9 de 266,8, `/work` 204,9 de 260,0. | **Hipótesis del auditor refutada por medición.** La causa no es el orden de imports: el plugin de Next deja a un chunk de menos de 30 KB absorber módulos de otras rutas, y luego crecer hasta 100 KB (`MIN_CSS_CHUNK_SIZE`, `MAX_CSS_CHUNK_SIZE` en `css-chunking-plugin.js`). `cssChunking: false` lo corrige en todas las rutas: ver D77. | alto (orden de cascada y chunks; el bug de fuentes viene de aquí) | P1 | L7 |
| estilos | El chunk `e12e8e5027f5c6e1.css` (98.808 B crudos / 15,1 KiB gz) se carga entero en `/`, `/about`, `/blog`, `/blog/[slug]`, `/gallery`, `/work`, `/work/[slug]`, `/work/incentiva-group`. Mezcla gallery 16,5 KB, toolwall 13,0, prose 10,7, articleengine 8,9, brandwall 6,3, film 5,8, experience 5,2, projects 5,1, credentials 4,8, about 4,1, bench 3,8... Cada ruta usa una parte. | `.next/static/css/e12e8e5027f5c6e1.css`, `.next/app-build-manifest.json` | Ejemplos de lo que llega y la ruta no importa (`_graph.js`): `/` recibe gallery 16,5 KB y prose 10,7 KB; `/about` recibe gallery 16,5 y toolwall 13,0; `/blog` recibe gallery y toolwall; `/gallery` recibe toolwall 13,0 y prose 10,7. Estimación del total sin uso por ruta (proporcional a los gz medidos): `/` ~31 KiB, `/about` ~30, `/blog` ~34, `/gallery` ~31, `/work` ~34, `/work/incentiva-group` ~33. Cota superior, no ahorro real. | Misma causa y misma solución que la fila anterior: D77. | alto | P2 | L7 |
| estilos | `7b2e93f361b99bc9.css` (17.917 B crudos / 3,8 KiB gz) va en el layout, y 10.874 B son de `case.module.scss`, que solo usan `CaseStudy` y `VideoPrint` (rutas `/work/*`). | `.next/static/css/7b2e93f361b99bc9.css`; `src/components/workbench/work/case.module.scss` | Importadores de `case.module`: `CaseStudy.tsx`, `VideoPrint.tsx` (css-modules.json). Aun así el chunk está en `_not-found.html`, `about.html`, `blog.html`, `gallery.html`, `work.html`. | Misma causa y misma solución: D77. | alto | P2 | L7 |
| estilos | 15 custom properties definidas y sin ninguna lectura en `src`: `--ui-glass-line`, `--ui-surface`, `--ui-shadow`, `--ui-glow`, `--wb-ink-paper`, `--wb-tape`, `--wb-charcoal`, `--wb-band`, `--wb-band-ink`, `--wb-band-ink-2`, `--wb-band-tile`, `--wb-shadow-lift`, `--wb-raised`, `--wb-soft-in` (y `--wb-shadow`: las 4 menciones fuera son de `--wb-shadow-soft`/`-lift`, no leen `--wb-shadow`). | `src/resources/custom.css:8-12,18,21,26,28,35,188-190,197-202,206,212-217,265-266,273-274,282-283` | `grep -rn -- "--NOMBRE" src` fuera de `custom.css`: 0 resultados para cada una (también sin `"--NOMBRE"` ni plantillas en TSX). Sin lectura por JS. Unas ~28 declaraciones, ~1,2 KB crudos / ~0,3 KiB gz en `d567f9173b27d75f.css` (layout). | Borrarlas. La huella de la puerta enumera `getComputedStyle`, que no incluye propiedades personalizadas, así que no dan diferencias falsas; cualquier uso real sí aparecería como cambio de estilo. | bajo (medio si la puerta cuenta propiedades personalizadas) | P3 | L4 |
| estilos | Clases que el TSX usa pero el SCSS no define: `s.pageLeft` en MarketingSteps y `s.figMain` en AdReturn (`undefinedUsed`). El `className` queda con la cadena literal `undefined`. | `src/components/workbench/scenes/work/MarketingSteps.tsx:28`, `src/components/workbench/scenes/work/AdReturn.tsx:56` | `grep -n pageLeft *.tsx *.scss` en esa carpeta: solo aparece en el TSX. `grep figMain`: solo en el TSX. Salida: `class="marketingsteps_page__x undefined"`. Los otros dos `undefinedUsed` (`ui.module`, `scope.module`: `module`) son falsos positivos del escáner. | Quitar la clase del TSX (o definirla vacía). No cambia ningún estilo computado, pero sí el atributo `class` del DOM: confirmar que la puerta no compara clases. | bajo | P3 | L4 |
| estilos | Los 26 "sin uso" del escáner son falsos positivos en 24 de 26: acceso dinámico `styles[kind]` / `s[paper]` / `` styles[`row${level}`] `` / `` s[`in${at}`] ``. Los únicos reales son `.block` en `launchchain` y `platformtakeover`, base de `@extend`. | `scenes/work/launchchain.module.scss:33`, `scenes/work/platformtakeover.module.scss:40`; `home/Bench.tsx:66`, `prose/Prose.tsx:33-34`, `scenes/gallery/PieceMaking.tsx:50`, `scenes/work/BoothApp.tsx:20,38,55`, `scenes/system/LostScene.tsx:26-31,71` | Valores: Bench `screen/print/tag` usados (Bench.tsx:235-273), Prose nivel 2/3/4, PieceMaking `enter(k,1..3)`, `SWATCHES=["cobalt","ink","mist"]`, Lost `ring/dot/square/stroke/small/grey`, `Paper="cobalt"|"ink"|"mist"|"paper"` más `.ink .sheet` en `stepper.module.scss:210`. `.block` aparece una vez en el CSS compilado (`launchchain_block__taw2u`). | `.block` -> `%block` (placeholder). Ahorra decenas de bytes y el nombre de clase muerto. No vale un cambio por sí solo. | bajo | P3 | No aplica |
| estilos | Duplicados en el CSS emitido: 44 bloques con cuerpo idéntico de más de 90 B repartidos entre módulos (~30,4 KB crudos), sobre todo el patrón de revelado (`@media(scripting:enabled)and (prefers-reduced-motion:no-preference){opacity:0;translate:0 var(--wb-travel)...}`: 34 copias, 8,9 KB; 43 copias con `--wb-travel-lg`, 4,6 KB). 5 pares de `@keyframes` de cuerpo igual (`wave` x3, `dot`, `tap`/`press`, `card-in`/`rise`, `lgPartIn`/`caseIn`) de 42-72 B. | `src/components/workbench/_shared.scss:117` (`@mixin reveal`), 21 usos de `scripting: enabled` | Ya está centralizado en el mixin `reveal`: lo repetido es la salida del mixin, no copia a mano. gzip del CSS junto: 56.189 B; quitando los cuerpos repetidos (cota superior) 54.981 B, es decir -1,2 KiB. En archivos separados el ahorro real es menor. | No centralizar. Un `@extend`/placeholder o una clase global moverían reglas entre chunks y cambiarían el orden de cascada; el ahorro máximo (~1,2 KiB gz) no compensa el riesgo. | alto | P3 | No aplica |
| estilos | Mixins Sass sin uso: `@mixin h2` y `@mixin lede`. | `src/components/workbench/_shared.scss:149-165` | `sass-members.json` (uses: 0); `grep -rn "@include h2\b\|@include lede\b" src` = 0. | Borrar los dos mixins. 0 B en el CSS. | bajo | P3 | L4 |
| estilos | Restos menores: `var(--link-dur, ...)`/`var(--link-ease, ...)` nunca se definen (siempre usan el valor de reserva), y `a:not([data-unstyled])` apunta a un atributo que ningún TSX pone. | `src/components/workbench/scope.module.scss:21,28-29` | `grep -rn "link-dur\|link-ease\|data-unstyled" src`: solo `scope.module.scss` y un comentario. `_data.js` revisó 37 atributos `data-*` de los SCSS: solo `data-unstyled` no se escribe en ningún TSX. | Dejar como está: quitar `:not([data-unstyled])` baja la especificidad de la regla y puede cambiar qué gana en la cascada. Solo documentar. | medio | P3 | No aplica |
| rendimiento | `Header` (cliente) y `RouteGuard` (cliente) importan el barril `@/resources`. Eso mete en el chunk del layout, es decir en TODAS las rutas, el módulo `about.tsx` (JSX con `Fragment`) y los datos de `incentiva.ts`, que ningún componente cliente lee. Los `flatMap` de nivel superior impiden que el bundler los descarte. | `src/components/Header.tsx:5`, `src/components/RouteGuard.tsx:9`, `src/resources/index.ts`, `src/resources/incentiva.ts:346` | En `.next/static/chunks/app/layout-fb0cd4f1905e5647.js` el módulo 5472 (`@/resources`) mide 11,5 KB crudos / 4,2 KiB gz. Su cola tras `var l=a(5155),c=a(2115)` es 9.522 B crudos / 3.412 B gz de datos del About e Incentiva (`caseSlug` x11, `P14`...). Los strings de `homeFeatured`, `galleryPieces` y `protectedRoutes` no aparecen: esos sí se podan. Solo layout contiene esos datos: grep sobre los 40 chunks da 1 archivo. | **Medido:** basta anotar `/*#__PURE__*/` en la única llamada de nivel superior de `src/resources/incentiva.ts:346`. −2,99 KB de JS en todas las rutas, 0 cambios en CSS, ninguna función crece, sin tocar `Header`, `RouteGuard` ni `/api/chatbot` (`prompt.ts` usa ese barril, así que sacar `about` de él exigiría editar una zona protegida). | bajo | P1 | L2 |
| rendimiento | `RouteGuard` importa `@/app/not-found` de forma estática solo para dibujar `<NotFound />` cuando una ruta está deshabilitada. Con `enabledRoutes` todo `true` esa rama no se ejecuta nunca, pero `LostScene` y la UI de la 404 viajan en el layout. | `src/components/RouteGuard.tsx:8,16`; `src/resources/site.ts` (`enabledRoutes`); `src/components/workbench/scenes/system/LostScene.tsx` | En `layout-fb0cd...js` módulo 3448 (`LostScene`) 2,6 KB crudos / 1,2 KiB gz; módulo 2682 (`RouteGuard` + UI 404) 1,6 KB / 0,75 KiB gz. `enabledRoutes` de `/`, `/about`, `/work`, `/blog`, `/gallery` es `true` (módulo 5472 de ese chunk). | **Medido y descartado:** cargar la 404 con `next/dynamic` desde `src/app/not-found.tsx` (sin tocar `RouteGuard`) solo ahorra 0,37 KB de CSS en las rutas de contenido, sube 0,39 KB en `/unauthorized` y añade 1,2 KB de JS total. No compensa. | medio | P2 | Propuesta |
| rendimiento | `FaqChatbot` lleva dentro de su módulo todo `faqData` (preguntas y respuestas) en el JS del layout. | `src/components/FaqChatbot.tsx:3` (import de `@/resources/faqChatbot`) | Módulo 6603 de `layout-fb0cd...js`: 12,4 KB crudos / 4,5 KiB gz, empieza por el arreglo `[{id:"current",question:"What does Erick do currently?"...`. Solo está en el layout. | **Solo propuesta** (chatbot intocable): cargar `faqData` con `import()` al abrir el panel o al enviar la primera pregunta. Ahorro estimado ~2-3 KiB gz (los datos son la mayor parte del módulo; no medido por separado). | medio (hay que no cambiar el tiempo del saludo) | P2 | Propuesta |
| rendimiento | `GlassController` incluye el dibujo del mapa de la lente (canvas, `drawLensMap`, `lensFor`) aunque solo corre en Chromium (`"userAgentData" in navigator`). | `src/components/glass/GlassController.tsx:132-197,415` | Módulo 4734 del layout: 8,2 KB crudos / 3,4 KiB gz. | **Solo propuesta:** cambia el momento en que se dibuja la lente. | medio | P3 | Propuesta |
| rendimiento | `onMove` de `Bench` lee `getBoundingClientRect()` en cada `pointermove` antes de coalescer con rAF. | `src/components/workbench/home/Bench.tsx:213` (handler ~205-218) | Lectura de layout por evento; Chrome ya agrupa `pointermove` a uno por fotograma, y el handler sale antes si el banco no está en pantalla (`"live" in bench.dataset`). Coste estimado < 0,1 ms por fotograma. | Mover la lectura al callback del rAF. Ganancia mínima; no merece cambio por sí solo. | bajo | P3 | No aplica |
| rendimiento | `GlassController.readTone` corre cada 150 ms mientras se desplaza la página y hace `getBoundingClientRect`, `getComputedStyle` y 3 `elementsFromPoint` + `getComputedStyle` por elemento: lecturas que fuerzan estilo/layout. | `src/components/glass/GlassController.tsx:90-107,245-250` | Ya está limitado: 150 ms como mucho + una vez al parar, dentro de rAF. Hasta ~7 ejecuciones por segundo de scroll. Coste por ejecución no medido (no puedo lanzar el navegador ahora). | Sin cambios; medir con Performance si hace falta. | bajo | P3 | No aplica |
| pruebas | `tests/unit/image-refs.spec.ts` lee `scripts/media/image-renames.json` (`MAP`, linea 5; `expect(existsSync(MAP)).toBe(true)`). Ese JSON NO es borrable aunque su script ya cumplio. | `scripts/media/image-renames.json`, `tests/unit/image-refs.spec.ts:5,14` | Las 78 claves del mapa: 0 siguen en `src`, 0 existen en `public/`, 78 destinos existen. | Conservar el JSON (es la lista de ruta viejas prohibidas). Documentarlo en `scripts/README`/index. | bajo | P3 | L8 |
| pruebas | `test.skip` con motivo: no hay `test.fixme` ni `.skip` sin motivo. Inventario en «Pruebas omitidas». Todos son condicionales por motor, plataforma o proyecto, no pruebas apagadas. | `tests/e2e/*` | 22 llamadas `test.skip(...)`, todas con cadena de motivo (grep `skip\|fixme`). | Ninguna. El unico a vigilar es `ssr-content.spec.ts:28`: se salta en Windows por Next #57008 y solo corre en Linux/Vercel (hoy la bateria local en Windows no lo ejecuta). | bajo | P3 | No aplica |
| pruebas | Specs de rondas (`ajustes-cv-marcas`, `cv-estrategico`, `posicionamiento`, `mensaje-impacto`, `incentiva`, `seo`) cubren cosas vivas: el CV (`/resume/Erick_Mahecha_Resume.pdf` existe), el muro, el SEO. Sin specs obsoletas, duplicadas ni apuntando a cosas inexistentes. Helpers: `ROUTES`, `measureCLS` (cls.spec), `pdfText`, `pdfLineBoxes`, `fixtures.test` se usan; `LineBox` (tipo exportado) solo lo usa el propio archivo. `intro-font.spec.ts-snapshots` tiene 3 PNG `-chromium-win32` coherentes con el `skip` de plataforma. | `tests/` | grep de cada export; cada ruta de docs citada en pruebas existe (11/11). | Ninguna propuesta de borrado. | bajo | P3 | No aplica |
| pruebas | Solapes menores, no duplicados: CLS esta en `cls.spec.ts` (5 rutas) y `motion.spec.ts:143` (reloj de la cabecera); `image-formats.spec.ts` (AVIF de `avatar.jpg`) es complementaria de `no-broken-images.spec.ts`. Distintos objetivos. | `tests/e2e` | Lectura de cabeceras. | Ninguna. | bajo | P3 | No aplica |
| scripts | `apply-image-renames.mjs` es un script de una sola vez ya cumplido: reescribe en `src` las rutas del mapa. | `scripts/media/apply-image-renames.mjs` | 78 claves, 0 referencias restantes en `src`; solo lo mencionan `docs/superpowers/plans/2026-09-26-perf-quick-wins.md` y knip. Nadie lo llama (ni `package.json` ni otros scripts). | Candidato a borrar, o dejar con una marca «cumplido» en el índice. Su salida la regenera `optimize-images.mjs`, que sigue siendo util para imagenes nuevas. | bajo | P3 | L8 |
| scripts | Ningun script esta documentado en el README ni tiene `npm run`, salvo `perf:lh` y `perf:report`. `design/*`, `media/*`, `resume/build-resume.mjs`, `perf/tool-logos.mjs`, `quality/biome-gate.mjs` tienen cabecera con uso, pero nadie las lista. `biome-gate.mjs` y `perf/*` siguen vivos (usados en las puertas): no son candidatos a borrar. | `scripts/**`, `README.md` | knip los marca «Unused files» porque no son entrada de nada (falso positivo). | Añadir una tabla «scripts» al índice de docs/README. | bajo | P3 | L8 |
| scripts | Rutas de salida por defecto que no existen en el repo: `docs/design/screens/rediseno-2026` y `.../rediseno-2026-escenas/frames` (`screens.mjs`, `scene-frames.mjs`). Son carpetas que el script crea, no referencias rotas. | `scripts/design/screens.mjs`, `scene-frames.mjs` | El resto de rutas `public/`, `docs/`, `src/` que citan los scripts existe (`optimize-videos.mjs` lista 5 mp4, todos presentes). | Ninguna. Si se generan, ignorarlas en `.gitignore` o decidir que se versionan. | bajo | P3 | No aplica |
| configuración | El checkout raíz sigue en `lab/rediseno-2026`, así que `graphify-out/` describe una rama vieja (Once UI, `src/lab`). | raíz del repo, `graphify-out/` | `graphify query` devuelve `mdx.tsx` y `@once-ui-system/core`, que no existen en `main`. | Pasar el checkout raíz a `main` y regenerar el grafo. Hay archivos sin seguimiento en la raíz: decide Erick. | bajo | P2 | Propuesta |
| configuración | **Falsa alarma, comprobada:** se temía que `tsc` tipara `.claude/worktrees`. | `tsconfig.json` | `tsc --listFilesOnly` con un `.ts` dentro de `.claude/worktrees`: 0 archivos. Los comodines de TypeScript saltan las carpetas con punto. | Ninguna. | bajo | P2 | No aplica |
| configuración | `biome.json` con `vcs.enabled:false` y sin `files.ignore`: `npm run biome-write` (`biome format --write .`) recorre todo el arbol, incluidos `.next`, `test-results`, `.claude/worktrees`. Por confirmar (no se ejecuto biome). | `biome.json`, `package.json:7` | `files` solo trae `ignoreUnknown:false`; Biome solo ignora `node_modules` por defecto. | Añadir `files.ignore` (`.next`, `test-results`, `.claude`, `public`) o `vcs.useIgnoreFile:true`. Verificar con `biome format .` sin `--write`. | medio | P2 | L8 |
| configuración | `tsc --noEmit` falla en una copia limpia hasta que `next build` genera `next-env.d.ts`, que está en `.gitignore`. | `.gitignore`, `tsconfig.json` | 46 errores TS2307 de imágenes en una copia recién extraída; 0 tras el build. | Documentar el orden en `docs/README.md`: primero build, luego `tsc`. | bajo | P3 | L8 |
| configuración | `.env.example` frente al código: coherente. Variables de produccion leidas: `PAGE_ACCESS_PASSWORD`, `AUTH_SECRET`, `GEMINI_API_KEY`, las 3 estan en el ejemplo y en el README. El resto (`E2E_BASE_URL`, `E2E_PORT`, `LH_*`, `UPDATE_PROMPT`, `NODE_ENV`) son de pruebas/perf y no deben ir al ejemplo. No hay `process.env[...]` dinamico. | `.env.example` | `grep -rhoE "process\.env\.[A-Za-z_0-9]+"`. Nombres solo; `.env.local` no se leyo. | Ninguna. Opcional: citar en README las variables `E2E_*`/`LH_*`. | bajo | P3 | No aplica |
| configuración | `.gitignore` arrastra restos del arranque de `create-next-app` que no aplican (npm, no yarn/pnp): `/.pnp`, `.pnp.js`, `.yarn/install-state.gz`, `/coverage`, `/out/`, `/build`, `yarn-debug.log*`, `yarn-error.log*`, `*.pem`. Además `security-audit.local.md` es redundante con `*.local.md`. Los tres «brand source files» raiz (`/16.9 - LOGO COMPLETO.png`, `/Logo - Favicon.png`, `/Manual_Marca_Personal_...pdf`) no existen en `origin/main` (por diseno: viven en local). | `.gitignore` | `ls` de la raiz de la base. | Agrupar las entradas obsoletas en una sola fila de limpieza; son inocuas. Dejar las de marca. | bajo | P3 | L8 |
| configuración | `.graphifyignore`: las lineas `!/16.9 - LOGO COMPLETO.png`, `!/Logo - Favicon.png`, `!/Manual_...pdf` solo tienen sentido en la maquina del Erick (no estan en el repo). Inofensivo. `graphify-out/` ya esta en `.gitignore`. | `.graphifyignore` | idem | Ninguna. | bajo | P3 | No aplica |
| configuración | `tsconfig.json`: `typeRoots: ["./node_modules/@types"]` es el valor por defecto (redundante); `allowJs:true` sin ningun `.js/.jsx` en `src` (`find` vacio) ni en `tests`. `paths: {"@/*": ["./src/*"]}` se usa. | `tsconfig.json` | `find src -name "*.js*"` vacio; `grep "@/" src` en uso (por confirmar el conteo; no relevante). | Quitar solo `typeRoots`. `allowJs` se queda: `next build` lo vuelve a escribir en `tsconfig.json` si falta. Validar con `tsc --noEmit`. | bajo | P3 | L8 |
| configuración | `next lint` (script `lint`) esta obsoleto desde Next 15.5 y se retira en 16; la config `.eslintrc.json` (eslintrc) con ESLint 9 depende de ello. Por confirmar con `npm run lint` (no se ejecuto). | `package.json:10`, `.eslintrc.json` | `next@15.5.27`, `eslint@^9.25`. | Planificar migrar a ESLint CLI con flat config o a Biome cuando se suba a Next 16. No ahora. | bajo | P3 | Propuesta |
| configuración | `package.json` sin `engines` aunque el README dice «Node.js 18.18 o posterior»; sin script de tipos (`tsc --noEmit`) ni de Biome (`biome check`) pese a que el CLAUDE.md y la puerta citan Biome. | `package.json`, `README.md` | lectura | No aplicar: `engines.node` puede cambiar la versión de Node en Vercel, y los scripts nuevos no los pide nadie. | bajo | P3 | No aplica |
| configuración | `README.md` raiz: no hay nada falso. Rutas citadas existen (`src/resources/{profile,site,about,gallery,home,protectedRoutes}`, `src/utils`, `public`), pasos de uso y variables coinciden. Falta mencionar `scripts/`, `docs/`, Biome y los scripts de perf. `LICENSE`: propietaria, coherente con el README. | `README.md`, `LICENSE` | lectura | Añadir enlace a `docs/README.md` cuando exista. | bajo | P3 | L8 |
| configuración | `CLAUDE.md` del repo y `.claude/settings.json` (hooks `graphify hook-guard`) son herramientas personales del Erick dentro del repo y apuntan a `graphify-out/` (gitignored, solo local) y a un vault externo. No son falsos, pero no ayudan a un colaborador. | `CLAUDE.md`, `.claude/settings.json` | lectura | Dejarlos si el repo es solo del Erick; decision suya. | bajo | P3 | Propuesta |
| configuración | `next.config.mjs`: la CSP y las cabeceras no se tocan. Fuera de ellas, solo sobra `withMDX` (ver arriba). `transpilePackages: ["next-mdx-remote"]`, `outputFileTracingIncludes` (rutas `/api/og/generate` y `/api/rss` existen), `redirects` y `cssChunking` estan vigentes. | `next.config.mjs` | `ls src/app/api` | Ninguna mas. | bajo | P3 | No aplica |
| documentación | No existe índice de `docs/` ni `docs/README.md`. Hay 24 archivos, de los cuales 2 planes y 2 specs de la «landing con película» y el plan/spec «disruptivo» describen una dirección descartada. | `docs/` | Ver «Inventario de documentos». | Crear `docs/README.md` con esa tabla y marcar los obsoletos solo en el índice. | bajo | P1 | L8 |
| documentación | `docs/perf-baseline.md` y `docs/perf-report.md` son historicos (Lighthouse 12.8.2, 2026-09-26; hoy `lighthouse@13.5.0`) pero el código los cita: `src/app/fonts.ts:17,36`, `tests/e2e/smoke.spec.ts:6,25`. No borrar ni mover sin editar esos comentarios. `perf-report.md` pesa 50 KB. | `docs/perf-*.md` | grep | Marcar «historico» en el índice, mantener la ruta. | bajo | P2 | L8 |
| documentación | Planes/specs de `docs/superpowers/` de la «landing con película» (2026-10-09) y el rediseño «disruptivo» (2026-09-26) estan obsoletos: la dirección fue rechazada/revertida (`2026-10-09-landing-film-home-design.md`: «Reemplaza a 2026-09-26... Erick rechazo...»; la película se revirtio el 2026-10-10 y el sitio actual es Workbench). Ningun archivo de `src`/`tests` los cita. | `docs/superpowers/**` (5 archivos, ~340 KB) | `grep docs/superpowers src tests scripts` vacio; `src` sin código de landing-film. | Solo marcar «obsoleto» en el índice. No se propone borrar ninguno. | bajo | P2 | L8 |
| public | 9 archivos sin ninguna referencia en el sitio, 7.938.573 bytes: `project-01/video-01.mp4` (7.304.559) y 8 webp de `project-01` (634.014). Solo los nombran un script y un mapa de renombres, no el sitio. Para el visitante pesan cero. | `public/images/projects/project-01/{video-01.mp4, avatar-01, cover-01, cover-02, cover-03, cover-04, image-01, image-02, image-03}.webp` | `site` vacio, sin `siteBase`/`siteStem`. `grep project-01 src` solo da `whatsapp.webp`, `chatbot-artesa.mp4` y `leadbot.mp4`. Sin rutas dinamicas: 200 rutas literales revisadas, 0 construidas con `${}`. Los 8 webp solo aparecen en `scripts/media/image-renames.json` (como destino del renombre). `video-01.mp4` solo en `scripts/media/optimize-videos.mjs:42` y en docs de perf. | El Erick decide el borrado con la lista de «Archivos de public/» (pueden tener enlaces externos). Si se borra `video-01.mp4`, quitar tambien su entrada en `optimize-videos.mjs:42`, o ese script falla al correr. | medio | P1 | L9 |
| public | `incentiva_medalla_m1-azul-cian.svg` (1.176 bytes) solo se nombra en un comentario de `IncentivaMedal.tsx:5`; no se sirve. `videohome.mp4` (3.611.663) no lo sirve el sitio (Film.tsx usa `videohome-1080/-720/-av1`); se queda a proposito. | `public/images/projects/incentiva-brand/`, `public/videohome.mp4` | «Archivos de public/» | `videohome.mp4`: conservar (regla del Erick). El SVG: conservar, es la fuente oficial que cita el comentario. | bajo | P3 | No aplica |
| public | Referencias rotas: 0. De 200 rutas `/images`, `/resume`, `/videohome` literales en `src` (excluyendo binarios), solo una no resolvio por mi regex: `images/gallery/Artesa ...` (nombre con espacios, cortado por la expresion; el archivo existe porque `no-broken-images.spec` y `image-refs` lo cubren). | `src/**` | script node sobre `src` | Ninguna. | bajo | P3 | No aplica |
| ramas y worktrees | 38 worktrees registrados (la raíz, 28 dentro de `.claude/worktrees` contando `limpieza`, y 9 fuera) y 28 ramas locales; `main` local va 28 commits por detrás. | `git worktree list`, `git branch` | Inventario completo en la sección «Ramas y worktrees». | Borrar solo lo de la lista aprobada, sin `--force`. | medio | P2 | L10 |

## Resultados de la puerta

Pendientes: se anotan aquí al terminar la Fase 3.

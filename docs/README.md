# Documentación y scripts

Índice del repo. Lo marcado como `obsoleto` se conserva como historial: no describe el sitio actual y no hay que seguirlo. Las decisiones viven en `design/rediseno-2026/`, y esa carpeta no se borra ni se mueve.

## Por dónde empezar

- **Cómo está hecho el sitio:** `design/rediseno-2026/README.md` y `design/rediseno-2026/workbench-propuesta.md`.
- **Reglas que siguen vigentes** (media, patrones prohibidos, responsive): `design/rediseno-2026/lab-contrato.md`.
- **Última ronda:** `design/rediseno-2026/limpieza-encargo.md`.

## Documentos

Estados: `vigente`, `histórico` (ya se ejecutó; sirve de contexto) y `obsoleto` (dirección rechazada o revertida).

| Documento | Qué es | Estado |
|---|---|---|
| `design/rediseno-2026/README.md` | Rediseño «Workbench» en todo el sitio: qué se conserva, reglas y decisiones | vigente |
| `design/rediseno-2026/workbench-propuesta.md` | La propuesta C tal como se construyó en el lab: idea, paleta, tipo, mapa de páginas | vigente |
| `design/rediseno-2026/lab-contrato.md` | Gramática de movimiento, patrones prohibidos, reglas de responsive y de media | vigente |
| `design/rediseno-2026/escenas-encargo.md` | Ronda: escenas animadas hechas con código | vigente |
| `design/rediseno-2026/sobrio-encargo.md` | Ronda: Workbench sobrio, el estilo en producción | vigente |
| `design/rediseno-2026/pulido-animaciones.md` | Ronda: pulido de animaciones; lo cita una prueba | vigente |
| `design/rediseno-2026/liquid-glass-encargo.md` | Ronda: vidrio líquido en la capa flotante | vigente |
| `design/rediseno-2026/tool-logos.md` | El muro de logos de herramientas; lo citan un script y pruebas | vigente |
| `design/rediseno-2026/incentiva-encargo.md` | Ronda: Incentiva Group en el portafolio; lo cita una prueba | vigente |
| `design/rediseno-2026/posicionamiento-encargo.md` | Ronda: posicionamiento «Growth & AI Systems Lead» | vigente |
| `design/rediseno-2026/validacion-confidencial.md` | Lista de pasajes publicados que Erick valida con cada responsable. No se edita desde una ronda de limpieza | vigente |
| `design/rediseno-2026/ajustes-cv-marcas-encargo.md` | Ronda 6: CV, marcas, muro y héroe; lo cita una prueba | vigente |
| `design/rediseno-2026/cv-estrategico-encargo.md` | Ronda 7: CV de resultados; lo cita una prueba | vigente |
| `design/rediseno-2026/mensaje-impacto-encargo.md` | Ronda 8: mensaje e impacto; lo cita una prueba | vigente |
| `design/rediseno-2026/video-about-encargo.md` | Ronda 9: video de About con más calidad | vigente |
| `design/rediseno-2026/seo-encargo.md` | Ronda 10: SEO técnico, con propuestas pendientes | vigente |
| `design/rediseno-2026/limpieza-encargo.md` | Ronda 11: limpieza del repo | vigente |
| `perf-baseline.md` | Línea base de Lighthouse del 2026-09-26. No se mueve: lo cita `tests/e2e/smoke.spec.ts` | histórico |
| `perf-report.md` | Informe de los «quick wins» de rendimiento. No se mueve: lo cita `src/app/fonts.ts` | histórico |
| `superpowers/plans/2026-09-26-perf-quick-wins.md` | Plan de los «quick wins» | histórico |
| `superpowers/plans/2026-11-06-limpieza-repo.md` | Plan de la ronda 11 | histórico |
| `superpowers/plans/2026-09-26-disruptive-redesign.md` | Plan del rediseño «Blueprint» | obsoleto: rechazado |
| `superpowers/specs/2026-09-26-disruptive-redesign-design.md` | Diseño de «Blueprint» | obsoleto: rechazado |
| `superpowers/specs/2026-10-09-landing-film-home-design.md` | Diseño de la Home como película de scroll | obsoleto: revertido el 2026-10-10 |
| `superpowers/plans/2026-10-09-landing-film-look-gate.md` | Plan A de esa Home | obsoleto: revertido |
| `superpowers/plans/2026-10-09-landing-film-full-video.md` | Plan B1 de esa Home | obsoleto: revertido |
| `superpowers/plans/2026-10-09-landing-film-closing.md` | Plan B2 de esa Home | obsoleto: revertido |

## Scripts

Se ejecutan con `node`, desde la raíz. Cada uno explica su uso en la cabecera.

| Script | Para qué |
|---|---|
| `scripts/quality/biome-gate.mjs` | Falla si un archivo de `src/` tiene más avisos de Biome que en una referencia dada. Se usa en las puertas |
| `scripts/perf/lighthouse.mjs` | Lighthouse N veces por página y formato (`npm run perf:lh`) |
| `scripts/perf/report.mjs` | Tabla de medianas de esos informes (`npm run perf:report`) |
| `scripts/perf/tool-logos.mjs` | Cuándo descarga cada logo del muro de herramientas |
| `scripts/design/screens.mjs` | Capturas de página completa, a 390 y 1440 px, en claro y oscuro |
| `scripts/design/scene-frames.mjs` | Secuencias de fotogramas de una escena animada |
| `scripts/design/fonts.mjs` | Qué fuente renderiza cada texto, para comparar dos builds |
| `scripts/design/covers.mjs` | Portadas hechas con código |
| `scripts/media/optimize-images.mjs` | Convierte imágenes nuevas de `public/images` en originales WebP |
| `scripts/media/optimize-videos.mjs` | Recomprime los videos de la lista que tiene dentro |
| `scripts/resume/build-resume.mjs` | Regenera el CV en PDF a partir de los datos del sitio |

`scripts/media/image-renames.json` no se ejecuta: es la lista de rutas viejas que `tests/unit/image-refs.spec.ts` prohíbe usar.

## Comprobar el proyecto

La copia de trabajo es CRLF (`core.autocrlf=true`) y `next lint` falla dentro de worktrees anidados. Para lint, Biome y build, usa una copia LF fuera del repo:

```bash
git -c core.autocrlf=false archive HEAD | tar -x -C <copia>
```

En una copia limpia, el orden importa: `next-env.d.ts` no está en git y lo genera el build, así que `npx tsc --noEmit` da errores de imports de imágenes hasta correr `npx next build`.

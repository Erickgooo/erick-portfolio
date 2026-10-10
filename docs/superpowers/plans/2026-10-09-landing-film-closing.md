# Landing con película de scroll — Plan B2: cierre de la Home, limpieza y entrega

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Terminar la Home (secciones planas bajo la película), retirar lo que quedó sin uso, reencuadrar el video para el teléfono y entregar con Lighthouse 13 y revisión independiente.

**Origen:** Erick aprobó el estado del commit `29d5124` («está bien, sigue con lo que falta»). Ejecución directa.

**Spec:** `docs/superpowers/specs/2026-10-09-landing-film-home-design.md` (§2 filas 6–9, §3, §4.2, §4.4, §6, §7). Restricciones globales del Plan A, con dos cambios pedidos por Erick después: el fondo es el de puntos con la luz que sigue al mouse, y la barra de navegación es la de iconos.

## Review Focus

1. **Proyecto protegido por contraseña:** no aparece entre los casos de estudio de la Home. `Proof` filtra con `isProtectedPath`.
2. **Proyecto sin métrica o sin imagen:** la tarjeta conserva su forma. Test `case study cards keep their shape without a metric`.
3. **FAQ sin JavaScript y con teclado:** las respuestas se abren con `<details>` nativo. Test `answers open with the keyboard`.
4. **Movimiento reducido o equipo lento:** cada sección de la película muestra su propio fotograma y no se descarga el video. Test `reduced motion swaps a still per section`.
5. **Teléfono en vertical:** el sujeto de cada plano queda dentro del encuadre. Revisión a ojo de la hoja de contactos.

### Task 1: Secciones planas (casos, contratación, FAQ, CTA final)

**Files:** Create `src/components/landing/Closing.tsx`, `tests/e2e/landing.spec.ts`. Modify `src/resources/landing.ts`, `landing.module.scss`, `src/app/page.tsx`, `tests/e2e/pointer-fx.spec.ts`. Delete `src/components/CallToAction.tsx` y su export.

- [ ] **Step 1:** Tests que fallan en `landing.spec.ts`: orden de las secciones; tres casos (los más recientes, no protegidos) con imagen, enlace y métrica si existe; bloque de contratación con CV y `/about`; siete preguntas que se abren con clic y teclado; schema `FAQPage` igual a las preguntas visibles; el CTA final es idéntico al del hero; todo presente en el HTML de servidor.
- [ ] **Step 2:** Verlos fallar.
- [ ] **Step 3:** Copy en `landing.ts` (§3 del spec); `Closing.tsx`; estilos con los tokens del tema; `pointer-fx.spec.ts` apunta al CTA final.
- [ ] **Step 4:** Verlos pasar en los cuatro navegadores, más `film`, `cls`, `smoke`, `ssr-content`.
- [ ] **Step 5:** Capturas en desktop y móvil, tema oscuro y claro, revisadas a ojo. Gates y commit.

### Task 2: Limpieza de lo que quedó sin uso

**Files:** Delete `src/components/home/*` (`HomeRail`, `HomeSection`, `FeaturedProject`, `DockFrame`, `LazyVideo`, `Home.module.scss`), `src/components/motion/BlueprintLine*`, `BlueprintFrame*`, `ReadingProgress*`, `GlowTrack*`, `public/videohome.mp4` y su póster. Modify `src/components/motion/index.ts`, `src/utils/projects.ts` (`formatIndex`), `tests/unit/projects.spec.ts`.

`KineticText` se queda: lo usa el `h1` de `/about`, que no forma parte de este trabajo.

- [ ] **Step 1:** Borrar y ajustar exports; `rg` de cada nombre devuelve 0 usos.
- [ ] **Step 2:** `tsc`, Biome, build, unit y e2e de Chromium en verde. Commit.

### Task 3: Video vertical reencuadrado y fotogramas por sección

**Files:** Modify `scripts/media/encode-film.sh`, `src/components/film/ScrollFilm.tsx`, `filmMap.ts`. Create `public/images/film/<beat>.webp` y `<beat>-m.webp`. Regenerate `public/video/home-film-m.mp4`.

- [ ] **Step 1:** Test que falla: con movimiento reducido, al llegar a una sección el póster cambia al fotograma de esa sección y no se pide ningún `.mp4`.
- [ ] **Step 2:** Encuadre vertical plano por plano (`crop` con `x` dependiente del tiempo); hoja de contactos revisada a ojo; peso ≤ 12 MB.
- [ ] **Step 3:** Un fotograma por tramo en ambas proporciones; `ScrollFilm` los cambia en modo fijo.
- [ ] **Step 4:** Tests en verde, capturas, commit.

### Task 4: Verificación final y entrega

- [ ] **Step 1:** Gates completos: Biome, `tsc`, build, `test:unit`, `test:e2e`, `csp-check`.
- [ ] **Step 2:** Lighthouse 13 de las 5 páginas (`LH_TAG=landing-lh13`) contra `base-lh13`; tabla y desviaciones en `docs/perf-report.md`.
- [ ] **Step 3:** Revisión independiente de la rama; una pasada de correcciones con test primero.
- [ ] **Step 4:** Push, Preview y entrega a Erick. Merge solo con su «sí».

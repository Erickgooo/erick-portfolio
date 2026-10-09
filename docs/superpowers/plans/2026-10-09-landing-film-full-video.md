# Landing con película de scroll — Plan B1: la película recorre el video entero

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el scroll de la Home termine el video completo (24,8 s), añadiendo sobre la película las secciones del argumento que faltaban: problema, solución, cuatro beneficios y proceso.

**Origen:** Erick aprobó el aspecto en la puerta del Plan A («está bien») y pidió que el scroll termine todo el video. Ejecución directa, como el Plan A.

**Spec:** `docs/superpowers/specs/2026-10-09-landing-film-home-design.md` (§2 filas 3–5, §3 copy, §4). Restricciones globales: las del Plan A (`2026-10-09-landing-film-look-gate.md`).

**Fuera de este plan (Plan B2):** secciones planas (casos, bloque de contratación, FAQ, CTA final), reencuadre vertical del video, fotogramas por sección para movimiento reducido, limpieza de los componentes «Blueprint», Lighthouse y revisión independiente.

## Review Focus

1. **El último tramo termina el video:** al final de la sección de proceso, `currentTime` está a menos de 0,3 s del final. Test `the last film section ends the video`.
2. **Sección sin tramo asignado:** una sección con un `data-film-beat` que no exista en `FILM_BEATS` congelaría el video. Test `every film section has a beat`.
3. **Caso de estudio protegido:** el enlace de un beneficio no se muestra si su ruta está protegida por contraseña.

### Task 1: Tramos completos y secciones del argumento

**Files:**
- Modify: `src/components/film/filmMap.ts`, `src/components/film/FilmSection.tsx`, `FilmSection.module.scss`, `src/resources/landing.ts`, `src/components/landing/Hero.tsx`, `landing.module.scss`, `src/app/page.tsx`
- Create: `src/components/landing/Argument.tsx`
- Test: `tests/unit/filmMap.spec.ts`, `tests/e2e/film.spec.ts`

**Mapa de tramos** (planos comprobados a ojo en `.perf/film-check/rest.jpg`):

| Tramo | Segundos | Plano | Pantallas de scroll |
|---|---|---|---|
| `hero` | 0 – 3.17 | Escritorio y teclado | 2 |
| `tagline` | 3.17 – 7.03 | Rostro y perfil | 2.5 |
| `problem` | 7.03 – 9.50 | Mano en el mouse | 1.5 |
| `solution` | 9.50 – 12.40 | Erick en el escritorio, plano abierto | 1.5 |
| `benefit-1` | 12.40 – 14.00 | Monitores con gráficas | 1.5 |
| `benefit-2` | 14.00 – 15.55 | De espaldas en el escritorio | 1.5 |
| `benefit-3` | 15.55 – 18.60 | Mano en macro, de frente | 1.5 |
| `benefit-4` | 18.60 – 20.77 | Perfil y escritorio | 1.5 |
| `process` | 20.77 – 24.80 | Planos finales | 2 |

Destellos añadidos al velo: 8.6–9.4, 13.85–14.2 y 20.6–21.0 s.

- [x] **Step 1:** Tests que fallan: en `filmMap.spec.ts`, `the beats cover the whole film without gaps`; en `film.spec.ts`, `every film section has a beat`, `the last film section ends the video`, `each benefit shows its figure and links to its case study` y `the argument is in the server HTML`.
- [x] **Step 2:** Verlos fallar (`npx playwright test --project=unit tests/unit/filmMap.spec.ts` y `--project=chromium tests/e2e/film.spec.ts`).
- [x] **Step 3:** `FILM_BEATS` y `FILM_FLASHES` completos; `FilmSection` con prop `fade` (entrada y salida ligadas a `--film-section`, apagada en el hero); copy en `landing.ts`; `Argument.tsx` con las siete secciones; estilos; `<Argument />` después de `<Tagline />`.
- [x] **Step 4:** Verlos pasar en los cuatro navegadores, más `tagline`, `cls`, `smoke` y `ssr-content`.
- [x] **Step 5:** Capturas de cada sección en desktop y móvil, revisadas a ojo.
- [x] **Step 6:** Gates (Biome, `tsc`, build, First Load JS), commit, push y Preview.

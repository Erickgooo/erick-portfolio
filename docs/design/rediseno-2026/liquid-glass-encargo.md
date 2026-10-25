# Encargo: Liquid Glass en la capa flotante (Erick, 2026-10-25)

Este encargo llegó desde la sesión que sirve de canal con Erick; el prompt lo preparó con Lyra.

- **Rama:** `feat/liquid-glass` (worktree `.claude/worktrees/liquid-glass`), desde `origin/main` en `5e6a64b`, que es el punto de regreso.
- **Decisiones:** en la sección nueva de `README.md` y como D11 en adelante en `pulido-animaciones.md`.

## Objetivo

Erick da el portafolio por terminado y quiere un último pulido visual: un Liquid Glass elegante «a lo Apple» y animaciones pulidas. Como antes rechazó el vidrio («se ve hecho por IA») y el pase «apple-design» de la Home, el vidrio entra solo donde Apple lo usa: en la capa que flota sobre el contenido. El resto del sitio queda como está.

## Qué cambia de los documentos anteriores

Solo tres puntos:

- Se levanta la prohibición del vidrio («frosted glass panels» en `lab-contrato.md`, «Nada de vidrio» en `sobrio-encargo.md`), solo para la capa flotante.
- Se aprueba un restyle visual del chatbot. Su lógica (`FaqChatbot*`, `/api/chatbot`) no se toca.
- Se puede consultar la skill `apple-design`, solo para los principios de Liquid Glass de la capa flotante.

Todo lo demás sigue en pie: no se tocan la CSP, los headers ni el resto de `next.config.mjs`, `middleware.ts`, la auth ni `.env.local`; las piezas de Visual Work y de los casos no se abren, describen ni evalúan; responsive de 360 a 1440 px, objetivos táctiles de 44 px, `prefers-reduced-motion`, y ninguna dependencia de animación nueva sin preguntar.

## Alcance

- **Con vidrio:** el header en pastilla (sin menú móvil nuevo), la burbuja y el panel del chatbot (solo el aspecto) y el botón de reproducción de `YouTubeFacade`.
- **Candidatos, fuera de este paso:** el visor de la galería (`workbench/gallery/Viewer.tsx`, vive sobre piezas que no se abren) y `PasswordPrompt` (auth).
- **Fuera de alcance:** texto, tarjetas, figuras, escenas, el banco del héroe, la intro, el halo del cursor y los puntos del fondo.

Lo que hace que se sienta Apple y no plantilla: lente o refracción en los bordes, un brillo especular fino que responde al puntero, un tinte que se adapta a lo que pasa por debajo, el contenido que se desliza por detrás y la legibilidad primero.

- Contraste de texto de al menos 4,5:1 sobre las superficies del sitio. Sobre media no se mide: la garantiza una opacidad mínima del tinte, que se fija y se anota.
- Sin refracción, el respaldo es desenfoque de 8 a 16 px con tinte.
- Los degradados `fadeTop`/`fadeBottom` pueden quitarse si el vidrio los reemplaza.
- Vidrio sobre vidrio: la pieza de arriba lleva un tinte más denso.
- Vetado (se lee como «IA»): paneles lechosos con mucho desenfoque, bordes arcoíris o iridiscentes, resplandores de neón, sombras grandes, texturas de ruido y vidrio en bloques de contenido.

## Movimiento

D1–D10 se conservan y lo nuevo usa sus tokens:

- el brillo sigue al puntero como una capa que se desplaza con `transform`; en táctil queda quieto o responde al scroll;
- la pastilla cambia de estado al hacer scroll con fundidos o desplazamientos, sin animar ancho, alto, radio ni filtro;
- la burbuja del chatbot se abre en panel con el mismo criterio;
- al pulsar, la respuesta de D6 (baja 1 px y vuelve);
- el tinte se adapta con un fundido de opacidad entre capas fijas;
- View Transitions solo sin dependencias nuevas y sin tocar `next.config.mjs`; si no, se proponen en el informe.

En móvil nada depende del hover y con movimiento reducido el vidrio se ve quieto y completo.

## Orden

1. Worktree y rama desde `origin/main`.
2. Dos variantes en la Home y el caso de LeadBot: a, «Vidrio claro» (lente y brillo contenidos), y b, «Vidrio líquido» (refracción visible en los bordes con un filtro SVG donde el navegador lo soporte, desenfoque en Safari y Firefox, y más movimiento). `?v=a` / `?v=b`, sin parámetro la a. El interruptor es temporal y no llega a `main`.
3. Parar y entregar en `docs/design/screens/liquid-glass/` (fuera de git): capturas a 390 y 1440 px en claro y oscuro con contenido bajo el header (sin máscara para Erick; con `--mask-media` las de revisión), unos 6 fotogramas por interacción, la tabla Variante | Qué lleva vidrio | Movimiento nuevo | Lighthouse | URL local, y la recomendación en una línea.
4. Con su elección: quitar la variante descartada y el interruptor, llevar el vidrio a todas las páginas y cerrar con los checks.

## Terminado

- `npx tsc --noEmit`, Biome (gate y `biome check` sobre contenido LF), `npm run build`, `npm run test:unit` y `npm run test:e2e` pasan; las pruebas que dependan del aspecto anterior se actualizan, no se borran; una e2e comprueba que con movimiento reducido nada nuevo se anima.
- Sin scroll horizontal ni errores de consola de 360 a 1440 px, en claro y oscuro, en Chromium, Firefox y WebKit, con el respaldo legible.
- Lighthouse móvil A/B intercalado contra `main` (5 rondas, `next start`, Edge): Home y Projects no bajan más de 3 puntos de la mediana de `main` y el CLS no empeora.

**Permisos:** cualquier push de rama necesita antes el permiso de Erick; el merge o push a `main`, su sí explícito.

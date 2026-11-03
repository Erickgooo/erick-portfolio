# Posicionamiento «Growth & AI Systems Lead» (Erick, 2026-11-03)

Encargo de Erick (vía Lyra): aplicar la revisión externa del portafolio, que él aceptó. Cubre siete frentes:

- una sola identidad profesional;
- una Home orientada al trabajo reciente;
- un pase de confidencialidad a alto nivel;
- tres artículos nuevos en el blog;
- un CV nuevo;
- SEO;
- accesibilidad.

Datos de la rama:

- **Rama:** `feat/posicionamiento-2026` (worktree `.claude/worktrees/posicionamiento`), creada desde `origin/main`.
- **Punto de regreso:** `c17e168`, el main que estaba en producción al empezar.
- **Lista de validación:** `validacion-confidencial.md`. Recoge cada pasaje que nombra a un cliente, cita una cifra o describe arquitectura, seguridad o procesos, con quién debe validarlo.
- **Fuera de alcance:**
  - la versión en español, que queda como siguiente fase;
  - el correo con dominio propio, que es una acción de Erick;
  - cualquier demo o captura nueva de productos de clientes.

## Decisiones

- **D27. Un título paraguas.**
  - «Growth & AI Systems Lead» va en `profile.role` y, desde ahí, en:
    - el héroe y About;
    - el pie;
    - la tarjeta OG que se dibuja;
    - la imagen OG de la Home;
    - el CV;
    - la presentación de ErickBot (su saludo y su prompt).
  - «Operations Manager» queda solo donde se describe el cargo en Incentiva:
    - la experiencia;
    - el CV;
    - el índice `/work/incentiva-group`;
    - el `team.role` de los casos;
    - las respuestas de ErickBot sobre ese trabajo.
- **D28. Fuera las frases de departamento.**
  - Se retiraron «one-person» (en sus cuatro formas), «agency scale», «department buildout», «team of one», «replaced a crew» y «built by one person, usually in hours».
  - Quedan los hechos concretos: «as the sole marketer», «I ran the production pipeline end to end», «a solo freelance engagement».
  - `homeCopy` (los textos viejos del héroe, que ya no mostraba ninguna página) se borró. Contenía «Outperform Full Departments», y ErickBot lo leía como «featured project».
- **D29. El héroe.**
  - Lleva el antetítulo «Growth / AI / Systems», el título, el titular y la entradilla del encargo.
  - El orden de las acciones es el del encargo:
    - «Explore my work» es la tecla principal, en cobalto, y lleva a `/work`;
    - «Book a call» es la secundaria, una tecla de filo en tinta;
    - «Experience & Resume» es el enlace de texto.
  - En teléfono las dos teclas son más compactas y comparten fila desde 360 px. Apiladas, empujaban la tablet del banco (el elemento LCP) fuera de la primera pantalla.
  - El antetítulo usa Poppins: la fuente mono no se precarga y entraría tarde.
- **D30. El banco.**
  - Lleva tres cifras: 2M+ (la de Incentiva, con el acento, a ancho completo en teléfono), 338K+ y 3,177. Sale el 85 %.
  - La pieza de Artesa (panettone, 4:5) se cambia por el estado final de la escena publicada del caso Samsung × LifeMiles, en la misma casilla y con la misma proporción.
- **D31. Cuatro destacados con categoría**, en `src/resources/home.tsx`:
  - Acquisition: DIRECTV;
  - Automation: Samsung × LifeMiles;
  - Product: Scope;
  - Operations: ChatFlow.
  - La rejilla es de 2 × 2 hasta 1280 px y de una fila de cuatro desde ahí. ErickBot los nombra.
  - Quick Metal Shop y los demás casos anteriores siguen en `/work`.
  - El caso ChatFlow pasa a «Running and Scaling a WhatsApp AI Platform», contado como operación: CI/CD, observabilidad, versiones y el portal del cliente.
- **D32. La ruta para reclutadores.**
  - «Experience & Resume» (`/about#experience`) está en la cabecera, en el héroe y en cada cierre.
  - En la cabecera, la etiqueta se ve desde 1280 px; por debajo, la tecla muestra su icono y conserva el nombre para lectores de pantalla.
  - La ubicación y la hora se ven desde 1024 px: entre 769 y 1023 px, la píldora con la tecla nueva las tapaba.
  - La sección de experiencia lleva el ancla, `scroll-margin` para la cabecera fija y, al inicio, «Download the resume (PDF)» como tecla principal.
  - En los cierres, «Book a call» es la acción principal y «Experience & Resume» la secundaria; el correo queda debajo.
- **D33. Títulos.**
  - `fullTitle()` en `utils/seo.tsx` añade « · Erick Mahecha» a cada página que no lo lleve: «About · Erick Mahecha», «Projects · …», «Insights · …», casos y artículos.
  - La Home es «Erick Mahecha · Growth & AI Systems Lead».
  - La tarjeta OG que se dibuja sigue tomando el título corto, el único que su ruta acepta.
  - El blog se llama «Insights»: con cuatro entradas, «& Setup» ya no describía la sección.
- **D34. Pase de confidencialidad a alto nivel.** Está detallado en `validacion-confidencial.md`.
  - Las portadas de ChatFlow y Samsung son imágenes de sus escenas, así que se regeneraron desde las escenas actuales con `scripts/design/covers.mjs --scenes`. La de ChatFlow decía «backup.zip» y «3 audits, 100+ findings». La de Samsung decía «earned by buyers» y además tenía el «2M+» encimado sobre su texto, un fallo que ya estaba en producción: la cifra ya no se encoge.
- **D35. Sin cifras nuevas de impacto.**
  - La base no trae indicadores de negocio verificados para DIRECTV, Scope ni ChatFlow que no sean confidenciales.
  - En la lista de validación quedan como «indicador de impacto por obtener».
  - No se publica cuánto tardó Erick en construir nada.
- **D36. Tres artículos, con portadas en código** (`scripts/design/covers.mjs`, sin Higgsfield).
  - Los artículos:
    - `designing-a-multi-client-platform`;
    - `operable-whatsapp-ai-assistants`;
    - `running-projects-with-ai-agents`.
  - Todos tienen fecha 2026-11-03. Con la fecha empatada, el orden es alfabético, así que el artículo multicliente encabeza el blog.
  - Solo usan las cifras autorizadas y los resultados propios ya publicados.
- **D37. El CV se genera desde los datos del sitio** (`scripts/resume/build-resume.mjs`).
  - El script compila `about.tsx` y `profile.ts` con el TypeScript del repo y los renderiza con react-dom. Luego lo imprime con el Chromium de Playwright: 2 páginas Letter, texto seleccionable y Montserrat y Poppins incrustadas.
  - Lo que el sitio no tiene sale del CV anterior: el teléfono, el lugar de cada cargo y los años de estudio.
  - Los bullets de los cargos anteriores se eligen por índice para que quepa en dos páginas.
- **D38. Accesibilidad.**
  - «Skip to content» es la primera tecla de cada página.
  - Hay un anillo de foco cobalto de especificidad cero para lo que no dibuja uno propio.
  - En el escenario de marcas, el lector de pantalla oye solo la cifra final, nunca la cuenta.
  - Las escenas ya eran `aria-hidden` y quedaban quietas en su estado final con movimiento reducido.
  - La prueba de axe usa el `axe-core` que ya trae Lighthouse, así que no suma ninguna dependencia.
- **D39. Una excepción en las búsquedas.**
  - «HMAC» aparece 4 veces en `src/utils/auth.ts`: es la cookie de la puerta con contraseña del propio sitio, y Web Crypto exige el nombre del algoritmo.
  - No es contenido publicado ni de ningún cliente, así que se deja.

## Resultados

(Se completan en la puerta.)

# Lista de validación confidencial (2026-11-03)

Encargo de Erick (vía Lyra): aplicar la revisión externa del portafolio. Esta lista acompaña el pase de confidencialidad a alto nivel de la rama `feat/posicionamiento-2026`. Erick la usa para validar cada pasaje con su responsable.

- **Qué hay aquí:** los pasajes que quedan publicados y nombran a un cliente, citan una cifra o describen arquitectura, seguridad, procesos o indicadores. El texto va tal como se lee en el sitio, en inglés.
- **Quién valida:** se indica por rol, nunca por nombre.
- **Estado:** todo empieza en «pendiente». Cuando un responsable lo apruebe, cambia a «validado» con la fecha; si pide cambios, a «cambiar» con la nota.
- **Tipos:** cliente, cifra, arquitectura, seguridad, proceso, indicador.

## Qué se llevó a alto nivel en esta ronda

Se quitaron o se reescribieron en términos generales:

- los conteos y el detalle de auditorías y hallazgos («three audits with more than 100 findings», «more than 170 findings»), que pasan a «I led the security reviews and their remediation»;
- el modelo de amenazas y la matriz OWASP (ASVS, MASVS);
- las especificaciones criptográficas y de secretos (Key Vault, el segundo factor «time-based», el «default-deny gateway»), que pasan a «hardened sign-in with two-factor authentication and encrypted secrets»;
- el conteo de endpoints del diagnóstico de Scope («87 endpoints»);
- las frases sobre debilidades pasadas de productos en uso: que la API no comprobaba rol ni cliente, «backups, zip deploys», «lost messages», «lost records, failing photo uploads and broken sessions», el cierre en el arranque de iOS, el carrusel con un número desactualizado, que el concesionario «had not sold yet»;
- las etapas internas de despliegue y los paquetes de rollback de Scope;
- los indicadores internos de proceso: commits, pull requests, archivos, números de build y de versión, el arnés de 400 de 414 escenarios y las 6 versiones del deck;
- los volúmenes operativos (visitas verificadas por GPS, puntaje de riesgo de fraude).

También salió el cuarto indicador del héroe (85 %) y la Home ya no destaca Quick Metal Shop.

**Se mantienen** los clientes nombrados (Nequi, Wompi, Colmaíz/Ingredion, Samsung y DIRECTV como canal de distribuidor), las tres cifras autorizadas (2M+ millas LifeMiles; 35,000+ contactos y 6,000+ atendidos en Colmaíz), los nombres de tecnologías del stack y los resultados propios que no son de seguridad.

## Home (`/`)

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| «2M+ · LifeMiles miles awarded through a chatbot I led at Incentiva Group» (banco del héroe) | cifra | CEO de Incentiva; contacto de Samsung; contacto de LifeMiles | pendiente |
| «3,177 · automated tests» (banco del héroe) | indicador | CEO de Incentiva | pendiente |
| Pieza del banco: el estado final de la escena del caso Samsung × LifeMiles (factura por OCR, IMEI de ejemplo, «2M+ LifeMiles miles awarded through the chatbot») | cliente | CEO de Incentiva; contacto de Samsung | pendiente |
| Escenario de marcas: «Scope, the custom field-sales app I lead at Incentiva Group for Nequi’s field teams.» · «13» | cliente | CEO de Incentiva; contacto de Nequi | pendiente |
| Escenario de marcas: «Wompi went live on the same Scope platform, with its own data and roles.» · «146/146» | cliente | CEO de Incentiva; contacto de Wompi | pendiente |
| Escenario de marcas: «The WhatsApp AI assistant I directed on ChatFlow for Colmaíz (Ingredion).» · «35,000+» | cliente, cifra | CEO de Incentiva; contacto de Colmaíz (Ingredion) | pendiente |
| Escenario de marcas: «The WhatsApp chatbot I led for the Samsung × LifeMiles campaign.» · «2M+» | cliente, cifra | CEO de Incentiva; contacto de Samsung | pendiente |
| Escenario de marcas: «The click-to-WhatsApp sales channel I led for Incentiva as an authorized DIRECTV dealer.» · «62» | cliente | CEO de Incentiva (como distribuidor autorizado) | pendiente |
| Destacado **Acquisition**: DIRECTV, «62 · creatives across six rounds» | indicador | CEO de Incentiva | pendiente |
| Destacado **Acquisition**: sin indicador de negocio (leads, coste por lead y ventas son confidenciales) | indicador | CEO de Incentiva | **indicador de impacto por obtener** |
| Destacado **Automation**: Samsung × LifeMiles, «2M+ · LifeMiles miles awarded through the WhatsApp chatbot I led at Incentiva Group» | cliente, cifra | CEO de Incentiva; contacto de Samsung | pendiente |
| Destacado **Product**: Scope, «146/146 · rollout checks passed» | indicador | CEO de Incentiva | pendiente |
| Destacado **Product**: sin indicador de negocio propio verificado (por ejemplo, clientes o líneas en la plataforma) | indicador | CEO de Incentiva | **indicador de impacto por obtener** |
| Destacado **Operations**: ChatFlow, «Running and scaling an AI platform in production: CI/CD, observability, releases and the client portal.» · «3,177 · automated tests, from none» | proceso, indicador | CEO de Incentiva | pendiente |
| Destacado **Operations**: sin indicador de negocio (disponibilidad, tiempo ahorrado al negocio) | indicador | CEO de Incentiva | **indicador de impacto por obtener** |
| «What I build»: «Incentiva Group: Scope for Nequi and Wompi, the Incentiva Portal, ChatFlow» · «Field apps, client portals and dashboards that run the operation, with releases, reviews and tests behind them.» | cliente, proceso | CEO de Incentiva | pendiente |
| «Growth, and the systems behind it»: «At Incentiva Group, I led projects for Nequi, Wompi, Colmaíz and Samsung, and I lead the company’s field-sales app, client portal and WhatsApp AI platform.» | cliente | CEO de Incentiva | pendiente |

## About (`/about`)

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| Resumen del cargo: «At Incentiva Group, a marketing agency in Medellín, I led projects for Nequi, Wompi, Colmaíz and Samsung. As Operations Manager I report to the CEO, lead a team of two and run the company's in-house software…» | cliente, proceso | CEO de Incentiva | pendiente |
| «Took over three production platforms, among them ChatFlow, which runs the Colmaíz (Ingredion) WhatsApp assistant… more than 13,000 automated tests.» | cliente, indicador | CEO de Incentiva; contacto de Colmaíz (Ingredion) | pendiente |
| «Architected the move of Scope… with a database per client and fail-closed tenant isolation. Wompi went live on the same platform, and the rollout passed 146 of 146 checks.» | arquitectura, indicador | CEO de Incentiva; contacto de Wompi | pendiente |
| «Shipped the field-sales app's first iOS release and 13 production versions… resolving three App Store review rejections.» | indicador | CEO de Incentiva | pendiente |
| «Launched a sales channel end to end for Incentiva as an authorized DIRECTV dealer… a Meta click-to-WhatsApp campaign with 7 ads and 62 creatives…» | cliente, indicador | CEO de Incentiva | pendiente |
| «Led the security reviews of the company's products and their remediation, test-first: hardened sign-in with two-factor authentication, encrypted secrets and tenant-isolation tests.» | seguridad | CEO de Incentiva | pendiente |
| «Led the Samsung × LifeMiles WhatsApp promotion… fraud controls (deterministic IMEI validation and a second model on identity documents). 2M+ LifeMiles miles were awarded to buyers through the chatbot.» | cliente, cifra, seguridad | CEO de Incentiva; contacto de Samsung | pendiente |
| «Redesigned Incentiva's brand identity (a 78-page manual and a 357-file kit)… removing about 750,000 lines of unused template code and halving the client portal's initial bundle.» | indicador | CEO de Incentiva | pendiente |
| «Built proposals and cost models for Samsung, Ingredion, Wompi, Nequi and Mall Indiana…» | cliente | CEO de Incentiva; contactos de Samsung, Ingredion, Wompi, Nequi y Mall Indiana | retirado del sitio (2026-11-03): Erick descartó las propuestas; salió también del CV y de ErickBot |
| Habilidades: «Security reviews and remediation, two-factor authentication, secret management…» · «Azure (App Service, SQL, Application Insights)» | seguridad | CEO de Incentiva | pendiente |

## Projects (`/work`)

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| Franja de cifras y tarjetas de los siete casos de Incentiva (146/146, 13, 3,177, 62, 2M+, 13-point, 28 pages) | cifra, indicador | CEO de Incentiva; contacto de Samsung para 2M+ | pendiente |

## Índice de Incentiva (`/work/incentiva-group`)

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| Cabecera: «Operations Manager · July 2026 – Present · Medellín, hybrid» y el resumen del cargo | proceso | CEO de Incentiva | pendiente |
| «Scope multi-campaign platform: Wompi as a second client and a new Nequi line» · «a database per client and fail-closed tenant resolution» | cliente, arquitectura | CEO de Incentiva; contactos de Wompi y Nequi | pendiente |
| «ChatFlow platform: running and scaling it in production» · «version control, a gated pipeline, observability and 3,177 automated tests» | proceso, indicador | CEO de Incentiva | pendiente |
| «Colmaíz WhatsApp assistant and client portal» · «a community of 35,000+ contacts, 6,000+ served… a client-role portal reconciled against the API, Excel and SQL» | cliente, cifra | CEO de Incentiva; contacto de Colmaíz (Ingredion) | pendiente |
| «Samsung × LifeMiles WhatsApp promotion assistant» · «2M+ LifeMiles miles were awarded through it» | cliente, cifra | CEO de Incentiva; contacto de Samsung | pendiente |
| «Wompi manager dashboard with two-factor login» · «behind hardened sign-in with two-factor authentication» | cliente, seguridad | CEO de Incentiva; contacto de Wompi | pendiente |
| «Scope visit heat map, visit verification and client report» (Nequi and Wompi) | cliente, proceso | CEO de Incentiva; contactos de Nequi y Wompi | pendiente |
| «Azure cloud and DevOps for Scope and Portal» · «CI/CD for the Scope API and the Portal, a QA environment and encrypted secrets» | arquitectura | CEO de Incentiva | pendiente |
| «Scope and Portal security reviews and hardening» · «Hardened sign-in with two-factor authentication and encrypted secrets; I led the security reviews and their remediation.» | seguridad | CEO de Incentiva | pendiente |
| Propuestas con cliente nombrado: Samsung (cotización), Wompi y Nequi (BPO), Mall Indiana (fidelización), Ingredion (Salesforce, presentación de resultados) | cliente | CEO de Incentiva; contacto de cada cliente | retirado del sitio (2026-11-03): el grupo «Commercial proposals and cost models» (P05, P16, P22, P25 y P26) se borró del índice, del CV y de ErickBot |
| «Client figures and internal economics stay with the clients.» | proceso | CEO de Incentiva | pendiente |

## Casos

### `/work/scope-multi-client-platform`

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| «Scope is Incentiva's custom-built app to run the field teams it operates for Nequi and Wompi.» | cliente | CEO de Incentiva; contactos de Nequi y Wompi | pendiente |
| «a read-only diagnosis of the app, the API, the portal and the cloud setup: for every route, who can call it…» | arquitectura | CEO de Incentiva | pendiente |
| «a database per client… a campaign-resolution layer… takes the campaign from the user's signed-in session… It fails closed» | arquitectura, seguridad | CEO de Incentiva | pendiente |
| «every route needs a cross-tenant isolation test, or a written exemption» | seguridad, proceso | CEO de Incentiva | pendiente |
| «The rollout was staged, with checks before every step and a way back at each of them.» · «146 checks passed and 0 failures» | proceso, indicador | CEO de Incentiva | pendiente |
| «What the business gained: Incentiva can now serve a second financial client on the platform it already runs, with each client's data kept apart. Adding a campaign became configuration instead of a project.» | indicador | CEO de Incentiva | pendiente |

### `/work/scope-ios-launch`

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| «13 production versions across the App Store and Google Play» · «three App Store review rejections» · «approved for unlisted distribution» | indicador, proceso | CEO de Incentiva | pendiente |
| «moving the app's Firebase project… into the company's ownership» | arquitectura | CEO de Incentiva | pendiente |
| «Background GPS… a native location monitor» · «a mandatory-update mechanism» · «the app moved to Apple's UIScene lifecycle» | arquitectura | CEO de Incentiva | pendiente |
| «What the business gained: Field staff on iPhones can now work in the app, and Incentiva owns what it needs to keep shipping it. When a coordinator reports a problem from the field, the answer is a version and a date.» | indicador | CEO de Incentiva | pendiente |

### `/work/chatflow-whatsapp-ai-platform`

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| «I lead ChatFlow… and on it the WhatsApp assistant of Colmaíz, Ingredion's brand… from Colmaíz and the Samsung × LifeMiles promotion… to the sales line of Incentiva as an authorized DIRECTV dealer» | cliente | CEO de Incentiva; contacto de Colmaíz (Ingredion) | pendiente |
| «When I took it on, it had no automated tests yet» · «from no tests to 3,177 passing tests» | indicador | CEO de Incentiva | pendiente |
| «I led the code and security reviews of the platform and their remediation» | seguridad | CEO de Incentiva | pendiente |
| «AI usage tracked per client and per campaign, and personal data masked in telemetry» | arquitectura | CEO de Incentiva | pendiente |
| «a dashboard with Excel export, read-only live chats, and location views that tell the team who to call» · «643 dashboard figures were reconciled three ways» | cliente, indicador | CEO de Incentiva; contacto de Colmaíz (Ingredion) | pendiente |
| «it runs on a faster, lower-cost model» · «from 270 to 318 of 320» | indicador | CEO de Incentiva | pendiente |
| «a community of 35,000+ contacts, with 6,000+ served» | cifra | contacto de Colmaíz (Ingredion) | pendiente |
| «What the business gained: Incentiva runs several client lines on one platform, and a small team can change it with confidence that no client will notice. Colmaíz's commercial team now has its own view of its conversations and uses it daily.» | indicador, cliente | CEO de Incentiva; contacto de Colmaíz (Ingredion) | pendiente |

### `/work/directv-click-to-whatsapp`

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| «Incentiva is an authorized DIRECTV dealer, selling to consumers in Antioquia. The CEO asked for a plan…» | cliente | CEO de Incentiva | pendiente |
| «A competitor audit in the Meta Ad Library… competing on Meta rather than on search» · «spend only scales when the cost per lead is below break-even» | proceso | CEO de Incentiva | pendiente |
| «Its prompt and knowledge base live in git, and the loader refuses any change that has not been merged.» · «Back-end guards check every reply for length, prices and off-topic answers» | arquitectura | CEO de Incentiva | pendiente |
| «ChatFlow sends a QualifiedLead event to the Meta Conversions API, and a Purchase event when a sale closes. A Google Sheets row sync…» | arquitectura | CEO de Incentiva | pendiente |
| «62 images, 7 ads and 26 placement previews» | indicador | CEO de Incentiva | pendiente |
| «What the business gained: Incentiva owns a digital sales channel it can read: each lead arrives pre-qualified and with consent, and each sale reports back to the ad platform that produced it. The advisor who closes the sale gets only the conversations worth closing.» | indicador | CEO de Incentiva | pendiente |
| Sin indicador de negocio del canal | indicador | CEO de Incentiva | **indicador de impacto por obtener** |

### `/work/samsung-lifemiles-whatsapp`

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| Título y resumen: «Samsung: LifeMiles on WhatsApp, a Promotion I Led at Incentiva Group» · «More than 2 million LifeMiles miles were awarded through it.» | cliente, cifra | CEO de Incentiva; contacto de Samsung; contacto de LifeMiles | pendiente |
| «Buyers of a Galaxy from the S26 family received LifeMiles miles…» | cliente | contacto de Samsung | pendiente |
| «Deterministic IMEI validation… A second, independent model for identity documents… Promotion-validity blocking» | seguridad | CEO de Incentiva; contacto de Samsung | pendiente |
| «its data blocks are filtered out before any message is sent» · «every chat received a fixed notice once, and then the assistant went silent» | arquitectura, proceso | CEO de Incentiva | pendiente |

### `/work/incentiva-launch-campaign` y `/work/incentiva-website-brand`

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| «13-point QA passed by both videos» · el proceso de grabación cuadro a cuadro del sitio | proceso, indicador | CEO de Incentiva | pendiente |
| «a 78-page manual and a 357-file kit» · «28 pages» · «Built; launch pending» | indicador | CEO de Incentiva | pendiente |

## Visual Work (`/gallery`)

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| Capturas del sitio corporativo de Incentiva (sin lanzar) y del manual de marca 2026 | proceso | CEO de Incentiva | pendiente |

## ErickBot (`/api/chatbot` y preguntas frecuentes)

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| Se presenta como «Erick Mahecha, Growth & AI Systems Lead»; el cargo oficial es «Operations Manager at Incentiva Group» | proceso | CEO de Incentiva | pendiente |
| Repite los casos, el índice y las tres cifras autorizadas; declara confidencial cualquier otra cifra de cliente | cliente, cifra | CEO de Incentiva | pendiente |
| Pregunta frecuente «What is his most notable work?»: los cuatro destacados con 62, 2M+ y 3,177 | cliente, cifra | CEO de Incentiva; contacto de Samsung | pendiente |

## Blog (artículos del 2026-11-03)

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| `/blog/designing-a-multi-client-platform`: «Scope, the custom app that runs the field teams Incentiva operates for Nequi, when Wompi came on as a second client» · las lecciones generales (una base por cliente, fallar cerrado, una prueba por ruta) · «146 of 146 checks» | cliente, arquitectura | CEO de Incentiva; contactos de Nequi y Wompi | pendiente |
| `/blog/operable-whatsapp-ai-assistants`: el asistente de Colmaíz, la línea de DIRECTV y el chatbot de Samsung × LifeMiles · la verificación Luhn, el segundo modelo y el bloqueo por vigencia · «more than 2 million LifeMiles miles» · «from 270 to 318 of 320» · la Ley 1581 | cliente, cifra, seguridad | CEO de Incentiva; contactos de Samsung y Colmaíz (Ingredion) | pendiente |
| `/blog/running-projects-with-ai-agents`: «from no tests to 3,177 automated tests» · «13 production releases» · el método (especificación, registro de decisiones, pruebas, puertas) | indicador, proceso | CEO de Incentiva | pendiente |

## CV (`/resume/Erick_Mahecha_Resume.pdf`)

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| Los ocho bullets de Incentiva, iguales a los de About | cliente, cifra, seguridad | CEO de Incentiva | pendiente |
| Datos de contacto: ciudad, correo, teléfono, LinkedIn y sitio | proceso | Erick | pendiente |

## Cifras de clientes anteriores a Incentiva

Estas cifras ya estaban publicadas antes de esta ronda y quedaron fuera del pase, que cubre a Incentiva y sus clientes. Se listan para que Erick decida si las valida también.

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| «338K+ · organic views» (Quick Metal Shop; banco del héroe y caso) | cifra | contacto de Quick Metal Shop | pendiente |
| «3.92x · ROAS» (caso de anuncios con IA) | cifra | contacto de Quick Metal Shop | pendiente |
| «85% · conversations automated» (Artesa, caso LeadBot y About) | cifra | contacto de Artesa Panadería | pendiente |
| «200+ · leads/day» (Cuatrimotos ATV Riders, caso y About) | cifra | contacto de Cuatrimotos ATV Riders | pendiente |

## Metadatos de búsqueda (ronda 10, 2026-11-05)

Líneas nuevas que no se ven en la página, pero que Google y las tarjetas para compartir muestran. Cada una recorta un texto ya publicado en su misma página.

| Pasaje publicado | Tipo | Valida | Estado |
|---|---|---|---|
| Título, `/work/atv-riders`: «ATV Riders: WhatsApp Lead Automation · Erick Mahecha» | cliente | contacto de Cuatrimotos ATV Riders | pendiente |
| Descripción, `/work/atv-riders`: «WhatsApp automation for a high-volume ATV dealership: a chatbot filters 200+ daily Meta leads and routes only sales-ready prospects to the commercial team.» | cifra | contacto de Cuatrimotos ATV Riders | pendiente |
| Título, `/work/dakoma-roofing`: «Dakoma Roofing: Rebranding & Automation · Erick Mahecha» | cliente | contacto de Dakoma Roofing | pendiente |
| Títulos con Quick Metal Shop: «Quick Metal Shop: ArquiExpo 2026 App · Erick Mahecha», «Quick Metal Shop: The Marketing Function · Erick Mahecha», «Quick Metal Shop: Virality with AI · Erick Mahecha» | cliente | contacto de Quick Metal Shop | pendiente |
| Descripción, `/work/quick-metal-shop-arquiexpo`: «A custom touchscreen app I designed and built for Quick Metal Shop's stand at ArquiExpo 2026, so the sales team could show the full catalog and real projects.» | cliente | contacto de Quick Metal Shop | pendiente |
| Descripción, `/work/quick-metal-shop-marketing`: «As Quick Metal Shop's sole marketer, I built its marketing and digital infrastructure from scratch: brand manual, CRM automation, paid media and AI content.» | cliente | contacto de Quick Metal Shop | pendiente |
| Descripción, `/work/quick-metal-shop-viral-videos`: «An AI video pipeline I ran end to end turned static before/after photos into short-form content: 338K+ organic views across 3 reels with zero ad spend.» | cifra | contacto de Quick Metal Shop | pendiente |
| Título, `/work/samsung-lifemiles-whatsapp`: «Samsung × LifeMiles on WhatsApp · Erick Mahecha» | cliente | CEO de Incentiva; contacto de Samsung | pendiente |
| Descripción, `/work/samsung-lifemiles-whatsapp`: «At Incentiva Group, I led the Samsung × LifeMiles promotion on WhatsApp: a rebuilt chatbot with OCR and fraud controls. 2M+ miles were awarded through it.» | cliente, cifra | CEO de Incentiva; contacto de Samsung | pendiente |
| Descripción, `/work/chatflow-whatsapp-ai-platform`: «At Incentiva Group, I lead ChatFlow, the WhatsApp AI platform behind the Colmaíz (Ingredion) assistant: CI/CD, observability, releases and a client portal.» | cliente | CEO de Incentiva; contacto de Colmaíz (Ingredion) | pendiente |
| Descripción, `/work/directv-click-to-whatsapp`: «I designed and launched an in-house sales channel for Incentiva's DIRECTV dealership: a click-to-WhatsApp campaign and an AI assistant that pre-qualifies leads.» | cliente | CEO de Incentiva (como distribuidor autorizado) | pendiente |
| Descripción, `/work/scope-multi-client-platform`: «I re-architected Scope, Incentiva's custom app for the Nequi and Wompi field teams, so one platform serves several clients, each in its own database.» | cliente, arquitectura | CEO de Incentiva; contactos de Nequi y Wompi | pendiente |
| Descripción, `/work/scope-ios-launch`: «I took a Flutter field-sales app that had never shipped on iOS through signing, background GPS and App Store review to its first iOS release and 13 versions.» | indicador | CEO de Incentiva | pendiente |
| Descripción, `/work/incentiva-launch-campaign`: «A four-piece launch campaign I produced for Incentiva's new website: a reel, a carousel, a LinkedIn document and a LinkedIn video, edited in Remotion.» | cliente, cifra | CEO de Incentiva | pendiente |
| Título y descripción, `/work/incentiva-website-brand`: «Incentiva Group: Website and Brand · Erick Mahecha»; «I redesigned Incentiva's brand identity and built the new website on it: a scroll story around the brand's 3D medal, in WebGL2. Built; launch pending.» | cliente | CEO de Incentiva | pendiente |
| Descripción, `/work/incentiva-group`: «Erick Mahecha's role as Operations Manager at Incentiva Group: in-house software, client operations, paid media, brand and compliance, with seven case studies.» | cliente, cifra | CEO de Incentiva | pendiente |
| Datos estructurados de todas las páginas: `worksFor`, «Incentiva Group» | cliente | CEO de Incentiva | pendiente |
| Texto alternativo de las portadas: «Cover of {título del caso}», con los títulos ya publicados, también los que nombran a un cliente | cliente | los mismos responsables de cada caso | pendiente |

## Acciones de Erick fuera del sitio

- Validar cada fila con su responsable.
- Conseguir los indicadores de impacto marcados como «por obtener»; la tabla de `mensaje-impacto-encargo.md` dice quién podría darlos.
- Correo con dominio propio (por ejemplo, en erickmahecha.com): hoy el sitio, el CV y ErickBot usan el de Gmail.
- La versión en español del sitio queda como siguiente fase.

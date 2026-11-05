# Ronda 9: video de About con más calidad (Erick, 2026-11-05)

Encargo de Erick (vía Lyra): el video en bucle de `/about` se ve muy pixelado. Saber si se puede mejorar sin afectar mucho la carga y elegir entre opciones antes de publicar. Erick eligió la opción c.

- **Rama:** `feat/video-about-calidad` (worktree `.claude/worktrees/video-about`), creada desde `origin/main`.
- **Punto de regreso:** `7cfbee5`, el main que estaba en producción al empezar.
- **Límites por archivo, aprobados por Erick:** hasta 8 000 000 bytes (unos 2,6 Mbps) en viewports de 1024 px o más; hasta 3 611 663 bytes, lo mismo que antes, en viewports menores, incluidos teléfonos en horizontal.

## Causa

Sobre todo compresión. Los datos, con `ffprobe` y Playwright:

| | Códec | Resolución | Mbps | Fotogramas |
|---|---|---|---|---|
| Fuente | HEVC | 3840 × 2160 | 16,95 | 744 a 30 fps |
| Publicado | H.264 | 1280 × 720 | 1,17 | 744 a 30 fps |

El corte es el mismo: el SSIM contra la fuente tiene su pico en el desfase 0 (0,925, contra 0,79 con un fotograma de desfase). El publicado saca VMAF 61 a su propio tamaño y 51 escalado a 1080p.

El marco en píxeles físicos, medido con el marco abierto:

| Viewport | Marco | Sobre 1280 px |
|---|---|---|
| 1366 × 768, DPR 1 | 1201 px | 0,94× |
| 1920 × 1080, DPR 1 | 1632 px | 1,27× |
| 1440 × 900, DPR 2 | 2754 px | 2,15× |
| 390 × 844, DPR 3 | 1170 px | 0,91× |
| 844 × 390, DPR 3 | 1830 px | 1,43× |

Además, el publicado tiene el índice (`moov`) al final del archivo, lo que obliga a una petición de rango extra antes de arrancar.

## Decisiones

- **D58, los archivos:** H.264 1080p de 7,85 MB y AV1 1080p de 4,55 MB para viewports de 1024 px o más; H.264 720p de 3,57 MB para los menores.
- **D59, AV1 solo en viewports grandes:** en teléfonos daría más calidad (VMAF 92 con 2,99 MB), pero no se puede probar la decodificación en teléfonos reales, y sin hardware gasta batería. Queda abierto si algún día se mide.
- **D60, Apple siempre recibe H.264:** el motor WebKit declara AV1 como `probably`, así que `canPlayType` no basta. Se decide con `navigator.vendor === "Apple Computer, Inc."`, que incluye Chrome en iOS.
- **D61, descartados:**
  - H.264 900p de 5,44 MB (opción b): VMAF 83, sin ventaja frente a c, que pesa menos y saca 93;
  - H.264 1440p de 7,90 MB: VMAF 84 a 1080p, peor que 1080p con el mismo peso (89);
  - H.264 900p de 7,85 MB: VMAF 91, pero conserva peor el texto de los monitores que 1080p;
  - `deblock=1,1`: sin cambio medible (89,08 contra 89,12);
  - 576p y 540p en móvil: 2 a 3 puntos más de VMAF, pero a ojo más blandos en cara y texto, y se estiran más con el teléfono en horizontal.
- **D62, póster sin cambios:** ya coincide con el primer fotograma (SSIM 0,955, contra 0,78 con el fotograma 2).
- **D63, `public/videohome.mp4` se queda:** es el punto de regreso del video y el encargo pidió no borrarlo, aunque el sitio ya no lo sirve. Se quitó de `optimize-videos.mjs`, junto con la nota de por qué el video nuevo no va en esa lista.

## Comandos de codificación

Fuente: `D:\Portafolio\Video Home\Video Renderizado\Video Renderizado.mp4`. Son los archivos ya renombrados. Se codifican una vez, desde la fuente; recomprimirlos pierde calidad.

H.264, en dos pasadas (`-pass 1 -f null -`, y luego `-pass 2 -movflags +faststart salida.mp4`):

```sh
ffmpeg -y -i "$SRC" -map 0:v:0 -an \
  -vf "scale=$W:$H:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p" -fps_mode passthrough \
  -c:v libx264 -preset veryslow -profile:v high -level:v $LEVEL -g 250 -keyint_min 25 -refs 4 -bf 5 \
  -b:v $B -maxrate $MAX -bufsize $BUF -x264-params "aq-mode=3:aq-strength=0.8:threads=8" \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -passlogfile pass-$NAME
```

| Archivo | `$W:$H` | `$LEVEL` | `$B` | `$MAX` | `$BUF` |
|---|---|---|---|---|---|
| `videohome-1080.mp4` | 1920:1080 | 4.1 | 2540k | 4000k | 8000k |
| `videohome-720.mp4` | 1280:720 | 3.1 | 1150k | 1600k | 3200k |

AV1 (SVT-AV1 4.2, ffmpeg 9.0):

```sh
ffmpeg -y -i "$SRC" -map 0:v:0 -an \
  -vf "scale=1920:1080:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p" -fps_mode passthrough \
  -c:v libsvtav1 -preset 3 -crf 48 -g 240 -svtav1-params "tune=0" \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -movflags +faststart videohome-av1.mp4
```

Si cambia el AV1, revisa su nivel con `ffprobe`: el `AV1` de `FilmFrame.tsx` (`av01.0.08M.08`) debe coincidir con el archivo.

## Medidas de cada archivo (2026-11-05)

Datos de laboratorio: Chromium, servidor local sin CDN, red limitada por CDP con 150 ms de RTT. Medianas de 3 corridas con caché vacía.

| Archivo | Para quién | Peso | Mbps | VMAF | Tiempo hasta `playing` | Pausas en el primer bucle |
|---|---|---|---|---|---|---|
| `videohome.mp4` (antes) | ≥1024 px, 4 Mbps | 3,61 MB | 1,17 | 51 (a 1080p) | 727 ms | 0 |
| `videohome.mp4` (antes) | <1024 px, 1,6 Mbps | 3,61 MB | 1,17 | 61 (a 720p) | 1058 ms | 0 |
| `videohome-av1.mp4` | ≥1024 px, salvo Apple y navegadores sin AV1 | 4,55 MB | 1,47 | 93 (a 1080p) | 437 ms | 0 |
| `videohome-1080.mp4` | ≥1024 px, Apple y navegadores sin AV1 | 7,85 MB | 2,53 | 89 (a 1080p) | 433 ms | 0 |
| `videohome-720.mp4` | <1024 px | 3,57 MB | 1,15 | 83 (a 720p) | 512 ms | 0 |

- Cada archivo da un `waiting` a los 24,80 s. Es el salto de `loop` al inicio, también en el publicado con el buffer lleno; no cuenta como pausa.
- Comparación a ojo y mismo peso: AV1 de 4,55 MB (VMAF 93) contra H.264 de 4,63 MB (VMAF 72). La mejora se ve en los tres fotogramas revisados (470, 622 y 335).
- El salto del bucle es un corte duro entre dos tomas, también en la fuente: PSNR entre extremos de 10,46 dB en la fuente, 10,72 en el publicado y 10,49 a 10,57 en los nuevos.
- Decodificación en un solo hilo, por bucle de 24,8 s, en la máquina de pruebas: 2,1 s AV1 1080p, 1,7 s H.264 1080p y 0,8 s H.264 720p.

## Sin comprobar

- **Safari y iPhone reales:** WebKit en Windows no decodifica H.264, así que la reproducción no se pudo ver. Sí corre en su motor la prueba `gives each viewport and engine its file`: declara AV1 como `probably` y recibe el H.264.
- **AV1 en equipos sin decodificación por hardware.** En la máquina de pruebas, 0 fotogramas perdidos.
- **Teléfonos y red reales.**

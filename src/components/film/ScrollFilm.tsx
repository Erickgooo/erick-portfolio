"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import styles from "./ScrollFilm.module.scss";
import { type FilmBeat, type SectionBox, activeBeatId, filmTimeAt, veilAt } from "./filmMap";

/** The portrait clip, poster and stills are used whenever the viewport is taller than wide. */
const PORTRAIT = "(orientation: portrait)";

interface ScrollFilmProps {
  src: string;
  srcMobile: string;
  poster: string;
  posterMobile: string;
  /** Folder holding one still per beat: `<id>.webp` and `<id>-m.webp`. */
  stills: string;
  beats: FilmBeat[];
  duration: number;
  /** Opacity of the black veil over the footage, at rest and during the edit's flashes; false removes it. */
  veil?: { base: number; flash: number } | false;
  /** The cursor glow layer above the veil. */
  glow?: boolean;
  /** A thin bar along the bottom of the stage that fills as the film plays. */
  progress?: boolean;
  /**
   * "bleed": the stage fills the viewport behind the content. "window": the stage
   * is a frame the page lays out itself (beside the content, or above it on
   * narrow screens), and sections take over as they reach it.
   */
  layout?: "bleed" | "window";
  className?: string;
  stageClassName?: string;
  trackClassName?: string;
  children: ReactNode;
}

const DEFAULT_VEIL = { base: 0.58, flash: 0.82 };

/**
 * A full-viewport film pinned behind its children and scrubbed by scroll: each
 * child section tagged data-film-beat walks its beat as it crosses the top of
 * the viewport. The clip is fetched once after `load` and played from a Blob,
 * so every seek is instant (with the plain URL as a fallback where a Blob will
 * not play). Reduced motion and the lite tier never download
 * it: they get one still per section instead, and every word of the content.
 */
export function ScrollFilm({
  src,
  srcMobile,
  poster,
  posterMobile,
  stills,
  beats,
  duration,
  veil = DEFAULT_VEIL,
  glow = true,
  progress = false,
  layout = "bleed",
  className,
  stageClassName,
  trackClassName,
  children,
}: ScrollFilmProps) {
  const veilBase = veil ? veil.base : 0;
  const veilFlash = veil ? veil.flash : 0;
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // null until mounted: the clip is chosen on the client, and again when the device is turned.
  const [portrait, setPortrait] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia(PORTRAIT);
    const update = () => setPortrait(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Tells the rest of the page whether the film is still under the nav bar, so the
  // header can keep its labels readable over dark footage whatever the theme
  // (see custom.css). The bar sits at the top on desktop and at the bottom on phones.
  useEffect(() => {
    const root = rootRef.current;
    // A window is laid out on the page's own surface: the header keeps the theme's colours.
    if (!root || layout !== "bleed") return;
    const html = document.documentElement;
    const phone = window.matchMedia("(max-width: 768px)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = phone.matches ? window.innerHeight - 40 : 80;
      html.toggleAttribute("data-past-film", root.getBoundingClientRect().bottom <= line);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    queue();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      html.removeAttribute("data-past-film");
    };
  }, [layout]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!root || !stage || !video || portrait === null) return;
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-film-beat]"));
    // Where a section takes over, and how much of the last section's scroll the
    // stage stays pinned for (the distance from that line to the stage's bottom
    // edge). Full bleed: the top of the viewport. A window: the middle of the
    // reading area, which is the window's own height when the text runs beside it
    // and the space under it when the text runs below.
    const anchor = (): { line: number; pinned: number } => {
      if (layout === "bleed") return { line: 0, pinned: stage.offsetHeight };
      const rect = stage.getBoundingClientRect();
      const stacked = rect.width >= root.clientWidth - 1;
      const line = stacked
        ? rect.bottom + (window.innerHeight - rect.bottom) / 2
        : rect.top + rect.height / 2;
      return { line, pinned: rect.bottom - line };
    };
    const measure = (line = 0): SectionBox[] => {
      const boxes = sections.map((el) => {
        const rect = el.getBoundingClientRect();
        return { id: el.dataset.filmBeat ?? "", top: rect.top - line, height: rect.height };
      });
      // Beside or under a window the first section is already past the line when the
      // page loads. It plays its beat from the first frame instead: from no scroll
      // at all to the point where the second section reaches the line.
      if (layout === "window" && boxes.length > 1) {
        const untilSecond = Math.max(1, boxes[1].top + window.scrollY);
        boxes[0] = { ...boxes[0], top: -window.scrollY, height: untilSecond };
      }
      return boxes;
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || document.documentElement.dataset.fx === "lite") {
      // No video: the poster is swapped for the still of whichever section is on stage.
      const img = stage.querySelector("img");
      const source = stage.querySelector("source");
      let shown = beats[0]?.id ?? "";
      let pending = 0;
      const swap = () => {
        pending = 0;
        const { line } = anchor();
        const id = activeBeatId(
          beats,
          measure(line),
          layout === "bleed" ? stage.offsetHeight / 2 : 0,
        );
        if (!img || id === shown) return;
        shown = id;
        const still = beats.find((beat) => beat.id === id)?.still ?? id;
        if (source) source.srcset = `${stills}/${still}-m.webp`;
        img.src = `${stills}/${still}.webp`;
      };
      const queue = () => {
        if (!pending) pending = requestAnimationFrame(swap);
      };
      window.addEventListener("scroll", queue, { passive: true });
      window.addEventListener("resize", queue);
      queue();
      return () => {
        cancelAnimationFrame(pending);
        window.removeEventListener("scroll", queue);
        window.removeEventListener("resize", queue);
      };
    }

    const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    // Coarser steps on touch devices mean fewer decodes.
    const step = coarse ? 0.02 : 0.008;
    const last = duration - 0.05;
    const abort = new AbortController();
    let objectUrl = "";
    let ready = false;
    let primed = false;
    let current = 0;
    let frame = 0;

    const tick = () => {
      frame = 0;
      const { line, pinned } = anchor();
      const target = Math.min(last, filmTimeAt(beats, measure(line), pinned));
      current += (target - current) * 0.2;
      if (Math.abs(target - current) < 0.004) current = target;
      root.style.setProperty("--film-veil", String(veilAt(current, veilBase, veilFlash)));
      root.style.setProperty("--film-progress", (current / duration).toFixed(4));
      // Never queue a seek behind one still decoding: fast flicks would pile up and freeze the clip.
      if (ready && !video.seeking && Math.abs(video.currentTime - current) > step) {
        video.currentTime = current;
      }
      if (current !== target || (ready && video.seeking)) schedule();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const reveal = () => root.setAttribute("data-film-ready", "");

    // iOS paints nothing for a muted video that was seeked but never played, and may
    // not even report its data until play() is called. So the clip is primed as soon
    // as it has a source, and again on every touch until one play() goes through
    // (Low Power Mode rejects the ones that do not come from a gesture).
    const prime = () => {
      if (primed || !video.src) return;
      video
        .play()
        .then(() => {
          primed = true;
          video.pause();
          video.currentTime = Math.max(current, 0.001);
          window.removeEventListener("touchstart", prime);
          reveal();
        })
        .catch(() => {});
    };

    const onMetadata = () => {
      ready = true;
      video.pause();
      // The poster stays until a real frame has painted.
      video.addEventListener("seeked", reveal, { once: true });
      video.currentTime = Math.max(current, 0.001);
      prime();
      schedule();
    };

    const url = portrait ? srcMobile : src;
    // Some WebKit builds refuse to play a Blob URL (MEDIA_ERR_SRC_NOT_SUPPORTED). The
    // file is in the HTTP cache by then, so the element falls back to its plain URL:
    // seeks cost a range request instead of nothing, but the film still plays.
    const onError = () => {
      if (!video.src.startsWith("blob:")) return;
      video.src = url;
      video.load();
    };

    const load = async () => {
      try {
        const response = await fetch(url, { signal: abort.signal });
        if (!response.ok) return;
        objectUrl = URL.createObjectURL(await response.blob());
        video.addEventListener("loadedmetadata", onMetadata, { once: true });
        video.addEventListener("error", onError);
        // The bytes are already in memory, so the element may read ahead freely.
        video.preload = "auto";
        video.src = objectUrl;
        video.load();
      } catch {
        // Aborted, offline or blocked: the poster stays.
      }
    };
    const start = () => void load();

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("touchstart", prime, { passive: true });
    schedule();

    return () => {
      abort.abort();
      cancelAnimationFrame(frame);
      window.removeEventListener("load", start);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("touchstart", prime);
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("error", onError);
      video.removeEventListener("seeked", reveal);
      // Back to the poster until the next clip is in: a revoked source would freeze the stage.
      root.removeAttribute("data-film-ready");
      if (objectUrl) {
        video.removeAttribute("src");
        video.load();
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, srcMobile, stills, beats, duration, portrait, layout, veilBase, veilFlash]);

  return (
    <div
      ref={rootRef}
      className={[styles.film, className].filter(Boolean).join(" ")}
      style={{ "--film-veil": veilBase } as CSSProperties}
      {...(layout === "bleed" ? { "data-film-root": "" } : { "data-film-window": "" })}
    >
      <div
        ref={stageRef}
        className={[styles.stage, stageClassName].filter(Boolean).join(" ")}
        data-film-stage=""
        aria-hidden="true"
      >
        <picture>
          <source media={PORTRAIT} srcSet={posterMobile} />
          <img src={poster} alt="" className={styles.media} fetchPriority="high" />
        </picture>
        <video
          ref={videoRef}
          className={`${styles.media} ${styles.video}`}
          muted
          playsInline
          preload="none"
          tabIndex={-1}
          data-film-video=""
        />
        {veil && <div className={styles.veil} />}
        {glow && <div className={styles.glow} data-spotlight-target="" />}
        {progress && <div className={styles.progress} />}
      </div>
      <div className={[styles.track, trackClassName].filter(Boolean).join(" ")}>{children}</div>
    </div>
  );
}

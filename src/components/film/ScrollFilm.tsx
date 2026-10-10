"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import styles from "./ScrollFilm.module.scss";
import { type FilmBeat, type SectionBox, activeBeatId, filmTimeAt, veilAt } from "./filmMap";

/** The portrait clip, poster and stills are used whenever the viewport is taller than wide. */
const PORTRAIT = "(orientation: portrait)";

interface ScrollFilmProps {
  src: string;
  srcMobile: string;
  poster: string;
  posterMobile: string;
  /** Folder holding one still per beat: `<still>.webp` and `<still>-m.webp`. */
  stills: string;
  beats: FilmBeat[];
  duration: number;
  children: ReactNode;
}

/**
 * A full-viewport film pinned behind its children and scrubbed by scroll: each
 * child tagged data-film-beat walks its beat as it crosses the top of the
 * viewport, and a child without one (a title card) holds the film where the
 * beat before it ended. The clip is fetched once after `load` and played from a
 * Blob, so every seek is instant (with the plain URL as a fallback where a Blob
 * will not play). Reduced motion and the lite tier never download it: they get
 * one still per beat instead, and every word of the content.
 */
export function ScrollFilm({
  src,
  srcMobile,
  poster,
  posterMobile,
  stills,
  beats,
  duration,
  children,
}: ScrollFilmProps) {
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

  // Tells the rest of the page what is under the nav bar, so the header can keep
  // its labels readable whatever the theme (see custom.css): white over the
  // footage, the theme's own colour once the film has scrolled away
  // (data-past-film) or while a page-coloured surface covers them
  // (data-nav-over-card). The bar sits at the top on desktop and at the bottom on phones.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const html = document.documentElement;
    const phone = window.matchMedia("(max-width: 768px)");
    const surfaces = Array.from(root.querySelectorAll<HTMLElement>("[data-opaque]"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = phone.matches ? window.innerHeight - 40 : 80;
      html.toggleAttribute("data-past-film", root.getBoundingClientRect().bottom <= line);
      // The place and time labels are one line of text near the top of the bar
      // (its box runs from about 20 to 38 px). A surface is under them while it
      // spans the band from 30 to 44 px. Phones do not show the labels, and their
      // bar brings its own background.
      const covered =
        !phone.matches &&
        surfaces.some((surface) => {
          const rect = surface.getBoundingClientRect();
          return rect.top <= 30 && rect.bottom >= 44;
        });
      html.toggleAttribute("data-nav-over-card", covered);
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
      html.removeAttribute("data-nav-over-card");
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!root || !stage || !video || portrait === null) return;
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-film-beat]"));
    const measure = (): SectionBox[] =>
      sections.map((el) => {
        const rect = el.getBoundingClientRect();
        return { id: el.dataset.filmBeat ?? "", top: rect.top, height: rect.height };
      });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || document.documentElement.dataset.fx === "lite") {
      // No video: the poster is swapped for the still of whichever beat is on stage.
      const img = stage.querySelector("img");
      const source = stage.querySelector("source");
      let shown = beats[0]?.id ?? "";
      let pending = 0;
      const swap = () => {
        pending = 0;
        const id = activeBeatId(beats, measure(), stage.offsetHeight / 2);
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
      const target = Math.min(last, filmTimeAt(beats, measure(), stage.offsetHeight));
      current += (target - current) * 0.2;
      if (Math.abs(target - current) < 0.004) current = target;
      root.style.setProperty("--film-veil", String(veilAt(current)));
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
  }, [src, srcMobile, stills, beats, duration, portrait]);

  return (
    <div ref={rootRef} className={styles.film} data-film-root="">
      <div ref={stageRef} className={styles.stage} data-film-stage="" aria-hidden="true">
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
        <div className={styles.veil} />
        <div className={styles.progress} data-film-progress="" />
      </div>
      <div className={styles.track}>{children}</div>
    </div>
  );
}

"use client";

import { type ReactNode, useEffect, useRef } from "react";
import styles from "./ScrollFilm.module.scss";
import { type FilmBeat, type SectionBox, activeBeatId, filmTimeAt, veilAt } from "./filmMap";

interface ScrollFilmProps {
  src: string;
  srcMobile: string;
  poster: string;
  posterMobile: string;
  /** Folder holding one still per beat: `<id>.webp` and `<id>-m.webp`. */
  stills: string;
  beats: FilmBeat[];
  duration: number;
  children: ReactNode;
}

/**
 * A full-viewport film pinned behind its children and scrubbed by scroll: each
 * child section tagged data-film-beat walks its beat as it crosses the top of
 * the viewport. The clip is fetched once after `load` and played from a Blob,
 * so every seek is instant. Reduced motion and the lite tier never download
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
  children,
}: ScrollFilmProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!root || !stage || !video) return;
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-film-beat]"));
    const measure = (): SectionBox[] =>
      sections.map((el) => {
        const rect = el.getBoundingClientRect();
        return { id: el.dataset.filmBeat ?? "", top: rect.top, height: rect.height };
      });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || document.documentElement.dataset.fx === "lite") {
      // No video: the poster is swapped for the still of whichever section is on stage.
      const img = stage.querySelector("img");
      const source = stage.querySelector("source");
      let shown = beats[0]?.id ?? "";
      let pending = 0;
      const swap = () => {
        pending = 0;
        const id = activeBeatId(beats, measure(), stage.offsetHeight / 2);
        if (!img || id === shown) return;
        shown = id;
        if (source) source.srcset = `${stills}/${id}-m.webp`;
        img.src = `${stills}/${id}.webp`;
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
    const mobile = coarse || window.matchMedia("(max-width: 860px)").matches;
    // Coarser steps on phones mean fewer decodes.
    const step = mobile ? 0.02 : 0.008;
    const last = duration - 0.05;
    const abort = new AbortController();
    let objectUrl = "";
    let ready = false;
    let current = 0;
    let frame = 0;

    const tick = () => {
      frame = 0;
      const target = Math.min(last, filmTimeAt(beats, measure(), stage.offsetHeight));
      current += (target - current) * 0.2;
      if (Math.abs(target - current) < 0.004) current = target;
      root.style.setProperty("--film-veil", String(veilAt(current)));
      // Never queue a seek behind one still decoding: fast flicks would pile up and freeze the clip.
      if (ready && !video.seeking && Math.abs(video.currentTime - current) > step) {
        video.currentTime = current;
      }
      if (current !== target || (ready && video.seeking)) schedule();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // iOS paints nothing for a muted video that was seeked but never played.
    const prime = () => {
      if (!ready) return;
      video
        .play()
        .then(() => video.pause())
        .catch(() => {});
    };

    const onLoaded = () => {
      ready = true;
      video.pause();
      // The poster stays until a real frame has painted.
      video.addEventListener("seeked", () => root.setAttribute("data-film-ready", ""), {
        once: true,
      });
      video.currentTime = Math.max(current, 0.001);
      prime();
      schedule();
    };

    const load = async () => {
      try {
        const response = await fetch(mobile ? srcMobile : src, { signal: abort.signal });
        if (!response.ok) return;
        objectUrl = URL.createObjectURL(await response.blob());
        video.addEventListener("loadeddata", onLoaded, { once: true });
        // The bytes are already in memory: let the element read all of them now, so
        // no seek ever waits and the page settles to network idle.
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
    window.addEventListener("touchstart", prime, { once: true, passive: true });
    schedule();

    return () => {
      abort.abort();
      cancelAnimationFrame(frame);
      window.removeEventListener("load", start);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("touchstart", prime);
      video.removeEventListener("loadeddata", onLoaded);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, srcMobile, stills, beats, duration]);

  return (
    <div ref={rootRef} className={styles.film} data-film-root="">
      <div ref={stageRef} className={styles.stage} data-film-stage="" aria-hidden="true">
        <picture>
          <source media="(max-width: 860px)" srcSet={posterMobile} />
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
        <div className={styles.glow} data-spotlight-target="" />
      </div>
      <div className={styles.track}>{children}</div>
    </div>
  );
}

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
 * will not play). Until it can be scrubbed, and for good if it never arrives,
 * the stage shows one still per beat, with no veil and no progress bar: there
 * is no film yet to dim or to report on. Reduced motion and the lite tier never
 * download it, so the stills are all they get, with every word of the content.
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
  // The beat whose still is on the stage. It outlives the effect below, which
  // starts again when the device is turned and must not take the poster for granted.
  const shownRef = useRef(beats[0]?.id ?? "");
  // null until mounted: the clip is chosen on the client, and again when the device is turned.
  const [portrait, setPortrait] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia(PORTRAIT);
    const update = () => setPortrait(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Tells the rest of the page what is under the nav bar. No text sits on
  // footage, so the header's place and time labels are hidden over the film
  // (custom.css) and shown, in the theme's own colour, only where the page is
  // under them: once the film has scrolled away (data-past-film) or while one
  // of the Home's page-coloured surfaces covers them (data-nav-over-card). The
  // bar sits at the top on desktop and at the bottom on phones.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const html = document.documentElement;
    const phone = window.matchMedia("(max-width: 768px)");
    const surfaces = Array.from(root.querySelectorAll<HTMLElement>("[data-opaque]"));
    const side = document.querySelector<HTMLElement>("[data-header-side]");
    // The line of text itself: the element around it is as tall as the whole bar.
    const label = side?.firstElementChild ?? side;
    let frame = 0;
    const update = () => {
      frame = 0;
      const film = root.getBoundingClientRect();
      if (phone.matches || !label) {
        // Phones do not show the labels, and their bar brings its own background:
        // all there is to tell is whether the film is still behind the bar.
        const line = phone.matches ? window.innerHeight - 40 : 80;
        html.toggleAttribute("data-past-film", film.bottom <= line);
        html.removeAttribute("data-nav-over-card");
        return;
      }
      // One rule for every edge that crosses the labels: they are on the page
      // only when no part of their box is over footage. A surface has to cover
      // the whole box, and the film's bottom edge has to be above it; with an
      // edge inside the box, part of the text would be over a frame. The box
      // is measured because the bar's height is Once UI's, and it still has
      // its place in the layout while the labels are hidden.
      const box = label.getBoundingClientRect();
      html.toggleAttribute("data-past-film", film.bottom <= box.top);
      html.toggleAttribute(
        "data-nav-over-card",
        surfaces.some((surface) => {
          const rect = surface.getBoundingClientRect();
          return rect.top <= box.top && rect.bottom >= box.bottom;
        }),
      );
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

    // While there is no video to scrub, the poster is swapped for the still of
    // whichever beat is on stage. A beat takes over when its stretch reaches the
    // bottom edge of the stage: the title card above it still covers the screen
    // then (a card is as tall as the stage), so the swap is not seen.
    const img = stage.querySelector("img");
    const source = stage.querySelector("source");
    let pending = 0;
    const swap = () => {
      pending = 0;
      const id = activeBeatId(beats, measure(), stage.offsetHeight);
      if (!img || id === shownRef.current) return;
      shownRef.current = id;
      const still = beats.find((beat) => beat.id === id)?.still ?? id;
      if (source) source.srcset = `${stills}/${still}-m.webp`;
      img.src = `${stills}/${still}.webp`;
    };
    const queueSwap = () => {
      if (!pending) pending = requestAnimationFrame(swap);
    };
    const stopStills = () => {
      cancelAnimationFrame(pending);
      pending = 0;
      window.removeEventListener("scroll", queueSwap);
      window.removeEventListener("resize", queueSwap);
    };
    window.addEventListener("scroll", queueSwap, { passive: true });
    window.addEventListener("resize", queueSwap);
    queueSwap();

    // Reduced motion and the lite tier stop here: no video is ever fetched.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || document.documentElement.dataset.fx === "lite") return stopStills;

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

    // The video takes the stage, already on the frame the page has scrolled to.
    // From here the scroll moves the film, the veil and the bar show, and the
    // still under the video has nothing left to do.
    const reveal = () => {
      stopStills();
      root.setAttribute("data-film-ready", "");
    };

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
        // Aborted, offline or blocked: the stills stay.
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
      stopStills();
      cancelAnimationFrame(frame);
      window.removeEventListener("load", start);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("touchstart", prime);
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("error", onError);
      video.removeEventListener("seeked", reveal);
      // Back to the stills until the next clip is in: a revoked source would freeze the stage.
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
        <div className={styles.veil} data-film-veil="" />
        <div className={styles.progress} data-film-progress="" />
      </div>
      <div className={styles.track}>{children}</div>
    </div>
  );
}

"use client";

// Workbench About: the film frame. The loop that used to open the home waits
// as a small framed piece; once half of its box is in view it lifts and opens
// into a wide frame, and the loop starts. Triggered once, then it plays on its
// own time: it is never scrubbed by scroll. Only transform and opacity move
// (film.module.scss).
//
// Behaviour carried over from src/components/home/LazyVideo.tsx:
// - muted, looping, inline, and it plays by itself while on screen;
// - no video bytes before the frame opens: the element has no src (and no
//   <source> children) until the first play();
// - a pause key, always visible once the loop has started (WCAG 2.2.2);
// - with reduced motion or data saver it never starts on its own and shows a
//   play key instead;
// - its box is reserved from the first paint: the stage holds the file's
//   ratio, and the frame only ever transforms inside it.
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import styles from "./film.module.scss";

type NetworkInformationLike = { saveData?: boolean };

/** Autoplay is skipped for reduced-motion and data-saver users; they get a play key. */
function canAutoplay(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  return !connection?.saveData;
}

/** Share of the stage that must be on screen to keep the loop playing. */
const PLAY_AT = 0.25;
/**
 * The frame opens once half of the stage is inside the trigger zone: the whole
 * screen from tablets up; on phones, where the frame is short and full width,
 * only the top 70 % of it, so the print is seen on the bench before it opens.
 */
const OPEN_AT = 0.5;
const PHONE = "(max-width: 719px)";
const PHONE_ZONE = "0px 0px -30% 0px";

export function FilmFrame({
  src,
  poster,
  width,
  height,
  label,
  testId,
}: {
  src: string;
  poster: string;
  /** Intrinsic size of the file, so the stage reserves its exact ratio. */
  width: number;
  height: number;
  /** Accessible name of the video itself. */
  label: string;
  testId?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Whether the loop should run while on screen: false when autoplay is off,
  // and once the visitor pauses it (scrolling back does not override them).
  const wanted = useRef(false);
  const [needsKey, setNeedsKey] = useState(false);
  const [playing, setPlaying] = useState(false);
  // Once true, stays true: it shows the pause/play key from the first play on.
  const [started, setStarted] = useState(false);

  const play = useCallback(
    (video: HTMLVideoElement) => {
      if (!video.src) video.src = src;
      video.muted = true;
      return video.play();
    },
    [src],
  );

  useEffect(() => {
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!stage || !video) return;
    const auto = canAutoplay();
    wanted.current = auto;
    setNeedsKey(!auto);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) stage.dataset.open = "";

    // Plays while open and on screen, pauses when it leaves.
    let visible = 0;
    const sync = () => {
      if ("open" in stage.dataset && visible >= PLAY_AT - 0.01) {
        if (wanted.current && video.paused) play(video).catch(() => setNeedsKey(true));
      } else if (!video.paused) {
        video.pause();
      }
    };

    const watch = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting ? entry.intersectionRatio : 0;
        if (visible > 0) stage.dataset.in = "";
        sync();
      },
      { threshold: [0, PLAY_AT] },
    );
    const opener = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < OPEN_AT - 0.01) return;
        stage.dataset.open = "";
        opener.disconnect();
        sync();
      },
      {
        threshold: OPEN_AT,
        rootMargin: window.matchMedia(PHONE).matches ? PHONE_ZONE : "0px",
      },
    );
    watch.observe(stage);
    opener.observe(stage);
    return () => {
      watch.disconnect();
      opener.disconnect();
    };
  }, [play]);

  const start = () => {
    const video = videoRef.current;
    if (!video) return;
    wanted.current = true;
    play(video)
      .then(() => setNeedsKey(false))
      .catch(() => setNeedsKey(true));
  };

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      wanted.current = true;
      play(video).catch(() => {});
    } else {
      wanted.current = false;
      video.pause();
    }
  };

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      style={{ aspectRatio: `${width} / ${height}` }}
      data-testid={testId}
    >
      <div className={styles.frame}>
        <Image
          src={poster}
          alt=""
          fill
          sizes="(min-width: 1024px) calc(100vw - 48px), 100vw"
          className={styles.poster}
        />
        <video
          ref={videoRef}
          className={styles.video}
          muted
          loop
          playsInline
          preload="none"
          width={width}
          height={height}
          aria-label={label}
          onPlay={() => {
            setPlaying(true);
            setStarted(true);
          }}
          onPause={() => setPlaying(false)}
        />
        {needsKey && !started && (
          <button type="button" className={styles.playKey} onClick={start} aria-label="Play video">
            <FiPlay aria-hidden="true" />
          </button>
        )}
        {started && (
          <button
            type="button"
            className={styles.toggle}
            onClick={toggle}
            aria-label={playing ? "Pause video" : "Play video"}
          >
            {playing ? <FiPause aria-hidden="true" /> : <FiPlay aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
}

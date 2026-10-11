"use client";

import { EMIcon } from "@/resources/EMIcon";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./LazyVideo.module.scss";

interface LazyVideoProps {
  src: string;
  webm?: string;
  poster: string;
  /** Intrinsic size, used to reserve the box (no layout shift). */
  width: number;
  height: number;
  /** Accessible name for the play button, e.g. "Play showreel". */
  label: string;
  /**
   * Accessible name for the pause toggle once playing, e.g. "Pause showreel".
   * Defaults to `label` with a leading "Play" swapped for "Pause" (falling
   * back to "Pause video" if `label` doesn't start with "Play").
   */
  pauseLabel?: string;
  watermark?: boolean;
  className?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;
}

type NetworkInformationLike = { saveData?: boolean };

/** Autoplay is skipped for reduced-motion and data-saver users; they get a play button. */
function canAutoplay(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  return !connection?.saveData;
}

/**
 * WebKit/Safari's WebM (VP9) support is unreliable — `canPlayType` can claim
 * support it cannot actually deliver, which on some builds (notably
 * WebKit-on-Windows, used by Playwright there) leaves the media element
 * stuck at `readyState 0` forever instead of falling back to another
 * source. Real Safari's own WebM support has historically been spotty for
 * the same reason, so — as is common practice — WebKit is never offered the
 * WebM file; it always gets the H.264 MP4, which it decodes natively.
 */
function canPlayWebm(): boolean {
  if (navigator.vendor === "Apple Computer, Inc.") return false;
  const probe = document.createElement("video");
  return probe.canPlayType('video/webm; codecs="vp9"') !== "";
}

/**
 * Muted, looping video that downloads nothing until it scrolls into view
 * (no `src`/`<source>` at all until then, plus a poster), plays while
 * visible and pauses when it leaves.
 *
 * The MP4/WebM choice is applied by setting `video.src` imperatively, right
 * before the first `play()` attempt, instead of declaring `<source>`
 * children up front: browsers run their resource-selection algorithm for
 * `<source>` children as soon as the element is parsed — even under
 * `preload="none"` — which is what causes the WebKit hang described above,
 * and would also start a real network request well before the video is
 * actually in view.
 */
export function LazyVideo({
  src,
  webm,
  poster,
  width,
  height,
  label,
  pauseLabel,
  watermark = false,
  className,
  style,
  "data-testid": testId,
}: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsButton, setNeedsButton] = useState(false);
  const [playing, setPlaying] = useState(false);
  // Once true, stays true: it gates the corner pause/play toggle, which
  // should remain available after the first play even if the video is later
  // paused (by the user or by scrolling out of view).
  const [started, setStarted] = useState(false);
  const resolvedPauseLabel =
    pauseLabel ?? (label.startsWith("Play") ? label.replace(/^Play/, "Pause") : "Pause video");

  const ensureSource = useCallback(
    (video: HTMLVideoElement) => {
      if (video.src) return;
      video.src = webm && canPlayWebm() ? webm : src;
    },
    [src, webm],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const auto = canAutoplay();
    setNeedsButton(!auto);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (auto) {
            ensureSource(video);
            video.muted = true;
            video.play().catch(() => setNeedsButton(true));
          }
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [ensureSource]);

  const start = () => {
    const video = videoRef.current;
    if (!video) return;
    ensureSource(video);
    video.muted = true;
    video
      .play()
      .then(() => setNeedsButton(false))
      .catch(() => setNeedsButton(true));
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      ensureSource(video);
      video.muted = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  return (
    <div
      className={`${styles.root} ${className ?? ""}`}
      style={{ aspectRatio: `${width} / ${height}`, ...style }}
      data-testid={testId}
    >
      <video
        ref={videoRef}
        className={styles.video}
        muted
        loop
        playsInline
        preload="none"
        poster={poster}
        width={width}
        height={height}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
      />
      {needsButton && !playing && (
        <button type="button" className={styles.play} onClick={start} aria-label={label}>
          <span aria-hidden="true" className={styles.playIcon} />
        </button>
      )}
      {started && (
        <button
          type="button"
          className={styles.toggle}
          onClick={togglePlayback}
          aria-label={playing ? resolvedPauseLabel : label}
        >
          {playing ? (
            <span aria-hidden="true" className={styles.togglePauseIcon}>
              <span />
              <span />
            </span>
          ) : (
            <span aria-hidden="true" className={styles.togglePlayIcon} />
          )}
        </button>
      )}
      {watermark && (
        <span aria-hidden="true" className={styles.watermark}>
          <EMIcon />
        </span>
      )}
    </div>
  );
}

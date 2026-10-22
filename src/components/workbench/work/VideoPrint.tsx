"use client";

// Workbench, case study: a video pinned beside the text as a print. It plays
// muted only while on screen, never on its own under reduced motion, and
// always has a play and pause key.
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import styles from "./case.module.scss";

export function VideoPrint({
  src,
  width,
  height,
  label,
  tilt,
  pin,
}: {
  src: string;
  width: number;
  height: number;
  label: string;
  tilt: number;
  pin: "tape" | "pin";
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const wanted = useRef(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) wanted.current = false;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && wanted.current) video.play().catch(() => setPlaying(false));
        else video.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(video);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      io.disconnect();
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      wanted.current = true;
      video.play().catch(() => setPlaying(false));
    } else {
      wanted.current = false;
      video.pause();
    }
  };

  return (
    <figure
      className={styles.pinned}
      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
      data-reveal=""
    >
      <span className={pin === "tape" ? styles.tape : styles.pin} aria-hidden="true" />
      <span className={styles.pinnedFrame}>
        <video
          ref={ref}
          src={src}
          width={width}
          height={height}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={label}
        />
        <button
          type="button"
          className={styles.playKey}
          onClick={toggle}
          aria-label={playing ? `Pause: ${label}` : `Play: ${label}`}
        >
          {playing ? <FiPause aria-hidden="true" /> : <FiPlay aria-hidden="true" />}
        </button>
      </span>
    </figure>
  );
}

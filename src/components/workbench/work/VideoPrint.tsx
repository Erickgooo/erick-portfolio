"use client";

// Workbench, case study: a video beside the text as a print. It plays
// muted only while on screen, never on its own under reduced motion, and
// always has a play and pause key. Its first frame (preload="metadata") is
// fetched once it is two screens away rather than with the page, where on a
// phone network it took bandwidth from the first screen (LeadBot's two
// videos pulled about 345 KB before the first paint).
import { useEffect, useRef, useState } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import styles from "./case.module.scss";

export function VideoPrint({
  src,
  width,
  height,
  label,
}: {
  src: string;
  width: number;
  height: number;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const wanted = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

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
    <figure className={styles.pinned} data-reveal="">
      <span className={styles.pinnedFrame}>
        <video
          ref={ref}
          src={src}
          width={width}
          height={height}
          muted
          loop
          playsInline
          preload={near ? "metadata" : "none"}
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

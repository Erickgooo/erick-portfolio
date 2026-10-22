// Workbench prose: a YouTube video pinned to the page as a print, with tape.
// The player itself is the shared YouTubeFacade (a still and a play key; the
// iframe mounts only on a click), restyled from here so nothing else changes.
import { YouTubeFacade } from "@/components/YouTubeFacade";
import type { CSSProperties } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { tiltFor } from "./media";
import styles from "./prose.module.scss";

export function VideoEmbed({
  videoId,
  title,
  isVertical = true,
  instagramUrl,
}: {
  videoId: string;
  title: string;
  isVertical?: boolean | string;
  instagramUrl?: string;
}) {
  const vertical = isVertical === true || isVertical === "true";
  return (
    <figure
      className={`${styles.video} ${vertical ? styles.videoTall : styles.videoWide}`}
      style={{ "--tilt": `${tiltFor(videoId, 1.4)}deg` } as CSSProperties}
      data-reveal=""
    >
      <span className={styles.tape} aria-hidden="true" />
      <span className={styles.frame}>
        <YouTubeFacade
          className={styles.player}
          videoId={videoId}
          title={title}
          aspectRatio={vertical ? "9 / 16" : "16 / 9"}
        />
      </span>
      {instagramUrl ? (
        <figcaption className={styles.videoCaption}>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.videoLink}
          >
            View metrics on Instagram <FiArrowUpRight aria-hidden="true" />
          </a>
        </figcaption>
      ) : null}
    </figure>
  );
}

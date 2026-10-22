// Workbench prose: a YouTube video laid on the page as a print.
// The player itself is the shared YouTubeFacade (a still and a play key; the
// iframe mounts only on a click), restyled from here so nothing else changes.
import { YouTubeFacade } from "@/components/YouTubeFacade";
import { FiArrowUpRight } from "react-icons/fi";
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
      data-reveal=""
    >
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

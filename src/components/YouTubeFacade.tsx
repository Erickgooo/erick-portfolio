"use client";

import { isIOS } from "@/utils/platform";
import { youTubeEmbedUrl, youTubeThumbnail } from "@/utils/youtube";
import { useRef, useState } from "react";
import styles from "./YouTubeFacade.module.scss";

/**
 * Flip to true ONLY if the manual check on a real iPhone shows that autoplay
 * after the tap needs a second tap. Muted autoplay is allowed by iOS without a
 * second gesture; the CSP is not touched either way (spec A5).
 */
const MUTE_ON_IOS = false;

interface YouTubeFacadeProps {
  videoId: string;
  title: string;
  /** CSS aspect-ratio, e.g. "9 / 16" or "16 / 9". */
  aspectRatio: string;
  className?: string;
  /**
   * Set for above-the-fold thumbnails (e.g. the Gallery's first grid row) so
   * the browser fetches the image immediately instead of lazily — avoids
   * Lighthouse's `lcp-lazy-loaded` flag when this thumbnail is the LCP
   * element. Defaults to false (lazy), which is correct for every other
   * thumbnail.
   */
  eager?: boolean;
}

/**
 * Static thumbnail + play button; the heavy YouTube iframe is mounted only
 * after the user activates it, then starts playing and receives focus.
 */
export function YouTubeFacade({
  videoId,
  title,
  aspectRatio,
  className,
  eager = false,
}: YouTubeFacadeProps) {
  const [active, setActive] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const mute =
    MUTE_ON_IOS &&
    typeof navigator !== "undefined" &&
    isIOS(navigator.userAgent, navigator.platform, navigator.maxTouchPoints);

  return (
    <div className={`${styles.root} ${className ?? ""}`} style={{ aspectRatio }}>
      {active ? (
        <iframe
          ref={iframeRef}
          className={styles.iframe}
          src={youTubeEmbedUrl(videoId, { mute })}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          onLoad={() => iframeRef.current?.focus()}
        />
      ) : (
        <button
          type="button"
          className={styles.button}
          onClick={() => setActive(true)}
          aria-label={`Play video: ${title}`}
        >
          <img
            className={styles.thumb}
            src={youTubeThumbnail(videoId)}
            alt=""
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : undefined}
            decoding="async"
          />
          {/* Liquid Glass (src/components/glass/): its light and tint. */}
          <span className={styles.play} aria-hidden="true" data-lg-glass="play">
            <span className={styles.light} />
            <span className={styles.tint} />
          </span>
        </button>
      )}
    </div>
  );
}

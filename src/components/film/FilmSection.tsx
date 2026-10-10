import type { CSSProperties, ReactNode } from "react";
import styles from "./FilmSection.module.scss";

interface FilmSectionProps {
  /** Id of the FilmBeat this section scrubs through. */
  beat: string;
  /** Scroll length in viewport heights; the content stays pinned for all but the last one. */
  screens?: number;
  /**
   * Fade the content in as the section arrives and out as it leaves. "out" keeps only
   * the exit, for content that brings its own entrance. Off for the hero, which must
   * be visible on load.
   */
  fade?: boolean | "out";
  /**
   * Start the content a fixed distance under the top edge instead of centring it.
   * For the hero: centred content moves as a whole whenever its height changes
   * (the web font swapping in can change the headline's line count), and that
   * move is a layout shift.
   */
  top?: boolean;
  children: ReactNode;
}

/** A landing section laid over the film: its content pins while the film plays its beat. */
export function FilmSection({
  beat,
  screens = 2,
  fade = true,
  top = false,
  children,
}: FilmSectionProps) {
  const fadeClass = fade === "out" ? styles.fadeOut : fade ? styles.fade : "";
  const pin = [styles.pin, fadeClass, top ? styles.top : ""].filter(Boolean).join(" ");
  return (
    <section
      data-film-beat={beat}
      className={styles.section}
      style={{ "--screens": screens } as CSSProperties}
    >
      <div className={pin}>{children}</div>
    </section>
  );
}

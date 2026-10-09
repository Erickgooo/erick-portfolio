import type { CSSProperties, ReactNode } from "react";
import styles from "./FilmSection.module.scss";

interface FilmSectionProps {
  /** Id of the FilmBeat this section scrubs through. */
  beat: string;
  /** Scroll length in viewport heights; the content stays pinned for all but the last one. */
  screens?: number;
  /** Fade the content in as the section arrives and out as it leaves. Off for the hero, which must be visible on load. */
  fade?: boolean;
  children: ReactNode;
}

/** A landing section laid over the film: its content pins while the film plays its beat. */
export function FilmSection({ beat, screens = 2, fade = true, children }: FilmSectionProps) {
  return (
    <section
      data-film-beat={beat}
      className={styles.section}
      style={{ "--screens": screens } as CSSProperties}
    >
      <div className={fade ? `${styles.pin} ${styles.fade}` : styles.pin}>{children}</div>
    </section>
  );
}

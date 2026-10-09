import { FilmSection } from "@/components/film/FilmSection";
import { landing } from "@/resources/landing";
import { type CSSProperties, Fragment } from "react";
import styles from "./landing.module.scss";

/**
 * The page's one large-type statement. Each word starts muted and lights up in
 * reading order as the section scrolls. The words are plain inline spans with
 * real spaces between them, so the heading reads and copies as ordinary text.
 */
export function Tagline() {
  const lines = landing.tagline.map((line) => line.split(" "));
  const total = lines.reduce((sum, words) => sum + words.length, 0);
  let index = 0;

  return (
    <FilmSection beat="tagline" screens={2.5}>
      <h2
        className={styles.tagline}
        data-tagline=""
        data-mo-io=""
        style={{ "--n": total } as CSSProperties}
      >
        {lines.map((words, lineIndex) => (
          <Fragment key={landing.tagline[lineIndex]}>
            <span className={styles.taglineLine}>
              {words.map((word, wordIndex) => {
                const w = index++;
                return (
                  <Fragment key={`${w}-${word}`}>
                    <span
                      className={styles.word}
                      data-tagline-word=""
                      style={{ "--w": w } as CSSProperties}
                    >
                      {word}
                    </span>
                    {wordIndex < words.length - 1 ? " " : null}
                  </Fragment>
                );
              })}
            </span>
            {lineIndex < lines.length - 1 ? " " : null}
          </Fragment>
        ))}
      </h2>
    </FilmSection>
  );
}

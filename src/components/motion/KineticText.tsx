import { type CSSProperties, Fragment } from "react";
import styles from "./KineticText.module.scss";

interface KineticTextProps {
  text: string;
  /** "load": plays on first paint (paused while html.intro-pending). "view": scroll-driven. */
  mode?: "load" | "view";
}

/**
 * Word-by-word kinetic type (spec «KineticHeading»). Render it INSIDE a Once UI
 * Heading so typography is inherited. The real text lives once in an sr-only span;
 * the animated copy is aria-hidden and keeps real spaces between words, so SEO,
 * screen readers and copy/paste all get the exact copy. Words only translate —
 * they are opaque and unclipped from the first frame, so the heading can be LCP.
 * Don't use it on headings read by useHeadingLinks (their textContent would double).
 */
export function KineticText({ text, mode = "load" }: KineticTextProps) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span
        aria-hidden="true"
        data-kinetic-words=""
        data-mo-io={mode === "view" ? "" : undefined}
        className={`${styles.words} ${mode === "view" ? styles.view : styles.load}`}
      >
        {words.map((word, i) => (
          <Fragment key={`${i}-${word}`}>
            <span
              data-kinetic-word=""
              className={styles.word}
              style={{ "--w": i } as CSSProperties}
            >
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </>
  );
}

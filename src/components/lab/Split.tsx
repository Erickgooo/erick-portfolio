import { type CSSProperties, Fragment } from "react";
import styles from "./Lab.module.scss";

interface SplitProps {
  text: string;
  /** Words (punctuation ignored) that get the variant's emphasis. */
  highlight?: string[];
}

const bare = (word: string) => word.toLowerCase().replace(/[^a-z0-9+%$.]/g, "");

/**
 * THROWAWAY (lab only). Splits a sentence into words so each can be animated on
 * its own: an outer span that can mask, an inner span that moves. Real spaces
 * stay between the words, so the text still reads and copies as a sentence.
 */
export function Split({ text, highlight = [] }: SplitProps) {
  const words = text.split(" ");
  const marked = highlight.map(bare);
  return (
    <span className={styles.split} style={{ "--n": words.length } as CSSProperties}>
      {words.map((word, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a fixed sentence; words can repeat
        <Fragment key={i}>
          <span
            className={styles.w}
            style={{ "--w": i } as CSSProperties}
            data-hl={marked.includes(bare(word)) ? "" : undefined}
          >
            <span className={styles.wi}>{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

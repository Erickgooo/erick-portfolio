import { type CSSProperties, Fragment } from "react";
import styles from "./type.module.scss";

interface WordsProps {
  text: string;
  /** Words (case and punctuation ignored) that get the outline emphasis. */
  emphasis?: readonly string[];
}

const bare = (word: string) => word.toLowerCase().replace(/[^a-z0-9+%$]/g, "");

/**
 * A sentence split into words so each can arrive on its own. Every word is an
 * outer span (its place in the line) around an inner span (what moves). Real
 * spaces stay between the words, so the sentence still reads, copies and is
 * announced as ordinary text.
 */
export function Words({ text, emphasis = [] }: WordsProps) {
  const words = text.split(" ");
  const marked = emphasis.map(bare);
  return (
    <span className={styles.words} style={{ "--n": words.length } as CSSProperties}>
      {words.map((word, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a fixed sentence, and words can repeat
        <Fragment key={i}>
          <span
            className={styles.w}
            data-word=""
            data-hl={marked.includes(bare(word)) ? "" : undefined}
            style={{ "--w": i } as CSSProperties}
          >
            <span className={styles.wi}>{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

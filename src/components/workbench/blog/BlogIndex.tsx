// Workbench, Blog: the posts as printed sheets stacked on the bench, newest on
// top. The newest lies open and large over a small stack; the rest follow as
// smaller sheets.
import { blog } from "@/resources";
import type { CSSProperties } from "react";
import { PostSheet } from "./PostSheet";
import styles from "./blog.module.scss";
import { getPostCards } from "./posts";

export function BlogIndex({ hideProtected }: { hideProtected: boolean }) {
  const [newest, ...rest] = getPostCards({ hideProtected });

  return (
    <>
      <header className={styles.head}>
        <h1 className={styles.title}>{blog.title}</h1>
        <p className={styles.lede}>{blog.description}.</p>
      </header>

      <section className={styles.bench} aria-label="All posts">
        {newest ? (
          <div className={styles.stack} data-reveal="">
            <span className={styles.under} aria-hidden="true" />
            <span className={styles.under} aria-hidden="true" />
            <PostSheet post={newest} lead priority />
          </div>
        ) : (
          <p className={styles.lede}>Nothing on the bench yet.</p>
        )}
        {rest.length > 0 ? (
          <ul className={styles.sheets}>
            {rest.map((post, i) => (
              <li
                key={post.slug}
                data-reveal=""
                style={{ "--i": i % 2, "--t": `${i % 2 ? 0.8 : -0.9}deg` } as CSSProperties}
              >
                <PostSheet post={post} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </>
  );
}

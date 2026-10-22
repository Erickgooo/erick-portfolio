// Workbench, Blog: the posts as sheets, newest first. The newest lies open and
// large; the rest follow as smaller sheets in two columns.
import { blog } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import type { CSSProperties } from "react";
import { TitleSheet } from "../scenes/blog/TitleSheet";
import { PostSheet } from "./PostSheet";
import styles from "./blog.module.scss";
import { getPostCards } from "./posts";

export function BlogIndex({ hideProtected }: { hideProtected: boolean }) {
  const [newest, ...rest] = getPostCards({ hideProtected });

  return (
    <>
      <header className={styles.head}>
        <h1 className={styles.title}>{blog.title}</h1>
        <div className={styles.headSide}>
          <p className={styles.lede}>{blog.description}.</p>
          {newest ? (
            <TitleSheet title={newest.title} date={formatDate(newest.publishedAt)} />
          ) : null}
        </div>
      </header>

      <section className={styles.bench} aria-label="All posts">
        {newest ? (
          <div className={styles.lead} data-reveal="">
            <PostSheet post={newest} lead priority />
          </div>
        ) : (
          <p className={styles.lede}>Nothing on the bench yet.</p>
        )}
        {rest.length > 0 ? (
          <ul className={styles.sheets}>
            {rest.map((post, i) => (
              <li key={post.slug} data-reveal="" style={{ "--i": i % 2 } as CSSProperties}>
                <PostSheet post={post} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </>
  );
}

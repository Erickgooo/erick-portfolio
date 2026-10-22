// Workbench, post: the most recent other posts, as small sheets.
import type { CSSProperties } from "react";
import { PostSheet } from "./PostSheet";
import styles from "./blog.module.scss";
import type { PostCard } from "./posts";

export function RecentPosts({ posts }: { posts: PostCard[] }) {
  if (posts.length === 0) return null;
  return (
    <section className={styles.recent} aria-labelledby="recent-posts">
      <h2 id="recent-posts">Recent posts</h2>
      <ul className={styles.sheets}>
        {posts.map((post, i) => (
          <li
            key={post.slug}
            data-reveal=""
            style={{ "--i": i, "--t": `${i % 2 ? 0.8 : -0.9}deg` } as CSSProperties}
          >
            <PostSheet post={post} headingLevel={3} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// Workbench, Blog: one post as a sheet behind a hairline: the date, the title,
// the summary and the cover. The whole sheet opens the post; it lifts a little
// on hover, on focus and while a finger is on it.
import { formatDate } from "@/utils/formatDate";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import styles from "./blog.module.scss";
import type { PostCard } from "./posts";

export function PostSheet({
  post,
  lead = false,
  priority = false,
  headingLevel = 2,
}: {
  post: PostCard;
  lead?: boolean;
  priority?: boolean;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article
      className={`${styles.sheet} ${lead ? styles.sheetLead : ""}`}
      data-print={post.image ? "" : undefined}
    >
      <div className={styles.sheetText}>
        <p className={styles.date}>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        </p>
        <Heading className={styles.sheetTitle}>
          <Link href={post.href} className={styles.stretch}>
            {post.title}
          </Link>
        </Heading>
        <p className={styles.sheetSummary}>{post.summary}</p>
        {post.tag ? <p className={styles.sheetTag}>{post.tag}</p> : null}
        <span className={styles.open} aria-hidden="true">
          Read the post <FiArrowRight />
        </span>
      </div>
      {post.image ? (
        <div className={styles.sheetPrint}>
          <Image
            src={post.image.src}
            width={post.image.w}
            height={post.image.h}
            alt=""
            sizes={
              lead
                ? "(min-width: 1024px) 400px, (min-width: 720px) 40vw, 80vw"
                : "(min-width: 720px) 220px, 80vw"
            }
            priority={priority}
          />
        </div>
      ) : null}
    </article>
  );
}

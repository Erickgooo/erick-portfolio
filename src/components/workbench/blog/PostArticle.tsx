// Workbench, post: a post reads like a case. One column of Onest, the cover
// print taped beside the title, the index in the margin on desktop, Erick's
// monogram as the last mark, then the share keys.
import { person } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { EndMark, Prose } from "../prose/Prose";
import { mediaSize } from "../prose/media";
import { outline } from "../prose/source";
import { PostIndex } from "./PostIndex";
import { Share } from "./Share";
import styles from "./blog.module.scss";

export function PostArticle({
  title,
  summary,
  publishedAt,
  image,
  content,
  url,
}: {
  title: string;
  summary: string;
  publishedAt: string;
  image?: string;
  content: string;
  url: string;
}) {
  const items = outline(content);
  const cover = image ? { src: image, ...mediaSize(image) } : null;

  return (
    <article className={styles.post}>
      <div className={styles.top}>
        <Link href="/blog" className={styles.back}>
          <FiArrowLeft aria-hidden="true" /> All posts
        </Link>
      </div>

      <header className={styles.hero}>
        <div className={styles.heroText}>
          {publishedAt ? (
            <p className={styles.date}>
              <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
            </p>
          ) : null}
          <h1 className={styles.postTitle}>{title}</h1>
          {summary ? <p className={styles.summary}>{summary}</p> : null}
          <p className={styles.author}>
            <Image src={person.avatar} width={48} height={48} alt="" className={styles.avatar} />
            <span>
              By <strong>{person.name}</strong>
            </span>
          </p>
        </div>
        {cover ? (
          <figure className={styles.cover}>
            <span className={styles.tape} aria-hidden="true" />
            <span className={styles.coverFrame}>
              <Image
                src={cover.src}
                width={cover.w}
                height={cover.h}
                alt={title}
                sizes="(min-width: 1024px) 400px, (min-width: 720px) 360px, 78vw"
                priority
              />
            </span>
          </figure>
        ) : null}
      </header>

      <div className={styles.body}>
        <div className={styles.prose}>
          <Prose source={content} />
          <EndMark />
          <Share title={title} url={url} />
        </div>
        {items.length > 1 ? (
          <div className={styles.rail}>
            <PostIndex items={items} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

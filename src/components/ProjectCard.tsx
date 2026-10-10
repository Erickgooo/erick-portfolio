import { parseMetric, projectStills } from "@/utils/projects";
import { AvatarGroup, Heading } from "@once-ui-system/core";
import Image from "next/image";
import Link from "next/link";
import styles from "./ProjectCard.module.scss";

interface ProjectCardProps {
  href: string;
  /** Set on the cards at the top of a list: their first picture is loaded ahead of the rest. */
  priority?: boolean;
  images: string[];
  title: string;
  /** Whether the project has a case-study body to link to. */
  hasContent: boolean;
  description: string;
  avatars: { src: string }[];
  link: string;
  metric?: string;
}

/**
 * One project in a list: its pictures, its title, the result it reports and
 * the way into the case study. The pictures sit in a row that scrolls sideways
 * on its own, so the card is plain server HTML: no script, nothing that
 * animates in and nothing that plays.
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  href,
  priority = false,
  images = [],
  title,
  hasContent,
  description,
  avatars,
  link,
  metric,
}) => {
  const pictures = projectStills(images);
  const result = parseMetric(metric);
  const summary = description?.trim();
  return (
    <article className={styles.card}>
      {pictures.length > 0 && (
        <ul
          // biome-ignore lint/a11y/useSemanticElements: it is a <ul> already; the role is for Safari
          // biome-ignore lint/a11y/noRedundantRoles: Safari drops the list semantics of a list styled with list-style: none, and the role restores them
          role="list"
          className={pictures.length > 1 ? `${styles.strip} ${styles.scrolls}` : styles.strip}
          data-project-media=""
          aria-label={`${title}: pictures`}
          // A row that scrolls has to be reachable from the keyboard.
          tabIndex={pictures.length > 1 ? 0 : undefined}
        >
          {pictures.map((src, index) => (
            <li key={src} className={styles.frame}>
              <Image
                className={styles.picture}
                src={src}
                alt={index === 0 ? title : `${title} (${index + 1})`}
                fill
                sizes="(max-width: 960px) 100vw, 960px"
                priority={priority && index === 0}
              />
            </li>
          ))}
        </ul>
      )}
      <div className={styles.text}>
        <div className={styles.lead}>
          <Heading as="h2" wrap="balance" variant="heading-strong-xl">
            {title}
          </Heading>
          {/* Only where the project reports one: a result is never made up to fill the row. */}
          {result && (
            <p className={styles.result}>
              <span className={styles.figure}>{result.value}</span> {result.label}
            </p>
          )}
        </div>
        {(avatars?.length > 0 || summary || hasContent || link) && (
          <div className={styles.detail}>
            {avatars?.length > 0 && <AvatarGroup avatars={avatars} size="m" reverse />}
            {summary && <p className={styles.summary}>{summary}</p>}
            {(hasContent || link) && (
              <p className={styles.links}>
                {hasContent && (
                  <Link
                    className={styles.link}
                    href={href}
                    aria-label={`Read case study: ${title}`}
                  >
                    Read case study
                  </Link>
                )}
                {link && (
                  <a
                    className={styles.link}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View project: ${title}`}
                  >
                    View project
                  </a>
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

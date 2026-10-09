import { DecodeText } from "@/components/motion/DecodeText";
import { GlowTrack } from "@/components/motion/GlowTrack";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { coverImage, formatIndex, parseMetric, sortProjects } from "@/utils/projects";
import { getPosts } from "@/utils/utils";
import { Heading, Row, SmartLink, Text } from "@once-ui-system/core";
import Image from "next/image";
import Link from "next/link";
import styles from "./FeaturedProject.module.scss";

interface FeaturedProjectProps {
  /** Set on public pages: leaves out projects whose own page is password-protected. */
  hideProtected?: boolean;
}

/** Latest project as a spec sheet. Its image is the shared-element origin for the case study. */
export function FeaturedProject({ hideProtected = false }: FeaturedProjectProps) {
  let projects = getPosts(["src", "app", "work", "projects"]);
  if (hideProtected) {
    projects = projects.filter((post) => !isProtectedPath(`/work/${post.slug}`));
  }
  const [project] = sortProjects(projects);
  if (!project) return null;
  const { title, summary, images, link, metric: rawMetric } = project.metadata;
  const cover = coverImage(images);
  const metric = parseMetric(rawMetric);
  const href = `/work/${project.slug}`;

  return (
    <div data-featured-project="">
      <GlowTrack className={styles.card}>
        {cover && (
          <Link href={href} className={styles.media}>
            <span className={styles.parallax}>
              <Image
                src={cover}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className={styles.img}
                data-vt-name={`project-${project.slug}`}
              />
            </span>
          </Link>
        )}
        <div className={styles.sheet}>
          <span aria-hidden="true" className={styles.num}>
            {formatIndex(1)}
          </span>
          <Heading as="h2" variant="heading-strong-xl" wrap="balance">
            {title}
          </Heading>
          {metric && (
            <p className={styles.metric}>
              <DecodeText value={metric.value} />
              <span className={styles.metricLabel}>{metric.label}</span>
            </p>
          )}
          <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
            {summary}
          </Text>
          <Row gap="24" wrap>
            {project.content.trim() && (
              <SmartLink
                suffixIcon="arrowRight"
                style={{ margin: 0, width: "fit-content" }}
                href={href}
              >
                <Text variant="body-default-s">Read case study</Text>
              </SmartLink>
            )}
            {link && (
              <SmartLink
                suffixIcon="arrowUpRightFromSquare"
                style={{ margin: 0, width: "fit-content" }}
                href={link}
              >
                <Text variant="body-default-s">View project</Text>
              </SmartLink>
            )}
          </Row>
        </div>
      </GlowTrack>
    </div>
  );
}

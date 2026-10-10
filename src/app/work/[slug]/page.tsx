import { CustomMDX, NodeDivider, ScrollToHash } from "@/components";
import { Projects } from "@/components/work/Projects";
import { about, baseURL, person, work } from "@/resources";
import { EMIcon } from "@/resources/EMIcon";
import { formatDate } from "@/utils/formatDate";
import { getPosts } from "@/utils/utils";
import {
  Avatar,
  AvatarGroup,
  Button,
  Column,
  Flex,
  Heading,
  Media,
  Meta,
  Row,
  Schema,
  Text,
} from "@once-ui-system/core";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.scss";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getPosts(["src", "app", "work", "projects"]);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  const posts = getPosts(["src", "app", "work", "projects"]);
  const post = posts.find((post) => post.slug === slugPath);

  if (!post) return {};

  return Meta.generate({
    title: post.metadata.title,
    description: post.metadata.summary,
    baseURL: baseURL,
    image:
      post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`,
    path: `${work.path}/${post.slug}`,
  });
}

export default async function Project({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  const post = getPosts(["src", "app", "work", "projects"]).find((post) => post.slug === slugPath);

  if (!post) {
    notFound();
  }

  const avatars =
    post.metadata.team?.map((person) => ({
      src: person.avatar,
    })) || [];

  return (
    <Column as="section" maxWidth="m" horizontal="center" gap="l">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        path={`${work.path}/${post.slug}`}
        title={post.metadata.title}
        description={post.metadata.summary}
        datePublished={post.metadata.publishedAt}
        dateModified={post.metadata.publishedAt}
        image={
          post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`
        }
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Column className={styles.head} maxWidth="s" gap="8" horizontal="center" align="center">
        <Text variant="label-strong-m">
          <Link className={styles.link} href="/work">
            Projects
          </Link>
        </Text>
        <Text variant="body-default-s" onBackground="neutral-weak" marginBottom="12">
          {post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}
        </Text>
        <Heading variant="display-strong-m">{post.metadata.title}</Heading>
      </Column>
      <Row className={styles.head} marginBottom="32" horizontal="center">
        <Row gap="12" vertical="center">
          {post.metadata.team && <AvatarGroup reverse avatars={avatars} size="s" />}
          <Text variant="label-default-m" onBackground="neutral-weak">
            {post.metadata.team?.map((member, idx) => (
              <span key={idx}>
                {idx > 0 && ", "}
                <a
                  className={styles.link}
                  href={member.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {member.name}
                </a>
              </span>
            ))}
          </Text>
        </Row>
      </Row>
      {post.metadata.images.length > 0 && (
        <Row fillWidth position="relative">
          <Media
            priority
            aspectRatio="16 / 9"
            // Pictures take a 4px corner everywhere on the site.
            style={{ borderRadius: "4px" }}
            alt="image"
            src={post.metadata.images[0]}
          />
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              right: "20px",
              bottom: "20px",
              fontSize: "24px",
              color: "#F4F5F7",
              opacity: 0.7,
              filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))",
              lineHeight: 0,
            }}
          >
            <EMIcon />
          </span>
        </Row>
      )}
      <Column style={{ margin: "auto" }} as="article" maxWidth="xs">
        <CustomMDX source={post.content} />
      </Column>
      <Column fillWidth gap="40" horizontal="center" marginTop="40">
        <NodeDivider maxWidth={40} />
        <Heading as="h2" variant="heading-strong-xl" marginBottom="24">
          Related projects
        </Heading>
        <Projects exclude={[post.slug]} range={[2]} />
      </Column>
      <ScrollToHash />
    </Column>
  );
}

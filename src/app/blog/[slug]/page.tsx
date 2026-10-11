import { CustomMDX, NodeDivider, ScrollToHash } from "@/components";
import { OnThisPage } from "@/components/blog/OnThisPage";
import { Posts, listedPosts } from "@/components/blog/Posts";
import styles from "@/components/blog/blog.module.scss";
import { ShareSection } from "@/components/blog/ShareSection";
import { about, baseURL, blog, person } from "@/resources";
import { EMIcon } from "@/resources/EMIcon";
import { formatDate } from "@/utils/formatDate";
import { getPosts } from "@/utils/utils";
import { Avatar, Column, Heading, Media, Meta, Row, Schema, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getPosts(["src", "app", "blog", "posts"]);
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

  const posts = getPosts(["src", "app", "blog", "posts"]);
  const post = posts.find((post) => post.slug === slugPath);

  if (!post) return {};

  return Meta.generate({
    title: post.metadata.title,
    description: post.metadata.summary,
    baseURL: baseURL,
    image:
      post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`,
    path: `${blog.path}/${post.slug}`,
  });
}

export default async function Blog({ params }: { params: Promise<{ slug: string | string[] }> }) {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  const post = getPosts(["src", "app", "blog", "posts"]).find((post) => post.slug === slugPath);

  if (!post) {
    notFound();
  }

  const avatars =
    post.metadata.team?.map((person) => ({
      src: person.avatar,
    })) || [];

  // Only a list with posts in it gets its heading, its rule and its room.
  const hasRecent = listedPosts({ exclude: [post.slug], range: [1, 2] }).length > 0;

  return (
    <Row fillWidth>
      <Row maxWidth={12} m={{ hide: true }} />
      <Row fillWidth horizontal="center">
        <Column as="section" maxWidth="m" horizontal="center" gap="l" paddingTop="24">
          <Schema
            as="blogPosting"
            baseURL={baseURL}
            path={`${blog.path}/${post.slug}`}
            title={post.metadata.title}
            description={post.metadata.summary}
            datePublished={post.metadata.publishedAt}
            dateModified={post.metadata.publishedAt}
            image={
              post.metadata.image ||
              `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`
            }
            author={{
              name: person.name,
              url: `${baseURL}${about.path}`,
              image: `${baseURL}${person.avatar}`,
            }}
          />
          <Column maxWidth="s" gap="16" horizontal="center" align="center">
            <Link href="/blog" className={styles.crumb}>
              <Text variant="label-strong-m">Blog</Text>
            </Link>
            <Text variant="body-default-s" onBackground="neutral-weak" marginBottom="12">
              {post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}
            </Text>
            <Heading variant="display-strong-m">{post.metadata.title}</Heading>
          </Column>
          <Row marginBottom="32" horizontal="center">
            <Row gap="16" vertical="center">
              <Avatar size="s" src={person.avatar} />
              <Text variant="label-default-m" onBackground="neutral-weak">
                {person.name}
              </Text>
            </Row>
          </Row>
          {post.metadata.image && (
            <Row fillWidth position="relative">
              <Media
                src={post.metadata.image}
                alt={post.metadata.title}
                aspectRatio="3/4"
                priority
                // As wide as the column: the screen up to 1024px, and no wider than that above.
                sizes="(max-width: 1024px) 100vw, 1024px"
                border="neutral-alpha-weak"
                style={{ borderRadius: 4 }}
                marginTop="12"
                marginBottom="8"
              />
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  right: "20px",
                  bottom: "28px",
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
          <Column as="article" maxWidth="s">
            <CustomMDX source={post.content} />
          </Column>

          <ShareSection title={post.metadata.title} url={`${baseURL}${blog.path}/${post.slug}`} />

          {hasRecent && (
            <Column fillWidth gap="40" horizontal="center" marginTop="40">
              <NodeDivider maxWidth={40} />
              <Heading as="h2" data-exclude-nav variant="heading-strong-xl" marginBottom="24">
                Recent posts
              </Heading>
              <Posts
                exclude={[post.slug]}
                range={[1, 2]}
                columns="2"
                thumbnail
                direction="column"
              />
            </Column>
          )}
          <ScrollToHash />
        </Column>
      </Row>
      <Column
        maxWidth={12}
        paddingLeft="40"
        fitHeight
        position="sticky"
        top="80"
        gap="16"
        m={{ hide: true }}
      >
        {/* OnThisPage renders its own "On this page" header — the page used to
            render one too, on top of <HeadingNav>, which renders one by default
            (`header` prop), so the label appeared twice. */}
        <OnThisPage />
      </Column>
    </Row>
  );
}

"use client";

import { person } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { Avatar, Column, Flex, Media, Row, Text } from "@once-ui-system/core";
import Link from "next/link";
import styles from "./blog.module.scss";

interface PostProps {
  post: any;
  thumbnail: boolean;
  direction?: "row" | "column";
  priority?: boolean;
}

export default function Post({ post, thumbnail, direction, priority = false }: PostProps) {
  return (
    // The link is the card; Once UI's Card puts its own classes on an inner box, so the
    // colour of the link itself could not be set from outside.
    <Link href={`/blog/${post.slug}`} className={styles.card}>
      <Flex
        fillWidth
        direction={direction}
        padding="4"
        radius="l-4"
        gap={direction === "column" ? undefined : "24"}
        s={{ direction: "column" }}
      >
        {post.metadata.image && thumbnail && (
          <Media
            priority={priority}
            sizes="(max-width: 768px) 100vw, 640px"
            border="neutral-alpha-weak"
            cursor="interactive"
            radius="l"
            src={post.metadata.image}
            alt={`Thumbnail of ${post.metadata.title}`}
            aspectRatio="16 / 9"
          />
        )}
        <Row fillWidth>
          <Column maxWidth={28} paddingY="24" paddingX="l" gap="20" vertical="center">
            <Row gap="24" vertical="center">
              <Row vertical="center" gap="16">
                <Avatar src={person.avatar} size="s" />
                <Text variant="label-default-s">{person.name}</Text>
              </Row>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {formatDate(post.metadata.publishedAt, false)}
              </Text>
            </Row>
            <Text variant="heading-strong-l" wrap="balance">
              {post.metadata.title}
            </Text>
            {post.metadata.tag && (
              <Text variant="label-strong-s" onBackground="neutral-weak">
                {post.metadata.tag}
              </Text>
            )}
          </Column>
        </Row>
      </Flex>
    </Link>
  );
}

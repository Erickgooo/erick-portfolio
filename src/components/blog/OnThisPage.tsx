"use client";

import { Column, Flex, Icon, Row, SmartLink, Text, useHeadingLinks } from "@once-ui-system/core";
import { useEffect, useState } from "react";

/**
 * Section indicator for long-form pages.
 *
 * Replaces Once UI's <HeadingNav>, whose active-section rule is
 * `scrollY >= headingTop - 150` with no clamp at the end of the document. A
 * section only becomes active once the page has scrolled far enough to put its
 * heading on that trigger line — so when the content below the final heading is
 * shorter than `viewportHeight - 150`, the page runs out of scroll first and the
 * last section can never activate at any scroll position.
 *
 * On this blog that is not hypothetical: the last heading sits at y=3318 and so
 * activates at 3168, while the document tops out at maxScroll=3127. It was short
 * by 41px, and the indicator stuck on the second-to-last section forever.
 * Padding the page would only move the threshold — the requirement scales with
 * the viewport, so a fixed spacer fixes one screen size and not the next.
 *
 * The fix is the missing clamp: once the document is scrolled to the bottom,
 * whatever sections remain can no longer reach the trigger line, so the last one
 * is the current one.
 */

/** Distance above a heading at which it becomes the current section. */
const ACTIVE_OFFSET = 150;
/** Sub-pixel scroll positions and zoom mean "at the bottom" needs tolerance. */
const BOTTOM_EPSILON = 2;
/** Item height, mirrored by the indicator's travel. Keep in sync with the Flex below. */
const ITEM_HEIGHT = 32;

export function OnThisPage() {
  const headings = useHeadingLinks();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    // Only headings that actually exist in the DOM can be scrolled to.
    let anchors: { id: string; top: number }[] = [];

    const measure = () => {
      anchors = headings
        .map((heading) => {
          const el = document.getElementById(heading.id);
          if (!el) return null;
          return { id: heading.id, top: el.getBoundingClientRect().top + window.scrollY };
        })
        .filter((a): a is { id: string; top: number } => a !== null);
    };

    const update = () => {
      if (anchors.length === 0) return;

      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll - y <= BOTTOM_EPSILON) {
        setActiveId(anchors[anchors.length - 1].id);
        return;
      }

      let current = anchors[0].id;
      for (const anchor of anchors) {
        if (anchor.top - ACTIVE_OFFSET <= y) current = anchor.id;
      }
      setActiveId(current);
    };

    const remeasure = () => {
      measure();
      update();
    };

    remeasure();

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", remeasure);

    // Cover images, embeds and webfonts all land after mount and shift every
    // offset below them, so cached positions have to be recomputed.
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", remeasure);
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) return null;

  const activeIndex = Math.max(
    0,
    headings.findIndex((heading) => heading.id === activeId),
  );

  return (
    <Column gap="16" fitHeight>
      <Row
        gap="12"
        paddingLeft="2"
        vertical="center"
        onBackground="neutral-medium"
        textVariant="label-default-s"
      >
        <Icon name="document" size="xs" />
        On this page
      </Row>
      <Row paddingLeft="8" gap="12">
        <Row width="2" background="neutral-alpha-medium" radius="full" overflow="hidden">
          <Row
            height="32"
            paddingY="4"
            fillWidth
            position="absolute"
            style={{
              top: `calc(${activeIndex} * ${ITEM_HEIGHT}px)`,
            }}
          >
            <Row fillWidth background="neutral-strong" radius="full" />
          </Row>
        </Row>
        <Column fillWidth>
          {headings.map((heading) => {
            const isActive = heading.id === activeId;
            return (
              <Flex key={heading.id} fillWidth height="32" paddingX="4">
                <SmartLink
                  fillWidth
                  href={`#${heading.id}`}
                  onClick={(e: React.MouseEvent) => {
                    const target = document.getElementById(heading.id);
                    if (!target) return;
                    e.preventDefault();
                    window.scrollTo({
                      top: target.getBoundingClientRect().top + window.scrollY - ACTIVE_OFFSET,
                      behavior: "smooth",
                    });
                  }}
                  style={{
                    paddingLeft: `calc(${heading.level - 2} * var(--static-space-8))`,
                    color: isActive
                      ? "var(--neutral-on-background-strong)"
                      : "var(--neutral-on-background-weak)",
                  }}
                >
                  <Text variant={isActive ? "body-strong-s" : "body-default-s"} truncate>
                    {heading.text}
                  </Text>
                </SmartLink>
              </Flex>
            );
          })}
        </Column>
      </Row>
    </Column>
  );
}

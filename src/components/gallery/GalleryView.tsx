"use client";

import { YouTubeFacade } from "@/components/YouTubeFacade";
import { gallery } from "@/resources";
import { extractYouTubeId } from "@/utils/youtube";
import { Dialog, Flex, Icon, MasonryGrid, Media, Text } from "@once-ui-system/core";
import Image from "next/image";
import { useState } from "react";
import styles from "./GalleryView.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────
type RawImage = (typeof gallery.images)[number];

type GalleryItem =
  | { type: "image"; image: RawImage }
  | { type: "youtube"; image: RawImage; videoId: string }
  | { type: "carousel"; images: RawImage[]; coverImage: RawImage };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isYouTubeUrl(src: string) {
  return src.includes("youtube.com") || src.includes("youtu.be");
}

function getAspectRatio(orientation: string, isVideo = false): string {
  if (orientation === "vertical") return isVideo ? "9 / 16" : "3 / 4";
  if (orientation === "square") return "1 / 1";
  return "16 / 9";
}

// ─── Grouping pass ────────────────────────────────────────────────────────────
function buildGalleryItems(images: RawImage[]): GalleryItem[] {
  const items: GalleryItem[] = [];
  let i = 0;

  while (i < images.length) {
    const img = images[i];

    if (img.group) {
      const group = img.group;
      const groupImages: RawImage[] = [];
      while (i < images.length && images[i].group === group) {
        groupImages.push(images[i]);
        i++;
      }
      items.push({ type: "carousel", images: groupImages, coverImage: groupImages[0] });
      continue;
    }

    if (isYouTubeUrl(img.src)) {
      const videoId = extractYouTubeId(img.src);
      items.push({ type: "youtube", image: img, videoId });
    } else {
      items.push({ type: "image", image: img });
    }

    i++;
  }

  return items;
}

// ─── Cell button ──────────────────────────────────────────────────────────────
// What opens a picture or a group: a real button, so the keyboard and a screen
// reader reach it. Its name says what it opens.
function CellButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      className={styles.cell}
      aria-label={label}
      aria-haspopup="dialog"
      style={{ transform: hovered ? "scale(1.025)" : "scale(1)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {children}
      <Flex
        position="absolute"
        style={{
          inset: 0,
          background: "rgba(255,255,255,0.04)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.25s ease",
          pointerEvents: "none",
        }}
      />
    </button>
  );
}

// ─── YouTube cell ─────────────────────────────────────────────────────────────
function YouTubeCell({
  item,
  eager,
}: {
  item: Extract<GalleryItem, { type: "youtube" }>;
  eager?: boolean;
}) {
  return (
    <YouTubeFacade
      className={styles.youtubeHover}
      videoId={item.videoId}
      title={item.image.alt}
      aspectRatio={getAspectRatio(item.image.orientation, true)}
      eager={eager}
    />
  );
}

// ─── Single image cell — BUG 1 FIX ───────────────────────────────────────────
// We use our own Dialog instead of Media's `enlarge` prop.
// `enlarge` does an in-place CSS transform from the image's page position,
// which on mobile causes the "fly up" scroll-animation bug.
// Our Dialog opens as a fixed full-screen overlay with no scroll dependency.
function ImageCell({ item }: { item: Extract<GalleryItem, { type: "image" }> }) {
  const [open, setOpen] = useState(false);
  const aspectRatio = getAspectRatio(item.image.orientation);

  return (
    <>
      <CellButton label={`Open picture: ${item.image.alt}`} onClick={() => setOpen(true)}>
        {/* No radius of its own: the button clips it to 4px. The button carries the name. */}
        <Media
          sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
          aspectRatio={aspectRatio}
          src={item.image.src}
          alt=""
        />
      </CellButton>

      {/* Lightbox — Media with its default `aspectRatio="original"` renders
          next/image with automatic height and zero cropping, so the image
          ALWAYS shows at its true natural aspect ratio regardless of the
          orientation tag assigned in content.tsx */}
      <Dialog
        isOpen={open}
        onClose={() => setOpen(false)}
        title={item.image.alt}
        style={{ maxWidth: 900 }}
      >
        <Media
          src={item.image.src}
          alt={item.image.alt}
          sizes="(max-width: 900px) 100vw, 900px"
          style={{ borderRadius: 4 }}
        />
      </Dialog>
    </>
  );
}

// ─── Group cell ──────────────────────────────────────────────────────────────
function CarouselCell({ item }: { item: Extract<GalleryItem, { type: "carousel" }> }) {
  const [open, setOpen] = useState(false);
  const count = item.images.length;
  const aspectRatio = getAspectRatio(item.coverImage.orientation);

  return (
    <>
      <CellButton
        label={
          count > 1
            ? `Open ${count} pictures: ${item.coverImage.alt}`
            : `Open picture: ${item.coverImage.alt}`
        }
        onClick={() => setOpen(true)}
      >
        {/* Cover thumbnail */}
        <Media
          sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
          aspectRatio={aspectRatio}
          src={item.coverImage.src}
          alt=""
        />

        {/* Badge: opaque, so nothing behind it needs blurring. A group of one has
            nothing to count. */}
        {count > 1 && (
          <Flex position="absolute" className={styles.badge}>
            <Icon name="gallery" size="xs" />
            <Text variant="label-default-s" className={styles.badgeCount}>
              1/{count}
            </Text>
          </Flex>
        )}
      </CellButton>

      {/* Once UI's Carousel fades each slide in through a blurred filter, which
          the motion rule forbids. The pictures are a row that scrolls and snaps,
          the way a project's pictures are on the work list: no script, nothing
          animated. */}
      <Dialog
        isOpen={open}
        onClose={() => setOpen(false)}
        title={item.coverImage.alt}
        style={{
          maxWidth: 640,
          width: "100%",
        }}
      >
        <ul
          // biome-ignore lint/a11y/useSemanticElements: it is a <ul> already; the role is for Safari
          // biome-ignore lint/a11y/noRedundantRoles: Safari drops the list semantics of a list styled with list-style: none, and the role restores them
          role="list"
          className={styles.pictures}
          aria-label={`Pictures: ${item.coverImage.alt}`}
          // A row that scrolls has to be reachable from the keyboard.
          tabIndex={count > 1 ? 0 : undefined}
        >
          {item.images.map((img, index) => (
            <li key={img.src} className={styles.picture} style={{ aspectRatio }}>
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 100vw, 640px"
                style={{ objectFit: "cover" }}
              />
              {count > 1 && (
                <span className={styles.position}>
                  {index + 1}/{count}
                </span>
              )}
            </li>
          ))}
        </ul>
      </Dialog>
    </>
  );
}

// ─── Main gallery component ───────────────────────────────────────────────────
export default function GalleryView() {
  const items = buildGalleryItems(gallery.images);

  return (
    <MasonryGrid columns={3} m={{ columns: 2 }} s={{ columns: 1 }} gap="12">
      {items.map((item, index) => {
        if (item.type === "youtube")
          return (
            <Flex key={index} fillWidth style={{ breakInside: "avoid" }}>
              <YouTubeCell item={item} eager={index < 3} />
            </Flex>
          );

        if (item.type === "carousel")
          return (
            <Flex key={index} fillWidth style={{ breakInside: "avoid" }}>
              <CarouselCell item={item} />
            </Flex>
          );

        return (
          <Flex key={index} fillWidth style={{ breakInside: "avoid" }}>
            <ImageCell item={item} />
          </Flex>
        );
      })}
    </MasonryGrid>
  );
}

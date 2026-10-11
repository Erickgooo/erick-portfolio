"use client";

import { socialSharing } from "@/resources";
import { newTabIfExternal } from "@/utils/links";
import { Icon, Row, Text, useToast } from "@once-ui-system/core";
import styles from "./blog.module.scss";

interface ShareSectionProps {
  title: string;
  url: string;
}

interface SocialPlatform {
  name: string;
  icon: string;
  label: string;
  generateUrl: (title: string, url: string) => string;
}

const socialPlatforms: Record<string, SocialPlatform> = {
  x: {
    name: "x",
    icon: "twitter",
    label: "X",
    generateUrl: (title, url) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  linkedin: {
    name: "linkedin",
    icon: "linkedin",
    label: "LinkedIn",
    generateUrl: (title, url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  facebook: {
    name: "facebook",
    icon: "facebook",
    label: "Facebook",
    generateUrl: (title, url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  pinterest: {
    name: "pinterest",
    icon: "pinterest",
    label: "Pinterest",
    generateUrl: (title, url) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
  },
  whatsapp: {
    name: "whatsapp",
    icon: "whatsapp",
    label: "WhatsApp",
    generateUrl: (title, url) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  reddit: {
    name: "reddit",
    icon: "reddit",
    label: "Reddit",
    generateUrl: (title, url) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  telegram: {
    name: "telegram",
    icon: "telegram",
    label: "Telegram",
    generateUrl: (title, url) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  email: {
    name: "email",
    icon: "email",
    label: "Email",
    generateUrl: (title, url) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this post: ${url}`)}`,
  },
};

const shareLabel = (platform: SocialPlatform) =>
  platform.name === "email" ? "Share by email" : `Share on ${platform.label}`;

export function ShareSection({ title, url }: ShareSectionProps) {
  const { addToast } = useToast();
  // Don't render if sharing is disabled
  if (!socialSharing.display) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      addToast({
        variant: "success",
        message: "Link copied to clipboard",
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
      addToast({
        variant: "danger",
        message: "Failed to copy link",
      });
    }
  };

  // Get enabled platforms
  const enabledPlatforms = Object.entries(socialSharing.platforms)
    .filter(([_, enabled]) => enabled && _ !== "copyLink")
    .map(([platformKey]) => ({ key: platformKey, ...socialPlatforms[platformKey] }))
    .filter((platform) => platform.name); // Filter out platforms that don't exist in our definitions

  return (
    <Row fillWidth center gap="16" marginTop="32" marginBottom="16">
      <Text variant="label-default-m" onBackground="neutral-weak">
        Share this post:
      </Text>
      <Row gap="16" horizontal="center" wrap>
        {enabledPlatforms.map((platform) => {
          const href = platform.generateUrl(title, url);
          return (
            <a
              key={platform.name}
              className={styles.share}
              href={href}
              aria-label={shareLabel(platform)}
              // A network opens beside the post; sharing by email is a mailto and stays put.
              {...newTabIfExternal(href)}
            >
              <Icon name={platform.icon} size="s" />
            </a>
          );
        })}

        {socialSharing.platforms.copyLink && (
          <button
            type="button"
            className={styles.share}
            onClick={handleCopy}
            aria-label="Copy link to this post"
          >
            <Icon name="openLink" size="s" />
          </button>
        )}
      </Row>
    </Row>
  );
}

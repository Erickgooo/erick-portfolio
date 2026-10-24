// Workbench, post: share keys under the article. Links for the platforms
// switched on in socialSharing (once-ui.config.ts), and a key that copies the
// post's address. Square keys, 44 px, named for screen readers.
import { sharing } from "@/resources";
import type { ReactNode } from "react";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaPinterestP,
  FaRedditAlien,
  FaTelegram,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";
import { FiMail } from "react-icons/fi";
import { CopyPostLink } from "./CopyPostLink";
import styles from "./blog.module.scss";

type Platform = { label: string; icon: ReactNode; href: (title: string, url: string) => string };

const e = encodeURIComponent;

const PLATFORMS: Record<string, Platform> = {
  x: {
    label: "Share on X",
    icon: <FaXTwitter />,
    href: (title, url) => `https://twitter.com/intent/tweet?text=${e(title)}&url=${e(url)}`,
  },
  linkedin: {
    label: "Share on LinkedIn",
    icon: <FaLinkedinIn />,
    href: (_title, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`,
  },
  facebook: {
    label: "Share on Facebook",
    icon: <FaFacebookF />,
    href: (_title, url) => `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
  },
  pinterest: {
    label: "Share on Pinterest",
    icon: <FaPinterestP />,
    href: (title, url) =>
      `https://pinterest.com/pin/create/button/?url=${e(url)}&description=${e(title)}`,
  },
  whatsapp: {
    label: "Share on WhatsApp",
    icon: <FaWhatsapp />,
    href: (title, url) => `https://wa.me/?text=${e(`${title} ${url}`)}`,
  },
  reddit: {
    label: "Share on Reddit",
    icon: <FaRedditAlien />,
    href: (title, url) => `https://reddit.com/submit?url=${e(url)}&title=${e(title)}`,
  },
  telegram: {
    label: "Share on Telegram",
    icon: <FaTelegram />,
    href: (title, url) => `https://t.me/share/url?url=${e(url)}&text=${e(title)}`,
  },
  email: {
    label: "Share by email",
    icon: <FiMail />,
    href: (title, url) => `mailto:?subject=${e(title)}&body=${e(`Check out this post: ${url}`)}`,
  },
};

export function Share({ title, url }: { title: string; url: string }) {
  if (!sharing.enabled) return null;
  const enabled = Object.entries(sharing.on)
    .filter(([key, on]) => on && key in PLATFORMS)
    .map(([key]) => ({ key, ...PLATFORMS[key] }));

  return (
    <div className={styles.share}>
      <p className={styles.shareHead}>Share this post</p>
      <ul className={styles.shareKeys}>
        {enabled.map((platform) => {
          const href = platform.href(title, url);
          const external = href.startsWith("http");
          return (
            <li key={platform.key}>
              <a
                href={href}
                className={styles.key}
                aria-label={platform.label}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <span aria-hidden="true">{platform.icon}</span>
              </a>
            </li>
          );
        })}
        {sharing.on.copyLink ? (
          <li>
            <CopyPostLink url={url} />
          </li>
        ) : null}
      </ul>
    </div>
  );
}

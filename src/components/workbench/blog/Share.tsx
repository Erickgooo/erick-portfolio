// Workbench, post: share keys under the article, and a key that copies the
// post's address. Square keys, 44 px, named for screen readers.
import type { ReactNode } from "react";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { FiMail } from "react-icons/fi";
import { CopyPostLink } from "./CopyPostLink";
import styles from "./blog.module.scss";

type Platform = {
  key: string;
  label: string;
  icon: ReactNode;
  href: (title: string, url: string) => string;
};

const e = encodeURIComponent;

const PLATFORMS: Platform[] = [
  {
    key: "x",
    label: "Share on X",
    icon: <FaXTwitter />,
    href: (title, url) => `https://twitter.com/intent/tweet?text=${e(title)}&url=${e(url)}`,
  },
  {
    key: "linkedin",
    label: "Share on LinkedIn",
    icon: <FaLinkedinIn />,
    href: (_title, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`,
  },
  {
    key: "email",
    label: "Share by email",
    icon: <FiMail />,
    href: (title, url) => `mailto:?subject=${e(title)}&body=${e(`Check out this post: ${url}`)}`,
  },
];

export function Share({ title, url }: { title: string; url: string }) {
  return (
    <div className={styles.share}>
      <p className={styles.shareHead}>Share this post</p>
      <ul className={styles.shareKeys}>
        {PLATFORMS.map((platform) => {
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
        <li>
          <CopyPostLink url={url} />
        </li>
      </ul>
    </div>
  );
}

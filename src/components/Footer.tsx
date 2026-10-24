// The site footer, in Workbench (redesign 2026), on every page: Erick's
// monogram with his name, the pages, the social links and the copyright line.
// Server-rendered; transparent over the page dots.
import scope from "@/components/workbench/scope.module.scss";
import { about, enabledRoutes, pages, profile, profileLinks } from "@/resources";
import { EMIcon } from "@/resources/EMIcon";
import { icons } from "@/resources/icons";
import Link from "next/link";
import styles from "./Footer.module.scss";

const PAGES = [
  { path: pages.about.path, label: pages.about.label },
  { path: pages.work.path, label: pages.work.label },
  { path: pages.blog.path, label: pages.blog.label },
  { path: pages.gallery.path, label: pages.gallery.label },
].filter((page) => enabledRoutes[page.path as keyof typeof enabledRoutes]);

const ResumeIcon = icons.document;

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${scope.scope} ${styles.footer}`}>
      <div className={styles.inner}>
        <div className={styles.lead}>
          <Link href="/" className={styles.wordmark} aria-label={`${profile.name}, home`}>
            <span className={styles.mark} aria-hidden="true">
              <EMIcon />
            </span>
            <span>{profile.name}</span>
          </Link>
          <p>
            {profile.role}, working from {profile.location}.
          </p>
        </div>
        <nav aria-label="Footer" className={styles.cols}>
          <ul>
            {PAGES.map((page) => (
              <li key={page.path}>
                <Link href={page.path}>{page.label}</Link>
              </li>
            ))}
          </ul>
          <ul>
            {profileLinks.map((item) => {
              if (!item.href) return null;
              const Icon = icons[item.icon];
              const external = item.href.startsWith("http");
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {Icon && <Icon aria-hidden="true" className={styles.icon} />}
                    {item.name}
                  </a>
                </li>
              );
            })}
            {about.resumeUrl && (
              <li>
                <a href={about.resumeUrl}>
                  <ResumeIcon aria-hidden="true" className={styles.icon} />
                  Resume (PDF)
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>
      <div className={styles.base}>
        &copy; {currentYear} {profile.name}
      </div>
    </footer>
  );
};

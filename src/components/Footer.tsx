// The site footer, in Workbench (redesign 2026), on every page: Erick's
// monogram with his name, the pages, the social links and the Once UI licence
// line. Server-rendered; transparent over the page dots.
import scope from "@/components/workbench/scope.module.scss";
import { about, blog, gallery, person, routes, social, work } from "@/resources";
import { EMIcon } from "@/resources/EMIcon";
import { iconLibrary } from "@/resources/icons";
import Link from "next/link";
import styles from "./Footer.module.scss";

const PAGES = [
  { path: about.path, label: about.label },
  { path: work.path, label: work.label },
  { path: blog.path, label: blog.label },
  { path: gallery.path, label: gallery.label },
].filter((page) => routes[page.path as keyof typeof routes]);

const ResumeIcon = iconLibrary.document;

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${scope.scope} ${styles.footer}`}>
      <div className={styles.inner}>
        <div className={styles.lead}>
          <Link href="/" className={styles.wordmark} aria-label={`${person.name}, home`}>
            <span className={styles.mark} aria-hidden="true">
              <EMIcon />
            </span>
            <span>{person.name}</span>
          </Link>
          <p>
            {person.role}, working from {person.location}.
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
            {social.map((item) => {
              if (!item.link) return null;
              const Icon = iconLibrary[item.icon];
              const external = item.link.startsWith("http");
              return (
                <li key={item.name}>
                  <a
                    href={item.link}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {Icon && <Icon aria-hidden="true" className={styles.icon} />}
                    {item.name}
                  </a>
                </li>
              );
            })}
            {about.resume?.display && (
              <li>
                <a href={about.resume.link}>
                  <ResumeIcon aria-hidden="true" className={styles.icon} />
                  Resume (PDF)
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>
      <div className={styles.base}>
        <span>
          &copy; {currentYear} {person.name}
        </span>
        <span>
          Based on <a href="https://once-ui.com/">Once UI</a> (adapted). Licensed under{" "}
          <a href="https://creativecommons.org/licenses/by-nc/4.0/">CC BY-NC 4.0</a>.
        </span>
      </div>
    </footer>
  );
};

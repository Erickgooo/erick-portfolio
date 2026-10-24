"use client";

// The site header (see Header.module.scss): location, the pill of page keys
// with the theme key, and Erick's local time.
import { about, enabledRoutes, headerShows, pages, profile } from "@/resources";
import { EMIcon } from "@/resources/EMIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  PiBookBookmarkDuotone,
  PiGridFourDuotone,
  PiImageDuotone,
  PiUserCircleDuotone,
} from "react-icons/pi";
import styles from "./Header.module.scss";
import { ThemeToggle } from "./ThemeToggle";

/** The time in a zone as HH:MM:SS, ticking every second. Empty until mounted. */
function Clock({ timeZone }: { timeZone: string }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    let format: Intl.DateTimeFormat;
    try {
      format = new Intl.DateTimeFormat("en-GB", { ...options, timeZone });
    } catch {
      format = new Intl.DateTimeFormat("en-GB", options);
    }
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timeZone]);

  return <>{time}</>;
}

type Page = { path: keyof typeof enabledRoutes; label: string; Icon: IconType; exact?: boolean };

const PAGES: Page[] = [
  { path: "/about", label: pages.about.label, Icon: PiUserCircleDuotone, exact: true },
  { path: "/work", label: pages.work.label, Icon: PiGridFourDuotone },
  { path: "/blog", label: pages.blog.label, Icon: PiBookBookmarkDuotone },
  { path: "/gallery", label: pages.gallery.label, Icon: PiImageDuotone },
];

export const Header = () => {
  const pathname = usePathname() ?? "";
  const isCurrent = (path: string, exact = false) =>
    exact ? pathname === path : pathname.startsWith(path);

  return (
    <>
      <div className={styles.gap} />
      <div className={`${styles.fade} ${styles.fadeTop}`} />
      <div className={`${styles.fade} ${styles.fadeBottom}`} />
      <header className={styles.bar}>
        <div className={`${styles.side} ${styles.start} ${styles.meta}`}>
          {headerShows.location && <span className={styles.desk}>{profile.location}</span>}
        </div>
        <div className={styles.middle}>
          <nav className={styles.pill} aria-label="Main">
            {enabledRoutes["/"] && (
              <Link
                href="/"
                className={styles.key}
                aria-label={`${profile.name} — Home`}
                aria-current={pathname === "/" ? "page" : undefined}
              >
                <span className={styles.icon}>
                  <EMIcon />
                </span>
              </Link>
            )}
            <span className={styles.rule} />
            {PAGES.filter((page) => enabledRoutes[page.path]).map(
              ({ path, label, Icon, exact }) => (
                <Link
                  key={path}
                  href={path}
                  className={styles.key}
                  aria-current={isCurrent(path, exact) ? "page" : undefined}
                >
                  <span className={styles.icon}>
                    <Icon />
                  </span>
                  <span className={styles.label}>{label}</span>
                </Link>
              ),
            )}
            {headerShows.themeKey && (
              <>
                <span className={styles.rule} />
                <ThemeToggle className={styles.key} iconClassName={styles.icon} />
              </>
            )}
          </nav>
        </div>
        <div className={`${styles.side} ${styles.end}`}>
          {headerShows.time && (
            <span className={`${styles.meta} ${styles.desk}`}>
              <Clock timeZone={profile.timeZone} />
            </span>
          )}
        </div>
      </header>
    </>
  );
};

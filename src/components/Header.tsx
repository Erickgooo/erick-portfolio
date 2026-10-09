"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import { about, blog, display, gallery, routes, work } from "@/resources";
import { EMIcon } from "@/resources/EMIcon";
import styles from "./Header.module.scss";
import { ThemeToggle } from "./ThemeToggle";

type TimeDisplayProps = {
  timeZone: string;
  locale?: string; // Optionally allow locale, defaulting to 'en-GB'
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeZone, locale = "en-GB" }) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };

      let resolvedTimeZone = timeZone;
      if (timeZone === "America/Medellin") {
        resolvedTimeZone = "America/Bogota";
      }

      try {
        const timeString = new Intl.DateTimeFormat(locale, {
          ...options,
          timeZone: resolvedTimeZone,
        }).format(now);
        setCurrentTime(timeString);
      } catch (error) {
        console.error("Invalid timezone:", resolvedTimeZone, error);
        try {
          const timeString = new Intl.DateTimeFormat(locale, options).format(now);
          setCurrentTime(timeString);
        } catch (e) {
          setCurrentTime("");
        }
      }
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, [timeZone, locale]);

  return <>{currentTime}</>;
};

export default TimeDisplay;

const NAV = [
  { href: "/about", label: about.label },
  { href: "/work", label: work.label },
  { href: "/blog", label: blog.label },
  { href: "/gallery", label: gallery.label },
] as const;

export const Header = () => {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const links = NAV.filter((link) => routes[link.href]);
  const current = (href: string) => (pathname.startsWith(href) ? "page" : undefined);

  // A navigation always leaves the menu closed.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger, not an input
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      burgerRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={styles.header} style={{ viewTransitionName: "site-header" }}>
      <nav className={styles.pill} aria-label="Main">
        {routes["/"] && (
          <Link
            href="/"
            className={styles.brand}
            aria-label="Erick Mahecha — Home"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <EMIcon />
          </Link>
        )}
        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link} aria-current={current(link.href)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        {display.themeSwitcher && <ThemeToggle />}
        <button
          ref={burgerRef}
          type="button"
          className={styles.burger}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </nav>
      <div id="site-menu" className={styles.menu} data-open={open} inert={!open}>
        <ul className={styles.menuList}>
          {links.map((link, i) => (
            <li key={link.href} style={{ "--i": i } as CSSProperties}>
              <Link href={link.href} className={styles.menuLink} aria-current={current(link.href)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};

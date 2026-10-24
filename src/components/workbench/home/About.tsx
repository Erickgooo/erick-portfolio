// Workbench: a short about, with the photo beside it (sober, 2026-10-22:
// straight and flat, no tape).
import { about, pages, profile } from "@/resources";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FiArrowRight } from "react-icons/fi";
import { MEDIA } from "../media";
import ui from "../ui.module.scss";
import styles from "./about.module.scss";

function shortTime(timeframe: string) {
  return timeframe.replace(/\s*-\s*/, " to ");
}

export function About() {
  const jobs = about.experience.jobs;

  return (
    <section className={styles.about} aria-labelledby="about-title">
      <div className={styles.inner}>
        <div className={styles.photoCol}>
          <figure className={styles.photo} data-reveal="">
            <Image
              src={MEDIA.avatar.src}
              width={MEDIA.avatar.w}
              height={MEDIA.avatar.h}
              alt={`Portrait of ${profile.name}`}
              sizes="(min-width: 1024px) 360px, 70vw"
            />
            <figcaption>
              {profile.name}
              <span>{profile.location}</span>
            </figcaption>
          </figure>
        </div>
        <div className={styles.text}>
          <h2 id="about-title" data-reveal="">
            A one-person growth department.
          </h2>
          <div className={styles.story} data-reveal="" style={{ "--i": 1 } as CSSProperties}>
            <p>
              My entry point into marketing wasn&rsquo;t a campaign. It was a crisis line: two years
              at Concentrix handling security incidents, fraud cases and technical failures for
              Mercado Pago users.
            </p>
            <p>
              It taught me where systems break and what it costs when they do. Now I build the ones
              that remove that friction, for companies across construction, food and retail.
            </p>
          </div>
          <ul className={styles.jobs} aria-label="Where I have worked">
            {jobs.map((job, i) => (
              <li key={job.company} data-reveal="" style={{ "--i": i + 2 } as CSSProperties}>
                <span className={styles.company}>{job.company}</span>
                <span className={styles.role}>{job.role}</span>
                <span className={styles.time}>{shortTime(job.timeframe)}</span>
              </li>
            ))}
          </ul>
          <div className={styles.links}>
            <Link href={pages.about.path} className={ui.textLink}>
              The full story <FiArrowRight aria-hidden="true" />
            </Link>
            <a href={about.resumeUrl ?? "/resume/Erick_Mahecha_Resume.pdf"} className={ui.textLink}>
              Resume (PDF)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

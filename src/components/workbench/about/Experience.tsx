// Workbench About: the work experience as rows between hairlines. Each row
// shows the dates, the company and the role; it opens (a native <details>, so
// it needs no script and works from the keyboard) to what was done there. The
// current role starts open, so the first row shows the way.
import { about } from "@/resources";
import type { CSSProperties } from "react";
import { FiDownload } from "react-icons/fi";
import { inWords } from "../data";
import ui from "../ui.module.scss";
import styles from "./experience.module.scss";

/** "July 2026 - Present" becomes ["July 2026", "Present"]; "May 2026" stays alone. */
function splitTime(timeframe: string): [string, string | undefined] {
  const [from, to] = timeframe.split(/\s+-\s+/);
  return [from, to];
}

export function Experience() {
  const jobs = about.experience.jobs;
  const resume = about.resumeUrl ?? "/resume/Erick_Mahecha_Resume.pdf";
  const firstYear = jobs.at(-1)?.timeframe.match(/\d{4}/)?.[0];
  const count = inWords(jobs.length);

  return (
    <section className={styles.experience} aria-labelledby="experience-title">
      <div className={styles.inner}>
        <div className={styles.head} data-reveal="">
          <h2 id="experience-title">Work experience</h2>
          <div className={styles.headText}>
            <p>
              {count.charAt(0).toUpperCase() + count.slice(1)} roles
              {firstYear ? ` since ${firstYear}` : ""}, from a support line to leading growth. Open
              a ticket for what I did there.
            </p>
            <a href={resume} className={ui.textLink} download>
              The full resume (PDF) <FiDownload aria-hidden="true" />
            </a>
          </div>
        </div>
        <ol className={styles.rows}>
          {jobs.map((job, i) => {
            const [from, to] = splitTime(job.timeframe);
            return (
              <li
                key={`${job.company}-${job.role}`}
                className={styles.item}
                data-reveal=""
                style={{ "--i": i } as CSSProperties}
              >
                <details className={styles.row} open={i === 0}>
                  <summary>
                    <span className={styles.when}>
                      <span className={styles.from}>{from}</span>
                      {to && <span className={styles.to}>to {to}</span>}
                    </span>
                    <span className={styles.what}>
                      <h3>{job.company}</h3>
                      <span className={styles.role}>{job.role}</span>
                    </span>
                    <span className={styles.toggle} aria-hidden="true" />
                  </summary>
                  <div className={styles.body}>
                    {job.description && <p className={styles.desc}>{job.description}</p>}
                    <ul>
                      {job.achievements.map((achievement, j) => (
                        <li key={`${job.company}-${j}`}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

// THROWAWAY (lab only): what sits under the film in the three directions.
import { about } from "@/resources";
import { landing } from "@/resources/landing";
import { coverImage, parseMetric, publicProjects, sortProjects } from "@/utils/projects";
import { getPosts } from "@/utils/utils";
import Image from "next/image";
import Link from "next/link";
import { CALL, closing, ledger } from "./copy";
import s from "./lab.module.scss";

export function CallLink() {
  return (
    <a
      href={about.calendar.link}
      target="_blank"
      rel="noopener noreferrer"
      className={s.cta}
      data-cta="primary"
    >
      {CALL}
    </a>
  );
}

function projects() {
  return sortProjects(publicProjects(getPosts(["src", "app", "work", "projects"])));
}

/** Every public project as picture, title and result. */
function WorkGrid() {
  return (
    <ul className={s.work}>
      {projects()
        .slice(0, 6)
        .map((project) => {
          const cover = coverImage(project.metadata.images);
          const metric = parseMetric(project.metadata.metric);
          return (
            <li key={project.slug}>
              <Link href={`/work/${project.slug}`} className={s.workLink}>
                <span className={s.workMedia}>
                  {cover && (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className={s.workImage}
                    />
                  )}
                </span>
                <span className={s.workTitle}>{project.metadata.title}</span>
                {metric && (
                  <span className={s.workResult}>
                    {metric.value} {metric.label}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
    </ul>
  );
}

/** Every public project as a row: what it was and what it returned. */
function WorkTable() {
  return (
    <table className={s.table}>
      <thead>
        <tr>
          <th scope="col">{ledger.table.project}</th>
          <th scope="col">{ledger.table.result}</th>
        </tr>
      </thead>
      <tbody>
        {projects().map((project) => {
          const metric = parseMetric(project.metadata.metric);
          return (
            <tr key={project.slug}>
              <td>
                <Link href={`/work/${project.slug}`} className={s.rowLink}>
                  {project.metadata.title}
                </Link>
              </td>
              <td>{metric ? `${metric.value} ${metric.label}` : ledger.table.none}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function Closing({ work = "grid" }: { work?: "grid" | "table" }) {
  return (
    <div className={s.closing}>
      <section className={s.section}>
        <h2 className={s.h2}>{work === "table" ? ledger.table.title : closing.work.title}</h2>
        {work === "table" ? <WorkTable /> : <WorkGrid />}
        {work === "grid" && (
          <p className={s.hiringLinks}>
            <Link href="/work" className={s.link}>
              {closing.work.all}
            </Link>
          </p>
        )}
      </section>

      <section className={s.hiring}>
        <div className={s.section}>
          <h2 className={s.h2}>{closing.hiring.title}</h2>
          <p className={s.p}>{closing.hiring.text}</p>
        </div>
        <p className={s.hiringLinks}>
          {about.resume?.display && (
            <a href={about.resume.link} download className={s.link}>
              {closing.hiring.resume}
            </a>
          )}
          <Link href={about.path} className={s.link}>
            {closing.hiring.about}
          </Link>
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>{closing.faq.title}</h2>
        <div className={s.faq}>
          {landing.faq.items.map((item) => (
            <details key={item.question} className={s.faqItem}>
              <summary className={s.faqQuestion}>{item.question}</summary>
              <p className={s.faqAnswer}>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={s.final}>
        <h2 className={s.finalTitle}>{closing.final.title}</h2>
        <p className={s.p}>{closing.final.text}</p>
        <CallLink />
      </section>
    </div>
  );
}

import { about } from "@/resources";
import { landing } from "@/resources/landing";
import { coverImage, parseMetric, recentProjects } from "@/utils/projects";
import { getPosts } from "@/utils/utils";
import Image from "next/image";
import Link from "next/link";
import { CallButton } from "./CallButton";
import styles from "./landing.module.scss";

/** How many projects the Home shows before sending the reader to /work. */
const WORK_COUNT = 6;

/** schema.org FAQPage for the questions below; `<` is escaped so the JSON cannot close its script tag. */
function faqSchema(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: landing.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }).replace(/</g, "\\u003c");
}

/**
 * Everything under the film, on the page's own background: the work, the block
 * for hiring teams, the questions, and the same call to action the page opened with.
 */
export function Closing() {
  const projects = recentProjects(getPosts(["src", "app", "work", "projects"]), WORK_COUNT);
  return (
    <div className={styles.closing}>
      {/* With every project protected there is nothing to show, so the section is left out: no heading over an empty list. */}
      {projects.length > 0 && (
        <section className={styles.block} data-landing-section="proof">
          <h2 className={styles.blockTitle}>{landing.work.title}</h2>
          <ul className={styles.work}>
            {projects.map((project) => {
              const { title, images, metric: rawMetric } = project.metadata;
              const cover = coverImage(images);
              const metric = parseMetric(rawMetric);
              return (
                <li key={project.slug} data-work-item="">
                  <Link href={`/work/${project.slug}`} className={styles.workLink}>
                    <span className={styles.workMedia}>
                      {cover && (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          sizes="(max-width: 767px) 100vw, (max-width: 1099px) 50vw, 380px"
                          className={styles.workImage}
                        />
                      )}
                    </span>
                    <span className={styles.workTitle}>{title}</span>
                    {/* Only where the project reports one: a result is never made up to fill the row. */}
                    {metric && (
                      <span className={styles.workResult}>
                        {metric.value} {metric.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className={styles.links}>
            <Link href="/work" className={styles.textLink}>
              {landing.work.all}
            </Link>
          </p>
        </section>
      )}

      <section className={styles.hiring} data-landing-section="hiring">
        <div className={styles.block}>
          <h2 className={styles.blockTitle}>{landing.hiring.title}</h2>
          <p className={styles.blockText}>{landing.hiring.text}</p>
        </div>
        <p className={styles.links}>
          {about.resume?.display && (
            <a href={about.resume.link} download className={styles.textLink}>
              {landing.hiring.resume}
            </a>
          )}
          <Link href={about.path} className={styles.textLink}>
            {landing.hiring.about}
          </Link>
        </p>
      </section>

      <section className={styles.block} data-landing-section="faq">
        <h2 className={styles.blockTitle}>{landing.faq.title}</h2>
        <div className={styles.faq}>
          {landing.faq.items.map((item) => (
            <details key={item.question} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>{item.question}</summary>
              <p className={styles.faqAnswer} data-faq-answer="">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data built from our own static copy, with `<` escaped
          dangerouslySetInnerHTML={{ __html: faqSchema() }}
        />
      </section>

      <section className={styles.finalCta} data-landing-section="final-cta">
        <h2 className={styles.finalTitle}>{landing.finalCta.title}</h2>
        <p className={styles.blockText}>{landing.finalCta.text}</p>
        <CallButton />
      </section>
    </div>
  );
}

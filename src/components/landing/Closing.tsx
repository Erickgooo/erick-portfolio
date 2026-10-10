import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { about } from "@/resources";
import { landing } from "@/resources/landing";
import { coverImage, parseMetric, publicProjects, sortProjects } from "@/utils/projects";
import { getPosts } from "@/utils/utils";
import Image from "next/image";
import Link from "next/link";
import { CallButton } from "./CallButton";
import styles from "./landing.module.scss";

/** The three most recent case studies that have a headline result and are not behind the password. */
function recentProjects() {
  const projects = publicProjects(getPosts(["src", "app", "work", "projects"])).filter(
    (post) => parseMetric(post.metadata.metric) !== null,
  );
  return sortProjects(projects).slice(0, 3);
}

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
 * Everything under the film, on the page's own background: proof, the block for
 * hiring teams, objections, and the same call to action the page opened with.
 */
export function Closing() {
  const projects = recentProjects();
  return (
    <div className={styles.closing}>
      {/* With every project protected there is nothing to show: no heading over an empty list. */}
      <section className={styles.block} data-landing-section="proof" hidden={projects.length === 0}>
        <Reveal>
          <h2 className={styles.blockTitle}>{landing.proof.title}</h2>
        </Reveal>
        <ul className={styles.cards}>
          {projects.map((project, i) => {
            const { title, summary, images, metric: rawMetric } = project.metadata;
            const cover = coverImage(images);
            const metric = parseMetric(rawMetric);
            return (
              <Reveal as="li" key={project.slug} index={i} className={styles.cardItem}>
                <article className={styles.card} data-proof-card="">
                  <Link href={`/work/${project.slug}`} className={styles.cardLink}>
                    <span className={styles.cardMedia}>
                      {cover && (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 360px"
                          className={styles.cardImage}
                        />
                      )}
                    </span>
                    <span className={styles.cardBody}>
                      {/* The slot stays even without a metric, so the cards line up. */}
                      <span className={styles.cardMetric}>
                        {metric && (
                          <span data-proof-metric="">
                            <strong>{metric.value}</strong> {metric.label}
                          </span>
                        )}
                      </span>
                      <span className={styles.cardTitle}>{title}</span>
                      <span className={styles.cardSummary}>{summary}</span>
                    </span>
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </ul>
        <Link href="/work" className={styles.textLink}>
          {landing.proof.all}
        </Link>
      </section>

      <section className={styles.block} data-landing-section="hiring">
        <Reveal className={styles.hiring}>
          <div>
            <h2 className={styles.blockTitle}>{landing.hiring.title}</h2>
            <p className={styles.blockText}>{landing.hiring.text}</p>
          </div>
          <p className={styles.hiringLinks}>
            {about.resume?.display && (
              <a href={about.resume.link} download className={styles.textLink}>
                {landing.hiring.resume}
              </a>
            )}
            <Link href={about.path} className={styles.textLink}>
              {landing.hiring.about}
            </Link>
          </p>
        </Reveal>
      </section>

      <section className={styles.block} data-landing-section="faq">
        <Reveal>
          <h2 className={styles.blockTitle}>{landing.faq.title}</h2>
        </Reveal>
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

      <section className={styles.block} data-landing-section="final-cta">
        <Reveal className={styles.finalCta}>
          <h2 className={styles.finalTitle}>{landing.finalCta.title}</h2>
          <p className={styles.blockText}>{landing.finalCta.text}</p>
          <span data-cta-magnetic="">
            <Magnetic>
              <CallButton />
            </Magnetic>
          </span>
        </Reveal>
      </section>
    </div>
  );
}

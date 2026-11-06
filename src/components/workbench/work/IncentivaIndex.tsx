// Workbench, /work/incentiva-group: everything Erick did at Incentiva Group in
// one index. The head carries the role and its summary beside a scene (the
// three inherited platforms); then the case studies; then every project as a
// card, grouped by area of responsibility, with its status, client, a line of
// what was done and the stack. A project that is part of a case links to it.
// Server-rendered; the scripts are the page's reveal observer and scene driver.
import {
  INCENTIVA_AREAS,
  type IncentivaProject,
  type IncentivaStatus,
  incentivaProjects,
  incentivaRole,
} from "@/resources/incentiva";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { BookCall } from "../BookCall";
import { BrandStage } from "../BrandStage";
import { SceneSheet } from "../scenes/Scene";
import { InheritedPlatforms } from "../scenes/work/InheritedPlatforms";
import { type Case, getCase } from "./cases";
import styles from "./incentiva.module.scss";

/** The case studies of the role, in the order they are featured. */
const INCENTIVA_CASES = [
  "scope-multi-client-platform",
  "scope-ios-launch",
  "chatflow-whatsapp-ai-platform",
  "directv-click-to-whatsapp",
  "samsung-lifemiles-whatsapp",
  "incentiva-launch-campaign",
  "incentiva-website-brand",
];

const STATUS_KEY: Record<IncentivaStatus, string> = {
  "In production": "live",
  "Delivered to client": "delivered",
  Internal: "internal",
};

function ProjectCard({ p, i }: { p: IncentivaProject; i: number }) {
  return (
    <li className={styles.slot} data-reveal="" style={{ "--i": i % 3 } as CSSProperties}>
      <article className={styles.card}>
        <p className={styles.status} data-status={STATUS_KEY[p.status]}>
          <span className={styles.statusDot} aria-hidden="true" />
          {p.status}
        </p>
        <h3 className={styles.cardTitle}>
          {p.caseSlug ? (
            <Link href={`/work/${p.caseSlug}`} className={styles.stretch}>
              {p.title}
            </Link>
          ) : (
            p.title
          )}
        </h3>
        <p className={styles.client}>{p.client}</p>
        <p className={styles.line}>{p.line}</p>
        <ul className={styles.stack} aria-label="Stack">
          {p.stack.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
        {p.caseSlug ? (
          <span className={styles.open} aria-hidden="true">
            Read the case <FiArrowRight />
          </span>
        ) : null}
      </article>
    </li>
  );
}

function CaseLink({ c }: { c: Case }) {
  return (
    <li className={styles.caseSlot} data-reveal="">
      <Link href={c.href} className={styles.caseLink}>
        <span className={styles.caseName}>{c.name}</span>
        <span className={styles.caseSub}>{c.subtitle}</span>
        {c.metric ? (
          <span className={styles.caseMetric}>
            <strong>{c.metric.value}</strong> {c.metric.label}
          </span>
        ) : null}
        <FiArrowRight className={styles.caseArrow} aria-hidden="true" />
      </Link>
    </li>
  );
}

export function IncentivaIndex() {
  const cases = INCENTIVA_CASES.map((slug) => getCase(slug)).filter((c): c is Case => !!c);
  const count = incentivaProjects.length;

  return (
    <>
      <div className={styles.top}>
        <Link href="/work" className={styles.back}>
          <FiArrowLeft aria-hidden="true" /> All projects
        </Link>
      </div>

      <header className={styles.head}>
        <div className={styles.headText}>
          <p className={styles.fileLabel}>Experience index</p>
          {/* One word per line at every width: the break never depends on
              which font has arrived, so the lines below never move (CLS). */}
          <h1 className={styles.title}>
            {incentivaRole.company.split(" ").map((word, k, all) => (
              <span key={word}>
                {word}
                {k < all.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
          {/* Two fixed lines, so the break never moves when the font arrives. */}
          <p className={styles.role}>
            <span>{incentivaRole.title}</span>{" "}
            <span className={styles.roleMeta}>
              {`${incentivaRole.timeframe.replace(" - ", " – ")} · ${incentivaRole.place}`}
            </span>
          </p>
          <p className={styles.summary}>{incentivaRole.summary}</p>
          <p className={styles.method}>{incentivaRole.method}</p>
          <BookCall />
        </div>
        <div className={styles.headScene} data-reveal="">
          <SceneSheet paper="cobalt">
            <InheritedPlatforms />
          </SceneSheet>
        </div>
      </header>

      {/* The brands, compact and never pinned, right under the head. */}
      <BrandStage place="index" />

      <section className={styles.cases} aria-labelledby="incentiva-cases">
        <h2 id="incentiva-cases" className={styles.h2} data-reveal="">
          Seven case studies
        </h2>
        <ul className={styles.caseList}>
          {cases.map((c) => (
            <CaseLink key={c.slug} c={c} />
          ))}
        </ul>
      </section>

      <div className={styles.areas}>
        <p className={styles.areasLede} data-reveal="">
          Every project of the role, {count} in all, grouped by area. Each one is marked In
          production, Delivered to client, or Internal. Client figures and internal economics stay
          with the clients.
        </p>
        {INCENTIVA_AREAS.map((area) => (
          <section key={area.id} className={styles.area} aria-labelledby={`area-${area.id}`}>
            <div className={styles.areaHead} data-reveal="">
              <h2 id={`area-${area.id}`} className={styles.h2}>
                {area.title}
              </h2>
              <p className={styles.areaLine}>{area.line}</p>
            </div>
            <ul className={styles.grid}>
              {area.projects.map((p, i) => (
                <ProjectCard key={p.id} p={p} i={i} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

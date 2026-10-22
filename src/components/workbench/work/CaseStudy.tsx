// Workbench, case study: the case opened like a project folder. The header
// carries the title, client, role and date beside the folder with the cover
// print and the figure; the text follows in parts, each with its prints pinned
// in the margin; then the next case. Server-rendered except the video prints.
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { BookCall } from "../BookCall";
import { EndMark, Prose } from "../prose/Prose";
import { splitChapters } from "../prose/source";
import ui from "../ui.module.scss";
import { VideoPrint } from "./VideoPrint";
import styles from "./case.module.scss";
import { scenesFor } from "./caseScenes";
import { type Case, type CaseMedia, monthYear } from "./cases";

export function CaseHeader({ c }: { c: Case }) {
  return (
    <>
      <div className={styles.top}>
        <Link href="/work" className={styles.back}>
          <FiArrowLeft aria-hidden="true" /> All projects
        </Link>
      </div>

      <header className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.fileLabel}>Case study</p>
          <h1 className={styles.title} data-long={c.name.length > 12 ? "" : undefined}>
            <span className={styles.name}>{c.name}</span>
            {c.subtitle ? (
              <>
                <span className={styles.hidden}>: </span>
                <span className={styles.subtitle}>{c.subtitle}</span>
              </>
            ) : null}
          </h1>
          <p className={styles.summary}>{c.summary}</p>
          <dl className={styles.facts}>
            <div>
              <dt>Client</dt>
              <dd>{c.client}</dd>
            </div>
            {c.role ? (
              <div>
                <dt>Role</dt>
                <dd>{c.role}</dd>
              </div>
            ) : null}
            {c.publishedAt ? (
              <div>
                <dt>Published</dt>
                <dd>{monthYear(c.publishedAt)}</dd>
              </div>
            ) : null}
          </dl>
          <BookCall />
        </div>

        <div className={styles.folder} data-front={c.metric ? "" : undefined}>
          <div className={styles.folderBack}>
            <span className={styles.folderTab} aria-hidden="true">
              {c.name}
            </span>
          </div>
          <span className={styles.folderSheet} aria-hidden="true" />
          {c.cover ? (
            <figure className={styles.cover}>
              <Image
                src={c.cover.src}
                width={c.cover.w}
                height={c.cover.h}
                alt={c.title}
                sizes="(min-width: 1280px) 560px, (min-width: 1024px) 46vw, 84vw"
                priority
              />
            </figure>
          ) : null}
          {c.metric ? (
            <p className={styles.folderFront}>
              <strong>{c.metric.value}</strong>
              <span>{c.metric.label}</span>
            </p>
          ) : null}
        </div>
      </header>
    </>
  );
}

const RESULTS = /^(results|impact|the outcome|why it)/i;

function Pinned({ m, label, i }: { m: CaseMedia; label: string; i: number }) {
  const tilt = i % 2 ? 2.2 : -2;
  const pin = i % 2 ? "pin" : "tape";
  if (m.kind === "video") {
    return <VideoPrint src={m.src} width={m.w} height={m.h} label={label} tilt={tilt} pin={pin} />;
  }
  return (
    <figure
      className={styles.pinned}
      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
      data-reveal=""
    >
      <span className={pin === "tape" ? styles.tape : styles.pin} aria-hidden="true" />
      <span className={styles.pinnedFrame}>
        <Image
          src={m.src}
          width={m.w}
          height={m.h}
          alt={label}
          sizes="(min-width: 1024px) 420px, 86vw"
        />
      </span>
    </figure>
  );
}

export function CaseBody({ c }: { c: Case }) {
  const { preamble, chapters } = splitChapters(c.content);
  const last = chapters.length - 1;

  // Each extra print goes beside a part of the text, from the second part on.
  const pins = new Map<number, { m: CaseMedia; label: string; n: number }[]>();
  const counts = { image: 0, video: 0 };
  c.extras.forEach((m, k) => {
    counts[m.kind] += 1;
    const at = Math.max(0, Math.min(1 + k, last));
    const list = pins.get(at) ?? [];
    list.push({ m, label: `${c.name}, ${m.kind} ${counts[m.kind]}`, n: k });
    pins.set(at, list);
  });
  const resultsAt = c.metric ? chapters.findIndex((ch) => RESULTS.test(ch.heading)) : -1;

  return (
    <div className={styles.body}>
      {preamble || chapters.length === 0 ? (
        <div className={styles.chapter}>
          <div className={styles.prose}>
            {preamble ? <Prose source={preamble} /> : null}
            {chapters.length === 0 ? <EndMark /> : null}
          </div>
        </div>
      ) : null}
      {chapters.map((chapter, i) => {
        const prints = pins.get(i) ?? [];
        const scenes = scenesFor(c.slug, chapter.heading);
        const showTag = i === resultsAt && c.metric;
        const showBook = i === last;
        return (
          <section key={chapter.id || i} className={styles.chapter}>
            <div className={styles.prose}>
              <Prose source={chapter.body} />
              {i === last ? <EndMark /> : null}
            </div>
            {prints.length > 0 || scenes.length > 0 || showTag || showBook ? (
              <div className={styles.pins}>
                <div className={styles.pinsInner}>
                  {scenes.map((s) => (
                    <div key={s.id} className={styles.scene} data-reveal="">
                      {s.scene}
                    </div>
                  ))}
                  {prints.map((p) => (
                    <Pinned key={p.m.src} m={p.m} label={p.label} i={p.n} />
                  ))}
                  {showTag && c.metric ? (
                    <p className={`${styles.bigTag} ${styles.deskOnly}`} data-reveal="">
                      <strong>{c.metric.value}</strong>
                      <span>{c.metric.label}</span>
                    </p>
                  ) : null}
                  {showBook ? (
                    <div className={`${styles.bookNote} ${styles.deskOnly}`} data-reveal="">
                      <p>Want a system like this for your team?</p>
                      <BookCall size="small" />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

export function NextCase({ next }: { next: Case }) {
  return (
    <nav className={styles.next} aria-label="Next case">
      <div className={styles.nextInner} data-reveal="">
        <article className={`${styles.nextCard} ${styles[next.paper]}`}>
          <div className={styles.nextText}>
            <p className={styles.nextLabel}>Next case</p>
            <p className={styles.nextTitle}>
              <Link href={next.href} className={styles.stretch}>
                <span className={styles.nextName}>{next.name}</span>
                {next.subtitle ? (
                  <>
                    <span className={styles.hidden}>: </span>
                    <span className={styles.nextSub}>{next.subtitle}</span>
                  </>
                ) : null}
              </Link>
            </p>
            <span className={styles.nextOpen} aria-hidden="true">
              Open the case <FiArrowRight />
            </span>
          </div>
          {next.cover ? (
            <div className={styles.nextPrint}>
              <Image
                src={next.cover.src}
                width={next.cover.w}
                height={next.cover.h}
                alt=""
                sizes="(min-width: 1024px) 460px, 84vw"
              />
              {next.metric ? (
                <p className={styles.nextTag}>
                  <strong>{next.metric.value}</strong>
                  <span>{next.metric.label}</span>
                </p>
              ) : null}
            </div>
          ) : null}
        </article>
        <Link href="/work" className={ui.textLink}>
          All projects <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}

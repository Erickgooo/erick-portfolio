// Workbench, Visual Work: the head of the page. The words of the previous
// page beside an index card that counts what is on the bench and jumps to
// each client's section.
import type { CSSProperties } from "react";
import { FiArrowDown } from "react-icons/fi";
import { type GalleryBench, countOf, piecesIn } from "./data";
import styles from "./gallery.module.scss";

const STACK = [
  "Higgsfield",
  "Kling 3.0",
  "Google Veo 3",
  "DaVinci Resolve",
  "CapCut",
  "ElevenLabs",
  "Affinity",
];

export function Head({ bench }: { bench: GalleryBench }) {
  const { totals, clients } = bench;
  const figures = [
    { value: totals.videos, label: totals.videos === 1 ? "video" : "videos" },
    { value: totals.decks, label: totals.decks === 1 ? "carousel" : "carousels" },
    { value: totals.posts, label: totals.posts === 1 ? "post" : "posts" },
  ];

  return (
    <section className={styles.head} aria-labelledby="gallery-title">
      <div className={styles.headText}>
        <h1 id="gallery-title" className={styles.title}>
          Visual Work
        </h1>
        <p className={styles.lede}>
          Cinematic video production used to require a crew, a budget, and days of shooting. These
          assets were built by one person, usually in hours.
        </p>
        <p className={styles.more}>
          Paid ad creatives, short-form video and AI-generated content produced for real campaigns.
          Each piece was built around a specific platform context and commercial objective.
        </p>
        <p className={styles.stack}>
          <strong>Stack</strong>
          {STACK.join(" · ")}
        </p>
      </div>
      <div className={styles.card}>
        <span className={styles.cardTape} aria-hidden="true" />
        <h2 className={styles.cardTitle}>On the bench</h2>
        <dl className={styles.figures}>
          {figures.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
        <nav aria-label="Clients">
          <ul className={styles.index}>
            {clients.map((client, i) => (
              <li key={client.id} style={{ "--i": i } as CSSProperties}>
                <a href={`#${client.id}`}>
                  <span>{client.name}</span>
                  <span className={styles.indexCount}>
                    {countOf(piecesIn(client), "piece", "pieces")}
                    <FiArrowDown aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

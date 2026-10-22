// Workbench About: studies and certifications as index cards. The two degrees
// are the large cards; the certifications are grouped by issuer, one card
// each, and every name links to its credential.
import { about } from "@/resources/content";
import type { CSSProperties } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import styles from "./credentials.module.scss";

type Cert = (typeof about.certifications.items)[number];

/** Certifications grouped by issuer: most first, then in the order content.tsx lists them. */
function byIssuer(items: Cert[]) {
  const groups = new Map<string, Cert[]>();
  for (const item of items) {
    const list = groups.get(item.institution) ?? [];
    list.push(item);
    groups.set(item.institution, list);
  }
  return [...groups.entries()]
    .map(([issuer, certs], order) => ({ issuer, certs, order }))
    .sort((a, b) => b.certs.length - a.certs.length || a.order - b.order);
}

const STUDY_PAPERS = ["cobalt", "ink"] as const;
const CARD_PAPERS = ["paper", "mist"] as const;
const TILTS = [-1.2, 0.9, -0.6, 1.1, -0.9, 0.7, -1];

export function Credentials() {
  const studies = about.studies.institutions;
  const certs = about.certifications.items;
  const issuers = byIssuer(certs);

  return (
    <section className={styles.credentials} aria-labelledby="credentials-title">
      <div className={styles.inner}>
        <div className={styles.head} data-reveal="">
          <h2 id="credentials-title">Studies and certifications</h2>
          <p>
            A degree in marketing, a technical degree, and {certs.length} certifications in AI, data
            and paid media.
          </p>
        </div>
        <div className={styles.layout}>
          <ul className={styles.studies} aria-label={about.studies.title}>
            {studies.map((study, i) => (
              <li
                key={study.name}
                className={`${styles.study} ${styles[STUDY_PAPERS[i % STUDY_PAPERS.length]]}`}
                data-reveal=""
                style={{ "--i": i, "--r": `${i % 2 ? 1.2 : -1.6}deg` } as CSSProperties}
              >
                <span className={styles.clip} aria-hidden="true" />
                <h3>{study.name}</h3>
                <p>{study.description}</p>
              </li>
            ))}
          </ul>
          <ul className={styles.cards} aria-label={about.certifications.title}>
            {issuers.map((group, i) => (
              <li
                key={group.issuer}
                className={`${styles.card} ${styles[CARD_PAPERS[i % CARD_PAPERS.length]]}`}
                data-reveal=""
                style={{ "--i": i % 3, "--r": `${TILTS[i % TILTS.length]}deg` } as CSSProperties}
              >
                <h3>{group.issuer}</h3>
                <ul>
                  {group.certs.map((cert) => (
                    <li key={cert.link}>
                      <a href={cert.link} target="_blank" rel="noopener noreferrer">
                        <span>{cert.name}</span>
                        <FiArrowUpRight aria-hidden="true" />
                        <span className={styles.srOnly}> (credential, opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// Workbench About: studies and certifications as hairline cards. The two degrees
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
                className={styles.study}
                data-reveal=""
                style={{ "--i": i } as CSSProperties}
              >
                <h3>{study.name}</h3>
                <p>{study.description}</p>
              </li>
            ))}
          </ul>
          <ul className={styles.cards} aria-label={about.certifications.title}>
            {issuers.map((group, i) => (
              <li
                key={group.issuer}
                className={styles.card}
                data-reveal=""
                style={{ "--i": i % 3 } as CSSProperties}
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

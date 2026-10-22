// Workbench prose: a case's figures as paper tags, from the ResultsStats data
// string the MDX already carries ("110K|views|2,411|likes"). The figures are
// printed as written; the tags rise and pop into place when they enter.
import type { CSSProperties } from "react";
import styles from "./prose.module.scss";

function pairs(data: string) {
  const parts = data.split("|").map((s) => s.trim());
  const out: { value: string; label: string }[] = [];
  for (let i = 0; i + 1 < parts.length; i += 2) out.push({ value: parts[i], label: parts[i + 1] });
  return out;
}

export function Figures({ data = "", title }: { data?: string; title?: string }) {
  const figures = pairs(data);
  if (figures.length === 0) return null;
  return (
    <div className={styles.figures}>
      {title ? <p className={styles.label}>{title}</p> : null}
      <ul className={styles.figureList} data-reveal="">
        {figures.map((figure, i) => (
          <li
            key={`${figure.label}-${figure.value}`}
            className={i === 0 ? styles.figureLead : undefined}
            style={{ "--i": i, "--t": `${i % 2 ? 1.2 : -1.4}deg` } as CSSProperties}
          >
            <strong>{figure.value}</strong>
            <span>{figure.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

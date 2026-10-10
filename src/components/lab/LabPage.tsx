// THROWAWAY (lab only): the shell around a Home direction, shared by /lab?v=a and /lab/a.
import { Archivo } from "next/font/google";
import Link from "next/link";
import { DirectionA } from "./DirectionA";
import { DirectionB } from "./DirectionB";
import { DirectionC } from "./DirectionC";
import styles from "./lab.module.scss";

// Direction B's display face: the width axis reaches the wordmark's proportions.
const display = Archivo({
  variable: "--font-lab-display",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const DIRECTIONS = [
  { id: "a", name: "Voz en off" },
  { id: "b", name: "Escritorio y libro mayor" },
  { id: "c", name: "Departamento de uno" },
] as const;

export const labMetadata = {
  title: "Lab: direcciones para la Home",
  robots: { index: false, follow: false },
};

/** Any unknown value falls back to A, so a mistyped link still shows a direction. */
export function LabPage({ v, clean = false }: { v?: string; clean?: boolean }) {
  const direction = DIRECTIONS.find((item) => item.id === v?.toLowerCase())?.id ?? "a";

  return (
    <div className={`${styles.lab} ${display.variable}`} data-lab={direction}>
      {/* `clean` hides the switcher, for screenshots. */}
      {!clean && (
        <nav className={styles.switch} aria-label="Direcciones">
          {DIRECTIONS.map((item) => (
            <Link
              key={item.id}
              href={`/lab/${item.id}`}
              className={styles.switchLink}
              aria-current={item.id === direction ? "page" : undefined}
            >
              {item.id.toUpperCase()}
              <span className={styles.switchName}>{item.name}</span>
            </Link>
          ))}
        </nav>
      )}
      {direction === "a" && <DirectionA />}
      {direction === "b" && <DirectionB />}
      {direction === "c" && <DirectionC />}
    </div>
  );
}

// THROWAWAY: a comparison page for Erick to pick a direction for the Home.
// Lives only on the lab/apple-directions branch and its Vercel Preview; it is
// not meant to be merged.
import { DirectionA } from "@/components/lab/DirectionA";
import { DirectionB } from "@/components/lab/DirectionB";
import { DirectionC } from "@/components/lab/DirectionC";
import styles from "@/components/lab/lab.module.scss";
import { Archivo } from "next/font/google";
import Link from "next/link";

// Direction B's display face: the width axis reaches the wordmark's proportions.
const display = Archivo({
  variable: "--font-lab-display",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata = {
  title: "Lab: direcciones para la Home",
  robots: { index: false, follow: false },
};

const DIRECTIONS = [
  { id: "a", name: "Voz en off" },
  { id: "b", name: "Escritorio y libro mayor" },
  { id: "c", name: "Departamento de uno" },
] as const;

export default async function Lab({
  searchParams,
}: {
  searchParams: Promise<{ v?: string; clean?: string }>;
}) {
  const { v, clean } = await searchParams;
  const direction = DIRECTIONS.find((item) => item.id === v)?.id ?? "a";

  return (
    <div className={`${styles.lab} ${display.variable}`} data-lab={direction}>
      {/* ?clean=1 hides the switcher, for screenshots. */}
      {!clean && (
        <nav className={styles.switch} aria-label="Direcciones">
          {DIRECTIONS.map((item) => (
            <Link
              key={item.id}
              href={`/lab?v=${item.id}`}
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

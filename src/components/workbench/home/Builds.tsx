// Workbench: what Erick builds, as index cards dealt onto the bench.
import type { CSSProperties } from "react";
import type { IconType } from "react-icons";
import { TbMessageChatbot, TbMovie, TbTargetArrow, TbTools } from "react-icons/tb";
import styles from "./builds.module.scss";

const BUILDS: {
  title: string;
  text: string;
  where: string;
  icon: IconType;
  paper: "cobalt" | "ink" | "mist" | "paper";
  r: number;
}[] = [
  {
    title: "Bots that qualify leads",
    text: "WhatsApp assistants wired into the CRM. They sort every conversation and pass only sales-ready leads to people.",
    where: "Artesa Panadería, Cuatrimotos ATV Riders",
    icon: TbMessageChatbot,
    paper: "cobalt",
    r: -2.2,
  },
  {
    title: "Content engines",
    text: "AI video pipelines and automated SEO publishing that keep shipping without a production crew.",
    where: "Quick Metal Shop, Dakoma Roofing",
    icon: TbMovie,
    paper: "ink",
    r: 1.6,
  },
  {
    title: "Paid media that pays back",
    text: "Meta Ads for B2B and B2C, from the creative concept to the audience and the budget.",
    where: "Quick Metal Shop, Dakoma Roofing",
    icon: TbTargetArrow,
    paper: "mist",
    r: -1.2,
  },
  {
    title: "Brands, and the software behind them",
    text: "Brand manuals that become the company standard, and apps built when nothing exists yet.",
    where: "Quick Metal Shop, ArquiExpo 2026",
    icon: TbTools,
    paper: "paper",
    r: 2.4,
  },
];

export function Builds() {
  return (
    <section className={styles.builds} aria-labelledby="builds-title">
      <div className={styles.inner}>
        <div className={styles.head} data-reveal="">
          <h2 id="builds-title">What I build</h2>
          <p>Systems that keep running after I hand them over.</p>
        </div>
        <ul className={styles.cards}>
          {BUILDS.map((b, i) => {
            const Icon = b.icon;
            return (
              <li
                key={b.title}
                className={`${styles.card} ${styles[b.paper]}`}
                data-reveal=""
                style={{ "--i": i, "--r": `${b.r}deg` } as CSSProperties}
              >
                <span className={styles.clip} aria-hidden="true" />
                <span className={styles.icon} aria-hidden="true">
                  <Icon />
                </span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
                <p className={styles.where}>{b.where}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

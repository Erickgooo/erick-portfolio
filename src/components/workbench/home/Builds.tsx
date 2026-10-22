// Workbench: what Erick builds. The head carries a window that writes itself
// (the systems at work, type 2); then the four builds as a stepper (type 4):
// pinned on desktop, where each step brings its own scene of the work
// (type 1) on its own paper; a stack of step and scene on phones.
import type { ReactNode } from "react";
import type { Paper } from "../data";
import { SceneStepper } from "../scenes/SceneStepper";
import { AdReturn } from "../scenes/work/AdReturn";
import { BoothApp } from "../scenes/work/BoothApp";
import { LeadSort } from "../scenes/work/LeadSort";
import { ReelBuild } from "../scenes/work/ReelBuild";
import { ActivityLog } from "./ActivityLog";
import styles from "./builds.module.scss";

const BUILDS: {
  key: string;
  title: string;
  text: string;
  where: string;
  paper: Paper;
  scene: ReactNode;
}[] = [
  {
    key: "bots",
    title: "Bots that qualify leads",
    text: "WhatsApp assistants wired into the CRM. They sort every conversation and pass only sales-ready leads to people.",
    where: "Artesa Panadería, Cuatrimotos ATV Riders",
    paper: "cobalt",
    scene: <LeadSort />,
  },
  {
    key: "content",
    title: "Content engines",
    text: "AI video pipelines and automated SEO publishing that keep shipping without a production crew.",
    where: "Quick Metal Shop, Dakoma Roofing",
    paper: "ink",
    scene: <ReelBuild />,
  },
  {
    key: "paid",
    title: "Paid media that pays back",
    text: "Meta Ads for B2B and B2C, from the creative concept to the audience and the budget.",
    where: "Quick Metal Shop, Dakoma Roofing",
    paper: "mist",
    scene: <AdReturn />,
  },
  {
    key: "brands",
    title: "Brands, and the software behind them",
    text: "Brand manuals that become the company standard, and apps built when nothing exists yet.",
    where: "Quick Metal Shop, ArquiExpo 2026",
    paper: "paper",
    scene: <BoothApp />,
  },
];

export function Builds() {
  return (
    <section className={styles.builds} aria-labelledby="builds-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.headText} data-reveal="">
            <h2 id="builds-title">What I build</h2>
            <p>Systems that keep running after I hand them over.</p>
          </div>
          <div className={styles.window}>
            <ActivityLog />
          </div>
        </div>
        <SceneStepper
          steps={BUILDS.map((b) => ({
            key: b.key,
            title: b.title,
            text: b.text,
            note: b.where,
            paper: b.paper,
            scene: b.scene,
          }))}
        />
      </div>
    </section>
  );
}

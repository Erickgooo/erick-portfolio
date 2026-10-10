import { FilmSection } from "@/components/film/FilmSection";
import { home, person } from "@/resources";
import { landing } from "@/resources/landing";
import { CallButton } from "./CallButton";
import { Words } from "./Words";
import t from "./type.module.scss";

export function Hero() {
  return (
    <FilmSection beat="hero" screens={2} fade={false} top>
      <div className={`${t.block} ${t.hero}`}>
        <p className={t.pill}>{person.role}</p>
        <h1 className={t.h1}>
          <Words text={landing.hero.headline} emphasis={landing.hero.emphasis} />
        </h1>
        <p className={t.sub}>{landing.hero.subline}</p>
        <div className={t.action}>
          <CallButton />
          <span className={t.risk}>{landing.hero.risk}</span>
        </div>
        {home.stats && home.stats.length > 0 && (
          <ul className={t.stats} data-hero-stats="">
            {home.stats.map((stat) => (
              <li key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FilmSection>
  );
}

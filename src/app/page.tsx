import { CallToAction, Mailchimp } from "@/components";
import { Posts } from "@/components/blog/Posts";
import { DockFrame } from "@/components/home/DockFrame";
import { FeaturedProject } from "@/components/home/FeaturedProject";
import styles from "@/components/home/Home.module.scss";
import { HomeRail } from "@/components/home/HomeRail";
import { HomeSection } from "@/components/home/HomeSection";
import { LazyVideo } from "@/components/home/LazyVideo";
import { BlueprintFrame } from "@/components/motion/BlueprintFrame";
import { DecodeText } from "@/components/motion/DecodeText";
import { KineticText } from "@/components/motion/KineticText";
import { Reveal } from "@/components/motion/Reveal";
import { about, baseURL, home, person, routes } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { Avatar, Badge, Button, Heading, Meta, Row, Schema, Text } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

// Section order drives the "0N / 0T" indices — numbering comes from this list.
type SectionKey = "hero" | "reel" | "featured" | "writing" | "contact";
const SECTIONS: SectionKey[] = [
  "hero",
  "reel",
  "featured",
  ...(routes["/blog"] ? (["writing"] as SectionKey[]) : []),
  "contact",
];
const total = SECTIONS.length;
const idx = (key: SectionKey) => SECTIONS.indexOf(key) + 1;

export default function Home() {
  return (
    <div className={styles.home}>
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <HomeRail />

      <HomeSection index={idx("hero")} total={total} className={styles.hero}>
        <BlueprintFrame trigger="load" />
        {home.featured.display && (
          <Badge
            background="brand-alpha-weak"
            paddingX="12"
            paddingY="4"
            onBackground="neutral-strong"
            textVariant="label-default-s"
            arrow={false}
            href={home.featured.href}
            style={{ boxShadow: "var(--glow-border)" }}
          >
            <Row paddingY="2">{home.featured.title}</Row>
          </Badge>
        )}
        <Heading as="h1" wrap="balance" variant="display-strong-l">
          <KineticText text={home.headline as string} />
        </Heading>
        <Text as="p" wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
          {home.subline}
        </Text>
        {home.stats && home.stats.length > 0 && (
          <ul className={styles.stats} data-home-stats="">
            {home.stats.map((stat) => (
              <li key={stat.label} className={styles.stat}>
                <DecodeText value={stat.value} className={styles.statValue} />
                <span className={styles.statLabel}>{stat.label}</span>
              </li>
            ))}
          </ul>
        )}
        <Button
          id="about"
          data-border="rounded"
          href={about.path}
          variant="secondary"
          size="m"
          weight="default"
          arrowIcon
        >
          <Row gap="8" vertical="center" paddingRight="4">
            {about.avatar.display && (
              <Avatar
                marginRight="8"
                style={{ marginLeft: "-0.75rem" }}
                src={person.avatar}
                size="m"
              />
            )}
            {about.title}
          </Row>
        </Button>
      </HomeSection>

      <HomeSection index={idx("reel")} total={total}>
        <Reveal>
          <DockFrame>
            <LazyVideo
              data-testid="home-video"
              src="/videohome.mp4"
              poster="/images/videohome-poster.webp"
              width={1280}
              height={720}
              label="Play showreel"
              watermark
            />
          </DockFrame>
        </Reveal>
      </HomeSection>

      <HomeSection index={idx("featured")} total={total}>
        <Reveal>
          <FeaturedProject hideProtected={!isProtectedPath("/")} />
        </Reveal>
        <Row fillWidth horizontal="center" paddingBottom="24">
          <Button
            id="all-projects"
            data-border="rounded"
            href="/work"
            variant="secondary"
            size="m"
            arrowIcon
          >
            View all projects
          </Button>
        </Row>
      </HomeSection>

      {routes["/blog"] && (
        <HomeSection index={idx("writing")} total={total}>
          <Heading as="h2" variant="display-strong-xs" wrap="balance" marginBottom="24">
            Latest from the blog
          </Heading>
          <Reveal>
            <Posts range={[1, 2]} columns="2" hideProtected={!isProtectedPath("/")} />
          </Reveal>
        </HomeSection>
      )}

      <HomeSection index={idx("contact")} total={total}>
        <Reveal>
          <CallToAction />
        </Reveal>
      </HomeSection>
      <Mailchimp />
    </div>
  );
}

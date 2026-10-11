import { CallToAction, Mailchimp, NodeDivider } from "@/components";
import { Posts } from "@/components/blog/Posts";
import { LazyVideo } from "@/components/home/LazyVideo";
import { Projects } from "@/components/work/Projects";
import { about, baseURL, home, person, routes } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import {
  Avatar,
  Badge,
  Button,
  Column,
  Heading,
  Meta,
  RevealFx,
  Row,
  Schema,
  Text,
} from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default function Home() {
  return (
    <Column maxWidth="m" gap="xl" paddingY="12" horizontal="center">
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
      <Column fillWidth horizontal="center" gap="m">
        <Column maxWidth="s" horizontal="center" align="center">
          {home.featured.display && (
            <RevealFx
              fillWidth
              horizontal="center"
              paddingTop="16"
              paddingBottom="32"
              paddingLeft="12"
            >
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
            </RevealFx>
          )}
          <RevealFx translateY="4" fillWidth horizontal="center" paddingBottom="16">
            <Heading wrap="balance" variant="display-strong-l">
              {home.headline}
            </Heading>
          </RevealFx>
          <RevealFx translateY="8" delay={0.2} fillWidth horizontal="center" paddingBottom="32">
            <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
              {home.subline}
            </Text>
          </RevealFx>
          {home.stats && home.stats.length > 0 && (
            <RevealFx translateY="8" delay={0.3} fillWidth horizontal="center" paddingBottom="24">
              <Row gap="12" horizontal="center" wrap>
                {home.stats.map((stat) => (
                  <Row
                    key={stat.label}
                    vertical="center"
                    gap="8"
                    paddingX="16"
                    paddingY="8"
                    radius="m"
                    style={{
                      boxShadow: "var(--glow-border)",
                      background: "var(--brand-alpha-weak)",
                    }}
                  >
                    <Text
                      style={{ fontFamily: "var(--font-code)", fontWeight: 700 }}
                      onBackground="brand-weak"
                      variant="body-strong-m"
                    >
                      {stat.value}
                    </Text>
                    <Text onBackground="neutral-weak" variant="label-default-s">
                      {stat.label}
                    </Text>
                  </Row>
                ))}
              </Row>
            </RevealFx>
          )}
          <RevealFx paddingTop="12" delay={0.4} horizontal="center" paddingLeft="12">
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
          </RevealFx>
          <RevealFx translateY="12" delay={0.5} fillWidth horizontal="center" paddingTop="32">
            <LazyVideo
              data-testid="home-video"
              src="/videohome.mp4"
              poster="/images/videohome-poster.webp"
              width={1280}
              height={720}
              label="Play showreel"
              watermark
            />
          </RevealFx>
        </Column>
      </Column>
      <RevealFx translateY="16" delay={0.6}>
        <Projects range={[1, 1]} hideProtected={!isProtectedPath("/")} />
      </RevealFx>
      {routes["/blog"] && (
        <Column fillWidth gap="24" marginBottom="l">
          <Row fillWidth paddingRight="64">
            <NodeDivider />
          </Row>
          <Row fillWidth gap="24" marginTop="40" s={{ direction: "column" }}>
            <Row flex={1} paddingLeft="l" paddingTop="24">
              <Heading as="h2" variant="display-strong-xs" wrap="balance">
                Latest from the blog
              </Heading>
            </Row>
            <Row flex={3} paddingX="20">
              <Posts range={[1, 2]} columns="2" hideProtected={!isProtectedPath("/")} />
            </Row>
          </Row>
          <Row fillWidth paddingLeft="64" horizontal="end">
            <NodeDivider />
          </Row>
        </Column>
      )}
      <RevealFx translateY="16" delay={0.6}>
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
      </RevealFx>
      <RevealFx translateY="16" delay={0.6} fillWidth>
        <CallToAction />
      </RevealFx>
      <Mailchimp />
    </Column>
  );
}

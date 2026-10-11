import { about, person } from "@/resources";
import { Button, Column, Heading, Row, Text } from "@once-ui-system/core";

// Closing conversion block. Manual §3.2 reserves solid Cobalto Eléctrico for the
// one thing the eye should find first — the CTA — so this holds the only primary
// button on the page, and the accent is spent here rather than on decoration.
export const CallToAction = () => {
  if (!about.calendar.display) return null;

  return (
    <Column
      fillWidth
      horizontal="center"
      align="center"
      gap="16"
      paddingX="l"
      paddingY="xl"
      marginBottom="m"
      radius="l"
      background="surface"
      style={{ boxShadow: "var(--glow-border)" }}
    >
      <Heading wrap="balance" variant="display-strong-xs">
        Let's build the growth system your company doesn't have yet.
      </Heading>
      <Text
        wrap="balance"
        variant="body-default-l"
        onBackground="neutral-weak"
        marginBottom="8"
        style={{ maxWidth: "34rem" }}
      >
        30 minutes, no deck. Tell me where the funnel leaks and I'll tell you what I'd automate
        first.
      </Text>
      <Row gap="12" wrap horizontal="center">
        <Button href={about.calendar.link} variant="primary" size="l" prefixIcon="calendar">
          Schedule a call
        </Button>
        <Button href={`mailto:${person.email}`} variant="secondary" size="l" prefixIcon="email">
          Send an email
        </Button>
      </Row>
    </Column>
  );
};

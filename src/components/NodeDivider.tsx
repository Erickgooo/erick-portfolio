import { Line, Row } from "@once-ui-system/core";

interface NodeDividerProps {
  maxWidth?: number;
}

// A rule with a small node at its midpoint, between the body of a case study
// or a post and the list under it. The node is drawn in the secondary text
// colour: Cobalt is kept for the call to action and the film's progress bar.
export function NodeDivider({ maxWidth = 48 }: NodeDividerProps) {
  return (
    <Row fitWidth position="relative">
      <Line maxWidth={maxWidth} />
      <Row
        position="absolute"
        style={{
          left: "50%",
          top: "50%",
          width: "5px",
          height: "5px",
          background: "var(--neutral-on-background-weak)",
          transform: "translate(-50%, -50%) rotate(45deg)",
        }}
      />
    </Row>
  );
}

import { expect, test } from "@playwright/test";
import { scrambleFrame } from "@/components/motion/decode";

const seeded = (seed = 1) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

test("progress 1 returns the exact value", () => {
  expect(scrambleFrame("$3.45", 1, seeded())).toBe("$3.45");
  expect(scrambleFrame("338K+", 1, seeded())).toBe("338K+");
});

test("keeps length and every non-alphanumeric character in place", () => {
  const out = scrambleFrame("$3.45", 0, seeded());
  expect(out).toHaveLength(5);
  expect(out[0]).toBe("$");
  expect(out[2]).toBe(".");
});

test("digits scramble to digits and letters to uppercase letters", () => {
  const out = scrambleFrame("92x", 0, seeded(7));
  expect(out[0]).toMatch(/\d/);
  expect(out[1]).toMatch(/\d/);
  expect(out[2]).toMatch(/[A-Z]/);
});

test("resolves left to right", () => {
  const out = scrambleFrame("12345", 0.6, () => 0.99);
  expect(out.slice(0, 3)).toBe("123");
});

test("progress outside 0..1 is clamped", () => {
  expect(scrambleFrame("42", 5, seeded())).toBe("42");
  expect(scrambleFrame("42", -1, seeded())).toHaveLength(2);
});

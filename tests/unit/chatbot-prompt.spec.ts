import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildSystemPrompt } from "@/app/api/chatbot/prompt";
import { expect, test } from "@playwright/test";

// ErickBot's system prompt is built from the site's data (bio, experience,
// studies, certifications, skills, links, featured project). This locks its
// text, so reshaping the data cannot silently drop or change what the bot
// knows. Whitespace is compared collapsed. To accept a deliberate change of
// content, run once with UPDATE_PROMPT=1 and review the diff of the .txt.
const EXPECTED = path.join(__dirname, "chatbot-prompt.expected.txt");
const collapse = (text: string) => text.replace(/\s+/g, " ").trim();

test("the chatbot's system prompt carries the same facts", () => {
  const prompt = buildSystemPrompt();
  if (process.env.UPDATE_PROMPT) writeFileSync(EXPECTED, prompt);
  expect(collapse(prompt)).toBe(collapse(readFileSync(EXPECTED, "utf8")));
});

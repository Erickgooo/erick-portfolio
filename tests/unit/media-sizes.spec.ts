import { readFileSync, writeFileSync } from "node:fs";
import { getFanCards } from "@/components/workbench/data";
import { getGalleryBench } from "@/components/workbench/gallery/data";
import { expect, test } from "@playwright/test";

// The box every home card and gallery piece reserves before its file arrives. A
// changed size moves the layout, so this pins them as published. To regenerate on
// purpose: UPDATE_SIZES=1 npx playwright test --project=unit media-sizes.
const EXPECTED = "tests/unit/media-sizes.expected.json";

function publishedSizes() {
  const covers = getFanCards({ hideProtected: false }).map((c) => [
    c.cover.src,
    c.cover.w,
    c.cover.h,
  ]);
  const slides = getGalleryBench({ hideProtected: false }).pieces.flatMap((piece) => {
    if (piece.kind === "video") return [];
    const list = piece.kind === "deck" ? piece.slides : [piece.slide];
    return list.map((s) => [s.src, s.w, s.h]);
  });
  return { covers, slides };
}

test("cards and gallery pieces reserve the published sizes", () => {
  const actual = publishedSizes();
  if (process.env.UPDATE_SIZES) writeFileSync(EXPECTED, `${JSON.stringify(actual, null, 1)}\n`);
  expect(actual).toEqual(JSON.parse(readFileSync(EXPECTED, "utf8")));
});

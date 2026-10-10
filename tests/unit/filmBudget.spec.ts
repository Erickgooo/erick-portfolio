import { statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const megabytes = (file: string) => statSync(path.join("public", "video", file)).size / 1_000_000;

// The film cannot be scrubbed until all of it has downloaded, and the page no
// longer has an intro to cover that wait: the poster stays until then. On a
// phone the file should arrive in about five seconds, which is about 5 MB on an
// ordinary 4G connection. Re-encode with scripts/media/encode-film.sh.
test("the phone film stays under 5 MB", () => {
  expect(megabytes("home-film-m.mp4")).toBeLessThan(5);
});

test("the desktop film stays under 13 MB", () => {
  expect(megabytes("home-film.mp4")).toBeLessThan(13);
});

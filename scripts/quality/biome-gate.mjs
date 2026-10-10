// Usage: node scripts/quality/biome-gate.mjs [baseRef=HEAD]
// Fails if any added/modified file under src/ has MORE Biome diagnostics than
// its version at baseRef (new files: must have zero). Errors are caught by the
// full `biome check src`; this guards "no new warnings in touched files".
//
// Note: `biome lint --stdin-file-path=<path>` does not print per-rule
// diagnostics for warning-level rules in this Biome version (1.9.4) — it only
// ever reports a generic "contents aren't fixed" message, which makes counting
// impossible. Diagnostics ARE printed normally when linting a real file path,
// so both the "now" and "before" contents are written to a temporary sibling
// file under src/ and linted by path instead of via stdin.
//
// Counting: uses `biome lint <file> --reporter=json` and counts every entry
// in the JSON `diagnostics` array (any category, any severity). A previous
// version matched the human-readable output against /lint\/[a-zA-Z]+\/[a-zA-Z]+/g,
// which never matches category names containing digits (e.g. `lint/a11y/*`)
// or non-`lint/*` categories (e.g. `suppressions/unused`) — silently letting
// those diagnostics through uncounted.
import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const base = process.argv[2] ?? "HEAD";
const BIOME = path.join("node_modules", "@biomejs", "biome", "bin", "biome");

const changed = execFileSync("git", ["diff", "--name-only", "--diff-filter=AM", base, "--", "src"], { encoding: "utf8" })
  .concat(execFileSync("git", ["ls-files", "--others", "--exclude-standard", "--", "src"], { encoding: "utf8" }))
  .split(/\r?\n/)
  .filter((f) => /\.(tsx?|jsx?|json)$/.test(f));

const scratch = mkdtempSync(path.join(tmpdir(), "biome-gate-"));

function count(content, file) {
  const tmpFile = path.join(scratch, `${randomBytes(4).toString("hex")}-${path.basename(file)}`);
  writeFileSync(tmpFile, content);
  try {
    // Biome's JSON embeds the source file in every diagnostic, so a file with
    // many warnings (content.tsx) easily exceeds spawnSync's 1 MB default.
    const r = spawnSync(process.execPath, [BIOME, "lint", tmpFile, "--reporter=json"], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    });
    const json = JSON.parse(r.stdout ?? "");
    return json.summary ? json.summary.errors + json.summary.warnings : (json.diagnostics?.length ?? 0);
  } finally {
    rmSync(tmpFile, { force: true });
  }
}

let failed = false;
for (const file of [...new Set(changed)]) {
  const now = count(readFileSync(file, "utf8"), file);
  let before = 0;
  try {
    before = count(execFileSync("git", ["show", `${base}:${file}`], { encoding: "utf8" }), file);
  } catch {
    before = 0; // new file
  }
  if (now > before) {
    failed = true;
    console.error(`NEW WARNINGS ${file}: ${before} -> ${now}`);
  }
}
rmSync(scratch, { recursive: true, force: true });
if (failed) process.exit(1);
console.log(`biome-gate OK (${changed.length} files checked against ${base})`);

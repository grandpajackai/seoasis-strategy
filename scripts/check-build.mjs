import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const root = path.resolve("out"),
  base = "/seoasis-strategy";
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const refs = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)]
  .map((m) => m[1].replaceAll("&amp;", "&"))
  .filter((s) => !/^https?:|^data:|^mailto:|^tel:/.test(s));
for (const ref of refs) {
  const pathname = ref.split("?")[0].replace(base, "");
  const target = path.join(root, pathname);
  assert.ok(fs.existsSync(target), `Missing built asset: ${ref}`);
}
const docs = [
  "README.md",
  "RESEARCH.md",
  "SOURCES.md",
  "ASSUMPTIONS.md",
  "90-DAY-PLAN.md",
  "INTERVIEW-WALKTHROUGH.md",
  "JOB-REQUIREMENTS-MATRIX.md",
  "OPPORTUNITY-BACKLOG.md",
  "QA-REPORT.md",
  "AI-ASSISTANT.md",
];
for (const d of docs)
  assert.ok(fs.existsSync(path.join(root, d)), `Missing exported doc ${d}`);
assert.ok(html.includes("noindex"), "Interview artifact noindex metadata");
assert.ok(
  fs.existsSync(path.join(root, ".nojekyll")),
  "GitHub Pages .nojekyll",
);
console.log(
  `PASS: ${refs.length} HTML asset/link references, ${docs.length} exported documents, noindex and .nojekyll.`,
);

import fs from "node:fs";
import assert from "node:assert/strict";
const read = (f) => JSON.parse(fs.readFileSync(`data/${f}.json`, "utf8"));
const required = [
  "company",
  "job-requirements",
  "technical",
  "pages",
  "onpage",
  "keywords",
  "collections",
  "architecture",
  "schema",
  "aeo",
  "content",
  "authority",
  "community",
  "shopping",
  "cro",
  "competitors",
  "measurement",
  "opportunities",
  "roadmap",
  "strategy",
  "sources",
  "research-bundle",
];
const allowed = new Set([
  "OBSERVED",
  "INFERRED",
  "OPPORTUNITY",
  "REQUIRES INTERNAL DATA",
]);
const sources = read("sources"),
  ids = new Set(sources.map((s) => s.id));
assert.equal(ids.size, sources.length, "Source IDs must be unique");
for (const s of sources) {
  assert.ok(s.url?.startsWith("http"), `Source URL: ${s.id}`);
  assert.ok(s.title && s.accessedAt && s.note, `Source provenance: ${s.id}`);
}
let classified = 0,
  refs = 0;
function walk(v, where) {
  if (Array.isArray(v)) {
    v.forEach((x, i) => walk(x, `${where}[${i}]`));
    return;
  }
  if (!v || typeof v !== "object") return;
  if (v.classification) {
    assert.ok(
      allowed.has(v.classification),
      `${where}: unknown classification ${v.classification}`,
    );
    classified++;
  }
  for (const key of ["sourceIds", "source"]) {
    if (
      v[key] &&
      !(
        key === "source" &&
        (where.includes(".graph.edges") ||
          where.includes(".graph.outOfSampleEdges"))
      )
    ) {
      const values = Array.isArray(v[key]) ? v[key] : [v[key]];
      for (const id of values) {
        if (typeof id === "string" && !id.startsWith("http")) {
          assert.ok(ids.has(id), `${where}.${key}: missing source ${id}`);
          refs++;
        }
      }
    }
  }
  for (const [k, x] of Object.entries(v)) walk(x, where + "." + k);
}
for (const name of required) {
  assert.ok(fs.existsSync(`data/${name}.json`), "Missing " + name);
  walk(read(name), name);
}
const strategy = read("strategy");
assert.equal(strategy.scores.length, 10, "Ten score categories");
for (const s of strategy.scores) {
  assert.equal(s.criteria.length, 4, `${s.name}: four rubric criteria`);
  assert.equal(
    s.score,
    s.criteria.filter((c) => c.met).length * 25,
    `${s.name}: score arithmetic`,
  );
  assert.ok(s.confidence && s.classification, `${s.name}: score provenance`);
}
const opportunities = read("opportunities");
assert.ok(
  Array.isArray(opportunities) && opportunities.length >= 15,
  "Opportunity backlog",
);
const opportunityIds = new Set(opportunities.map((o) => o.id));
assert.equal(
  opportunityIds.size,
  opportunities.length,
  "Opportunity IDs unique",
);
for (const o of opportunities) {
  for (const k of [
    "title",
    "category",
    "evidence",
    "impact",
    "effort",
    "confidence",
    "priority",
    "status",
    "owner",
    "metric",
    "source",
    "notes",
    "classification",
  ])
    assert.ok(o[k] != null, `${o.id}: missing ${k}`);
  assert.ok(
    o.impact >= 1 && o.impact <= 5 && o.effort >= 1 && o.effort <= 5,
    `${o.id}: impact/effort scales`,
  );
}
const roadmap = read("roadmap");
assert.ok(Array.isArray(roadmap) && roadmap.length >= 9, "Roadmap tasks");
for (const t of roadmap) {
  assert.ok(
    t.task && t.owner && t.dependency && t.metric && t.dueWindow,
    `Incomplete roadmap: ${t.id}`,
  );
}
const bundle = read("research-bundle");
for (const name of required.slice(0, 17))
  assert.ok(bundle[name], `Missing bundled section: ${name}`);
const nav = fs.readFileSync("components/navigation.ts", "utf8");
assert.equal(
  (nav.match(/id:\s*["']/g) || []).length,
  20,
  "Twenty navigation sections",
);
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
];
for (const doc of docs) {
  assert.ok(fs.existsSync(doc), "Missing document " + doc);
  assert.ok(
    fs.readFileSync(doc, "utf8").length > 300,
    "Incomplete document " + doc,
  );
  if (doc !== "README.md")
    assert.ok(fs.existsSync("public/" + doc), "Missing downloadable " + doc);
}
console.log(
  `PASS: ${required.length} datasets; ${sources.length} source records; ${classified} classified records; ${refs} checked references; 10 score rubrics; ${opportunities.length} opportunities; ${roadmap.length} roadmap tasks; 20 navigation entries; ${docs.length} documents.`,
);

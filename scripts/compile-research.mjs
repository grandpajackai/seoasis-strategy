import fs from "node:fs";
import path from "node:path";
const dir = path.resolve("data");
const ignore = new Set([
  "research-bundle.json",
  "sources.json",
  "opportunities.json",
  "roadmap.json",
  "strategy.json",
]);
const bundle = {};
const sourceMap = new Map();
function gather(v) {
  if (Array.isArray(v)) {
    for (const x of v) gather(x);
    return;
  }
  if (!v || typeof v !== "object") return;
  if (
    v.id &&
    v.url &&
    (v.title || v.pageTitle) &&
    (v.accessedAt || v.accessDate || v.dateAccessed || v.accessed)
  ) {
    const s = {
      ...v,
      title: v.title || v.pageTitle,
      accessedAt: v.accessedAt || v.accessDate || v.dateAccessed || v.accessed,
      note: v.note || v.supportingNote || v.evidence || "",
    };
    if (sourceMap.has(s.id) && sourceMap.get(s.id).url !== s.url)
      throw new Error("Source ID collision: " + s.id);
    sourceMap.set(s.id, s);
  }
  for (const x of Object.values(v)) gather(x);
}
for (const f of fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".json") && !ignore.has(f))) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  bundle[f.replace(".json", "")] = data;
  gather(data);
}
for (const f of ["strategy.json", "opportunities.json", "roadmap.json"])
  gather(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
fs.writeFileSync(
  path.join(dir, "research-bundle.json"),
  JSON.stringify(bundle, null, 2) + "\n",
);
const health = fs.existsSync("qa/source-health.json")
  ? JSON.parse(fs.readFileSync("qa/source-health.json", "utf8"))
  : [];
for (const s of sourceMap.values()) {
  const h = health.find((h) => h.url === s.url);
  if (h) {
    s.urlCheck = {
      status: h.status,
      checkedAt: h.checkedAt,
      label:
        h.status === 200
          ? "HTTP 200 verified"
          : h.status === 0
            ? "TLS / connection check inconclusive"
            : `Automated access restricted (HTTP ${h.status})`,
    };
  }
}
const sources = [...sourceMap.values()].sort((a, b) =>
  a.id.localeCompare(b.id),
);
fs.writeFileSync(
  path.join(dir, "sources.json"),
  JSON.stringify(sources, null, 2) + "\n",
);
console.log(
  `Compiled ${Object.keys(bundle).length} research datasets and ${sources.length} source records.`,
);

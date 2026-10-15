import fs from "node:fs";
const read = (n) => JSON.parse(fs.readFileSync("data/" + n + ".json", "utf8"));
const clean = (v) =>
  String(v ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");
const sources = read("sources"),
  jobs = read("job-requirements"),
  ops = read("opportunities");
let md =
  "# Sources and evidence register\n\nResearch snapshot: 14 October 2026 (UTC). Each record preserves the original public URL, title, access date and supporting note. Multiple records can cite the same URL for different workstreams. Public company claims are not independently verified outcomes. Some publishers restrict automated access; the check result is a retrieval limitation, not a claim the URL is dead. Historical Gusto sources are explicitly unavailable.\n\n";
for (const s of sources)
  md += `## ${s.id}\n\n[${s.title}](${s.url})\n\nAccessed: ${s.accessedAt}. ${s.note}\n\n${s.urlCheck ? `URL check: ${s.urlCheck.label}.\n\n` : ""}`;
fs.writeFileSync("SOURCES.md", md);
md =
  "# Job requirements matrix\n\nBased on the publicly accessible employer role description, reviewed 14 October 2026. The historical Gusto posting is unavailable and active hiring is unconfirmed. Requirements are observed; operational interpretations and demonstrations are proposed. This is not a claim that the candidate meets every experience or eligibility criterion.\n\n| Job requirement | Operational meaning | Demonstrated in dashboard | Evidence |\n|---|---|---|---|\n";
for (const r of jobs.requirements)
  md += `| ${clean(r.requirement)} | ${clean(r.operationalMeaning)} | ${clean(r.demonstratedIn)} | [Employer description](https://www.linkedin.com/jobs/view/seo-strategist-us-only-full-time-remote-opportunity-at-seoasis-4476379142) · ${r.confidence} |\n`;
md +=
  "\nThe matrix demonstrates account strategy, monitoring, 90-day revision, keywords, collections, Shopify, content/link partner coordination, titles, metas, schema, QA, Asana-ready task states, reporting, client communication, AI judgment, ownership, process documentation, and a path to fulfillment leadership. Partner scope is a question for Mike. Personal experience and eligibility must be discussed honestly.\n";
fs.writeFileSync("JOB-REQUIREMENTS-MATRIX.md", md);
md =
  "# Full opportunity backlog\n\nAll items are proposals, not existing assignments. Impact and effort use relative 1–5 planning scales. Confidence weights: High .9, Medium .6, Low .3. Default score = Impact × Confidence ÷ Effort. P0–P3 represent dependency/sequence triage and do not change automatically with score weights. Revenue, stock, margin and delivery capacity can change the order.\n\n";
const cv = { High: 0.9, Medium: 0.6, Low: 0.3 };
for (const o of ops) {
  md += `## ${o.id} · ${o.title}\n\n${o.classification} · ${o.confidence} confidence · ${o.priority} · ${o.status}\n\n- Category: ${o.category}\n- URL / scope: ${o.url || "Client account framework"}\n- Evidence: ${o.evidence}\n- Impact: ${o.impact}/5; effort: ${o.effort}/5; default score: ${((o.impact * cv[o.confidence]) / o.effort).toFixed(2)}\n- Proposed owner: ${o.owner}\n- Metric / decision: ${o.metric}\n- Notes / gates: ${o.notes}\n- Sources: ${(Array.isArray(
    o.source,
  )
    ? o.source
    : [o.source]
  )
    .map((id) => {
      const s = sources.find((s) => s.id === id);
      return s ? `[${id}](${s.url})` : id;
    })
    .join(", ")}\n\n`;
}
fs.writeFileSync("OPPORTUNITY-BACKLOG.md", md);
for (const file of [
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
])
  if (fs.existsSync(file)) fs.copyFileSync(file, "public/" + file);
console.log(
  "Generated source register, job matrix, full backlog; packaged ten downloadable documents.",
);

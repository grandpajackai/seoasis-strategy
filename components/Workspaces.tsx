"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Braces,
  Check,
  ChevronDown,
  Download,
  FileText,
  GitBranch,
  Info,
  Layers,
  LockKeyhole,
  Plus,
  Search,
  Settings2,
  ShoppingBag,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import {
  AnyRecord,
  CopyButton,
  Record,
  SourceRefs,
  Tag,
  textOf,
} from "./Research";
function download(name: string, data: any) {
  const b = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(b);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const confidenceValues: AnyRecord = { High: 0.9, Medium: 0.6, Low: 0.3 };
const numeric = (v: any, fallback = 3) =>
  typeof v === "number"
    ? v
    : ({ High: 5, Medium: 3, Low: 1 } as AnyRecord)[v] || Number(v) || fallback;
export function Backlog({
  data,
  sources,
}: {
  data: AnyRecord[];
  sources: AnyRecord[];
}) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("All"),
    [priority, setPriority] = useState("All"),
    [impact, setImpact] = useState("All"),
    [status, setStatus] = useState("All"),
    [confidence, setConfidence] = useState("All"),
    [sort, setSort] = useState("score"),
    [ascending, setAscending] = useState(false),
    [weights, setWeights] = useState({ impact: 1, confidence: 1, effort: 1 }),
    [showSettings, setShowSettings] = useState(false),
    [edits, setEdits] = useState<AnyRecord>({}),
    [selected, setSelected] = useState<string | null>(null),
    [saved, setSaved] = useState(false),
    [evidenceColumns, setEvidenceColumns] = useState(false),
    [exportOpen, setExportOpen] = useState(false);
  useEffect(() => {
    try {
      setEdits(JSON.parse(localStorage.getItem("seoasis-backlog") || "{}"));
      setWeights(
        JSON.parse(
          localStorage.getItem("seoasis-weights") ||
            '{"impact":1,"confidence":1,"effort":1}',
        ),
      );
    } catch {}
  }, []);
  const rows = data.map((r, i) => {
    const id = r.id || `OP-${i + 1}`;
    const imp = numeric(r.impact),
      eff = numeric(r.effort),
      c =
        typeof r.confidence === "number"
          ? r.confidence
          : confidenceValues[r.confidence] || 0.6;
    const score =
      (Math.pow(imp, weights.impact) * Math.pow(c, weights.confidence)) /
      Math.pow(eff, weights.effort);
    return {
      ...r,
      id,
      impact: imp,
      effort: eff,
      score,
      status: "Proposed",
      ...edits[id],
    };
  });
  const filtered = rows
    .filter(
      (r) =>
        (category === "All" || r.category === category) &&
        (priority === "All" || r.priority === priority) &&
        (impact === "All" ||
          (impact === "High"
            ? r.impact >= 4
            : impact === "Medium"
              ? r.impact === 3
              : r.impact <= 2)) &&
        (status === "All" || r.status === status) &&
        (confidence === "All" || r.confidence === confidence) &&
        (
          r.title +
          " " +
          r.opportunity +
          " " +
          r.evidence +
          " " +
          r.notes +
          " " +
          r.category
        )
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => {
      const x =
          sort === "confidence"
            ? confidenceValues[a.confidence] || 0
            : (a as AnyRecord)[sort],
        y =
          sort === "confidence"
            ? confidenceValues[b.confidence] || 0
            : (b as AnyRecord)[sort];
      return (
        (typeof x === "number"
          ? x - y
          : String(x || "").localeCompare(String(y || ""))) *
        (ascending ? 1 : -1)
      );
    });
  const update = (id: string, key: string, value: string) => {
    const next = { ...edits, [id]: { ...edits[id], [key]: value } };
    setEdits(next);
    localStorage.setItem("seoasis-backlog", JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const sortBy = (s: string) => {
    if (sort === s) setAscending(!ascending);
    else {
      setSort(s);
      setAscending(s !== "score");
    }
  };
  const reset = () => {
    setCategory("All");
    setPriority("All");
    setImpact("All");
    setStatus("All");
    setConfidence("All");
    setQuery("");
  };
  const selectedRow = rows.find((r) => r.id === selected);
  return (
    <>
      <div className="backlog-summary">
        <div>
          <span className="metric-overline">WORKING QUEUE</span>
          <strong>
            {rows.length}
            <small> opportunities</small>
          </strong>
          <p>Proposed tasks. Evidence and dependencies come first.</p>
        </div>
        <div>
          <span className="metric-overline">PRIORITIZATION MODEL</span>
          <strong className="formula">Impact × Confidence ÷ Effort</strong>
          <p>
            Impact / effort: 1–5 · Confidence: high .9 / medium .6 / low .3 · P
            tiers sequence dependencies
          </p>
        </div>
        <button
          className="button subtle"
          aria-expanded={showSettings}
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings2 size={15} />
          Configure weights
        </button>
      </div>
      {showSettings && (
        <section className="weight-panel">
          <div>
            <h3>Make the tradeoffs explicit.</h3>
            <p>
              Weights are exponents: Impact<sup>w</sup> × Confidence<sup>w</sup>{" "}
              ÷ Effort<sup>w</sup>. Default 1 restores the requested formula.
              P0–P3 are dependency-based triage labels; changing the formula
              reorders the queue without silently changing those labels.
            </p>
          </div>
          <div className="weight-controls">
            {(["impact", "confidence", "effort"] as const).map((k) => (
              <label key={k}>
                {k}
                <strong>{weights[k].toFixed(1)}</strong>
                <input
                  aria-label={`${k} weight`}
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={weights[k]}
                  onChange={(e) => {
                    const next = { ...weights, [k]: Number(e.target.value) };
                    setWeights(next);
                    localStorage.setItem(
                      "seoasis-weights",
                      JSON.stringify(next),
                    );
                  }}
                />
              </label>
            ))}
            <button
              className="text-link"
              onClick={() => {
                const next = { impact: 1, confidence: 1, effort: 1 };
                setWeights(next);
                localStorage.setItem("seoasis-weights", JSON.stringify(next));
              }}
            >
              Reset weights
            </button>
          </div>
        </section>
      )}
      <div className="backlog-tools">
        <div className="search-field">
          <Search size={16} />
          <input
            aria-label="Search opportunities"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find an opportunity…"
          />
        </div>
        <button
          className="button subtle evidence-toggle"
          aria-pressed={evidenceColumns}
          onClick={() => setEvidenceColumns(!evidenceColumns)}
        >
          <FileText size={14} />
          {evidenceColumns ? "Hide evidence columns" : "Show evidence columns"}
        </button>
        <button className="button primary" onClick={() => setExportOpen(true)}>
          <Download size={15} />
          Export {filtered.length} items
        </button>
      </div>
      <div className="filter-row">
        {[
          {
            label: "Category",
            value: category,
            fn: setCategory,
            values: [...new Set(data.map((d) => d.category))],
          },
          {
            label: "Priority",
            value: priority,
            fn: setPriority,
            values: ["P0", "P1", "P2", "P3"],
          },
          {
            label: "Impact",
            value: impact,
            fn: setImpact,
            values: ["High", "Medium", "Low"],
          },
          {
            label: "Status",
            value: status,
            fn: setStatus,
            values: [
              "Proposed",
              "Ready",
              "In progress",
              "QA",
              "Done",
              "Blocked",
            ],
          },
          {
            label: "Confidence",
            value: confidence,
            fn: setConfidence,
            values: ["High", "Medium", "Low"],
          },
        ].map((f) => (
          <label key={f.label}>
            <span>{f.label}</span>
            <select
              aria-label={`Filter by ${f.label.toLowerCase()}`}
              value={f.value}
              onChange={(e) => f.fn(e.target.value)}
            >
              <option value="All">All {f.label.toLowerCase()}</option>
              {f.values.map((v: any) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        ))}
        <button className="text-link reset-filters" onClick={reset}>
          Reset filters
        </button>
      </div>
      {exportOpen && (
        <section className="export-panel" aria-label="Backlog export preview">
          <div className="section-label">
            <h2>Review your backlog export</h2>
            <button
              className="icon-button"
              aria-label="Close export preview"
              onClick={() => setExportOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          <p>
            {filtered.length} records, including evidence, sources, notes, and
            your local owner / status edits.
          </p>
          <textarea
            aria-label="Backlog export JSON"
            readOnly
            value={JSON.stringify(filtered, null, 2)}
          />
          <div className="form-actions">
            <button
              className="button primary"
              onClick={() =>
                download("seoasis-opportunity-backlog.json", filtered)
              }
            >
              <Download size={14} />
              Download JSON
            </button>
            <CopyButton
              value={JSON.stringify(filtered, null, 2)}
              label="Copy JSON"
            />
            <span>Download or copy the complete review snapshot.</span>
          </div>
        </section>
      )}
      <div className="table-caption">
        <span>
          {filtered.length} of {rows.length} opportunities · Click an
          opportunity for its evidence
        </span>
        <span aria-live="polite">
          {saved ? (
            <>
              <Check size={12} />
              Saved in this browser
            </>
          ) : (
            "Edits stay in this browser"
          )}
        </span>
      </div>
      <div className="table-scroll">
        <table className="backlog-table">
          <thead>
            <tr>
              {[
                { k: "title", t: "Opportunity" },
                { k: "category", t: "Category" },
                { k: "impact", t: "Impact" },
                { k: "effort", t: "Effort" },
                { k: "confidence", t: "Confidence" },
                { k: "score", t: "Score" },
                { k: "priority", t: "Priority" },
                { k: "status", t: "Status" },
                { k: "owner", t: "Owner" },
                ...(evidenceColumns
                  ? [
                      { k: "url", t: "URL" },
                      { k: "evidence", t: "Evidence" },
                      { k: "metric", t: "Metric" },
                      { k: "source", t: "Source" },
                      { k: "notes", t: "Notes" },
                    ]
                  : []),
              ].map((h) => (
                <th
                  key={h.k}
                  aria-sort={
                    sort === h.k
                      ? ascending
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button onClick={() => sortBy(h.k)}>
                    {h.t}
                    {sort === h.k ? (
                      ascending ? (
                        <ArrowUp size={11} />
                      ) : (
                        <ArrowDown size={11} />
                      )
                    ) : (
                      <ChevronDown size={10} />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>
                  <button
                    className="opportunity-name"
                    onClick={() => {
                      setSelected(selected === r.id ? null : r.id);
                      if (selected !== r.id)
                        setTimeout(
                          () =>
                            document
                              .getElementById("opportunity-detail")
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              }),
                          80,
                        );
                    }}
                    aria-expanded={selected === r.id}
                  >
                    <small>{r.id}</small>
                    <strong>{r.title || r.opportunity}</strong>
                    <span>{r.metric}</span>
                  </button>
                </td>
                <td>
                  <span className="category-label">{r.category}</span>
                </td>
                <td>
                  <span
                    className="impact-dots"
                    aria-label={`${r.impact} out of 5`}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <i className={n <= r.impact ? "filled" : ""} key={n} />
                    ))}
                  </span>
                </td>
                <td>
                  {r.effort}
                  <small className="muted"> / 5</small>
                </td>
                <td>
                  <span
                    className={`confidence-dot ${String(r.confidence).toLowerCase()}`}
                  />
                  {r.confidence}
                </td>
                <td>
                  <strong className="score-number">{r.score.toFixed(2)}</strong>
                </td>
                <td>
                  <span
                    className={`priority ${String(r.priority).toLowerCase()}`}
                  >
                    {r.priority}
                  </span>
                </td>
                <td>
                  <select
                    aria-label={`Status for ${r.title || r.opportunity}`}
                    value={r.status}
                    onChange={(e) => update(r.id, "status", e.target.value)}
                  >
                    {[
                      "Proposed",
                      "Ready",
                      "In progress",
                      "QA",
                      "Done",
                      "Blocked",
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    className="owner-input"
                    aria-label={`Owner for ${r.title || r.opportunity}`}
                    value={r.owner || "Strategist"}
                    onChange={(e) => update(r.id, "owner", e.target.value)}
                  />
                </td>
                {evidenceColumns && (
                  <>
                    <td className="evidence-cell">
                      {/^https?:\/\//.test(r.url || "") ? (
                        <a
                          className="inline-link"
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {r.url.replace("https://www.", "")}
                          <ArrowUpRight size={12} />
                        </a>
                      ) : (
                        r.url || "Client account framework"
                      )}
                    </td>
                    <td className="evidence-cell">{r.evidence}</td>
                    <td className="evidence-cell">{r.metric}</td>
                    <td className="evidence-cell">
                      <SourceRefs ids={r.source} sources={sources} />
                    </td>
                    <td className="evidence-cell">{r.notes}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div className="empty-state">
            <Search size={26} />
            <h3>No opportunities match.</h3>
            <p>Try removing a filter or shortening your search.</p>
            <button className="button subtle" onClick={reset}>
              Reset filters
            </button>
          </div>
        )}
      </div>
      {selectedRow && (
        <section
          id="opportunity-detail"
          className="opportunity-detail"
          aria-label="Opportunity details"
        >
          <div className="section-label">
            <h2>{selectedRow.title || selectedRow.opportunity}</h2>
            <button
              className="icon-button"
              aria-label="Close opportunity details"
              onClick={() => setSelected(null)}
            >
              <X size={18} />
            </button>
          </div>
          <Record data={selectedRow} sources={sources} />
        </section>
      )}
    </>
  );
}
export function CollectionLab({
  data,
  sources,
}: {
  data: any;
  sources: AnyRecord[];
}) {
  const [open, setOpen] = useState(false),
    [saved, setSaved] = useState(false),
    [brief, setBrief] = useState<AnyRecord>({
      productCategory: "",
      subcategory: "",
      searchIntent: "Transactional",
      keywordCluster: "",
      existingCollection: "Requires Internal Access",
      productsAvailable: "Requires Internal Access",
      rankingOpportunity: "Requires Internal Access",
      revenuePotential: "Requires Internal Access",
      marginInput: "Requires Internal Access",
      recommendedUrl: "",
      title: "",
      h1: "",
      meta: "",
      introCopy: "",
      supportingContent: "",
      internalLinks: "",
      schema:
        "CollectionPage / ItemList, subject to visible content validation",
      conversionConsiderations: "",
      status: "Draft — needs client validation",
    });
  useEffect(() => {
    try {
      const d = localStorage.getItem("seoasis-collection-brief");
      if (d) setBrief(JSON.parse(d));
    } catch {}
  }, []);
  const fields = [
    "productCategory",
    "subcategory",
    "searchIntent",
    "keywordCluster",
    "existingCollection",
    "rankingOpportunity",
    "revenuePotential",
    "marginInput",
    "productsAvailable",
    "recommendedUrl",
    "title",
    "h1",
    "meta",
    "introCopy",
    "supportingContent",
    "internalLinks",
    "schema",
    "conversionConsiderations",
    "status",
  ];
  return (
    <>
      <div className="client-boundary">
        <span>
          <ShoppingBag size={22} />
        </span>
        <div>
          <h2>Client framework · SEOasis is an agency, not a store.</h2>
          <p>
            Evaluate a client’s collections against catalog depth, distinct
            buyer intent, commercial value, and implementation quality. Example
            briefs in the research are hypothetical.
          </p>
          <Tag type="OPPORTUNITY" />
        </div>
        <button
          className="button primary"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <Plus size={16} />
          {open ? "Close brief" : "Build a collection brief"}
        </button>
      </div>
      <div className="collection-gates">
        {[
          {
            icon: Target,
            title: "Distinct demand",
            text: "A useful buying intent with a clear page owner.",
          },
          {
            icon: ShoppingBag,
            title: "Catalog fit",
            text: "Enough relevant, available products to serve the intent.",
          },
          {
            icon: Layers,
            title: "A real collection",
            text: "Product grid, useful copy, internal links, and conversion path.",
          },
          {
            icon: Check,
            title: "QA + measurement",
            text: "Canonical, metadata, markup, mobile UX, and a baseline.",
          },
        ].map((g) => (
          <div key={g.title}>
            <g.icon size={20} />
            <h3>{g.title}</h3>
            <p>{g.text}</p>
          </div>
        ))}
      </div>
      {open && (
        <form
          className="collection-form"
          onSubmit={(e) => {
            e.preventDefault();
            localStorage.setItem(
              "seoasis-collection-brief",
              JSON.stringify(brief),
            );
            setSaved(true);
            setTimeout(() => setSaved(false), 2200);
          }}
        >
          <div className="section-label">
            <h2>Local client brief</h2>
            <span className="caption">
              Your inputs · no connected client data
            </span>
          </div>
          <div className="brief-fields">
            {fields.map((k) => (
              <label
                className={
                  [
                    "meta",
                    "introCopy",
                    "supportingContent",
                    "internalLinks",
                    "conversionConsiderations",
                  ].includes(k)
                    ? "full"
                    : ""
                }
                key={k}
              >
                <span>{k.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
                {[
                  "meta",
                  "introCopy",
                  "supportingContent",
                  "internalLinks",
                  "conversionConsiderations",
                ].includes(k) ? (
                  <textarea
                    aria-label={k.replace(/([a-z])([A-Z])/g, "$1 $2")}
                    value={brief[k]}
                    onChange={(e) =>
                      setBrief({ ...brief, [k]: e.target.value })
                    }
                  />
                ) : (
                  <input
                    required={k === "productCategory"}
                    aria-label={k.replace(/([a-z])([A-Z])/g, "$1 $2")}
                    value={brief[k]}
                    onChange={(e) =>
                      setBrief({ ...brief, [k]: e.target.value })
                    }
                  />
                )}
              </label>
            ))}
          </div>
          <div className="form-actions">
            <button type="submit" className="button primary">
              <Check size={14} />
              {saved ? "Saved in this browser" : "Save local brief"}
            </button>
            <button
              type="button"
              className="button subtle"
              onClick={() =>
                download("client-collection-brief.json", {
                  ...brief,
                  classification: "OPPORTUNITY",
                  confidence: "Low",
                  evidence:
                    "User-entered working brief. Catalog, commercial and implementation validation required.",
                })
              }
            >
              <Download size={14} />
              Export brief
            </button>
            <span aria-live="polite">
              {saved
                ? "Saved successfully."
                : "No client inputs leave this browser."}
            </span>
          </div>
        </form>
      )}
    </>
  );
}
export function ArchitectureMap({
  data,
  sources,
  go,
}: {
  data: any;
  sources: AnyRecord[];
  go: (s: string) => void;
}) {
  return (
    <section className="architecture-panel">
      <div className="section-label">
        <h2>Discovery map</h2>
        <span className="caption">
          Observed homepage links + sitemap inventory
        </span>
      </div>
      <div className="map-home">
        <a
          href="https://www.seoasis.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitBranch size={20} />
          <span>
            seoasis.io<small>Homepage</small>
          </span>
          <ArrowUpRight size={15} />
        </a>
      </div>
      <div className="architecture-branches">
        <div className="branch proposed">
          <span className="branch-label">PROPOSED REINFORCEMENT</span>
          <h3>Commercial services</h3>
          <p>Discovered in sitemap; broader homepage paths worth testing.</p>
          <a
            href="https://www.seoasis.io/shopify-seo-agency"
            target="_blank"
            rel="noopener noreferrer"
          >
            Shopify SEO agency
            <ArrowUpRight size={12} />
          </a>
          <a
            href="https://www.seoasis.io/ecommerce-seo-specialist"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ecommerce SEO specialist
            <ArrowUpRight size={12} />
          </a>
          <a
            href="https://www.seoasis.io/reddit-seo"
            target="_blank"
            rel="noopener noreferrer"
          >
            Reddit SEO
            <ArrowUpRight size={12} />
          </a>
        </div>
        <div className="branch observed">
          <span className="branch-label">OBSERVED NAVIGATION</span>
          <h3>Results & trust</h3>
          <p>The homepage links to the case study hub.</p>
          <a
            href="https://www.seoasis.io/case-studies"
            target="_blank"
            rel="noopener noreferrer"
          >
            Case studies
            <ArrowUpRight size={12} />
          </a>
          <button onClick={() => go("onpage")}>
            Review page-level proof
            <ArrowRight size={12} />
          </button>
        </div>
        <div className="branch proposed">
          <span className="branch-label">PROPOSED HUB / SPOKE</span>
          <h3>Resources & expertise</h3>
          <p>
            Connect useful resources to the most relevant commercial next step.
          </p>
          <button onClick={() => go("keywords")}>
            Intent ownership map
            <ArrowRight size={12} />
          </button>
          <button onClick={() => go("content")}>
            Content coordination
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
      <div className="map-legend">
        <span>
          <i className="solid-line" />
          Observed link
        </span>
        <span>
          <i className="dashed-line" />
          Proposed relationship
        </span>
        <span>No orphan or crawl-depth claims from this diagram.</span>
      </div>
    </section>
  );
}
export function CompetitorMap({
  data,
  sources,
}: {
  data: any;
  sources: AnyRecord[];
}) {
  const peers: AnyRecord[] = data?.competitors || [];
  const [selected, setSelected] = useState("seoasis");
  const peer = peers.find((p) => p.id === selected) || peers[0];
  const clusters: AnyRecord[][] = Object.values(
    peers.reduce((groups: AnyRecord, p: AnyRecord) => {
      const key = `${p.position?.x || 3}-${p.position?.y || 3}`;
      (groups[key] ||= []).push(p);
      return groups;
    }, {}),
  );
  return (
    <section className="competitor-panel">
      <div className="section-label">
        <h2>Where the public messaging sits</h2>
        <Tag type="INFERRED" />
      </div>
      <div className="positioning-wrap">
        <span className="y-axis">Traditional SEO led → AI / AEO forward</span>
        <div className="positioning-map">
          <span className="quadrant q1">
            BROAD OFFER
            <br />
            AI FORWARD
          </span>
          <span className="quadrant q2">
            ECOMMERCE FOCUS
            <br />
            AI FORWARD
          </span>
          <span className="quadrant q3">
            BROAD OFFER
            <br />
            TRADITIONAL SEO LED
          </span>
          <span className="quadrant q4">
            ECOMMERCE FOCUS
            <br />
            TRADITIONAL SEO LED
          </span>
          {clusters.map((cluster, i) => {
            const x = cluster[0].position?.x || 3,
              y = cluster[0].position?.y || 3;
            return (
              <div
                key={i}
                className="map-cluster"
                style={{
                  left: `${12 + (x - 1) * 18}%`,
                  bottom: `${13 + (y - 1) * 17}%`,
                }}
                aria-label={`Public positioning: ecommerce ${x} of 5, AI messaging ${y} of 5`}
              >
                <div className="map-cluster-labels">
                  {cluster.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p.id)}
                      className={`map-point ${p.isSubject ? "subject" : ""} ${selected === p.id ? "selected" : ""}`}
                      aria-pressed={selected === p.id}
                    >
                      <i />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <span className="x-axis">
          Generalist <ArrowRight size={15} /> Ecommerce specialist
        </span>
      </div>
      <div className="competitor-roster" aria-label="Select a competitor">
        {peers.map((p) => (
          <button
            key={p.id}
            aria-pressed={selected === p.id}
            onClick={() => setSelected(p.id)}
          >
            <span>{p.name}</span>
            <small>
              Ecommerce {p.position?.x}/5 · AI messaging {p.position?.y}/5
            </small>
            <ArrowRight size={14} />
          </button>
        ))}
      </div>
      <p className="map-caution">
        Ordinal editorial placements from sampled service messaging. Agencies
        with the same 1–5 coordinates share a cluster; the research below
        preserves those placements. This is not a quality, performance, or
        visibility ranking.
      </p>
      {peer && (
        <div className="selected-competitor">
          <div>
            <h3>{peer.name}</h3>
            <p>{peer.positioning}</p>
            <SourceRefs ids={peer.sourceIds || peer.source} sources={sources} />
          </div>
          <div>
            <span>Shopify / ecommerce</span>
            <p>{peer.shopifySpecialization}</p>
          </div>
          <div>
            <span>Public AI positioning</span>
            <p>{peer.aeoPositioning}</p>
          </div>
        </div>
      )}
    </section>
  );
}
export function RevenueFunnel({
  data,
  sources,
}: {
  data: any;
  sources: AnyRecord[];
}) {
  const stages = [
    ["Impression", "GSC · Merchant Center"],
    ["Organic click", "GSC · GA4"],
    ["Landing page", "GA4"],
    ["Product / category", "GA4 · Shopify"],
    ["Add to cart", "GA4 · Shopify"],
    ["Checkout", "GA4 · Shopify"],
    ["Purchase", "GA4 · Shopify"],
    ["Revenue", "Shopify · GA4"],
  ];
  return (
    <>
      <div className="revenue-panel">
        <div className="section-label">
          <h2>The ecommerce journey</h2>
          <span className="caption">
            Client framework · no connected metrics
          </span>
        </div>
        <div className="revenue-funnel">
          {stages.map(([title, platform], i) => (
            <div key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <small>{platform}</small>
              <LockKeyhole size={13} />
              {i < 7 && <ArrowRight className="funnel-arrow" size={14} />}
            </div>
          ))}
        </div>
        <div className="revenue-metrics">
          {[
            "CTR",
            "Organic sessions",
            "Engagement",
            "Conversion rate",
            "Revenue / session",
            "Transactions",
            "Organic revenue",
            "New customer revenue",
            "Assisted revenue",
            "Landing-page conversion",
            "Category revenue",
            "Incremental organic revenue",
          ].map((m) => (
            <div key={m}>
              <span>{m}</span>
              <strong>Requires Internal Access</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="revenue-decision">
        <Target size={26} />
        <div>
          <h2>When the revenue data arrives, the order can change.</h2>
          <p>
            A cluster with stronger revenue per session, margin, stock, and
            customer fit may outrank a larger visibility opportunity. Agree on
            attribution and seasonality before calling a change incremental. For
            the agency website, use qualified leads and booked calls as the
            conversion outcome.
          </p>
        </div>
        <Tag type="OPPORTUNITY" />
      </div>
    </>
  );
}
export function AIQueryLab({
  data,
  sources,
}: {
  data: any;
  sources: AnyRecord[];
}) {
  const prompts = [
    "Best Shopify SEO agencies",
    "How do Shopify brands grow organic revenue?",
    "Best ecommerce SEO agencies for 7-figure brands",
    "How should Shopify collection pages be optimized?",
  ];
  const [platform, setPlatform] = useState("ChatGPT"),
    [prompt, setPrompt] = useState(prompts[0]),
    [note, setNote] = useState(""),
    [logs, setLogs] = useState<AnyRecord[]>([]),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      setLogs(JSON.parse(localStorage.getItem("seoasis-ai-log") || "[]"));
    } catch {}
  }, []);
  return (
    <section className="ai-query-panel">
      <div className="section-label">
        <h2>A repeatable AI query lab</h2>
        <Tag type="OPPORTUNITY" />
      </div>
      <div className="platform-chips">
        {[
          "ChatGPT",
          "Google AI Overviews / AI Mode",
          "Perplexity",
          "Claude",
          "Gemini",
        ].map((p) => (
          <button
            className={platform === p ? "selected" : ""}
            key={p}
            onClick={() => setPlatform(p)}
          >
            {p}
            <span>Test manually</span>
          </button>
        ))}
      </div>
      <div className="query-lab-grid">
        <div>
          <p className="eyebrow">SUGGESTED PROMPTS · NOT OBSERVED OUTPUTS</p>
          <div className="prompt-list">
            {prompts.map((p) => (
              <div key={p}>
                <button
                  className={prompt === p ? "selected" : ""}
                  onClick={() => setPrompt(p)}
                >
                  {p}
                </button>
                <CopyButton value={p} label="Copy" />
              </div>
            ))}
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const next = [
              {
                platform,
                prompt,
                note,
                recordedAt: new Date().toISOString(),
                provenance:
                  "User-entered manual note; not independently verified",
              },
              ...logs,
            ];
            setLogs(next);
            localStorage.setItem("seoasis-ai-log", JSON.stringify(next));
            setNote("");
            setSaved(true);
            setTimeout(() => setSaved(false), 2200);
          }}
        >
          <label>
            Working prompt
            <input
              aria-label="Working AI prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
          </label>
          <label>
            Manual observation
            <textarea
              aria-label="Manual AI observation"
              placeholder="Record date, locale, model/version, signed-in state, exact wording, citations, and screenshot reference…"
              value={note}
              required
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <div className="form-actions">
            <button className="button primary" type="submit">
              <Plus size={14} />
              Save manual note
            </button>
            <span aria-live="polite">
              {saved ? "Saved locally." : "Stays in this browser"}
            </span>
          </div>
        </form>
      </div>
      <div className="query-status">
        <Info size={17} />
        <p>
          No AI outputs were tested or scored by this research. A single
          generated answer cannot establish stable visibility. Compare a
          predefined query set with consistent conditions over repeated runs.
        </p>
      </div>
      {logs.length > 0 && (
        <details className="research-group">
          <summary>
            <span>
              Your manual notes<small>{logs.length} unverified entries</small>
            </span>
            <ChevronDown size={16} />
          </summary>
          <div className="research-group-content">
            <button
              className="button subtle"
              onClick={() => download("seoasis-manual-ai-log.json", logs)}
            >
              <Download size={14} />
              Export manual log
            </button>
            {logs.map((l, i) => (
              <Record key={i} data={l} sources={sources} />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
export function MeasurementView({
  data,
  sources,
}: {
  data: any;
  sources: AnyRecord[];
}) {
  const [tab, setTab] = useState("Weekly");
  const systems = [
    ["Google Search Console", "Query/page clicks, impressions, CTR, indexing"],
    ["GA4", "Landing-page funnels, events, attributed revenue"],
    ["Shopify", "Orders, net sales, returns, margin inputs"],
    ["Google Merchant Center", "Feed diagnostics and free-listing performance"],
    ["Ahrefs / Semrush", "SERP and link evidence if licensed"],
    ["PageSpeed Insights", "Lab diagnostics and available CrUX field data"],
    ["Google Ads", "Query / paid insight when strategically relevant"],
    ["AI visibility tools", "Repeatable prompt and citation samples"],
    ["Asana", "Owner, dependency, QA state, delivery dates"],
  ];
  return (
    <>
      <div className="connection-grid">
        {systems.map(([name, metric]) => (
          <article key={name}>
            <span className="system-icon">
              {name === "Shopify" ? (
                <ShoppingBag size={18} />
              ) : name === "Asana" ? (
                <GitBranch size={18} />
              ) : (
                <Layers size={18} />
              )}
            </span>
            <div>
              <h3>{name}</h3>
              <p>{metric}</p>
              <span
                className={
                  name === "PageSpeed Insights"
                    ? "public-status"
                    : "private-status"
                }
              >
                {name === "PageSpeed Insights"
                  ? "Public tool · not measured here"
                  : "Requires Internal Access"}
              </span>
            </div>
          </article>
        ))}
      </div>
      <div className="reporting-tabs" aria-label="Reporting cadence">
        {["Weekly", "Monthly", "90-day"].map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t}
            <span>
              {t === "Weekly"
                ? "Operator delivery"
                : t === "Monthly"
                  ? "Client outcomes"
                  : "Strategic decisions"}
            </span>
          </button>
        ))}
      </div>
      <div className="cadence-panel" aria-live="polite">
        <div>
          <span className="metric-overline">
            {tab === "Weekly"
              ? "LEADING INDICATORS"
              : tab === "Monthly"
                ? "OUTCOMES + DIAGNOSTICS"
                : "LAGGING OUTCOMES + LEARNING"}
          </span>
          <h2>
            {tab === "Weekly"
              ? "What shipped, what passed QA, what needs a decision."
              : tab === "Monthly"
                ? "What changed in the business — and why."
                : "Which hypotheses earned the next quarter’s capacity."}
          </h2>
          <p>
            {tab === "Weekly"
              ? "Track releases, collection coverage, QA completion, indexation checks, dependencies, and blocked work. Friday update: progress, evidence, next actions, owner, and risk."
              : tab === "Monthly"
                ? "Review nonbrand demand, landing-page engagement, collection conversion, net revenue, and margin context. Explain seasonality, promotions, attribution changes, and uncertainty."
                : "Compare the original baseline, cohort outcomes, commercial economics, and capacity. Keep, expand, revise, or stop each major workstream; document the new plan."}
          </p>
        </div>
        <span className="cadence-lock">
          <LockKeyhole size={18} />
          Requires Internal Access
          <small>
            {tab === "Weekly"
              ? "Asana + GSC"
              : tab === "Monthly"
                ? "GSC + GA4 + Shopify"
                : "Combined account baseline + outcomes"}
          </small>
        </span>
      </div>
    </>
  );
}

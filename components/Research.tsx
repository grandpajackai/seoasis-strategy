"use client";
import { useState } from "react";
import { ArrowUpRight, ChevronDown, Check, Copy } from "lucide-react";
export type AnyRecord = Record<string, any>;
export const human = (s: string) =>
  s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
export const textOf = (v: any): string =>
  typeof v === "string"
    ? v
    : typeof v === "number"
      ? String(v)
      : v == null
        ? ""
        : Array.isArray(v)
          ? v.map(textOf).filter(Boolean).join(" · ")
          : textOf(
              v.title ||
                v.name ||
                v.label ||
                v.note ||
                v.evidence ||
                v.description ||
                v.metric ||
                v.summary ||
                "",
            );
export function Tag({ type }: { type?: string }) {
  const label = type || "OPPORTUNITY";
  const cls =
    label === "OBSERVED"
      ? "observed"
      : label === "INFERRED"
        ? "inferred"
        : label.includes("REQUIRES")
          ? "requires"
          : "opportunity";
  return (
    <span className={`tag ${cls}`}>
      <i />
      {label === "REQUIRES INTERNAL DATA" ? "REQUIRES INTERNAL DATA" : label}
    </span>
  );
}
export function SourceRefs({
  ids,
  sources,
}: {
  ids: any;
  sources: AnyRecord[];
}) {
  const arr = Array.isArray(ids) ? ids : ids ? [ids] : [];
  return (
    <span className="source-refs">
      {arr.map((id: any, i: number) => {
        const src =
          typeof id === "object" ? id : sources.find((s) => s.id === id);
        return src?.url ? (
          <a
            key={i}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            title={src.title || src.pageTitle}
            aria-label={`Source ${src.id || "reference"}: ${src.title || src.pageTitle}`}
          >
            {arr.length > 1 ? `Source ${i + 1}` : "Source"}
            <ArrowUpRight size={10} />
          </a>
        ) : typeof id === "string" && id.startsWith("http") ? (
          <a key={i} href={id} target="_blank" rel="noopener noreferrer">
            Source
            <ArrowUpRight size={10} />
          </a>
        ) : null;
      })}
    </span>
  );
}
const skip = new Set([
  "source",
  "sources",
  "sourceIds",
  "sourceUrls",
  "classification",
  "confidence",
  "id",
  "updatedAt",
  "accessedAt",
  "dateAccessed",
  "metadata",
  "sourceType",
]);
const titleKeys = [
  "title",
  "name",
  "label",
  "issue",
  "requirement",
  "jobRequirement",
  "opportunity",
  "task",
  "pillar",
  "signal",
  "cluster",
  "keyword",
  "metric",
  "platform",
  "type",
  "step",
  "criterion",
  "check",
  "query",
  "productCategory",
  "field",
  "dimension",
];
function EntryValue({
  v,
  k,
  sources,
  depth = 0,
}: {
  v: any;
  k: string;
  sources: AnyRecord[];
  depth?: number;
}) {
  if (v == null || v === "") return null;
  if (typeof v === "boolean") return <span>{v ? "Yes" : "No"}</span>;
  if (typeof v === "string" || typeof v === "number") {
    const t = String(v);
    return /^https?:\/\//.test(t) ? (
      <a
        className="inline-link"
        href={t}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t.replace("https://www.", "").replace("https://", "")}
        <ArrowUpRight size={12} />
      </a>
    ) : (
      <span>{t}</span>
    );
  }
  if (Array.isArray(v) && v.every((x) => typeof x !== "object"))
    return (
      <ul className="compact-list">
        {v.map((x, i) => (
          <li key={i}>
            <EntryValue v={x} k={k} sources={sources} />
          </li>
        ))}
      </ul>
    );
  if (depth > 3)
    return <p>{textOf(v) || "See research download for complete detail."}</p>;
  return (
    <div className="nested-records">
      {(Array.isArray(v) ? v : [v]).map((x, i) => (
        <Record
          key={i}
          data={typeof x === "object" ? x : { value: x }}
          sources={sources}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
export function Record({
  data,
  sources,
  depth = 0,
}: {
  data: AnyRecord;
  sources: AnyRecord[];
  depth?: number;
}) {
  const tk = titleKeys.find((k) => typeof data[k] === "string");
  const title = tk ? data[tk] : "";
  const pairs = Object.entries(data).filter(
    ([k, v]) => !skip.has(k) && k !== tk && v != null && v !== "",
  );
  return (
    <article className={`research-record depth-${depth}`}>
      {title && <h4>{title}</h4>}
      {(data.classification || data.confidence) && (
        <div className="record-meta">
          {data.classification && <Tag type={data.classification} />}
          {data.confidence && (
            <span className="confidence">{data.confidence} confidence</span>
          )}
        </div>
      )}
      <dl>
        {pairs.map(([k, v]) => (
          <div key={k} className={typeof v === "object" ? "wide-field" : ""}>
            <dt>{human(k)}</dt>
            <dd>
              <EntryValue v={v} k={k} sources={sources} depth={depth} />
            </dd>
          </div>
        ))}
      </dl>
      <SourceRefs ids={data.sourceIds || data.source} sources={sources} />
    </article>
  );
}
export function ResearchLibrary({
  data,
  sources,
  preferred = [],
}: {
  data: any;
  sources: AnyRecord[];
  preferred?: string[];
}) {
  if (!data)
    return <div className="empty-state">Research compilation is pending.</div>;
  const entries = Array.isArray(data)
    ? [["Findings", data]]
    : Object.entries(data).filter(
        ([k, v]) =>
          !(k === "methodology" && data.pillars) &&
          !skip.has(k) &&
          ![
            "title",
            "subtitle",
            "description",
            "scope",
            "limitations",
            "notes",
            "evidence",
          ].includes(k) &&
          typeof v === "object",
      );
  entries.sort((a, b) => {
    const i = preferred.indexOf(a[0] as string),
      j = preferred.indexOf(b[0] as string);
    return (i < 0 ? 99 : i) - (j < 0 ? 99 : j);
  });
  return (
    <div className="research-library">
      {entries.map(([k, v], index) => {
        const values = Array.isArray(v) ? v : [v];
        return (
          <details
            className="research-group"
            key={String(k)}
            open={index === 0}
          >
            <summary>
              <span>
                {human(String(k))}
                <small>
                  {Array.isArray(v) ? `${v.length} records` : "Framework"}
                </small>
              </span>
              <ChevronDown size={18} />
            </summary>
            <div className="research-group-content">
              {values.map((r, i) =>
                typeof r === "object" ? (
                  <Record key={i} data={r} sources={sources} />
                ) : (
                  <p key={i}>{String(r)}</p>
                ),
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false),
    [failed, setFailed] = useState(false);
  return (
    <button
      className="button subtle"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          setFailed(true);
        }
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {failed ? "Select and copy manually" : copied ? "Copied" : label}
    </button>
  );
}

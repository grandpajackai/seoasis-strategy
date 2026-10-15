import research from "../data/research-bundle.json";
import strategy from "../data/strategy.json";
import opportunities from "../data/opportunities.json";
import roadmap from "../data/roadmap.json";
import sourceLedger from "../data/sources.json";

/** Source links always come from the reviewed ledger, never from model output. */
export type AssistantSource = {
  id: string;
  title: string;
  url: string;
  accessedAt: string;
  note: string;
};

export type EvidenceCard = {
  id: string;
  title: string;
  section: string;
  classification:
    | "OBSERVED"
    | "INFERRED"
    | "OPPORTUNITY"
    | "REQUIRES INTERNAL DATA";
  confidence: "High" | "Medium" | "Low";
  content: string;
  sources: AssistantSource[];
};

type RecordValue = Record<string, unknown>;
type IndexedCard = EvidenceCard & {
  terms: Set<string>;
  titleTerms: Set<string>;
  searchable: string;
  group: string;
};

const sourcesById = new Map<string, AssistantSource>(
  sourceLedger.map((source) => [
    source.id,
    {
      id: source.id,
      title: source.title,
      url: source.url,
      accessedAt: source.accessedAt,
      note: source.note,
    },
  ]),
);
const sourcesByUrl = new Map<string, AssistantSource>();
for (const source of sourcesById.values()) {
  if (!sourcesByUrl.has(source.url)) sourcesByUrl.set(source.url, source);
}

const sectionAliases: Record<string, string> = {
  company: "methodology",
  "job-requirements": "interview",
  pages: "technical",
  strategy: "overview",
};

const sectionNames: Record<string, string> = {
  methodology: "SEOasis methodology",
  technical: "Technical SEO",
  keywords: "Search & keyword strategy",
  collections: "Shopify collection pages",
  onpage: "On-page SEO",
  architecture: "Architecture & internal links",
  schema: "Schema & structured data",
  aeo: "AEO & AI visibility",
  content: "Content coordination",
  authority: "Authority & digital PR",
  community: "Reddit & community",
  shopping: "Organic Google Shopping",
  cro: "CRO & revenue alignment",
  competitors: "Competitive landscape",
  measurement: "Measurement framework",
  roadmap: "90-day strategy",
  backlog: "Opportunity backlog",
  overview: "Executive overview",
  interview: "Interview notes & job requirements",
};

/** Omit raw HTML, source inventories and graph/crawl payloads from prompts. */
const omittedKeys = new Set([
  "sources",
  "source",
  "sourceIds",
  "sourceUrls",
  "urlCheck",
  "metadata",
  "graph",
  "inventory",
  "headings",
  "internalLinks",
  "externalLinks",
  "images",
  "html",
  "rawHtml",
  "text",
  "body",
  "jsonLd",
  "scripts",
  "position",
  "positioningMap",
  "exampleBriefs",
  "clientAuditTemplate",
  "internalDataInputs",
  "methodology",
  "topLevelTypes",
]);
const recordSignals = [
  "evidence",
  "classification",
  "issue",
  "requirement",
  "task",
  "pillar",
  "cluster",
  "recommendedAction",
  "observedTypes",
  "metric",
  "finding",
];
const titleKeys = [
  "title",
  "issue",
  "task",
  "pillar",
  "requirement",
  "cluster",
  "name",
  "family",
  "field",
  "label",
  "stage",
  "question",
];
const preferredContentKeys = [
  "evidence",
  "summary",
  "description",
  "scope",
  "whatSeoasisSays",
  "finding",
  "detail",
  "role",
  "operationalMeaning",
  "operationalClassification",
  "demonstratedIn",
  "publiclyObservable",
  "currentTitle",
  "currentMeta",
  "h1",
  "canonical",
  "robotsMeta",
  "status",
  "observedTypes",
  "validationStatus",
  "action",
  "recommendedAction",
  "operatorAction",
  "businessImplication",
  "implication",
  "whyItMatters",
  "why",
  "decision",
  "decisionInfluenced",
  "platform",
  "metric",
  "howMeasured",
  "requiresInternalAccess",
  "value",
  "priority",
  "owner",
  "dueWindow",
  "dependency",
  "acceptanceCriteria",
  "acceptance",
  "steps",
  "rule",
  "question",
  "instruction",
  "guardrail",
  "hypothesis",
  "test",
  "interpretation",
  "resultCaveat",
  "validation",
  "before",
  "after",
  "testPurpose",
  "measure",
  "beforeAccess",
  "afterAccess",
  "guardrails",
  "limitations",
  "keywords",
  "searchIntent",
  "currentCoverage",
  "mappedPage",
  "competitiveDifficulty",
  "positioning",
  "services",
  "contentFocus",
  "caseStudyEvidence",
  "aeoPositioning",
  "shopifySpecialization",
  "authoritySignals",
  "differentiation",
  "status",
  "score",
  "criteria",
  "note",
  "notes",
  "actualOutput",
  "visibility",
  "focus",
];

function isRecord(value: unknown): value is RecordValue {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function clean(value: string, limit = 700): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:nbsp|amp|lt|gt|quot);/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function humanize(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ");
}

function valueText(value: unknown, depth = 0): string {
  if (typeof value === "string") return clean(value);
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (depth > 2 || value == null) return "";
  if (Array.isArray(value))
    return value
      .slice(0, 12)
      .map((item) => valueText(item, depth + 1))
      .filter(Boolean)
      .join("; ");
  if (isRecord(value)) {
    return Object.entries(value)
      .filter(([key]) => !omittedKeys.has(key) && key !== "id")
      .slice(0, 10)
      .map(([key, item]) => `${humanize(key)}: ${valueText(item, depth + 1)}`)
      .join("; ");
  }
  return "";
}

function getSources(
  node: RecordValue,
  inherited: AssistantSource[],
): AssistantSource[] {
  const found: AssistantSource[] = [];
  const visit = (value: unknown) => {
    if (typeof value === "string") {
      const source = sourcesById.get(value) || sourcesByUrl.get(value);
      if (source) found.push(source);
    } else if (Array.isArray(value)) value.forEach(visit);
    else if (isRecord(value)) {
      visit(value.id);
      if (!value.id) visit(value.url);
    }
  };
  visit(node.source);
  visit(node.sourceIds);
  visit(node.primarySource);
  // Embedded source objects do not enter the knowledge base as evidence records.
  return [
    ...new Map(
      (found.length ? found : inherited).map((source) => [source.id, source]),
    ).values(),
  ].slice(0, 6);
}

function classification(
  value: unknown,
  fallback: EvidenceCard["classification"],
): EvidenceCard["classification"] {
  return value === "OBSERVED" ||
    value === "INFERRED" ||
    value === "OPPORTUNITY" ||
    value === "REQUIRES INTERNAL DATA"
    ? value
    : fallback;
}

const stopWords = new Set(
  "a an the and or of to in on for from with by as at be is are was were it its this that these those i me my we us our you your they their them about can could should would will do does did have has had how what which who why when where please tell explain give show help want know more any all some into based use using discuss data source sources connected business seoasis seo oasis also than then just really most very there here".split(
    " ",
  ),
);

function stem(word: string): string {
  if (word.length > 5 && word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("s") && !word.endsWith("ss"))
    return word.slice(0, -1);
  return word;
}

function terms(text: string): string[] {
  return [
    ...new Set(
      text
        .toLowerCase()
        .replace(/90[ -]?day/g, " quarter ")
        .replace(/on[ -]?page/g, " onpage ")
        .match(/[a-z0-9]+/g)
        ?.filter((word) => word.length > 1 && !stopWords.has(word))
        .map(stem) || [],
    ),
  ];
}

const cards: IndexedCard[] = [];
const dedupe = new Set<string>();

function addRecord(
  node: RecordValue,
  section: string,
  path: string,
  inherited: AssistantSource[],
  inheritedClassification: EvidenceCard["classification"],
  inheritedConfidence: EvidenceCard["confidence"],
) {
  if (
    typeof node.id === "string" &&
    sourcesById.has(node.id) &&
    typeof node.url === "string" &&
    typeof node.accessedAt === "string"
  )
    return;
  const sources = getSources(node, inherited);
  const recordClassification = classification(
    node.classification,
    inheritedClassification,
  );
  const recordConfidence =
    node.confidence === "High" ||
    node.confidence === "Medium" ||
    node.confidence === "Low"
      ? node.confidence
      : inheritedConfidence;
  const qualifies =
    recordSignals.some((key) => key in node) && sources.length > 0;
  if (qualifies) {
    const title = clean(
      String(
        titleKeys
          .map((key) => node[key])
          .find((value) => typeof value === "string") ||
          humanize(path.split(".").pop() || section),
      ),
      160,
    );
    const content = preferredContentKeys
      .filter(
        (key, index, keys) =>
          keys.indexOf(key) === index && key in node && !omittedKeys.has(key),
      )
      .map((key) => [key, valueText(node[key])] as const)
      .filter(([, value]) => value)
      .map(([key, value]) => `${humanize(key)}: ${value}`)
      .join("\n")
      .slice(0, 2400);
    const fingerprint = `${section}|${title}|${content.slice(0, 180)}`;
    if (content && !dedupe.has(fingerprint)) {
      dedupe.add(fingerprint);
      const id = `${section}:${String(node.id || path)}`;
      const searchable =
        `${title} ${content} ${sectionNames[section] || section}`.toLowerCase();
      cards.push({
        id,
        title,
        section,
        classification: recordClassification,
        confidence: recordConfidence,
        content,
        sources,
        searchable,
        terms: new Set(terms(searchable)),
        titleTerms: new Set(terms(title)),
        group: path.split(".").slice(0, 2).join("."),
      });
    }
  }
  for (const [key, value] of Object.entries(node)) {
    if (omittedKeys.has(key) || key === "criteria") continue;
    if (Array.isArray(value))
      value.forEach((item, index) => {
        if (isRecord(item))
          addRecord(
            item,
            section,
            `${path}.${key}.${index}`,
            sources,
            recordClassification,
            recordConfidence,
          );
      });
    else if (isRecord(value))
      addRecord(
        value,
        section,
        `${path}.${key}`,
        sources,
        recordClassification,
        recordConfidence,
      );
  }
}

for (const [name, dataset] of Object.entries(research)) {
  if (name === "guides") {
    for (const [section, guide] of Object.entries(dataset)) {
      if (isRecord(guide))
        addRecord(
          guide,
          section,
          `guides.${section}`,
          [],
          "OPPORTUNITY",
          "Medium",
        );
    }
    continue;
  }
  if (isRecord(dataset))
    addRecord(
      dataset,
      sectionAliases[name] || name,
      name,
      [],
      name === "pages" ? "OBSERVED" : "OPPORTUNITY",
      "Medium",
    );
}
addRecord(
  {
    title: "Executive operating thesis",
    evidence: strategy.assessment,
    action: strategy.assessmentSummary,
    source: strategy.source,
    classification: "INFERRED",
    confidence: "Medium",
  },
  "overview",
  "strategy.assessment",
  [],
  "INFERRED",
  "Medium",
);
addRecord(
  strategy as unknown as RecordValue,
  "overview",
  "strategy",
  [],
  "OPPORTUNITY",
  "Medium",
);
addRecord(
  {
    title: "SEO Strategist role availability and interpretation",
    evidence: research["job-requirements"].availabilityNote,
    summary: research["job-requirements"].summary,
    status: research["job-requirements"].status,
    action: research["job-requirements"].importantBoundary,
    source: research["job-requirements"].sources.map((source) => source.id),
    classification: "OBSERVED",
    confidence: "High",
  },
  "interview",
  "job-requirements.availability",
  [],
  "OBSERVED",
  "High",
);
opportunities.forEach((item, index) =>
  addRecord(
    item,
    "backlog",
    `opportunities.${index}`,
    [],
    "OPPORTUNITY",
    "Medium",
  ),
);
roadmap.forEach((item, index) =>
  addRecord(item, "roadmap", `roadmap.${index}`, [], "OPPORTUNITY", "Medium"),
);

// Include rubric semantics explicitly so 75/100 is never mistaken for a measured SEO KPI.
addRecord(
  {
    title: "How dashboard scores are calculated",
    evidence:
      "Each score is an editorial readiness rubric: four disclosed checks, 25 points per met check. Scores describe the bounded public sample and operational readiness; they are not rankings, traffic, revenue, AI visibility percentages or a comparison of agency quality.",
    action:
      "Inspect the four criteria and their sources before using a score; validate private performance separately.",
    classification: "INFERRED",
    confidence: "High",
    source: strategy.scores.flatMap((score) => score.source),
  },
  "overview",
  "strategy.scoreMethodology",
  [],
  "INFERRED",
  "High",
);

addRecord(
  {
    title: "How the opportunity backlog prioritizes work",
    evidence:
      "The dashboard's proposed operator model uses Impact × Confidence ÷ Effort. Impact and effort are ordinal 1–5 inputs; confidence maps High to 0.9, Medium to 0.6 and Low to 0.3. Configurable weights are exponents. These are explicit planning judgments, not measured revenue forecasts or a claim about SEOasis's internal scoring method.",
    action:
      "Treat P0–P3 as dependency and sequencing labels separately from the numeric score. Confirm account economics, dependencies, capacity and acceptance criteria before moving a task into delivery. Browser-local backlog edits and weight changes are not connected to the assistant's saved research snapshot.",
    classification: "OPPORTUNITY",
    confidence: "High",
    source: ["src-company-home", "src-job-linkedin"],
  },
  "backlog",
  "backlog.priorityMethodology",
  [],
  "OPPORTUNITY",
  "High",
);

addRecord(
  {
    title: "Workspace evidence policy: observed findings and assumptions",
    evidence:
      "Workspace evidence policy, defined by this independent artifact, not SEOasis internal policy: OBSERVED means directly verified public content or implementation; INFERRED means an interpretation of observed evidence; OPPORTUNITY means a proposed test or operating approach; REQUIRES INTERNAL DATA means a conclusion or metric needs authorized account access. Observing a company's published performance claim does not independently verify the outcome.",
    action:
      "Read each finding's classification, confidence, dated supporting note and source together. Keep proposals separate from observations, validate private metrics in their named platforms and revisit stale evidence before using it in a client decision. The cited role supports the QA context, rather than defining this artifact's four labels.",
    classification: "OPPORTUNITY",
    confidence: "High",
    source: ["src-job-linkedin"],
  },
  "sources",
  "workspace.evidencePolicy",
  [],
  "OPPORTUNITY",
  "High",
);

const topicRules: { pattern: RegExp; section: string; additions: string }[] = [
  {
    pattern:
      /\b(collection|collections|category|categories|assortment|catalog|inventory)\b/i,
    section: "collections",
    additions: "collection catalog transactional assortment inventory release",
  },
  {
    pattern: /\b(aeo|chatgpt|perplexity|gemini|claude|ai|answer engine)\b/i,
    section: "aeo",
    additions: "aeo readiness query testing visibility",
  },
  {
    pattern: /\b(schema|json.?ld|structured data|markup|rich result)\b/i,
    section: "schema",
    additions: "schema structured markup validation eligibility",
  },
  {
    pattern:
      /\b(technical|canonical|canonicalization|index|indexing|indexation|robots|sitemap|crawl|crawling|cwv|vitals|performance)\b/i,
    section: "technical",
    additions: "technical foundation indexation canonical crawl",
  },
  {
    pattern:
      /\b(keyword|keywords|intent|cannibalization|volume|query ownership|search demand)\b/i,
    section: "keywords",
    additions: "keyword intent query ownership overlap",
  },
  {
    pattern: /\b(on.?page|title|titles|meta|heading|headings|snippet)\b/i,
    section: "onpage",
    additions: "onpage title meta heading template",
  },
  {
    pattern:
      /\b(internal link|internal linking|architecture|hub|spoke|orphan|navigation)\b/i,
    section: "architecture",
    additions: "architecture internal linking hub spoke",
  },
  {
    pattern: /\b(blog|content|editorial|writer|copy|brief)\b/i,
    section: "content",
    additions: "content editorial coordination brief",
  },
  {
    pattern:
      /\b(backlink|backlinks|authority|digital pr|link building|outreach)\b/i,
    section: "authority",
    additions: "authority link partner scope",
  },
  {
    pattern: /\b(reddit|community|communities|subreddit|posting|spam)\b/i,
    section: "community",
    additions: "reddit community listening disclosure",
  },
  {
    pattern:
      /\b(shopping|merchant|feed|feeds|gtin|mpn|free listings|product title)\b/i,
    section: "shopping",
    additions: "shopping merchant center feed eligibility",
  },
  {
    pattern:
      /\b(revenue|sales|conversion|cro|funnel|margin|profit|purchase|attribution)\b/i,
    section: "cro",
    additions: "revenue conversion attribution funnel",
  },
  {
    pattern:
      /\b(competitor|competitors|competition|competitive|differentiat\w*|peers|positioning)\b/i,
    section: "competitors",
    additions: "competitor positioning differentiation",
  },
  {
    pattern:
      /\b(measure|measurement|report|reporting|metrics|kpi|ga4|gsc|analytics|baseline|track|tracking)\b/i,
    section: "measurement",
    additions: "measurement baseline reporting metric",
  },
  {
    pattern:
      /\b(90.day|quarter|roadmap|first month|first 30|first 90|plan|day 90)\b/i,
    section: "roadmap",
    additions: "quarter roadmap dependency owner",
  },
  {
    pattern:
      /\b(prioriti\w*|backlog|quick win\w*|first|next action|opportunit\w*)\b/i,
    section: "backlog",
    additions: "priority impact confidence effort proposed",
  },
  {
    pattern:
      /\b(methodology|philosophy|playbook|operating model|mike(?: sack)?|seoasis(?:['’]s)? (?:team|founder)|what (?:does|do) (?:seoasis|this (?:company|agency)|the (?:company|agency)|they) do|who is (?:seoasis|mike(?: sack)?))\b|\bwho (?:is|are) (?:the )?founders?(?=[?.]|$)/i,
    section: "methodology",
    additions: "methodology pillar operating philosophy",
  },
  {
    pattern:
      /\b(classifications?|classify|assumptions?|evidence policy|distinguish .*observed|observed (?:vs|versus)|inferred|data types)\b/i,
    section: "sources",
    additions:
      "evidence policy observed inferred opportunity classification assumptions",
  },
  {
    pattern:
      /\b(job|role|requirements|interview|asana|leadership|fulfillment|ownership)\b/i,
    section: "interview",
    additions: "requirement ownership account strategy",
  },
  {
    pattern:
      /\b(score|scores|scoring|rubric|strength|strengths|assessment|overview)\b/i,
    section: "overview",
    additions: "score rubric criteria assessment strengths",
  },
];

/** Only actual unavailable account results are blocked, not questions about methodology. */
export function needsPrivateData(question: string): boolean {
  const q = question.toLowerCase();
  const metricPattern =
    /\b(revenue|sales|traffic|sessions|visitors|clicks|impressions|ctr|conversion rate|transactions|rankings?|backlink count|search volume|ai visibility percentage|organic performance|profit|margin|orders|lead count|leads)\b/;
  // An explicit request for account results wins over a separate framework,
  // public-source or "claim" instruction elsewhere in the same question.
  const clauses = q.split(/[.!?;\n]|\band\b|\bbut\b|\bthen\b/);
  const explicitResult = clauses.some((clause) => {
    if (!metricPattern.test(clause)) return false;
    if (
      /\b(?:predict|forecast|project|estimate)\b/.test(clause) &&
      !/\b(?:how|method|framework|formula)\b/.test(clause)
    )
      return true;
    const fabricatedResult =
      /^\s*(?:(?:can|could|would|will) you\s+)?(?:please\s+)?(?:just\s+)?(?:invent|fabricate|make up|pretend)\b/.test(
        clause,
      );
    if (fabricatedResult) return true;
    const request =
      /\b(?:what (?:is|are|was|were)|how (?:much|many)|show(?: me| us)?|give(?: me| us)?|reveal|tell me)\b|^\s*(?:please\s+)?(?:claim|state|say)\b/.test(
        clause,
      );
    const scoped =
      /\b(?:our|my|their|seoasis|client(?:'s|’s)?|actual|current|last (?:week|month|quarter|year)|this (?:week|month|quarter|year)|yesterday|today)\b/.test(
        clause,
      );
    const frameworkObject =
      /\b(?:what (?:is|are|was|were) (?:the |a |an )?(?:formula|definition|meaning|framework|data|metric definitions|platforms|inputs)|how (?:to |should |would |can |do |could )?(?:we |i |you |they )?(?:measure|track|calculate|report|validate|monitor|attribute))\b/.test(
        clause,
      );
    return request && scoped && !frameworkObject;
  });
  if (explicitResult) return true;
  if (
    /\b(how (?:to |would |should |can |do |could )?(?:we |i |you |they )?(?:measure|track|calculate|report|validate|monitor|attribute)|what (?:data|metrics|platforms|access|inputs)|framework|measurement plan|define|definition|meaning|formula|calculation|should (?:we|i) measure)\b/.test(
      q,
    )
  )
    return false;
  if (
    /\b(public|published|case study|case studies|company.reported|self.reported|claims|claim)\b/.test(
      q,
    )
  )
    return false;
  const metric = metricPattern.test(q);
  const actual =
    /\b(what (?:is|are|was|were)|how (?:much|many)|show (?:me |us )?(?:the |our |their |my )?(?:actual|current|organic|last|revenue|traffic|rankings|sales|performance)|actual|current|last (?:week|month|quarter|year)|this (?:week|month|quarter|year)|our|their|my|seoasis|yesterday|today|grew|declined|dropped|increased|decreased|performing|generate|generated|earning|earned)\b/.test(
      q,
    );
  return metric && actual;
}

/** Lexical retrieval is local, deterministic, and independent of the optional LLM. */
export function retrieveEvidence(
  question: string,
  section?: string,
  previousQuestion?: string,
): EvidenceCard[] {
  const followUp =
    /\b(that|this|those|these|it|them|more|next|expand|why|example|source|evidence)\b/i.test(
      question,
    ) && terms(question).length < 5;
  const combined = `${question.slice(0, 1800)}${followUp && previousQuestion ? ` ${previousQuestion.slice(0, 1000)}` : ""}`;
  const originalTerms = terms(combined);
  const topics = topicRules.filter((rule) => rule.pattern.test(combined));
  const expanded = terms(topics.map((rule) => rule.additions).join(" "));
  const topicSections = new Set(topics.map((rule) => rule.section));
  const privateQuestion = needsPrivateData(question);
  if (!originalTerms.length && !topics.length) return [];
  const ranking = cards
    .map((card) => {
      const exactMatches = originalTerms.filter((word) => card.terms.has(word));
      const titleMatches = originalTerms.filter((word) =>
        card.titleTerms.has(word),
      );
      const expandedMatches = expanded.filter((word) =>
        card.terms.has(word),
      ).length;
      let score = exactMatches.length * 2.2 + titleMatches.length * 3.7;
      if (topicSections.has(card.section))
        score += 4 + Math.min(4, expandedMatches * 0.65);
      if (section === card.section && exactMatches.length) score += 1.1;
      if (
        card.section === "aeo" &&
        topicSections.has("collections") &&
        !topicSections.has("aeo")
      )
        score -= 8;
      if (privateQuestion && card.classification === "REQUIRES INTERNAL DATA")
        score += 5;
      if (
        topics.some((topic) => topic.section === "backlog") &&
        (card.section === "backlog" || card.section === "roadmap")
      ) {
        if (/priority: P0/.test(card.content))
          score += /\b(first|start|immediate|quick win)\b/i.test(combined)
            ? 12
            : 3;
        if (/Days 1[–-]30/.test(card.content)) score += 1.5;
      }
      if (
        /\b(score|scores|rubric|scoring)\b/i.test(combined) &&
        card.id.includes("scoreMethodology")
      )
        score += 12;
      if (
        /\b(methodology|playbook|operating model|what .*do)\b/i.test(
          combined,
        ) &&
        card.section === "methodology" &&
        card.id.includes("pillars")
      )
        score += 3;
      if (
        /\b(source|evidence|prove|observed)\b/i.test(combined) &&
        card.classification === "OBSERVED"
      )
        score += 1;
      // No section-only fallback: an unrelated question must not receive a confident brief.
      if (
        (!exactMatches.length && !topicSections.has(card.section)) ||
        (!topics.length &&
          exactMatches.length / Math.max(1, originalTerms.length) < 0.6)
      )
        score = 0;
      return { card, score, exact: exactMatches.length };
    })
    .filter(
      (item) =>
        item.score >= 5 &&
        (item.exact > 0 || topicSections.has(item.card.section)),
    )
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.exact - a.exact ||
        a.card.id.localeCompare(b.card.id),
    );

  const chosen: IndexedCard[] = [];
  const usedTitles = new Set<string>();
  for (const { card } of ranking) {
    if (usedTitles.has(card.title.toLowerCase())) continue;
    if (chosen.filter((item) => item.group === card.group).length >= 3)
      continue;
    chosen.push(card);
    usedTitles.add(card.title.toLowerCase());
    if (chosen.length === 6) break;
  }
  return chosen.map(
    ({
      id,
      title,
      section: cardSection,
      classification: kind,
      confidence,
      content,
      sources,
    }) => ({
      id,
      title,
      section: cardSection,
      classification: kind,
      confidence,
      content,
      sources,
    }),
  );
}

function extractField(card: EvidenceCard, keys: string[]): string {
  for (const key of keys) {
    const prefix = `${humanize(key)}: `;
    const line = card.content
      .split("\n")
      .find((item) => item.startsWith(prefix));
    if (line) return line.slice(prefix.length);
  }
  return "";
}

/** A useful, fully free extractive mode; it never masquerades as generated AI. */
export function buildResearchReply(
  question: string,
  evidence: EvidenceCard[],
): string {
  if (!evidence.length)
    return "I couldn’t find supporting evidence for that in this workspace’s reviewed research. Try a question about SEOasis’s methodology, Shopify collections, technical checks, AI visibility, measurement, or the 90-day plan. No live account data or web search is connected.";
  const privateQuestion = needsPrivateData(question);
  const lines: string[] = [
    privateQuestion
      ? "Requires Internal Access. This workspace contains public research and proposed client frameworks, so I can’t report actual SEOasis or client performance. Here is what the documented evidence can support."
      : "From the reviewed workspace research:",
  ];
  const requestedCount = /\b(three|3)\b/i.test(question)
    ? 3
    : /\b(two|2)\b/i.test(question)
      ? 2
      : /\b(one|1)\b/i.test(question)
        ? 1
        : 4;
  const displayed = evidence.slice(0, requestedCount);
  for (const [index, card] of displayed.entries()) {
    const finding = extractField(card, [
      "evidence",
      "summary",
      "description",
      "detail",
      "whatSeoasisSays",
      "finding",
      "scope",
    ]);
    lines.push(
      `\n**${card.title}** — ${card.classification} · ${card.confidence} confidence [${index + 1}]\n${finding || card.content.split("\n").slice(0, 2).join(" ")}`,
    );
    const action = extractField(card, [
      "recommendedAction",
      "action",
      "operatorAction",
      "decision",
      "decisionInfluenced",
      "acceptance",
      "acceptanceCriteria",
      "rule",
      "instruction",
      "notes",
    ]);
    if (action) lines.push(`Documented next step: ${action}`);
    const platform = extractField(card, ["platform"]);
    const metric = extractField(card, ["metric"]);
    if (platform)
      lines.push(`Platform: ${platform}${metric ? `. Pull: ${metric}` : "."}`);
    if (/\b(prioriti\w*|first|backlog|roadmap|plan)\b/i.test(question)) {
      const priority = extractField(card, ["priority"]);
      const owner = extractField(card, ["owner"]);
      if (priority || owner)
        lines.push(
          [priority && `Priority: ${priority}`, owner && `Owner: ${owner}`]
            .filter(Boolean)
            .join(" · "),
        );
    }
    if (card.classification === "REQUIRES INTERNAL DATA" && !platform)
      lines.push(
        "Requires Internal Access; use the cited measurement or validation specification before making a performance claim.",
      );
  }
  if (privateQuestion)
    lines.push(
      "\nThe dashboard does not contain authenticated GA4, Google Search Console, Shopify, Merchant Center, CRM, or paid-tool results. Public case-study outcomes are attributable company claims, not a connected performance baseline.",
    );
  else
    lines.push(
      "\nThis is the saved public-data example, not a live client assessment. Proposed actions remain hypotheses until the account owner validates scope, baseline, and capacity.",
    );
  return lines.join("\n");
}

/** The bracket numbers exactly match the evidence cards supplied to the UI. */
export function buildGroundingContext(evidence: EvidenceCard[]): string {
  const selected = evidence.slice(0, 6);
  if (!selected.length) return "";
  // Every bracket reference survives inside the browser model's context budget.
  // Full URLs and unabridged evidence remain attached to the displayed cards.
  const perCard = Math.floor(4500 / selected.length) - 2;
  return selected
    .map((card, index) => {
      const prefix = `[${index + 1}] ${card.title}\nSection: ${sectionNames[card.section] || card.section}\nClassification: ${card.classification}; confidence: ${card.confidence}\n`;
      const firstSource = card.sources[0];
      const provenance = firstSource
        ? `\nLedger source: ${firstSource.id} | ${clean(firstSource.title, 100)} | accessed ${firstSource.accessedAt}. Full citations are attached to evidence [${index + 1}].`
        : "";
      const contentBudget = Math.max(
        0,
        perCard - prefix.length - provenance.length,
      );
      return `${prefix}${card.content.slice(0, contentBudget)}${provenance}`;
    })
    .join("\n\n")
    .slice(0, 4500);
}

export const knowledgeStats = {
  records: cards.length,
  sources: sourcesById.size,
};

# Assistant evidence and grounding review

Reviewed: 2026-10-14. Scope: the assistant knowledge layer, local model engine, worker, React answer rendering and automated assistant checks. This review does not replace browser, accessibility, deployment or actual model-output testing.

## Result

The source-based research path passes the reviewed evidence, citation and private-data boundaries after the corrections below. `npm run test:assistant` passes with 498 indexed evidence records and 149 ledger sources. Additional adversarial, unknown-entity, framework, classification-policy and requested-answer-count checks also pass.

## Findings corrected

1. **Mixed requests could bypass the private-data guard.** A phrase such as “Define revenue first” or “according to public sources” previously disabled the guard for a separate request for actual account revenue. An explicit result request is now evaluated by clause before framework/public exceptions. “What is our organic revenue last month? Define revenue first,” “How should we measure revenue and what was our revenue last month?” and an instruction to invent a revenue claim all require internal access. Imperative “claim our revenue,” “make up,” “fabricate,” “pretend” and “invent” requests for performance metrics also remain unsupported. Framework-only questions such as “What data platforms are needed to measure current revenue?” and attributable public-case-study questions remain usable.
2. **Generic identity questions could retrieve unrelated company evidence.** Broad “who is” and “what does … do” triggers returned SEOasis methodology for Elon Musk and Tesla. The methodology trigger now names SEOasis, Mike, the agency/company context or a standalone founder question. The unrelated identity questions return no evidence; SEOasis and Mike questions continue to retrieve relevant records.
3. **The Sources section starter had no matching evidence.** The workspace now indexes its own four-label evidence policy as `OPPORTUNITY`, with High confidence. It explicitly identifies the policy as belonging to this independent artifact, rather than SEOasis's internal process. The attached role citation supports the QA context and is explicitly not represented as defining the labels.

## Evidence controls verified

- Every returned source ID and URL pair is resolved from the existing source ledger. Arbitrary user/model URLs cannot become evidence links through the answer renderer.
- Records retain `OBSERVED`, `INFERRED`, `OPPORTUNITY` or `REQUIRES INTERNAL DATA`, plus confidence, source title, date accessed and supporting note.
- Inherited parent sources are available for child findings; embedded ledger/source objects are excluded from the finding index.
- Raw HTML, script/style content, crawl inventories and graph payloads are excluded from model grounding.
- Retrieval returns at most six distinct evidence cards. Model grounding stays at or below 4,500 characters while retaining the corresponding bracket references.
- Unknown World Cup, Bitcoin, bank-balance and unrelated identity questions do not receive a confident research summary.
- Follow-up questions retain the previous question's topic. Prioritize-first questions return the measurement contract, indexation baseline, assortment/margin gate and account operating board.
- Research replies remain extractive, state when private access is required, distinguish proposed actions from observations and identify the saved research snapshot as separate from browser-local task edits.
- A request for three opportunities produces three research findings after the root implementation's requested-count correction.

## Prompt and rendering boundary

User text and model output are rendered through React text nodes and limited formatting components. The reviewed assistant has no `dangerouslySetInnerHTML`, dynamic HTML insertion, `eval`, `new Function` or exposed tool-calling interface. Its answer links are generated from reviewed evidence source records. A pasted HTML event handler therefore remains text; a request to run a tool has no assistant execution path.

The model receives explicit grounding instructions, a bounded research context and limited conversation history. Private-result requests and evidence-free questions use the deterministic research response instead of generation. The user interface correctly describes local AI as a generated draft requiring source verification, and describes the business adaptation as retrieval over workspace research, rather than training on private client accounts.

## Verification limits

This review verifies code paths and deterministic research behavior. It does not claim that a language model will always obey citation or factual-grounding instructions. Actual generated output, browser model loading, stop/retry/release behavior and mobile layout require the separate runtime QA being performed by the root agent. No private account results were accessed or inferred in this review.

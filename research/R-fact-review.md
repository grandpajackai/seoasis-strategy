# Independent research and fact-check review

Reviewed: 2026-10-14  
Workstream: R — Independent fact checking  
Scope: Research/data evidence and operating claims. This pass does not certify browser behavior, deployment, final strategy synthesis or build success.

## Assessment

The research is suitable for synthesis after the corrections below are carried into generated files and documents. No fabricated GSC, GA4, Shopify, Merchant Center, traffic, backlink, ranking, search-volume or AI-visibility result was found in the reviewed original datasets. Published client metrics appear as attributed website copy or are explicitly identified as SEOasis-reported outcomes. Suggested workflows and hypothetical merchant examples are distinguished from observations.

No unresolved P1 factual issue was found in this pass. Three P2 precision issues were corrected. One retrieval caveat was made more specific. Final source compilation, application verification and end-to-end QA remain separate gates.

## Corrected findings

### R-01 · P2 · Repeated-title finding was broader than the observed suffix issue

Files: `data/technical.json`, finding `B-F03`.

Nine sampled titles contain the name SEOasis twice, but only seven end with the exact duplicate suffix `| SEOasis | SEOasis`. The Bronson AI title uses SEOasis naturally in its subject; the Dr. Brandt title includes a case-study descriptor. Those two titles should not receive the same blanket suffix-removal instruction.

Applied correction: narrow the evidence and affected URL list to the seven exact duplicated suffixes. Preserve source titles and describe this as a template/editorial improvement with unmeasured CTR impact. `data/onpage.json` already used the correct seven-title definition.

Carry-through gate: use **seven** in synthesis, backlog and generated documentation. If regenerating technical data from the audit script, preserve this correction; the original raw sample remains unchanged.

### R-02 · P2 · Product schema validation label contradicted absence of Product

Files: `data/schema.json` and `research/G-schema.json`, coverage record `SC-TYPE-Product`.

The row correctly said Product was not detected in the agency sample but used the generic label “Syntax observed; Google eligibility not tested.”

Applied correction: “Not detected in agency-site sample; proposed client PDP implementation requires validation.” The client-only recommendation and collection/PDP distinction remain intact.

### R-03 · P2 · Conversion denominator needed session discipline

Files: `data/cro.json` and `research/M-cro.json`, record `M-METRIC-cvr`.

Purchases divided by sessions is a purchases-per-session ratio. A session conversion rate should use sessions containing a purchase divided by sessions, using the same acquisition and period scope.

Applied correction: rename the field “Purchase session conversion rate” and specify organic sessions containing at least one purchase divided by organic sessions. Report purchases per session separately. Added primary source `SRC-R-GA4-CVR`.

Supporting source: [GA4 Traffic acquisition report](https://support.google.com/analytics/answer/12923437?department=product+and+engineering), accessed 2026-10-14. Google's session key-event rate uses sessions containing the event. No account value is supplied.

### R-04 · P2 · Eastside retrieval limitation made specific

Files: `data/competitors.json` and `research/N-competitors.json`, Eastside Co and source records `N-08`/`N-09`.

Applied clarification: direct retrieval was limited by a TLS certificate error; the bounded observations rely on indexed primary-site text and retain Medium confidence. This does not establish site downtime or a user-visible outage. No certificate bypass was performed.

## Verified evidence boundaries

- **Technical sample:** independent recomputation confirmed 20 final HTTP 200 responses, 20 single-H1 pages, 16 source-HTML canonicals, 19 pages with JSON-LD, 75 image elements and zero missing alt attributes. These are sample observations, not site-wide results. Alt presence does not establish meaningful alternatives; JSON parsing is not rich-result validation; 200/index-follow is not proof of Google indexation.
- **Keyword overlap:** near-synonym URL families are called possible overlap. Consolidation is conditional on query × URL, intent and commercial evidence. No confirmed cannibalization, verified rankings, numeric difficulty or invented demand is claimed.
- **Agency versus merchant:** SEOasis is treated as an agency. Collection briefs are explicitly hypothetical client workflows and require catalog, inventory, margin and analytics access.
- **Product versus collection schema:** primary [Google Product snippet guidance](https://developers.google.com/search/docs/appearance/structured-data/product-snippet), accessed 2026-10-14, supports focusing product rich results on individual products or their variants. Collection recommendations do not promise product stars or blanket Product markup.
- **FAQ guidance:** primary [Google documentation updates](https://developers.google.com/search/updates), accessed 2026-10-14, confirm FAQ rich results stopped appearing May 7, 2026. The dashboard correctly treats visible Q&A as useful content and does not promise FAQ rich results.
- **AI visibility:** primary [Google AI-feature guidance](https://developers.google.com/search/docs/appearance/ai-features), accessed 2026-10-14, supports the no-special-schema boundary for Google's AI surfaces. The dataset explicitly warns against generalizing Google's rules to all assistants. Tests for ChatGPT, Perplexity, Claude and Gemini are suggested protocols with no observed output or visibility percentage.
- **Shopify:** primary [Shopify collections documentation](https://help.shopify.com/en/manual/products/collections), accessed 2026-10-14, confirms the account-dependent new/legacy collection model. The framework correctly requires checking the client's actual admin model rather than prescribing one universal implementation.
- **Reviews and video:** current primary Google review/video guidance supports the self-serving-review eligibility caveat and investigating `.jsonp` video content URLs. The latter remains a validation opportunity, not a confirmed video failure.
- **Community ethics:** community work is framed as listening, authentic authorized participation, disclosure, useful replies and compliance with local rules. No covert accounts, fabricated endorsements, vote manipulation or guaranteed training/AI-recommendation effects are proposed.
- **Revenue:** attributed revenue, assisted journeys and incremental lift are distinguished; Organic Search, Organic Shopping and identified AI referrals are separate. No revenue per keyword or causal lift is inferred from public case studies.
- **Job:** the accessible public LinkedIn role supports the 25-item matrix, including end-to-end ownership, quarterly revisions, Shopify/collections, partners, QA, Asana, communication, AI-assisted operation, independent judgment, documentation and future fulfillment leadership. Role requirements and proposed demonstrations are separately classified. Active hiring status remains conservatively unconfirmed given the Gusto conflict. The candidate's personal qualifications are not invented.

## Source contract and final integration gates

1. Every explicit `sourceIds` reference resolves against an embedded source record when all current original datasets are considered. The compiled `data/sources.json` and `data/research-bundle.json` were stale while parallel research was being integrated; regenerate them before publication.
2. `scripts/verify-data.mjs` currently interprets every string named `source` as a citation ID. Architecture graph edges use `source` as a node ID, such as `homepage`. That is a graph-field naming collision, not missing research provenance. Scope the checker to actual provenance or recognize graph-node fields, then rerun it. Root notified.
3. Carry the corrected metadata count, schema status and conversion formula through synthesis and downloads. Do not mark final strategy, roadmap, source-health, build or responsive QA complete based on this report alone.
4. Preserve source-health distinctions: an automated 403/429 or TLS retrieval limitation is not proof that a cited page is unavailable to a person. Retain the retrieval limitation and the actual evidence mechanism.

## Remaining questions for internal validation

Public content cannot resolve current blog/link-partner scope versus collection-first positioning, account economics, backlog capacity, full rendered link graph, selected canonicals, source-system attribution, historical AI tests or quarterly outcome targets. The existing data marks these as questions or Requires Internal Access; none is treated as a demonstrated defect.

## Addendum — completed Strategy Lead synthesis review

Reviewed the completed `data/strategy.json`, `data/opportunities.json`, `data/roadmap.json`, `research/P-synthesis.md` and `90-DAY-PLAN.md` against the original research and corrections above.

**Result:** no unresolved P1/P2 factual issue in these synthesis files. The prior title-count, schema-absence and conversion-denominator corrections are reflected in the conclusions. No additional dataset changes were needed.

Checks performed:

- All 10 scorecards have four disclosed criteria, and every score equals 25 × the number of criteria marked met. All include scope, confidence, classification and sources.
- All five strengths, five opportunity themes and five internal-validation areas include confidence, classification and traceable source IDs. The internal-validation areas state platform, metric, reason and affected decision.
- All 28 backlog records and 16 roadmap records have unique IDs, evidence, confidence, sources and classification. Impact and effort stay within the disclosed 1–5 planning scale. Their source IDs resolve in the regenerated register.
- The 100/100 ecommerce score explicitly describes documentation of the client method, not merchant implementation quality. Authority/measurement scores explicitly describe public evidence available to this study, not unseen capability or account tracking quality. Preserve those scope statements in the UI.
- Public-site editorial/canonical checks remain modest and conditional; collection, feed, CRO, community and measurement tasks remain client-account proposals. No consolidation, causal revenue lift, schema-based AI inclusion or guaranteed 90-day result is asserted.
- The current FAQ retirement date is preserved: May 7, 2026. Product eligibility, self-serving review-star restrictions, and AI schema boundaries remain consistent with the verified current primary guidance.
- Roadmap tasks retain prerequisites, accountable roles, acceptance checks and sufficient-observation-window caveats. The staging dependency for pilot QA preserves pre-production validation.

**P2 presentation alignment for root:** `components/Dashboard.tsx` renders the first three `strategy.topOpportunities` in interview step 3: compact QA pack, discovery paths and page-role review. `components/navigation.ts` and step 4 of `INTERVIEW-WALKTHROUGH.md` currently narrate discovery, canonicals and proof instead. Align those messages with the three cards actually shown; otherwise the spoken path and screen disagree. Root notified. This is a narrative consistency issue, not unsupported research.

The verifier's graph-node/source-ID naming collision is reported fixed by root. This addendum does not claim final runtime, responsive, downloadable-document or deployed-link checks passed; those remain with the final application gauntlet.

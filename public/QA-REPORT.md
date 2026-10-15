# QA report

Review date: 14 October 2026 (UTC). Independent interview work sample. Approval means the observed release checks passed; it is not a guarantee against every future browser or third-party change.

## Research and synthesis — passed

Independent specialists produced workstreams A–O. Strategy Lead P reviewed all findings, removed overlap, reconciled scope and attribution questions, and produced 10 score rubrics, 28 opportunities and 16 roadmap tasks. Independent fact reviewer R checked originals and synthesis.

Three precision corrections were applied: seven exact duplicated title suffixes (natural brand mentions excluded); Product schema labeled as an opportunity rather than observed markup; purchase-session conversion rate defined using sessions containing purchase. Current FAQ rich-result retirement, Google’s no-special-AI-schema guidance, product/category eligibility, and Shopify’s account-dependent collection model were checked against primary sources. Interview narration was aligned to the three displayed opportunities.

No unresolved material factual issue remained in R’s completed-synthesis review. No private analytics, keyword volume, rankings, link counts, revenue attribution, AI outputs or visibility percentages were fabricated. The 25 job requirements are explicitly mapped to dashboard demonstrations; personal eligibility and experience are not claimed.

## Design and accessibility — passed within reviewed scope

Independent frontend reviewer Q approved the restrained cream/forest design and revised desktop, dark and mobile screens. Evidence typography and contrast were improved. Interview Mode now has eight concise steps and supporting detail on request. Mobile navigation is hidden/inert when closed, isolates the background when open, moves focus to Close, traps focus, and restores it on Escape. Search has a modal focus boundary and visible focus. Reporting cadence uses ordinary pressed buttons. Source links have descriptive accessible names. Competitors with identical coordinates share a cluster.

A second review caught an interview/search/history consistency edge case. It was fixed and production-tested: unrelated search and browser history exit the presentation, keeping route, heading and cards consistent. Cmd/Ctrl+K closing restores the search trigger.

## Build and data integrity — passed

- TypeScript: passed.
- Next.js production static export: passed using the supported Webpack build option. Turbopack’s CSS worker was restricted by this host; the production script uses `next build --webpack` consistently locally and in CI.
- Data verifier: 22 required datasets, 149 source records, source-reference integrity, 10 four-criterion score calculations, 28 unique backlog records, 16 complete roadmap tasks, 20 navigation entries and nine documents passed.
- Static asset verifier: all 11 HTML asset/link references, nine exported documents, noindex metadata and `.nojekyll` passed.
- Research remains separate from presentation code. Raw HTML/full source text is excluded from publication.

## Runtime gauntlet — passed within tested browser

Tests used the Codex in-app browser against the development build and the production static build at the GitHub Pages base path.

- All 20 desktop sections navigated successfully with content and no page-level horizontal overflow.
- All 20 production mobile sections passed at 390 × 844; drawer closed after navigation and no page-level overflow was found. Wide research/backlog tables scroll inside their containers.
- All eight interview steps had three supporting cards and eight presentation navigation entries; Next, Finish and return-to-detail flows worked.
- Section search, dark/light theme, source search and reporting-cadence selection worked. All 10 score buttons are present; a full-width four-criterion rubric opens with focus and restores focus to its score button on close.
- All five backlog filters, sorting, empty-state reset, evidence detail, configurable weights and reset worked. Status and owner edits survived reload and were restored to proposed defaults after testing.
- Collection brief: all 19 fields rendered; local save survived reload; commercial inputs retained “Requires Internal Access.”
- Manual AI log: saving a clearly marked QA-only note worked. No AI query was executed or output claimed. Local test notes do not populate the published dataset.
- Backlog export: preview parsed 28 records, copy feedback succeeded, and downloaded JSON files contained 28 records. The browser automation download event did not surface the event, so file contents were verified directly.
- Keyboard: mobile background inert state, opener/Close focus, Escape restoration, search isolation and Cmd/Ctrl+K restoration were observed.

Screenshots and route summaries are retained under `qa/`. Reviewer reports are in `research/Q-design-review.md` and `research/R-fact-review.md`.

## External citations — checked with disclosed limits

75 unique source URLs were checked. 66 returned HTTP 200; six restricted automated access with HTTP 403; LinkedIn returned HTTP 429; two Eastside URLs had a TLS validation issue. No TLS warning was bypassed. Earlier public/indexed research remains attributed with retrieval limits, including the historical Gusto posting. Check results appear in the source ledger. A restricted automated request is not proof a page is unavailable to a normal visitor.

The SEOasis technical sample itself has 20/20 final HTTP 200 responses. Indexation, Core Web Vitals, full rendered crawl health, client metrics and actual AI visibility remain outside this public review.

## Public release gate — passed

Live dashboard: https://grandpajackai.github.io/seoasis-strategy/

Public repository: https://github.com/grandpajackai/seoasis-strategy

Application revision `52b6f1c` deployed successfully through GitHub Actions run `38569710747`. The lead then tested the published HTTPS application, rather than relying only on local results:

- All 20 desktop views and all 20 mobile views at 390 × 844 navigated with the expected headings and no page-level overflow.
- All eight Interview Mode steps presented three supporting cards and eight presentation links; Next and Finish completed successfully.
- Bookmark reloads, backlog filtering, a 28-record export preview, private-data metric/decision disclosures and dark/light themes worked on the public host.
- No browser-console errors were recorded during the hosted gauntlet.
- All 20 critical HTTP resources passed, including the HTML, scripts, styles, font and all nine downloadable documents.

Hosted evidence is preserved in `qa/live-desktop-routes.json`, `qa/live-mobile-routes.json`, `qa/live-interview-flow.json`, `qa/live-functional-smoke.json`, `qa/live-http.json`, `qa/live-overview.jpg` and `qa/live-interview.jpg`.

The separate independent release reviewer passed the production build, TypeScript, data integrity, static assets/documents, screenshot review and navigation evidence review; see `research/R-release-review.md`. This was independent command/static review, not an additional independent browser execution.

The final follow-up publication adds the completed QA report and proof artifacts without changing application behavior. The release is approved for feedback. Evidence and browser scope limits above remain explicit.

## Candidate feedback update — local gate passed

The requested SVG replaces the top-left placeholder mark. Its file bytes match the candidate-supplied original; CSS provides contrast while preserving the geometry. Overview, measurement, Interview Mode, interview notes, and downloadable documents now frame the prototype as a workspace for Shopify client research, assessments, meeting preparation, and periodic reviews. SEOasis remains the specific agency research example. Connected performance tracking is conditional on authorized account data; no integrations or arbitrary-site audit capability were added.

The focused production export passed data verification, TypeScript, and all 13 HTML asset/link references. In the local production browser, all 20 desktop views, all 20 mobile views at 390 × 844, and all eight interview steps passed. The logo loaded at 174 × 31.53px, remained clear in light/dark themes, did not overlap the mobile Close control, and returned to Overview when clicked. No console errors were recorded. Evidence is in `qa/feedback-local-checks.json` and `qa/feedback-*.jpg`.

Independent copy review accepted the client/agency framing. The design reviewer independently checked the original asset, implementation diff, and desktop/dark/mobile screenshots, with no required fixes; see `research/FEEDBACK-REVIEW.md`. Independent release command checks are recorded in `research/FEEDBACK-RELEASE-QA.md`.

## Candidate feedback update — public release passed

Application revision `a5149c6` deployed successfully through GitHub Actions run `38644207102`. On the published HTTPS dashboard, all 20 desktop views at 1280 × 800, all 20 mobile views at 390 × 844, and all eight interview steps passed their navigation and layout checks. The SVG loaded correctly on the public base path, matched the supplied original byte-for-byte, and returned to Overview when clicked. The revised client-purpose copy was present. No console errors were recorded during these checks.

All 21 critical HTTP resources returned 200, including the logo, scripts, styles, font, and nine downloadable documents. The live resource checker now includes image references. Hosted evidence is retained in `qa/feedback-live-checks.json`, `qa/feedback-live-overview.jpg`, `qa/feedback-live-mobile.jpg`, and the refreshed `qa/live-http.json`. A subsequent documentation/proof-only publication records these completed checks without changing application behavior.

## Workspace assistant — local release gate passed

The assistant adds immediate, explicitly source-based Research mode and optional genuine browser-local AI. It indexes 498 research records and 149 validated source records. The selected model is Qwen3.5 0.8B through pinned WebLLM 0.2.85. Public artifact metadata reports approximately 424 MB of f16 weights or 472 MB of f32 weights, plus runtime/tokenizer assets; the interface rounds the initial download to approximately 500 MB. Inference needs a compatible WebGPU device and roughly 2 GB of available GPU memory. No inference API, key, backend, paid AI request, or private account connection was added.

Assistant regression checks pass across 12 topic queries, source-ledger integrity, all packed citation numbers, follow-up context, unrelated questions, evidence policy, actual/private metric requests, mixed requests, fabricated-result instructions, and unsupported forecasts. Generated analysis is marked INFERRED and requires valid evidence numbers. A documented next action is extracted from a cited research record. Model statements still require human review; valid citations are not a guarantee of semantic correctness.

The lead ran actual browser-local model loading and generation. A comparison with Qwen2.5 1.5B led to the more specific Qwen3.5 answer and smaller download. Research chat continued working during loading. Source-based private-data responses, unknown-question limits, source details, section navigation, stop-generation, session retention, clear, Escape, focus restoration, and modal background isolation were observed. All 20 desktop views, all 20 mobile views at 390 × 844, and all eight interview steps passed navigation/layout checks. No console errors were recorded. Proof is retained in `qa/assistant-local-checks.json` and the assistant screenshots.

Independent evidence, design, and release reviews passed; see `research/ASSISTANT-EVIDENCE-QA.md`, `research/ASSISTANT-DESIGN-QA.md`, and `research/ASSISTANT-RELEASE-QA.md`. Review findings corrected mixed-query guard bypasses, unrelated identity retrieval, welcome scrolling, focus restoration, and worker cancellation/error recovery. Actual model testing also led to constrained citation output and documented next actions. The Next.js dependency was patched from 16.3.4 to 16.3.8 after the dependency audit; the production audit reports zero vulnerabilities.

The final static export, TypeScript, research verifier, assistant tests, 13 HTML asset/link references, and ten exported documents passed. A duplicate set of generated local type-cache files was moved out of the build cache before regeneration; the fresh build and typecheck passed. This host-specific cache issue was separate from application source. See `AI-ASSISTANT.md` for implementation, privacy, compatibility, and evidence boundaries. Browser compatibility remains device-dependent; Research mode is the immediate fallback.

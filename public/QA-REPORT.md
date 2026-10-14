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

## Public release gate

Repository created: https://github.com/grandpajackai/seoasis-strategy

GitHub Pages deployment and live route/asset checks are the remaining release gate. This section will be updated with observed hosted results after deployment.

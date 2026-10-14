# Independent release review

Reviewed: 14 October 2026 (UTC)  
Reviewer: R — release gauntlet  
Release source: `e31dc5e`

## Decision

**Pass within the independently reviewed scope. No material release blocker found.** The application builds as a static GitHub Pages export, the data and source contracts pass, the reviewed presentation is suitable for a concise founder conversation, and the supplied route records cover every navigation destination. Root owns the final live-hosted browser and HTTP checks.

This reviewer independently executed the commands below, inspected current source, parsed the existing QA records, and viewed the four requested screenshots. This reviewer did **not** execute browser automation, run AI queries, authenticate to client platforms, re-crawl external sources, publish, or independently certify the live site. Browser results are attributed to root's saved records.

## Independently executed checks

| Check | Result | Observed evidence |
|---|---|---|
| `npm run verify` | Pass | 22 datasets; 149 source records; 2,588 classified records; 2,469 source references; 10 score rubrics; 28 unique opportunities; 16 roadmap tasks; 20 navigation entries; nine documents. Counts include repeated records in the compiled research bundle; they are not counts of unique findings. |
| `npm run typecheck` | Pass | TypeScript exited successfully without diagnostics. |
| `NEXT_PUBLIC_BASE_PATH=/seoasis-strategy npm run build` | Pass | Next.js 16.3.4 Webpack build compiled, typechecked, and completed static page export. |
| `node scripts/check-build.mjs` | Pass | 11 HTML asset/link references resolved; nine exported documents present; noindex metadata and `.nojekyll` present. |
| Root/public/export document parity | Pass | All nine Markdown deliverables matched byte-for-byte across root, `public/`, and `out/` at review time. |
| Navigation/log correspondence | Pass | All 20 declared navigation IDs appear in both desktop and mobile route records with a nonempty heading; desktop records are nonempty and both records report no page-level overflow. |
| Job coverage | Pass | `JOB-REQUIREMENTS-MATRIX.md` contains 25 requirements, with operational meanings, dashboard demonstrations, and employer-source attribution. It explicitly avoids claiming personal eligibility or confirmed active hiring. |

## Browser evidence reviewed, supplied by root

- `qa/browser-routes-local.json`: 20/20 declared destinations, nonempty content, matching hashes and headings, `bodyOverflow:false`.
- `qa/mobile-routes-production.json`: 20/20 declared destinations, `overflow:false`, `drawerHidden:"true"` after navigation.
- `qa/interview-flow-local.json`: 8/8 stages, three cards per stage, eight presentation navigation items, no reported overflow; timing ends at 5:20.
- `qa/console-check.json`: empty error array, checked 14 October 2026.

These records corroborate coverage. They are snapshots of root's testing and do not establish perpetual availability or a full browser/accessibility certification.

## Screenshot review

Observed files: `qa/interview-desktop.jpg`, `qa/scorecard-desktop.jpg`, `qa/mobile-collections.jpg`, and `qa/mobile-overview.jpg`.

- **Interview desktop:** the concise eight-step index, clear next action, three evidence cards, and quiet forest/cream palette support the intended founder walkthrough. The active first step and shown content agree in this capture. Classifications, confidence, and source paths remain available without dominating the story.
- **Scorecard desktop:** the expanded four-criterion rubric gives the score an inspectable basis. Its scope explicitly distinguishes public source-HTML observations from Google indexation, Core Web Vitals, or business outcomes. This avoids presenting an unexplained agency grade.
- **Mobile collections:** readable title and body text, useful spacing, a compact navigation header, and an explicit agency-versus-client-framework boundary. The visible source token is from an earlier capture; current `SourceRefs` code uses compact Source labels with accessible page titles.
- **Mobile overview:** the primary operating thesis, supporting explanation, and actions fit the narrow viewport with comfortable spacing. No clipping or page-level horizontal overflow is visible in the captured region.

The screenshot review is limited to the captured regions and sizes. All-section mobile coverage comes from root's route record, not these four still images alone.

## Current source review

- `components/navigation.ts` defines 20 research/operator destinations and eight timed presentation steps.
- `Dashboard.tsx` resolves overview, sources, backlog, roadmap, and interview explicitly; the remaining destinations map to the compiled research bundle and relevant operator components. The methodology destination maps to company research.
- Ordinary navigation calls `go(id)` and exits Interview Mode. Deliberate stage navigation calls `go(id, true)`. Hash changes exit an incompatible presentation using current step refs. Search and brand navigation use ordinary navigation. This closes the previously reported stage/heading inconsistency in code.
- Mobile navigation has a stable ID, `aria-controls`, expanded state, hidden/inert behavior, focus trapping, Escape handling, and opener restoration code. Search is labelled as a modal dialog and saves its return target only when opening with the keyboard shortcut.
- `SourceRefs` resolves registered source IDs and exposes source titles through accessible link names. The verifier fails unresolved dataset citation IDs rather than relying on silent UI omission.
- Scores use four disclosed criteria worth 25 points each. The arithmetic and record provenance pass the verifier; the UI explains that scores measure public evidence coverage.
- The backlog exposes filtered sorting, editable local ownership/status, configurable score weights, and export. Local persistence is disclosed. Full runtime behavior remains root's browser-test responsibility.
- Next.js uses `output:"export"`, the configured base path, and local assets. All nine exported documents match the reviewed root copies.

## Research boundaries and citations

The existing fact-review report records the completed research/synthesis checks. This release pass confirms the final structured references resolve and their source records include URL, title, access date, and supporting note. It does not claim a new independent verification of every substantive external assertion.

The saved source-health record contains 75 unique URLs: 66 HTTP 200, six HTTP 403, one HTTP 429, and two retrieval failures recorded as status 0. The root QA report explains the latter as Eastside TLS validation issues. Restricted automated access is correctly distinguished from proof of user-visible downtime. No private analytics or actual AI-visibility results are introduced by this release review.

## Final root handoff

At review time `QA-REPORT.md` still described the public release gate as pending. Root should update that paragraph after its live-hosted checks, package the updated downloads, and publish the final documentation alongside this report. This is a documentation/release handoff, not an application blocker found by this review.

Required final root evidence: the public root URL and all 20 hash destinations, hard refresh/history behavior, exported document bodies, production assets, and console/request results on the hosted base path. No further design expansion or research scope increase is warranted by this bounded release pass.

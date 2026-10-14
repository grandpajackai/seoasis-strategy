# Q — Independent frontend / UX gauntlet review

Reviewed: 2026-10-14 UTC  
Reviewer: independent frontend / UX workstream  
Scope: `components/Dashboard.tsx`, `components/Workspaces.tsx`, `components/Research.tsx`, `components/navigation.ts`, `app/globals.css`, and `qa/desktop-draft.jpg`.

## Verdict

The desktop visual direction is credible, restrained, and appropriate for a founder interview. The cream surface, forest sidebar, quiet borders, and limited illustrations support the intended operator positioning. The design is worth refining, rather than replacing.

**Final frontend review: approved within the reviewed scope.** The initial issues below were corrected through the documented gauntlet. Final closure evidence is recorded at the end of this report. Hosted deployment verification remains the lead engineer’s separate release gate. Scores and backlog content pending synthesis were intentionally excluded from the initial defect findings.

## Branding basis

The saved public homepage HTML, `research/technical/homepage.html`, contains cream `#E8DDD0`, mint `#D8ECDE`, forest `#4A7C5F`, teal `#3B8585`, stone `#44403C`, and a Plus Jakarta Sans hint. The dashboard’s forest / cream direction complements those observed cues without reproducing the public site layout. Source: [SEOasis homepage](https://www.seoasis.io/), accessed 2026-10-14 UTC; supporting note: these color tokens appear in saved homepage elements and visualizations. This comparison does not establish an official brand guide.

The independent interview-work-sample label is valuable. Keep it visible, particularly because the SEOasis wordmark is prominently used in the sidebar.

## Findings and acceptance gates

### Q-01 — P1: Shared-screen and mobile legibility

**Observed in CSS / screenshot.** Primary research text is 10–12 px across relevant breakpoints. Classification tags are 6–7 px; citations are 8–9 px; private-data labels and confidence labels are frequently 7–9 px. Mobile styling often shrinks the same metadata further. The competitor map reaches 6 px labels at mobile sizes. The screenshot is elegant, but the evidence layer is difficult to read at normal meeting share scale.

**Action:** Establish a clear type floor: 14–15 px research prose and forms; 12–13 px navigation / dense table text; 10–11 px short secondary labels. Preserve whitespace by stacking or reducing columns, rather than shrinking meaning-bearing text. Use at least 16 px editable fields on narrow touch screens to avoid browser zoom behavior. A table may scroll locally, with an explicit cue.

**Gate:** At 1280 × 720 and 1440 × 900, a reviewer can read the thesis, source, classification, confidence, and first opportunity without browser zoom. At 390 px wide, research prose, labels, and controls remain legible. A 200% browser-zoom review has no page-level horizontal overflow.

### Q-02 — P1: Mobile offscreen navigation remains keyboard reachable

**Observed in component / CSS.** At widths ≤700 px the sidebar is hidden with a transform only. Its links and close button remain in keyboard navigation while offscreen. Opening the drawer only makes `main` inert; the topbar remains active, and there is no focus move, trap, or return. The trigger has no `aria-expanded` or `aria-controls`.

**Action:** Give the mobile drawer an explicit accessible state. Closed mobile navigation must be inert or hidden from both keyboard and accessibility APIs; open navigation should receive focus. Choose either a modal drawer with complete background inertness and a focus trap, or a clear nonmodal disclosure without partial modal behavior. Escape and the close button should return focus to the opener. Keep desktop navigation exposed.

**Gate:** Tab at 390 px never enters hidden links. Opening focuses a visible control; focus does not disappear behind the scrim; Escape closes and restores focus. All 20 sections remain reachable in the open drawer.

### Q-03 — P1: Meaning-bearing small text contrast

**Observed / calculated from stylesheet tokens.** In light mode, muted `#6f7a72` on `#f7f7f2` is approximately 4.16:1; inferred-tag `#8b7850` on `#eeeada` is 3.55:1; opportunity-tag `#587682` on `#e9eef0` is 4.15:1. These fall below 4.5:1 for normal text. The global focus outline `#386b50` against sidebar `#183f32` is approximately 1.89:1. The hero’s body text passes in this sample.

**Action:** Darken the light-theme muted and tag text enough to pass 4.5:1. Use a pale, high-contrast focus ring inside dark surfaces. Recheck the complete dark theme separately.

**Gate:** All text carrying evidence, classification, confidence, sources, and control labels passes 4.5:1; large text passes 3:1. Focus indicators pass 3:1 against adjacent surfaces and remain visible in both themes.

### Q-04 — P1: Search focus treatment and dismissal

**Observed in CSS / component.** `.search-field input { outline:none }` follows and overrides the global `input:focus-visible` rule. Opening search moves focus correctly, but dismissal has no explicit focus return. The interface is a section finder, which is accurately explained inside the panel.

**Action:** Add a visible focus-within style to search-field wrappers or restore the input outline. Give the panel a semantic label and consistent Escape / close focus restoration. If it is modal, implement a dialog completely; if nonmodal, do not trap focus. Preserve the truthful “Find a workspace section” label.

**Gate:** Keyboard users can open, search, navigate, and dismiss without losing the focus indicator or their place. No-match feedback is clear and the panel does not obstruct navigation on narrow screens.

### Q-05 — P1: Interview Mode needs a shorter visual path

**Observed in component.** The eight-step rail is useful and the 5:20 timing fits the brief. It currently adds content above full research views and leaves the 20-section navigation visible. The “Three opportunities” step opens the complete backlog rather than an explicit three-item shortlist. This can create a long read-aloud dashboard instead of a controlled founder walkthrough.

**Action:** In Interview Mode, expose one concise finding / example per step and keep full research collapsed behind an “Inspect the evidence” affordance. For the opportunities step, display the same three prioritized items named in the narration; for prioritization, show one useful formula / tradeoff example. A restrained compact sidebar or eight-step index is sufficient. Keep a clear exit to the full workspace. Do not add another complex presentation system.

**Gate:** A person unfamiliar with the build can complete the eight-step path in 5–8 minutes without searching, horizontal scrolling, or reading large record lists. Each step has a single primary point, an evidence path, and an obvious next action.

### Q-06 — P2: Reporting controls declare incomplete tab behavior

**Observed in Workspaces.tsx.** Cadence controls use `role="tablist"`, `role="tab"`, and `role="tabpanel"`, but lack roving tabindex, arrow-key handling, stable tab / panel IDs, and `aria-controls` / `aria-labelledby` linkage.

**Action:** Implement the standard accessible tab keyboard pattern, or use ordinary buttons with `aria-pressed` and a labelled content region. The latter is sufficient for a small local switcher.

**Gate:** Keyboard and screen-reader users can determine the selected cadence and reach / identify its content. Arrow keys work if tab roles remain.

### Q-07 — P2: Competitor diagram needs a readable fallback

**Observed in CSS / component.** Absolute points have editorial offsets to improve collisions, and the caution correctly explains ordinal positioning. At 390 px, several long competitor names can overlap or extend beyond the plot despite 6 px labels. The selected competitor disclosure is a useful companion.

**Action:** On narrow screens replace point labels with numbered controls and a legible legend, or present the same qualitative comparison as a list / table. Preserve the explicit editorial-placement explanation. Do not imply chart precision.

**Gate:** Every peer is discoverable by pointer and keyboard, selected state is clear, labels do not overlap, and no point is clipped. Mobile is readable without pinch zoom.

### Q-08 — P2: Source references should remain actionable without hover

**Observed in Research.tsx.** Citation links present short IDs; titles are available through hover `title`, and full details are in the Sources tab. This is traceable, but source context requires navigation or a hover that touch / keyboard users may not see. Missing source IDs are silently omitted by `SourceRefs`.

**Action:** Give each citation an accessible label such as “Source A-03: Shopify SEO agency”. Keep IDs visually compact, but make their names available accessibly and show a short supporting note in the expanded record where useful. Verify every referenced ID resolves in the compiled data; unresolved IDs should fail QA rather than silently disappear.

**Gate:** Every material conclusion has at least one resolvable, reachable supporting source; its page title is announced. A touch user can inspect source context from the record or source register.

### Q-09 — P2: Local editing needs a demonstrable complete flow

**Observed in component; runtime unverified.** The backlog, collection brief, and manual AI log clearly disclose browser-local persistence, which is appropriate. Sorting, filters, export, and editable owner/status form a useful operator demonstration. Opportunity detail currently scrolls to a region below the entire table; for a long list this can separate the selected row from its detail.

**Action:** Prefer a side panel on desktop or inline expanded row / dialog on mobile, or at least provide a “Back to selected opportunity” action and visible detail focus. Validate export after filtering and persisted edits. Avoid implying a shared Asana connection.

**Gate:** Filtering, sorting, expanding, editing, reloading, and exporting form one understandable flow. Export includes the visible filtered rows and edited values. Selected details are announced / focused and can be closed without losing the table position.

### Q-10 — P2: Downloads and hosted route paths require final runtime proof

**Observed in component; runtime unverified.** Multiple CTAs download Markdown files using the configured base path. Hash routes are suitable for a static GitHub Pages deployment, but source links, downloadable artifacts, local font paths, and direct deep links need hosted verification.

**Action:** Root QA should check every public download and every section hash on the final GitHub Pages URL, including hard refresh and browser back / forward. Confirm the download body is the intended file rather than a 404 document.

**Gate:** All 20 navigation destinations, eight interview steps, source links sampled / registered by source QA, and every download work on the published base path without console or request errors.

## Keep

- Preserve the calm forest / cream composition and the restrained orbit illustration. There is no reason to add more decorative charts.
- Keep the clear boundary between the SEOasis agency website and hypothetical Shopify client frameworks.
- Keep the private-data locks and plain “Requires Internal Access” wording.
- Preserve the source register, exportable research, and progressive disclosure. They demonstrate organized fulfillment without overwhelming the main presentation.
- Keep the “Keep. Expand. Revise. Stop.” day-90 decision; it makes strategy revision concrete.
- Retain the explicit note that the artifact does not invent the candidate’s personal qualifications.

## Runtime review matrix for root QA

| Surface / flow | Required checks |
|---|---|
| Overview | Desktop screenshot after synthesis; 10 explainable scores; five strengths / opportunities / private validations; no empty headings |
| Full research | Every sidebar section; disclosures; citations; export; no raw-object rendering or unexplained schema keys |
| Interview | Eight steps, previous / next / finish; no mismatched step content; exit; complete rehearsal in 5–8 minutes |
| Backlog | All filters independently and together; empty state; every sort; selected detail; owner / status persistence; weights; export |
| Collections | Open, fill, save, reload, export; labelled inputs; local-only disclosure; no real merchant metric implication |
| AEO lab | Select platform / prompt; copy; save required note; reload; export; user-entered provenance remains visible |
| Sources | Search ID / title / URL / note; empty state; source titles and dates; download |
| Themes | All 20 sections in both themes; contrast and focus on hero / sidebar / data tables |
| Responsive | 390 × 844, 768 × 1024, 1280 × 720, 1440 × 900; local table scrolling only; readable map fallback |
| Keyboard | Skip link; nav; mobile drawer; search; disclosures; forms; cadence controls; visible focus; Escape; return focus |
| Published app | Root and every hash URL; hard refresh; back / forward; fonts; artifacts; console; request failures |

No browser, server, performance, live-hosting, or build pass is claimed by this static review. Final approval requires root runtime evidence after fixes and synthesis.

## CSS refinement implemented after review

At the lead engineer’s request, appended a bounded refinement block in `app/globals.css`. No components, research data, deployment settings, or public claims were changed.

- Set research and explanatory prose to 14 px; dense evidence / table notes to 13 px; meaning-bearing metadata to 11–12 px; classifications to 10 px. Brand microcopy and decorative artwork remain intentionally secondary.
- Increased navigation / table / control labels and made forms 16 px on mobile. Kept dense tables in their own scrolling region.
- Increased desktop controls to at least 36 px and mobile controls to 44 px, including the interview progress controls while preserving their thin visual bars.
- Darkened light-theme muted text and classification text. Calculated revised contrast: muted **5.35:1**, inferred tag **5.37:1**, opportunity tag **5.81:1**. A pale sidebar focus outline is **9.53:1** against the forest sidebar. Existing dark-theme tag colors remain intact.
- Added a visible search-wrapper focus treatment and a pale focus outline on the dark sidebar / hero.
- Used fewer score / validation columns at constrained widths, wrapped header controls carefully, and increased space where the text now requires it.
- Hid the competitor plot below 700 px and added styles for the lead engineer’s `.competitor-roster` replacement. That companion roster must be present before accepting the mobile competitive section.
- Preserved the cream / forest palette, quiet borders, and restrained decorative graphics.

Static verification: PostCSS parses the final stylesheet successfully (**535 top-level nodes**). Contrast ratios above were calculated from exact CSS hex values. Browser screenshots, layout overflow, competitor-label collision, focus behavior, and runtime controls remain root QA gates. The drawer, search focus restoration, interview content simplification, and reporting semantics are assigned to the lead engineer.

## Second gauntlet — screenshot and updated-code review

Reviewed `qa/interview-desktop.jpg`, `qa/dark-desktop.jpg`, updated `Dashboard.tsx`, `Workspaces.tsx`, `Research.tsx`, and `app/interview.css` on 2026-10-14 UTC.

**Visual judgment: approved for the intended founder conversation at the reviewed desktop size.** The revised interview layout is a substantial improvement: an eight-step index replaces the full research navigation, three concise evidence cards carry each point, source / classification / confidence remain visible, and supporting detail is deliberately one level deeper. The 5:20 proposed timing is credible for an efficient walkthrough. The dark schema screen preserves the hierarchy, readable body text, and restrained palette. Neither screenshot suggests unnecessary decoration or an adversarial audit posture.

The interview screenshot preserves an earlier sidebar scroll position and begins at step 02 while step 01 is selected. The lead engineer reports that `go` / `showInterview` now reset or reveal the current item; this report treats that as a code correction requiring the next runtime capture, rather than claiming the old screenshot proves it passed.

| Earlier gate | Status from this review |
|---|---|
| Q-01 readability | Satisfied in the two reviewed desktop screenshots; mobile remains a runtime gate |
| Q-02 hidden drawer / background | Updated code now makes closed mobile navigation inert / hidden, makes background inert when open, moves and traps focus, and restores focus |
| Q-03 contrast | Corrected colors and dark-theme screenshot are satisfactory; interactive focus still needs runtime review |
| Q-04 search | Updated code now declares a modal dialog, traps focus, and makes the background inert; wrapper focus style exists; shortcut close caveat below |
| Q-05 short interview path | Satisfied by the revised stage component and screenshot; three cards / eight steps are explicit |
| Q-06 reporting semantics | Satisfied in code: ordinary `aria-pressed` buttons replace incomplete tab roles; panel has polite live feedback |
| Q-07 competitor fallback | Satisfied in code: every peer has a roster button and mobile hides the crowded plot; actual mobile layout still needs runtime review |
| Q-08 citation context | Source ledger remains available; source-ID links would benefit from explicit accessible page-title labels |
| Q-09 operator interactions | Root runtime responsibility; no independent execution claimed |
| Q-10 hosted paths | Root deployment responsibility; no live-hosted approval claimed |

Reviewed root-produced artifacts `qa/browser-routes-local.json` and `qa/interview-flow-local.json`. They record 20 nonempty routes without body overflow and eight interview steps with three cards, eight navigation steps, and no overflow. These are useful corroborating QA records; this reviewer did not execute those browser checks. The lead engineer also reports a passing production Webpack build; this reviewer did not independently run it.

### Q-11 — P1: Keep interview stage and selected section consistent

Updated-code observation: global search results invoke `go(id)` while preserving `interview` and `step`. The brand link also invokes `go('overview')` without exiting the presentation. Therefore, during Interview Mode the page heading / selected section can change while the three stage cards still represent the old step. An external hash or browser-history change can produce the same mismatch.

Recommended closure: search and brand navigation should explicitly return to the full workspace; hash / history changes should either align a presentation step or leave Interview Mode. Preserve ordinary eight-step navigation and the supporting-detail flow.

Acceptance gate: from interview step 01, search for Schema and select it; schema content and its heading must agree. Repeat with the brand link, then browser back / forward. No stale stage cards may remain under another section’s heading.

### Small final accessibility refinements

- The mobile trigger should include `aria-expanded` and `aria-controls` connected to a stable sidebar ID. Its current inert / focus behavior is a meaningful correction.
- Cmd/Ctrl+K currently overwrites `returnFocus.current` on both opening and closing. Closing while focus is in the search input can therefore attempt to restore an element that is unmounting. Save the return target only on opening, then verify keyboard close restores the original trigger / control.
- Give source-reference links an accessible name including their page title, rather than relying solely on an ID and mouse-hover title.

No further design rework is recommended. Close Q-11 and the small accessibility items, perform root’s final mobile / hosted smoke pass, and preserve the current restrained presentation.

## Final closure review

Final static review completed 2026-10-14 UTC. The lead engineer supplied production-flow results; this reviewer inspected the corresponding updated code, the mobile route record, and the available screenshots.

**Approval: the frontend and presentation design satisfy their intended purpose within the reviewed scope. No unresolved material frontend finding remains from this review.** The application presents a calm, credible operating workspace with an efficient founder walkthrough and inspectable research depth. Further design expansion is unnecessary.

Closure evidence:

- **Q-11 closed.** `go(id, preserveInterview=false)` now exits the story by default, while deliberate interview-step navigation explicitly preserves it. Hash-change handling compares the current interview section through refs and exits a mismatched story. Brand and global search use ordinary navigation. The lead engineer reports production verification of search → Schema and browser-back → Methodology with Interview Mode exited.
- **Search shortcut restoration closed.** Cmd/Ctrl+K saves the return-focus target only when opening. The lead engineer reports that shortcut close returns focus to “Search dashboard.”
- **Mobile trigger semantics closed.** `aria-controls="workspace-navigation"` points to the stable sidebar ID, and `aria-expanded` reflects drawer state. Inert / hidden background and focus-trap code remain present. The lead engineer reports focus on Close, main / header inertness, and Escape restoration to the opener.
- **Q-08 accessible source naming closed.** Source anchors now announce the source ID and page title through `aria-label`. Compact visible “Source” / “Source 1” labels improve readability without losing provenance in the ledger.
- **Q-07 positioning readability correction closed in code.** Peers sharing the exact same ordinal coordinates now share a stacked cluster. Arbitrary offsets have been removed, and the explanation states the grouping policy. The mobile roster preserves individual selectable peers. The earlier `qa/competitor-desktop.jpg` predates that grouping change and is not treated as proof of the final plot layout.
- **Mobile visual readability confirmed by screenshot.** `qa/mobile-overview.jpg` and `qa/mobile-collections.jpg` show readable typography, appropriate spacing, and an uncluttered 390 px header. They preserve the public-data / client-framework boundary. The screenshots predate the final visible source-chip wording, which is confirmed separately in current code.
- **Mobile route evidence reviewed.** `qa/mobile-routes-production.json` records all 20 sections with `overflow:false` and closed drawer state at 390 px. This reviewer inspected the record; the lead engineer executed the production-browser checks.
- **Operator-flow closure supplied by lead engineer.** Backlog export produced a 28-record download; the 19-field collection brief persisted. These complement the previous eight-step / 20-route production checks. This reviewer did not independently execute those flows.

Q-01 through Q-09 and Q-11 are closed for this frontend review using the code, screenshots, and explicitly attributed runtime evidence above. Q-10 is a deployment-level check owned by the lead engineer and should be reflected in the final project QA report after the public URL is live. This approval is not a promise of perpetual error-free operation and does not claim a full accessibility certification.

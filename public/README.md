# SEOasis — Strategist Workspace

[Open the live dashboard](https://grandpajackai.github.io/seoasis-strategy/) · [Public repository](https://github.com/grandpajackai/seoasis-strategy)

An independent interview work sample and prototype workspace for SEOasis’s Shopify client research, assessments, meeting preparation, and periodic strategy reviews. SEOasis is an agency; its public website is the specific research example, while the collection, Shopping, revenue, and delivery frameworks apply to its ecommerce clients. Performance tracking would require authorized account data; this demo has no live integrations. This project is not commissioned by or affiliated with SEOasis.

## Run locally

Requires Node.js 22 or later and npm.

```bash
npm install
npm run dev
```

Open http://127.0.0.1:3000. The application has 20 navigable workspace sections and a guided eight-step Interview Mode intended for a 5–8 minute conversation.

## Verify and build

```bash
npm run research:compile
npm run verify
npm run test:assistant
npm run typecheck
npm run build
npm start
```

`next build` exports static files to `out/`. `npm start` serves that production export at http://127.0.0.1:3001. There is no application backend, authentication, API key, or live account integration.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` verifies and builds the application on pushes to `main`, then deploys `out/` using GitHub Actions. Configure the repository’s Pages source as **GitHub Actions**. The repository slug is `seoasis-strategy`; update `NEXT_PUBLIC_BASE_PATH` in the workflow if renaming it.

To reproduce the hosted asset paths locally:

```bash
NEXT_PUBLIC_BASE_PATH=/seoasis-strategy npm run build
NEXT_PUBLIC_BASE_PATH=/seoasis-strategy npm start
```

The 20 views use hash navigation (`#technical`, `#collections`, etc.), so bookmarks, browser history, reloads, and GitHub Pages work without rewrite rules.

## Evidence and data

- `data/`: independently researched JSON datasets, source register, synthesis, opportunities, and roadmap.
- `research/`: specialist workstream reports and a reproducible bounded HTTP audit script.
- `components/`: presentation and browser-local working tools.
- `scripts/compile-research.mjs`: compiles research and normalizes the source ledger.
- `scripts/verify-data.mjs`: checks source references, evidence contracts, score arithmetic, navigation coverage, and deliverables.
- `public/`: downloadable documentation, local font assets and license.

Every material research record distinguishes OBSERVED, INFERRED, OPPORTUNITY, and REQUIRES INTERNAL DATA. Public outcome claims are attributed to their publisher, not independently verified. Scores describe public evidence coverage under a disclosed rubric; they are not performance ratings. Read `ASSUMPTIONS.md` and `RESEARCH.md` before interpreting findings.

Raw HTML snapshots and full page text remain local and are excluded from version control. Reproduce the audit with `python3 research/technical/audit_public.py` (20 serial requests, at least 1.1 seconds apart). This requires network access. The published datasets contain concise findings, not copied articles.

## Interactions

Interview Mode, light/dark theme, section search, score-rubric disclosures, evidence detail panels, source search, sortable/filterable opportunity queue, configurable priority weights, editable status/owner, a collection brief builder, and an AI manual-testing log.

Working edits are saved in this browser’s localStorage. They do not update JSON files, connect to Asana, or leave the device. JSON exports create a portable review snapshot. Refresh preserves edits. A different browser starts with the original proposed backlog.

## Workspace assistant — no AI API bill

Open **Ask workspace** in the top bar to discuss the research and inspect the evidence behind an answer. Research mode immediately retrieves relevant records and their source links. It is labeled as source-based retrieval, rather than model generation.

**Enable free AI** optionally loads a Qwen model through WebLLM in a browser worker. It generates conversational analysis using retrieved workspace evidence and recent conversation as context. There is no API key, inference server, or paid AI request. First use downloads approximately 500 MB of model assets; a compatible WebGPU browser and roughly 2 GB of available GPU memory are needed. Model files can be cached by the browser. Device speed, network access, storage, and browser support affect availability; Research mode remains usable when local AI is unavailable.

The model is grounded in the existing public research, not trained or fine-tuned on SEOasis. It has no live website browsing or private account access. Actual revenue, traffic, rankings, and conversion questions require internal data. Generated analysis is a draft to verify against the attached evidence; source links are taken from the validated ledger rather than invented by the model. Chat messages stay in this tab’s memory and clear on reload. No chat history is uploaded or added to the research datasets.

Implementation details and primary references: [AI assistant guide](AI-ASSISTANT.md).

## Delivery documents

`RESEARCH.md`, `SOURCES.md`, `ASSUMPTIONS.md`, `90-DAY-PLAN.md`, `INTERVIEW-WALKTHROUGH.md`, `JOB-REQUIREMENTS-MATRIX.md`, `OPPORTUNITY-BACKLOG.md`, and `QA-REPORT.md`.

## Technology

Next.js App Router with static export, React, TypeScript, Tailwind CSS plus custom CSS, Lucide icons, and local JSON. Diagrams use HTML/CSS and accessible controls. Inter is bundled under the SIL Open Font License (`public/fonts/OFL.txt`). The visual system complements the public SEOasis cream/green identity. The sidebar uses the original SVG logo supplied by the candidate, with a CSS color treatment for contrast; the independent work-sample disclosure remains visible.

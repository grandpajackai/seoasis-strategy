# Public technical sample

Accessed 2026-10-14. Twenty purposively selected HTML pages were fetched serially with a 1.1-second minimum interval. robots.txt and sitemap.xml were inspected separately. `sample.json` retains raw parsed evidence, including visible source text and JSON-LD. HTML and response headers are retained per URL. `scope.json` records exclusions.

Run `python3 research/technical/audit_public.py` to repeat the bounded page sample. Network access is required. No authentication, analytics, search rankings, private metrics or account data were used. A source HTML sample cannot establish full rendered navigation, search indexation, actual CWV, URL-variant behavior, sitewide link health or sitewide crawl depth.

Presentation datasets: `data/technical.json` and `data/pages.json`. Source IDs B-01 to B-22 preserve URL, title, access date and supporting method.

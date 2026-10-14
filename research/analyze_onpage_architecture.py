"""Offline C/F analysis of the saved public HTML sample. No network requests."""
from pathlib import Path
from urllib.parse import urljoin, urlparse
from html.parser import HTMLParser
from collections import deque, Counter
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SAMPLE = json.loads((ROOT / 'research/technical/sample.json').read_text())
PAGES = {p['id']: p for p in SAMPLE}
DATE = '2026-10-14'


def norm(url):
    return url.split('#')[0].rstrip('/') or url


class Anchors(HTMLParser):
    def __init__(self):
        super().__init__()
        self.current = None
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.current = {'href': dict(attrs).get('href', ''), 'text': ''}

    def handle_data(self, value):
        if self.current is not None:
            self.current['text'] += value

    def handle_endtag(self, tag):
        if tag == 'a' and self.current is not None:
            self.current['text'] = ' '.join(self.current['text'].split())
            self.links.append(self.current)
            self.current = None


ANCHORS = {}
for page in SAMPLE:
    parser = Anchors()
    parser.feed((ROOT / f"research/technical/{page['id']}.html").read_text())
    ANCHORS[page['id']] = parser.links


def source(page_id, note):
    page = PAGES[page_id]
    return {'id': 'CF-' + page_id.upper().replace('__', '-').replace('_', '-'),
            'url': page['url'], 'title': page['title'], 'accessedAt': DATE,
            'note': note, 'classification': 'OBSERVED', 'confidence': 'High'}


SOURCES = {k: source(k, 'Saved direct HTTP response and server-delivered HTML; no browser rendering or private performance data.') for k in PAGES}
SITEMAP_SOURCE = {'id': 'CF-SITEMAP', 'url': 'https://www.seoasis.io/sitemap.xml',
                  'title': 'SEOasis XML sitemap', 'accessedAt': DATE,
                  'note': '70 URL entries in saved XML; URL presence is not indexation or a completed site crawl.',
                  'classification': 'OBSERVED', 'confidence': 'High'}


def record(record_id, title, evidence, page_ids, classification='OBSERVED', confidence='High', **extra):
    refs = [SOURCES[k] for k in page_ids]
    return {'id': record_id, 'title': title, 'classification': classification,
            'confidence': confidence, 'evidence': evidence, 'source': refs[0],
            'sourceIds': [s['id'] for s in refs], **extra}


def page_review(page_id, intent, entities, strengths, checks, proposed_test, gate, metric):
    p = PAGES[page_id]
    return record('OP-P-' + page_id.upper(), p['title'],
                  'Metadata, headings and links were extracted from the saved source HTML; effectiveness has not been measured.',
                  [page_id], url=p['url'], currentTitle=p['title'], currentMeta=p['metaDescription'][0],
                  h1=p['h1'][0], subheads=[h['text'] for h in p['headings'] if h['level'] == 2],
                  intent={'classification': 'INFERRED', 'confidence': 'Medium', 'assessment': intent},
                  entities=entities, strengths=strengths, checks=checks,
                  proposedTest={'classification': 'OPPORTUNITY', 'confidence': 'Medium', 'action': proposed_test},
                  acceptanceGate=gate, measurement=metric,
                  cta=[a for a in ANCHORS[page_id] if any(v in a['text'] for v in ['Book', 'Get Pricing', 'See How It Works'])],
                  internalLinks=p['internalLinks'],
                  semanticStructure={'h1Count': len(p['h1']), 'h2Count': sum(h['level'] == 2 for h in p['headings']),
                                     'note': 'Single H1 and topic sections are present. Footer headings use H4. Semantic presence alone does not establish usability or ranking performance.'})


reviews = [
    page_review('homepage',
        'Commercial discovery for established Shopify brands seeking ecommerce SEO and AI visibility support.',
        ['SEOasis', 'Shopify', 'ChatGPT', 'Perplexity', 'Google', 'Mike Sack', 'Nick Winikoff', 'Jacob Copple', 'Arly Belgado'],
        ['Title states Shopify specialization; H1 states the full-stack AEO proposition.',
         'Named team, client testimonials, operating cadence and attributed revenue examples provide first-party proof.',
         'The 90-day recalibration section explains how the work is revised.'],
        ['Metadata is present and the brand suffix appears once; no title rewrite is warranted from the sample alone.',
         'The system section discusses collections, blog content and Reddit; the page-level links only lead to home, case studies and legal pages.',
         'Revenue, timing and AI-effect claims are SEOasis statements and were not independently verified.'],
        'Retain the positioning and test one clear link from the method section to the selected Shopify commercial hub, plus an optional resource route.',
        'Founder confirms intended conversion path; approved destination is 200, canonical and indexable; link is crawlable, descriptive and usable on mobile; preserve the primary audit CTA.',
        'Requires Internal Access: GSC landing-page/query data and GA4 + CRM qualified audit requests. Compare qualified requests and navigation use; no CTR or revenue lift is assumed.'),
    page_review('shopify-seo-agency',
        'Commercial agency selection with a Shopify-specific service proposition and supporting implementation detail.',
        ['Shopify', 'SEOasis', 'ChatGPT', 'Perplexity', 'Google AI Overviews', 'TheFeed', 'Roofnest', 'JSON-LD'],
        ['H1 distinguishes the Shopify agency service and AI-search positioning.',
         'Audit / Build / Grow process and links to TheFeed and Roofnest proof are present.',
         'Hero links offer a strategy call or a process explanation.'],
        ['The title repeats the brand suffix.',
         'H2s contain the wording "general ecommerce" on this Shopify-specific URL.',
         'Shared section headings also appear on /shopify-seo-company; query overlap and performance impact remain unknown.',
         'The /shopify-seo-expert anchor includes a title-like pipe string; a shorter descriptive anchor could improve reading clarity.'],
        'Remove the extra title suffix; review the two shared H2s for Shopify-specific wording; retain the page unless query-by-page evidence supports a different mapping.',
        'Rendered title has one brand suffix; H1 remains unique and aligned; headings and anchors read naturally; editorial reviewer checks factual claims, Shopify constraints and proof consistency.',
        'Requires Internal Access: GSC query × page data, GA4 lead events and CRM lead quality. Inspect primary query ownership before changing overlapping URLs.'),
    page_review('ecommerce-category-page-seo',
        'Commercial investigation of collection/category-page SEO and how SEOasis builds revenue-focused ecommerce landing pages.',
        ['Shopify', 'SEOasis', 'category pages', 'collection pages', 'Search Console', 'TheFeed', 'Roofnest', 'JSON-LD'],
        ['Title, meta and H1 center category/collection pages and business outcomes.',
         'The deep-dive headings cover intent, schema, linking, facets and conversion layout.',
         'Proof links and a strategy-call CTA connect the method to a next action.'],
        ['Two H2s retain the shared phrase "general ecommerce" instead of the category-page subject.',
         'The page includes a hub-and-spoke linking explanation, but no direct source-HTML link to /technical-seo-for-ecommerce.',
         'Broad claims about AI parsing, universal conversion uplifts and ranking timelines need evidence review before reuse in client documentation. They are not endorsed as facts here.'],
        'Make headings specific to category-page intent and add one contextual link to the technical implementation explanation if the account strategist confirms that destination.',
        'Use factual, supportable copy; no fixed word count or guaranteed ranking timeline as a release criterion; links match reader intent and approved page mapping.',
        'Requires Internal Access: GSC nonbrand query/page signals and qualified audit-request outcomes. For clients add inventory, margin and collection revenue before prioritizing scale.'),
    page_review('case-studies__bronson-vitamins-organic-shopping',
        'Proof-led evaluation of Merchant Center and organic Shopping work, followed by an audit request.',
        ['Bronson Vitamins', 'Google Merchant Center', 'GA4', 'Shopify', 'GTIN', 'Organic Shopping'],
        ['H1 describes the case-study outcome; visible copy names May 2026 and a comparison period.',
         'Method sections describe product attributes, feed optimization, titles and diagnostics.',
         'Related case studies and a free-audit CTA are present.'],
        ['The title repeats the brand suffix.',
         'Revenue and conversion figures are first-party reported results, not metrics independently audited by this project.',
         'The comparison says May 2026 versus prior period; a reproducible methodology note could clarify exact dates, channel definition and attribution limitations.'],
        'Deduplicate the title suffix and propose an approved measurement note describing comparison dates, channel scope and confounders without exposing client data.',
        'Client permission and source export are confirmed internally; definitions and date ranges match; reported outcome and causal interpretation remain distinct; no unapproved client data is published.',
        'Requires Internal Access: GA4 Organic Shopping definition and revenue export, Merchant Center free-listing performance and release log. Use to validate attribution and the next feed test.'),
    page_review('blog__how-to-choose-a-shopify-seo-agency',
        'Buyer education before an agency decision; useful support for the primary Shopify commercial page.',
        ['Mike Sack', 'Shopify', 'SEOasis', 'ChatGPT', 'Perplexity', 'Google AI Overviews', 'GA4', 'Rich Results Test'],
        ['Article names Mike Sack, has a publication date and a section-linked table of contents.',
         'Questions about process, revenue reporting and platform experience support buyer decisions.',
         'Commercial and related-article links give readers onward paths.'],
        ['Two source-HTML H2s read "Frequently Asked Questions"; the question "How to Choose the Right SEO Agency?" occurs twice outside scripts.',
         'A contextual commercial link targets /best-shopify-seo-agency; the optimal primary commercial destination requires a query/page map.',
         'Public HTML cannot reliably establish whether text was AI-authored. Editorial quality should be assessed through specificity, accuracy and evidence, not an AI detector.'],
        'Review whether the body FAQ and separate FAQ component intentionally repeat the same answers; keep one clear reader presentation if the rendered page confirms duplication.',
        'Check desktop/mobile rendering and accordion accessibility; one intended FAQ presentation; visible content and FAQ markup agree; author/date and useful section links remain present.',
        'Requires Internal Access: GSC informational and commercial query ownership plus GA4 article-to-audit journey and CRM quality. No assumed rich-result or AI citation benefit.')
]

repeated = [p for p in SAMPLE if p['title'].endswith('| SEOasis | SEOasis')]
onpage_findings = [
    record('OP-01', 'Small title-template QA opportunity',
           f"{len(repeated)} of 20 sampled titles end with '| SEOasis | SEOasis'. This is repeated branding within each title, not evidence of duplicate titles across different URLs.",
           [p['id'] for p in repeated], recommendedAction='Review the page title + site title template; apply branding once and verify the rendered title on representative routes.',
           severity='Low', impact='Low', effort='Low', businessImplication='Cleaner search-result wording and a more consistent brand presentation; no measured CTR benefit is asserted.',
           acceptanceGate='One appropriate brand suffix; page subject retained; source HTML and rendered browser title agree.'),
    record('OP-02', 'Page-specific headings worth an editorial pass',
           'Both sampled Shopify agency/company pages and the category-page service use H2 strings containing "general ecommerce".',
           ['shopify-seo-agency', 'shopify-seo-company', 'ecommerce-category-page-seo'],
           recommendedAction='Review shared template text against the page brief and intended audience.', severity='Low', impact='Low', effort='Low',
           businessImplication='Could strengthen specificity and interview/client-facing polish.', acceptanceGate='Every heading fits the URL subject and has an editorial reviewer.'),
    record('OP-03', 'FAQ presentation worth validating in the rendered article',
           'The agency-selection article has two H2 FAQ sections and the same first question twice in non-script HTML.',
           ['blog__how-to-choose-a-shopify-seo-agency'],
           recommendedAction='Inspect the rendered body and FAQ component together; remove unintended repetition after confirming presentation intent.', severity='Low', impact='Low', effort='Low',
           businessImplication='A shorter, clearer reading path could support buyer confidence.', acceptanceGate='One intended presentation, accessible controls and markup consistent with visible content.'),
    record('OP-04', 'Commercial overlap is a validation question',
           'Shopify agency and company pages share several section headings and Audit / Build / Grow framing but have distinct H1s and URLs. No rankings or query ownership were accessed.',
           ['shopify-seo-agency', 'shopify-seo-company'], classification='INFERRED', confidence='Medium',
           recommendedAction='Compare query-by-page intent, leads and indexing before choosing differentiate, retain or consolidate. No redirect recommendation is made from titles alone.',
           impact='Medium', effort='Medium', businessImplication='Avoid changing a useful landing page based only on lexical similarity.',
           acceptanceGate='Approved query-to-page mapping, baseline, evidence for chosen action and rollback plan.'),
    record('OP-05', 'Keep proof and interpretation separate',
           'Case study copy includes reported outcomes and a claim that a channel comparison confirms the Merchant Center work as the driver; source analytics and experimental controls are not available.',
           ['case-studies__bronson-vitamins-organic-shopping'], classification='OPPORTUNITY', confidence='Medium',
           recommendedAction='If revising proof pages, add an approved method note and describe attribution limits; use first-party reported results as proof statements, not independent causal validation.',
           impact='Medium', effort='Medium', businessImplication='Maintains credible evidence standards in client reporting and AI-readable content.',
           acceptanceGate='Exact date windows, channel definitions, permission and confounders confirmed internally.')
]

before_after = [
    record('OP-T01', 'Deduplicate Shopify page title branding', 'The current title ends in two identical brand suffixes.', ['shopify-seo-agency'],
           classification='OPPORTUNITY', confidence='High', field='title', before=PAGES['shopify-seo-agency']['title'],
           after='Shopify SEO Agency Built for AI Search | SEOasis', testPurpose='Correct repeated branding; preserve the commercial proposition.',
           measure='Requires Internal Access: GSC query/page CTR with stable-position and query-mix context. No promised improvement.'),
    record('OP-T02', 'Deduplicate case-study title branding', 'The current title ends in two identical brand suffixes.', ['case-studies__bronson-vitamins-organic-shopping'],
           classification='OPPORTUNITY', confidence='High', field='title', before=PAGES['case-studies__bronson-vitamins-organic-shopping']['title'],
           after='Bronson Vitamins: Google Merchant Center Case Study | SEOasis', testPurpose='Correct repeated branding without changing the subject.',
           measure='Requires Internal Access: GSC query/page snippet performance; clean rendering is the acceptance criterion.'),
    record('OP-T03', 'Align deep-dive heading with the category-page brief',
           'The category-page URL has an H2 ending in "general ecommerce SEO".', ['ecommerce-category-page-seo'],
           classification='OPPORTUNITY', confidence='Medium', field='H2', before='Everything You Need to Know About general ecommerce SEO',
           after='How Ecommerce Category Page SEO Works', testPurpose='Editorial specificity and simpler reading; proposed wording requires owner review.',
           measure='Rendered readability QA; Requires Internal Access for subsequent behavior or conversion analysis.'),
    record('OP-T04', 'Shorten a title-like internal anchor',
           'The agency page links to /shopify-seo-expert using "SEO Shopify Expert | AI-Era Optimization for Ecommerce Brands".', ['shopify-seo-agency'],
           classification='OPPORTUNITY', confidence='Medium', field='anchor', before='SEO Shopify Expert | AI-Era Optimization for Ecommerce Brands',
           after='Shopify SEO expertise', testPurpose='Readable descriptive anchor; keep destination only if the intent map supports it.',
           measure='Approved destination and editorial QA; no ranking lift promised.')
]

onpage = {'metadata': {'title': 'On-page review: precise tests, measured decisions', 'accessedAt': DATE,
                      'workstream': 'C — On-page SEO', 'sampleSize': 20, 'representativePages': 5,
                      'scope': 'Saved public HTML only. No extra crawl, rankings, analytics or AI-authorship detection.'},
          'summary': 'The sampled pages have explicit positioning, one H1 and clear CTAs. Prioritize small template/editorial checks, then validate query ownership before larger page changes.',
          'sources': list(SOURCES.values()), 'pages': reviews, 'findings': onpage_findings, 'beforeAfterTests': before_after,
          'privateInputs': [record('OP-D01', 'Query ownership and snippet response', 'No Search Console account was accessed.', ['shopify-seo-agency'],
                            classification='REQUIRES INTERNAL DATA', display='Requires Internal Access', platform='Google Search Console',
                            metric='Query × landing-page clicks, impressions, CTR and average position; canonical/indexing inspection.',
                            whyItMatters='Separates shared wording from actual intent competition and supplies a snippet baseline.',
                            decision='Retain, differentiate, consolidate or change snippet wording.'),
                            record('OP-D02', 'Qualified commercial outcomes', 'No analytics or CRM account was accessed.', ['homepage'],
                            classification='REQUIRES INTERNAL DATA', display='Requires Internal Access', platform='GA4 + CRM',
                            metric='Organic landing-page audit requests, qualified leads and agreed downstream revenue attribution.',
                            whyItMatters='Distinguishes traffic and form starts from commercially useful demand.',
                            decision='Prioritize page and CTA tests by lead quality, rather than rankings alone.')],
          'editorialReview': {'classification': 'OPPORTUNITY', 'confidence': 'Medium',
                             'rule': 'No AI-sounding-copy score. Review accuracy, unique detail, evidence, audience fit, repetition, dated platform guidance and clarity with a human editor.',
                             'doneDefinition': 'Brief approved → copy checked → metadata/headings/links/schema verified → mobile CTA journey tested → release logged → measurement review owned.'}}

by_url = {norm(p['url']): p['id'] for p in SAMPLE}
edges = []
out_of_sample = []
for page in SAMPLE:
    seen = set()
    for a in ANCHORS[page['id']]:
        absolute = urljoin(page['url'], a['href'])
        if urlparse(absolute).netloc != 'www.seoasis.io':
            continue
        target = norm(absolute)
        if target == norm(page['url']) or target in seen:
            continue
        seen.add(target)
        item = {'source': page['id'], 'sourceUrl': page['url'], 'targetUrl': target,
                'anchor': a['text'] or 'Logo/image link', 'classification': 'OBSERVED', 'confidence': 'High',
                'evidence': 'Crawlable anchor in saved source HTML; fragments collapsed to page URLs.',
                'sourceIds': [SOURCES[page['id']]['id']]}
        if target in by_url:
            item['target'] = by_url[target]
            edges.append(item)
        else:
            item['targetStatus'] = 'Outside sample; not status-checked'
            out_of_sample.append(item)

graph = {p['id']: [] for p in SAMPLE}
incoming = Counter()
for e in edges:
    graph[e['source']].append(e['target'])
    incoming[e['target']] += 1
depth = {'homepage': 0}
queue = deque(['homepage'])
while queue:
    current = queue.popleft()
    for target in graph[current]:
        if target not in depth:
            depth[target] = depth[current] + 1
            queue.append(target)

def group(page_id):
    if page_id == 'homepage': return 'Homepage'
    if page_id.startswith('case-studies__'): return 'Case studies'
    if page_id == 'case-studies': return 'Case-study hub'
    if page_id.startswith('blog__'): return 'Articles'
    if page_id == 'blog': return 'Resource hub'
    if page_id == 'chatgpt-visibility-audit': return 'Audit tool'
    return 'Commercial services'

nodes = [{'id': p['id'], 'url': p['url'], 'label': p['title'].replace(' | SEOasis', ''), 'group': group(p['id']),
          'minObservedDepthFromHome': depth.get(p['id']), 'depthLabel': str(depth[p['id']]) if p['id'] in depth else 'No path found in sampled graph',
          'sampledInboundSources': incoming[p['id']], 'classification': 'OBSERVED', 'confidence': 'High',
          'evidence': 'Minimum path uses only links in the 20 sampled source-HTML responses. Null is not a site-wide orphan or depth finding.',
          'source': SOURCES[p['id']], 'sourceIds': [SOURCES[p['id']]['id']]} for p in SAMPLE]
sitemap_urls = [n.text for n in ET.fromstring((ROOT / 'research/technical/sitemap.xml').read_text()).findall('{*}url/{*}loc')]
commercial_paths = [u for u in sitemap_urls if urlparse(u).path.strip('/') and not any(v in urlparse(u).path for v in ['/case-studies', '/blog', '/privacy-policy', '/terms-of-service', '/chatgpt-visibility-audit'])]

architecture_findings = [
    record('AR-01', 'Focused homepage navigation versus broader public inventory',
           'Homepage source-HTML links resolve to four page URLs: home, case-study hub, privacy policy and terms. The sitemap lists 70 URLs, including 40 commercial-looking paths classified by URL pattern.',
           ['homepage'], classification='OBSERVED', confidence='High', sourceIds=[SOURCES['homepage']['id'], SITEMAP_SOURCE['id']],
           businessImplication='The public service inventory is broader than the homepage navigation exposes. A focused conversion path may be intentional.'),
    record('AR-02', 'Commercial discovery is worth a bounded validation',
           'No homepage-to-commercial-service path is present when traversal is restricted to the sampled HTML graph. Other site pages, rendering and external discovery can change the full picture.',
           ['homepage', 'shopify-seo-agency', 'blog'], classification='INFERRED', confidence='Medium',
           businessImplication='A selected service hub could help both interested visitors and crawlers discover the offering.',
           recommendedAction='Confirm navigation intent and priority URLs; validate the full rendered graph before adding a restrained hub link. Do not declare all unlinked sample nodes orphaned.'),
    record('AR-03', 'Service-to-proof relationships are already present',
           'Shopify agency and category-page service HTML link directly to /case-studies/sports-nutrition-brand and /case-studies/roofnest.',
           ['shopify-seo-agency', 'ecommerce-category-page-seo'],
           businessImplication='Existing proof links support commercial evaluation; strengthen relevant relationships rather than add indiscriminate links.'),
    record('AR-04', 'Supporting content already links to commercial pages',
           'The Shopify optimization guide links to /shopify-seo-company; the Reddit ecommerce guide links to /shopify-seo-consultant; the agency-selection guide links to /best-shopify-seo-agency.',
           ['blog__how-to-optimize-shopify-sites-for-search-engines', 'blog__how-to-use-reddit-for-ecommerce-seo', 'blog__how-to-choose-a-shopify-seo-agency'],
           businessImplication='Contextual reinforcement exists. Validate whether each destination best serves the article section and assigned intent.'),
    record('AR-05', 'Reciprocal methodology and proof links offer a small test',
           'The Bronson AI case describes collection pages and hub-and-spoke linking, but its source HTML has no direct link to the category-page service. The Shopping case links to Bronson AI; the Bronson AI case does not link back to Shopping.',
           ['case-studies__bronson-vitamins', 'case-studies__bronson-vitamins-organic-shopping', 'ecommerce-category-page-seo'],
           classification='OPPORTUNITY', confidence='Medium',
           businessImplication='Relevant links could help an evaluator move from proof to methodology or adjacent proof.',
           recommendedAction='Add only where a useful sentence supports the relationship; no reciprocal-link quota or ranking guarantee.')
]

def link_rec(n, title, source_id, target_id, anchor, evidence, impact, effort, priority, dependency):
    return record('AR-L' + str(n).zfill(2), title, evidence, [source_id, target_id],
                  classification='OPPORTUNITY', confidence='Medium', sourceUrl=PAGES[source_id]['url'], targetURL=PAGES[target_id]['url'],
                  anchorIntent=anchor, impact=impact, effort=effort, priority=priority, owner='Account Strategist + Developer/Editor',
                  status='Proposed test', dependency=dependency,
                  metric='Requires Internal Access: GSC destination-page/query signals and GA4 onward navigation/qualified audit requests; track the release cohort.',
                  acceptanceGate='Confirm intent map; existing target returns 200 with intended canonical/index policy; contextual crawlable anchor; no self-link; mobile/keyboard path works; QA records source and destination.',
                  notes='Impact is a qualitative planning input, not a forecast. Validate the full site graph and current page strategy before implementation.')

links = [
    link_rec(1, 'Expose the selected Shopify commercial hub', 'homepage', 'shopify-seo-agency', 'Shopify SEO approach',
             'Homepage describes Shopify delivery but no /shopify-seo-agency anchor appears in its source HTML.', 'High', 'Low', 'P1', 'Founder confirms homepage conversion intent and primary Shopify URL.'),
    link_rec(2, 'Connect collection methodology to the dedicated service explanation', 'shopify-seo-agency', 'ecommerce-category-page-seo', 'collection-page strategy',
             'Agency copy discusses collection buildout; its saved links do not include the dedicated category-page service.', 'Medium', 'Low', 'P1', 'Confirm the category-page URL is the selected owner for this sub-intent.'),
    link_rec(3, 'Let Bronson proof open the collection methodology', 'case-studies__bronson-vitamins', 'ecommerce-category-page-seo', 'AI-ready collection-page approach',
             'Bronson AI methodology names AI-ready collection pages, while its links go to the case hub/other cases and homepage.', 'Medium', 'Low', 'P1', 'Editorial approval; retain case-study claim attribution and client permissions.'),
    link_rec(4, 'Align a Reddit article link with Reddit service intent', 'blog__how-to-use-reddit-for-ecommerce-seo', 'reddit-seo', 'Reddit community approach for ecommerce',
             'Article discusses subreddit participation but its only sampled commercial destination is /shopify-seo-consultant; /reddit-seo is not linked.', 'Medium', 'Low', 'P2', 'Review Reddit URL family and choose one primary destination using query/page data.'),
    link_rec(5, 'Link practical collection guidance from the Shopify guide', 'blog__how-to-optimize-shopify-sites-for-search-engines', 'ecommerce-category-page-seo', 'collection-page optimization',
             'Guide has a collection-page section but no direct source-HTML link to /ecommerce-category-page-seo.', 'Medium', 'Low', 'P2', 'Match the specific section and approved intent map; preserve existing useful links.'),
    link_rec(6, 'Connect category strategy to technical implementation', 'ecommerce-category-page-seo', 'technical-seo-for-ecommerce', 'technical checks for ecommerce collections',
             'Category copy discusses schema, facets and canonicalization but the technical service URL is absent from its saved links.', 'Medium', 'Low', 'P2', 'Technical owner reviews accuracy and canonical/facet policy; avoid universal rules.'),
    link_rec(7, 'Connect two different Bronson outcomes', 'case-studies__bronson-vitamins', 'case-studies__bronson-vitamins-organic-shopping', 'Bronson organic Shopping case study',
             'Shopping case links to Bronson AI, while Bronson AI has no reverse Shopping link in the source sample.', 'Low', 'Low', 'P2', 'Explain that AI referral and Organic Shopping are different channel cohorts.'),
    link_rec(8, 'Offer a restrained resource route', 'homepage', 'blog', 'Ecommerce SEO resources',
             'Homepage names blog spokes in its system explanation but contains no /blog anchor in saved HTML.', 'Medium', 'Low', 'P2', 'Confirm educational discovery should be part of homepage navigation; retain primary audit journey.'),
    link_rec(9, 'Make the public audit tool discoverable where useful', 'homepage', 'chatgpt-visibility-audit', 'Explore the ChatGPT visibility audit tool',
             'The audit tool is in the sitemap and sampled at 200, but no link to it occurs on the homepage source HTML.', 'Low', 'Low', 'P3', 'Founder confirms intended tool audience; document installation/privacy limits before adding the route.')
]

architecture = {'metadata': {'title': 'Architecture: reinforce the paths that serve intent', 'workstream': 'F — Site architecture + internal linking',
                            'accessedAt': DATE, 'scope': '20-page purposive sample; offline graph from source HTML. No additional crawling.'},
                'summary': 'Hub-and-spoke delivery is visible in the method, and service-to-proof/content-to-commercial links already exist. Validate discovery paths and choose primary destinations before adding a few useful contextual links.',
                'sources': [*SOURCES.values(), SITEMAP_SOURCE], 'findings': architecture_findings,
                'inventory': {'sitemapUrlCount': len(sitemap_urls), 'commercialLookingPaths': len(commercial_paths), 'sampledPages': len(SAMPLE),
                              'sampledEdges': len(edges), 'homepageReachableSampleNodes': len(depth),
                              'classification': 'OBSERVED', 'confidence': 'High',
                              'evidence': 'Counts derived from saved sitemap and sampled source-HTML graph; commercial grouping is URL-pattern classification, not review of all pages.',
                              'source': SITEMAP_SOURCE, 'sourceIds': [SITEMAP_SOURCE['id'], SOURCES['homepage']['id']]},
                'graph': {'nodes': nodes, 'edges': edges, 'outOfSampleEdges': out_of_sample,
                          'depthDefinition': 'Minimum observed depth from home using only sampled source-HTML anchors. Missing path does not mean site-wide orphan or infinite crawl depth.',
                          'layoutGroups': ['Homepage', 'Commercial services', 'Case-study hub', 'Case studies', 'Resource hub', 'Articles', 'Audit tool'],
                          'legend': 'Solid = observed sampled link; proposed recommendations belong in a separate overlay.'},
                'linkRecommendations': links,
                'orphanValidation': record('AR-D01', 'Full discovery and query ownership check',
                    'The sample does not include all referring URLs, browser-rendered links, crawl logs or indexation data.', ['homepage'],
                    classification='REQUIRES INTERNAL DATA', display='Requires Internal Access',
                    platform='Google Search Console + approved complete crawl/export + server logs if available',
                    metric='Canonical URL inventory, internal inlinks, minimum depth, rendering differences, indexed/crawled state and query ownership.',
                    whyItMatters='A zero-inlink node in a purposive sample cannot establish a real orphan, and linked pages can still be unindexed.',
                    decision='Prioritize navigation/contextual-link changes; investigate verified orphans and mapping conflicts.'),
                'releaseWorkflow': {'classification': 'OPPORTUNITY', 'confidence': 'Medium',
                                    'steps': ['Select priority intent and destination.', 'Write a contextual anchor with the reader task in mind.',
                                              'Check status, canonical, index policy and mobile path.', 'Record source/target and before/after evidence in Asana.',
                                              'Save baseline and release date.', 'Review destination queries and qualified outcomes; revise at the quarterly review.'],
                                    'doneDefinition': 'Useful live link passes QA, has an owner and has a scheduled measurement review; link count alone is not success.'}}

for relative, value in [('data/onpage.json', onpage), ('research/C-onpage.json', onpage),
                        ('data/architecture.json', architecture), ('research/F-architecture.json', architecture)]:
    (ROOT / relative).write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')
print(json.dumps({'onpagePages': len(reviews), 'titleSuffixOccurrences': len(repeated),
                  'graphNodes': len(nodes), 'sampledEdges': len(edges), 'homeReachableInSample': len(depth),
                  'linkRecommendations': len(links), 'writtenFiles': 4}))

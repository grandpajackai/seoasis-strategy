"""Small, reproducible public HTML sample. 20 pages; serial requests >=1.1s apart.

Run: python3 research/technical/audit_public.py
No browser/CWV, search index, analytics, ranking or backlink claims are made.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
import json, time, subprocess, re

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'research' / 'technical'
PATHS = ['', 'case-studies', 'case-studies/bronson-vitamins',
 'case-studies/bronson-vitamins-organic-shopping', 'case-studies/dr-brandt-geo',
 'chatgpt-visibility-audit', 'blog', 'ecommerce-seo', 'ecommerce-category-page-seo',
 'ecommerce-link-building', 'technical-seo-for-ecommerce', 'shopify-seo-agency',
 'shopify-seo-company', 'shopify-seo-consultant', 'shopify-seo-expert',
 'reddit-seo', 'reddit-seo-strategy',
 'blog/how-to-optimize-shopify-sites-for-search-engines',
 'blog/how-to-use-reddit-for-ecommerce-seo', 'blog/how-to-choose-a-shopify-seo-agency']

class Parser(HTMLParser):
 def __init__(self, base):
  super().__init__(); self.base=base; self.title=[]; self.meta=[]; self.canonicals=[]
  self.headings=[]; self.images=[]; self.links=[]; self.scripts=[]; self.capture=None
  self.buf=[]; self.script_buf=[]; self.script_type=None; self.visible=[]; self.hidden=0
 def handle_starttag(self, tag, attrs):
  d=dict(attrs)
  if tag in ('script','style'): self.hidden+=1
  if tag=='title' or re.fullmatch('h[1-6]',tag): self.capture=tag;self.buf=[]
  if tag=='meta':self.meta.append(d)
  if tag=='link' and 'canonical' in d.get('rel',''):self.canonicals.append(d.get('href'))
  if tag=='img':self.images.append(d)
  if tag=='a' and d.get('href'):self.links.append({'url':urljoin(self.base,d['href']),'raw':d['href']})
  if tag=='script' and d.get('type')=='application/ld+json':self.script_type='json';self.script_buf=[]
 def handle_data(self,data):
  if self.capture:self.buf.append(data)
  if self.script_type:self.script_buf.append(data)
  if not self.hidden and data.strip():self.visible.append(data.strip())
 def handle_endtag(self,tag):
  if tag==self.capture:
   s=' '.join(''.join(self.buf).split())
   if tag=='title':self.title.append(s)
   else:self.headings.append({'level':int(tag[1]),'text':s})
   self.capture=None
  if tag=='script' and self.script_type:
   text=''.join(self.script_buf)
   try:self.scripts.append({'parsed':json.loads(text),'validJson':True})
   except ValueError:self.scripts.append({'raw':text,'validJson':False})
   self.script_type=None
  if tag in ('script','style'):self.hidden=max(0,self.hidden-1)

def types(value):
 found=[]
 if isinstance(value,dict):
  t=value.get('@type',[]);found.extend(t if isinstance(t,list) else [t] if t else [])
  for v in value.values():found.extend(types(v))
 elif isinstance(value,list):
  for v in value:found.extend(types(v))
 return sorted(set(found))

pages=[]
for i, path in enumerate(PATHS):
 url='https://www.seoasis.io/'+path
 slug=path.replace('/','__') or 'homepage'
 html=OUT/(slug+'.html');headers=OUT/(slug+'.headers.txt')
 result=subprocess.run(['curl','-L','--silent','--show-error','--max-time','30',
  '--user-agent','SEOasisInterviewPublicAudit/1.0 (sample of 20 pages)',
  '-D',str(headers),'-o',str(html),'-w','%{http_code}\t%{url_effective}\t%{size_download}',url],
  text=True,capture_output=True)
 if result.returncode:
  pages.append({'id':slug,'url':url,'error':result.stderr.strip()});time.sleep(1.1);continue
 code,final,size=result.stdout.split('\t');text=html.read_text(errors='replace')
 p=Parser(final);p.feed(text)
 meta=lambda name:[m.get('content','') for m in p.meta if m.get('name','').lower()==name]
 internal=sorted(set(x['url'].split('#')[0] for x in p.links if urlparse(x['url']).netloc=='www.seoasis.io'))
 external=sorted(set(x['url'] for x in p.links if urlparse(x['url']).scheme in ('http','https') and urlparse(x['url']).netloc!='www.seoasis.io'))
 record={'id':slug,'url':url,'finalUrl':final,'status':int(code),'htmlBytes':int(size),
  'title':p.title[0] if p.title else None,'titleLength':len(p.title[0]) if p.title else 0,
  'metaDescription':meta('description'),'robotsMeta':meta('robots'),'canonical':p.canonicals,
  'h1':[h['text'] for h in p.headings if h['level']==1],'headings':p.headings,
  'imageCount':len(p.images),'missingAltCount':sum('alt' not in x for x in p.images),
  'emptyAltCount':sum(x.get('alt')=='' for x in p.images),
  'imageSample':p.images[:8],'internalLinks':internal,'externalLinks':external,
  'schemaTypes':sorted(set(t for s in p.scripts for t in types(s.get('parsed')))),
  'structuredData':p.scripts,'visibleText':' '.join(p.visible),
  'xRobotsTag':re.findall(r'(?im)^x-robots-tag:\s*(.+)$',headers.read_text()),
  'source':{'url':url,'title':p.title[0] if p.title else path,'accessed':'2026-10-14',
   'note':'Direct HTTP response and server-delivered HTML; scripts were not rendered.'},
  'classification':'OBSERVED','confidence':'High'}
 pages.append(record)
 (OUT/'sample.json').write_text(json.dumps(pages,indent=2))
 print(f'{i+1}/{len(PATHS)} {code} {path or "/"}: {len(record["h1"])} H1, {record["schemaTypes"]}',flush=True)
 time.sleep(1.1)

(OUT/'sample.json').write_text(json.dumps(pages,indent=2))
summary={'accessed':'2026-10-14','pageCount':len(pages),'httpRequestCount':20,
 'intervalSeconds':1.1,'method':'Serial curl GET of 20 sitemap-selected pages; raw HTML parsed with Python standard library.',
 'limitations':['Purposive sample, not a complete crawl.','Source HTML only; browser rendering not tested.',
 'HTTP 200 and no robots block do not prove Google indexation.',
 'No GSC, GA4, backlink database, rankings, field CWV or revenue data accessed.',
 'Linked targets outside this sample were not status-checked; no site-wide broken-link conclusion.',
 'Image bytes and decoded dimensions not downloaded; HTML response size is not image weight.',
 'JSON parse success is not a Google Rich Results or Schema.org validation result.']}
(OUT/'scope.json').write_text(json.dumps(summary,indent=2))

"""Verify the published dashboard's HTML, referenced assets, font and documents."""
from pathlib import Path
from urllib.parse import urljoin
from html.parser import HTMLParser
import json, re, subprocess, sys, time
BASE=sys.argv[1] if len(sys.argv)>1 else 'https://grandpajackai.github.io/seoasis-strategy/'
ROOT=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
 def __init__(self):super().__init__();self.refs=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='script' and a.get('src'):self.refs.append(a['src'])
  if tag=='img' and a.get('src'):self.refs.append(a['src'])
  if tag=='link' and a.get('href'):self.refs.append(a['href'])
def fetch(url,body=False):
 args=['curl','-L','--silent','--show-error','--max-time','20']
 if not body:args+=['-o','/dev/null']
 r=subprocess.run(args+['-w','\n%{http_code}',url],capture_output=True)
 parts=r.stdout.rsplit(b'\n',1);code=int(parts[-1]) if parts[-1].isdigit() else 0
 return code,(parts[0].decode('utf8','replace') if body else ''),r.stderr.decode('utf8','replace')[:120]
status,html,error=fetch(BASE,True)
if status!=200:print(json.dumps({'url':BASE,'status':status,'error':error}));sys.exit(1)
p=Links();p.feed(html);urls={urljoin(BASE,u) for u in p.refs if not u.startswith('data:')}
results=[{'url':BASE,'status':status,'kind':'HTML'}]
for url in sorted(urls):
 is_css='.css' in url;code,body,error=fetch(url,is_css);results.append({'url':url,'status':code,'kind':'CSS' if is_css else 'asset','error':error or None})
 if is_css:
  for ref in re.findall(r'url\([\"\']?([^\)\"\']+)',body):
   if not ref.startswith('data:'):
    target=urljoin(url,ref);c,_,e=fetch(target);results.append({'url':target,'status':c,'kind':'CSS asset/font','error':e or None})
 time.sleep(.15)
for doc in ['README.md','RESEARCH.md','SOURCES.md','ASSUMPTIONS.md','90-DAY-PLAN.md','INTERVIEW-WALKTHROUGH.md','JOB-REQUIREMENTS-MATRIX.md','OPPORTUNITY-BACKLOG.md','QA-REPORT.md','AI-ASSISTANT.md']:
 url=urljoin(BASE,doc);c,_,e=fetch(url);results.append({'url':url,'status':c,'kind':'document','error':e or None});time.sleep(.15)
report={'baseUrl':BASE,'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'passed':all(x['status']==200 for x in results),'totalChecked':len(results),'checks':results}
(ROOT/'qa/live-http.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':report['passed'],'totalChecked':len(results),'failures':[x for x in results if x['status']!=200]}))
sys.exit(0 if report['passed'] else 1)

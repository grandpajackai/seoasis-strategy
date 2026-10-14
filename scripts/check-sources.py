"""Bounded URL health check. Reuses completed 20-page sample; other URLs serial GET, >=1.1s per host."""
from pathlib import Path
from urllib.parse import urlparse
import json, subprocess, time
root=Path(__file__).resolve().parents[1]
sources=json.loads((root/'data/sources.json').read_text())
sample_path=root/'research/technical/sample.json'
sample={x['url']:x for x in json.loads(sample_path.read_text())} if sample_path.exists() else {}
previous_path=root/'qa/source-health.json'
previous={x['url']:x for x in json.loads(previous_path.read_text())} if previous_path.exists() else {}
urls=sorted({s['url'] for s in sources});last={};results=[]
for i,url in enumerate(urls):
 if url in sample and sample[url].get('status'):
  results.append({'url':url,'status':sample[url]['status'],'finalUrl':sample[url]['finalUrl'],'method':'Reused bounded audit HTTP response','checkedAt':'2026-10-14'})
 elif url in previous:
  results.append(previous[url])
 else:
  host=urlparse(url).netloc;delay=1.1-(time.monotonic()-last.get(host,0))
  if delay>0:time.sleep(delay)
  r=subprocess.run(['curl','-L','--silent','--show-error','--max-time','15','-o','/dev/null','-w','%{http_code}\t%{url_effective}',url],capture_output=True,text=True)
  vals=r.stdout.split('\t');code=int(vals[0]) if vals and vals[0].isdigit() else 0
  results.append({'url':url,'status':code,'finalUrl':vals[-1] if len(vals)>1 else url,'method':'Serial curl GET','checkedAt':'2026-10-14','error':r.stderr[:160] if r.returncode else None});last[host]=time.monotonic()
 (root/'qa/source-health.json').write_text(json.dumps(results,indent=2)+'\n')
 print(f'{i+1}/{len(urls)} {results[-1]["status"]} {url}',flush=True)
print('Summary:',{str(c):sum(x['status']==c for x in results) for c in sorted({x['status'] for x in results})})

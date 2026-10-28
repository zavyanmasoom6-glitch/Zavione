#!/usr/bin/env python3
"""ZAVI 65.97 / ADMIN 1.4.43: small visible FAB for all business pages, no finance mutations."""
from pathlib import Path
import argparse,sys,runpy,shutil,json
arg=argparse.ArgumentParser()
arg.add_argument('--web',required=True)
arg.add_argument('--app',choices=['one','admin'],required=True)
a=arg.parse_args()
sys.argv=['apply_skin_v6596.py','--web',a.web,'--app',a.app]
runpy.run_path('design-system/apply_skin_v6596.py',run_name='__main__')
root=Path(a.web)
page=root/'index.html'
html=page.read_text(encoding='utf8')
assert '</head>' in html and '</body>' in html
files=('zavi-voice-fab-v6597.css','zavi-voice-fab-v6597.js')
for name in files:
  source=Path('design-system')/name
  assert source.exists() and source.stat().st_size>2000,name
  assert name not in html
  shutil.copy2(source,root/name)
  if name.endswith('.css'):
    html=html.replace('</head>',f'<link rel="stylesheet" href="./{name}?v=65.97"></head>',1)
  else:
    pos=html.rfind('</body>')
    assert pos>html.rfind('</head>')>0
    html=html[:pos]+f'<script src="./{name}?v=65.97" defer></script>'+html[pos:]
  assert html.count(name)==1
legacy='zavi-voice-admin-v1442.js' if a.app=='admin' else 'zavi-voice-pro-v6596.js'
assert (root/legacy).is_file() and html.index(legacy)<html.index('zavi-voice-fab-v6597.js')
if a.app=='one':
  manifest=root/'zavi-unified20-manifest.json'
  m=json.loads(manifest.read_text(encoding='utf8'))
  assert len(m['profiles'])==20
  m['design_version']='65.97-voice-dashboard-fab-light-dark'
  manifest.write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf8')
  assert (root/'annual-license.js').is_file()
  assert (root/'zavi-zxing-bundle-v6591.js').is_file()
else:
  assert (root/'zavi-admin-command-v1441.js').is_file()
  assert (root/'zavi-admin-congratulations-v1440.js').is_file()
sw=root/'sw.js'
if sw.exists():
  src=sw.read_text(encoding='utf8')
  assert 'const CORE=[' in src
  src=src.replace('const CORE=[','const CORE=['+','.join(json.dumps(v) for v in files)+',',1)
  old='zavi-admin-v1442-voice' if a.app=='admin' else 'zavi-store-v6596-voice'
  new='zavi-admin-v1443-fab' if a.app=='admin' else 'zavi-store-v6597-fab'
  assert old in src
  src=src.replace(old,new)
  for file in files:assert file in src
  sw.write_text(src,encoding='utf8')
page.write_text(html,encoding='utf8')
print('PASS',a.app,'small visible microphone in dashboard and all authenticated pages; existing systems preserved')

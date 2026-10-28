#!/usr/bin/env python3
import argparse,shutil
from pathlib import Path
a=argparse.ArgumentParser();a.add_argument('--app',choices=['one','admin'],required=True);mode=a.parse_args().app
root=Path('android-build/app/src/main/assets');p=root/'index.html';s=p.read_text()
assert 'zavi-independent-commands-v6606.js?v=66.06' in s
for name in ['zavi-single-launch-v6607.css','zavi-single-launch-v6607.js']:
 shutil.copy2(Path('design-system')/name,root/name)
 if name.endswith('.css'):s=s.replace('</head>',f'<link rel="stylesheet" href="./{name}?v=66.07"></head>',1)
 else:s=s.replace('</body>',f'<script defer src="./{name}?v=66.07"></script></body>',1)
old=root/'zavi-independent-commands-v6606.js';t=old.read_text();needle="if(window.ZaviDualCommand605)return;";assert needle in t
old.write_text(t.replace(needle,needle+"\nif(window.__zaviSingle607)return;",1))
s=s.replace('</head>','<script>window.__zaviSingle607=true;</script></head>',1)
p.write_text(s)
sw=root/'sw.js';t=sw.read_text();assert 'const CORE=[' in t;sw.write_text(t.replace('const CORE=[','const CORE=["zavi-single-launch-v6607.js","zavi-single-launch-v6607.css",',1))
gradle=Path('android-build/app/build.gradle');g=gradle.read_text()
changes=[('com.zavione.one.unified20.v6606qa','com.zavione.one.unified20.v6607qa'),('versionCode admin ? 4127 : 660600','versionCode admin ? 4127 : 660700'),('66.06-independent-command-qa','66.07-single-launch-qa')] if mode=='one' else [('com.zavione.one.admin.v1452qa','com.zavione.one.admin.v1453qa'),('versionCode admin ? 145200 : 6554','versionCode admin ? 145300 : 6554'),('1.4.52-independent-command-qa','1.4.53-single-launch-qa')]
for before,after in changes:
 assert before in g,before
 g=g.replace(before,after,1)
gradle.write_text(g)
assert 'zavi-single-launch-v6607.js' in p.read_text()
print('PASS single ZAVI VOICE button',mode)

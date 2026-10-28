#!/usr/bin/env python3
"""QA-only mobile assistant deduplication; preserve legacy authentication."""
from pathlib import Path
import re
assets=Path('android-build/app/src/main/assets')
index=assets/'index.html'
html=index.read_text(encoding='utf-8')
assert 'zavi-independent-commands-v6606.js?v=66.06' in html
css='zavi-redesign-v6607.css'
assert (Path('design-system')/css).is_file()
(assets/css).write_bytes((Path('design-system')/css).read_bytes())
html=html.replace('</head>',f'<link rel="stylesheet" href="./{css}?v=66.07"></head>',1)
index.write_text(html,encoding='utf-8')
js=assets/'zavi-independent-commands-v6606.js'
src=js.read_text(encoding='utf-8')
needle="launcher=create('button','z605-launch','✦');"
assert src.count(needle)==1
# Hide older floating launchers, but leave dashboard actions and their handlers intact.
src=src.replace(needle,"""for(const selector of ['#z196-launch','#z198-power','#z199-launch','.z196-launch','.z197-fab']){
   document.querySelectorAll(selector).forEach(el=>{el.hidden=true;el.setAttribute('aria-hidden','true');});
  }
  """+needle,1)
js.write_text(src,encoding='utf-8')
sw=assets/'sw.js'
if sw.exists():
 s=sw.read_text(encoding='utf-8')
 if 'const CORE=[' in s:s=s.replace('const CORE=[','const CORE=["zavi-redesign-v6607.css",',1)
 sw.write_text(s,encoding='utf-8')
print('PASS responsive single assistant launcher staged; login and cloud unchanged')

# Distinct QA package IDs for the rebuilt APKs, avoiding overwrite of customer apps.
gradle=Path('android-build/app/build.gradle')
g=gradle.read_text(encoding='utf-8')
if 'com.zavione.one.unified20.v6606qa' in g:
 g=g.replace('com.zavione.one.unified20.v6606qa','com.zavione.one.unified20.v6607qa')
 g=g.replace('versionCode admin ? 4127 : 660600','versionCode admin ? 4127 : 660700')
 g=g.replace('66.06-independent-command-qa','66.07-mobile-redesign-qa')
elif 'com.zavione.one.admin.v1452qa' in g:
 g=g.replace('com.zavione.one.admin.v1452qa','com.zavione.one.admin.v1453qa')
 g=g.replace('versionCode admin ? 145200 : 6554','versionCode admin ? 145300 : 6554')
 g=g.replace('1.4.52-independent-command-qa','1.4.53-mobile-redesign-qa')
else: raise RuntimeError('Unknown base package: refusing to relabel')
gradle.write_text(g,encoding='utf-8')

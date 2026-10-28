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

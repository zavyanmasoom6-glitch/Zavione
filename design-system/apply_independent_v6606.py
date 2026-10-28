#!/usr/bin/env python3
"""Restore original first-run/login flow; independently execute typed and voice commands.
Runs AFTER V66.05 dual stage. Existing Supabase client, offline permit,
owner-only ADMIN auth, finance and data stores are untouched.
"""
import argparse,re,shutil
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument('--app',choices=['one','admin'],required=True)
a=p.parse_args()
assets=Path('android-build/app/src/main/assets')
index=assets/'index.html'
html=index.read_text(encoding='utf8')
assert 'zavi-premium-cloud-v6604.js?v=66.04' in html
assert 'zavi-dual-command-v6605.js?v=66.05' in html
assert '__zaviDual605' in html
# The premium stylesheet stays, but its cloud-first overlay script is NOT loaded.
# The previous cloud.js screen remains inside Settings, as before V66.04.
html,count=re.subn(r'<script\s+defer\s+src="\./zavi-premium-cloud-v6604\.js\?v=66\.04"></script>', '', html)
assert count==1,count
# Flag before any legacy deferred script is evaluated.
html=html.replace('</head>','<script>window.__zaviIndependent606=true;</script></head>',1)
for name in ['zavi-independent-commands-v6606.css','zavi-independent-commands-v6606.js']:
    shutil.copy2(Path('design-system')/name,assets/name)
    assert name not in html
    if name.endswith('.css'):
        html=html.replace('</head>',f'<link rel="stylesheet" href="./{name}?v=66.06"></head>',1)
    else:
        pos=html.rfind('</body>')
        assert pos>0
        html=html[:pos]+f'<script defer src="./{name}?v=66.06"></script>'+html[pos:]
assert html.count('zavi-independent-commands-v6606.js')==1
# Block prior dual JS from attaching competing microphone buttons/listeners.
old=assets/'zavi-dual-command-v6605.js'
s=old.read_text(encoding='utf8')
needle='if(window.ZaviDualCommand605)return;'
assert s.count(needle)==1
old.write_text(s.replace(needle,needle+'\nif(window.__zaviIndependent606)return;',1),encoding='utf8')
# Never allow any prior onboarding overlay to start even from a stale browser cache.
premium=assets/'zavi-premium-cloud-v6604.js'
pjs=premium.read_text(encoding='utf8')
needle='if(window.ZaviPremiumCloud704)return;'
assert needle in pjs
premium.write_text(pjs.replace(needle,needle+'\nif(window.__zaviIndependent606)return;',1),encoding='utf8')
# Own native on-device Whisper bridge is unchanged; no Google TTS/STT or audio replies.
new= (assets/'zavi-independent-commands-v6606.js').read_text(encoding='utf8')
assert 'ZaviAndroidLocalVoice' in new
assert 'new Audio(' not in new and 'speechSynthesis' not in new
assert 'state.tab' not in new
index.write_text(html,encoding='utf8')
# Service worker static asset caching, no user private data.
sw=assets/'sw.js';cache=sw.read_text(encoding='utf8')
needle='const CORE=['
assert needle in cache
cache=cache.replace(needle,'const CORE=["zavi-independent-commands-v6606.js","zavi-independent-commands-v6606.css",',1)
sw.write_text(cache,encoding='utf8')
if a.app=='one':
    assert (assets/'cloud.js').is_file()
    cloud=(assets/'cloud.js').read_text(encoding='utf8')
    assert 'window.zaviCloudPanel=uiPanel' in cloud
    assert 'window.zaviCloudGetAuthSession' in cloud
else:
    assert (assets/'app.js').is_file()
    assert 'ZAVI_ADMIN_ALLOWED_EMAILS' in (assets/'app.js').read_text(encoding='utf8')
gradle=Path('android-build/app/build.gradle');g=gradle.read_text(encoding='utf8')
if a.app=='one':
    replacements=[
     ('com.zavione.one.unified20.v6605qa','com.zavione.one.unified20.v6606qa'),
     ('versionCode admin ? 4127 : 660500','versionCode admin ? 4127 : 660600'),
     ('66.05-dual-command-qa','66.06-independent-command-qa')
    ]
else:
    replacements=[
     ('com.zavione.one.admin.v1451qa','com.zavione.one.admin.v1452qa'),
     ('versionCode admin ? 145100 : 6554','versionCode admin ? 145200 : 6554'),
     ('1.4.51-dual-command-qa','1.4.52-independent-command-qa')
    ]
for before,after in replacements:
    assert before in g,before
    g=g.replace(before,after,1)
gradle.write_text(g,encoding='utf8')
print('PASS independent typed/voice controls, original startup and in-app cloud retained',a.app)

#!/usr/bin/env python3
"""ZAVI 65.86 / ADMIN 1.4.32: add 3 non-destructive accessible range controls."""
import argparse,sys,runpy,shutil,re,json
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument("--web",required=True)
p.add_argument("--app",choices=["one","admin"],required=True)
a=p.parse_args()
sys.argv=["apply_skin_v6585.py","--web",a.web,"--app",a.app]
runpy.run_path("design-system/apply_skin_v6585.py",run_name="__main__")
out=Path(a.web)
for name in ["zavi-three-sliders-v6586.css","zavi-three-sliders-v6586.js"]:
 src=Path("design-system")/name
 assert src.is_file() and src.stat().st_size>3000,src
 shutil.copy2(src,out/name)
edited=0
for page in out.glob("*.html"):
 t=page.read_text(encoding="utf-8")
 if "zavi-unified-navigation-v6585.css" not in t:continue
 assert "zavi-three-sliders-v6586.js" not in t
 assert "</head>" in t and "</body>" in t
 t=t.replace("</head>",'<link rel="stylesheet" href="./zavi-three-sliders-v6586.css?v=65.86"></head>',1)
 t=t.replace("</body>",'<script defer src="./zavi-three-sliders-v6586.js?v=65.86"></script></body>',1)
 page.write_text(t,encoding="utf-8")
 edited+=1
assert edited>=1
if a.app=="one":
 # Existing v65.45 display percentage used global HTML zoom.
 # At 50% that causes mobile drawer and overlays to clip into half-width layouts.
 # Keep its public control API and stored preference, but scale interface components via CSS variable.
 f=out/"zavi-display-settings-v6545.js"
 s=f.read_text(encoding="utf-8")
 old="document.documentElement.style.zoom=String(percent/100);"
 new="document.documentElement.style.removeProperty('zoom');\n document.documentElement.style.setProperty('--z86-ui-scale',String(percent/100));"
 assert s.count(old)==1,(str(f),s.count(old))
 f.write_text(s.replace(old,new),encoding="utf-8")
 assert "window.ZaviDisplayScale=" in s
 manifest=out/"zavi-unified20-manifest.json"
 m=json.loads(manifest.read_text(encoding="utf-8"));assert len(m["profiles"])==20
 m["design_version"]="65.86-three-sizes-viewport-safe"
 manifest.write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding="utf-8")
else:
 f=out/"zavi-admin-v1424-allfix.js"
 assert f.is_file() and "z424-scale-range" in f.read_text(encoding="utf8")
ix=(out/"index.html").read_text(encoding="utf8")
assert ix.count("zavi-three-sliders-v6586.css")==1
assert ix.count("zavi-three-sliders-v6586.js")==1
assert ix.index("zavi-unified-navigation-v6585.css")<ix.index("zavi-three-sliders-v6586.css")
assert ix.index("zavi-three-sliders-v6586.js")>ix.index("zavi-unified-v6584.js")
print("PASS triple independent scale controls",a.app,"pages",edited)

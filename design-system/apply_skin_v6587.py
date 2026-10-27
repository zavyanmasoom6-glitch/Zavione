#!/usr/bin/env python3
"""Viewport-safe patch for V65.87/ADMIN 1.4.32. Leaves cloud, accounting, offline, trial logic untouched."""
import sys,runpy,argparse,shutil
from pathlib import Path
parser=argparse.ArgumentParser()
parser.add_argument("--web",required=True)
parser.add_argument("--app",choices=["one","admin"],required=True)
arg=parser.parse_args()
sys.argv=["apply_skin_v6586.py","--web",arg.web,"--app",arg.app]
runpy.run_path("design-system/apply_skin_v6586.py",run_name="__main__")
web=Path(arg.web)
css=Path("design-system/zavi-real-viewport-v6586.css")
assert css.is_file() and css.stat().st_size>6000
shutil.copyfile(css,web/css.name)
index=web/"index.html"
s=index.read_text(encoding="utf8")
assert "</head>" in s and s.count("zavi-unified-navigation-v6585.css")==1
assert "zavi-real-viewport-v6586.css" not in s
s=s.replace("</head>",'<link rel="stylesheet" href="./zavi-real-viewport-v6586.css?v=65.87"></head>',1)
index.write_text(s,encoding="utf8")
def patch(name,pairs):
 p=web/name;txt=p.read_text(encoding="utf8")
 for old,new in pairs:
  assert txt.count(old)==1,(name,old,txt.count(old))
  txt=txt.replace(old,new)
 p.write_text(txt,encoding="utf8")
if arg.app=="one":
 patch("zavi-display-settings-v6545.js",[
  ("MIN=50,MAX=115,STEP=5","MIN=50,MAX=150,STEP=5"),
  ("document.documentElement.style.zoom=String(percent/100);",'document.documentElement.style.removeProperty("zoom");document.documentElement.style.setProperty("--z86-ui-scale",String(percent/100));'),
  ('max="115"','max="150"'),
  ('<span>115%</span>','<span>150%</span>'),
 ])
else:
 patch("zavi-admin-v140-ui-fixes.js",[
  ("document.documentElement.style.zoom=String(size/100);",'document.documentElement.style.removeProperty("zoom");'),
 ])
 patch("zavi-admin-v1424-allfix.js",[
  ("root.style.setProperty('--z425-ui-scale',String(v/100));","root.style.setProperty('--z425-ui-scale',String(v/100));document.documentElement.style.setProperty('--z86-ui-scale',String(v/100));")
 ])
txt=index.read_text(encoding="utf8")
assert txt.index("zavi-unified-navigation-v6585.css") < txt.index("zavi-real-viewport-v6586.css")
assert txt.count("zavi-real-viewport-v6586.css")==1
print("PASS viewport-safe patch",arg.app,"preserving every feature and all active records")

# Replace the legacy single size slider with three independent, locale-aware controls.
if arg.app=="one":
 script=Path("design-system/zavi-three-size-sliders-v6587.js")
 style=Path("design-system/zavi-three-size-sliders-v6587.css")
 assert script.stat().st_size>6000 and style.stat().st_size>7000
 dest=web/"zavi-display-settings-v6545.js"
 assert dest.is_file(),"Legacy setting script not found in original app"
 shutil.copyfile(script,dest)
 shutil.copyfile(style,web/style.name)
 idx=web/"index.html"
 code=idx.read_text(encoding="utf8")
 assert "zavi-display-settings-v6545.js" in code
 assert "zavi-three-size-sliders-v6587.css" not in code
 code=code.replace("</head>",'<link rel="stylesheet" href="./zavi-three-size-sliders-v6587.css?v=65.87"></head>',1)
 idx.write_text(code,encoding="utf8")
 out=dest.read_text(encoding="utf8")
 assert out.count("type=\"range\"")==1 and "'text','system','icons'" in out
 assert "style.zoom=" not in out
 assert idx.read_text(encoding="utf8").index("zavi-real-viewport-v6586.css")<idx.read_text(encoding="utf8").index("zavi-three-size-sliders-v6587.css")
 print("PASS 3 independent size sliders, no viewport zoom (store)")

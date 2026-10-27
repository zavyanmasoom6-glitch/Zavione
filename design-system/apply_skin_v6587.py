#!/usr/bin/env python3
"""ZAVI ONE 65.87: stage original 65.86 then replace single control with three sliders."""
import sys,runpy,argparse,shutil
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument("--web",required=True)
p.add_argument("--app",choices=["one","admin"],required=True)
arg=p.parse_args()
sys.argv=["apply_skin_v6586.py","--web",arg.web,"--app",arg.app]
runpy.run_path("design-system/apply_skin_v6586.py",run_name="__main__")
web=Path(arg.web)
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

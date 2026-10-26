#!/usr/bin/env python3
"""ZAVI ONE ADMIN 1.4.22 QA: complete original owner-only app, 1.4.21 trial UI, 1.4.22 mobile repair.
All data/auth/billing device permissions are untouched.
"""
import argparse,zipfile,shutil,json
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument("--apk",required=True)
p.add_argument("--web",required=True)
args=p.parse_args()
out=Path(args.web);out.mkdir(parents=True,exist_ok=True)
count=0
with zipfile.ZipFile(args.apk) as z:
 for item in z.infolist():
  if item.is_dir() or not item.filename.startswith("assets/"):continue
  path=Path(item.filename).relative_to("assets")
  if not path.parts or path.is_absolute() or ".." in path.parts:raise ValueError("unsafe APK entry")
  if path.parts[0] in ("META-INF","dexopt"):continue
  target=out/path;target.parent.mkdir(parents=True,exist_ok=True)
  target.write_bytes(z.read(item.filename));count+=1
assert count>=90,count
for needed in ("index.html","app.js","account-control.js","admin-portal.js",
               "zavi-v6572-admin-trial7.js","zavi-v6570-admin-offline.js","zavi-admin-industry-overview.js"):
 assert (out/needed).is_file(),needed
for asset in ("admin-v1421-compact.js","admin-v1421-compact.css",
              "admin-v1422-mobile-fix.js","admin-v1422-mobile-fix.css"):
 shutil.copy2(Path("industry-build")/asset,out/("zavi-"+asset))
index=out/"index.html"
text=index.read_text(encoding="utf8")
assert "</head>" in text and "</body>" in text
assert "zavi-admin-v1421-compact.js" not in text
assert "zavi-admin-v1422-mobile-fix.js" not in text
assert "zavi-v6572-admin-trial7.js" in text
# Prevent legacy 50%-view localStorage from disrupting mobile before any older app scripts execute.
early='''<script id="zavi1422-early-mobile-viewport">try{if(window.matchMedia("(max-width:800px)").matches){localStorage.setItem("zavi_admin_ui_scale_v140","100");document.documentElement.style.zoom="1";document.documentElement.dataset.zaviAdminSize="100";}}catch(e){}</script>'''
styles=('''<link rel="stylesheet" href="./zavi-admin-v1421-compact.css?v=1.4.21">'''
        '''<link rel="stylesheet" href="./zavi-admin-v1422-mobile-fix.css?v=1.4.22">''')
text=text.replace("</head>",early+styles+"</head>",1)
scripts=('''<script defer src="./zavi-admin-v1421-compact.js?v=1.4.21"></script>'''
         '''<script defer src="./zavi-admin-v1422-mobile-fix.js?v=1.4.22"></script>''')
at=text.rfind("</body>")
text=text[:at]+scripts+text[at:]
index.write_text(text,encoding="utf8")
metadata={
 "version":"1.4.22-mobile-i18n-qa","source":"SHA256-checked 1.4.20 admin APK",
 "preserved":["central owner authentication","server-side billing and RLS","offline device licensing","signed subscription extension RPC","20 industry console"],
 "changed":["mobile 100 percent base scale","60px compact single-line header","direction-aware scrollable drawer",
            "English/Dari/Pashto sidebar labels","English solar month names","contrasting simple dashboards"],
 "signature":"temporary QA, not certified production signing",
 "validation":"Build, package and syntax checks only; device and end-to-end server tests required"
}
(out/"zavi-admin-v1422-manifest.json").write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding="utf8")
print("ADMIN 1.4.22 staged",count,"original asset files")

#!/usr/bin/env python3
"""ZAVI ONE ADMIN 1.4.23 QA: complete original owner-only app, 1.4.21 trial UI, 1.4.23 mobile repair.
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
early='''<script id="zavi1422-early-mobile-viewport">try{if(window.matchMedia("(max-width:800px)").matches){/* preserve user-selected 50–150% scale */document.documentElement.style.zoom="1";document.documentElement.dataset.zaviAdminSize="100";}}catch(e){}</script>'''
styles=('''<link rel="stylesheet" href="./zavi-admin-v1421-compact.css?v=1.4.21">'''
        '''<link rel="stylesheet" href="./zavi-admin-v1422-mobile-fix.css?v=1.4.23">''')
text=text.replace("</head>",early+styles+"</head>",1)
scripts=('''<script defer src="./zavi-admin-v1421-compact.js?v=1.4.21"></script>'''
         '''<script defer src="./zavi-admin-v1422-mobile-fix.js?v=1.4.23"></script>''')
at=text.rfind("</body>")
text=text[:at]+scripts+text[at:]
# Load permanent subscriptions UI last; original database and auth code unchanged.
for asset in ("admin-v1423-lifetime.js","admin-v1423-lifetime.css"):
 shutil.copy2(Path("industry-build")/asset,out/("zavi-"+asset))
text=text.replace("</head>",'<link rel="stylesheet" href="./zavi-admin-v1423-lifetime.css?v=1.4.23"></head>',1)
pos=text.rfind("</body>")
text=text[:pos]+'<script defer src="./zavi-admin-v1423-lifetime.js?v=1.4.23"></script>'+text[pos:]
assert text.count("zavi-admin-v1423-lifetime.js")==1
# 1.4.24 fixes all known Admin mobile issues and restores the 50–150% zoom UI.
for asset in ("admin-v1424-allfix.js","admin-v1424-allfix.css"):
 shutil.copy2(Path("industry-build")/asset,out/("zavi-"+asset))
text=text.replace("</head>",'<link rel="stylesheet" href="./zavi-admin-v1424-allfix.css?v=1.4.24"></head>',1)
pos=text.rfind("</body>")
text=text[:pos]+'<script defer src="./zavi-admin-v1424-allfix.js?v=1.4.24"></script>'+text[pos:]
assert "zavi-admin-v1424-allfix.js" in text
# V1.4.25: apply responsive typography after all previous CSS layers.
shutil.copy2(Path("industry-build")/"admin-v1425-safe-scale.css",out/"zavi-admin-v1425-safe-scale.css")
text=text.replace("</head>",'<link rel="stylesheet" href="./zavi-admin-v1425-safe-scale.css?v=1.4.25"></head>',1)
assert "zavi-admin-v1425-safe-scale.css" in text
# V1.4.26: drawer CSS must load LAST to override safe-scale transform:none.
for asset in ("admin-v1426-drawer.js","admin-v1426-drawer.css"):
 shutil.copy2(Path("industry-build")/asset,out/("zavi-"+asset))
text=text.replace("</head>",'<link rel="stylesheet" href="./zavi-admin-v1426-drawer.css?v=1.4.26"></head>',1)
pos=text.rfind("</body>")
text=text[:pos]+'<script defer src="./zavi-admin-v1426-drawer.js?v=1.4.26"></script>'+text[pos:]
assert text.index("zavi-admin-v1425-safe-scale.css")<text.index("zavi-admin-v1426-drawer.css")
assert "zavi-admin-v1426-drawer.js" in text
# v1.4.27: load high-contrast trial modal CSS after all prior theme styles.
shutil.copy2(Path("industry-build")/"admin-v1427-trial-date.css",out/"zavi-admin-v1427-trial-date.css")
text=text.replace("</head>",'<link rel="stylesheet" href="./zavi-admin-v1427-trial-date.css?v=1.4.27"></head>',1)
assert text.index('zavi-admin-v1426-drawer.css')<text.index('zavi-admin-v1427-trial-date.css')
assert "zavi_admin_preview_trial_7days" in (out/"zavi-admin-v1421-compact.js").read_text()
index.write_text(text,encoding="utf8")
metadata={
 "version":"1.4.27-trial7-fixed-qa","source":"SHA256-checked 1.4.20 admin APK",
 "preserved":["central owner authentication","server-side billing and RLS","offline device licensing","signed subscription extension RPC","20 industry console"],
 "changed":["server-sourced current trial expiry and next seven-day end in Dari/Pashto/English","clear no-current-subscription state","high contrast trial modal light and dark","functional mobile navigation close with overlay and Escape","restored hide/show drawer translateX after responsive layout","device-safe typography and spacing only; no full-app zoom or inverse width","60px compact single-line header","independent secure lifetime subscription manager","direction-aware scrollable drawer",
            "English/Dari/Pashto sidebar labels","English solar month names","contrasting simple dashboards"],
 "signature":"temporary QA, not certified production signing",
 "validation":"Build, package and syntax checks only; device and end-to-end server tests required"
}
(out/"zavi-admin-v1422-manifest.json").write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding="utf8")
print("ADMIN 1.4.27 staged",count,"original asset files")

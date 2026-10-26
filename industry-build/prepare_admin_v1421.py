#!/usr/bin/env python3
"""Repackage the verified 1.4.20 owner-only ADMIN assets with 1.4.21 design fixes.
Does not change auth, RLS, billing, device permission or transaction code.
"""
import argparse,zipfile,json,shutil
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument("--apk",required=True);p.add_argument("--web",required=True)
a=p.parse_args();out=Path(a.web);out.mkdir(parents=True,exist_ok=True)
count=0
with zipfile.ZipFile(a.apk) as package:
 for entry in package.infolist():
  if entry.is_dir() or not entry.filename.startswith("assets/"):continue
  rel=Path(entry.filename).relative_to("assets")
  if not rel.parts or ".." in rel.parts or rel.is_absolute():raise ValueError("Invalid APK asset")
  if rel.parts[0] in ("dexopt","META-INF"):continue
  dest=out/rel;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(package.read(entry.filename));count+=1
assert count>=90,count
required=("index.html","app.js","account-control.js","admin-portal.js",
 "zavi-v6572-admin-trial7.js","zavi-v6570-admin-offline.js",
 "zavi-admin-industry-overview.js")
for x in required:assert (out/x).is_file(),x
shutil.copy2("industry-build/admin-v1421-compact.js",out/"zavi-admin-v1421-compact.js")
shutil.copy2("industry-build/admin-v1421-compact.css",out/"zavi-admin-v1421-compact.css")
index=out/"index.html";s=index.read_text(encoding="utf-8")
assert "</head>" in s and "</body>" in s
assert "zavi-admin-v1421-compact.js" not in s
assert "zavi-v6572-admin-trial7.js" in s
s=s.replace("</head>",'<link rel="stylesheet" href="./zavi-admin-v1421-compact.css?v=1.4.21"></head>',1)
at=s.rfind("</body>")
s=s[:at]+'<script defer src="./zavi-admin-v1421-compact.js?v=1.4.21"></script>'+s[at:]
index.write_text(s,encoding="utf-8")
(out/"zavi-admin-v1421-build-info.json").write_text(json.dumps({
 "version":"1.4.21-qa","base":"1.4.20 20 industry central admin QA",
 "preserved":["existing real owner authentication","server-side billing RLS","offline permission controls","7-day trial RPC"],
 "updated":["compact mobile topbar","separate seven-day trial modal","Afghan solar Hijri and Gregorian dates","contrast and layout"],
 "qa":True,"not_production_signed":True},ensure_ascii=False,indent=2),encoding="utf-8")
print("ADMIN 1.4.21 staged",count,"assets; source security retained")

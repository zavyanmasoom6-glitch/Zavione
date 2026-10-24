/* Additive professional-service WhatsApp integration for ZAVI ONE ADMIN 1.3.8.
   Based on service module already present in the APK provided by user.
   The modal and its sidebar shortcut from V1.3.6 are deliberately removed. */
import fs from 'node:fs';
import path from 'node:path';
const root=process.argv[2],mode=process.argv[3];
if(!root||!['one','admin'].includes(mode))throw Error('Usage: patch-admin-service-v138.mjs assets admin');
if(mode!=='admin'){console.log('No changes to ZAVI ONE storefront');process.exit(0)}
const dst=f=>path.join(root,f),read=f=>fs.readFileSync(dst(f),'utf8');
let html=read('index.html');
const oldScript=/<script\b[^>]*\bsrc\s*=\s*["'][^"']*zavi-admin-contact-v6547\.js[^"']*["'][^>]*>\s*<\/script>/gi;
if(!html.includes('zavi-admin-contact-v6547.js'))throw Error('Previous standalone modal not located');
html=html.replace(oldScript,'');
if(html.includes('zavi-admin-contact-v6547.js'))throw Error('Old modal reference remains');
fs.rmSync(dst('zavi-admin-contact-v6547.js'),{force:true});
const service=read('zavi-admin-services-v15.js');
const required=['مرکز خدمات حرفه‌ای و پیگیری','zaviServiceCenter','zsvc-shortcuts','paintRows','openDesk'];
for(const key of required)if(!service.includes(key))throw Error('Existing professional services feature changed: '+key);
const newName='zavi-admin-services-whatsapp-v138.js';
fs.copyFileSync(new URL('./'+newName,import.meta.url),dst(newName));
const tag='<script defer src="./'+newName+'?v=1.3.8"></script>';
if(!html.includes(newName)){
 if(html.includes('</body>'))html=html.replace('</body>',tag+'</body>');
 else throw Error('Missing closing body in ADMIN');
}
fs.writeFileSync(dst('index.html'),html);
if(!read('index.html').includes('zavi-admin-services-v15.js'))throw Error('Existing service module is missing');
console.log('ADMIN 1.3.8: original service center preserved; standalone contact popup removed; WhatsApp integrated');

/* ZAVI ONE ADMIN V1.4.22 — mobile navigation, locale consistency and display-scale guard.
   View-only UI; all owner-only API checks, RLS and subscription writes remain in original app. */
(()=>{'use strict';
 const q=(s,r=document)=>r.querySelector(s),shell=()=>q('#appScreen');
 const key='zavi_admin_ui_scale_v140';
 const locale=()=>{const v=String(q('#zaviAdminLanguage')?.value||document.documentElement.lang||'fa-AF').toLowerCase();return v.startsWith('en')?'en':v.startsWith('ps')?'ps':'fa'};
 const nav={
  overview:{fa:'داشبورد',en:'Dashboard',ps:'اصلي پاڼه'},
  customers:{fa:'فروشگاه‌ها و اشتراک‌ها',en:'Stores and subscriptions',ps:'دوکانونه او ګډونونه'},
  devices:{fa:'دستگاه‌های مشتریان',en:'Customer devices',ps:'د پېرودونکو وسيلې'},
  support:{fa:'پشتیبانی و تیکت‌ها',en:'Support and tickets',ps:'ملاتړ او ټيکټونه'},
  payments:{fa:'سوابق تمدید',en:'Renewal history',ps:'د تمدید تاریخچه'},
  finance:{fa:'حسابداری درآمد',en:'Revenue accounting',ps:'د عایداتو حسابداري'},
  activity:{fa:'پیگیری و فعالیت‌ها',en:'Follow-ups and activity',ps:'تعقیب او فعالیتونه'},
  health:{fa:'وضعیت سیستم',en:'System health',ps:'د سيستم روغتيا'},
  brand:{fa:'مدیریت برند',en:'Brand management',ps:'د نښې مدیریت'},
  security:{fa:'امنیت و دسترسی',en:'Security and access',ps:'امنیت او لاسرسی'},
  settings:{fa:'تنظیمات',en:'Settings',ps:'تنظیمات'}
 };
 const extra={
  '#z421-trial-entry':{fa:'تمدید آزمایشی ۷ روزه',en:'7-day free trial extension',ps:'د ۷ ورځو وړیا غځونه'},
  '#z73-launch':{fa:'مدیریت نسخه‌های تخصصی',en:'Industry editions',ps:'د صنفونو ځانګړې بڼې'}
 };
 const headlines=[
  {fa:['مدیریت مرکزی فروشگاه‌ها','د پلورنځیو مرکزي مدیریت'],en:'Central store management',ps:'د دوکانونو مرکزي مدیریت'},
  {fa:['فروشگاه‌ها، تمدید اشتراک، دستگاه‌ها و پشتیبانی در یک محیط امن'],en:'Stores, subscriptions, devices and support in one secure place',ps:'دوکانونه، ګډونونه، وسيلې او ملاتړ په يو خوندي ځای کې'},
  {fa:['پنل اختصاصی مالک اصلی · Z1 ADMIN'],en:'OWNER-ONLY CENTRAL ADMIN',ps:'د مرکزي مالک ځانګړی پینل'},
  {fa:['مدیریت نسخه‌های تخصصی'],en:'Industry edition management',ps:'د صنفونو بڼو مدیریت'}
 ];
 const mobile=()=>window.matchMedia?.('(max-width:800px)').matches===true;
 let lastLocale='',scheduled=false,lastStamp='';
 function guardScale(){
  if(!mobile())return;
  try{if(localStorage.getItem(key)!=='100')localStorage.setItem(key,'100')}catch(_){}
  const root=document.documentElement;
  if(root.style.zoom!=='1')root.style.zoom='1';
  root.dataset.zaviAdminSize='100';
  root.style.setProperty('--zavi-admin-reciprocal-scale','1');
  const output=q('#zavi140Size');
  if(output){const slider=q('#zavi140Range',output);if(slider&&slider.value!=='100')slider.value='100';
   const val=q('#zavi140Output',output);if(val&&val.textContent!=='100%')val.textContent='100%'}
 }
 function currentLanguage(){
  const l=locale();
  if(l!==lastLocale){
   lastLocale=l;
   document.documentElement.lang=l==='fa'?'fa-AF':l==='ps'?'ps-AF':'en';
   document.documentElement.dir=l==='en'?'ltr':'rtl';
   document.documentElement.dataset.zaviLang=document.documentElement.lang;
   document.body?.classList.remove('mobile-drawer');
  }
  return l;
 }
 function markStatic(el,txt){
  if(!el)return;
  if(el.dataset.z422Label===txt)return;
  el.dataset.z422Label=txt;
  el.setAttribute('data-no-translate','true');
  // Preserve icon SPAN; replace only direct non-icon text nodes.
  for(const node of Array.from(el.childNodes))if(node.nodeType===Node.TEXT_NODE)node.remove();
  el.append(document.createTextNode(' '+txt));
 }
 function translateNavigation(){
  const app=shell();if(!app||app.hidden)return;
  const l=currentLanguage();
  for(const btn of app.querySelectorAll('.sidebar .nav button[data-page]')){
   const entry=nav[btn.dataset.page];if(entry)markStatic(btn,entry[l]);
  }
  const active=app.querySelector('.sidebar .nav button[data-page].selected');
  const crumb=q('#pageCrumb');
  if(crumb&&nav[active?.dataset?.page]){
   const text=nav[active.dataset.page][l];
   if(crumb.textContent!==text)crumb.textContent=text;
   crumb.setAttribute('data-no-translate','true');
  }
  for(const [sel,m] of Object.entries(extra)){const b=q(sel,app);if(b)markStatic(b,m[l])}
  const sep=q('.sidebar-caption',app);
  if(sep){const str=({fa:'پنل اختصاصی مدیریت مرکزی',en:'Private central administration',ps:'د مرکزي ادارې ځانګړی پینل'})[l];if(sep.textContent!==str)sep.textContent=str;sep.setAttribute('data-no-translate','true')}
  const pop=q('#zaviAdminLanguage');
  if(pop){
   pop.setAttribute('aria-label',l==='en'?'Language':l==='ps'?'ژبه':'زبان');
   for(const [val,label] of [['fa-AF','دری'],['ps-AF','پښتو'],['en','English']]){
    const opt=Array.from(pop.options||[]).find(o=>o.value===val);
    if(opt&&opt.textContent!==label){opt.textContent=label;opt.setAttribute('data-no-translate','true')}
   }
  }
 }
 function translateHeads(){
  const app=shell();if(!app||app.hidden)return;
  const l=locale();
  for(const e of app.querySelectorAll('#view .admin-hero h2,#view .admin-hero p,#view .admin-hero-kicker,#view .panel-heading h2')){
   const original=e.dataset.z422Source||e.textContent?.trim();
   if(!original)continue;
   if(!e.dataset.z422Source)e.dataset.z422Source=original;
   const entry=headlines.find(row=>(row.fa.includes(original)||row.en===original||row.ps===original));
   if(!entry)continue;
   const text=entry[l];if(e.textContent!==text)e.textContent=text;
   e.setAttribute('data-no-translate','true');
  }
 }
 function fixEnglishDate(){
  if(locale()!=='en')return;
  // Only date captions that this version created; existing financial timestamps untouched.
  const d=q('#z421-date-info');if(!d)return;
  const today=d.querySelector('.z421-today-label');
  if(today&&today.textContent!=='Today'){today.textContent='Today';today.setAttribute('data-no-translate','true')}
  const solar=q('#z421-date-info strong');if(solar&&solar.textContent&&/[\u0600-\u06ff]/.test(solar.textContent)){
   try{
    const en=new Intl.DateTimeFormat('en-u-ca-persian',{timeZone:'Asia/Kabul',year:'numeric',month:'long',day:'numeric'}).format(new Date());
    if(solar.textContent!==en)solar.textContent=en;
   }catch(_){}
  }
 }
 function closeDrawer(){
  if(!document.body.classList.contains('mobile-drawer'))return;
  document.body.classList.remove('mobile-drawer');
  q('#mobileMenu')?.setAttribute('aria-expanded','false');
 }
 function installListeners(){
  document.addEventListener('click',e=>{
   if(!document.body.classList.contains('mobile-drawer'))return;
   if(e.target.closest('#appScreen .sidebar [data-page],#appScreen .sidebar .z421-trial-entry,#appScreen .sidebar .z421-nav-entry')){
     closeDrawer();return;
   }
   if(e.target.closest('#appScreen .workspace')&&!e.target.closest('#mobileMenu'))closeDrawer();
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
  document.addEventListener('input',e=>{
   if(!mobile()||e.target?.id!=='zavi140Range')return;
   // The older 50% zoom control causes broken mobile geometry. Force 100% on small screens.
   e.stopImmediatePropagation();
   e.target.value='100';
   guardScale();
  },true);
  q('#zaviAdminLanguage')?.addEventListener('change',()=>{
   lastLocale='';
   requestAnimationFrame(()=>{guardScale();sync();window.ZaviLocaleV22?.refresh?.()});
  });
  window.addEventListener('resize',()=>{guardScale();sync()});
  document.addEventListener('zavi:language-changed',()=>{lastLocale='';sync()});
  window.addEventListener('pageshow',guardScale);
 }
 function sync(){
  const app=shell();if(!app||app.hidden)return;
  guardScale();
  translateNavigation();
  translateHeads();
  fixEnglishDate();
  app.dataset.z422Compact='1';
 }
 function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;sync()});
 }
 function start(){
  guardScale();
  installListeners();
  const app=shell();
  if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
  new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir','data-zavi-lang']});
  sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
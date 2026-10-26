/* ZAVI ONE ADMIN 1.4.24 — all requested mobile layout, safe zoom and language fixes.
 * UI-only; owner checks and lifetime subscription RPCs remain unchanged. */
(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s),all=(s,r=document)=>[...r.querySelectorAll(s)];
const $=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el};
const lang=()=>{let v=(q('#zaviAdminLanguage')?.value||document.documentElement.lang||'fa-AF').toLowerCase();return v.startsWith('en')?'en':v.startsWith('ps')?'ps':'fa'};
const store='zavi_admin_ui_scale_v140';
function setting(){try{const raw=parseInt(localStorage.getItem(store)||'100',10);return Math.max(50,Math.min(150,Math.round((raw||100)/5)*5))}catch(_){return 100}}
function zoomUI(amount){
 const raw=Number(amount);
 const v=Math.min(150,Math.max(50,Number.isFinite(raw)?Math.round(raw/5)*5:100));
 const root=q('#appScreen');if(!root)return;
 /* NEVER scale/zoom the application wrapper. At non-100% zoom it changes the
  * layout viewport, clips fixed headers and cuts the contents in half on phones.
  * Instead scale only text, cards and controls via inherited CSS variables. */
 for(const prop of ['zoom','width','max-width','min-width','transform','transform-origin'])root.style.removeProperty(prop);
 root.style.setProperty('--z425-ui-scale',String(v/100));
 root.style.setProperty('--z425-ui-size',String(v));
 root.dataset.z424Scale=String(v);
 root.dataset.z425Enlarged=v>=125?'true':'false';
 document.documentElement.style.removeProperty('zoom');
 try{localStorage.setItem(store,String(v))}catch(_){}
 const value=q('#z424-scale-value');
 if(value&&value.textContent!==v+'%')value.textContent=v+'%';
 const range=q('#z424-scale-range');
 if(range&&Number(range.value)!==v)range.value=String(v);
}

const labels={
 fa:{header:'اندازه نمایش',caption:'از ۵۰٪ تا ۱۵۰٪، بدون حذف هیچ بخش یا امکاناتی',normal:'بازگشت به ۱۰۰٪',options:'زبان برنامه',dari:'دری',pashto:'پشتو',english:'English'},
 en:{header:'Display size',caption:'50% to 150%; all features remain accessible',normal:'Reset to 100%',options:'App language',dari:'Dari',pashto:'Pashto',english:'English'},
 ps:{header:'د ښودلو اندازه',caption:'له ۵۰٪ تر ۱۵۰٪؛ ټولې برخې خوندي دي',normal:'۱۰۰٪ ته ستنېدل',options:'د پروګرام ژبه',dari:'دري',pashto:'پښتو',english:'English'}
};
function settingsOpen(){
 const selected=q('#appScreen .nav-item.selected');const page=selected?.dataset.page;
 return page==='settings'||q('#view .admin-settings')!==null||!!q('#view #zavi140Size');
}
function sizeControl(){
 if(!settingsOpen()){q('#z424-size-card')?.remove();return}
 const view=q('#appScreen #view');if(!view)return;
 let card=q('#z424-size-card');
 const tr=labels[lang()];
 if(!card){
  card=$('section','z424-size-card');card.id='z424-size-card';
  const head=$('div','z424-size-top');
  const h=$('h3','z424-size-title');h.id='z424-size-title';
  const output=$('strong','z424-size-current');output.id='z424-scale-value';
  head.append(h,output);
  const hint=$('p','z424-size-caption');hint.id='z424-size-caption';
  const range=$('input');range.id='z424-scale-range';range.type='range';range.min='50';range.max='150';range.step='5';range.value=String(setting());range.setAttribute('aria-label','Display size');
  range.addEventListener('input',()=>zoomUI(range.value));
  const limits=$('div','z424-limits');limits.append($('span','','50%'),$('span','','100%'),$('span','','150%'));
  const normal=$('button','z424-reset');normal.id='z424-size-reset';normal.type='button';normal.addEventListener('click',()=>zoomUI(100));
  card.append(head,hint,range,limits,normal);
  view.prepend(card);
 }
 const set=(selector,text)=>{const n=q(selector);if(n&&n.textContent!==text)n.textContent=text};
 set('#z424-size-title',tr.header);
 set('#z424-size-caption',tr.caption);
 set('#z424-size-reset',tr.normal);
 set('#z424-scale-value',setting()+'%');
}
let popup=null;
function closePopup(){popup?.remove();popup=null;q('#z424-lang-button')?.setAttribute('aria-expanded','false')}
function langUI(){
 const sel=q('#zaviAdminLanguage');if(!sel)return;
 let button=q('#z424-lang-button'),wrap=sel.closest('.zavi-language-switch');
 if(!wrap)return;
 const tr=labels[lang()];
 if(!button){
  button=$('button','z424-language-button');button.id='z424-lang-button';button.type='button';
  button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');
  button.addEventListener('click',()=>{
   if(popup){closePopup();return}
   const r=button.getBoundingClientRect();
   const l=lang();
   popup=$('div','z424-lang-list');popup.setAttribute('role','listbox');popup.setAttribute('aria-label',labels[l].options);
   const entries=[['fa-AF',labels[l].dari],['ps-AF',labels[l].pashto],['en',labels[l].english]];
   for(const [value,name] of entries){
    const opt=$('button','z424-lang-option',name);opt.type='button';opt.setAttribute('role','option');
    opt.setAttribute('aria-selected',sel.value===value?'true':'false');
    opt.addEventListener('click',()=>{
     closePopup();
     if(sel.value!==value){
      sel.value=value;
      sel.dispatchEvent(new Event('input',{bubbles:true}));
      sel.dispatchEvent(new Event('change',{bubbles:true}));
     }
     requestAnimationFrame(run);
    });
    popup.append(opt);
   }
   document.body.append(popup);
   const pW=Math.min(184,window.innerWidth-24);
   const left=Math.min(Math.max(12,r.left),window.innerWidth-pW-12);
   popup.style.width=pW+'px';
   popup.style.left=left+'px';
   popup.style.top=Math.min(r.bottom+5,window.innerHeight-popup.offsetHeight-12)+'px';
   button.setAttribute('aria-expanded','true');
  });
  wrap.append(button);
  document.addEventListener('click',e=>{if(popup&&!e.target.closest('#z424-lang-list,#z424-lang-button'))closePopup()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closePopup()});
 }
 button.textContent=sel.value==='en'?'English':sel.value==='ps-AF'?'پښتو':'دری';
 button.setAttribute('aria-label',tr.options);
}
let toolMenu=null;
function closeTools(){toolMenu?.remove();toolMenu=null;q('#z424-tools')?.setAttribute('aria-expanded','false')}
function topTools(){
 const row=q('#appScreen .topbar .top-right');if(!row)return;
 let btn=q('#z424-tools');
 if(!btn){
  btn=$('button','z424-tools','⋯');btn.id='z424-tools';btn.type='button';
  btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-haspopup','menu');
  row.append(btn);
  btn.addEventListener('click',()=>{
   if(toolMenu){closeTools();return}
   const l=lang();
   const words=l==='en'?['Refresh','Light / dark theme','Industry editions','7-day trial','Close']:
    l==='ps'?['نوی کول','روښانه / تياره','د سوداګرۍ بڼې','۷ ورځنی ازموينه','بندول']:
    ['تازه‌سازی','حالت روشن / تاریک','نسخه‌های تخصصی','تمدید آزمایشی ۷روزه','بستن'];
   toolMenu=$('div','z424-tools-menu');toolMenu.setAttribute('role','menu');
   const targets=['#refreshBtn','#z11ThemeToggle','#z73-launch','#z421-trial-entry',null];
   targets.forEach((selector,i)=>{
    const item=$('button','z424-tools-entry',words[i]);item.type='button';item.setAttribute('role','menuitem');
    item.addEventListener('click',()=>{
     closeTools();
     if(!selector)return;
     const target=q(selector);if(target)target.click();
     else if(i===2)q('.sidebar .nav .z421-nav-entry')?.click();
    });
    toolMenu.append(item);
   });
   document.body.append(toolMenu);
   const rect=btn.getBoundingClientRect();
   toolMenu.style.left=Math.max(8,Math.min(window.innerWidth-202,rect.left-150))+'px';
   toolMenu.style.top=Math.min(window.innerHeight-240,rect.bottom+5)+'px';
   btn.setAttribute('aria-expanded','true');
  });
  document.addEventListener('click',e=>{if(toolMenu&&!e.target.closest('#z424-tools,#z424-tools-menu'))closeTools()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTools()});
 }
 btn.setAttribute('aria-label',lang()==='en'?'More tools':lang()==='ps'?'نور وسایل':'ابزارهای بیشتر');
}
function tables(){
 const view=q('#view');if(!view)return;
 for(const table of all('table',view)){
  if(table.classList.contains('z424-responsive-table'))continue;
  const cols=all('thead th',table).map(x=>x.textContent.trim());if(cols.length<2)continue;
  for(const row of all('tbody tr',table)){
   const cells=all('td',row);cells.forEach((cell,i)=>{if(!cell.dataset.z424Label)cell.dataset.z424Label=cols[i]||''});
  }
  table.classList.add('z424-responsive-table');
 }
}
const phrases={
 'اشتراک فعال':'Active subscription',
 'فروشگاه‌ها':'Stores',
 'فعال':'Active',
 'منقضی':'Expired',
 'معلق':'Suspended',
 'بدون اشتراک':'No subscription',
 'نزدیک انقضا':'Expiring soon',
 'همه':'All',
 'اشتراک':'Subscription',
 'فروشگاه':'Store',
 'تاریخ و مدت':'Dates and duration',
 'حساب‌های مشتریان':'Customer accounts',
 'مدیریت امن مجوزهای آفلاین':'Secure offline permission management',
 'مرکز خدمات حرفه‌ای و پیگیری':'Professional services and support',
 'برای هر فروشگاه 180 یا 365 روز اجازه بدهید. مدت واقعی از پایان اشتراک بیشتر نمی‌شود.':'Allow 180 or 365 days per store. Real duration never exceeds subscription expiry.',
 'مدیریت مرکزی فروشگاه‌ها':'Central store management',
 'مدیریت فروشگاه‌ها':'Manage stores',
 'مجوزهای آفلاین':'Offline permissions',
 'تمدید آزمایشی ۷ روزه':'7-day trial extension',
 'تمدید اشتراک':'Renew subscription',
 'بازگشت':'Back',
 'فاکتور و رسید':'Invoices and receipts',
 'راهنمای خدمات و امنیت':'Services and security guide'
};
function translate(){
 const view=q('#appScreen #view');if(!view||lang()!=='en')return;
 // Only known interface labels. Never touch store names, email, receipts or user-authored text.
 const walker=document.createTreeWalker(view,NodeFilter.SHOW_TEXT),nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){
  const e=node.parentElement;
  if(!e||e.closest('input,textarea,select,option,[contenteditable],.store-name,.customer-name,[data-workspace-id],.store-title,.admin-store-name,[data-no-translate]'))continue;
  if(!e.closest('th,button,label,h1,h2,h3,h4,.pill,.badge,.status,.admin-hero-kicker'))continue;
  const old=node.textContent.trim();if(!phrases[old])continue;
  node.textContent=node.textContent.replace(old,phrases[old]);
 }
}
let busy=false;
function run(){
 if(busy)return;
 busy=true;
 try{
  zoomUI(setting());sizeControl();langUI();topTools();tables();translate();
  const d=q('#z421-date-info');if(d)d.style.setProperty('max-width','100%','important');
 }finally{busy=false}
}
let queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;run()})}
function start(){
 const app=q('#appScreen');if(!app)return;
 run();
 const view=q('#view');if(view)new MutationObserver(schedule).observe(view,{childList:true,subtree:true});
 q('#zaviAdminLanguage')?.addEventListener('change',()=>{closePopup();schedule()});
 window.addEventListener('resize',()=>{closePopup();closeTools();schedule()});
 document.addEventListener('click',e=>{if(e.target.closest('.nav-item'))schedule()},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
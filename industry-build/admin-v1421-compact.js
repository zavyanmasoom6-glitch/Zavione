/* ZAVI ONE ADMIN 1.4.21 QA — compact owner-only interface.
 * Server remains authoritative for subscription grants and permissions.
 * ISO/UTC timestamps remain unchanged in backend; formatting is display only.
 */
(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s);
const words={
 fa:{trial:'تمدید آزمایشی ۷ روزه',trialHelp:'هفت روز رایگان برای آزمایش سیستم. اگر اعتبار فعلی باقی است، روزهای آن محفوظ می‌ماند.',store:'انتخاب فروشگاه',select:'فروشگاه را انتخاب کنید',note:'یادداشت اختیاری',grant:'ثبت تمدید ۷ روزه',close:'بستن',yes:'۷ روز برای همین فروشگاه ثبت شود؟',locked:'برای این عمل باید با حساب مالک مرکزی وارد شوید.',life:'اشتراک دائمی به تمدید آزمایشی نیاز ندارد.',current:'تاریخ ختم فعلی',new:'تاریخ ختم پس از ثبت',sending:'در حال بررسی و ثبت روی سرور…',done:'تمدید با موفقیت در سرور ثبت شد.',error:'ثبت نشد؛ دوباره بررسی کنید: ',none:'هنوز فروشگاهی انتخاب نشده است.',shamsi:'هجری شمسی',greg:'میلادی',today:'امروز',preview:'اطلاعات اعتبار',free:'رایگان • ۰ افغانی',live:'درخواست فقط با تأیید سرور انجام می‌شود',unknown:'نامشخص',title:'ZAVI ONE ADMIN',versions:'مدیریت نسخه‌های تخصصی',refresh:'تازه‌سازی'},
 en:{trial:'7-day trial extension',trialHelp:'Free seven-day evaluation. Existing remaining paid time is preserved.',store:'Store',select:'Select a store',note:'Optional note',grant:'Grant seven days',close:'Close',yes:'Grant seven days to this store?',locked:'Only the verified central owner can perform this action.',life:'A lifetime plan does not need a trial extension.',current:'Current expiration',new:'Expiration after grant',sending:'Saving on the server…',done:'Seven days granted on the server.',error:'Not saved: ',none:'No store selected.',shamsi:'Afghan solar Hijri',greg:'Gregorian',today:'Today',preview:'Subscription details',free:'Free • 0 AFN',live:'The server validates the request',unknown:'Unknown',title:'ZAVI ONE ADMIN',versions:'Industry editions',refresh:'Refresh'},
 ps:{trial:'د ۷ ورځو ازمایښتي غځونه',trialHelp:'د سیستم د ازموینې لپاره اووه ورځې وړیا. د پخواني ګډون پاتې ورځې خوندي دي.',store:'دوکان وټاکئ',select:'یو دوکان وټاکئ',note:'اختیاري یادښت',grant:'۷ ورځې ثبت کړئ',close:'بندول',yes:'دې دوکان ته اووه ورځې ورکړو؟',locked:'دا کار یوازې مرکزي مالک کولای شي.',life:'دایمي ګډون غځونې ته اړتیا نه لري.',current:'اوسنی پای',new:'له ثبت وروسته پای',sending:'په سرور کې ثبتېږي…',done:'اووه ورځې په سرور کې ثبت شوې.',error:'ثبت نه شو: ',none:'دوکان نه دی ټاکل شوی.',shamsi:'هجري شمسي',greg:'میلادي',today:'نن',preview:'د ګډون معلومات',free:'وړیا • ۰ افغانۍ',live:'سرور اجازه تاییدوي',unknown:'نامعلوم',title:'ZAVI ONE ADMIN',versions:'د صنفونو بڼې',refresh:'تازه کول'}
};
const lang=()=>{const a=(q('#zaviAdminLanguage')?.value||document.documentElement.lang||'fa-AF').toLowerCase();return a.startsWith('en')?'en':a.startsWith('ps')?'ps':'fa'};
const t=()=>words[lang()];
const mk=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
const live=()=>q('#appScreen')&&!q('#appScreen').hidden&&window.ZaviAdminAPI?.getMode?.()==='live';
const rows=()=>{try{return window.ZaviAdminAPI?.getRows?.()||[]}catch(_){return []}};
const fmt=(value)=>{
 if(!value)return null;
 const d=new Date(value);if(!Number.isFinite(d.getTime()))return null;
 const opt={timeZone:'Asia/Kabul',day:'numeric',month:'long',year:'numeric'};
 const cal=lang()==='en'?'en-u-ca-persian':lang()==='ps'?'ps-AF-u-ca-persian':'fa-AF-u-ca-persian';
 return {solar:new Intl.DateTimeFormat(cal,opt).format(d),western:new Intl.DateTimeFormat('en-GB-u-ca-gregory',opt).format(d),iso:d.toISOString()};
};
const formatted=(date)=>{
 const d=fmt(date);if(!d)return t().unknown;
 return t().shamsi+': '+d.solar+'  |  '+t().greg+': '+d.western;
};
const textDate=(value)=>{const el=mk('span','z421-dual-date',formatted(value));if(value&&fmt(value))el.title=fmt(value).iso;return el};
const badgeDate=(value)=>{const e=mk('div','z421-dates');e.append(mk('strong','',t().current),textDate(value));return e};
let openPanel=null,working=false,observer=null,queued=false;
function modal(){
 if(openPanel)return openPanel;
 const overlay=mk('div','z421-overlay');overlay.id='z421-trial-overlay';overlay.setAttribute('role','presentation');
 const card=mk('section','z421-modal');card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-labelledby','z421-modal-title');
 const header=mk('div','z421-modal-header'),title=mk('div','z421-modal-title');
 title.append(mk('h2','',t().trial),mk('small','',t().trialHelp));title.firstChild.id='z421-modal-title';
 const close=mk('button','z421-close','×');close.type='button';close.setAttribute('aria-label',t().close);close.addEventListener('click',()=>shut());
 header.append(title,close);
 const label=mk('label','z421-label',t().store);label.setAttribute('for','z421-store');
 const select=mk('select','z421-select');select.id='z421-store';
 const opt=mk('option','',t().select);opt.value='';select.append(opt);
 for(const r of rows().filter(x=>x&&x.workspace_id&&!x.archived)){
  const op=mk('option','',r.workspace_name||r.name||r.owner_email||r.workspace_id);op.value=r.workspace_id;select.append(op);
 }
 const preview=mk('div','z421-preview');
 const noteLabel=mk('label','z421-label',t().note);noteLabel.setAttribute('for','z421-note');
 const note=mk('input','z421-note');note.id='z421-note';note.type='text';note.maxLength=500;note.placeholder=t().note;
 const status=mk('p','z421-status',t().live);status.setAttribute('role','status');
 const footer=mk('div','z421-footer');
 footer.append(mk('span','z421-free',t().free));
 const grant=mk('button','z421-grant',t().grant);grant.type='button';grant.disabled=true;footer.append(grant);
 const selected=()=>rows().find(r=>r.workspace_id===select.value);
 const textFor=()=>{
  const l=lang();
  return l==='en'?{
   unsubscribed:'No current subscription yet',loading:'Checking the current expiry on the server…',
   after:'New expiry if 7 days are granted',estimate:'Estimated from server time; saved only after confirmation',
   trouble:'Could not load the subscription date. Try again or refresh.',
   life:'Lifetime access — no expiry date',waiting:'Select a store to see both dates'
  }:l==='ps'?{
   unsubscribed:'تر اوسه ګډون نه دی ثبت شوی',loading:'په سرور کې د ختم نېټه کتل کېږي…',
   after:'د ۷ ورځو له ثبت وروسته د پای نېټه',estimate:'د سرور اټکل؛ له تایید وروسته ثبتېږي',
   trouble:'د سرور نېټه ترلاسه نه شوه. بيا هڅه وکړئ.',life:'دایمي ګډون — د ختم نېټه نه لري',waiting:'د نېټو لپاره دوکان وټاکئ'
  }:{
   unsubscribed:'هنوز اشتراکی برای این فروشگاه ثبت نشده است.',loading:'در حال دریافت تاریخ دقیق از سرور…',
   after:'تاریخ ختم پیشنهادی پس از تمدید ۷ روزه',estimate:'این تاریخ از سرور محاسبه شده؛ فقط پس از تأیید ثبت می‌شود.',
   trouble:'تاریخ از سرور دریافت نشد. اتصال را بررسی و دوباره کوشش کنید.',
   life:'اشتراک دائمی است و تاریخ ختم ندارد.',waiting:'برای دیدن هر دو تاریخ فروشگاه را انتخاب کنید.'
  };
 };
 let previewSeq=0;
 async function update(){
  const current=++previewSeq, r=selected();
  preview.replaceChildren();
  preview.classList.remove('z427-pending','z427-ready','z427-failed');
  if(!r){preview.textContent=textFor().waiting;grant.disabled=true;return}
  if(r.plan==='lifetime'){preview.textContent=textFor().life;grant.disabled=true;return}
  const fallback=r.expires_at||r.subscription_expires_at||r.subscription?.expires_at||null;
  grant.disabled=!live()||working;
  preview.classList.add('z427-pending');
  const dateLabel=mk('div','z427-date-line');
  dateLabel.append(mk('strong','z427-date-name',t().current),mk('span','z427-date-value',fallback?formatted(fallback):textFor().loading));
  preview.append(dateLabel);
  if(!live()){preview.classList.remove('z427-pending');return}
  try{
   // Dedicated owner-only, read-only RPC returns the actual DB expiry and
   // proposed seven-day end. Never rely on stale local list or client clocks.
   const answer=await window.ZaviAdminAPI.request('/rest/v1/rpc/zavi_admin_preview_trial_7days',{
    method:'POST',body:{p_workspace_id:r.workspace_id}
   });
   if(!overlay.isConnected||current!==previewSeq||select.value!==r.workspace_id)return;
   const info=Array.isArray(answer)?answer[0]:(answer?.data||answer);
   if(!info||!('can_extend' in info))throw Error('Incomplete subscription preview');
   preview.replaceChildren();preview.classList.remove('z427-pending');preview.classList.add('z427-ready');
   if(info.can_extend===false){preview.append(mk('strong','z427-date-name',textFor().life));grant.disabled=true;return}
   const actual=info.current_expires_at;
   const old=mk('div','z427-date-line');
   old.append(mk('strong','z427-date-name',t().current),mk('span','z427-date-value',actual?formatted(actual):textFor().unsubscribed));
   const next=mk('div','z427-date-line z427-projected');
   next.append(mk('strong','z427-date-name',textFor().after),mk('span','z427-date-value',info.proposed_expires_at?formatted(info.proposed_expires_at):textFor().trouble));
   preview.append(old,next,mk('small','z427-date-hint',textFor().estimate));
   grant.disabled=!live()||working||!info.proposed_expires_at;
  }catch(err){
   if(!overlay.isConnected||current!==previewSeq||select.value!==r.workspace_id)return;
   preview.classList.remove('z427-pending');preview.classList.add('z427-failed');
   if(!fallback)dateLabel.lastChild.textContent=textFor().unsubscribed;
   preview.append(mk('p','z427-date-hint',textFor().trouble));
   grant.disabled=!live()||working;
  }
 }
 select.addEventListener('change',()=>{void update()});
 grant.addEventListener('click',async()=>{
  if(working||!live()){status.className='z421-status z427-error';status.textContent=t().locked;return}
  const r=selected();if(!r){status.textContent=t().select;return}
  if(r.plan==='lifetime'){status.textContent=t().life;return}
  if(!window.confirm(t().yes))return;
  working=true;grant.disabled=true;status.className='z421-status z427-pending';status.textContent=t().sending;
  try{
   const result=await window.ZaviAdminAPI.request('/rest/v1/rpc/zavi_admin_grant_trial_7days',{
    method:'POST',body:{p_workspace_id:r.workspace_id,p_reason:note.value.trim()||'7-day customer evaluation'}
   });
   if(!overlay.isConnected)return;
   const item=Array.isArray(result)?result[0]:result;
   status.className='z421-status z427-success';status.replaceChildren(mk('strong','',t().done));
   if(item?.expires_at)status.append(mk('div','z421-success-date',t().new+': '+formatted(item.expires_at)));
   note.value='';
   window.dispatchEvent(new CustomEvent('zavi-admin-trial-granted',{detail:{workspace_id:r.workspace_id}}));
  }catch(err){status.className='z421-status z427-error';status.textContent=t().error+(err?.message||String(err))}
  finally{working=false;void update()}
 });
 card.append(header,label,select,preview,noteLabel,note,status,footer);
 overlay.append(card);overlay.addEventListener('click',e=>{if(e.target===overlay)shut()});
 document.body.append(overlay);openPanel=overlay;void update();return overlay;
}
function shut(){openPanel?.remove();openPanel=null;working=false}
function open(){
 if(!live()){window.ZaviAdminAPI?.notify?.(t().locked);return}
 shut();modal();
}
function setToolbar(){
 const shell=q('#appScreen');if(!shell||shell.hidden)return;
 // The industry shortcut used to grow the mobile topbar into a giant vertical column.
 const edition=q('#z73-launch');
 if(edition&&!edition.dataset.z421Moved){
  const nav=q('#appScreen .sidebar .nav');
  if(nav){
   edition.dataset.z421Moved='1';edition.classList.add('z421-nav-entry');
   edition.textContent='▦ '+t().versions;nav.append(edition);
  }
 }
 const nav=q('#appScreen .sidebar .nav');
 if(nav&&!q('#z421-trial-entry')){
  const btn=mk('button','nav-item z421-trial-entry','🎁 '+t().trial);
  btn.id='z421-trial-entry';btn.type='button';btn.addEventListener('click',open);
  const sub=Array.from(nav.children).find(x=>x.matches?.('[data-page="payments"]'));
  if(sub)sub.before(btn);else nav.append(btn);
 }
 // An additional action appears in the subscriptions view, not in the top toolbar.
 const subPage=q('#appScreen [data-page-content="customers"],#appScreen #customersPage');
 if(subPage&&!q('#z421-inline-trial',subPage)){
  const b=mk('button','z421-inline-trial','🎁 '+t().trial);b.id='z421-inline-trial';b.type='button';b.addEventListener('click',open);subPage.prepend(b);
 }
}
function compactCalendar(){
 const shell=q('#appScreen');if(!shell||shell.hidden)return;
 let element=q('#z421-date-info');
 if(!element){
  const dash=q('#appScreen .workspace');if(!dash)return;
  element=mk('div','z421-today');element.id='z421-date-info';element.setAttribute('aria-label',t().today);
  const bar=q('#appScreen .topbar');
  if(bar)bar.after(element);else dash.prepend(element);
 }
 const now=fmt(new Date());
 if(!now)return;
 const daykey=now.solar+'|'+now.western+'|'+lang();
 if(element.dataset.datekey===daykey)return;
 element.dataset.datekey=daykey;
 element.replaceChildren(mk('span','z421-today-label',t().today),mk('strong','',now.solar),mk('span','',now.western));
}
function dualDates(){
 // Progressive enhancement only: existing timezone values, inputs and accounting are untouched.
 const shell=q('#appScreen');if(!shell||shell.hidden)return;
 const nodes=shell.querySelectorAll('time[datetime], [data-iso-date], td[data-label*="تاریخ"], td[data-label*="Date"], td[data-label*="ختم"]');
 let count=0;
 for(const node of nodes){
  if(count>=100)break;
  if(node.dataset.z421DateApplied==='1'||node.closest('#z421-trial-overlay'))continue;
  const value=node.getAttribute('datetime')||node.dataset.isoDate||node.textContent.trim();
  let date=null;
  if(/^\d{4}-\d{2}-\d{2}(?:[T\s][\d:.+-Z]+)?$/.test(value))date=fmt(value);
  if(!date)continue;
  node.dataset.z421DateApplied='1';
  node.replaceChildren(mk('span','z421-date-pair',t().shamsi+': '+date.solar+' · '+t().greg+': '+date.western));
  count++;
 }
}
function sync(){
 const shell=q('#appScreen');if(!shell||shell.hidden)return;
 setToolbar();compactCalendar();dualDates();
}
function start(){
 const shell=q('#appScreen');if(!shell)return;
 observer=new MutationObserver(()=>{
  if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync()});
 });
 observer.observe(shell,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')shut()});
 q('#zaviAdminLanguage')?.addEventListener('change',()=>{shut();q('#z421-date-info')?.remove();sync()});
 window.addEventListener('zavi-admin-trial-granted',sync);
 sync();
}
window.ZaviAdminCompact1421=Object.freeze({openTrial:open,formatDate:formatted});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
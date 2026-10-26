/* ZAVI ONE ADMIN 1.4.23 — permanent subscription grant/revoke with server authorization.
 * Never writes subscription tables directly. Uses existing audited owner-only RPCs.
 */
(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s);
const el=(tag,cls,value)=>{let n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n};
const lang=()=>{const x=(q('#zaviAdminLanguage')?.value||document.documentElement.lang||'fa').toLowerCase();return x.startsWith('en')?'en':x.startsWith('ps')?'ps':'fa'};
const text={
 fa:{title:'مدیریت اشتراک دائمی',summary:'دادن یا لغو اشتراک دائمی برای فروشگاه انتخاب‌شده',nav:'اشتراک دائمی',choose:'انتخاب فروشگاه',none:'یک فروشگاه انتخاب کنید',status:'وضعیت فعلی',permanent:'اشتراک دائمی',other:'اشتراک محدود',grant:'دادن اشتراک دائمی',revoke:'لغو اشتراک دائمی',amount:'مبلغ دریافت‌شده',currency:'واحد پول',method:'روش پرداخت',receipt:'شماره رسید (اختیاری)',note:'یادداشت مدیر (اختیاری)',confirmLabel:'برای تأیید، نام فروشگاه را دقیق بنویسید',confirmHint:'اشتراک دائمی تنها با تأیید مدیر مرکزی روی سرور ثبت می‌شود. لغو آن دسترسی اشتراکی را متوقف می‌کند ولی اطلاعات فروشگاه حذف نمی‌شود.',close:'بستن',sending:'در حال ثبت امن روی سرور…',doneGrant:'دسترسی دائمی ثبت شد.',doneRevoke:'دسترسی دائمی لغو شد.',noAuth:'تنها مالک تأییدشده مدیریت مرکزی اجازه این عمل را دارد.',wrong:'نام فروشگاه با انتخاب مطابقت ندارد.',askGrant:'این فروشگاه اشتراک دائمی دریافت کند؟',askRevoke:'دسترسی دائمی این فروشگاه لغو شود؟',badAmount:'مبلغ نامعتبر است.',err:'ثبت انجام نشد: ',already:'این فروشگاه از قبل اشتراک دائمی دارد.',notLifetime:'این فروشگاه اشتراک دائمی ندارد.',refresh:'وضعیت را تازه کنید.',paid:'نقد',bank:'انتقال بانکی',otherMethod:'سایر',free:'رایگان',moneyTip:'اگر اشتراک دائمی رایگان است، مبلغ را صفر بگذارید.',button:'مدیریت اشتراک دائمی'},
 en:{title:'Permanent subscriptions',summary:'Grant or revoke permanent access for one selected store',nav:'Permanent access',choose:'Select store',none:'Choose a store',status:'Current plan',permanent:'Lifetime',other:'Time-limited',grant:'Grant lifetime access',revoke:'Revoke lifetime access',amount:'Amount received',currency:'Currency',method:'Payment method',receipt:'Receipt reference (optional)',note:'Admin note (optional)',confirmLabel:'Type the selected store name to confirm',confirmHint:'Only the verified central owner can make these server-side changes. Revoking access does not delete store records.',close:'Close',sending:'Saving securely on the server…',doneGrant:'Lifetime access granted.',doneRevoke:'Lifetime access revoked.',noAuth:'Only the verified central administrator may do this.',wrong:'Store name does not match.',askGrant:'Grant permanent access to this store?',askRevoke:'Revoke permanent access for this store?',badAmount:'Invalid amount.',err:'Server rejected change: ',already:'Store already has permanent access.',notLifetime:'Store does not have permanent access.',refresh:'Refresh the store list.',paid:'Cash',bank:'Bank transfer',otherMethod:'Other',free:'Free',moneyTip:'Use 0 for complimentary lifetime access.',button:'Manage permanent access'},
 ps:{title:'دایمي ګډونونه',summary:'یو دوکان ته دایمي ګډون ورکول یا بېرته اخیستل',nav:'دایمي ګډون',choose:'دوکان غوره کړئ',none:'یو دوکان وټاکئ',status:'اوسنی ګډون',permanent:'دایمي',other:'محدود ګډون',grant:'دایمي ګډون ورکړئ',revoke:'دایمي ګډون بند کړئ',amount:'ترلاسه شوې پیسې',currency:'اسعار',method:'د پیسو لار',receipt:'د رسید شمېره (اختیاري)',note:'د مدیر یادښت',confirmLabel:'د تایید لپاره د دوکان نوم ولیکئ',confirmHint:'دا بدلون یوازې مرکزي مالک په سرور کې ثبتوي. د دوکان حسابداري نه پاکېږي.',close:'بندول',sending:'په سرور کې خوندي کېږي…',doneGrant:'دایمي ګډون ثبت شو.',doneRevoke:'دایمي ګډون لغو شو.',noAuth:'یوازې مرکزي مالک اجازه لري.',wrong:'د دوکان نوم سم نه دی.',askGrant:'دې دوکان ته دایمي ګډون ورکړو؟',askRevoke:'دا ګډون بند کړو؟',badAmount:'پیسې سمې نه دي.',err:'ثبت نه شو: ',already:'دا دوکان مخکې دایمي ګډون لري.',notLifetime:'دا دوکان دایمي ګډون نه لري.',refresh:'لست تازه کړئ.',paid:'نغدې',bank:'بانکي حواله',otherMethod:'نور',free:'وړیا',moneyTip:'د وړیا ګډون لپاره صفر ولیکئ.',button:'دایمي ګډون اداره کړئ'}
};
const t=()=>text[lang()];
const api=()=>window.ZaviAdminAPI;
const isOwner=()=>api()?.getMode?.()==='live'&&Array.isArray(api()?.getRows?.());
const stores=()=>{try{return api()?.getRows?.()||[]}catch(_){return []}};
const display=r=>String(r?.workspace_name||r?.name||r?.store_name||r?.owner_email||r?.workspace_id||'');
let panel=null,busy=false;
const label=(txt,control)=>{const box=el('label','z423-field');box.append(el('span','',txt),control);return box};
const input=(type,placeholder)=>{const e=el('input');e.type=type;e.placeholder=placeholder||'';e.autocomplete='off';return e};
const select=(options)=>{const s=el('select');for(const [value,name] of options){const o=el('option','',name);o.value=value;s.append(o)}return s};
function close(){if(busy)return;panel?.remove();panel=null;}
function open(){
 if(!isOwner()){api()?.notify?.(t().noAuth);return}
 if(panel)close();
 if(panel)return;
 const w=t(),overlay=el('div','z423-overlay');overlay.id='z423-overlay';
 const card=el('section','z423-modal');card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-label',w.title);
 const header=el('div','z423-head');header.append(el('h2','',w.title));
 const x=el('button','z423-close','×');x.type='button';x.setAttribute('aria-label',w.close);x.addEventListener('click',close);header.append(x);
 const intro=el('p','z423-intro',w.summary);
 const candidates=stores().filter(s=>s.workspace_id&&!s.archived);
 const picker=select([['',w.none],...candidates.map(s=>[s.workspace_id,display(s)])]);
 const details=el('p','z423-status');
 const tabs=el('div','z423-tabs');
 const grantTab=el('button','z423-tab active',w.grant),revokeTab=el('button','z423-tab',w.revoke);
 grantTab.type=revokeTab.type='button';grantTab.dataset.mode='grant';revokeTab.dataset.mode='revoke';tabs.append(grantTab,revokeTab);
 const amount=input('number','0');amount.value='0';amount.step='0.01';amount.min='0';amount.max='100000000000';
 const currency=select([['AFN','AFN'],['USD','USD'],['CNY','CNY'],['PKR','PKR'],['EUR','EUR']]);
 const method=select([['cash',w.paid],['bank',w.bank],['other',w.otherMethod]]);
 const receipt=input('text','');receipt.maxLength=120;
 const note=input('text','');note.maxLength=500;
 const confirm=input('text','');confirm.setAttribute('aria-label',w.confirmLabel);
 const form=el('div','z423-fields'),tools=el('div','z423-actions');
 const info=el('p','z423-help',w.confirmHint);
 const message=el('p','z423-message');message.setAttribute('role','status');
 const act=el('button','z423-submit',w.grant);act.type='button';act.disabled=true;
 tools.append(act);
 let mode='grant';
 const chosen=()=>candidates.find(s=>s.workspace_id===picker.value);
 function reset(){
  const r=chosen();const lifetime=r?.plan==='lifetime';
  details.textContent=r?w.status+': '+(lifetime?w.permanent:w.other):w.none;
  form.replaceChildren();
  if(mode==='grant')form.append(label(w.amount,amount),el('small','z423-tip',w.moneyTip),label(w.currency,currency),label(w.method,method),label(w.receipt,receipt),label(w.note,note));
  form.append(label(w.confirmLabel,confirm));
  grantTab.classList.toggle('active',mode==='grant');revokeTab.classList.toggle('active',mode==='revoke');
  act.textContent=mode==='grant'?w.grant:w.revoke;act.classList.toggle('danger',mode==='revoke');
  act.disabled=busy||!r||(mode==='grant'&&lifetime)||(mode==='revoke'&&!lifetime);
  if(r&&mode==='grant'&&lifetime)message.textContent=w.already;
  else if(r&&mode==='revoke'&&!lifetime)message.textContent=w.notLifetime;
  else message.textContent='';
 }
 picker.addEventListener('change',()=>{confirm.value='';reset()});
 grantTab.addEventListener('click',()=>{mode='grant';confirm.value='';reset()});
 revokeTab.addEventListener('click',()=>{mode='revoke';confirm.value='';reset()});
 act.addEventListener('click',async()=>{
  const r=chosen();if(busy||!r||!isOwner()){message.textContent=w.noAuth;return}
  if(confirm.value.trim()!==display(r).trim()){message.textContent=w.wrong;return}
  if(mode==='grant'&&r.plan==='lifetime'){message.textContent=w.already;return}
  if(mode==='revoke'&&r.plan!=='lifetime'){message.textContent=w.notLifetime;return}
  const money=Number(amount.value);
  if(mode==='grant'&&(!Number.isFinite(money)||money<0||money>100000000000)){message.textContent=w.badAmount;return}
  if(!window.confirm(mode==='grant'?w.askGrant:w.askRevoke))return;
  busy=true;act.disabled=true;message.textContent=w.sending;
  try{
   const rpc=mode==='grant'?'zavi_admin_grant_lifetime':'zavi_admin_revoke_lifetime';
   const body=mode==='grant'
    ?{p_workspace_id:r.workspace_id,p_amount:money,p_currency:currency.value,p_payment_method:method.value,p_receipt_reference:receipt.value.trim()||null,p_notes:note.value.trim()||null}
    :{p_workspace_id:r.workspace_id,p_confirmation:'LIFETIME-REVOKE'};
   const result=await api().request('/rest/v1/rpc/'+rpc,{method:'POST',body});
   if(result!==true&&!(Array.isArray(result)&&result[0]===true))throw Error('Server did not confirm action');
   message.textContent=mode==='grant'?w.doneGrant:w.doneRevoke;
   confirm.value='';
   const local=chosen();if(local)local.plan=mode==='grant'?'lifetime':'annual';
   window.dispatchEvent(new CustomEvent('zavi-admin-lifetime-updated',{detail:{workspace_id:r.workspace_id,action:mode}}));
   setTimeout(()=>{try{q('#refreshBtn')?.click()}catch(_){}},300);
  }catch(err){message.textContent=w.err+(err?.message||String(err))}
  finally{busy=false;reset()}
 });
 card.append(header,intro,label(w.choose,picker),details,tabs,form,info,message,tools);overlay.append(card);document.body.append(overlay);panel=overlay;
 overlay.addEventListener('click',e=>{if(e.target===overlay)close()});reset();
}
function mount(){
 const root=q('#appScreen');if(!root||root.hidden)return;
 const menu=q('#appScreen .sidebar .nav');if(menu&&!q('#z423-launch')){
  const button=el('button','nav-item z423-launch','♾ '+t().nav);button.id='z423-launch';button.type='button';button.addEventListener('click',open);
  menu.append(button);
 }
 const subscriptions=q('#appScreen #customersPage,#appScreen [data-page-content="customers"]');
 if(subscriptions&&!q('#z423-subscriptions-button',subscriptions)){
  const btn=el('button','z423-inline',t().button);btn.id='z423-subscriptions-button';btn.type='button';btn.addEventListener('click',open);subscriptions.prepend(btn);
 }
}
function start(){
 const root=q('#appScreen');if(!root)return;
 let pending=false;
 new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;mount()})}).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
 q('#zaviAdminLanguage')?.addEventListener('change',()=>{q('#z423-launch')?.remove();q('#z423-subscriptions-button')?.remove();if(!busy)close();mount()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 mount();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
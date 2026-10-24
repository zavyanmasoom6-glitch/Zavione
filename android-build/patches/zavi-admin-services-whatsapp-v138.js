/* ZAVI ONE ADMIN 1.3.8 — WhatsApp contacts integrated in EXISTING professional service center.
   No popups, no new menu, no reworking of subscription/renewal features. */
(function () {
 'use strict';
 var currentRoot=null,contacts=[],loading=false,loaded=false,hasError=false,term='';
 var $=s=>document.querySelector(s);
 var api=()=>window.ZaviAdminAPI;
 var text={
  fa:{head:'📱 شماره واتساپ مشتریان',info:'شماره‌ها هنگام ثبت‌نام ابری جدید و با اطلاع کاربر یک‌بار ثبت می‌شوند. فقط مدیریت مرکزی آن‌ها را می‌بیند.',search:'جستجوی ایمیل یا شماره واتساپ',loading:'در حال دریافت امن شماره‌ها…',empty:'هنوز شماره واتساپ ثبت‌نام جدیدی وجود ندارد.',failure:'نمایش شماره‌ها ممکن نشد. اتصال اینترنت و مجوز حساب مدیر اصلی را بررسی کنید.',call:'تماس',wa:'پیام واتساپ',label:'مرکز ارتباط با مشتریان'},
  ps:{head:'📱 د مشتریانو واټساپ شمېرې',info:'شمېرې یوازې د نوي کلاوډ حساب د جوړېدو پر مهال او د کارونکي په خبرتیا کې ثبتېږي.',search:'د ایمیل یا واټساپ شمېرې لټون',loading:'شمېرې په خوندي ډول ترلاسه کېږي…',empty:'تر اوسه د نوي حساب واټساپ نشته.',failure:'د شمېرو اخیستل ونه شول. انټرنټ او د مرکزي مدیر اجازه وګورئ.',call:'زنګ',wa:'واټساپ ته پیغام',label:'د مشتریانو سره اړیکې'},
  en:{head:'📱 Customer WhatsApp numbers',info:'Numbers are collected once when customers create new cloud accounts, with their knowledge. Only central administration can see them.',search:'Search email or WhatsApp number',loading:'Loading secured contacts…',empty:'No new signup WhatsApp numbers have been recorded yet.',failure:'Unable to load protected numbers. Check connectivity and central admin permissions.',call:'Call',wa:'WhatsApp message',label:'Customer contact center'}
 };
 function tr(){var s=String($('#zaviAdminLanguage')?.value||document.documentElement.lang||'fa').toLowerCase();return text[s.startsWith('en')?'en':s.startsWith('ps')?'ps':'fa']}
 function esc(x){return String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 function phone(x){return /^\+[1-9][0-9]{5,14}$/.test(String(x||''))?x:''}
 function waLink(x){return 'https://wa.me/'+x.slice(1)}
 function normalized(x){return String(x||'').toLowerCase().trim()}
 function render(){
  var container=$('#zaviServiceCenter #zaviAdminWhatsAppV138');if(!container)return;
  var key=[loaded,loading,hasError,term,contacts.length,tr().head,contacts.map(x=>x.whatsapp_e164).join(',')].join('|');
  if(container.dataset.renderKey===key)return;
  container.dataset.renderKey=key;
  var t=tr();container.querySelector('h2').textContent=t.head;
  container.querySelector('.zawi-desc').textContent=t.info;
  var inp=container.querySelector('input');if(inp && document.activeElement!==inp)inp.value=term;
  inp.placeholder=t.search;
  var target=container.querySelector('.zawi-results');
  if(loading){target.textContent=t.loading;return;}
  if(hasError){target.textContent=t.failure;return;}
  var filtered=contacts.filter(c=>normalized([c.account_email,c.whatsapp_e164,c.phone_e164].join(' ')).includes(term));
  if(!filtered.length){target.textContent=t.empty;return;}
  var html=filtered.map(c=>{
   var w=phone(c.whatsapp_e164),p=phone(c.phone_e164);
   var links=(p?'<a href="tel:'+p+'" class="zawi-contact-action">☎ '+esc(t.call)+'</a>':'')+
    (w?'<a href="'+waLink(w)+'" class="zawi-contact-action zawi-whatsapp" rel="noopener">💬 '+esc(t.wa)+'</a>':'');
   return '<article class="zawi-contact"><div><b>'+esc(c.account_email||'—')+'</b><small dir="ltr">'+esc(w||'—')+'</small></div><div class="zawi-contact-actions">'+links+'</div></article>';
  }).join('');
  target.innerHTML=html;
 }
 function addServiceCard(){
  var page=$('#zaviServiceCenter .zsvc-page');if(!page)return;
  var container=$('#zaviServiceCenter #zaviAdminWhatsAppV138');
  if(!container){
   container=document.createElement('section');container.id='zaviAdminWhatsAppV138';
   container.className='zawi-center-card';
   container.setAttribute('aria-label',tr().label);
   container.innerHTML='<div class="zawi-header"><h2></h2><span aria-hidden="true">🔒</span></div><p class="zawi-desc"></p><input type="search" autocomplete="off" aria-label="Search contacts"><div class="zawi-results" role="status" aria-live="polite"></div>';
   var anchor=page.querySelector('.zsvc-shortcuts');
   if(anchor)anchor.insertAdjacentElement('afterend',container);
   else page.appendChild(container);
   container.querySelector('input').addEventListener('input',e=>{term=normalized(e.target.value);render()});
  }
  render();
 }
 function addRowButtons(){
  var service=$('#zaviServiceCenter');if(!service||!loaded||!contacts.length)return;
  var emails=new Map(contacts.map(c=>[normalized(c.account_email),phone(c.whatsapp_e164)]));
  var rows=api()?.getRows?.()||[];
  service.querySelectorAll('tr').forEach(row=>{
   var id=row.querySelector('[data-zsvc="renew"]')?.dataset.id;
   if(!id)return;
   var owner=rows.find(r=>String(r.workspace_id)===String(id));
   var w=emails.get(normalized(owner?.owner_email));
   var target=row.querySelector('.zsvc-actions');
   if(!target||!w||target.querySelector('.zawi-quick-wa'))return;
   var a=document.createElement('a');
   a.className='zawi-quick-wa';a.href=waLink(w);a.rel='noopener';a.textContent='💬 '+tr().wa;
   target.appendChild(a);
  });
 }
 async function fetchContacts(){
  if(loading||loaded)return;
  if(api()?.getMode?.()!=='live'){hasError=true;render();return;}
  loading=true;hasError=false;render();
  try{
   var items=await api().request('/rest/v1/rpc/zavi_admin_registration_contacts',{method:'POST',body:{}});
   if(!Array.isArray(items))throw Error('Invalid RPC response');
   contacts=items.filter(x=>x&&x.contact_opt_in===true&&phone(x.whatsapp_e164));
   loaded=true;
  }catch(e){contacts=[];hasError=true;}
  finally{loading=false;render();addRowButtons();}
 }
 function check(){
  var root=$('#zaviServiceCenter');
  if(!root){currentRoot=null;contacts=[];loaded=false;loading=false;hasError=false;term='';return;}
  if(root!==currentRoot){currentRoot=root;contacts=[];loaded=false;loading=false;hasError=false;term='';}
  if(!root.querySelector('.zsvc-page'))return;
  addServiceCard();addRowButtons();if(!loaded&&!loading&&!hasError)fetchContacts();
 }
 function css(){
  if($('#zawi-center-css-v138'))return;
  var s=document.createElement('style');s.id='zawi-center-css-v138';
  s.textContent='#zaviAdminWhatsAppV138{margin:16px 0;border:1px solid #aacce0;border-radius:15px;padding:16px;background:rgba(28,119,178,.07);color:inherit}#zaviAdminWhatsAppV138 .zawi-header{display:flex;justify-content:space-between;align-items:center;gap:10px}#zaviAdminWhatsAppV138 h2{font-size:18px;margin:0;font-weight:850}#zaviAdminWhatsAppV138 p{font-size:13px;line-height:1.8;margin:9px 0 12px}#zaviAdminWhatsAppV138 input{width:100%;box-sizing:border-box;border:1px solid #8eaec7;border-radius:9px;padding:10px 12px;font-size:14px;min-height:44px;background:#fff;color:#17334b}#zaviAdminWhatsAppV138 .zawi-results{display:grid;gap:8px;margin-top:12px;font-size:13px;line-height:1.7}#zaviAdminWhatsAppV138 .zawi-contact{border:1px solid #adcce05b;border-radius:12px;padding:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;background:rgba(64,155,209,.07)}#zaviAdminWhatsAppV138 .zawi-contact b{display:block;font-size:14px}#zaviAdminWhatsAppV138 .zawi-contact small{display:block;unicode-bidi:isolate;font-size:13px;margin-top:4px}.zawi-contact-actions{display:flex;gap:9px;flex-wrap:wrap}.zawi-contact-action,.zawi-quick-wa{display:inline-flex;align-items:center;justify-content:center;padding:8px 12px;border-radius:9px;background:#087a68;color:#fff!important;font-size:13px;font-weight:750;min-height:39px;text-decoration:none!important}.zawi-quick-wa{margin:4px 0}.zawi-contact-action:not(.zawi-whatsapp){background:#246baa}@media(max-width:600px){#zaviAdminWhatsAppV138{padding:12px}.zawi-contact{align-items:stretch!important}.zawi-contact-actions{width:100%}}';
  document.head.appendChild(s);
 }
 function start(){
  css();var scheduled=false;
  new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;check()})}).observe(document.body,{childList:true,subtree:true});
  check();
 }
 document.addEventListener('change',e=>{if(e.target.id==='zaviAdminLanguage')render()});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
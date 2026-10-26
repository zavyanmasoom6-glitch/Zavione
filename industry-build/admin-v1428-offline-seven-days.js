/* ZAVI ONE ADMIN 1.4.28: 7-day ES256 offline grace for READ-ONLY owner summary.
 * Admin payments/renewals/deletions/device changes ALWAYS require online server checks.
 * Offline lease is server-signed and verified against the same public key as store ES256. */
(()=>{'use strict';
 const PUB={"kty":"EC","crv":"P-256","x":"zsbLX8Ww0-G1BRrTuX7MauNT4oqklU6DcmrCayblg0o","y":"EQYGiqUW2-d-5Rb1nRs6UHQIG2T53o2m0wvmRTuOSto"};
 const prefix="zavi_admin_v1428_";let inFlight=false,latestAt=0,keyPromise;
 const q=(s,p=document)=>p.querySelector(s);
 const lang=()=>{const l=(q('#zaviAdminLanguage')?.value||document.documentElement.lang||'fa').toLowerCase();return l.startsWith('en')?'en':l.startsWith('ps')?'ps':'fa'};
 const words={
 fa:{title:'مجوز آفلاین ۷روزه مدیریت مرکزی',live:'مجوز آفلاین تا ۷ روز به‌طور خودکار از سرور دریافت می‌شود.',offline:'حالت آفلاین امن: فقط مشاهده؛ تمدید و تغییرات تا اتصال اینترنت متوقف است.',no:'مجوز معتبر ۷روزه ندارید. یک‌بار با حساب اصلی و اینترنت وارد شوید.',end:'تاریخ پایان اعتبار',renew:'تازه‌سازی مجوز',stores:'فروشگاه‌های ثبت‌شده',active:'اشتراک‌های فعال',day:'روز',retry:'دوباره اتصال بگیرید',online:'وضعیت مجوز آفلاین'},
 en:{title:'7-day ADMIN offline permission',live:'The signed seven-day offline permission refreshes automatically from the cloud.',offline:'Secure offline mode: read-only. Renewals and changes require an internet connection.',no:'No valid seven-day permission. Sign in online with the central owner account.',end:'Expires',renew:'Refresh permission',stores:'Registered stores',active:'Active subscriptions',day:'days',retry:'Reconnect online',online:'Offline permission status'},
 ps:{title:'د مدیر ۷ ورځنی آفلاین جواز',live:'د اوو ورځو آفلاین اجازه د سرور څخه په خپله نوي کېږي.',offline:'خوندي آفلاین بڼه: یوازې کتنه؛ تمدید او بدلونونه انټرنېټ غواړي.',no:'معتبر جواز نشته؛ د اصلي مالک حساب سره آنلاین ننوځئ.',end:'د اعتبار پای',renew:'جواز تازه کړئ',stores:'دوکانونه',active:'فعال ګډونونه',day:'ورځې',retry:'انټرنېټ وصل کړئ',online:'د آفلاین جواز حالت'}
 };
 const t=()=>words[lang()];
 const b64=x=>{let s=x.replace(/-/g,'+').replace(/_/g,'/');s+='='.repeat((4-s.length%4)%4);return Uint8Array.from(atob(s),c=>c.charCodeAt(0))};
 function device(){
  try{let x=localStorage.getItem(prefix+'device_id');if(/^[a-zA-Z0-9_-]{20,128}$/.test(x||''))return x;
   const bytes=crypto.getRandomValues(new Uint8Array(24));x='admin_'+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
   localStorage.setItem(prefix+'device_id',x);return x;}catch{return ''}
 }
 async function verified(){
  try{
   const token=localStorage.getItem(prefix+'lease');const d=device();
   if(!d||!token||token.length>8192)return null;
   const parts=token.split('.');if(parts.length!==3)return null;
   const h=JSON.parse(new TextDecoder().decode(b64(parts[0])));
   if(h.alg!=='ES256'||h.typ!=='JWT')return null;
   keyPromise ||= crypto.subtle.importKey('jwk',PUB,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
   if(!await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},await keyPromise,b64(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])))return null;
   const p=JSON.parse(new TextDecoder().decode(b64(parts[1])));
   const now=Date.now();
   if(p.iss!=='zavi-admin-offline-v1'||p.aud!=='zavi-admin-offline-readonly'||
      !p.sub||p.device_id!==d||p.readonly!==true||p.can_write!==false||
      !Number.isSafeInteger(p.iat)||!Number.isSafeInteger(p.exp)||p.exp<=p.iat||
      p.exp-p.iat>7*86400||now<(p.iat-60)*1000||now>=p.exp*1000)return null;
   return p;
  }catch{return null}
 }
 function date(exp){const value=new Date(exp*1000);if(!Number.isFinite(value.getTime()))return '—';const locale=lang()==='en'?'en-GB':lang()==='ps'?'ps-AF':'fa-AF';return new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeZone:'Asia/Kabul'}).format(value)}
 const make=(tag,cls,value)=>{const n=document.createElement(tag);n.className=cls;if(value!==undefined)n.textContent=String(value);return n};
 function numbers(){const a=window.ZaviAdminAPI?.getRows?.()||[];return {stores:a.length,active:a.filter(x=>x.status==='active'||x.subscription_status==='active').length}}
 async function refresh(force=false){
  const api=window.ZaviAdminAPI;
  if(navigator.onLine===false||api?.getMode?.()!=='live'||!device()||inFlight)return;
  const now=Date.now();if(!force&&now-latestAt<3600000)return;
  inFlight=true;latestAt=now;
  try{
   const result=await api.request('/functions/v1/zavi-admin-offline-grace',{method:'POST',body:{device_id:device()}});
   const token=result?.token;
   if(typeof token!=='string'||token.length>8192)throw Error('Bad lease');
   const old=localStorage.getItem(prefix+'lease');
   localStorage.setItem(prefix+'lease',token);
   const verifiedClaim=await verified();
   if(!verifiedClaim){if(old)localStorage.setItem(prefix+'lease',old);else localStorage.removeItem(prefix+'lease');throw Error('Signature failed')}
   localStorage.setItem(prefix+'readonly_summary',JSON.stringify({...numbers(),at:Date.now()}));
   window.dispatchEvent(new Event('z428-admin-offline-ready'));
  }catch{ /* Never replace a valid signed lease on a transient network failure. */ }
  finally{inFlight=false;render()}
 }
 async function render(){
  const existing=q('#z428-banner'),root=q('#appScreen');
  if(!root)return;
  const signed=await verified(),online=navigator.onLine!==false,live=window.ZaviAdminAPI?.getMode?.()==='live';
  if(live){
   const container=q('#view')||q('#appScreen .workspace');if(!container)return;
   let bar=existing;
   if(!bar){bar=make('div','z428-banner','');bar.id='z428-banner';container.prepend(bar)}
   bar.replaceChildren(make('strong','',t().title),make('small','',signed?t().end+': '+date(signed.exp):t().live));
   const button=make('button','z428-refresh',t().renew);
   button.type='button';button.disabled=!online||inFlight;button.addEventListener('click',()=>refresh(true));bar.append(button);
  }else existing?.remove();
  let modal=q('#z428-readonly-overlay');
  // IMPORTANT: this never unlocks live ADMIN or sends a write RPC.
  if(!online&&signed){
   if(!modal){modal=make('section','z428-readonly','');modal.id='z428-readonly-overlay';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');document.body.append(modal)}
   let summary={stores:'—',active:'—'};try{const saved=JSON.parse(localStorage.getItem(prefix+'readonly_summary')||'null');if(saved&&Number.isFinite(saved.stores)&&saved.at<=signed.exp*1000)summary=saved}catch{}
   modal.replaceChildren(make('h2','',t().title),make('p','',t().offline),make('p','',t().end+': '+date(signed.exp)),
      make('div','z428-counters',t().stores+': '+summary.stores+'   |   '+t().active+': '+summary.active),
      make('small','',t().retry));
  }else modal?.remove();
 }
 function init(){
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){refresh();render()}});
  window.addEventListener('online',()=>{refresh(true);render()});
  window.addEventListener('offline',render);
  window.addEventListener('zavi-admin-offline-ready',render);
  q('#zaviAdminLanguage')?.addEventListener('change',render);
  window.addEventListener('focus',()=>{refresh();render()});
  setTimeout(()=>{refresh(true);render()},1800);
  setTimeout(()=>{refresh();render()},5300);
  const screen=q('#appScreen');if(screen)new MutationObserver(()=>{if(navigator.onLine!==false)refresh();}).observe(screen,{attributes:true,attributeFilter:['hidden']});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.ZAVIAdminOffline7=Object.freeze({verified,refresh});
})();
/* ZAVI ONE ADMIN V1.4.26: deterministic mobile drawer controls.
 * Presentation/navigation only. Does not change login, accounts, subscriptions, or RLS. */
(()=>{'use strict';
 const $=(s,p=document)=>p.querySelector(s);
 const mobile=()=>window.matchMedia('(max-width:800px)').matches;
 const shell=()=>$('#appScreen');
 const side=()=>$('#appScreen .sidebar');
 const trigger=()=>$('#mobileMenu');
 const lang=()=>String($('#zaviAdminLanguage')?.value||document.documentElement.lang||'fa-AF').toLowerCase();
 const words=()=>lang().startsWith('en')?{open:'Open navigation',close:'Close menu'}:lang().startsWith('ps')?{open:'غورنۍ پرانیزئ',close:'غورنۍ وتړئ'}:{open:'بازکردن منو',close:'بستن منو'};
 let beforeFocus=null,startX=null,startY=null,scrollY=0,queued=false;
 const opened=()=>document.body.classList.contains('mobile-drawer');
 function backdrop(){
  let el=$('#z426-drawer-backdrop');
  if(!el){el=document.createElement('div');el.id='z426-drawer-backdrop';el.setAttribute('aria-hidden','true');document.body.append(el);
   el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();close()});}
  return el;
 }
 function closeButton(){
  const nav=side();if(!nav)return null;
  let button=$('#z426-drawer-close',nav);
  if(!button){
   button=document.createElement('button');button.id='z426-drawer-close';
   button.className='z426-close';button.type='button';
   button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();close(true)});
   nav.prepend(button);
  }
  const label=words().close;
  if(button.textContent!=='✕  '+label)button.textContent='✕  '+label;
  button.setAttribute('aria-label',label);
  return button;
 }
 function reflect(){
  const pane=side(),btn=trigger(),bg=backdrop(),open=opened()&&mobile()&&!shell()?.hidden;
  if(!pane)return;
  if(btn){
   if(btn.getAttribute('aria-expanded')!==String(open))btn.setAttribute('aria-expanded',String(open));
   btn.setAttribute('aria-label',open?words().close:words().open);
   btn.setAttribute('aria-controls','z426-drawer-panel');
  }
  pane.id='z426-drawer-panel';
  pane.classList.toggle('z426-is-open',open);
  pane.classList.toggle('z426-is-closed',!open);
  pane.setAttribute('aria-label',lang().startsWith('en')?'Administration navigation':'منوی مدیریت مرکزی');
  pane.setAttribute('aria-hidden',String(!open&&mobile()));
  if(bg.classList.contains('z426-visible')!==open)bg.classList.toggle('z426-visible',open);
  document.documentElement.classList.toggle('z426-drawer-open',open);
  closeButton();
  if(!mobile()&&opened())document.body.classList.remove('mobile-drawer');
 }
 function open(){
  if(!mobile()||!side()||shell()?.hidden)return;
  beforeFocus=document.activeElement;
  document.body.classList.add('mobile-drawer');
  reflect();
  closeButton()?.focus({preventScroll:true});
 }
 function close(focusBack=false){
  const wasOpen=opened();
  document.body.classList.remove('mobile-drawer');
  reflect();
  if(focusBack&&wasOpen)(trigger()||beforeFocus)?.focus?.({preventScroll:true});
 }
 function toggle(){if(opened())close(true);else open()}
 function capture(e){
  const t=e.target;
  if(!t||!mobile())return;
  if(t.closest('#mobileMenu')){
   // Stop the old document-level handler from toggling the drawer a second time.
   e.preventDefault();e.stopImmediatePropagation();
   toggle();return;
  }
  if(!opened())return;
  if(t.closest('#z426-drawer-close'))return;
  if(t.closest('#appScreen .sidebar :is(button[data-page],button[data-nav],a[href],.z421-trial-entry,.z421-nav-entry,#logoutBtn)')){
   // Let the application's original navigation handler execute unmodified.
   close();return;
  }
  if(!t.closest('#appScreen .sidebar')&&!t.closest('#z424-lang-list,#z424-tools-menu')){
   // Tapping the background must always dismiss the drawer.
   close();
  }
 }
 function onTouchStart(e){
  if(!opened()||!e.touches||e.touches.length!==1||!e.target.closest('#appScreen .sidebar'))return;
  startX=e.touches[0].clientX;startY=e.touches[0].clientY;
 }
 function onTouchEnd(e){
  if(startX===null||!e.changedTouches||e.changedTouches.length!==1)return;
  const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;
  startX=null;startY=null;
  if(Math.abs(dx)<85||Math.abs(dx)<Math.abs(dy)*1.6)return;
  const isEnglish=lang().startsWith('en');
  if(isEnglish?dx<0:dx>0)close(true);
 }
 function queueReflect(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;reflect()})}
 function start(){
  if(!shell())return;
  // A previous app revision can leave mobile-drawer set through a route transition.
  document.body.classList.remove('mobile-drawer');
  closeButton();backdrop();reflect();
  document.addEventListener('click',capture,true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened()){e.preventDefault();close(true)}},true);
  document.addEventListener('touchstart',onTouchStart,{passive:true,capture:true});
  document.addEventListener('touchend',onTouchEnd,{passive:true,capture:true});
  window.addEventListener('resize',()=>{if(!mobile())close();else queueReflect()});
  window.addEventListener('orientationchange',close);
  window.addEventListener('popstate',close);
  window.addEventListener('hashchange',close);
  $('#zaviAdminLanguage')?.addEventListener('change',close);
  new MutationObserver(queueReflect).observe(document.body,{attributes:true,attributeFilter:['class']});
  new MutationObserver(queueReflect).observe(shell(),{attributes:true,attributeFilter:['hidden']});
  new MutationObserver(queueReflect).observe(shell(),{childList:true,subtree:true});
  // When navigating via the bottom navigation and other custom links, always
  // dismiss a previously opened menu without affecting the route.
  document.addEventListener('click',e=>{
   if(opened()&&e.target.closest('.mobile-bottom-nav,[data-page],.bottom-nav'))close();
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
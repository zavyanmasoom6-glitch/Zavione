/* ZAVI ONE 65.97 + ADMIN 1.4.43: reliable small round dashboard voice launcher.
 * Moves the EXISTING voice button out of responsive headers/sidebars which may be
 * display:none on mobile. Reuses the exact original click handler + owner gates.
 * This patch does not access or update financial records, user accounts or microphone.
 */
(()=>{'use strict';
if(window.ZaviVoiceFabV6597)return;
const FAB_ID='z196-launch',APP_ID='appScreen';
const $=(s,p=document)=>p.querySelector(s);
const MICROPHONE='<svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/></svg>';
const labels={
 fa:'باز کردن دستیار صوتی ZAVI ONE',
 ps:'د ZAVI ONE غږیز مرستیال پرانیستل',
 en:'Open ZAVI ONE voice assistant'
};
function appVisible(){
 const app=$('#'+APP_ID);
 if(app){
  if(app.hidden||app.getAttribute('aria-hidden')==='true')return false;
  const css=getComputedStyle(app);
  return css.display!=='none'&&css.visibility!=='hidden'&&css.opacity!=='0';
 }
 // The store web UI uses #content for its dashboard.
 const content=$('#content'),login=$('#loginScreen,#login,.login-screen,#authScreen');
 if(login&&!login.hidden&&getComputedStyle(login).display!=='none'&&getComputedStyle(login).visibility!=='hidden')return false;
 return !!content&&!content.hidden&&getComputedStyle(content).display!=='none';
}
function lang(){
 const v=String($('#zaviAdminLanguage,#zaviTopLanguage,#zaviSettingsLanguage')?.value||document.documentElement.lang||'fa').toLowerCase();
 return v.startsWith('ps')?'ps':v.startsWith('en')?'en':'fa';
}
function sync(){
 let btn=document.getElementById(FAB_ID);
 const voice=window.ZaviVoiceProV6596;
 if(!btn&&!voice)return;
 if(!btn){
  btn=document.createElement('button');btn.id=FAB_ID;btn.type='button';
  btn.addEventListener('click',()=>voice?.open?.());
 }
 if(btn.parentElement!==document.body)document.body.appendChild(btn);
 btn.classList.add('z197-dashboard-fab');
 if(btn.dataset.z197Version!=='1'){
  btn.replaceChildren();
  btn.insertAdjacentHTML('afterbegin',MICROPHONE);
  btn.dataset.z197Version='1';
  btn.setAttribute('aria-haspopup','dialog');
  btn.setAttribute('aria-controls','z196-voice');
 }
 const title=labels[lang()];
 btn.title=title;btn.setAttribute('aria-label',title);
 btn.hidden=!appVisible();
 // Keep voice FAB out of assistant's own full-screen listening modal.
 const dialog=$('#z196-voice');
 btn.dataset.z197PanelOpen=String(!!dialog&&!dialog.hidden);
}
let scheduled=false;
function schedule(){
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;sync()});
}
function init(){
 sync();
 // Login/session transitions often change only class, hidden or inline style.
 const app=$('#'+APP_ID);
 if(app)new MutationObserver(schedule).observe(app,{attributes:true,attributeFilter:['hidden','style','class','aria-hidden']});
 const content=$('#content');
 if(content)new MutationObserver(schedule).observe(content,{attributes:true,attributeFilter:['hidden','style','class']});
 // Direct body childList changes catch the original voice script installing late.
 new MutationObserver(schedule).observe(document.body,{childList:true});
 document.addEventListener('click',schedule,true);
 document.addEventListener('change',schedule,true);
 document.addEventListener('visibilitychange',schedule);
 window.addEventListener('focus',schedule);
 window.addEventListener('pageshow',schedule);
 window.ZaviVoiceFabV6597=Object.freeze({sync,version:'65.97'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
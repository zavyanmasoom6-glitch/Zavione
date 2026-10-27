/* ZAVI ONE V65.86 / ADMIN 1.4.32 — three independent settings sliders.
   UI-only controls; no alteration to ledgers, subscription, server authorization or offline lease rules. */
(()=>{'use strict';
const ADMIN=!!document.getElementById('appScreen')&&!!document.getElementById('zaviAdminLanguage');
const keys={text:'zavi_v6586_text_size',icon:'zavi_v6586_icon_size'};
const SYSKEY=ADMIN?'zavi_admin_ui_scale_v140':'zavi_display_percent_v6545';
const clamp=v=>{v=Number(v);return Number.isFinite(v)?Math.max(50,Math.min(150,Math.round(v/5)*5)):100};
const read=(key,def=100)=>{try{const v=localStorage.getItem(key);return v===null?def:clamp(v)}catch(_){return def}};
const state={system:read(SYSKEY),text:read(keys.text),icon:read(keys.icon)};
const words={
 fa:{header:'تنظیم سه اندازۀ مستقل',description:'اندازۀ سیستم، متن‌ها و آیکن‌ها را جداگانه تغییر دهید.',system:'اندازۀ سیستم',text:'اندازۀ نوشته‌ها',icon:'اندازۀ آیکن‌ها',reset:'عادی ۱۰۰٪',all:'بازگردانی هر سه به ۱۰۰٪',hint:'تغییر هر اسلایدر مستقل است و اطلاعات حسابداری تغییر نمی‌کند.',range:'درصد اندازه'},
 ps:{header:'درې جلا اندازې',description:'د سیسټم، لیکنو او نښو اندازه جلا جلا وټاکئ.',system:'د سیسټم اندازه',text:'د لیکنو اندازه',icon:'د نښو اندازه',reset:'عادي ۱۰۰٪',all:'درې واړه ۱۰۰٪ ته راوګرځوئ',hint:'دا یوازې بڼه بدلوي؛ محاسبوي معلومات نه بدلېږي.',range:'د اندازې سلنه'},
 en:{header:'Three independent sizes',description:'Adjust the interface, text and icon sizes independently.',system:'Interface size',text:'Text size',icon:'Icon size',reset:'Normal 100%',all:'Reset all three to 100%',hint:'Display settings do not change accounting data.',range:'Size percent'}
};
const language=()=>{const input=document.querySelector(ADMIN?'#zaviAdminLanguage':'#zaviSettingsLanguage');const lang=String(input?.value||document.documentElement.lang||'fa-AF').toLowerCase();return lang.startsWith('en')?'en':lang.startsWith('ps')?'ps':'fa'};
function write(key,val){try{localStorage.setItem(key,String(val))}catch(_){}}
function apply(){
 const html=document.documentElement,root=ADMIN?document.getElementById('appScreen'):html;
 for(const el of [html,root]){
  if(!el)continue;
  el.style.setProperty('--z86-text-scale',String(state.text/100));
  el.style.setProperty('--z86-icon-scale',String(state.icon/100));
  el.style.setProperty('--z86-ui-scale',String(state.system/100));
 }
 /* Never transform or zoom the entire app shell: it clips modals and drawers on tablets. */
 html.style.removeProperty('zoom');
 if(ADMIN)document.getElementById('appScreen')?.style.removeProperty('zoom');
}
function change(type,value){
 value=clamp(value);state[type]=value;
 if(type==='system'){
  write(SYSKEY,value);
  if(ADMIN){
   const old=document.getElementById('z424-scale-range');
   if(old){old.value=String(value);old.dispatchEvent(new Event('input',{bubbles:true}))}
   else{
    const root=document.getElementById('appScreen');
    root?.style.setProperty('--z425-ui-scale',String(value/100));
    root?.style.setProperty('--z425-ui-size',String(value));
   }
  }else{
   const api=window.ZaviDisplayScale;
   if(api?.set)api.set(value);
  }
 }else write(keys[type],value);
 apply();paintValues();
}
function labels(){
 const card=document.getElementById('z86-three-sliders');if(!card)return;
 const t=words[language()];
 card.querySelector('.z86-title').textContent=t.header;
 card.querySelector('.z86-description').textContent=t.description;
 card.querySelector('.z86-hint').textContent=t.hint;
 card.querySelector('[data-z86-all]').textContent=t.all;
 for(const type of ['system','text','icon']){
  const row=card.querySelector('[data-z86-row="'+type+'"]');
  row.querySelector('.z86-row-title').textContent=t[type];
  row.querySelector('.z86-reset').textContent=t.reset;
  row.querySelector('input').setAttribute('aria-label',t[type]+' — '+t.range);
 }
 paintValues();
}
function paintValues(){
 const card=document.getElementById('z86-three-sliders');if(!card)return;
 for(const type of ['system','text','icon']){
  const row=card.querySelector('[data-z86-row="'+type+'"]');
  if(!row)continue;
  row.querySelector('output').textContent=state[type]+'%';
  const slider=row.querySelector('input');
  if(Number(slider.value)!==state[type])slider.value=String(state[type]);
  row.querySelector('.z86-reset').disabled=state[type]===100;
 }
}
function mount(){
 const parent=ADMIN?document.getElementById('z424-size-card')?.parentElement?.querySelector('#z424-size-card'):document.getElementById('zavi-display-settings-v6545')?.querySelector('.zds-content');
 if(!parent)return;
 let card=document.getElementById('z86-three-sliders');
 if(card&&card.parentElement===parent){labels();return}
 if(card)card.remove();
 card=document.createElement('section');card.id='z86-three-sliders';card.className='z86-three-sliders';
 card.setAttribute('role','group');
 card.innerHTML='<header class="z86-header"><strong class="z86-title"></strong><p class="z86-description"></p></header>'+
 ['system','text','icon'].map(type=>'<div class="z86-row" data-z86-row="'+type+'"><div class="z86-label"><label class="z86-row-title" for="z86-'+type+'"></label><output for="z86-'+type+'">100%</output></div><input id="z86-'+type+'" type="range" min="50" max="150" value="100" step="5" aria-valuemin="50" aria-valuemax="150"><div class="z86-bottom"><small>50%</small><small>100%</small><small>150%</small><button type="button" class="z86-reset" data-z86-reset="'+type+'"></button></div></div>').join('')+
 '<div class="z86-end"><button type="button" data-z86-all></button><p class="z86-hint"></p></div>';
 parent.appendChild(card);
 card.addEventListener('input',e=>{const type=e.target.id.replace(/^z86-/,'');if(['system','text','icon'].includes(type))change(type,e.target.value)});
 card.addEventListener('click',e=>{const type=e.target.closest('[data-z86-reset]')?.dataset.z86Reset;if(type)change(type,100);else if(e.target.closest('[data-z86-all]'))for(const k of ['system','text','icon'])change(k,100)});
 labels();
}
let pending=false;
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;const card=document.getElementById('z86-three-sliders');const parent=ADMIN?document.getElementById('z424-size-card'):document.querySelector('#zavi-display-settings-v6545 .zds-content');if(parent&&(!card||card.parentElement!==parent))mount()})}
apply();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{
 mount();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
},{once:true});
else{mount();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true})}
document.addEventListener('change',e=>{if(e.target.matches('#zaviAdminLanguage,#zaviSettingsLanguage'))labels()});
window.addEventListener('storage',e=>{if(Object.values(keys).includes(e.key)||e.key===SYSKEY){state.system=read(SYSKEY);state.text=read(keys.text);state.icon=read(keys.icon);apply();labels()}});
window.ZaviThreeSizes=Object.freeze({get:()=>({...state}),set:(type,value)=>{if(['system','text','icon'].includes(type))change(type,value)}});
})();
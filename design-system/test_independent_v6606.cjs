'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('design-system/zavi-independent-commands-v6606.js','utf8');
const py=fs.readFileSync('design-system/apply_independent_v6606.py','utf8');
const css=fs.readFileSync('design-system/zavi-independent-commands-v6606.css','utf8');
assert(js.includes('id="z606-voice-title"')&&js.includes('id="z606-text-title"'));
assert(js.includes('id="z605-type"')&&js.includes('id="z605-execute"'));
assert(js.includes('window.ZaviVoiceLocalNativeEvent'));
assert(js.includes('ZaviAndroidLocalVoice.postMessage'));
assert(!js.includes('state.tab'),'Both controls must always be usable');
assert(!js.includes('new Audio(')&&!js.includes('speechSynthesis'),'No spoken answers');
assert(js.includes("if(source==='voice')stopVoice()"),'Typing must not control microphone');
assert(js.includes("if(source==='voice')state.heard=text"),'Only speech populates transcript');
assert(py.includes('zavi-premium-cloud-v6604\\.js'),'Remove cloud-first entry script');
assert(py.includes('window.__zaviIndependent606=true'),'Disable earlier assistant/onboarding');
assert(py.includes('cloud.js')&&py.includes('ZAVI_ADMIN_ALLOWED_EMAILS'));
assert(css.includes('.z606-section')&&css.includes('grid-template-columns:1fr 1fr'));
function make(admin){
 const log=[],native=[];
 const keys=admin?['overview','customers','devices','support','payments','finance','activity','health','brand','security','settings']:
 ['dashboard','sales','purchases','products','contacts','debtors','creditors','reports','settings','expenses','money','hawala','phonebook','journal','waste','repairs','subscription'];
 const nodes=keys.map(key=>({isConnected:true,disabled:false,dataset:admin?{page:key}:{go:key},
  textContent:key,closest:()=>null,getAttribute:()=>null,click:()=>log.push(key)}));
 const app={hidden:false},auth={hidden:true};
 const document={readyState:'loading',hidden:false,
  querySelector(s){
   if(s==='script[src*="zavi-voice-admin-v1442.js"]')return admin?{}:null;
   if(s==='#z704-welcome')return null;
   if(s==='#authScreen')return admin?auth:null;
   if(s==='#appScreen')return admin?app:null;
   if(s==='#loginScreen')return null;
   if(s==='#content')return admin?null:app;
   return null;
  },querySelectorAll:()=>nodes,addEventListener:()=>{}};
 const window={ZaviAndroidLocalVoice:{postMessage:s=>native.push(JSON.parse(s))},
  ZaviAdminAPI:{getMode:()=> 'live'},
  ZaviVoiceProV6596:{route:x=>({kind:x.includes('دو کیلو')?'draft':'unknown',key:'sales',draft:{party:'احمد',items:[{product:'برنج',quantity:2}]}})}};
 vm.runInNewContext(js,{window,document,console,Date,
 getComputedStyle:()=>({display:'block'}),
 localStorage:{getItem:()=>null,setItem:()=>{}},
 setInterval:()=>{}},{timeout:3000});
 return {api:window.ZaviDualCommand605,log,native,document,window};
}
const store=make(false);
for(const [sentence,key] of [['فروش را باز کن','sales'],['تنظیمات را باز کن','settings'],['بخش فروش باز کو','sales'],['گدام را باز کن','products'],['خرید را باز کن','purchases'],['د پلور برخه خلاصه کړه','sales'],['open settings','settings']]){
 const result=store.api.execute(sentence,'text');
 assert.equal(result.kind,'navigate',sentence);
 assert.equal(store.log.at(-1),key,'must click real '+key);
}
assert.equal(store.native.length,0,'Text executed without microphone or native stop/start');
assert.equal(store.api.execute('حذف تمام فروش','text').kind,'refuse');
assert.equal(store.api.execute('فروش دو کیلو برنج','text').kind,'draft');
const admin=make(true);
assert.equal(admin.api.execute('تنظیمات را باز کن','text').kind,'navigate');
assert.equal(admin.log.at(-1),'settings');
assert.equal(admin.api.execute('گزارش مالی را باز کن','text').kind,'navigate');
assert.equal(admin.log.at(-1),'finance');
assert.equal(admin.api.execute('فروش را باز کن','text').kind,'unknown');
assert.equal(admin.native.length,0);
console.log('PASS original in-app cloud, independent text without native microphone, separate listening card, Dari/Pashto/English routing, no output speech, owner-only ADMIN');

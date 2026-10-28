'use strict';
/* No browser, microphone, financial data or external network requests.
 * Regression test for mobile voice discoverability, authentication gating and themes.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('design-system/zavi-voice-fab-v6597.js','utf8');
const css=fs.readFileSync('design-system/zavi-voice-fab-v6597.css','utf8');
let clickHandlerRuns=0,ready=null;
const parent={};
const body={appendChild(node){node.parentElement=this},addEventListener(){}};
const app={hidden:false,getAttribute(){return null}};
const launcher={
 id:'z196-launch',parentElement:parent,dataset:{},hidden:true,
 classList:{add(x){launcher._class=x}},
 replaceChildren(){this._svg=''},
 insertAdjacentHTML(pos,markup){this._svg=markup},
 setAttribute(n,v){this[n]=v}
};
const dom={
 readyState:'loading',body,documentElement:{lang:'fa'},
 addEventListener(name,fn){if(name==='DOMContentLoaded')ready=fn},
 getElementById(id){return id==='z196-launch'?launcher:null},
 querySelector(s){if(s==='#appScreen')return app;if(s==='#z196-voice')return {hidden:true};return null}
};
const context={document:dom,window:{addEventListener(){},ZaviVoiceProV6596:{open(){clickHandlerRuns++}}},getComputedStyle(){return {display:'block',visibility:'visible',opacity:'1'}},MutationObserver:class{observe(){}},requestAnimationFrame(fn){fn()},console};
vm.runInNewContext(src,context,{timeout:2500});
assert.equal(typeof ready,'function');
ready();
assert.equal(launcher.parentElement,body,'old launcher must move out of hidden sidebar/header');
assert.equal(launcher.hidden,false);
assert.match(launcher._svg,/<svg /);
assert.match(launcher['aria-label'],/صوتی/);
app.hidden=true;
context.window.ZaviVoiceFabV6597.sync();
assert.equal(launcher.hidden,true,'voice launcher cannot appear on logout');
app.hidden=false;
context.window.ZaviVoiceFabV6597.sync();
assert.equal(launcher.hidden,false,'reappears on authenticated dashboard');
assert.match(css,/#z196-launch\.z197-dashboard-fab\[hidden\]/);
assert.match(css,/background:#ffffff!important/);
assert.match(css,/data-zavi-theme="dark"/);
assert.match(css,/border-radius:999px!important/);
assert.match(css,/min-height:46px!important/);
assert.match(css,/#z196-voice:not\(\[hidden\]\) \.z196-modal/);
const one=fs.readFileSync('design-system/zavi-voice-pro-v6596.js','utf8');
const admin=fs.readFileSync('design-system/zavi-voice-admin-v1442.js','utf8');
for(const js of [one,admin]){
 assert(js.includes('#sidebarLinks [data-go]'));
 assert(js.includes('#mobileBottom [data-go]'));
 assert(js.includes('DRAFT_ONLY'));
 assert(js.includes('isAppVisible()'));
}
console.log('PASS visible 46px round white/light and navy/dark microphone, login gating, bottom sheet and real mobile navigation aliases');

const {chromium}=require('playwright-core');
const {startServer}=require('./desktop-server.cjs');
const path=require('path'),fs=require('fs'),assert=require('node:assert/strict');
(async()=>{
 const started=await startServer(path.join(__dirname,'web'),48396);
 let browser;
 try{
  const candidates=[process.env.PROGRAMFILES+'\\Microsoft\\Edge\\Application\\msedge.exe',process.env['PROGRAMFILES(X86)']+'\\Microsoft\\Edge\\Application\\msedge.exe',process.env.LOCALAPPDATA+'\\Microsoft\\Edge\\Application\\msedge.exe'];
  const executablePath=candidates.filter(Boolean).find(x=>fs.existsSync(x));
  if(!executablePath)throw Error('Windows Edge missing');
  browser=await chromium.launch({executablePath,headless:true,args:['--no-first-run','--disable-gpu']});
  const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e).slice(0,350)));
  await page.goto(started.url+'?demo=1',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('#appScreen').isVisible(),true,'Admin app screen was not rendered');
  for(const route of ['overview','customers','payments','finance','brand','devices','support','activity','health','security','settings']){
   const data=await page.evaluate(target=>{
    page=target;render();
    const root=document.querySelector('#view'),txt=root?.innerText||'',first=root?.querySelector('.panel,section,.page-head,header');
    const css=first?getComputedStyle(first):null;
    return {route:target,length:txt.trim().length,count:root?.children.length||0,visible:!!css&&css.display!=='none'&&css.visibility!=='hidden'&&Number(css.opacity)>.04,html:root?.innerHTML.length||0,leak:/function\s+renderUSDOverview|db\.tx\.filter\(|const\s+ICON\s*=\s*\{/.test(txt)};
   },route);
   assert.ok(data.length>75&&data.count>0&&data.visible&&!data.leak,'Admin page is blank or hidden: '+JSON.stringify(data));
   console.log('ADMIN PASS '+JSON.stringify(data));
  }
  await page.evaluate(()=>{page='customers';render()});
  const action=page.locator('#view button:has-text("تمدید")').first();
  console.log('PASS demo mode and protected rendering, all 11 sections, request errors:',errors.length);
  if(errors.length)throw Error(errors.slice(0,5).join(' | '));
  await context.close();
 } finally{
  if(browser)await browser.close();
  await new Promise(resolve=>started.server.close(resolve));
 }
})().catch(e=>{console.error('ADMIN WINDOWS QA FAILED:',e.stack||String(e));process.exitCode=1});

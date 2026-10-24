const {chromium}=require('playwright-core');
const {startServer}=require('./desktop-server.cjs');
const path=require('path'),fs=require('fs'),assert=require('node:assert/strict');
(async()=>{
 const started=await startServer(path.join(__dirname,'web'),48793);
 let browser;
 try{
  const candidates=[process.env.PROGRAMFILES+'\\Microsoft\\Edge\\Application\\msedge.exe',process.env['PROGRAMFILES(X86)']+'\\Microsoft\\Edge\\Application\\msedge.exe',process.env.LOCALAPPDATA+'\\Microsoft\\Edge\\Application\\msedge.exe'];
  const executablePath=candidates.filter(Boolean).find(p=>fs.existsSync(p));
  if(!executablePath)throw Error('Edge browser not installed on Windows QA runner');
  browser=await chromium.launch({executablePath,headless:true,args:['--no-first-run','--disable-gpu']});
  const context=await browser.newContext({viewport:{width:1366,height:800},serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e).slice(0,400)));
  await page.goto(started.url,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForTimeout(1500);
  assert.equal(await page.evaluate(()=>typeof render==='function'),true,'Renderer is not running');
  if(await page.evaluate(()=>document.documentElement.classList.contains('zawi-locked'))){
   await page.locator('#zawiPinOne').fill('183729');
   if(await page.locator('#zawiPinRepeat').isVisible())await page.locator('#zawiPinRepeat').fill('183729');
   await page.locator('#zawiPinSubmit').click();await page.waitForTimeout(1200);
   assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('zawi-locked')),false,'Test PIN did not unlock');
  }
  for(const name of ['dashboard','products','purchases','sales','contacts','money','reports','settings']){
   const result=await page.evaluate(route=>{
    page=route;render();
    const root=document.getElementById('content'),txt=root?.innerText||'';
    const first=root?.querySelector('.page-head,.welcome,section,.card'),c=first?getComputedStyle(first):null;
    return {route,length:txt.trim().length,count:root?.children.length||0,
      sample:txt.slice(0,95),visible:!!c&&c.display!=='none'&&c.visibility!=='hidden'&&Number(c.opacity)>.04,
      codeLeak:/function\s+renderUSDOverview|db\.tx\.filter\(|const\s+ICON\s*=\s*\{/.test(txt)};
   },name);
   assert.ok(result.count>0&&result.length>75&&result.visible&&!result.codeLeak,'Page empty or hidden: '+JSON.stringify(result));
   console.log('PASS '+JSON.stringify(result));
  }
  await page.evaluate(()=>{page='dashboard';render()});
  assert.equal(await page.locator('#usdRateDashboardForm').count(),1,'Manual USD dashboard field missing');
  if(errors.length)throw Error('Uncaught JavaScript exceptions: '+errors.slice(0,4).join(' | '));
  console.log('PASS: 8 main store pages rendered on Windows Edge');
  await context.close();
 }finally{if(browser)await browser.close();await new Promise(resolve=>started.server.close(resolve));}
})().catch(e=>{console.error('WINDOWS UI QA FAILED',e.stack||String(e));process.exitCode=1});

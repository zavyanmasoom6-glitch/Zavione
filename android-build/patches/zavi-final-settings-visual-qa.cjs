"use strict";
const {chromium}=require("playwright-core");
const assert=require("node:assert/strict");
const path=require("node:path");
const ROOT=process.cwd();
async function verify(){
 const bin=require("node:child_process").execSync("command -v google-chrome || command -v chromium || command -v chromium-browser",{encoding:"utf8"}).trim().split("\n")[0];
 const browser=await chromium.launch({executablePath:bin,headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 const cases=[
  {name:"STORE",root:"content",klass:"settings-card",file:"zavi-final-settings-store-v6559.js",search:"zaviCleanSettingsSearch",selector:"zaviTopLanguage",items:[["فونت نوشته‌های سیستم","look"],["ظاهر برنامه","look"],["مدیریت عمومی کسب‌وکار","features"],["امنیت معلومات و فایل پشتیبان","cloud"],["آغاز دوباره","advanced"],["مشخصات فروشگاه","store"],["فاکتور و چاپ","invoice"]]},
  {name:"ADMIN",root:"view",klass:"panel",file:"zavi-final-settings-admin-v1410.js",search:"zaviCleanAdminSearch",selector:"zaviAdminLanguage",items:[["ظاهر برنامه","look"],["مرکز پیام‌ها و رسیدها","support"],["آدرس اتصال","connection"],["قوانین تمدید","renewal"],["تغییر رمز عبور شخصی","security"]]}
 ];
 for(const test of cases){
   const page=await browser.newPage({viewport:{width:390,height:844}});
   const errors=[];
   page.on("pageerror",error=>errors.push(error.message));
   const makeCards=()=>test.items.map(([title],i)=>'<section class="'+test.klass+'"><h2>'+title+'</h2><p>توضیح بخش</p><input id="original-field-'+i+'" aria-label="گزینه"/><button id="original-button-'+i+'">ثبت</button>'+
     (test.name==="STORE"&&i===2?'<div class="zavi-enable-all"><button id="zaviEnableAllFeatures">روشن‌کردن تمام بخش‌ها و امکانات</button></div>':'')+'</section>').join("");
   await page.setContent('<html lang="fa" data-zavi-theme="light"><head></head><body><select id="'+test.selector+'"><option value="fa" selected>دری</option><option value="en">English</option><option value="ps">پښتو</option></select><main id="'+test.root+'">'+makeCards()+'</main></body></html>');
   const src=path.join(ROOT,"android-build","patches");
   await page.addStyleTag({path:path.join(src,"zavi-final-settings-common-v1.css")});
   await page.addScriptTag({path:path.join(src,test.file)});
   const hub=page.locator(".zavi-clean-settings-hub");await hub.waitFor({state:"visible",timeout:8000});
   assert.equal(await page.locator("section."+test.klass).count(),test.items.length,"All original settings cards must be preserved");
   assert.equal(await page.locator("button[id^=original-button-]").count(),test.items.length,"Original control buttons must be preserved");
   assert.equal(await page.locator("input[id^=original-field-]").count(),test.items.length,"Original fields must be preserved");
   if(test.name==="STORE")assert.equal(await page.locator("#zaviEnableAllFeatures").count(),0,"Remove the confusing bulk-enable shortcut");
   for(const [title,category] of test.items){
     const card=page.locator("section."+test.klass).filter({hasText:title});
     assert.equal(await card.count(),1,title);
     assert.equal(await card.locator("xpath=ancestor::details").getAttribute("data-group"),category,title+" category");
   }
   const input=page.locator("#"+test.search);
   await input.fill(test.name==="STORE"?"فونت":"رمز");
   assert.equal(await page.locator("section."+test.klass+":visible").count(),1,"Search must narrow to the matching card");
   await input.fill("");
   const target=test.name==="STORE"?"#original-field-0":"#original-field-0";
   const details=page.locator(target).locator("xpath=ancestor::details");
   if((await details.getAttribute("open"))===null)await details.locator("summary").click();
   await page.locator(target).fill("test-value");
   assert.equal(await page.locator(target).inputValue(),"test-value","Original input stays interactive");
   await page.locator("#"+test.selector).selectOption("en");
   await page.locator("#"+test.root).evaluate((el,html)=>{el.innerHTML=html},makeCards());
   await page.waitForTimeout(150);
   assert.match(await hub.locator("strong").first().innerText(),/settings/i,"New UI labels follow English language");
   assert.equal(await page.locator("section."+test.klass).count(),test.items.length);
   assert.deepEqual(errors,[],"No uncaught Javascript errors");
   console.log("PASS",test.name,"groups, intact fields, removed shortcut, search, labels, dynamic rerender, phone width");
   await page.close();
 }
 await browser.close();
}
verify().catch(e=>{console.error(e);process.exitCode=1});

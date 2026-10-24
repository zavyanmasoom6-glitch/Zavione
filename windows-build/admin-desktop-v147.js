/* Admin desktop: no data writes; assist missing client rendering only */
(()=>{'use strict';document.documentElement.classList.add('zavi-admin-desktop');let faults=0;
window.addEventListener('error',()=>{faults++;setTimeout(check,150)});
window.addEventListener('unhandledrejection',()=>{faults++;setTimeout(check,150)});
function check(){const area=document.getElementById('view'),app=document.getElementById('appScreen');if(!area||!app||app.hidden)return;
const text=(area.innerText||'').trim();let box=document.getElementById('zaviAdminWinRecovery');
if(text.length>75&&faults<4){box?.remove();return}
if(box)return;
box=document.createElement('aside');box.id='zaviAdminWinRecovery';box.className='zavi-admin-win-notice';box.setAttribute('role','status');
const l=document.documentElement.lang||'fa';const title=document.createElement('strong');title.textContent=l.startsWith('en')?'Page not loaded':'صفحه به‌طور کامل بارگذاری نشده';
const message=document.createElement('span');message.textContent=l.startsWith('en')?'Check internet and sign in with the central owner account. Local data is never deleted.':'اتصال اینترنت و ورود با حساب مالک اصلی را بررسی کنید. این کار معلومات موجود را حذف نمی‌کند.';
const btn=document.createElement('button');btn.type='button';btn.textContent=l.startsWith('en')?'Try again':'تلاش دوباره';btn.onclick=()=>location.reload();
box.append(title,message,btn);area.prepend(box)}
function ready(){setTimeout(check,1600);setInterval(check,8500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
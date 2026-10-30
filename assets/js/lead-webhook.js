/* ENDURA / opt-in Google Apps Script notification. No credentials or payment data. */
export const LEAD_WEBHOOK='https://script.google.com/macros/s/AKfycby9WcUxmusBfaUzy7EiFj1cmyXdGEPAHayVRB0rN43SnomdnGDTk12T9lN2F6L6dft6/exec';
const clean=v=>String(v??'').trim();
const truncate=(v,n)=>clean(v).slice(0,n);
export async function sendLead({name,email,message,phone='',topic='',city='',consent=false}){
  if(!consent)throw Error('برای اطلاع‌رسانی به ایمیل، رضایت خود را تأیید کنید.');
  const nm=truncate(name,60),em=truncate(email,254);
  if(nm.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))throw Error('نام و ایمیل معتبر ضروری است.');
  const now=new Date();
  const extra=[`نوع درخواست: ${truncate(topic,120)}`,phone?`شماره تماس: ${truncate(phone,30)}`:'',city?`شهر: ${truncate(city,100)}`:'',truncate(message,650)].filter(Boolean).join(' | ');
  const u=new URL(location.href);
  const payload={name:nm,email:em,message:extra.slice(0,1000),country:'Iran',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'',local_time:now.toLocaleString('fa-IR'),tehran_time:now.toLocaleString('en-GB',{timeZone:'Asia/Tehran'}),lang:document.documentElement.lang||'fa',page:u.pathname+u.hash,referrer:document.referrer||'',utm:[...u.searchParams.entries()].filter(([k])=>k.startsWith('utm_')).map(([k,v])=>`${k}=${v}`).join('&'),locale:navigator.language||'fa-IR',ua:navigator.userAgent.slice(0,300)};
  // Apps Script Web App cannot provide reliable CORS response to static GitHub Pages.
  // no-cors text/plain avoids preflight, but the response is OPAQUE: sending != confirmed delivery.
  await fetch(LEAD_WEBHOOK,{method:'POST',mode:'no-cors',redirect:'follow',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload),keepalive:true});
  return {attempted:true,confirmed:false};
}

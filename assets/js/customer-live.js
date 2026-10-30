/* Customer data: Supabase Auth, customer_profiles/assets/addresses with RLS. */
import {remote} from './supabase-live.js';
import {db,e} from './store.js';
export const customerStatus={loading:false,connected:false};
const check=({error},msg)=>{if(error)throw Error(msg+': '+error.message)};
export async function loadCustomerData(){
 const user=remote.user;if(!remote.client||!user){customerStatus.connected=false;db.customer={name:'',email:'',phone:''};db.assets=[];db.addresses=[];return;}
 customerStatus.loading=true;
 try{
  const r=await remote.client.from('customer_profiles').select('id,full_name,phone,email').eq('id',user.id).maybeSingle();check(r,'بارگذاری پروفایل');
  let row=r.data;
  if(!row){const meta=user.user_metadata||{};const up=await remote.client.from('customer_profiles').upsert({id:user.id,full_name:meta.full_name||'',phone:meta.phone||'',email:user.email||''},{onConflict:'id'}).select().single();check(up,'ایجاد پروفایل');row=up.data;}
  db.customer={name:row.full_name||'',phone:row.phone||'',email:row.email||user.email||''};
  const [assets,addresses]=await Promise.all([remote.client.from('customer_assets').select('*').eq('customer_id',user.id),remote.client.from('customer_addresses').select('*').eq('customer_id',user.id)]);
  check(assets,'دارایی‌های مشتری');check(addresses,'آدرس‌های مشتری');
  db.assets=(assets.data||[]).map(a=>({id:a.id,type:a.asset_type,name:a.name,details:a.data?.details||''}));
  db.addresses=(addresses.data||[]).map(a=>({id:a.id,title:a.title||'',city:a.city,address:a.address}));customerStatus.connected=true;
 }finally{customerStatus.loading=false;}
}
export async function signInCustomer(email,password){
 if(!remote.client)throw Error('اتصال Supabase در دسترس نیست.');
 const r=await remote.client.auth.signInWithPassword({email,password});check(r,'ورود');remote.user=r.data.user;await loadCustomerData();return r.data;
}
export async function signUpCustomer({name,email,phone,password}){
 if(!remote.client)throw Error('اتصال Supabase در دسترس نیست.');
 if(String(name||'').trim().length<2)throw Error('نام کامل را وارد کنید.');
 if(!/^09\d{9}$/.test(String(phone||'')))throw Error('شماره موبایل معتبر وارد کنید.');
 const r=await remote.client.auth.signUp({email,password,options:{data:{full_name:name.trim(),phone:phone.trim()},emailRedirectTo:location.href.split('#')[0]+'#/account/profile'}});
 check(r,'ثبت‌نام');
 if(r.data.session&&r.data.user){remote.user=r.data.user;await loadCustomerData();}
 return {needsEmailConfirmation:!r.data.session};
}
export async function signOutCustomer(){if(!remote.client)return;const r=await remote.client.auth.signOut();check(r,'خروج');remote.user=null;customerStatus.connected=false;db.customer={name:'',phone:'',email:''};db.assets=[];db.addresses=[];}
export async function saveCustomerProfile({name,phone,email}){
 const user=remote.user;if(!user)throw Error('ابتدا وارد حساب کاربری شوید.');
 if(String(name).trim().length<2||!/^09\d{9}$/.test(String(phone)))throw Error('نام و شماره موبایل معتبر وارد کنید.');
 if(String(email).trim().toLowerCase()!==String(user.email).toLowerCase())throw Error('تغییر ایمیل باید از فرایند تأیید ایمیل Supabase انجام شود؛ این فرم ایمیل را تغییر نمی‌دهد.');
 const r=await remote.client.from('customer_profiles').upsert({id:user.id,full_name:name.trim(),phone:phone.trim(),email:user.email},{onConflict:'id'});check(r,'ذخیره اطلاعات');db.customer={name:name.trim(),phone:phone.trim(),email:user.email};return true;
}
export async function addCustomerAsset(d){const user=remote.user;if(!user)throw Error('ورود به حساب الزامی است.');const r=await remote.client.from('customer_assets').insert({customer_id:user.id,asset_type:d.type,name:d.name,data:{details:d.details||''}});check(r,'ذخیره دارایی');await loadCustomerData();}
export async function removeCustomerAsset(id){const user=remote.user;if(!user)throw Error('ورود به حساب الزامی است.');const r=await remote.client.from('customer_assets').delete().eq('customer_id',user.id).eq('id',id);check(r,'حذف دارایی');await loadCustomerData();}
export async function addCustomerAddress(d){const user=remote.user;if(!user)throw Error('ورود به حساب الزامی است.');const r=await remote.client.from('customer_addresses').insert({customer_id:user.id,title:d.title,city:d.city,address:d.address});check(r,'ذخیره آدرس');await loadCustomerData();}
export async function removeCustomerAddress(id){const user=remote.user;if(!user)throw Error('ورود به حساب الزامی است.');const r=await remote.client.from('customer_addresses').delete().eq('customer_id',user.id).eq('id',id);check(r,'حذف آدرس');await loadCustomerData();}
export async function savePurchaseInquiry({name,phone,email,city,products,notes,service}){
 if(!remote.user)return {saved:false,reason:'login-required'};
 const r=await remote.client.from('purchase_inquiries').insert({customer_id:remote.user.id,name,phone,email,city,product_summary:products,notes:notes||'',service:service||'delivery',status:'new'});check(r,'ذخیره درخواست خرید');return {saved:true};
}
export function customerAuthMarkup(){return `<section class="max section" style="max-width:960px"><div class="grid two auth-grid"><div class="card card-pad"><h2>ورود به حساب مشتری</h2><p class="muted small">برای مشاهده و تکمیل اطلاعات ذخیره‌شده در Supabase</p><form id="customerLoginForm" class="stack"><label class="label">ایمیل</label><input class="field latin" required type="email" name="email" autocomplete="email"><label class="label">رمز عبور</label><input class="field latin" required type="password" minlength="6" name="password" autocomplete="current-password"><button class="btn primary">ورود</button></form></div><div class="card card-pad"><h2>ثبت‌نام مشتری</h2><form id="customerSignupForm" class="stack"><label class="label">نام و نام خانوادگی</label><input class="field" name="name" required minlength="2"><label class="label">شماره موبایل</label><input class="field latin" name="phone" required pattern="09[0-9]{9}" inputmode="tel"><label class="label">ایمیل</label><input class="field latin" name="email" type="email" required><label class="label">رمز عبور</label><input class="field latin" name="password" type="password" required minlength="8" autocomplete="new-password"><label class="choice"><input type="checkbox" name="leadConsent" value="yes"><span class="small">موافقم اطلاعات تماس من برای پیگیری ثبت‌نام از طریق سرویس Google Sheets / ایمیل نیز ارسال شود (اختیاری).</span></label><button class="btn primary">ایجاد حساب</button></form><p class="muted tiny">در صورت فعال بودن تأیید ایمیل، لینک تأیید به ایمیل شما ارسال می‌شود.</p></div></div></section>`;}

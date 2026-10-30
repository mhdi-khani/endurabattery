import {remote} from './supabase-live.js';
import {e} from './store.js';
export function inquiriesPage(){return `<section class="max section"><div class="admin-head"><div><h1>درخواست‌های خرید ثبت‌شده</h1><p class="muted">فقط درخواست‌های کاربران احراز هویت‌شده در Supabase — ثبت درخواست، سفارش یا پرداخت محسوب نمی‌شود.</p></div><a class="btn ghost" href="#/admin/dashboard">بازگشت به داشبورد</a></div><div class="card card-pad" id="endura-inquiries">در حال دریافت اطلاعات…</div></section>`;}
export async function mountInquiries(){const area=document.getElementById('endura-inquiries');if(!area||!remote.admin||!remote.client)return;
 const {data,error}=await remote.client.from('purchase_inquiries').select('id,name,phone,email,city,product_summary,service,notes,status,created_at').order('created_at',{ascending:false}).limit(150);
 if(!document.getElementById('endura-inquiries'))return;
 if(error){area.textContent='خطا در دریافت درخواست‌ها: '+error.message;return;}
 if(!data?.length){area.textContent='هنوز درخواست خریدی ثبت نشده است.';return;}
 area.innerHTML=`<div class="table-wrap"><table class="table"><thead><tr><th>تاریخ</th><th>نام</th><th>تماس</th><th>شهر</th><th>محصول و خدمات</th><th>وضعیت</th></tr></thead><tbody>${data.map(i=>`<tr><td>${e(new Date(i.created_at).toLocaleString('fa-IR'))}</td><td>${e(i.name)}</td><td dir="ltr">${e(i.phone)}<br>${e(i.email)}</td><td>${e(i.city)}</td><td>${e(i.product_summary)}<br><small>${e(i.service)} ${e(i.notes||'')}</small></td><td>${e(i.status)}</td></tr>`).join('')}</tbody></table></div>`;
}

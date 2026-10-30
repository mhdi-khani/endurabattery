import {db, defaults, attachPersistence, e} from './store.js';
import {SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_BUCKET} from './supabase-config.js';

// Database rows are authoritative. Browser storage is used only for noncritical UX state
// (cart, city, comparison) and by the unrelated, explicitly labeled mock-order flow.
export const remote = {ready:false, error:null, admin:false, user:null, client:null, syncing:0, lastSaved:null};
const REMOTE_KEYS=new Set(['products','settings','cms','articles','coverage','agents']);
const snapshots={products:new Map(),articles:new Map(),coverage:new Map(),agents:new Map()};
let queue=Promise.resolve();
const notify=(message)=>window.dispatchEvent(new CustomEvent('endura:remote-error',{detail:message}));
const changed=()=>window.dispatchEvent(new Event('endura:remote-change'));
function assert({error}, message){if(error)throw Error(`${message}: ${error.message}`)}
const clone=x=>JSON.parse(JSON.stringify(x));
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function clearLocalCopies(){for(const k of REMOTE_KEYS)try{localStorage.removeItem('endura_v1_'+k)}catch{}}
function productRow(p){
 if(!p?.id||!p?.sku||!p?.name||!p?.brand||!['light','heavy','ups','solar'].includes(p.category))throw Error('محصول دارای شناسه، نام، برند یا دسته نامعتبر است.');
 if(typeof p.image==='string'&&p.image.startsWith('data:'))throw Error('تصویر محصول باید در Supabase Storage آپلود شود؛ تصویر Base64 قابل ثبت نیست.');
 return {id:String(p.id),sku:String(p.sku),name:String(p.name),brand:String(p.brand),category:p.category,price:p.price===null||p.price===''?null:Number(p.price),status:p.status==='inactive'?'inactive':p.status==='draft'?'draft':'active',image_url:p.image||null,data:clone(p)};
}
function articleRow(a){return {id:String(a.id),slug:String(a.slug),title:String(a.title),status:a.status||'published',data:clone(a)};}
function zoneRow(z){return {id:String(z.id),city:String(z.city),delivery:!!z.delivery,install:!!z.install,active:!!z.active,data:clone(z)};}
function agentRow(a){return {id:String(a.id),name:String(a.name),city:a.city||null,status:a.status||'pending',data:clone(a)};}
const mappings={products:{table:'products',serializer:productRow,deserialize:r=>({...r.data,id:r.id,sku:r.sku,name:r.name,brand:r.brand,category:r.category,price:r.price===null?null:Number(r.price),status:r.status,image:r.image_url||r.data?.image||'',stock:r.data?.stock??0})},articles:{table:'cms_articles',serializer:articleRow,deserialize:r=>({...r.data,id:r.id,slug:r.slug,title:r.title,status:r.status})},coverage:{table:'service_zones',serializer:zoneRow,deserialize:r=>({...r.data,id:r.id,city:r.city,delivery:r.delivery,install:r.install,active:r.active})},agents:{table:'agents',serializer:agentRow,deserialize:r=>({...r.data,id:r.id,name:r.name,city:r.city,status:r.status})}};
async function loadArray(key){
 const c=remote.client,m=mappings[key],res=await c.from(m.table).select('*').order('id',{ascending:true}).limit(1000);
 assert(res,`خواندن ${key}`);
 db[key]=(res.data||[]).map(m.deserialize);
 snapshots[key]=new Map(db[key].map(x=>[String(x.id),clone(m.serializer(x))]));
}
async function loadPublic(){
 await Promise.all([loadArray('products'),loadArray('articles'),loadArray('coverage')]);
 const r=await remote.client.from('site_settings').select('value').eq('key','public').maybeSingle();
 assert(r,'خواندن تنظیمات سایت');
 const v=r.data?.value||{};
 db.settings={...clone(defaults.settings),...(v.settings||{})};
 db.cms={...clone(defaults.cms),...(v.cms||{})};
 // Never silently re-enable demo coverage/agents or sample orders when connected to live data.
 db.orders=[];
 db.tickets=[];
 db.agents=[];
}
export async function refreshAdminData(){
 if(!remote.admin)return;
 await Promise.all([loadArray('products'),loadArray('articles'),loadArray('coverage'),loadArray('agents')]);
 changed();
}
async function getAdminRole(){
 const {data:{user},error}=await remote.client.auth.getUser();
 if(error||!user){remote.user=null;remote.admin=false;return false;}
 remote.user=user;
 const r=await remote.client.from('user_roles').select('role').eq('user_id',user.id).eq('role','admin').limit(1);
 assert(r,'بررسی دسترسی مدیر');
 remote.admin=(r.data||[]).some(x=>x.role==='admin');
 return remote.admin;
}
export async function bootSupabase(){
 try{
  // Pinned v2 module: requires internet when the site loads, and works on GitHub Pages.
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm');
  remote.client=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  await getAdminRole();
  await loadPublic();
  if(remote.admin)await refreshAdminData();
  clearLocalCopies();
  attachPersistence(persist);
  remote.ready=true;
  // Auth callbacks must not synchronously query Supabase inside callback.
  remote.client.auth.onAuthStateChange(()=>{setTimeout(async()=>{
    try{const old=remote.admin;await getAdminRole();if(remote.admin)await refreshAdminData();else if(old){await loadPublic();changed()}await import('./customer-live.js').then(m=>m.loadCustomerData());changed();}
    catch(err){console.error(err);notify('بررسی مجدد ورود مدیر ناموفق بود: '+err.message)}
  },0)});
  changed();
 }catch(err){console.error('Endura Supabase:',err);remote.error=err.message||String(err);remote.ready=false;changed();}
 return remote.ready;
}
export async function signInAdmin(email,password){
 if(!remote.client)throw Error('ارتباط Supabase برقرار نیست.');
 const r=await remote.client.auth.signInWithPassword({email,password});assert(r,'ورود به حساب');
 if(!await getAdminRole()){
  await remote.client.auth.signOut();remote.user=null;remote.admin=false;
  throw Error('حساب وارد شد، اما نقش admin در public.user_roles برای این حساب ثبت نشده است.');
 }
 await refreshAdminData();changed();return remote.user;
}
export async function signOutAdmin(){if(remote.client)await remote.client.auth.signOut();remote.user=null;remote.admin=false;await loadPublic();changed()}
export function adminLoginMarkup(){
 return `<section class="max section" style="max-width:610px;min-height:65vh"><div class="card card-pad" style="padding:30px"><div class="kicker">ENDURA BATTERY / SUPABASE</div><h1>ورود امن مدیر سایت</h1><p class="muted" style="margin-bottom:20px">برای مدیریت مشترک محصولات، بنرها و مقالات با ایمیل و رمز حساب مدیر Supabase وارد شوید.</p><form id="adminLoginForm" class="stack"><label class="label" for="adminEmail">ایمیل مدیر</label><input class="field latin" type="email" id="adminEmail" name="email" autocomplete="username" required placeholder="admin@example.com"><label class="label" for="adminPassword">رمز عبور</label><input class="field latin" type="password" id="adminPassword" name="password" autocomplete="current-password" required minlength="6"><button class="btn primary" type="submit">ورود به پنل مدیریت ←</button></form><div class="note" style="margin-top:19px">ورود نیازمند نقش <code>admin</code> در جدول <code>public.user_roles</code> است. نام کاربری و رمز داخل سورس سایت قرار ندارند.</div></div></section>`;
}
export function remoteErrorMarkup(){return `<section class="max section" style="max-width:840px"><div class="note danger"><h2>اتصال فروشگاه به Supabase برقرار نشد</h2><p style="margin:10px 0">${e(remote.error||'خطای نامشخص')}</p><p>اگر جدول‌ها هنوز ساخته نشده‌اند، فایل‌های SQL پوشه supabase را مطابق README اجرا کنید. سایت برای جلوگیری از نمایش اطلاعات قدیمی مرورگر، داده آزمایشی را جایگزین اطلاعات آنلاین نمی‌کند.</p><button class="btn primary" onclick="location.reload()">تلاش دوباره</button></div></section>`}
export function syncBadge(){return remote.syncing?'در حال ذخیره‌سازی…':remote.lastSaved?`آخرین ذخیره موفق: ${new Date(remote.lastSaved).toLocaleTimeString('fa-IR')}`:'متصل به Supabase'}
function persist(key){
 if(!REMOTE_KEYS.has(key))return Promise.resolve();
 if(!remote.admin)return Promise.reject(Error('برای تغییر اطلاعات سایت ابتدا باید با نقش مدیر وارد شوید.'));
 const p=queue.then(async()=>{
  remote.syncing++;changed();
  try{
   if(mappings[key])await persistCollection(key);
   else if(key==='settings'||key==='cms'){
    // Always save settings + CMS together to avoid lost updates between the two forms.
    const payload={settings:clone(db.settings),cms:clone(db.cms)};
    assert(await remote.client.from('site_settings').upsert({key:'public',value:payload,updated_at:new Date().toISOString()},{onConflict:'key'}),'ذخیره تنظیمات');
   }
   remote.lastSaved=Date.now();
  }catch(err){
    // Restore last known server values; do not leave an optimistic change looking committed.
    if(mappings[key])db[key]=[...snapshots[key].values()].map(mappings[key].deserialize);
    notify('ذخیره در Supabase ناموفق بود: '+err.message);changed();throw err;
   }
  finally{remote.syncing--;changed()}
 });
 queue=p.catch(()=>{});
 return p;
}
async function persistCollection(key){
 const c=remote.client,m=mappings[key],prior=snapshots[key],next=new Map(),changedRows=[];
 for(const item of db[key]){
   const row=m.serializer(item);next.set(String(item.id),row);
   if(!equal(row,prior.get(String(item.id))))changedRows.push(row);
 }
 const deleted=[...prior.keys()].filter(id=>!next.has(id));
 // Upserts (50 rows per request) + explicit deletes. No destructive full-table replace.
 for(let i=0;i<changedRows.length;i+=50)assert(await c.from(m.table).upsert(changedRows.slice(i,i+50),{onConflict:'id'}),`ذخیره ${key}`);
 for(const id of deleted)assert(await c.from(m.table).delete().eq('id',id),`حذف ${key}`);
 snapshots[key]=next;
}
export async function uploadPublicImage(file,prefix='products'){
 if(['localhost','127.0.0.1','[::1]'].includes(location.hostname) && new URLSearchParams(location.search).get('localDemo')==='1' && remote.admin && !remote.client){
  if(!file||!file.type.startsWith('image/'))throw Error('فایل تصویر معتبر نیست.');
  if(file.size>380*1024)throw Error('در دموی محلی تصویر را به کمتر از ۳۸۰ کیلوبایت فشرده کنید؛ آپلود تصاویر بزرگ در Supabase واقعی انجام می‌شود.');
  return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('خواندن تصویر انجام نشد.'));reader.readAsDataURL(file);});
 }

 if(!remote.admin)throw Error('فقط مدیر می‌تواند تصویر آپلود کند.');
 if(!file||!file.type.startsWith('image/'))throw Error('یک فایل تصویر معتبر انتخاب کنید.');
 if(file.size>8*1024*1024)throw Error('حجم تصویر نباید بیش از ۸ مگابایت باشد.');
 const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
 const path=`${prefix}/${crypto.randomUUID()}.${ext}`;
 const r=await remote.client.storage.from(SUPABASE_BUCKET).upload(path,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
 assert(r,'آپلود تصویر');
 return remote.client.storage.from(SUPABASE_BUCKET).getPublicUrl(path).data.publicUrl;
}

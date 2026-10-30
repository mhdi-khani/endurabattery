import {seedProducts} from './seed-products.js';
export const CAT={light:{label:'باتری خودروی سبک',short:'خودروی سبک',icon:'🚗',desc:'باتری مناسب خودروهای سواری، شاسی‌بلند و وانت سبک'},heavy:{label:'باتری خودروی سنگین',short:'خودروی سنگین',icon:'🚛',desc:'باتری کامیون، کامیونت، اتوبوس و ماشین‌آلات'},ups:{label:'باتری UPS',short:'UPS',icon:'🔋',desc:'باتری مناسب سیستم‌های برق اضطراری و تجهیزات پشتیبان'},solar:{label:'باتری سولار',short:'سولار',icon:'☀️',desc:'باتری‌های ذخیره‌سازی انرژی خورشیدی'}};
export const demoArticles=[
 {id:'A1',slug:'car-battery-guide',category:'راهنمای خرید',title:'راهنمای انتخاب باتری مناسب خودرو',excerpt:'چطور ظرفیت، ابعاد، قطب‌بندی و فناوری باتری را برای خودروی خود بررسی کنیم؟',icon:'🚗',body:'انتخاب باتری صرفاً بر اساس آمپرساعت کافی نیست. ظرفیت پیشنهادی خودرو، ابعاد محفظه، قطب‌بندی، فناوری موردنیاز و شرایط گارانتی باید بررسی شوند. در خودروهای مجهز به استارت-استاپ، جایگزینی فناوری باتری بدون بررسی سازگاری توصیه نمی‌شود.'},
 {id:'A2',slug:'ups-battery-guide',category:'آموزش فنی',title:'راهنمای خرید باتری برای UPS',excerpt:'آشنایی با ولتاژ، ظرفیت، ابعاد و سازگاری با دستگاه UPS.',icon:'🔌',body:'باتری UPS باید با ولتاژ، طراحی و مشخصات شارژ دستگاه سازگار باشد. زمان برق‌دهی به توان مصرفی، ظرفیت مؤثر باتری، راندمان و شرایط بهره‌برداری بستگی دارد. قبل از سفارش، مدل دستگاه و مشخصات باتری قبلی را بررسی کنید.'},
 {id:'A3',slug:'solar-battery-guide',category:'انرژی خورشیدی',title:'باتری خورشیدی مناسب چه ویژگی‌هایی دارد؟',excerpt:'مروری بر فناوری، انرژی قابل استفاده و چرخه عمر باتری‌های ذخیره‌ساز.',icon:'☀️',body:'در سیستم‌های خورشیدی، انرژی موردنیاز بر حسب کیلووات‌ساعت، عمق دشارژ مجاز، سازگاری با شارژر و چرخه عمر عوامل اصلی انتخاب هستند. ظرفیت نامی به‌تنهایی معادل انرژی قابل استفاده نیست.'},
 {id:'A4',slug:'battery-care',category:'نگهداری',title:'چند نکته مهم برای افزایش عمر باتری',excerpt:'نکاتی برای نگهداری باتری و شناخت علائم نیاز به بررسی.',icon:'🛠️',body:'بررسی صحیح سیستم شارژ، جلوگیری از اتصالات نامناسب و انتخاب باتری متناسب با کاربرد به نگهداری بهتر کمک می‌کند. در صورت مشاهده علائم اختلال، عیب‌یابی باید توسط فرد متخصص انجام شود.'}
];
export const faqData=[
 ['آیا امکان پرداخت در محل وجود دارد؟','بله، در صورت فعال بودن این روش برای محصول و محدوده شما می‌توانید در زمان تحویل با روش پرداخت مورد تأیید سایت تسویه کنید.'],
 ['آیا نصب باتری در محل انجام می‌شود؟','بسته به نوع باتری و پوشش شبکه عاملان، ارسال و نصب در محل قابل انتخاب است. قبل از ثبت سفارش امکان خدمات بررسی می‌شود.'],
 ['اگر آنلاین پرداخت کنم و باتری تأمین نشود چه می‌شود؟','پیش از پرداخت بررسی اولیه انجام می‌شود. در صورت عدم تأمین نهایی، گزینه جایگزین با رضایت شما یا فرایند بازپرداخت ارائه خواهد شد.'],
 ['گارانتی باتری چگونه بررسی می‌شود؟','شرایط هر محصول در صفحه همان محصول درج می‌شود و وضعیت معتبر گارانتی از طریق اطلاعات فاکتور و سریال قابل پیگیری خواهد بود.'],
 ['باتری فرسوده دریافت می‌شود؟','در دسته‌ها و مناطق تحت پوشش، می‌توانید تمایل به تحویل باتری فرسوده را ثبت کنید؛ ارزش نهایی مطابق ضوابط تأیید خواهد شد.']
];
const KEY='endura_v1_';
export const defaults={
 settings:{siteName:'Endura Battery',tagline:'انرژی مطمئن برای هر مسیر',supportPhone:'',supportEmail:'',primaryColor:'#8056CF',heroTitle:'انرژی مطمئن، برای هر مسیر',heroSubtitle:'باتری مناسب خودرو، سیستم برق اضطراری و ذخیره انرژی را از یک فروشگاه تخصصی انتخاب کنید.',heroButton:'مشاهده محصولات',heroLink:'#/shop',heroImage:'assets/images/hero-nexus-scene.svg',announcement:'ارسال و نصب در مناطق تحت پوشش • پرداخت آنلاین یا در محل',deliveryFee:120000,installationFee:180000,usedBatteryCredit:0,onlinePaymentEnabled:true,payOnDeliveryEnabled:true,maintenance:false},
 coverage:[{id:'Z1',city:'تهران',install:true,delivery:true,active:true,note:'پوشش نمونه؛ نیازمند تأیید عملیاتی'},{id:'Z2',city:'اصفهان',install:true,delivery:true,active:true,note:'پوشش نمونه؛ نیازمند تأیید عملیاتی'},{id:'Z3',city:'مشهد',install:false,delivery:true,active:true,note:'پوشش نمونه؛ نیازمند تأیید عملیاتی'},{id:'Z4',city:'شیراز',install:false,delivery:true,active:true,note:'پوشش نمونه؛ نیازمند تأیید عملیاتی'}],
 agents:[{id:'AG-101',name:'عامل نمونه تهران',city:'تهران',phone:'',status:'active',delivery:true,install:true,capacity:8,score:94},{id:'AG-102',name:'عامل نمونه اصفهان',city:'اصفهان',phone:'',status:'active',delivery:true,install:true,capacity:5,score:91},{id:'AG-103',name:'عامل نمونه مشهد',city:'مشهد',phone:'',status:'active',delivery:true,install:false,capacity:6,score:87}],
 products:seedProducts,
 articles:demoArticles,
 orders:[{id:'ED-1001',created:'2026-10-29T09:25:00',customer:'مشتری نمونه',phone:'09120000000',city:'تهران',address:'آدرس نمونه',items:[{id:'EN-0001',qty:1,price:6399000}],paymentMethod:'online',paymentStatus:'paid',fulfillment:'pending',status:'sourcing',service:'installation',total:6399000,agentId:null,note:'سفارش نمایشی برای بررسی پنل',sample:true}],
 tickets:[{id:'T-1001',name:'مشتری نمونه',subject:'نمونه درخواست پشتیبانی',message:'پیام آزمایشی پنل',status:'open',date:'2026-10-29',orderId:'ED-1001'}],
 cart:[],assets:[],addresses:[],compare:[],city:'',province:'',customer:{name:'',phone:'',email:''},favorites:[],cms:{categoryText:{},footerAbout:'Endura Battery یک فروشگاه تخصصی باتری با تمرکز بر انتخاب آسان و خدمات شفاف است.'},leads:[],activity:[]
};
const hasStorage=()=>{try{return !!window.localStorage}catch(e){return false}};
function load(k){if(!hasStorage())return null;try{const x=localStorage.getItem(KEY+k);return x===null?null:JSON.parse(x)}catch{return null}}
export const db={};
for(const [key,val] of Object.entries(defaults))db[key]=load(key)??JSON.parse(JSON.stringify(val));
let remotePersistence=null;
export function attachPersistence(handler){remotePersistence=handler;}
export function save(k){
 if(remotePersistence&&['products','settings','cms','articles','coverage','agents'].includes(k))return remotePersistence(k);
 try{localStorage.setItem(KEY+k,JSON.stringify(db[k]))}catch(err){console.warn('Storage full',err)}
 return Promise.resolve();
}
export function update(k,value){db[k]=value;save(k);window.dispatchEvent(new Event('endura:update'))}
export function log(action,details=''){db.activity.unshift({action,details,date:new Date().toISOString()});db.activity=db.activity.slice(0,120);save('activity')}
export function resetDemo(){for(const k of Object.keys(defaults)){localStorage.removeItem(KEY+k);db[k]=JSON.parse(JSON.stringify(defaults[k]))}}
export function uid(prefix='ED'){return prefix+'-'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(-4).toUpperCase()}
export const fmt=x=>Number(x||0).toLocaleString('fa-IR');
export const money=x=>x==null?'نیازمند استعلام':fmt(x)+' تومان';
export const e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const validProduct=p=>p&&p.status!=='inactive';
export function product(id){return db.products.find(p=>p.id===id)}
export function order(id){return db.orders.find(p=>p.id===id)}
export function filterProducts(category,query='',brands=[],min=0,max=Infinity){return db.products.filter(p=>validProduct(p)&&(!category||p.category===category)&&(!brands.length||brands.includes(p.brand))&&(p.price===null ||(p.price>=min&&p.price<=max))&&(`${p.name} ${p.brand} ${p.capacity} ${p.sku}`).toLowerCase().includes(query.toLowerCase()))}
export function cartTotal(){return db.cart.reduce((s,item)=>s+(product(item.id)?.price||0)*item.qty,0)}
export function cartRequiresQuote(){return db.cart.some(item=>product(item.id)?.price==null)}
export function addToCart(id,qty=1){const p=product(id);if(!p)return false;if(p.price==null)return false;const existing=db.cart.find(x=>x.id===id);if(existing)existing.qty+=qty;else db.cart.push({id,qty});save('cart');return true}
export function labels(){return [...new Set(db.products.map(p=>p.brand))].sort((a,b)=>a.localeCompare(b,'fa'))}
export const payLabel={online:'پرداخت آنلاین',cod:'پرداخت در محل'};
export const statusLabel={sourcing:'در حال بررسی تأمین',accepted:'تأمین تأیید شد',preparing:'آماده‌سازی',shipping:'در مسیر ارسال',installing:'در حال نصب',completed:'تکمیل‌شده',exception:'نیازمند بررسی',cancelled:'لغوشده'};

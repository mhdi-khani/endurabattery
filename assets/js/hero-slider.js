/* Endura Battery: CMS-powered, RTL-aware hero slider.
 * GitHub path: assets/js/hero-slider.js
 * Data: public.site_settings.value.cms.heroSlides (via existing store + Supabase persistence).
 */
import {db, save, e} from './store.js';
import {remote, uploadPublicImage} from './supabase-live.js';

let disposeSlider = () => {};
const FOLDER = 'assets/images/hero-slider/';

const INITIAL = [
  ['انرژی برای تمام مسیرها','راهکارهای باتری برای خودرو، صنعت و انرژی خورشیدی','مشاهده محصولات','#/shop','energy-universe.webp','ENERGY SOLUTIONS'],
  ['قدرت مطمئن برای هر استارت','باتری خودروهای سبک و سنگین','باتری خودرو','#/category/light','car-starter-power.webp','CAR BATTERIES'],
  ['انرژی پایدار، بدون وقفه','باتری سیستم‌های برق اضطراری و UPS','باتری UPS','#/category/ups','ups-datacenter.webp','UPS POWER'],
  ['انرژی خورشید را ذخیره کن','راهکارهای ذخیره انرژی خورشیدی','باتری سولار','#/category/solar','solar-storage.webp','SOLAR ENERGY'],
  ['انرژی همراه تمام مسیرها','خدمات ارسال و نصب در مناطق تحت پوشش','مشاهده خدمات','#/services','energy-road.webp','EVERY JOURNEY'],
  ['یک انتخاب، نیازهای متفاوت','همه گروه‌های باتری در یک فروشگاه تخصصی','مشاهده فروشگاه','#/shop','endura-solutions.webp','ENDURA BATTERY']
];

function templateSlides(){
  return INITIAL.map(([title,description,cta,url,image,badge],index)=>({
    id:'default-'+(index+1),title,description,cta,url,badge,image,
    mobileImage:'',position:'center',mobilePosition:'center',active:true
  }));
}
function storedSlides(){
  const rows = db.cms?.heroSlides;
  return Array.isArray(rows) ? rows : templateSlides();
}
function pathOf(input){
  const s = String(input??'').trim();
  if(!s)return '';
  if(/^https:\/\//i.test(s))return s;
  if(/^data:image\/(?:png|jpeg|webp);base64,/i.test(s) && ['localhost','127.0.0.1','[::1]'].includes(location.hostname) && new URLSearchParams(location.search).get('localDemo')==='1')return s;
  // Never allow javascript: / data: URL or project-root paths (broken on GitHub Pages).
  if(/^([a-z]+:|\/|\\|\.\.\/)/i.test(s))return '';
  if(s.startsWith('./'))return s.slice(2);
  if(s.includes('/'))return s;
  return FOLDER+s; // bare filenames of any name or extension are supported
}
function safeLink(link){
  const s=String(link??'').trim();
  return s.startsWith('#/') || /^https:\/\//i.test(s) ? s : '#/shop';
}
function imgPosition(v){
  return {left:'left center',center:'center center',right:'right center'}[v] || 'center center';
}
function mobileImgPosition(v){
  return {left:'left center',center:'center center',right:'right center'}[v] || 'center center';
}
function fallbackSlide(){
  return {title:db.settings.heroTitle||'Endura Battery',description:db.settings.heroSubtitle||'',cta:db.settings.heroButton||'مشاهده محصولات',url:db.settings.heroLink||'#/shop',badge:'ENDURA BATTERY',image:db.settings.heroImage||'assets/images/hero-nexus-scene.svg',position:'center',mobilePosition:'center',active:true};
}

export function mountHeroSlider(){
  disposeSlider(); disposeSlider=()=>{};
  mountHeroSliderAdmin(); // Also runs on #/admin/content; no app.js change needed.
  const root=document.querySelector('.hero-campaign');
  if(!root)return;
  const copy=root.querySelector('.hero-copy');
  const title=copy?.querySelector('h1');
  const description=copy?.querySelector('p');
  const primaryLink=copy?.querySelector('.hero-actions a');
  const badge=copy?.querySelector('.hero-badge');
  if(!title||!description||!primaryLink)return;
  let slides=storedSlides().filter(s=>s&&s.active!==false&&pathOf(s.image));
  if(!slides.length)slides=[fallbackSlide()];
  root.querySelector('.hero-image')?.remove();
  root.classList.add('endura-slider');
  root.setAttribute('aria-roledescription','اسلایدر');
  root.setAttribute('aria-label','بنرهای تبلیغاتی اندورا باتری');

  const layers=document.createElement('div');layers.className='endura-slides';
  layers.setAttribute('aria-hidden','true');
  const panes=slides.map((slide,i)=>{
    const layer=document.createElement('div');layer.className='endura-slide'+(i===0?' is-active':'');
    const picture=document.createElement('picture');
    const mobile=pathOf(slide.mobileImage);
    if(mobile){const source=document.createElement('source');source.media='(max-width: 830px)';source.srcset=mobile;picture.append(source);}
    const img=document.createElement('img');
    img.src=pathOf(slide.image);img.alt='';img.decoding='async';
    img.loading=i===0?'eager':'lazy';
    if(i===0)img.fetchPriority='high';
    img.style.objectPosition=imgPosition(slide.position);
    img.style.setProperty('--mobile-position',mobileImgPosition(slide.mobilePosition));
    img.addEventListener('error',()=>{
      const backup=pathOf(db.settings.heroImage||'assets/images/hero-nexus-scene.svg');
      if(img.getAttribute('src')!==backup){picture.querySelector('source')?.remove();img.src=backup;}
    },{once:true});
    picture.append(img);layer.append(picture);layers.append(layer);return layer;
  });
  root.prepend(layers);
  // Keep the text region on the empty/right side of the provided Endura visuals.
  copy.setAttribute('aria-live','off');
  const actions=copy.querySelector('.hero-actions');
  const secondaryLink=actions?.querySelectorAll('a')[1];
  if(secondaryLink){secondaryLink.hidden=true;secondaryLink.style.display='none';}

  const controls=document.createElement('div');controls.className='endura-slider-controls';
  controls.setAttribute('aria-label','کنترل اسلایدها');
  if(slides.length>1){
    controls.innerHTML=`<button type="button" class="endura-slide-arrow" data-hero-prev aria-label="اسلاید قبلی">&#10095;</button>
      <div class="endura-slide-dots">${slides.map((_,i)=>`<button type="button" class="endura-slide-dot" data-hero-index="${i}" aria-label="رفتن به اسلاید ${i+1}" aria-current="${i===0}"></button>`).join('')}</div>
      <button type="button" class="endura-slide-arrow" data-hero-next aria-label="اسلاید بعدی">&#10094;</button>`;
    root.append(controls);
  }
  const dots=[...controls.querySelectorAll('.endura-slide-dot')];
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let current=0,timer=null,startX=null;
  function show(i){
    current=(i+slides.length)%slides.length;
    panes.forEach((pane,j)=>pane.classList.toggle('is-active',j===current));
    dots.forEach((dot,j)=>dot.setAttribute('aria-current',String(j===current)));
    const s=slides[current];
    title.textContent=s.title||'';description.textContent=s.description||'';
    primaryLink.textContent=(s.cta||'مشاهده محصولات')+' ←';primaryLink.href=safeLink(s.url);
    if(badge)badge.textContent=s.badge||'ENDURA BATTERY';
  }
  function stop(){if(timer!==null)clearInterval(timer);timer=null;}
  function start(){stop();if(slides.length>1&&!reduceMotion.matches&&!document.hidden&&!root.matches(':hover'))timer=setInterval(()=>show(current+1),6500);}
  function click(event){
    const btn=event.target.closest('button');if(!btn)return;
    if(btn.hasAttribute('data-hero-prev'))show(current-1);
    else if(btn.hasAttribute('data-hero-next'))show(current+1);
    else if(btn.hasAttribute('data-hero-index'))show(Number(btn.dataset.heroIndex));
    else return;
    start();
  }
  function onKey(event){
    if(event.key==='ArrowLeft'){show(current+1);event.preventDefault();start();}
    if(event.key==='ArrowRight'){show(current-1);event.preventDefault();start();}
  }
  function onTouchStart(event){startX=event.changedTouches[0]?.clientX??null;}
  function onTouchEnd(event){
    if(startX===null)return;
    const diff=(event.changedTouches[0]?.clientX??startX)-startX;
    if(Math.abs(diff)>50){show(current+(diff>0?-1:1));start();}
    startX=null;
  }
  function onVisibility(){document.hidden?stop():start();}
  function onHoverStop(){stop();}
  function onHoverStart(){start();}
  function onReduce(){start();}
  controls.addEventListener('click',click);
  controls.addEventListener('keydown',onKey);
  root.addEventListener('touchstart',onTouchStart,{passive:true});
  root.addEventListener('touchend',onTouchEnd,{passive:true});
  root.addEventListener('mouseenter',onHoverStop);
  root.addEventListener('mouseleave',onHoverStart);
  document.addEventListener('visibilitychange',onVisibility);
  reduceMotion.addEventListener?.('change',onReduce);
  show(0);start();
  disposeSlider=()=>{
    stop();document.removeEventListener('visibilitychange',onVisibility);
    reduceMotion.removeEventListener?.('change',onReduce);
    controls.removeEventListener('click',click);controls.removeEventListener('keydown',onKey);
    root.removeEventListener('touchstart',onTouchStart);root.removeEventListener('touchend',onTouchEnd);
    root.removeEventListener('mouseenter',onHoverStop);root.removeEventListener('mouseleave',onHoverStart);
  };
}

function editorRow(slide={}){
 const label=(title,name,val,full=false)=>`<label class="endura-editor-field ${full?'full':''}"><span>${title}</span><input class="field" name="${name}" value="${e(val??'')}"></label>`;
 const option=(value,selected,label)=>`<option value="${value}" ${selected===value?'selected':''}>${label}</option>`;
 return `<article class="endura-editor-slide">
 <div class="endura-editor-top"><strong>اسلاید <span data-hero-number></span></strong><div class="endura-editor-moves"><button type="button" class="btn ghost sm" data-hero-admin="up" title="بالا">↑</button><button type="button" class="btn ghost sm" data-hero-admin="down" title="پایین">↓</button><button type="button" class="btn danger sm" data-hero-admin="remove">حذف</button></div></div>
 <div class="endura-editor-grid">
  ${label('عنوان','title',slide.title,true)}
  ${label('توضیح','description',slide.description,true)}
  ${label('متن دکمه','cta',slide.cta)}
  ${label('لینک دکمه (مثلاً #/shop)','url',slide.url)}
  ${label('برچسب کوچک','badge',slide.badge)}
  <label class="endura-editor-field"><span>وضعیت نمایش</span><select class="field" name="active">${option('true',String(slide.active!==false),'فعال')}${option('false',String(slide.active!==false),'غیرفعال')}</select></label>
  ${label('آدرس تصویر دسکتاپ (هر نام دلخواه)','image',slide.image,true)}
  <label class="endura-editor-field full"><span>یا آپلود تصویر دسکتاپ در Supabase</span><input class="field" name="desktopFile" type="file" accept="image/png,image/jpeg,image/webp,image/avif"></label>
  ${label('تصویر موبایل (اختیاری؛ URL یا نام فایل)','mobileImage',slide.mobileImage,true)}
  <label class="endura-editor-field full"><span>یا آپلود تصویر موبایل در Supabase</span><input class="field" name="mobileFile" type="file" accept="image/png,image/jpeg,image/webp,image/avif"></label>
  <label class="endura-editor-field"><span>جایگاه سوژه در دسکتاپ</span><select class="field" name="position">${option('left',slide.position,'چپ')}${option('center',slide.position,'وسط')}${option('right',slide.position,'راست')}</select></label>
  <label class="endura-editor-field"><span>جایگاه سوژه در موبایل</span><select class="field" name="mobilePosition">${option('left',slide.mobilePosition,'چپ')}${option('center',slide.mobilePosition,'وسط')}${option('right',slide.mobilePosition,'راست')}</select></label>
 </div><div class="endura-editor-preview"><img alt="پیش‌نمایش اسلاید" src="${e(pathOf(slide.image)||'assets/images/hero-nexus-scene.svg')}" loading="lazy"><span>پیش‌نمایش تصویر؛ متون روی فضای تیره سمت راست می‌آیند</span></div>
 </article>`;
}
function numberRows(holder){[...holder.children].forEach((node,i)=>{const n=node.querySelector('[data-hero-number]');if(n)n.textContent=String(i+1);});}

export function mountHeroSliderAdmin(){
 const oldForm=document.querySelector('#heroForm');
 if(!oldForm||!remote.admin)return;
 const card=oldForm.closest('.card');
 if(!card)return;
 card.classList.add('endura-editor-panel');
 card.innerHTML=`<h3>مدیریت اسلایدر صفحه اصلی</h3>
 <p class="muted small" style="margin:6px 0 14px">ترتیب اسلایدها، متن، تصویر دسکتاپ/موبایل و لینک را اینجا مدیریت کنید. نام فایل آزاد است؛ آپلودها به Supabase Storage می‌روند.</p>
 <form id="enduraHeroSlidesForm"><div class="endura-editor-list">${storedSlides().map(editorRow).join('')}</div>
 <div class="endura-editor-toolbar"><button type="button" class="btn ghost sm" data-hero-admin="add">+ افزودن اسلاید</button><button type="submit" class="btn primary">ذخیره همه اسلایدها در Supabase</button></div>
 <div class="note" data-hero-admin-status aria-live="polite">تغییرها فقط پس از کلیک روی «ذخیره» منتشر می‌شوند.</div></form>`;
 const form=card.querySelector('#enduraHeroSlidesForm');
 const holder=card.querySelector('.endura-editor-list');
 const status=card.querySelector('[data-hero-admin-status]');
 numberRows(holder);
 form.addEventListener('change',event=>{
   if(event.target.name==='desktopFile' && event.target.files?.[0]){
     const img=event.target.closest('.endura-editor-slide')?.querySelector('.endura-editor-preview img');
     if(img){ if(img.dataset.previewUrl)URL.revokeObjectURL(img.dataset.previewUrl); img.dataset.previewUrl=URL.createObjectURL(event.target.files[0]);img.src=img.dataset.previewUrl;}
   }
 });
 form.addEventListener('input',event=>{
   if(event.target.name==='image'){
     const preview=event.target.closest('.endura-editor-slide')?.querySelector('.endura-editor-preview img');
     if(preview&&pathOf(event.target.value))preview.src=pathOf(event.target.value);
   }
 });
 form.addEventListener('click',event=>{
  const btn=event.target.closest('[data-hero-admin]');if(!btn)return;
  const action=btn.dataset.heroAdmin;
  const row=btn.closest('.endura-editor-slide');
  if(action==='add')holder.insertAdjacentHTML('beforeend',editorRow({title:'',description:'',cta:'مشاهده محصولات',url:'#/shop',badge:'ENDURA BATTERY',position:'center',mobilePosition:'center',active:true}));
  if(action==='remove' && row && confirm('این اسلاید از فهرست حذف شود؟'))row.remove();
  if(action==='up'&&row?.previousElementSibling)holder.insertBefore(row,row.previousElementSibling);
  if(action==='down'&&row?.nextElementSibling)holder.insertBefore(row.nextElementSibling,row);
  numberRows(holder);
 });
 form.addEventListener('submit',async event=>{
  event.preventDefault();event.stopPropagation(); // Do not trigger app.js generic form handler.
  if(!remote.admin){status.textContent='ابتدا باید با نقش مدیر وارد شوید.';return;}
  const submit=form.querySelector('button[type=submit]');submit.disabled=true;
  status.textContent='در حال اعتبارسنجی و ذخیره تصاویر...';
  const previous=db.cms.heroSlides;
  try{
   const rows=[...holder.querySelectorAll('.endura-editor-slide')];
   if(rows.length>20)throw Error('حداکثر ۲۰ اسلاید مجاز است.');
   const result=[];
   for(const [i,row] of rows.entries()){
     const get=name=>row.querySelector(`[name="${name}"]`)?.value?.trim()||'';
     let image=get('image'),mobileImage=get('mobileImage');
     const desktopFile=row.querySelector('[name="desktopFile"]')?.files?.[0];
     const mobileFile=row.querySelector('[name="mobileFile"]')?.files?.[0];
     if(desktopFile){status.textContent=`در حال آپلود تصویر دسکتاپ اسلاید ${i+1}...`;image=await uploadPublicImage(desktopFile,'hero');}
     if(mobileFile){status.textContent=`در حال آپلود تصویر موبایل اسلاید ${i+1}...`;mobileImage=await uploadPublicImage(mobileFile,'hero');}
     if(!pathOf(image))throw Error(`آدرس تصویر اسلاید ${i+1} معتبر نیست.`);
     if(mobileImage&&!pathOf(mobileImage))throw Error(`آدرس تصویر موبایل اسلاید ${i+1} معتبر نیست.`);
     if(!get('title'))throw Error(`عنوان اسلاید ${i+1} خالی است.`);
     result.push({id:`slide-${i+1}`,title:get('title'),description:get('description'),cta:get('cta'),url:safeLink(get('url')),badge:get('badge'),image,mobileImage,position:get('position'),mobilePosition:get('mobilePosition'),active:get('active')!=='false'});
   }
   db.cms.heroSlides=result;
   await save('cms'); // existing Supabase writer: public.site_settings.value.cms
   status.textContent=`${result.length} اسلاید در Supabase ذخیره شد. صفحه اصلی را تازه‌سازی کنید.`;
  }catch(err){db.cms.heroSlides=previous;console.error(err);status.textContent='خطا: '+err.message;}
  finally{submit.disabled=false;}
 });
}

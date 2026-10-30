let cleanup = () => {};

export function mountHeroSlider() {
  cleanup();
  cleanup = () => {};
  const root = document.querySelector('.hero-campaign');
  if (!root) return;
  const copy = root.querySelector('.hero-copy');
  const title = copy?.querySelector('h1');
  const description = copy?.querySelector('p');
  const button = copy?.querySelector('.hero-actions a');
  const badge = copy?.querySelector('.hero-badge');
  if (!title || !description || !button) return;

  const path = 'assets/images/hero-slider/endura-hero-';
  const slides = [
    {title:title.textContent, description:description.textContent, cta:button.textContent.replace('←','').trim(), url:button.getAttribute('href'), badge:badge?.textContent},
    {title:'قدرت مطمئن برای هر استارت', description:'باتری مناسب خودروهای سبک و سنگین', cta:'باتری خودرو', url:'#/category/light', badge:'CAR BATTERIES'},
    {title:'انرژی پایدار، بدون وقفه', description:'باتری مناسب سیستم‌های برق اضطراری و UPS', cta:'باتری UPS', url:'#/category/ups', badge:'UPS POWER'},
    {title:'انرژی خورشید را ذخیره کن', description:'راهکارهای ذخیره انرژی برای سیستم‌های خورشیدی', cta:'باتری سولار', url:'#/category/solar', badge:'SOLAR ENERGY'},
    {title:'انرژی، همراه تمام مسیرها', description:'خدمات ارسال و نصب در مناطق تحت پوشش', cta:'مشاهده خدمات', url:'#/services', badge:'EVERY JOURNEY'},
    {title:'یک انتخاب برای نیازهای متفاوت', description:'باتری خودرو، UPS و سولار را یکجا بررسی کن', cta:'مشاهده فروشگاه', url:'#/shop', badge:'ENDURA BATTERY'}
  ];

  root.querySelector('.hero-image')?.remove();
  root.classList.add('endura-slider');
  root.setAttribute('aria-label','اسلایدر کمپین‌های اندورا باتری');
  root.setAttribute('aria-roledescription','اسلایدر');
  copy.setAttribute('aria-live','off');

  const layers = document.createElement('div');
  layers.className = 'endura-slides';
  layers.setAttribute('aria-hidden','true');
  const images = slides.map((_, i) => {
    const layer = document.createElement('div');
    layer.className = 'endura-slide' + (i === 0 ? ' is-active' : '');
    const image = document.createElement('img');
    image.src = path + String(i+1).padStart(2,'0') + '.webp';
    image.alt = '';
    image.decoding = 'async';
    image.loading = i === 0 ? 'eager' : 'lazy';
    if (i === 0) image.fetchPriority = 'high';
    layer.append(image);
    layers.append(layer);
    return layer;
  });
  root.prepend(layers);

  const controls = document.createElement('div');
  controls.className = 'endura-slider-controls';
  controls.innerHTML = `<button type="button" class="endura-slide-arrow" data-prev aria-label="اسلاید قبلی">❯</button>
    <div class="endura-slide-dots">${slides.map((_,i)=>`<button type="button" class="endura-slide-dot" data-index="${i}" aria-label="اسلاید ${i+1}" aria-pressed="${i===0}"></button>`).join('')}</div>
    <button type="button" class="endura-slide-arrow" data-next aria-label="اسلاید بعدی">❮</button>`;
  root.append(controls);
  const dots = [...controls.querySelectorAll('.endura-slide-dot')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, timer = null, startX = null;
  function show(i) {
    index = (i + slides.length) % slides.length;
    images.forEach((el,j)=>el.classList.toggle('is-active',j===index));
    dots.forEach((el,j)=>el.setAttribute('aria-pressed',String(j===index)));
    const slide = slides[index];
    title.textContent = slide.title;
    description.textContent = slide.description;
    button.textContent = slide.cta + ' ←';
    button.href = slide.url;
    if (badge) badge.textContent = slide.badge || '';
  }
  function stop() { if(timer !== null) clearInterval(timer); timer=null; }
  function start() { stop(); if(!reduced.matches && !document.hidden) timer=setInterval(()=>show(index+1),6000); }
  function onVisibility() { document.hidden ? stop() : start(); }
  function onClick(e) {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-prev')) show(index-1);
    else if (b.hasAttribute('data-next')) show(index+1);
    else if (b.hasAttribute('data-index')) show(Number(b.dataset.index));
    else return;
    start();
  }
  function touchStart(e) { startX = e.changedTouches[0]?.clientX ?? null; }
  function touchEnd(e) {
    if(startX === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? startX)-startX;
    if(Math.abs(dx)>55){ show(index+(dx>0?1:-1));start(); }
    startX=null;
  }
  function onFocusOut(e) { if(!root.contains(e.relatedTarget)) start(); }
  function onKey(e) {
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
      show(index+(e.key==='ArrowLeft'?1:-1));start();e.preventDefault();
    }
  }
  controls.addEventListener('click',onClick);
  controls.addEventListener('keydown',onKey);
  root.addEventListener('mouseenter',stop);
  root.addEventListener('mouseleave',start);
  root.addEventListener('focusin',stop);
  root.addEventListener('focusout',onFocusOut);
  root.addEventListener('touchstart',touchStart,{passive:true});
  root.addEventListener('touchend',touchEnd,{passive:true});
  document.addEventListener('visibilitychange',onVisibility);
  reduced.addEventListener?.('change',start);
  start();
  cleanup = () => { stop(); document.removeEventListener('visibilitychange',onVisibility); reduced.removeEventListener?.('change',start); };
}

/* Non-blocking page entrance + IntersectionObserver reveal. */
let observer=null;
export function mountMotion(){
 const root=document.getElementById('main-content');if(!root)return;
 observer?.disconnect();const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 if(reduced){document.documentElement.dataset.enduraMotion='off';return;}
 document.documentElement.dataset.enduraMotion='on';
 const items=root.querySelectorAll('.section-head,.category-card,.product-card,.guide-card,.benefit,.hero-campaign,.finder-card,.card-pad,.brand-logo,.vehicle-row,.wholesale,.service-strip,.pdp-gallery,.purchase-box,.faq-item');
 items.forEach((el,i)=>{el.classList.add('endura-reveal');el.classList.remove('is-visible');el.style.transitionDelay=((i%4)*55)+'ms';});
 if(!('IntersectionObserver' in window)){items.forEach(x=>x.classList.add('is-visible'));return;}
 observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add('is-visible');observer.unobserve(entry.target);}),{threshold:.06,rootMargin:'0px 0px 35px 0px'});
 items.forEach(x=>observer.observe(x));
}

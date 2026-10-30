/* User-supplied Endura Bloom + Smart Skeleton, tied to actual app readiness. */
(()=>{
 const root=document.getElementById('endura-loader');if(!root)return;
 const bloom=root.querySelector('.screen.bloom'),skeleton=root.querySelector('.screen.skeleton');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const duration=reduced?80:2300;
 let completed=false,animationDone=false,run=0,timeout;
 function display(name){for(const [key,el] of [['bloom',bloom],['skeleton',skeleton]]){el?.classList.toggle('active',key===name);el?.setAttribute('aria-hidden',String(key!==name));}}
 function finish(){if(!completed||!animationDone)return;root.classList.add('is-finished');root.setAttribute('aria-hidden','true');setTimeout(()=>root.remove(),reduced?50:460);}
 function start(){clearTimeout(timeout);run++;const token=run;completed=false;animationDone=false;root.classList.remove('is-finished');display('bloom');timeout=setTimeout(()=>{if(token!==run)return;animationDone=true;if(completed)finish();else display('skeleton');},duration);}
 function done(){completed=true;requestAnimationFrame(()=>requestAnimationFrame(finish));}
 window.enduraLoader={start,done,finish:done,get phase(){return root.classList.contains('is-finished')?'ready':skeleton?.classList.contains('active')?'skeleton':'bloom';}};
 start();
})();

// Endura theme: device preference on first visit, manual selection persists.
export const themeStorageKey='endura-theme';
export const systemIsDark=()=>!!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
export const chosenTheme=()=>{try{const v=localStorage.getItem(themeStorageKey);return v==='light'||v==='dark'?v:null;}catch{return null;}};
export const effectiveTheme=()=>chosenTheme()||(systemIsDark()?'dark':'light');
export function updateThemeAssets(){
 const mode=document.documentElement.dataset.theme||effectiveTheme();
 document.querySelectorAll('[data-theme-label]').forEach(el=>el.textContent=mode==='dark'?'حالت تاریک':'حالت روشن');
 document.querySelectorAll('.theme-switch').forEach(el=>{el.setAttribute('aria-pressed',String(mode==='dark'));el.setAttribute('aria-label',mode==='dark'?'فعال‌کردن حالت روشن':'فعال‌کردن حالت تاریک');});
 document.querySelectorAll('img.ui-icon').forEach(el=>{const src=el.getAttribute('src')||'';const match=src.match(/^(assets\/icons\/)([a-z-]+?)(?:-dark)?(\.svg)$/);if(match){const wanted=match[1]+match[2]+(mode==='dark'?'-dark':'')+match[3];if(src!==wanted)el.setAttribute('src',wanted);}});
 const c=document.querySelector('meta[name="theme-color"]');if(c)c.content=mode==='dark'?'#160A2C':'#F8F6FA';
}
export function setTheme(mode,{remember=true}={}){
 if(mode!=='dark'&&mode!=='light')return;
 if(remember){try{localStorage.setItem(themeStorageKey,mode);}catch{}}
 document.documentElement.dataset.theme=mode;document.documentElement.style.colorScheme=mode;
 updateThemeAssets();
}
export function initializeTheme(){setTheme(effectiveTheme(),{remember:false});
 window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(!chosenTheme())setTheme(effectiveTheme(),{remember:false});});
 const obs=new MutationObserver(()=>{const button=document.querySelector('.theme-switch');if(button&&button.getAttribute('aria-pressed')!==String(document.documentElement.dataset.theme==='dark'))updateThemeAssets();});obs.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
}

import {effectiveTheme} from './theme.js';
// Endura SVG icon system. The 39 original UI icon assets reside in assets/icons/*.svg.
// Unicode fallbacks originating from legacy templates become semantic SVG image icons.
const icons={
 '🚗':'car','🚙':'car','🚘':'car','🚛':'truck','🚚':'truck','📦':'package','🔋':'battery','☀️':'solar','☀':'solar',
 '💳':'credit-card','🛡️':'shield','🛡':'shield','📍':'location','🔎':'search','🔍':'search','🛒':'cart','📖':'book','🛠️':'gear','🛠':'gear','🔌':'bolt',
 '☰':'menu','⌕':'search','♙':'user','⌂':'home','▦':'store','▤':'file','⚖':'compare','♡':'heart','♥':'heart','✕':'close','✓':'check',
 '🔐':'shield','🔒':'shield','🏬':'store','🏢':'factory','📰':'book','⚙':'gear','⚙️':'gear','🎧':'support','💰':'wallet','📊':'chart','↥':'upload',
 '✉️':'file','📞':'phone','📷':'image','📥':'download','📁':'file','🗓':'calendar','✅':'check','🕒':'clock','🎯':'check',
 '◉':'battery','♧':'solar','⇆':'compare','⚠️':'shield','⚠':'shield'
};
const regex=new RegExp(Object.keys(icons).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
export function upgradeIcons(node=document.body){
 const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT), targets=[];
 while(walker.nextNode()){
  const n=walker.currentNode,p=n.parentElement;
  if(!p||['SCRIPT','STYLE','TEXTAREA','OPTION','CODE','PRE','TITLE'].includes(p.tagName)||p.closest('[contenteditable],.icon-only-keep'))continue;
  if(regex.test(n.nodeValue))targets.push(n);regex.lastIndex=0;
 }
 for(const n of targets){if(!n.parentNode)continue;const frag=document.createDocumentFragment();let last=0;
  n.nodeValue.replace(regex,(match,index)=>{if(index>last)frag.append(document.createTextNode(n.nodeValue.slice(last,index)));
    const img=document.createElement('img');img.className='ui-icon';img.src='assets/icons/'+icons[match]+(document.documentElement.dataset.theme==='dark'?'-dark':'')+'.svg';img.alt='';img.setAttribute('aria-hidden','true');frag.append(img);last=index+match.length;return match;});
  if(last<n.nodeValue.length)frag.append(document.createTextNode(n.nodeValue.slice(last)));n.replaceWith(frag);
 }
}
export function observeIcons(){upgradeIcons();const observer=new MutationObserver(()=>upgradeIcons());observer.observe(document.body,{childList:true,subtree:true});}

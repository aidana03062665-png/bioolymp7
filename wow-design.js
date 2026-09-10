(function(){
'use strict';
const QUOTES=[
  'Біз білімге ұмтыламыз!',
  'Бүгінгі кішкентай қадам — ертеңгі үлкен нәтиже.',
  'Біз тест жаттамаймыз — биологияны түсінеміз.',
  'Қателесу ұят емес, сол қатені түзетпеу ұят.',
  'Олимпиада жеңісі тұрақты еңбектен басталады.'
];
const ICONS={home:'🌟',topics:'📚',diagnostic:'🧪',daryn:'🏆',media:'🎥',progress:'📈'};
function $(s,r=document){return r.querySelector(s)}
function $$(s,r=document){return [...r.querySelectorAll(s)]}
function once(id, cb){ if(document.getElementById(id)) return; cb(); }
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function addBodyClass(){ document.body.classList.add('wow-mode'); }

function addFloatingBg(){
  once('wowFloating', ()=>{
    const wrap=document.createElement('div');
    wrap.id='wowFloating'; wrap.className='wow-floating';
    const colors=['rgba(31,191,134,.20)','rgba(255,214,110,.18)','rgba(255,133,199,.16)','rgba(113,184,255,.18)','rgba(210,255,114,.20)'];
    for(let i=0;i<18;i++){
      const b=document.createElement('span');
      b.className='wow-bubble';
      const size=18+Math.random()*74;
      b.style.width=size+'px'; b.style.height=size+'px';
      b.style.left=Math.random()*100+'vw';
      b.style.bottom=(-10-Math.random()*35)+'vh';
      b.style.background=colors[i%colors.length];
      b.style.animationDuration=(18+Math.random()*24)+'s';
      b.style.animationDelay=(-Math.random()*18)+'s';
      wrap.appendChild(b);
    }
    document.body.appendChild(wrap);
  });
}

function addHeroExtras(){
  const home=$('#home'); if(!home) return;
  const hero=$('.hero', home); if(!hero) return;
  const left=hero.firstElementChild; if(!left) return;
  if(!$('.wow-hero-tags', left)){
    const tags=document.createElement('div');
    tags.className='wow-hero-tags';
    ['63 тақырып','945 тест','Дарын дайындығы','Видеосабақтар','Мұғалім кабинеті'].forEach(t=>{
      const s=document.createElement('span'); s.className='wow-tag'; s.textContent=t; tags.appendChild(s);
    });
    const actions=$('.hero-actions', left);
    actions ? actions.after(tags) : left.appendChild(tags);
  }
  if(!$('#wowKazakhLine')){
    const line=document.createElement('div');
    line.id='wowKazakhLine'; line.className='wow-kazakh-line';
    hero.insertAdjacentElement('afterend', line);
  }
}

function addQuoteBar(){
  const home=$('#home'); if(!home) return;
  if($('#wowQuoteBar')) return;
  const target=$('.stats',home) || $('.hero',home);
  if(!target) return;
  const bar=document.createElement('div');
  bar.id='wowQuoteBar'; bar.className='wow-quote-bar reveal-wow';
  bar.innerHTML=`<img class="wow-avatar" src="./teacher-original.jpg" alt="Айдана мұғалім"><div><strong>Айдана мұғалімнен шабыт 🌱</strong><p id="wowQuoteText">${esc(QUOTES[0])}</p></div>`;
  target.insertAdjacentElement('beforebegin', bar);
  let i=0;
  setInterval(()=>{ const el=$('#wowQuoteText'); if(!el) return; i=(i+1)%QUOTES.length; el.textContent=QUOTES[i]; }, 4200);
}

function decorateSections(){
  $$('.section-head h2').forEach(h2=>{
    if(h2.querySelector('.wow-sec-icon')) return;
    const sec=h2.closest('.section'); const key=sec?.id || 'home';
    const span=document.createElement('span'); span.className='wow-sec-icon'; span.textContent=ICONS[key]||'✨';
    h2.prepend(span);
  });
}

function revealCards(){
  const nodes=$$('.stat,.topic-card,.panel,.quick,.archive-card,.video-card,.gallery-card,.motivation,.pro-panel,.qcard,.teacher-login-card,.tp-card,.photo-check-banner,.wow-quote-bar');
  nodes.forEach(el=>el.classList.add('reveal-wow'));
  const io=new IntersectionObserver(entries=>{
    entries.forEach((e,idx)=>{ if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target);} });
  },{threshold:.08,rootMargin:'0px 0px -24px 0px'});
  nodes.forEach((el,i)=>{el.style.transitionDelay=(Math.min(i%6,5)*45)+'ms'; io.observe(el);});
}

function addNavGlow(){
  $$('.nav button').forEach(btn=>{
    btn.addEventListener('pointerenter',()=>btn.style.transform='translateY(-1px)');
    btn.addEventListener('pointerleave',()=>btn.style.transform='');
  });
}

function run(){
  addBodyClass(); addFloatingBg(); addHeroExtras(); addQuoteBar(); decorateSections(); revealCards(); addNavGlow();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run); else run();
const mo=new MutationObserver(()=>{ decorateSections(); addHeroExtras(); addQuoteBar(); });
mo.observe(document.documentElement,{childList:true,subtree:true});
})();

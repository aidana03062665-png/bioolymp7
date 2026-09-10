(function(){
'use strict';
const QUOTES=[
  'Біз білімге ұмтыламыз.',
  'Білім — сенің күн сайынғы еңбегіңнің жемісі.',
  'Қателерді талдау — олимпиадаға апарар ең қысқа жол.',
  'Биологияны түсінген оқушы ғана сенімді жауап береді.'
];
function $(s,r=document){return r.querySelector(s)}
function $$(s,r=document){return [...r.querySelectorAll(s)]}
function once(id, make){ if(document.getElementById(id)) return; make(); }

function addLoader(){
  once('bioElegantLoader', ()=>{
    const d=document.createElement('div');
    d.id='bioElegantLoader'; d.className='bio-loader';
    d.innerHTML='<div class="bio-loader-card"><div class="bio-loader-mark"></div><h2>BioOlymp 7</h2><p>Эстетикалық, жинақы, биологияға терең енетін оқу кеңістігі</p><div class="bio-loader-bar"><i></i></div></div>';
    document.body.appendChild(d);
    setTimeout(()=>d.classList.add('hide'),1400);
    setTimeout(()=>d.remove(),2050);
  });
}

function addBackgroundMotifs(){
  once('bioMotifLayer', ()=>{
    const layer=document.createElement('div');
    layer.id='bioMotifLayer'; layer.className='bio-motif-layer';
    layer.innerHTML=`
      <div class="bio-cell float-slow" style="left:4%; top:18%"></div>
      <div class="bio-ring float-mid" style="right:6%; top:22%"></div>
      <div class="bio-branch float-fast" style="left:8%; bottom:17%"></div>
      <div class="bio-cell float-mid" style="right:10%; bottom:8%; width:110px; height:110px"></div>
      <div class="bio-ring float-slow" style="left:40%; top:74%; width:130px; height:130px"></div>`;
    document.body.appendChild(layer);
  });
}

function rebuildHero(){
  const home=$('#home'); if(!home) return;
  const hero=$('.hero',home); if(!hero) return;
  const visual=$('.hero-visual',hero); if(!visual || $('.bio-elegant-art',visual)) return;

  visual.innerHTML='';
  const art=document.createElement('div');
  art.className='bio-elegant-art';
  art.innerHTML=`
    <div class="bio-art-card">
      <div class="bio-art-grid"></div>
      <svg class="bio-art-svg" viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="petri" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="rgba(255,255,255,.40)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,.08)"/>
          </linearGradient>
        </defs>
        <circle cx="265" cy="142" r="88" stroke="rgba(255,255,255,.34)" stroke-width="2"/>
        <circle cx="265" cy="142" r="58" stroke="rgba(255,255,255,.20)" stroke-width="1.5"/>
        <circle cx="265" cy="142" r="18" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.24)"/>
        <circle cx="214" cy="103" r="9" fill="rgba(255,255,255,.22)"/>
        <circle cx="312" cy="189" r="11" fill="rgba(255,255,255,.16)"/>
        <path d="M42 210 C72 210, 72 170, 98 170 C118 170, 118 226, 150 226 C182 226, 180 146, 220 146 C248 146, 248 170, 276 170" stroke="rgba(255,255,255,.45)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M64 86 C88 54, 112 56, 138 88 M138 88 C156 108, 176 108, 192 88 M138 88 L138 154" stroke="rgba(255,255,255,.26)" stroke-width="3" stroke-linecap="round"/>
        <circle cx="64" cy="86" r="5" fill="rgba(255,255,255,.32)"/>
        <circle cx="138" cy="88" r="6" fill="rgba(255,255,255,.36)"/>
        <circle cx="192" cy="88" r="5" fill="rgba(255,255,255,.28)"/>
        <circle cx="138" cy="154" r="4" fill="rgba(255,255,255,.26)"/>
        <rect x="28" y="28" rx="14" ry="14" width="126" height="42" fill="rgba(255,255,255,.10)" stroke="rgba(255,255,255,.16)"/>
        <text x="48" y="54" fill="rgba(255,255,255,.88)" font-size="14" font-family="Arial">ANATOMIA • ECO</text>
      </svg>
      <div class="bio-art-labels">
        <span>Жасуша мен ұлпа</span>
        <span>Экожүйе</span>
        <span>Анатомия</span>
        <span>Жүйке жүйесі</span>
      </div>
    </div>`;
  visual.appendChild(art);

  if(!$('.elegant-teacher-chip',hero)){
    const chip=document.createElement('div');
    chip.className='elegant-teacher-chip';
    chip.innerHTML='<img src="./teacher-original.jpg" alt="Айдана мұғалім"><div><b>Айдана мұғалім</b><span id="elegantChipQuote">Біз білімге ұмтыламыз.</span></div>';
    hero.appendChild(chip);
    let i=0; setInterval(()=>{ const q=$('#elegantChipQuote'); if(!q) return; i=(i+1)%QUOTES.length; q.textContent=QUOTES[i]; }, 4600);
  }

  const left=hero.firstElementChild;
  if(left && !$('.bio-mini-note',left)){
    const note=document.createElement('div');
    note.className='bio-mini-note';
    note.textContent='Платформада тақырыптық конспект, видеосабақ, «Дарын» стиліндегі тесттер, оқушы статистикасы және мұғалім бақылау панелі біріктірілген.';
    const actions=$('.hero-actions',left); if(actions) actions.after(note); else left.appendChild(note);
  }
}

function addQuoteBar(){
  const home=$('#home'); if(!home || $('#elegantQuoteBar')) return;
  const hero=$('.hero',home); if(!hero) return;
  const bar=document.createElement('div');
  bar.id='elegantQuoteBar'; bar.className='elegant-quote-bar';
  bar.innerHTML='<img src="./teacher-original.jpg" alt="Айдана"><div><strong>Айдана мұғалімнен шабыт</strong><p id="elegantQuoteText">Біз білімге ұмтыламыз.</p></div>';
  hero.insertAdjacentElement('afterend', bar);
  let i=0; setInterval(()=>{ const el=$('#elegantQuoteText'); if(!el) return; i=(i+1)%QUOTES.length; el.textContent=QUOTES[i]; }, 4200);
}

function shrinkPhoto(){
  $$('#teacherHomePhoto').forEach(img=>{img.style.width='84px';img.style.height='84px';img.style.maxWidth='84px';img.style.borderRadius='16px';});
  $$('.wow-avatar').forEach(img=>{img.style.width='44px';img.style.height='44px';});
  $$('.photo-check-banner img').forEach(img=>{img.style.width='68px';img.style.height='68px';});
}

function addBadges(){
  const home=$('#home'); if(!home) return;
  const stats=$('.stats',home); if(!stats || $('#elegantBadges')) return;
  const div=document.createElement('div');
  div.id='elegantBadges'; div.className='elegant-badges';
  div.innerHTML='<span>Толық конспект</span><span>Оқушы аккаунттары</span><span>Мұғалім статистикасы</span><span>Дарын дайындық</span>';
  stats.insertAdjacentElement('afterend', div);
}

function retouchHeaders(){
  $$('.section-head h2').forEach(h=>{
    const icon=h.querySelector('.wow-sec-icon');
    if(icon){
      const map={home:'◦',topics:'§',diagnostic:'•',daryn:'◌',media:'▶',progress:'↗'};
      const sec=h.closest('.section')?.id || 'home';
      icon.textContent=map[sec] || '•';
    }
  });
}

function run(){
  addLoader(); addBackgroundMotifs(); rebuildHero(); addQuoteBar(); shrinkPhoto(); addBadges(); retouchHeaders();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
new MutationObserver(()=>{ rebuildHero(); addQuoteBar(); shrinkPhoto(); addBadges(); retouchHeaders(); }).observe(document.documentElement,{childList:true,subtree:true});
})();

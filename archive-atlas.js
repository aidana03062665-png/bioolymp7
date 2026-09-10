(function(){
'use strict';
function q(sel,root=document){return root.querySelector(sel)}
function qa(sel,root=document){return Array.from(root.querySelectorAll(sel))}

function buildHeroArchive(){
  const hero=q('#home .hero')||q('.hero');
  if(!hero||q('#archiveHeroVisual')) return;
  const art=q('.heroArt',hero);
  const visual=document.createElement('div');
  visual.id='archiveHeroVisual';
  visual.className='archive-hero-visual';
  visual.innerHTML=`
    <div class="archive-mini-shell" aria-hidden="true">
      <div class="archive-brain-outline"></div>
      <div class="archive-shelves">
        <div class="archive-shelf"></div><div class="archive-shelf"></div>
        <div class="archive-shelf"></div><div class="archive-shelf"></div>
      </div>
      <div class="archive-arch"></div>
      <div class="archive-mini-floor"></div>
      <span class="archive-particle" style="left:20%;top:22%;animation-delay:-1s"></span>
      <span class="archive-particle" style="left:72%;top:28%;animation-delay:-2.3s"></span>
      <span class="archive-particle" style="left:33%;top:63%;animation-delay:-4s"></span>
      <span class="archive-particle" style="left:82%;top:66%;animation-delay:-.5s"></span>
      <div class="archive-caption">BILIM ARCHIVE • BIOLOGY VII</div>
    </div>`;
  if(art) art.replaceWith(visual); else hero.appendChild(visual);
}

function removeFallbackDuplicate(){
  const home=q('#home'); if(!home) return;
  if(q('.teacherHero',home)||q('#teacherHomePhoto',home)) qa('.photo-check-banner',home).forEach(x=>x.remove());
}

function makeEntry(){
  if(q('#archiveEntry')) return;
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const entry=document.createElement('div');
  entry.id='archiveEntry';
  entry.className='archive-entry'+(reduce?' no-motion':'');
  entry.innerHTML=`
    <div class="archive-entry-card">
      <div class="archive-copy">
        <div class="archive-eyebrow">BIOOLYMP 7 • KNOWLEDGE ARCHIVE</div>
        <h2>Білім архивіне<br>қош келдің.</h2>
        <p>Бұл жерде білім жай сақталмайды — ол байланысады. Кітапхана сөрелері ми иірімдері секілді бір-бірімен жалғасып, әр тақырып жаңа есік ашады.</p>
        <button class="archive-enter-btn" id="archiveEnterBtn">Архивке кіру →</button>
        <button class="archive-skip" id="archiveSkipBtn">Өткізу</button>
      </div>
      <div class="brain-library" aria-label="Ми пішініндегі білім кітапханасы">
        <div class="archive-sign">ARCHIVUM SCIENTIAE</div>
        <div class="brain-half left"><div class="library-stack"><div class="library-row"></div><div class="library-row"></div><div class="library-row"></div></div></div>
        <div class="brain-half right"><div class="library-stack"><div class="library-row"></div><div class="library-row"></div><div class="library-row"></div></div></div>
        <div class="brain-spine"></div>
        <div class="archive-door"></div>
        <i class="archive-dust" style="left:18%;top:24%;animation-delay:-1.4s"></i>
        <i class="archive-dust" style="left:77%;top:31%;animation-delay:-3.1s"></i>
        <i class="archive-dust" style="left:29%;top:64%;animation-delay:-.4s"></i>
        <i class="archive-dust" style="left:68%;top:71%;animation-delay:-4.2s"></i>
      </div>
    </div>`;
  document.body.appendChild(entry);

  const close=()=>{entry.classList.add('is-gone');setTimeout(()=>entry.remove(),700)};
  q('#archiveSkipBtn',entry).addEventListener('click',close);
  q('#archiveEnterBtn',entry).addEventListener('click',()=>{
    if(reduce){close();return;}
    entry.classList.add('entering');
    setTimeout(()=>entry.classList.add('is-gone'),1120);
    setTimeout(()=>entry.remove(),1820);
  });
}

function init(){
  buildHeroArchive();
  removeFallbackDuplicate();
  makeEntry();
  window.addEventListener('pageshow',()=>{buildHeroArchive();removeFallbackDuplicate();});
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();

(function(){
  'use strict';
  function $(s,r=document){return r.querySelector(s)}
  function $$(s,r=document){return Array.from(r.querySelectorAll(s))}
  function once(id, fn){ if(document.getElementById(id)) return; fn(); }

  const heroQuote='Оқулық, конспект, тест, видео және прогресс — барлығы бір жерде.';

  function hideArchiveText(){
    const badWords=['архив','archive'];
    $$('button,a,span,div,p,h1,h2,h3,h4').forEach(el=>{
      const txt=(el.textContent||'').trim();
      if(!txt) return;
      const pure=txt.toLowerCase();
      if((pure==='архивке кіру' || pure==='archive' || pure.includes('bilim archive')) && el.children.length===0){
        el.remove();
        return;
      }
      if((pure.includes('білім архив') || pure.includes('bilim archive')) && el.children.length===0){
        el.textContent='';
      }
    });
  }

  function buildIllustrationMarkup(){
    return `
      <div class="bio-world-illustration">
        <div class="bio-world-card">
          <div class="bio-world-bubbles"><span></span><span></span><span></span><span></span><span></span></div>
          <div class="spark" style="left:58px;top:26px;width:9px;height:9px"></div>
          <div class="spark" style="right:78px;bottom:42px;width:12px;height:12px"></div>
          <div class="bio-world-cell"></div>
          <div class="bio-world-bird"><i></i></div>
          <div class="bio-world-head"></div>
          <div class="bio-world-book">
            <div class="shadow"></div>
            <div class="page left"></div>
            <div class="page right"></div>
            <div class="spine"></div>
          </div>
          <div class="bio-world-stem"></div>
          <div class="bio-world-leaf1"></div>
          <div class="bio-world-leaf2"></div>
        </div>
      </div>`;
  }

  function patchHero(){
    const home=$('#home'); if(!home) return;
    const hero=$('.hero',home) || $('.hero'); if(!hero) return;
    const visual=$('.hero-visual',hero); if(!visual) return;
    if(!$('.bio-world-illustration',visual)){
      visual.innerHTML=buildIllustrationMarkup();
    }
    const left=hero.firstElementChild || hero;
    if(left){
      const p=$('p',left);
      if(p) p.textContent='Бұл жерде жай тест жаттамаймыз: оқулықты түсініп оқимыз, толық конспект жасаймыз, видеомен бекітеміз, тақырыптық және «Дарын» форматындағы тапсырмалармен білімді дамытамыз.';
      if(!$('.bio-world-chipbar',left)){
        const afterActions=$('.hero-actions',left);
        const chips=document.createElement('div');
        chips.className='bio-world-chipbar';
        chips.innerHTML='<span>63 тақырып</span><span>Толық конспект</span><span>Ұқсас тесттер</span><span>Видеосабақтар</span>';
        const note=document.createElement('div');
        note.className='bio-world-note';
        note.textContent=heroQuote;
        if(afterActions){ afterActions.insertAdjacentElement('afterend',chips); chips.insertAdjacentElement('afterend',note); }
      }
    }
  }

  function removeOldScene(){
    [
      '.archive-halls-wrap','.archive-entry-wrap','.archive-modal','.brain-archive-entry',
      '.archive-scene','.archive-halls','.archive-atlas', '#archiveEntryScreen', '#archiveHallsScreen'
    ].forEach(sel => $$(sel).forEach(el=>el.remove()));
  }

  function addEntryScene(){
    once('bioEntryScreen', ()=>{
      const screen=document.createElement('div');
      screen.id='bioEntryScreen';
      screen.className='bio-entry-screen';
      screen.innerHTML=`
        <div class="bio-entry-card">
          <div>
            <span class="bio-entry-small">7-сынып • Биология • №1 Хромтау орта мектебі</span>
            <h2 class="bio-entry-title">Біз білімге ұмтыламыз!</h2>
            <div class="bio-entry-text">BioOlymp 7 — оқулық, конспект, тест, видео және прогресті біріктіретін мультяшный, жылы әрі тартымды білім алаңы.</div>
            <button class="bio-entry-button" id="bioEnterBtn">Оқуды бастау</button>
            <div class="bio-entry-footer"><span>Толық конспект</span><span>Дарын тесттері</span><span>Ұқсас тесттер</span><span>Видео</span></div>
          </div>
          <div class="bio-entry-illus">${buildIllustrationMarkup()}</div>
        </div>`;
      document.body.appendChild(screen);
      const close=()=>{
        screen.classList.add('hide');
        setTimeout(()=>screen.remove(),520);
      };
      $('#bioEnterBtn',screen)?.addEventListener('click', close);
      setTimeout(()=>{ /* auto-close after a while only if user interacted before? keep open */ }, 0);
    });
  }

  function run(){
    removeOldScene();
    hideArchiveText();
    patchHero();
    addEntryScene();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run); else run();
  new MutationObserver(()=>{ removeOldScene(); hideArchiveText(); patchHero(); }).observe(document.documentElement,{childList:true,subtree:true});
})();

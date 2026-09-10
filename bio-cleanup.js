(function(){
  'use strict';

  function $(s,r=document){ return r.querySelector(s); }
  function $$(s,r=document){ return Array.from(r.querySelectorAll(s)); }

  const BAD_EMOJIS = ['🧬','🔬','🌿','🍃','🌱'];

  function removeStickerIcons(){
    const hero = $('#home .hero') || $('.hero');
    if(!hero) return;

    // remove simple emoji-only nodes in hero visual/right area
    $$('*', hero).forEach(el => {
      const txt = (el.textContent || '').trim();
      if(!txt) return;
      if(BAD_EMOJIS.includes(txt) && el.children.length === 0){
        el.style.display = 'none';
      }
      if(BAD_EMOJIS.some(e => txt === e || txt === e + e)){
        el.style.display = 'none';
      }
    });
  }

  function keepOnlyOneInspirationBlock(){
    // hide old duplicates
    const old1 = $('#wowQuoteBar'); if(old1) old1.remove();
    $$('.photo-check-banner').forEach(el => el.remove());

    // if several blocks with same title remain, keep only first elegantQuoteBar
    const bars = [
      ...$$('#elegantQuoteBar'),
      ...$$('.elegant-quote-bar')
    ];
    if(bars.length > 1){
      bars.slice(1).forEach(el => el.remove());
    }
  }

  function restorePhotoSize(){
    $$('#teacherHomePhoto').forEach(img => {
      img.style.width = '120px';
      img.style.height = '120px';
      img.style.maxWidth = '120px';
      img.style.borderRadius = '18px';
    });
    $$('.elegant-teacher-chip img').forEach(img => {
      img.style.width = '56px';
      img.style.height = '56px';
      img.style.borderRadius = '16px';
    });
  }

  function calmHero(){
    const hero = $('#home .hero') || $('.hero');
    if(!hero) return;
    // remove any extra ribbons or badges injected earlier
    $$('.superwow-ribbon, .wow-hero-tags, #superwowBadges, .superwow-corner-badges', hero.parentElement || document).forEach(el => el.remove());
  }

  function patch(){
    removeStickerIcons();
    keepOnlyOneInspirationBlock();
    restorePhotoSize();
    calmHero();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patch);
  else patch();

  const mo = new MutationObserver(() => patch());
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();

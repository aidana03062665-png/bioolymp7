(function(){
  'use strict';

  function $$(s,r=document){ return Array.from(r.querySelectorAll(s)); }

  function fixTeacherPhoto(){
    const width = window.innerWidth <= 560 ? 92 : (window.innerWidth <= 900 ? 102 : 118);
    $$('#teacherHomePhoto').forEach(img => {
      img.style.width = width + 'px';
      img.style.height = width + 'px';
      img.style.maxWidth = width + 'px';
      img.style.minWidth = width + 'px';
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center top';
      img.style.borderRadius = (window.innerWidth <= 560 ? 18 : (window.innerWidth <= 900 ? 20 : 22)) + 'px';
      img.style.boxShadow = '0 10px 24px rgba(23,52,43,.12)';
    });
  }

  function run(){ fixTeacherPhoto(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('resize', fixTeacherPhoto);
  new MutationObserver(fixTeacherPhoto).observe(document.documentElement, { childList:true, subtree:true });
})();

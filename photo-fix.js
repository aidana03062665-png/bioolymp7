(function(){
  'use strict';

  const PHOTOS = {
    original: './teacher-original.jpg',
    original2: './teacher-original-2.jpg',
    success: './teacher-success.jpg',
    strict: './teacher-strict.jpg'
  };

  function addStyles(){
    if(document.getElementById('bio-photo-fix-style')) return;
    const st = document.createElement('style');
    st.id = 'bio-photo-fix-style';
    st.textContent = `
      .teacher-login-card{
        display:grid;grid-template-columns:minmax(170px,240px) 1fr;gap:20px;
        align-items:center;margin:0 0 22px;padding:18px;border-radius:24px;
        background:linear-gradient(135deg,#ecfff4,#fff9dc);
        border:1px solid #d5eadf;box-shadow:0 12px 35px rgba(13,116,80,.10);
        overflow:hidden;position:relative
      }
      .teacher-login-card:after{
        content:"🧬";position:absolute;right:18px;top:10px;font-size:58px;opacity:.08
      }
      .teacher-login-card img{
        width:100%;height:235px;object-fit:cover;border-radius:18px;
        border:4px solid rgba(255,255,255,.9);box-shadow:0 10px 24px rgba(0,0,0,.10)
      }
      .teacher-login-copy{position:relative;z-index:1}
      .teacher-login-copy h3{margin:8px 0;font-size:28px;color:#0b7450;line-height:1.15}
      .teacher-login-copy p{margin:0 0 10px;line-height:1.55;color:#4e695f}
      .teacher-login-copy b{font-size:12px;color:#0b7450}
      .teacher-kicker{
        display:inline-block;padding:7px 10px;border-radius:999px;background:#0b7450;
        color:white;font-size:10px;font-weight:900;letter-spacing:.4px
      }
      .photo-check-banner{
        display:flex;gap:14px;align-items:center;margin:16px 0;padding:14px;
        border-radius:20px;background:linear-gradient(135deg,#f4fff8,#fffbea);
        border:1px solid #dceee5
      }
      .photo-check-banner img{
        width:92px;height:92px;object-fit:cover;border-radius:18px;flex:0 0 auto
      }
      .photo-check-banner b{display:block;color:#0b7450;font-size:18px}
      .photo-check-banner p{margin:5px 0 0;color:#5e756d;font-size:13px;line-height:1.45}
      @media(max-width:650px){
        .teacher-login-card{grid-template-columns:1fr;padding:13px;gap:12px}
        .teacher-login-card img{height:280px}
        .teacher-login-copy h3{font-size:23px}
        .photo-check-banner{align-items:flex-start}
        .photo-check-banner img{width:76px;height:76px}
      }
    `;
    document.head.appendChild(st);
  }

  function safeSet(img, src, fallback){
    if(!img) return;
    if(img.dataset.photoFixSrc === src) return;
    img.dataset.photoFixSrc = src;
    img.src = src;
    img.onerror = function(){
      if(fallback && this.src.indexOf(fallback.replace('./','')) === -1){
        this.src = fallback;
      }
    };
  }

  function addAccountCard(){
    const root = document.querySelector('#accountRoot');
    const auth = root && root.querySelector('.pro-auth');
    if(!auth || auth.querySelector('.teacher-login-card')) return;

    const card = document.createElement('div');
    card.className = 'teacher-login-card';
    card.innerHTML = `
      <img src="${PHOTOS.original}" alt="Сисекенова Айдана">
      <div class="teacher-login-copy">
        <span class="teacher-kicker">🌿 BIOOLYMP 7 • МҰҒАЛІМ МОТИВАЦИЯСЫ</span>
        <h3>«Біз білімге ұмтыламыз!»</h3>
        <p>Әр тест — өзіңді жеңуге тағы бір мүмкіндік. Қателесуден қорықпа, бірақ сол қатені қайталама. Олимпиадада әр ұпай маңызды.</p>
        <b>— Сисекенова Айдана, биология пәні мұғалімі</b>
      </div>`;
    auth.prepend(card);
  }

  function addHomeFallback(){
    const home = document.querySelector('#home');
    if(!home || home.querySelector('#teacherHomePhoto') || home.querySelector('.photo-check-banner')) return;
    const hero = home.querySelector('.hero');
    if(!hero) return;
    const box = document.createElement('div');
    box.className = 'photo-check-banner';
    box.innerHTML = `
      <img src="${PHOTOS.original}" alt="Айдана мұғалім">
      <div><b>Айдана мұғалімнен мотивация 🌱</b>
      <p>«Біз тест жаттамаймыз — биологияны түсінеміз. Бүгінгі еңбегің ертеңгі нәтижеңді жасайды!»</p></div>`;
    hero.insertAdjacentElement('afterend', box);
  }

  function patch(){
    addStyles();

    // Басты бет
    safeSet(document.querySelector('#teacherHomePhoto'), PHOTOS.original, PHOTOS.original2);

    // Мұғалім фото-карточкалары
    document.querySelectorAll('.teacherPhotoCard img').forEach((img,i)=>{
      safeSet(img, i % 2 ? PHOTOS.original2 : PHOTOS.original, PHOTOS.original);
    });

    // Тест нәтижесінен кейінгі реакциялар
    document.querySelectorAll('.teacherFeedback').forEach(card=>{
      const img = card.querySelector('img');
      if(!img) return;
      if(card.classList.contains('strict')) safeSet(img, PHOTOS.strict, PHOTOS.original);
      else if(card.classList.contains('good')) safeSet(img, PHOTOS.success, PHOTOS.original);
      else safeSet(img, PHOTOS.original2, PHOTOS.original);
    });

    // Қалқымалы coach
    const coach = document.querySelector('#proCoachImg');
    if(coach && (!coach.getAttribute('src') || coach.getAttribute('src') === '')) {
      safeSet(coach, PHOTOS.original, PHOTOS.original2);
    }

    addAccountCard();
    addHomeFallback();
  }

  let pending = false;
  function schedulePatch(){
    if(pending) return;
    pending = true;
    requestAnimationFrame(()=>{ pending=false; patch(); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patch);
  else patch();

  const obs = new MutationObserver(schedulePatch);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pageshow', patch);
  window.addEventListener('hashchange', patch);
})();
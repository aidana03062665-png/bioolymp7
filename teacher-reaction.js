(function(){
  'use strict';

  const state = { lastSignature: '' };
  function $(s,r=document){ return r.querySelector(s); }
  function $$(s,r=document){ return Array.from(r.querySelectorAll(s)); }

  const variants = [
    {
      key:'excellent', min:0, max:1, mood:'good', photo:'./teacher-success.jpg',
      badge:'Керемет нәтиже', kicker:'Айдана мұғалім қуанды',
      title:'Жарайсың! Өте мықты нәтиже!',
      quote:'Сен бүгін жақсы дайындық көрсетіп тұрсың. Осы қарқынды сақта!',
      message:(e,t)=>`Қате саны: ${e}. ${t} сұрақтың басым бөлігін сенімді орындадың. Бұл — олимпиадаға дайындықтың жақсы белгісі.`,
      action:'Келесі деңгейді аш'
    },
    {
      key:'good', min:2, max:4, mood:'good', photo:'./teacher-original.jpg',
      badge:'Жақсы нәтиже', kicker:'Айдана мұғалімнен кеңес',
      title:'Жақсы! Бірақ әлі де өсесің.',
      quote:'Аз ғана қате — келесі жолы толық ұпайға жақындайсың деген сөз.',
      message:(e,t)=>`Қате саны: ${e}. Сенің базаң жақсы. Енді әлсіз тақырыптарды қайталап, дәлдікті күшейту керек.`,
      action:'Қатемен жұмыс'
    },
    {
      key:'medium', min:5, max:7, mood:'neutral', photo:'./teacher-original-2.jpg',
      badge:'Орташа нәтиже', kicker:'Айдана мұғалім байқап отыр',
      title:'Тоқта. Қазір жинақталу керек.',
      quote:'Білмейтін жерді жасыруға болмайды. Тақырыпты қайта қарап, сосын қайта тест тапсыр.',
      message:(e,t)=>`Қате саны: ${e}. Негіз бар, бірақ тақырып толық бекімеген. Қысқа конспектіні қайталап, әлсіз бөлімдерге орал.`,
      action:'Тақырыпқа қайту'
    },
    {
      key:'strict', min:8, max:11, mood:'strict', photo:'./teacher-strict.jpg',
      badge:'Қатаң ескерту', kicker:'Айдана мұғалім риза емес',
      title:'Бұлай болмайды. Зейін қою керек!',
      quote:'Қате жасаудан қорықпа. Бірақ сол қатені түзетпей келесі тестке өтуге болмайды.',
      message:(e,t)=>`Қате саны: ${e}. Бұл нәтиже тақырыпты үстірт оқығаныңды көрсетеді. Қазірден бастап конспект, видео және қайталау арқылы олқылықты жабу керек.`,
      action:'Қайта дайындалу'
    },
    {
      key:'very_strict', min:12, max:99, mood:'strict', photo:'./teacher-strict.jpg',
      badge:'Шұғыл дайындық керек', kicker:'Айдана мұғалім қатаң айтып тұр',
      title:'Тоқта! Мұндай нәтижемен тоқмейілсуге болмайды!',
      quote:'Қазір ренжудің уақыты емес — жиналудың уақыты. Әр қате — қай тақырыпты қайта оқу керегін көрсетіп тұр.',
      message:(e,t)=>`Қате саны: ${e}. Бұл нәтиже бойынша міндетті түрде тақырыпқа қайта оралып, конспект пен видеоны қарап, содан кейін қайта тест тапсыру керек.`,
      action:'Қайта оқу жоспары'
    }
  ];

  function getVariant(errors){
    return variants.find(v=>errors>=v.min && errors<=v.max) || variants[2];
  }

  function removeOverlay(){
    const old = $('#teacherReactionOverlay');
    if(!old) return;
    old.classList.add('hide');
    setTimeout(()=>old.remove(), 350);
  }

  function showReaction(errors,total){
    if(typeof errors !== 'number' || isNaN(errors)) return;
    total = total || 15;
    const sign = `${errors}/${total}`;
    if(state.lastSignature === sign) return;
    state.lastSignature = sign;

    removeOverlay();
    const v = getVariant(errors);
    const overlay = document.createElement('div');
    overlay.id = 'teacherReactionOverlay';
    overlay.className = 'teacher-reaction-overlay';
    overlay.innerHTML = `
      <div class="teacher-reaction-card ${v.mood === 'strict' ? 'strict teacher-reaction-shake' : 'good'}">
        <div class="teacher-reaction-photoWrap">
          <div class="teacher-reaction-stars"><i></i><i></i><i></i><i></i><i></i></div>
          <span class="teacher-reaction-badge">${v.badge}</span>
          <img class="teacher-reaction-photo" src="${v.photo}" alt="Айдана мұғалім">
        </div>
        <div class="teacher-reaction-main">
          <span class="teacher-reaction-kicker">${v.kicker}</span>
          <h3 class="teacher-reaction-title">${v.title}</h3>
          <div class="teacher-reaction-meta">
            <span class="teacher-reaction-pill">Қате саны: ${errors}</span>
            <span class="teacher-reaction-pill">Барлығы: ${total}</span>
            <span class="teacher-reaction-pill">Нәтиже: ${Math.max(0, Math.round(((total-errors)/total)*100))}%</span>
          </div>
          <p class="teacher-reaction-message">${v.message(errors,total)}</p>
          <div class="teacher-reaction-quote">${v.quote}</div>
          <div class="teacher-reaction-actions">
            <button class="teacher-reaction-btn primary" id="teacherReactionPrimary">${v.action}</button>
            <button class="teacher-reaction-btn secondary" id="teacherReactionClose">Жабу</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    $('#teacherReactionClose', overlay)?.addEventListener('click', removeOverlay);
    overlay.addEventListener('click', (e)=>{ if(e.target === overlay) removeOverlay(); });
    $('#teacherReactionPrimary', overlay)?.addEventListener('click', ()=>{
      removeOverlay();
      const target = errors >= 8 ? document.querySelector('[data-nav="topics"], #topics') : document.querySelector('[data-nav="daryn"], #daryn, #tests');
      if(target){ target.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  }

  function parseFromText(text){
    if(!text) return null;
    let m;
    m = text.match(/Қате\s*саны\s*[:\-]?\s*(\d+)/i) || text.match(/Қате\s*[:\-]?\s*(\d+)/i);
    if(m) return { errors: parseInt(m[1],10), total: inferTotal(text) };
    m = text.match(/(\d+)\s*\/\s*(\d+)/);
    if(m){
      const correct = parseInt(m[1],10), total = parseInt(m[2],10);
      return { errors: Math.max(0,total-correct), total };
    }
    m = text.match(/(\d+)\s*%/);
    if(m){
      const percent = parseInt(m[1],10);
      const total = inferTotal(text) || 15;
      const correct = Math.round(total * (percent/100));
      return { errors: Math.max(0,total-correct), total };
    }
    return null;
  }

  function inferTotal(text){
    let m = text.match(/Барлығы\s*[:\-]?\s*(\d+)/i) || text.match(/(\d+)\s*сұрақ/i);
    if(m) return parseInt(m[1],10);
    return 15;
  }

  function detectResult(){
    const selectors = ['.resultbox','#result','.quiz-result','.test-result','[data-result-box]'];
    for(const sel of selectors){
      const el = $(sel);
      if(el){
        const parsed = parseFromText(el.textContent || '');
        if(parsed) return parsed;
      }
    }
    // broader scan
    const nodes = $$('div,section,article');
    for(const el of nodes){
      const txt = (el.textContent || '').trim();
      if(txt && (/Қате|Нәтиже|Дұрыс жауап/i.test(txt))){
        const parsed = parseFromText(txt);
        if(parsed) return parsed;
      }
    }
    return null;
  }

  function initAutoReaction(){
    let lastSeen='';
    const tryShow = ()=>{
      const parsed = detectResult();
      if(!parsed) return;
      const sign = `${parsed.errors}/${parsed.total}`;
      if(sign !== lastSeen){
        lastSeen = sign;
        setTimeout(()=>showReaction(parsed.errors, parsed.total), 250);
      }
    };
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('button');
      if(!btn) return;
      const txt = (btn.textContent || '').toLowerCase();
      if(/тексеру|аяқтау|жіберу|нәтиже|submit|finish/.test(txt)){
        setTimeout(tryShow, 500);
        setTimeout(tryShow, 1200);
      }
    });
    new MutationObserver(()=>tryShow()).observe(document.documentElement,{childList:true,subtree:true});
  }

  window.BioOlympTeacherReaction = {
    show: showReaction,
    reset(){ state.lastSignature=''; }
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAutoReaction);
  else initAutoReaction();
})();

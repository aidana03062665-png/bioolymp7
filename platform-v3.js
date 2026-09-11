(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const CFG=window.BIOOLYMP_CONFIG||{};
let lang=localStorage.getItem('bio7_lang')||'kk';
let applying=false, pdfDoc=null, pageNo=1, pdfLoading=null, renderToken=0, sb=null, ratingBusy=false;

const T={
'Главная':['Басты бет','Главная'],'Оқу':['Оқу','Учёба'],'Тесты':['Тесттер','Тесты'],'Олимпиада':['Олимпиада','Олимпиада'],
'Ошибки':['Қателер','Ошибки'],'Задания':['Тапсырмалар','Задания'],'Рейтинг':['Рейтинг','Рейтинг'],'Кабинет':['Кабинет','Кабинет'],
'Мұғалім':['Мұғалім','Учитель'],'Установить':['Орнату','Установить'],'Скачать приложение':['Қосымшаны орнату','Скачать приложение'],
'Работа над ошибками':['Қатемен жұмыс','Работа над ошибками'],'Задания учителя':['Мұғалім тапсырмалары','Задания учителя'],
'Недельный рейтинг':['Апталық рейтинг','Недельный рейтинг'],'Мұғалім кабинеті':['Мұғалім кабинеті','Кабинет учителя'],
'Біз білімге ұмтыламыз!':['Біз білімге ұмтыламыз!','Мы стремимся к знаниям!'],
'Оқуды бастау':['Оқуды бастау','Начать учёбу'],'Олимпиада режимі':['Олимпиада режимі','Олимпиадный режим'],
'Тақырып':['Тақырып','Темы'],'База':['База','База'],'Менің орташа баллым':['Менің орташа баллым','Мой средний балл'],
'АЙДАНА АПАЙДАН':['АЙДАНА АПАЙДАН','ОТ АЙДАНЫ АПАЙ'],'Ошибкаларды қарау':['Қателерді қарау','Посмотреть ошибки'],
'Оқулық + конспект':['Оқулық + конспект','Учебник + конспект'],'Тест + смешной комментарий':['Тест + көңілді комментарий','Тест + смешной комментарий'],
'Сертификат + рейтинг':['Сертификат + рейтинг','Сертификат + рейтинг'],'63 тақырып':['63 тақырып','63 темы'],
'Тақырыпты іздеу...':['Тақырыпты іздеу...','Поиск темы...'],'Тест конструкторы':['Тест конструкторы','Конструктор тестов'],
'Настоящий олимпиадный режим':['Нағыз олимпиадалық режим','Настоящий олимпиадный режим'],
'ҚАТЕ ДӘПТЕРІ':['ҚАТЕ ДӘПТЕРІ','РАБОТА НАД ОШИБКАМИ'],'АПТАЛЫҚ РЕЙТИНГ':['АПТАЛЫҚ РЕЙТИНГ','НЕДЕЛЬНЫЙ РЕЙТИНГ'],
'Соңғы нәтижелер':['Соңғы нәтижелер','Последние результаты'],'Сұрақ саны':['Сұрақ саны','Количество вопросов'],
'Банк':['Банк','Банк'],'Режим':['Режим','Режим'],'Печать':['Басып шығару','Печать'],'Базалық':['Базалық','Базовый'],
'Тек PRO':['Тек PRO','Только PRO'],'Тренировка':['Тренировка','Тренировка'],'Без подсказок':['Көмексіз','Без подсказок'],
'1 вариант':['1 нұсқа','1 вариант'],'Начать тест':['Тестті бастау','Начать тест'],'Распечатать / PDF':['Басып шығару / PDF','Распечатать / PDF'],
'Уақыт':['Уақыт','Время'],'Ереже':['Ереже','Правила'],'Сертификат':['Сертификат','Сертификат'],
'Оқулық бетін ашу':['Оқулықты ашу','Открыть учебник'],'Видео іздеу':['Видео іздеу','Найти видео'],'15 сұрақ':['15 сұрақ','15 вопросов'],
'Қысқаша конспект':['Қысқаша конспект','Краткий конспект'],'Негізгі ұғымдар':['Негізгі ұғымдар','Основные понятия'],
'Ещё':['Тағы','Ещё'],'Тест':['Тест','Тест'],'Учёба':['Оқу','Учёба']
};
function trPair(pair){return pair?.[lang==='ru'?1:0]}
function translateExact(el){
  if(!el||el.children.length>0)return;
  const raw=el.dataset.v3Original ?? el.textContent.trim();
  if(!el.dataset.v3Original) el.dataset.v3Original=raw;
  const pair=T[raw]; if(pair) el.textContent=trPair(pair);
  if(el.placeholder){const p=el.dataset.v3Placeholder||el.placeholder;if(!el.dataset.v3Placeholder)el.dataset.v3Placeholder=p;if(T[p])el.placeholder=trPair(T[p]);}
}
function applyLanguage(){
  if(applying)return; applying=true;
  document.documentElement.lang=lang==='ru'?'ru':'kk';
  $$('.lang-switch button,[data-v3-lang]').forEach(b=>b.classList.toggle('active',b.dataset.v3Lang===lang));
  const sel='button,h1,h2,h3,h4,p,small,span,label,option,.eyebrow,.hero-kicker';
  $$(sel).forEach(translateExact);
  const search=$('#topicSearch');if(search){if(!search.dataset.v3Placeholder)search.dataset.v3Placeholder=search.placeholder;const p=search.dataset.v3Placeholder;if(T[p])search.placeholder=trPair(T[p]);}
  applying=false;
}
function setLang(v){lang=v;localStorage.setItem('bio7_lang',v);applyLanguage();enhanceStudyButtons();enhanceRating(true);}
function addLanguageUI(){
  if(!$('.lang-switch')){
    const host=$('.top-actions');if(host){const w=document.createElement('div');w.className='lang-switch';w.innerHTML='<button data-v3-lang="kk">KZ</button><button data-v3-lang="ru">RU</button>';host.prepend(w);w.onclick=e=>{const b=e.target.closest('[data-v3-lang]');if(b)setLang(b.dataset.v3Lang)}}
  }
  if(!$('#v3MobileLang')){const drawer=$('#mobileDrawer');if(drawer){const row=document.createElement('div');row.id='v3MobileLang';row.className='mobile-lang-row';row.innerHTML='<button data-v3-lang="kk">Қазақша</button><button data-v3-lang="ru">Русский</button>';drawer.appendChild(row);row.onclick=e=>{const b=e.target.closest('[data-v3-lang]');if(b)setLang(b.dataset.v3Lang)}}}
}

function readerMarkup(){return `<div class="book-reader" id="v3BookReader"><div class="book-shell"><div class="book-toolbar"><button id="v3BookPrev">‹</button><div class="book-title">${lang==='ru'?'Учебник биологии, 7 класс':'7-сынып биология оқулығы'}</div><div class="book-page-counter" id="v3BookCount">—</div><button id="v3BookNext">›</button><button class="book-close" id="v3BookClose">×</button></div><div class="book-stage" id="v3BookStage"><div class="book-loading" id="v3BookLoading">${lang==='ru'?'Загрузка учебника...':'Оқулық жүктелуде...'}</div><div class="book-pages" id="v3BookPages"><div class="book-page left"><canvas id="v3BookCanvasL"></canvas></div><div class="book-page right"><canvas id="v3BookCanvasR"></canvas></div></div><div class="book-spine"></div></div><div class="book-hint">${lang==='ru'?'Листайте кнопками или свайпом ← →':'Батырмамен немесе свайппен парақтаңыз ← →'}</div></div></div>`}
function ensureReader(){if($('#v3BookReader'))return;document.body.insertAdjacentHTML('beforeend',readerMarkup());$('#v3BookClose').onclick=closeBook;$('#v3BookPrev').onclick=()=>turnBook(-1);$('#v3BookNext').onclick=()=>turnBook(1);let x=0;const stage=$('#v3BookStage');stage.addEventListener('touchstart',e=>x=e.touches[0].clientX,{passive:true});stage.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-x;if(Math.abs(d)>45)turnBook(d<0?1:-1)},{passive:true});}
function loadPdfJs(){
  if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);if(pdfLoading)return pdfLoading;
  pdfLoading=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';res(window.pdfjsLib)};s.onerror=rej;document.head.appendChild(s)});return pdfLoading;
}
async function openBook(p=1){
  ensureReader();$('#v3BookReader').classList.add('open');document.body.style.overflow='hidden';pageNo=Math.max(1,Number(p)||1);$('#v3BookLoading').style.display='grid';
  try{const lib=await loadPdfJs();if(!pdfDoc)pdfDoc=await lib.getDocument({url:'biology7.pdf'}).promise;pageNo=Math.min(pageNo,pdfDoc.numPages);await renderBook()}catch(e){$('#v3BookLoading').textContent=lang==='ru'?'Не удалось открыть интерактивный учебник. Открываю PDF...':'Интерактивті оқулық ашылмады. PDF ашылады...';setTimeout(()=>window.open('biology7.pdf#page='+pageNo,'_blank'),700)}
}
function closeBook(){const r=$('#v3BookReader');if(r)r.classList.remove('open');document.body.style.overflow=''}
async function renderPageTo(canvas,n,maxW,maxH){if(!pdfDoc||n<1||n>pdfDoc.numPages){canvas.width=1;canvas.height=1;canvas.style.display='none';return}canvas.style.display='block';const p=await pdfDoc.getPage(n);const v1=p.getViewport({scale:1});const scale=Math.min(maxW/v1.width,maxH/v1.height,1.7);const v=p.getViewport({scale});canvas.width=Math.floor(v.width);canvas.height=Math.floor(v.height);await p.render({canvasContext:canvas.getContext('2d'),viewport:v}).promise;}
async function renderBook(dir=0){if(!pdfDoc)return;const token=++renderToken;const stage=$('#v3BookStage'),mobile=innerWidth<=900;const maxH=Math.max(300,stage.clientHeight-20),maxW=mobile?Math.max(260,stage.clientWidth-16):Math.max(300,(stage.clientWidth-40)/2);const pages=$('#v3BookPages');if(dir){pages.classList.remove('turn-next','turn-prev');void pages.offsetWidth;pages.classList.add(dir>0?'turn-next':'turn-prev')}
  const left=mobile?pageNo:Math.max(1,pageNo%2===0?pageNo:pageNo-1), right=mobile?null:left+1; if(!mobile)pageNo=left;
  await Promise.all([renderPageTo($('#v3BookCanvasL'),mobile?0:left,maxW,maxH),renderPageTo($('#v3BookCanvasR'),mobile?pageNo:right,maxW,maxH)]);if(token!==renderToken)return;$('#v3BookCount').textContent=mobile?`${pageNo} / ${pdfDoc.numPages}`:`${left}–${Math.min(right,pdfDoc.numPages)} / ${pdfDoc.numPages}`;$('#v3BookLoading').style.display='none';
}
function turnBook(dir){if(!pdfDoc)return;const step=innerWidth<=900?1:2;pageNo=Math.max(1,Math.min(pdfDoc.numPages,pageNo+dir*step));renderBook(dir)}
function bookPageFromHref(h){const m=String(h||'').match(/#page=(\d+)/);return m?Number(m[1]):1}
function bindBookIntercept(){document.addEventListener('click',e=>{const a=e.target.closest('a[href*="biology7.pdf"]');if(!a)return;e.preventDefault();openBook(bookPageFromHref(a.getAttribute('href')))});window.addEventListener('resize',()=>{if($('#v3BookReader')?.classList.contains('open')&&pdfDoc)renderBook()});}
function enhanceStudyButtons(){
  const studyHead=$('#study .section-head');if(studyHead&&!$('#v3OpenBook')){const b=document.createElement('button');b.id='v3OpenBook';b.className='btn soft';b.textContent=lang==='ru'?'📖 Учебник':'📖 Оқулық';b.onclick=()=>openBook(1);studyHead.appendChild(b)}else if($('#v3OpenBook'))$('#v3OpenBook').textContent=lang==='ru'?'📖 Учебник':'📖 Оқулық';
  const body=$('#topicModalBody');if(!body)return;const a=$('a[href*="biology7.pdf"]',body);if(a){a.textContent=lang==='ru'?'📖 Читать учебник':'📖 Оқулықты парақтау';a.classList.add('v3-book-btn')}
}


function loadAwards(){try{return JSON.parse(localStorage.getItem('bio7_awards')||'[]')}catch{return []}}
function saveAwards(a){localStorage.setItem('bio7_awards',JSON.stringify(a))}
function awardFor(r){const s=Number(r?.score)||0;if(s>=100)return {key:'perfect',ico:'🏆',kk:'Perfect кубогы',ru:'Кубок Perfect'};if(s>=90)return {key:'gold',ico:'🥇',kk:'Алтын медаль',ru:'Золотая медаль'};if(s>=80)return {key:'silver',ico:'🥈',kk:'Күміс медаль',ru:'Серебряная медаль'};if(s>=70)return {key:'bronze',ico:'🥉',kk:'Қола медаль',ru:'Бронзовая медаль'};return null}
function syncHistoricalAwards(rs){const existing=loadAwards();if(existing.length||!rs.length)return;const seed=rs.map(r=>{const a=awardFor(r);return a?{...a,score:Number(r.score)||0,date:r.created_at||new Date().toISOString(),title:r.title||r.test_type||'Test'}:null}).filter(Boolean);if(seed.length)saveAwards(seed.slice(-50));}
function checkNewAward(){
  let rs=[];try{rs=JSON.parse(localStorage.getItem('bio7_results')||'[]')}catch{};syncHistoricalAwards(rs);const seen=Number(localStorage.getItem('bio7_v3_seen_results')||0);if(!localStorage.getItem('bio7_v3_seen_results')){localStorage.setItem('bio7_v3_seen_results',String(rs.length));injectAwardShelf();return}if(rs.length<=seen){injectAwardShelf();return}localStorage.setItem('bio7_v3_seen_results',String(rs.length));const r=rs[rs.length-1],aw=awardFor(r);if(!aw){injectAwardShelf();return}const all=loadAwards();all.push({...aw,score:Number(r.score)||0,date:new Date().toISOString(),title:r.title||r.test_type||'Test'});saveAwards(all.slice(-50));showAward(aw,Number(r.score)||0);injectAwardShelf();
}
function showAward(aw,score){if($('.v3-award-overlay'))return;const o=document.createElement('div');o.className='v3-award-overlay';o.innerHTML=`<div class="v3-award-card"><div class="v3-award-icon">${aw.ico}</div><h2>${lang==='ru'?aw.ru:aw.kk}</h2><p>${lang==='ru'?`Результат ${score}%. Награда добавлена в твою коллекцию.`:`Нәтиже ${score}%. Марапат коллекцияңа қосылды.`}</p><button>${lang==='ru'?'Забрать награду':'Марапатты алу'}</button></div>`;document.body.appendChild(o);o.querySelector('button').onclick=()=>o.remove();}
function injectAwardShelf(){
  const root=$('#accountRoot');if(!root||$('#v3AwardShelf'))return;const all=loadAwards();const counts={perfect:0,gold:0,silver:0,bronze:0};all.forEach(a=>counts[a.key]=(counts[a.key]||0)+1);const box=document.createElement('div');box.id='v3AwardShelf';box.className='award-shelf';box.innerHTML=`<div class="award-shelf-head"><h3>${lang==='ru'?'Мои награды':'Менің марапаттарым'}</h3><span class="award-count">${all.length}</span></div><div class="award-grid"><div class="award-item"><span class="ico">🏆</span><b>${lang==='ru'?'Кубки':'Кубоктар'}</b><small>${counts.perfect}</small></div><div class="award-item"><span class="ico">🥇</span><b>${lang==='ru'?'Золото':'Алтын'}</b><small>${counts.gold}</small></div><div class="award-item"><span class="ico">🥈</span><b>${lang==='ru'?'Серебро':'Күміс'}</b><small>${counts.silver}</small></div><div class="award-item"><span class="ico">🥉</span><b>${lang==='ru'?'Бронза':'Қола'}</b><small>${counts.bronze}</small></div></div>`;root.appendChild(box);
}

function getSB(){if(sb)return sb;if(!window.supabase||!CFG.supabaseUrl||!CFG.supabaseAnonKey)return null;sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey);return sb}
function mondayISO(){const d=new Date(),day=(d.getDay()+6)%7;d.setHours(0,0,0,0);d.setDate(d.getDate()-day);return d.toISOString().slice(0,10)}
async function enhanceRating(force=false){
  if(ratingBusy)return;const root=$('#ratingRoot');if(!root||(!force&&$('#v3Competition')))return;const client=getSB();if(!client)return;ratingBusy=true;
  try{const {data:{session}}=await client.auth.getSession();if(!session){ratingBusy=false;return}const {data,error}=await client.from('weekly_leaderboard').select('*').eq('week_start',mondayISO()).order('xp',{ascending:false}).limit(50);if(error)throw error;const rows=data||[];const uid=session.user.id;const meIdx=rows.findIndex(x=>x.user_id===uid);const me=meIdx>=0?rows[meIdx]:null;const gap=meIdx>0?Math.max(0,Number(rows[meIdx-1].xp||0)-Number(me.xp||0)+1):0;
    $('#v3Competition')?.remove();const wrap=document.createElement('div');wrap.id='v3Competition';wrap.className='v3-compete';const top=rows.slice(0,3);wrap.innerHTML=`<div class="v3-rank-summary"><div class="v3-my-rank"><span>${lang==='ru'?'МОЁ МЕСТО НА ЭТОЙ НЕДЕЛЕ':'ОСЫ АПТАДАҒЫ ОРНЫМ'}</span><strong>${meIdx>=0?'#'+(meIdx+1):'—'}</strong><small>${me?`${me.xp} XP • ${me.best_score}%`:(lang==='ru'?'Сдай тест, чтобы войти в рейтинг':'Рейтингке кіру үшін тест тапсыр')}</small></div><div class="v3-chase"><span>${lang==='ru'?'СЛЕДУЮЩАЯ ЦЕЛЬ':'КЕЛЕСІ МАҚСАТ'}</span><b>${meIdx===0?(lang==='ru'?'Ты лидер! 🔥':'Сен лидерсің! 🔥'):meIdx>0?`+${gap} XP`:(lang==='ru'?'Попади в TOP':'TOP-қа кір')}</b><small>${meIdx>0?(lang==='ru'?`Обгони ${escH(rows[meIdx-1].display_name)}`:`${escH(rows[meIdx-1].display_name)}-дан оз`):''}</small></div></div><div class="v3-podium">${[1,0,2].map(i=>{const x=top[i];if(!x)return '<div></div>';const cls=i===0?'first':i===1?'second':'third',pos=i+1;return `<div class="v3-podium-card ${cls}"><div class="v3-place">${pos===1?'🏆':pos===2?'🥈':'🥉'}</div><b>${escH(x.display_name)}</b><small>${x.xp} XP • ${x.best_score}%</small></div>`}).join('')}</div><div class="v3-rank-list">${rows.map((x,i)=>`<div class="v3-rank-row ${x.user_id===uid?'me':''}"><div class="pos">#${i+1}</div><div class="name">${escH(x.display_name)}<small style="display:block;color:#7c9088;font-weight:700">${escH(x.class_name||'')}</small></div><div class="xp">${x.xp} XP</div><div class="best">${x.best_score}%</div></div>`).join('')||`<div style="padding:18px">${lang==='ru'?'Рейтинг пока пуст.':'Рейтинг әзірге бос.'}</div>`}</div><div style="margin-top:10px;text-align:right"><button class="v3-refresh" id="v3RankRefresh">${lang==='ru'?'Обновить рейтинг':'Рейтингті жаңарту'}</button></div>`;root.prepend(wrap);$('#v3RankRefresh').onclick=()=>{wrap.remove();enhanceRating(true)};
  }catch(e){console.warn('v3 rating',e)}finally{ratingBusy=false}
}
function escH(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

let raf=0;function afterDomChange(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{addLanguageUI();applyLanguage();enhanceStudyButtons();injectAwardShelf();if($('#rating')?.classList.contains('active'))enhanceRating();checkNewAward()})}
function init(){addLanguageUI();applyLanguage();ensureReader();bindBookIntercept();afterDomChange();new MutationObserver(afterDomChange).observe($('#appShell')||document.body,{childList:true,subtree:true});document.addEventListener('click',e=>{const nav=e.target.closest('[data-go="rating"]');if(nav)setTimeout(()=>enhanceRating(true),250);const acc=e.target.closest('[data-go="account"]');if(acc)setTimeout(injectAwardShelf,200)});setInterval(checkNewAward,1800);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.BioOlympV3={openBook,setLang,refreshRating:()=>enhanceRating(true)};
})();

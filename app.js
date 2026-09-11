(function(){
'use strict';

const TOPICS = window.BIO_TOPICS || [];
const SECTIONS = window.BIO_SECTIONS || [];
const PRO_BANK = window.BIO_PRO_BANK || [];
const CFG = window.BIOOLYMP_CONFIG || {};
const LETTERS = ['A','B','C','D'];

const state = {
  view:'home',
  session:null,
  profile:null,
  sb:null,
  results:loadLS('bio7_results',[]),
  mistakes:loadLS('bio7_mistakes',{}),
  assignments:[],
  leaderboard:[],
  students:[],
  teacherResults:[],
  quiz:null,
  installPrompt:null,
  teacherLoaded:false
};

function q(s,r=document){return r.querySelector(s)}
function qa(s,r=document){return Array.from(r.querySelectorAll(s))}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function loadLS(k,f){try{const v=JSON.parse(localStorage.getItem(k));return v??f}catch(e){return f}}
function saveLS(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function fmtDate(v){if(!v)return '—';try{return new Date(v).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return '—'}}
function weekStart(d=new Date()){const x=new Date(d);const day=(x.getDay()+6)%7;x.setHours(0,0,0,0);x.setDate(x.getDate()-day);return x.toISOString().slice(0,10)}
function toast(msg){const root=q('#toastRoot');if(!root)return;const el=document.createElement('div');el.className='toast';el.textContent=msg;root.appendChild(el);setTimeout(()=>el.remove(),3200)}
function openModal(id){const m=q('#'+id);if(!m)return;m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeModal(id){const m=q('#'+id);if(!m)return;m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.style.overflow='';if(id==='quizModal')stopTimer()}
function topicById(id){return TOPICS.find(t=>Number(t.id)===Number(id))}
function cleanTitle(t){return String(t||'').replace(/^§\d+\.\s*/,'')}
function questionKey(topicId,n){return `${topicId}:${n}`}
function normalizeQuestion(raw,topicId,source='base'){
  const n=raw.n ?? raw.id ?? Math.random().toString(36).slice(2);
  return {key:questionKey(topicId,n),topicId:Number(topicId),n,q:raw.q,options:[...raw.options],answer:raw.answer,source,difficulty:raw.difficulty||1};
}
function allBaseQuestions(topicIds=null){
  const ids=topicIds?.length?new Set(topicIds.map(Number)):null;
  return TOPICS.filter(t=>!ids||ids.has(Number(t.id))).flatMap(t=>t.questions.map(x=>normalizeQuestion(x,t.id,'base')));
}
function allProQuestions(topicIds=null){
  const ids=topicIds?.length?new Set(topicIds.map(Number)):null;
  return PRO_BANK.filter(x=>!ids||ids.has(Number(x.topicId))).map(x=>normalizeQuestion(x,x.topicId,'pro'));
}

function go(id){
  if(!q('#'+id)) id='home';
  state.view=id;
  qa('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  qa('[data-go]').forEach(b=>b.classList.toggle('active',b.dataset.go===id));
  q('#mobileDrawer')?.classList.remove('open');q('#drawerBackdrop')?.classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
  if(id==='study')renderStudy();
  if(id==='tests')renderTestBuilder();
  if(id==='mistakes')renderMistakes();
  if(id==='assignments')renderAssignments();
  if(id==='rating')renderRating();
  if(id==='account')renderAccount();
  if(id==='teacher')renderTeacher();
}
window.go=go;

function bindShell(){
  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-go]');if(nav){go(nav.dataset.go);return}
    const close=e.target.closest('[data-close]');if(close){closeModal(close.dataset.close);return}
  });
  q('#menuBtn')?.addEventListener('click',()=>{q('#mobileDrawer').classList.add('open');q('#drawerBackdrop').classList.add('open')});
  q('#drawerClose')?.addEventListener('click',()=>{q('#mobileDrawer').classList.remove('open');q('#drawerBackdrop').classList.remove('open')});
  q('#drawerBackdrop')?.addEventListener('click',()=>{q('#mobileDrawer').classList.remove('open');q('#drawerBackdrop').classList.remove('open')});
  q('#bottomMore')?.addEventListener('click',()=>{q('#mobileDrawer').classList.add('open');q('#drawerBackdrop').classList.add('open')});
  q('#quickOlympiadBtn')?.addEventListener('click',()=>go('olympiad'));q('#homeInstallBtn')?.addEventListener('click',installPwa);
  q('#quizPrintBtn')?.addEventListener('click',printCurrentQuiz);
  q('#topicSearch')?.addEventListener('input',renderStudy);
}

function bestByTopic(){
  const m={};
  state.results.forEach(r=>{if(r.topic_id!=null)m[r.topic_id]=Math.max(m[r.topic_id]||0,Number(r.score)||0)});
  return m;
}
function stats(){
  const arr=state.results.map(r=>Number(r.score)||0);return {attempts:arr.length,avg:arr.length?Math.round(arr.reduce((a,b)=>a+b,0)/arr.length):0,best:arr.length?Math.max(...arr):0}
}
function xpTotal(){return state.results.reduce((s,r)=>s+Math.round((Number(r.score)||0)/5)+(r.test_type==='olympiad'?10:0),0)}
function levelInfo(){
  const xp=xpTotal();const levels=[['BioStart',0,250],['Explorer',250,600],['Researcher',600,1200],['BioMaster',1200,2000],['Olympiad Pro',2000,999999]];
  const cur=levels.find(x=>xp>=x[1]&&xp<x[2])||levels.at(-1);return {xp,name:cur[0],min:cur[1],max:cur[2],pct:cur[2]>900000?100:clamp(Math.round((xp-cur[1])/(cur[2]-cur[1])*100),0,100)}
}
function renderHome(){
  q('#homeAvg').textContent=stats().avg+'%';
  renderChallengeHome();
}

function renderStudy(){
  const search=(q('#topicSearch')?.value||'').trim().toLowerCase();
  const best=bestByTopic();
  const pRoot=q('#sectionsProgress');
  pRoot.innerHTML=SECTIONS.map(sec=>{
    const done=sec.topicIds.filter(id=>(best[id]||0)>=80).length;const pct=Math.round(done/sec.topicIds.length*100);
    const eligible=done===sec.topicIds.length;
    return `<article class="section-progress-card"><h3>${esc(sec.title)}</h3><div class="progress"><i style="width:${pct}%"></i></div><div class="progress-meta"><span>${done}/${sec.topicIds.length}</span><span>${pct}%</span></div>${eligible?`<button class="btn soft" style="margin-top:9px;width:100%" data-cert="${sec.id}">Сертификат</button>`:''}</article>`
  }).join('');
  qa('[data-cert]',pRoot).forEach(b=>b.onclick=()=>showCertificate(b.dataset.cert));
  const root=q('#topicsList');let html='';
  SECTIONS.forEach(sec=>{
    const list=TOPICS.filter(t=>sec.topicIds.includes(Number(t.id))).filter(t=>!search||t.title.toLowerCase().includes(search)||t.summary?.toLowerCase().includes(search));
    if(!list.length)return;
    html+=`<h3 class="topic-group-title">${esc(sec.title)}</h3><div class="topic-grid">`+list.map(t=>`<article class="topic-card"><div class="topic-num">${t.id}</div><h3>${esc(cleanTitle(t.title))}</h3><div class="progress"><i style="width:${best[t.id]||0}%"></i></div><div class="progress-meta"><span>best</span><span>${best[t.id]||0}%</span></div><div class="topic-card-actions"><button data-topic="${t.id}">Оқу</button><button data-topic-test="${t.id}">15 тест</button></div></article>`).join('')+'</div>';
  });
  root.innerHTML=html||'<div class="panel">Тақырып табылмады.</div>';
  qa('[data-topic]',root).forEach(b=>b.onclick=()=>openTopic(Number(b.dataset.topic)));
  qa('[data-topic-test]',root).forEach(b=>b.onclick=()=>startTopicTest(Number(b.dataset.topicTest)));
}

function openTopic(id){
  const t=topicById(id);if(!t)return;
  q('#topicModalTitle').textContent=t.title;
  const concepts=t.concepts.map(c=>`<div class="panel" style="box-shadow:none;margin:8px 0"><b style="color:var(--green)">${esc(c.term)}</b><p style="margin:5px 0;color:var(--muted);line-height:1.5">${esc(c.def)}</p></div>`).join('');
  q('#topicModalBody').innerHTML=`<div style="padding:18px"><div class="panel" style="box-shadow:none;background:#f7fbf8"><h3 style="margin-top:0">Қысқаша конспект</h3><p style="line-height:1.65">${esc(t.summary)}</p><div class="mini-pill">Olymp tip: ${esc(t.olympTip||'Терминдерді байланыспен түсін.')}</div></div><h3>Негізгі ұғымдар</h3>${concepts}<div class="form-row" style="margin-top:14px"><button class="btn green" id="topicStartTest">15 сұрақ</button><a class="btn soft" style="text-decoration:none" href="assets/biology7.pdf#page=${Math.max(1,Number(t.page)||1)}" target="_blank">Оқулық бетін ашу</a><a class="btn ghost" style="text-decoration:none" href="${esc(t.youtubeSearch||'#')}" target="_blank" rel="noopener">Видео іздеу</a></div></div>`;
  q('#topicStartTest').onclick=()=>{closeModal('topicModal');startTopicTest(id)};
  openModal('topicModal');
}

function renderTestBuilder(){
  const root=q('#testBuilder');
  root.innerHTML=`<div class="form-grid"><div class="form-col"><label>Сұрақ саны</label><select id="tbCount"><option>15</option><option>30</option><option>50</option></select></div><div class="form-col"><label>Банк</label><select id="tbBank"><option value="base">Базалық</option><option value="mixed">Base + PRO</option><option value="pro">Тек PRO</option></select></div><div class="form-col"><label>Режим</label><select id="tbMode"><option value="practice">Тренировка</option><option value="exam">Без подсказок</option></select></div><div class="form-col"><label>Печать</label><select id="tbVariants"><option value="1">1 вариант</option><option value="3">A / B / C</option></select></div></div><div class="check-grid" id="tbSections">${SECTIONS.map(s=>`<label class="check-chip"><input type="checkbox" value="${s.id}" checked> ${esc(s.title)}</label>`).join('')}</div><div class="form-row"><button class="btn green" id="tbStart">Начать тест</button><button class="btn soft" id="tbPrint">Распечатать / PDF</button></div>`;
  q('#tbStart').onclick=()=>startBuiltTest(false);
  q('#tbPrint').onclick=()=>startBuiltTest(true);
  renderHistory();
}
function selectedTopicIds(){
  const checked=qa('#tbSections input:checked').map(x=>x.value);return SECTIONS.filter(s=>checked.includes(s.id)).flatMap(s=>s.topicIds);
}
function builtQuestions(){
  const count=Number(q('#tbCount').value);const bank=q('#tbBank').value;const ids=selectedTopicIds();
  let pool=bank==='base'?allBaseQuestions(ids):bank==='pro'?allProQuestions(ids):[...allBaseQuestions(ids),...allProQuestions(ids)];
  return shuffle(pool).slice(0,Math.min(count,pool.length));
}
function startBuiltTest(printMode){
  const variants=Number(q('#tbVariants').value);if(printMode&&variants===3){printVariants();return}
  const questions=builtQuestions();startQuiz({title:'BioOlymp 7 — аралас тест',type:q('#tbMode').value==='exam'?'exam':'random',questions,printAfterOpen:printMode});
}
function renderHistory(){
  const root=q('#testHistory');if(!root)return;const rows=[...state.results].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,10);
  root.innerHTML=`<div class="section-head" style="margin-top:24px"><div><h2 style="font-size:24px">Соңғы нәтижелер</h2></div></div><div class="history-list">${rows.length?rows.map(r=>`<div class="history-row"><div><b>${esc(r.title||r.test_type)}</b><br><small>${fmtDate(r.created_at)} • ${r.correct||0}/${r.total||0}</small></div><span class="score-pill">${r.score}%</span></div>`).join(''):'<div class="panel">Әзірге нәтиже жоқ.</div>'}</div>`;
}

function renderOlympiadSetup(){
  q('#olympiadSetup').innerHTML=`<div class="olympiad-card"><span class="hero-kicker">OLYMPIAD EXAM</span><h3>Экзамен сияқты тапсырамыз</h3><p>Сұрақтар аралас, таймер жүреді, дұрыс жауап тест соңында ғана көрсетіледі. PRO сұрақтар қосылады.</p><div class="form-row"><button class="btn primary" data-oly="30">30 сұрақ</button><button class="btn light" data-oly="50">50 сұрақ</button></div></div><div class="tool-panel"><div class="form-col"><label>Уақыт</label><select id="olyMinutes"><option value="30">30 минут</option><option value="45" selected>45 минут</option><option value="60">60 минут</option></select></div><div class="form-col" style="margin-top:10px"><label>PRO үлесі</label><select id="olyPro"><option value="30">30%</option><option value="50" selected>50%</option><option value="70">70%</option></select></div><div class="panel" style="margin-top:12px;box-shadow:none;background:#f8fbf9"><b>Ереже</b><p style="color:var(--muted);line-height:1.5">Подсказка жоқ. Таймер аяқталса тест автоматты түрде жабылады.</p></div></div>`;
  qa('[data-oly]').forEach(b=>b.onclick=()=>startOlympiad(Number(b.dataset.oly)));
}
function startOlympiad(count){
  const pct=Number(q('#olyPro')?.value||50);const proCount=Math.round(count*pct/100);const baseCount=count-proCount;
  const questions=[...shuffle(allProQuestions()).slice(0,proCount),...shuffle(allBaseQuestions()).slice(0,baseCount)];
  startQuiz({title:`Olympiad Exam • ${count} сұрақ`,type:'olympiad',questions:shuffle(questions),timeLimit:Number(q('#olyMinutes')?.value||45)*60});
}

function startTopicTest(topicId){const t=topicById(topicId);startQuiz({title:t.title,type:'topic',topicId,questions:shuffle(t.questions.map(x=>normalizeQuestion(x,topicId,'base')))})}
function startMistakeTraining(){
  const active=Object.values(state.mistakes).filter(m=>!m.resolved);const qs=active.map(m=>findQuestionByKey(m.key)).filter(Boolean);
  if(!qs.length){toast('Актив қате жоқ 👍');return}startQuiz({title:'Работа над ошибками',type:'mistakes',questions:shuffle(qs).slice(0,50)});
}
function findQuestionByKey(key){
  const [tid,n]=String(key).split(':');const t=topicById(Number(tid));if(!t)return null;const raw=t.questions.find(x=>String(x.n)===String(n));if(raw)return normalizeQuestion(raw,t.id,'base');return PRO_BANK.map(x=>normalizeQuestion(x,x.topicId,'pro')).find(x=>x.key===key)||null;
}

function startQuiz(opts){
  stopTimer();
  const questions=opts.questions||[];if(!questions.length){toast('Сұрақ табылмады');return}
  state.quiz={title:opts.title||'Тест',type:opts.type||'random',topicId:opts.topicId??null,questions,answers:{},startedAt:Date.now(),timeLimit:opts.timeLimit||0,assignmentId:opts.assignmentId||null,meta:opts.meta||null,submitted:false};
  q('#quizTitle').textContent=state.quiz.title;q('#quizModeLabel').textContent=opts.type==='olympiad'?'OLYMPIAD MODE':'BIOOLYMP 7';
  renderQuiz();openModal('quizModal');
  if(state.quiz.timeLimit)startTimer(state.quiz.timeLimit);
  if(opts.printAfterOpen)setTimeout(printCurrentQuiz,250);
}
function renderQuiz(){
  const z=state.quiz;const root=q('#quizBody');
  root.innerHTML=`<div class="quiz-body"><div class="print-only"><h2>${esc(z.title)}</h2><p>Оқушы: ____________________ Сынып: ______ Күні: __________</p></div>${z.questions.map((x,i)=>`<article class="question-card" data-qindex="${i}"><div class="question-title">${i+1}. ${esc(x.q)}</div>${x.options.map((op,j)=>`<label class="option"><input type="radio" name="q${i}" value="${LETTERS[j]}"><span><b>${LETTERS[j]}.</b> ${esc(op)}</span></label>`).join('')}</article>`).join('')}<div class="print-only answer-sheet"><h3>Жауап парағы</h3><div>${z.questions.map((_,i)=>`${i+1}. A ○ B ○ C ○ D ○`).join('<br>')}</div></div></div><div class="quiz-footer"><span id="quizAnswered">0/${z.questions.length}</span><button class="btn green" id="quizSubmit">Тестті аяқтау</button></div>`;
  qa('input[type=radio]',root).forEach(inp=>inp.onchange=()=>{state.quiz.answers[inp.name]=inp.value;updateQuizProgress()});
  q('#quizSubmit').onclick=()=>submitQuiz(false);updateQuizProgress();
}
function updateQuizProgress(){const total=state.quiz.questions.length;const answered=Object.keys(state.quiz.answers).length;q('#quizAnswered').textContent=`${answered}/${total}`;q('#quizProgressBar i').style.width=`${Math.round(answered/total*100)}%`}
function startTimer(seconds){
  state.quiz.remaining=seconds;const el=q('#quizTimer');el.classList.remove('hidden');const tick=()=>{const s=Math.max(0,state.quiz.remaining--);el.textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;if(s<=0){stopTimer();submitQuiz(true)}};tick();state.quiz.timerId=setInterval(tick,1000)
}
function stopTimer(){if(state.quiz?.timerId)clearInterval(state.quiz.timerId);if(q('#quizTimer'))q('#quizTimer').classList.add('hidden')}
async function submitQuiz(auto){
  const z=state.quiz;if(!z||z.submitted)return;z.submitted=true;stopTimer();
  let correct=0;const wrong=[];
  z.questions.forEach((x,i)=>{const a=z.answers['q'+i];if(a===x.answer){correct++;markMistakeCorrect(x)}else{wrong.push(x);markMistakeWrong(x)}});
  const total=z.questions.length,score=Math.round(correct/total*100),duration=Math.round((Date.now()-z.startedAt)/1000);
  const result={id:'local-'+Date.now(),user_id:state.profile?.id||null,test_type:z.type,topic_id:z.topicId,title:z.title,score,correct,total,duration_seconds:duration,assignment_id:z.assignmentId||null,created_at:new Date().toISOString(),meta:z.meta||null};
  state.results.push(result);saveLS('bio7_results',state.results);renderHome();
  await saveResultRemote(result);await syncMistakesRemote(wrong);
  const root=q('#quizBody');root.innerHTML=`<div class="quiz-body"><div class="result-box"><span class="eyebrow">НӘТИЖЕ</span><div><b>${score}%</b></div><p>${correct}/${total} дұрыс • ${wrong.length} қате • ${Math.max(1,Math.round(duration/60))} мин</p><div class="form-row"><button class="btn green" id="resultErrors">Ошибкалармен жұмыс</button><button class="btn soft" id="resultClose">Жабу</button></div></div>${wrong.length?`<h3>Қате кеткен сұрақтар</h3>${wrong.slice(0,10).map(x=>`<div class="mistake-item"><b>${esc(topicById(x.topicId)?.title||'')}</b><p>${esc(x.q)}</p></div>`).join('')}`:''}</div>`;
  q('#resultErrors').onclick=()=>{closeModal('quizModal');go('mistakes')};q('#resultClose').onclick=()=>closeModal('quizModal');
  showReaction(wrong.length,total,score);
  try{window.dispatchEvent(new CustomEvent('bioolymp:result',{detail:{result,wrong,questions:z.questions,meta:z.meta||null}}))}catch(e){}
}

function markMistakeWrong(x){
  const m=state.mistakes[x.key]||{key:x.key,topicId:x.topicId,wrongCount:0,correctStreak:0,resolved:false};m.wrongCount++;m.correctStreak=0;m.resolved=false;m.updatedAt=new Date().toISOString();state.mistakes[x.key]=m;saveLS('bio7_mistakes',state.mistakes)
}
function markMistakeCorrect(x){
  const m=state.mistakes[x.key];if(!m)return;m.correctStreak=(m.correctStreak||0)+1;if(m.correctStreak>=2)m.resolved=true;m.updatedAt=new Date().toISOString();saveLS('bio7_mistakes',state.mistakes)
}
function renderMistakes(){
  const root=q('#mistakesRoot'),arr=Object.values(state.mistakes),active=arr.filter(x=>!x.resolved),resolved=arr.filter(x=>x.resolved);
  root.innerHTML=`<div class="mistake-summary"><div class="mistake-box"><small>Актив</small><b>${active.length}</b></div><div class="mistake-box"><small>Исправлено</small><b style="color:var(--green)">${resolved.length}</b></div><div class="mistake-box"><small>Барлық қате</small><b>${arr.reduce((s,x)=>s+(x.wrongCount||0),0)}</b></div></div><div class="form-row" style="margin:14px 0"><button class="btn green" id="mistakeTrain">Тек қателерден тест</button><button class="btn ghost" id="mistakeClearResolved">Исправленные скрыть</button></div><div class="history-list">${active.length?active.map(m=>{const x=findQuestionByKey(m.key);return `<div class="mistake-item"><b>${esc(topicById(m.topicId)?.title||'')}</b><p>${esc(x?.q||m.key)}</p><small>Қате: ${m.wrongCount} • Дұрыс серия: ${m.correctStreak||0}/2</small></div>`}).join(''):'<div class="panel">Қазір актив қате жоқ. Красавчик 😌</div>'}</div>`;
  q('#mistakeTrain').onclick=startMistakeTraining;q('#mistakeClearResolved').onclick=()=>{Object.keys(state.mistakes).forEach(k=>{if(state.mistakes[k].resolved)delete state.mistakes[k]});saveLS('bio7_mistakes',state.mistakes);renderMistakes()};
}

const REACTIONS=[
  {max:0,photo:'teacher-success.jpg',strict:false,title:['Ооо, вот это я понимаю 😌','Міне, осылай! Вообще без вопросов 😎','0 ошибок? Красиво зашло.'],text:['Продолжаем в том же темпе.','Сегодня я к тебе вообще не придираюсь 😂']},
  {max:2,photo:'teacher-success.jpg',strict:false,title:['Нормально. Но эти ошибки я видела 👀','Почти идеально. Почти 😏','Хорошо-хорошо, но 2 ошибки не спрятались.'],text:['Быстро посмотри ошибки — и дальше.','Исправь и забудем, что я это видела 😂']},
  {max:5,photo:'teacher-original.jpg',strict:false,title:['Так… кто тему до конца не дочитал? 😐','Неплохо, но расслабляться рано.','Эй, эти ошибки откуда пришли? 😂'],text:['Қате дәптерін аш та, добей их.','Ещё один заход — и будет нормально.']},
  {max:8,photo:'teacher-original-2.jpg',strict:true,title:['Әй, это что сейчас было? 😂','Так. Я уже начинаю смотреть строго 👀','Нууу… оқулықты аш, пожалуйста 😭'],text:['Сначала ошибки, потом следующий тест.','Никуда не спешим. Разбираем по-человечески.']},
  {max:11,photo:'teacher-strict.jpg',strict:true,title:['Всё. Стоп. Никуда дальше не идём 😭','Так, телефон в сторону. Тему открыли.','Ай-ай-ай… я всё увидела 😐'],text:['Конспект → оқулық → ошибки → қайта тест.','Сейчас без паники, но тему реально надо повторить.']},
  {max:999,photo:'teacher-strict.jpg',strict:true,title:['Нет. Просто нет 😭😂','Так, начинаем сначала. Без вариантов.','Я сейчас даже комментировать не буду… почти 😭'],text:['Оқулықты аш. Прямо сейчас.','Сначала разберём базу, потом вернёмся в тест.']}
];
function showReaction(errors,total,score){
  const v=REACTIONS.find(x=>errors<=x.max)||REACTIONS.at(-1);const title=v.title[Math.floor(Math.random()*v.title.length)],text=v.text[Math.floor(Math.random()*v.text.length)];const card=q('#reactionCard');card.className='reaction-card'+(v.strict?' strict':'');card.innerHTML=`<div class="reaction-photo"><img src="assets/${v.photo}" alt="Айдана апай"></div><div class="reaction-copy"><span class="eyebrow">${errors} ҚАТЕ • ${score}%</span><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="form-row"><button class="btn ${v.strict?'danger':'green'}" id="reactionErrors">Работа над ошибками</button><button class="btn ghost" id="reactionClose">Жабу</button></div></div>`;q('#reactionErrors').onclick=()=>{closeModal('reactionModal');closeModal('quizModal');go('mistakes')};q('#reactionClose').onclick=()=>closeModal('reactionModal');openModal('reactionModal')
}

function printCurrentQuiz(){
  if(!state.quiz){toast('Алдымен тестті аш');return}const m=q('#quizModal');m.classList.add('print-target');window.print();setTimeout(()=>m.classList.remove('print-target'),300)
}
function printVariants(){
  const count=Number(q('#tbCount').value),bank=q('#tbBank').value,ids=selectedTopicIds();let pool=bank==='base'?allBaseQuestions(ids):bank==='pro'?allProQuestions(ids):[...allBaseQuestions(ids),...allProQuestions(ids)];
  const vars=['A','B','C'].map(letter=>({letter,qs:shuffle(pool).slice(0,Math.min(count,pool.length))}));
  const printWin=window.open('','_blank');if(!printWin){toast('Popup блокталды. Браузерде pop-up рұқсат ет.');return}
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>BioOlymp 7 — варианты</title><style>@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;color:#111}.variant{page-break-after:always}.variant:last-child{page-break-after:auto}h1{font-size:20px}.meta{margin:10px 0 18px}.q{break-inside:avoid;margin:0 0 12px}.o{margin:3px 0}.answers{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:16px}.a{border:1px solid #aaa;padding:5px;font-size:11px}</style></head><body>${vars.map(v=>`<section class="variant"><h1>BioOlymp 7 • Вариант ${v.letter}</h1><div class="meta">Оқушы: ____________________ Сынып: ______ Күні: __________</div>${v.qs.map((x,i)=>`<div class="q"><b>${i+1}. ${esc(x.q)}</b>${x.options.map((o,j)=>`<div class="o">${LETTERS[j]}. ${esc(o)}</div>`).join('')}</div>`).join('')}<h3>Жауап парағы</h3><div class="answers">${v.qs.map((_,i)=>`<div class="a">${i+1}. A ○ B ○ C ○ D ○</div>`).join('')}</div></section>`).join('')}</body></html>`;
  printWin.document.write(html);printWin.document.close();setTimeout(()=>printWin.print(),250)
}

async function initSupabase(){
  if(!window.supabase?.createClient||!CFG.supabaseUrl||String(CFG.supabaseUrl).includes('YOUR_'))return;
  try{state.sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey);const r=await state.sb.auth.getSession();state.session=r.data.session||null;if(state.session)await loadProfileAndData();state.sb.auth.onAuthStateChange(async(_e,s)=>{state.session=s;if(s)await loadProfileAndData();else{state.profile=null;syncRoleUI();renderAccount()}})}catch(e){console.warn(e)}
}
async function loadProfileAndData(){
  if(!state.sb||!state.session)return;const uid=state.session.user.id;const {data:p}=await state.sb.from('profiles').select('*').eq('id',uid).maybeSingle();state.profile=p||null;syncRoleUI();await Promise.all([loadRemoteResults(),loadRemoteMistakes(),loadAssignments(),loadLeaderboard()]);renderHome();if(state.view==='account')renderAccount()
}
function syncRoleUI(){const teacher=state.profile?.role==='teacher';qa('.teacher-only').forEach(x=>x.classList.toggle('hidden',!teacher));q('#teacherNavBtn')?.classList.toggle('hidden',!teacher)}
async function loadRemoteResults(){if(!state.sb||!state.session)return;const {data}=await state.sb.from('results').select('*').eq('user_id',state.session.user.id).order('created_at',{ascending:false}).limit(1500);if(data){const map=new Map();[...state.results,...data].forEach(r=>map.set(String(r.id||r.created_at)+':'+(r.title||''),r));state.results=[...map.values()];saveLS('bio7_results',state.results)}}
async function saveResultRemote(r){if(!state.sb||!state.session)return;try{const payload={user_id:state.session.user.id,test_type:r.test_type,topic_id:r.topic_id,title:r.title,score:r.score,correct:r.correct,total:r.total,duration_seconds:r.duration_seconds,assignment_id:r.assignment_id||null};const {data,error}=await state.sb.from('results').insert(payload).select().single();if(error)throw error;if(data){const i=state.results.findIndex(x=>x.id===r.id);if(i>=0)state.results[i]=data;saveLS('bio7_results',state.results)}}catch(e){console.warn('save result',e)}}
async function loadRemoteMistakes(){if(!state.sb||!state.session)return;try{const {data}=await state.sb.from('mistakes').select('*').eq('user_id',state.session.user.id);if(data)data.forEach(m=>{state.mistakes[m.question_key]={key:m.question_key,topicId:m.topic_id,wrongCount:m.wrong_count,correctStreak:m.correct_streak,resolved:m.resolved,updatedAt:m.updated_at}});saveLS('bio7_mistakes',state.mistakes)}catch(e){}}
async function syncMistakesRemote(){if(!state.sb||!state.session)return;const rows=Object.values(state.mistakes).map(m=>({user_id:state.session.user.id,question_key:m.key,topic_id:m.topicId,wrong_count:m.wrongCount||0,correct_streak:m.correctStreak||0,resolved:!!m.resolved,updated_at:new Date().toISOString()}));if(!rows.length)return;try{await state.sb.from('mistakes').upsert(rows,{onConflict:'user_id,question_key'})}catch(e){}}
function loginEmail(u){return `${String(u).trim().toLowerCase()}@${CFG.loginDomain||'bioolymp7.local'}`}

function renderAccount(){
  const root=q('#accountRoot');if(!state.sb){root.innerHTML='<div class="auth-card"><h2>Кабинет</h2><p>Supabase баптауы табылмады. Offline режим жұмыс істейді.</p></div>';return}
  if(!state.session){root.innerHTML=`<div class="section-head"><div><span class="eyebrow">BIOOLYMP ID</span><h2>Кабинет</h2></div></div><div class="auth-card"><div class="auth-grid"><input id="loginUser" placeholder="Логин"><input id="loginPass" type="password" placeholder="Пароль"><button class="btn green" id="loginBtn">Кіру</button><div id="authMsg"></div></div><hr style="border:0;border-top:1px solid var(--line);margin:20px 0"><h3>Жаңа аккаунт</h3><div class="auth-grid"><input id="regName" placeholder="Аты-жөні"><input id="regClass" placeholder="Сынып, мысалы 7 Б"><input id="regUser" placeholder="Логин"><input id="regPass" type="password" placeholder="Пароль 6+"><button class="btn soft" id="regBtn">Тіркелу</button></div></div>`;q('#loginBtn').onclick=login;q('#regBtn').onclick=register;return}
  const st=stats(),lv=levelInfo(),best=bestByTopic();const completed=Object.values(best).filter(v=>v>=80).length;
  root.innerHTML=`<div class="section-head"><div><span class="eyebrow">КАБИНЕТ</span><h2>${esc(state.profile?.full_name||state.profile?.username||'Пайдаланушы')}</h2><p>${esc(state.profile?.class_name||'')} • @${esc(state.profile?.username||'')}</p></div><button class="btn ghost" id="logoutBtn">Шығу</button></div><div class="account-grid"><div class="level-card"><small>Деңгей</small><b>${lv.name}</b><p>${lv.xp} XP</p><div class="level-track"><i style="width:${lv.pct}%"></i></div></div><div class="panel"><small>Орташа нәтиже</small><h2>${st.avg}%</h2><p>${st.attempts} попытка</p></div><div class="panel"><small>80%+ тақырып</small><h2>${completed}/63</h2><p>Бөлім сертификатына жол</p></div></div><div class="section-head" style="margin-top:24px"><div><h2 style="font-size:25px">Сертификаттар</h2></div></div><div class="section-progress-grid">${certificateCards()}</div>`;
  q('#logoutBtn').onclick=()=>state.sb.auth.signOut();qa('[data-cert]',root).forEach(b=>b.onclick=()=>showCertificate(b.dataset.cert))
}
async function login(){const u=q('#loginUser').value.trim(),p=q('#loginPass').value,m=q('#authMsg');m.textContent='Кіру...';const {error}=await state.sb.auth.signInWithPassword({email:loginEmail(u),password:p});m.textContent=error?error.message:''}
async function register(){const full=q('#regName').value.trim(),cl=q('#regClass').value.trim(),u=q('#regUser').value.trim().toLowerCase(),p=q('#regPass').value;if(!full||u.length<3||p.length<6){toast('Деректерді дұрыстап толтыр');return}const {error}=await state.sb.auth.signUp({email:loginEmail(u),password:p,options:{data:{username:u,full_name:full,class_name:cl||'7 сынып'}}});if(error)toast(error.message);else toast('Аккаунт дайын')}
function certificateCards(){const best=bestByTopic();return SECTIONS.map(sec=>{const done=sec.topicIds.filter(id=>(best[id]||0)>=80).length,ok=done===sec.topicIds.length;return `<article class="section-progress-card"><h3>${esc(sec.title)}</h3><p>${done}/${sec.topicIds.length} тақырып</p>${ok?`<button class="btn green" data-cert="${sec.id}">Сертификат алу</button>`:'<button class="btn ghost" disabled>Әлі аяқталмаған</button>'}</article>`}).join('')}

function sectionAverage(sec){const best=bestByTopic();return Math.round(sec.topicIds.reduce((s,id)=>s+(best[id]||0),0)/sec.topicIds.length)}
async function showCertificate(secId){const sec=SECTIONS.find(s=>s.id===secId);if(!sec)return;const best=bestByTopic();if(!sec.topicIds.every(id=>(best[id]||0)>=80)){toast('Бұл бөлім әлі толық аяқталмады');return}const name=state.profile?.full_name||'BioOlymp 7 оқушысы',score=sectionAverage(sec),code='B7-'+sec.id.toUpperCase()+'-'+String(Date.now()).slice(-6);q('#certificateRoot').innerHTML=`<div class="certificate" id="certificatePaper"><small>№1 Хромтау орта мектебі</small><h1>СЕРТИФИКАТ</h1><p>осы сертификат</p><div class="name">${esc(name)}</div><p><b>${esc(sec.title)}</b> бөлімін сәтті аяқтағаны үшін беріледі.</p><div class="cert-grid"><div><b>Нәтиже:</b> ${score}%</div><div><b>Күні:</b> ${new Date().toLocaleDateString('ru-RU')}</div><div><b>Жетекші:</b> Сисекенова Айдана</div><div><b>Код:</b> ${code}</div></div><div class="form-row" style="justify-content:center"><button class="btn green" id="certPrint">PDF / распечатать</button></div></div>`;q('#certPrint').onclick=()=>{const m=q('#certificateModal');m.classList.add('print-target');window.print();setTimeout(()=>m.classList.remove('print-target'),300)};openModal('certificateModal');if(state.sb&&state.session){try{await state.sb.from('certificates').upsert({user_id:state.session.user.id,section_id:sec.id,section_title:sec.title,score,code},{onConflict:'user_id,section_id'})}catch(e){}}
}

async function loadAssignments(){if(!state.sb||!state.session)return;try{const {data}=await state.sb.from('assignments').select('*').eq('active',true).order('created_at',{ascending:false});state.assignments=data||[]}catch(e){state.assignments=[]}}
function assignmentVisible(a){if(state.profile?.role==='teacher')return true;if(a.target_user_id&&a.target_user_id===state.session?.user?.id)return true;if(!a.target_user_id&&(!a.target_class||a.target_class===state.profile?.class_name))return true;return false}
function renderAssignments(){const root=q('#assignmentsRoot');if(!state.session){root.innerHTML='<div class="panel">Задания көру үшін кабинетке кір.</div>';return}const list=state.assignments.filter(assignmentVisible);root.innerHTML=`<div class="assignment-list">${list.length?list.map(a=>`<article class="assignment-card"><span class="eyebrow">${a.kind==='challenge'?'АЙДАНА АПАЙ CHALLENGE':'ЗАДАНИЕ'}</span><h3>${esc(a.title)}</h3><p>${esc(a.description||'')}</p><div class="assignment-meta"><span class="mini-pill">${a.question_count||15} сұрақ</span>${a.time_limit_minutes?`<span class="mini-pill">${a.time_limit_minutes} мин</span>`:''}${a.due_at?`<span class="mini-pill">до ${fmtDate(a.due_at)}</span>`:''}</div><button class="btn green" data-start-assignment="${a.id}">Бастау</button></article>`).join(''):'<div class="panel">Қазір тапсырма жоқ.</div>'}</div>`;qa('[data-start-assignment]',root).forEach(b=>b.onclick=()=>startAssignment(b.dataset.startAssignment))}
function startAssignment(id){const a=state.assignments.find(x=>String(x.id)===String(id));if(!a)return;if(a.due_at&&new Date(a.due_at)<new Date()){toast('Deadline өтіп кеткен');return}const attempts=state.results.filter(r=>String(r.assignment_id||'')===String(a.id)).length;if(a.max_attempts&&attempts>=a.max_attempts){toast('Попытка лимиті бітті');return}const ids=Array.isArray(a.topic_ids)?a.topic_ids:[];let pool;if(a.kind==='olympiad'||a.kind==='challenge')pool=[...allBaseQuestions(ids),...allProQuestions(ids)];else pool=allBaseQuestions(ids);const qs=shuffle(pool).slice(0,a.question_count||15);startQuiz({title:a.title,type:a.kind==='challenge'?'olympiad':'assignment',questions:qs,timeLimit:(a.time_limit_minutes||0)*60,assignmentId:a.id})}
function renderChallengeHome(){const root=q('#challengeHome');if(!root)return;const a=state.assignments.filter(assignmentVisible).find(x=>x.kind==='challenge');root.innerHTML=a?`<div class="olympiad-card" style="margin-top:16px"><span class="hero-kicker">АЙДАНА АПАЙ CHALLENGE</span><h3>${esc(a.title)}</h3><p>${esc(a.description||'Апталық challenge')}</p><button class="btn primary" data-home-challenge="${a.id}">Challenge бастау</button></div>`:'';q('[data-home-challenge]')?.addEventListener('click',()=>startAssignment(a.id))}

async function loadLeaderboard(){if(!state.sb||!state.session)return;try{const {data}=await state.sb.from('weekly_leaderboard').select('*').eq('week_start',weekStart()).order('xp',{ascending:false}).limit(50);state.leaderboard=data||[]}catch(e){state.leaderboard=[]}}
function rankRows(rows,sorter,label){
  return [...rows].sort(sorter).slice(0,10).map((r,i)=>`<article class="rank-card"><div class="rank-pos">${i+1}</div><div><h3>${esc(r.display_name||'Оқушы')}</h3><small>${esc(r.class_name||'')} • ${r.attempts} попытка</small></div><div class="rank-score"><b>${label(r)}</b><small>best ${r.best_score}%</small></div></article>`).join('')||'<div class="panel">Әзірге мәлімет жоқ.</div>'
}
function renderRating(){
  const root=q('#ratingRoot');if(!state.session){root.innerHTML='<div class="panel">Рейтинг көру үшін кабинетке кір.</div>';return}
  const rows=state.leaderboard;
  root.innerHTML=`<div class="feature-grid"><div><h3>🏆 Лучший результат</h3><div class="ranking-list">${rankRows(rows,(a,b)=>b.best_score-a.best_score,r=>r.best_score+'%')}</div></div><div><h3>📈 Самый большой прогресс</h3><div class="ranking-list">${rankRows(rows,(a,b)=>(b.progress_points||0)-(a.progress_points||0),r=>'+'+(r.progress_points||0))}</div></div><div><h3>⚡ Самый активный</h3><div class="ranking-list">${rankRows(rows,(a,b)=>b.attempts-a.attempts,r=>r.attempts+' тест')}</div></div></div>`
}

async function renderTeacher(){
  const root=q('#teacherRoot');if(state.profile?.role!=='teacher'){root.innerHTML='<div class="panel">Бұл бөлім тек мұғалімге арналған.</div>';return}
  if(!state.teacherLoaded)await loadTeacherData();
  const recent=state.students.slice(0,50);
  root.innerHTML=`<div class="section-head"><div><span class="eyebrow">МҰҒАЛІМ КАБИНЕТІ</span><h2>Айдана апай dashboard</h2><p>Задания, ученики, результаты, print generator.</p></div></div><div class="teacher-grid"><div class="panel"><small>Оқушы</small><h2>${state.students.length}</h2></div><div class="panel"><small>Актив тапсырма</small><h2>${state.assignments.filter(x=>x.active).length}</h2></div><div class="panel"><small>Апталық рейтинг</small><h2>${state.leaderboard.length}</h2></div></div><div class="tool-panel" style="margin-top:14px"><h3>Жаңа тапсырма / Challenge</h3><div class="form-grid"><div class="form-col"><label>Атауы</label><input id="taTitle" placeholder="Мысалы: §1–7 бақылау"></div><div class="form-col"><label>Түрі</label><select id="taKind"><option value="assignment">Задание</option><option value="olympiad">Olympiad</option><option value="challenge">Айдана апай Challenge</option></select></div><div class="form-col"><label>Сынып</label><input id="taClass" placeholder="7 Б"></div><div class="form-col"><label>Сұрақ саны</label><select id="taCount"><option>15</option><option>30</option><option>50</option></select></div><div class="form-col"><label>Минут</label><input id="taMinutes" type="number" value="30"></div><div class="form-col"><label>Попытки</label><input id="taAttempts" type="number" min="1" value="3"></div><div class="form-col"><label>Deadline</label><input id="taDue" type="datetime-local"></div></div><div class="check-grid" id="taSections">${SECTIONS.map(s=>`<label class="check-chip"><input type="checkbox" value="${s.id}"> ${esc(s.title)}</label>`).join('')}</div><textarea id="taDesc" style="width:100%;min-height:80px" placeholder="Комментарий ученикам"></textarea><button class="btn green" id="taCreate" style="margin-top:10px">Создать</button></div><div class="section-head" style="margin-top:24px"><div><h2 style="font-size:25px">Оқушылар</h2></div></div><div class="history-list">${recent.map(s=>`<div class="history-row"><div><b>${esc(s.full_name)}</b><br><small>${esc(s.class_name||'')} • @${esc(s.username||'')}</small></div><span class="mini-pill">${esc(s.role)}</span></div>`).join('')||'<div class="panel">Оқушы жоқ.</div>'}</div><div class="section-head" style="margin-top:24px"><div><h2 style="font-size:25px">Актив тапсырмалар</h2></div></div><div class="assignment-list">${state.assignments.map(a=>{const rr=state.teacherResults.filter(r=>String(r.assignment_id||'')===String(a.id));const users=new Set(rr.map(r=>r.user_id)).size;const target=state.students.filter(s=>!a.target_class||s.class_name===a.target_class).length;const avg=rr.length?Math.round(rr.reduce((z,r)=>z+(Number(r.score)||0),0)/rr.length):0;return `<div class="assignment-card"><h3>${esc(a.title)}</h3><small>${esc(a.kind)} • ${esc(a.target_class||'барлығы')} • ${a.question_count} сұрақ</small><div class="assignment-meta"><span class="mini-pill">Выполнили: ${users}/${target||state.students.length}</span><span class="mini-pill">Средний: ${avg}%</span><span class="mini-pill">Попыток: ${rr.length}</span></div><div class="form-row" style="margin-top:8px"><button class="btn ghost" data-teacher-print="${a.id}">Распечатать</button><button class="btn danger" data-disable-assignment="${a.id}">Закрыть</button></div></div>`}).join('')||'<div class="panel">Тапсырма жоқ.</div>'}</div>`;
  q('#taCreate').onclick=createAssignment;qa('[data-teacher-print]').forEach(b=>b.onclick=()=>printAssignment(b.dataset.teacherPrint));qa('[data-disable-assignment]').forEach(b=>b.onclick=()=>disableAssignment(b.dataset.disableAssignment))
}
async function loadTeacherData(){if(!state.sb)return;try{const [{data:students},{data:assigns},{data:rank},{data:results}]=await Promise.all([state.sb.from('profiles').select('*').order('class_name').order('full_name'),state.sb.from('assignments').select('*').order('created_at',{ascending:false}),state.sb.from('weekly_leaderboard').select('*').eq('week_start',weekStart()).order('xp',{ascending:false}),state.sb.from('results').select('*').order('created_at',{ascending:false}).limit(3000)]);state.students=students||[];state.assignments=assigns||[];state.leaderboard=rank||[];state.teacherResults=results||[];state.teacherLoaded=true}catch(e){console.warn(e)}}
async function createAssignment(){
  const title=q('#taTitle').value.trim();if(!title){toast('Атауын жаз');return}const selected=qa('#taSections input:checked').map(x=>x.value),ids=SECTIONS.filter(s=>selected.includes(s.id)).flatMap(s=>s.topicIds);const due=q('#taDue').value;
  const row={title,description:q('#taDesc').value.trim(),kind:q('#taKind').value,topic_ids:ids,question_count:Number(q('#taCount').value),time_limit_minutes:Number(q('#taMinutes').value)||0,due_at:due?new Date(due).toISOString():null,target_class:q('#taClass').value.trim()||null,max_attempts:Number(q('#taAttempts').value)||3,created_by:state.session.user.id,active:true};const {error}=await state.sb.from('assignments').insert(row);if(error)toast(error.message);else{toast('Тапсырма құрылды');state.teacherLoaded=false;await loadAssignments();renderTeacher();renderChallengeHome()}}
async function disableAssignment(id){const {error}=await state.sb.from('assignments').update({active:false}).eq('id',id);if(error)toast(error.message);else{state.teacherLoaded=false;await loadAssignments();renderTeacher()}}
function printAssignment(id){const a=state.assignments.find(x=>String(x.id)===String(id));if(!a)return;const ids=Array.isArray(a.topic_ids)?a.topic_ids:[];const pool=(a.kind==='olympiad'||a.kind==='challenge')?[...allBaseQuestions(ids),...allProQuestions(ids)]:allBaseQuestions(ids);const qs=shuffle(pool).slice(0,a.question_count||15);startQuiz({title:a.title,type:'assignment',questions:qs,printAfterOpen:true})}

function installPwa(){if(state.installPrompt){state.installPrompt.prompt();state.installPrompt.userChoice.finally(()=>{state.installPrompt=null;q('#installBtn').classList.add('hidden')})}else{toast('Телефонда браузер мәзірінен “Add to Home screen / Установить” таңда.')}}
function initPwa(){window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.installPrompt=e;q('#installBtn').classList.remove('hidden')});q('#installBtn').onclick=installPwa;if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn))}

function init(){bindShell();renderHome();renderStudy();renderTestBuilder();renderOlympiadSetup();renderMistakes();renderAssignments();renderRating();renderAccount();initPwa();initSupabase();syncRoleUI()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.BioOlympCore={state,startQuiz,go,allBaseQuestions,allProQuestions,shuffle,topicById,renderHome,renderAccount,renderRating,loadLeaderboard,weekStart,toast,bestByTopic,stats,levelInfo};
})();

(function(){
'use strict';
const MENTORS=[
  {id:'bio-owl',emoji:'🦉',name:'Биоұстаз',role:'Негізгі наставник',quote:'Кішкентай қадамдар — үлкен ашылуларға бастайды!',state:'📘 База + тақырып'},
  {id:'fox',emoji:'🦊',name:'Түлкі',role:'Зоология',quote:'Қарап оқы, сосын жауап бер — асықпа 😌',state:'🔎 Логика'},
  {id:'frog',emoji:'🐸',name:'Бақа',role:'Анатомия мен физиология',quote:'Тірі ағзалардың құпиясын бірге ашайық!',state:'🫀 Анатомия'},
  {id:'turtle',emoji:'🐢',name:'Тасбақа',role:'Ботаника',quote:'Жай болса да, мықты үйренеміз.',state:'🌱 Өсімдіктер'},
  {id:'bee',emoji:'🐝',name:'Ара',role:'Генетика және эволюция',quote:'Ұқыптылық — олимпиаданың жартысы.',state:'🧬 Генетика'},
  {id:'axolotl',emoji:'🦎',name:'Аксолотль',role:'Жасуша биологиясы',quote:'Қателессең де, қайта жаңарып кет!',state:'🧫 Жасуша'},
  {id:'penguin',emoji:'🐧',name:'Пингвин',role:'Экология',quote:'Сабыр, жүйе және тұрақты прогресс 🧊',state:'🌍 Экожүйе'},
  {id:'wolf',emoji:'🐺',name:'Қасқыр',role:'Медицина және biotech',quote:'Мықты дайындық — мықты нәтиже.',state:'⚕️ Биомедицина'}
];
const defaultMentor='bio-owl';
const q=(s,r=document)=>r.querySelector(s); const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const core=()=>window.BioOlympCore;
const LS_SEL='bio7_selected_mentor';
const LS_MAP='bio7_mentor_map';
function load(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch(e){return d}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function mentorById(id){return MENTORS.find(m=>m.id===id)||MENTORS[0]}
function currentUserKeys(){const st=core()?.state||{};const arr=[];if(st.profile?.username)arr.push(st.profile.username);if(st.session?.user?.email)arr.push(st.session.user.email);if(st.session?.user?.id)arr.push(st.session.user.id);return arr.filter(Boolean)}
function getSelectedMentor(){
  const st=core()?.state||{}; const meta=st.session?.user?.user_metadata?.mentor_id; if(meta) return meta;
  const map=load(LS_MAP,{}); for(const k of currentUserKeys()){ if(map[k]) return map[k]; }
  return load(LS_SEL,defaultMentor)||defaultMentor;
}
function setSelectedMentor(id){
  save(LS_SEL,id); const map=load(LS_MAP,{}); currentUserKeys().forEach(k=>map[k]=id); save(LS_MAP,map);
  const sb=core()?.state?.sb; if(sb?.auth?.updateUser) sb.auth.updateUser({data:{mentor_id:id}}).catch(()=>{});
}
function avatarHTML(id,extra=''){ const m=mentorById(id); return `<div class="mentor-avatar mentor-${m.id} ${extra}"><div class="mentor-face">${m.emoji}</div></div>`; }
function mentorCards(selected){
  return MENTORS.map(m=>`<button type="button" class="mentor-card ${selected===m.id?'active':''}" data-mentor-pick="${m.id}" data-id="${m.id}"><span class="mentor-badge">${m.state}</span>${avatarHTML(m.id)}<span class="mentor-name">${esc(m.name)}</span><span class="mentor-role">${esc(m.role)}</span><div class="mentor-quote">“${esc(m.quote)}”</div></button>`).join('');
}
function wireMentorPicks(root,onPick){ qa('[data-mentor-pick]',root).forEach(btn=>btn.addEventListener('click',()=>{ qa('[data-mentor-pick]',root).forEach(x=>x.classList.remove('active')); btn.classList.add('active'); const id=btn.dataset.mentorPick; setSelectedMentor(id); onPick?.(id); refreshHomeStrip(); })); }
function injectRegisterMentorChooser(){
  const root=q('#accountRoot'); if(!root || !q('#regBtn',root) || q('#mentorChooser',root)) return;
  const selected=getSelectedMentor();
  const regBtn=q('#regBtn',root);
  const box=document.createElement('div');
  box.id='mentorChooser'; box.className='mentor-section';
  box.innerHTML=`<div class="mentor-title-row"><div><h3>Био-наставнигіңді таңда</h3><p>Осы наставник тесттен кейін, қате жауаптарда және жетістіктерде саған шығып тұрады.</p></div><span class="mentor-chip">Duolingo vibes ✨</span></div><div class="mentor-grid">${mentorCards(selected)}</div>`;
  regBtn.parentElement.before(box);
  wireMentorPicks(box);
}
function loginDomain(){ const cfg=window.BIOOLYMP_CONFIG||{}; return cfg.loginDomain||'bioolymp7.local'; }
async function customRegister(){
  const st=core()?.state; if(!st?.sb) return;
  const root=q('#accountRoot');
  const full=q('#regName',root)?.value.trim()||''; const cl=q('#regClass',root)?.value.trim()||'7 сынып';
  const u=q('#regUser',root)?.value.trim().toLowerCase()||''; const p=q('#regPass',root)?.value||'';
  const mentorId=getSelectedMentor();
  if(!full || u.length<3 || p.length<6){ core()?.toast?.('Деректерді дұрыстап толтыр'); return; }
  const email=`${u}@${loginDomain()}`;
  try{
    const {error}=await st.sb.auth.signUp({email,password:p,options:{data:{username:u,full_name:full,class_name:cl,mentor_id:mentorId}}});
    if(error) throw error;
    const map=load(LS_MAP,{}); map[u]=mentorId; map[email]=mentorId; save(LS_MAP,map);
    core()?.toast?.('Аккаунт дайын. Енді кіруге болады ✨');
  }catch(err){ core()?.toast?.(err.message||'Тіркелу қатесі'); }
}
function attachRegisterInterceptor(){
  document.addEventListener('click',function(e){
    const t=e.target.closest('#regBtn'); if(!t) return;
    if(!q('#mentorChooser')) return;
    e.preventDefault(); e.stopImmediatePropagation(); customRegister();
  },true);
}
function injectAccountMentorCard(){
  const root=q('#accountRoot'); const st=core()?.state; if(!root || !st?.session || q('#mentorCurrentCard',root)) return;
  const id=getSelectedMentor(); const m=mentorById(id);
  const after=q('.account-grid',root) || root.firstElementChild;
  const wrap=document.createElement('div'); wrap.id='mentorCurrentCard'; wrap.className='mentor-inline-card';
  wrap.innerHTML=`<div>${avatarHTML(id)}</div><div><span class="mentor-chip">Менің наставнигім</span><h3>${esc(m.name)}</h3><p>${esc(m.role)} • ${esc(m.quote)}</p><div class="mentor-actions"><span class="mentor-mini">${m.state}</span><button type="button" class="mentor-chooser-toggle" id="changeMentorBtn">Наставникті ауыстыру</button></div><div class="mentor-section mentor-hidden" id="mentorSwitchPanel"><div class="mentor-grid">${mentorCards(id)}</div></div></div>`;
  after?.after(wrap);
  q('#changeMentorBtn',wrap)?.addEventListener('click',()=>q('#mentorSwitchPanel',wrap)?.classList.toggle('mentor-hidden'));
  wireMentorPicks(wrap,(picked)=>{ const mm=mentorById(picked); q('h3',wrap).textContent=mm.name; q('p',wrap).textContent=`${mm.role} • ${mm.quote}`; qa('.mentor-mini',wrap)[0].textContent=mm.state; const av=q('.mentor-avatar',wrap.parentElement||wrap); if(av){ av.outerHTML=avatarHTML(picked);} });
}
function refreshHomeStrip(){
  const home=q('#home'); if(!home) return; let strip=q('#mentorHomeStrip',home); const m=mentorById(getSelectedMentor());
  if(!strip){ strip=document.createElement('div'); strip.id='mentorHomeStrip'; strip.className='mentor-home-strip'; const anchor=q('.stats-grid',home) || q('.hero-card',home); if(anchor) anchor.after(strip); }
  const avg=(core()?.state?.results||[]).length ? core().state.results.reduce((a,b)=>a+(Number(b.score)||0),0)/(core().state.results.length) : 0;
  strip.innerHTML=`${avatarHTML(m.id)}<div><h3>${esc(m.name)} сенімен бірге</h3><p>${esc(m.role)} • ${esc(m.quote)}</p></div><div class="mentor-status">Орташа нәтиже: ${Math.round(avg||0)}%</div>`;
}
function reactionCopy(errors,score,m){
  const buckets=[
    {max:0,mood:'excellent',title:[`${m.name}: Вау! Таза жұмыс 😍`,`Ноль ошибка? ${m.name} риза ✨`],text:[`Супер! Осы темпті сақтаймыз. Медальға бір қадам жақындадың.`,`Өте әдемі орындадың. Енді келесі тақырыпқа сенімді өте бер.`]},
    {max:2,mood:'good',title:[`Күшті нәтиже 👏`,`Жақсы! ${m.name} сені мақтайды`],text:[`Аз ғана қате. Ошибкаларды қарап шық та, қайтадан шапшаң өт.`,`Почти идеально. Екі қате үшін ренжімейміз — дұрыстаймыз.`]},
    {max:5,mood:'meh',title:[`Опа, біраз қате бар екен 😅`,`Жақсы бастама, бірақ әлі шлифовка керек`],text:[`Қысқа план: конспект → ошибка → қайта тест. Сонда кіреді.`,`Паника жоқ. Тек қате сұрақтарды дұрыстап бір қарап шық.`]},
    {max:8,mood:'strict',title:[`Ей, асығып кеткен жоқсың ба? 👀`,`Тоқта, мұны қайта қараймыз 😬`],text:[`Оқулықты бір рет ашып, негізгі ұғымдарды жинап ал. Сосын қайта тест.`,`Сенің қолыңнан келеді, бірақ бұл тақырыпқа тағы 10 минут керек.`]},
    {max:999,mood:'strict',title:[`Бүгін бізді тест ұстап алды 😭`,`Стоп-стоп. Қайта жинақталамыз.`],text:[`Бірден келесі тестке жүгірмейміз. Базаға қайтамыз да, қайта шығамыз.`,`Қазір уайым жоқ. Қателерді талдап, бір кішкентай реванш жасаймыз.`]}
  ];
  const b=buckets.find(x=>errors<=x.max)||buckets.at(-1); const pick=a=>a[Math.floor(Math.random()*a.length)];
  return {mood:b.mood,title:pick(b.title),text:pick(b.text),label:`${errors} қате • ${score}%`};
}
function overrideReaction(detail){
  const card=q('#reactionCard'); const modal=q('#reactionModal'); if(!card||!modal) return;
  const result=detail?.result||{}; const errors=(detail?.wrong||[]).length; const score=Number(result.score)||0;
  const id=getSelectedMentor(); const m=mentorById(id); const copy=reactionCopy(errors,score,m);
  card.className=`reaction-card mentor-reaction-card mood-${copy.mood}`;
  card.innerHTML=`<div class="mentor-reaction-art">${avatarHTML(id)}<span class="mentor-state">${copy.mood==='excellent'?'🏆 Молодец':copy.mood==='good'?'✨ Жақсы':copy.mood==='meh'?'📝 Исправь': '🚨 Повтори тему'}</span></div><div class="reaction-copy"><span class="eyebrow">${copy.label}</span><h2>${esc(copy.title)}</h2><p>${esc(copy.text)}</p><p><b>${esc(m.name)}</b>: ${score>=80?'"Келесі деңгейді алайық!"':'"Қате — бұл тренировка. Жұмыс істейміз!"'}</p><div class="form-row"><button class="btn ${copy.mood==='strict'?'danger':'green'}" id="mentorReactionErrors">Работа над ошибками</button><button class="btn ghost" id="mentorReactionClose">Жабу</button></div></div>`;
  q('#mentorReactionErrors')?.addEventListener('click',()=>{ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); q('#quizModal')?.classList.remove('open'); q('#quizModal')?.setAttribute('aria-hidden','true'); document.body.style.overflow=''; window.go?.('mistakes'); });
  q('#mentorReactionClose')?.addEventListener('click',()=>{ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; });
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
}
function injectCertificateMentor(){
  const modal=q('#certificateModal.open'); const root=q('#certificateRoot'); if(!modal || !root || q('#mentorCertBanner',root)) return;
  const m=mentorById(getSelectedMentor()); const box=document.createElement('div'); box.id='mentorCertBanner'; box.className='mentor-certificate-banner';
  box.innerHTML=`${avatarHTML(m.id)}<div><b>${esc(m.name)} айтады: жарайсың! 🎉</b><span>Бөлім аяқталды — сертификатың дайын. Енді рейтингте көтерілейік!</span></div>`;
  root.prepend(box);
}
function accountObserver(){ injectRegisterMentorChooser(); injectAccountMentorCard(); }
function watchAccount(){ const root=q('#accountRoot'); if(!root) return; const mo=new MutationObserver(()=>accountObserver()); mo.observe(root,{childList:true,subtree:true}); accountObserver(); }
function watchCert(){ setInterval(injectCertificateMentor,900); }
function watchHome(){ setInterval(refreshHomeStrip,1800); setTimeout(refreshHomeStrip,600); }
function bindResult(){ window.addEventListener('bioolymp:result',e=>setTimeout(()=>overrideReaction(e.detail),80)); }
function init(){ attachRegisterInterceptor(); watchAccount(); watchHome(); watchCert(); bindResult(); setTimeout(refreshHomeStrip,1200); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();

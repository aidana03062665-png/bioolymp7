(function(){
'use strict';

const cfg = window.BIOOLYMP_CONFIG || {};
let sb = null, session = null, profile = null;
let quizStartedAt = Date.now();
const configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && !String(cfg.supabaseUrl).includes('YOUR_') && !String(cfg.supabaseAnonKey).includes('YOUR_'));

function el(tag, attrs={}, html=''){
  const n=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>{if(k==='class')n.className=v; else n.setAttribute(k,v)}); n.innerHTML=html; return n;
}
function safe(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function q(sel,root=document){return root.querySelector(sel)}
function qa(sel,root=document){return [...root.querySelectorAll(sel)]}
function fmtDate(v){if(!v)return '—';try{return new Date(v).toLocaleString('kk-KZ',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return '—'}}
function loginEmail(username){return `${String(username).trim().toLowerCase()}@${cfg.loginDomain||'bioolymp7.local'}`}
function scoreClass(v){return v>=80?'good':v>=60?'mid':'weak'}

function splash(){
  const s=el('div',{class:'pro-splash',id:'proSplash'},`<div class="pro-splash-box"><div class="pro-splash-logo">🧬</div><b>BioOlymp 7</b><span>Білім • Ізденіс • Нәтиже</span></div>`);document.body.appendChild(s);setTimeout(()=>s.classList.add('hide'),850);setTimeout(()=>s.remove(),1500)
}
function floaters(){
  const f=el('div',{id:'bioFloaters'});const icons=['🧬','🌿','🔬','🦠','🧠','🫁','🦴','⚗️','🌱','🧫'];
  for(let i=0;i<20;i++){const s=el('span',{},icons[i%icons.length]);s.style.left=(Math.random()*96)+'%';s.style.top=(Math.random()*96)+'%';s.style.setProperty('--dur',(9+Math.random()*12)+'s');s.style.setProperty('--dx',(-40+Math.random()*80)+'px');s.style.setProperty('--dy',(-60+Math.random()*120)+'px');f.appendChild(s)}document.body.prepend(f)
}
function addCoach(){
  if(q('#proCoach'))return;document.body.appendChild(el('div',{class:'pro-coach',id:'proCoach'},`<button class="x" onclick="document.getElementById('proCoach').classList.remove('show')">×</button><div class="pro-coach-inner"><img id="proCoachImg" alt="Айдана мұғалім"><div><h3 id="proCoachTitle"></h3><p id="proCoachText"></p></div></div>`))
}
function coach(score){
  addCoach();const c=q('#proCoach'), resultImg=q('#result .teacherFeedback img')?.src || q('#teacherHomePhoto')?.src || '';
  q('#proCoachImg').src=resultImg;
  if(score>=90){q('#proCoachTitle').textContent='Өте жақсы! 🏆';q('#proCoachText').textContent='Міне, олимпиадалық нәтиже! Осы қарқынды сақта. Келесі тақырыпқа сенімді өте бер.';confetti(80)}
  else if(score>=75){q('#proCoachTitle').textContent='Жарайсың! 🌿';q('#proCoachText').textContent='Нәтиже жақсы. Қателеріңді қарап шықсаң, 90%+ деңгейге тез көтеріле аласың.';confetti(35)}
  else if(score>=60){q('#proCoachTitle').textContent='Тағы бір айналым керек 📘';q('#proCoachText').textContent='Негіз бар, бірақ олимпиада үшін дәлдік керек. Қате кеткен тұстарды конспекттен қайта бекіт.'}
  else {q('#proCoachTitle').textContent='Тақырыпты қайта оқы!';q('#proCoachText').textContent='Қателер көп. Келесі бөлімге асықпа: конспект → оқулық → видео → тест тәртібімен тағы бір рет өт. Сенің қолыңнан келеді.'}
  c.classList.add('show');setTimeout(()=>c.classList.remove('show'),score<60?12000:8000)
}
function confetti(n=50){
  const colors=['#0b7450','#ffd86b','#5d86df','#ef7f70','#9bd95c'];
  for(let i=0;i<n;i++){const x=el('i',{class:'confetti'});x.style.left=Math.random()*100+'vw';x.style.background=colors[i%colors.length];x.style.setProperty('--t',(1.8+Math.random()*2.1)+'s');x.style.setProperty('--x',(-120+Math.random()*240)+'px');x.style.animationDelay=(Math.random()*.5)+'s';document.body.appendChild(x);setTimeout(()=>x.remove(),4500)}
}

function addViews(){
  const nav=q('.nav'), main=q('main.wrap')||q('main'); if(!nav||!main)return;
  if(!q('[data-pro-go="account"]')){
    const b=el('button',{'data-pro-go':'account'},'👤 Кабинет');b.onclick=()=>openProView('account');nav.appendChild(b);
    const t=el('button',{'data-pro-go':'teacher',id:'teacherNav'},'📊 Мұғалім');t.style.display='none';t.onclick=()=>openProView('teacher');nav.appendChild(t)
  }
  if(!q('#account')) main.insertBefore(el('section',{id:'account',class:'view'},'<div id="accountRoot"></div>'),main.lastElementChild);
  if(!q('#teacher')) main.insertBefore(el('section',{id:'teacher',class:'view'},'<div id="teacherRoot"></div>'),main.lastElementChild);
  if(!q('#studentOverlay'))document.body.appendChild(el('div',{class:'pro-overlay',id:'studentOverlay'},'<div class="pro-drawer" id="studentDrawer"></div>'));
  q('#studentOverlay').addEventListener('click',e=>{if(e.target.id==='studentOverlay')e.currentTarget.classList.remove('open')});
}
function openProView(id){
  if(typeof go==='function')go(id);else{qa('.view').forEach(v=>v.classList.remove('active'));q('#'+id)?.classList.add('active')}
  qa('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.proGo===id));
  if(id==='account')renderAccount();if(id==='teacher')renderTeacher();
}

async function initSupabase(){
  if(!configured || !window.supabase?.createClient)return;
  try{sb=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);const r=await sb.auth.getSession();session=r.data.session||null;if(session)await loadProfile();sb.auth.onAuthStateChange(async(_e,s)=>{session=s;if(session)await loadProfile();else profile=null;syncRoleUI();renderAccount()});}catch(e){console.warn('Supabase init',e)}
}
async function loadProfile(){
  if(!sb||!session)return null;const {data,error}=await sb.from('profiles').select('*').eq('id',session.user.id).maybeSingle();if(!error)profile=data;syncRoleUI();return profile
}
function syncRoleUI(){q('#teacherNav')&&(q('#teacherNav').style.display=profile?.role==='teacher'?'':'none')}

function renderAccount(){
  const root=q('#accountRoot');if(!root)return;
  root.innerHTML=`<div class="sectionHead"><div><h2>👤 Жеке кабинет</h2><p>Әр оқушының жеке аккаунты, жеке прогресі және тест тарихы.</p></div></div>`;
  if(!configured){root.innerHTML+=`<div class="pro-auth"><span class="pro-pill">⚙️ 1 рет баптау керек</span><h2>Онлайн аккаунт жүйесі дайын</h2><p>Код сайтқа қосылды. Енді Supabase URL және anon/publishable key ғана енгізіледі. Осыдан кейін әр оқушы бөлек аккаунтпен кіріп, нәтижелері мұғалім кабинетіне түседі.</p><div class="pro-note">GitHub-та <b>config.js</b> файлына 2 мәнді қою керек. Дайын нұсқаулық пакеттегі <b>SETUP_ACCOUNTS.txt</b> файлында.</div></div>`;return}
  if(!session){root.innerHTML+=authHtml();bindAuth();return}
  root.innerHTML+=`<div class="pro-panel"><div class="pro-row"><div><span class="pro-pill">${profile?.role==='teacher'?'👩‍🏫 Мұғалім':'🎓 Оқушы'}</span><h2 style="margin:9px 0 3px">${safe(profile?.full_name||profile?.username||'Пайдаланушы')}</h2><div style="color:#6b817a">${safe(profile?.class_name||'')} • @${safe(profile?.username||'')}</div></div><button class="btn btnS" id="logoutBtn" style="flex:0 0 auto">Шығу</button></div></div><div id="studentStats" style="margin-top:14px"></div>`;
  q('#logoutBtn').onclick=()=>sb.auth.signOut();renderStudentStats();
}
function authHtml(){return `<div class="pro-auth"><span class="pro-pill">🔐 BioOlymp ID</span><h2>Аккаунтқа кіру</h2><div class="pro-form"><input id="loginUser" placeholder="Логин (мысалы: nurai7)" autocomplete="username"><input id="loginPass" type="password" placeholder="Пароль" autocomplete="current-password"><button class="btn btnG" id="loginBtn">Кіру</button><div id="authMsg"></div></div><hr style="border:0;border-top:1px solid #e4eee9;margin:20px 0"><h3>Жаңа оқушыны тіркеу</h3><div class="pro-form"><input id="regName" placeholder="Аты-жөні"><input id="regClass" placeholder="Сыныбы (мысалы: 7 Б)"><input id="regUser" placeholder="Жеке логин: nurai7"><input id="regPass" type="password" placeholder="Пароль (кемінде 6 таңба)"><button class="btn btnS" id="regBtn">Тіркелу</button><div class="pro-note">Логинді латын әріптерімен/сандармен жазыңыз. Әр оқушыда логин бөлек болуы керек.</div></div></div>`}
function bindAuth(){
  q('#loginBtn').onclick=async()=>{const u=q('#loginUser').value.trim(),p=q('#loginPass').value,m=q('#authMsg');if(!u||!p)return m.innerHTML='<div class="pro-note pro-danger">Логин мен парольді толтыр.</div>';m.textContent='Кіру...';const {error}=await sb.auth.signInWithPassword({email:loginEmail(u),password:p});m.innerHTML=error?`<div class="pro-note pro-danger">${safe(error.message)}</div>`:''};
  q('#regBtn').onclick=async()=>{const full=q('#regName').value.trim(),cl=q('#regClass').value.trim(),u=q('#regUser').value.trim().toLowerCase(),p=q('#regPass').value,m=q('#authMsg');if(!/^[a-z0-9._-]{3,30}$/.test(u))return m.innerHTML='<div class="pro-note pro-danger">Логин: тек a-z, 0-9, нүкте, _ немесе -.</div>';if(full.length<2||p.length<6)return m.innerHTML='<div class="pro-note pro-danger">Аты-жөнін және кемінде 6 таңбалы пароль енгіз.</div>';m.textContent='Тіркелуде...';const {data,error}=await sb.auth.signUp({email:loginEmail(u),password:p,options:{data:{username:u,full_name:full,class_name:cl||'7 сынып'}}});if(error)m.innerHTML=`<div class="pro-note pro-danger">${safe(error.message)}</div>`;else if(!data.session)m.innerHTML='<div class="pro-note">Аккаунт құрылды. Егер email confirmation қосулы болса, Supabase-та Confirm email параметрін өшіру керек.</div>';else m.innerHTML='<div class="pro-note pro-ok">Аккаунт дайын!</div>'}
}

async function renderStudentStats(){
  const root=q('#studentStats');if(!root||!sb||!session)return;root.innerHTML='<div class="pro-panel">Статистика жүктелуде...</div>';
  const {data:rows,error}=await sb.from('results').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(1000);if(error){root.innerHTML=`<div class="pro-note pro-danger">${safe(error.message)}</div>`;return}renderStatsBlock(root,rows||[],false)
}
function aggregate(rows){
  const scores=rows.map(r=>Number(r.score)||0),topicBest={};let seconds=0;
  rows.forEach(r=>{seconds+=Number(r.duration_seconds)||0;if(r.topic_id!=null)topicBest[r.topic_id]=Math.max(topicBest[r.topic_id]||0,Number(r.score)||0)});
  const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0,best=scores.length?Math.max(...scores):0,mastered=Object.values(topicBest).filter(v=>v>=80).length,weak=Object.entries(topicBest).filter(([_,v])=>v<60).sort((a,b)=>a[1]-b[1]);
  return {attempts:rows.length,avg,best,mastered,weak,topicBest,minutes:Math.round(seconds/60)}
}
function topicName(id){try{return TOPICS.find(t=>String(t.id)===String(id))?.title?.replace(/^§\d+\.\s*/,'')||`§${id}`}catch(e){return `§${id}`}}
function renderStatsBlock(root,rows,isTeacherDetail){
  const a=aggregate(rows);let topicBars=Object.entries(a.topicBest).sort((x,y)=>Number(x[0])-Number(y[0])).map(([id,v])=>`<div style="display:grid;grid-template-columns:42px 1fr 42px;gap:8px;align-items:center;margin:8px 0"><b>§${id}</b><div class="pro-bar"><i style="width:${v}%"></i></div><b>${v}%</b></div>`).join('')||'<div style="color:#6b817a">Әлі тақырыптық нәтиже жоқ.</div>';
  root.innerHTML=`<div class="pro-grid"><div class="pro-stat"><b>${a.avg}%</b><span>орташа нәтиже</span></div><div class="pro-stat"><b>${a.best}%</b><span>ең жоғары нәтиже</span></div><div class="pro-stat"><b>${a.attempts}</b><span>тест әрекеті</span></div><div class="pro-stat"><b>${a.mastered}/63</b><span>80%+ меңгерілген тақырып</span></div></div>
  <div class="pro-panel" style="margin-top:12px"><div class="pro-section-title"><div><h3>📊 Тақырыптар картасы</h3><p>Әр тақырыптағы ең жақсы нәтиже</p></div></div>${topicBars}</div>
  <div class="pro-panel" style="margin-top:12px"><div class="pro-section-title"><div><h3>⚠️ Қайталау керек</h3><p>60%-дан төмен тақырыптар</p></div></div><div class="pro-chips">${a.weak.length?a.weak.slice(0,18).map(([id,v])=>`<span class="pro-chip weak">§${id} • ${v}% • ${safe(topicName(id))}</span>`).join(''):'<span class="pro-chip">Әлсіз тақырып жоқ 🎉</span>'}</div></div>
  <div class="pro-panel" style="margin-top:12px"><div class="pro-section-title"><div><h3>🕘 Соңғы нәтижелер</h3><p>Соңғы 12 әрекет</p></div></div><div class="pro-table-wrap"><table class="pro-table"><thead><tr><th>Тест</th><th>Нәтиже</th><th>Дұрыс</th><th>Уақыт</th><th>Күні</th></tr></thead><tbody>${rows.slice(0,12).map(r=>`<tr><td>${safe(r.title||r.test_type)}</td><td><b>${r.score}%</b></td><td>${r.correct}/${r.total}</td><td>${Math.round((r.duration_seconds||0)/60)} мин</td><td>${fmtDate(r.created_at)}</td></tr>`).join('')||'<tr><td colspan="5">Нәтиже жоқ.</td></tr>'}</tbody></table></div></div>`
}

async function renderTeacher(){
  const root=q('#teacherRoot');if(!root)return;root.innerHTML='<div class="sectionHead"><div><h2>📊 Мұғалім кабинеті</h2><p>Оқушылардың нәтижелерін бір жерден бақылау.</p></div></div>';
  if(!configured){root.innerHTML+='<div class="pro-note">Алдымен Supabase аккаунт жүйесін қосу керек.</div>';return}
  if(!session){root.innerHTML+='<div class="pro-note">Алдымен «Кабинет» арқылы кіріңіз.</div>';return}
  if(!profile)await loadProfile();if(profile?.role!=='teacher'){root.innerHTML+='<div class="pro-note pro-danger">Бұл бөлім тек мұғалім аккаунтына ашылады.</div>';return}
  root.innerHTML+='<div class="pro-panel" id="teacherData">Статистика жүктелуде...</div>';
  const [{data:students,error:e1},{data:results,error:e2}]=await Promise.all([sb.from('profiles').select('*').eq('role','student').order('full_name'),sb.from('results').select('*').order('created_at',{ascending:false}).limit(10000)]);
  if(e1||e2){q('#teacherData').innerHTML=`<div class="pro-note pro-danger">${safe((e1||e2).message)}</div>`;return}renderTeacherData(students||[],results||[])
}
function renderTeacherData(students,results){
  const root=q('#teacherData');const agAll=aggregate(results);const activeUsers=new Set(results.map(r=>r.user_id));const classNames=[...new Set(students.map(s=>s.class_name).filter(Boolean))].sort();
  root.outerHTML=`<div id="teacherData"><div class="pro-grid"><div class="pro-stat"><b>${students.length}</b><span>оқушы аккаунты</span></div><div class="pro-stat"><b>${activeUsers.size}</b><span>тест тапсырған оқушы</span></div><div class="pro-stat"><b>${agAll.avg}%</b><span>барлық нәтижелердің орташа %</span></div><div class="pro-stat"><b>${results.length}</b><span>барлық тест әрекеті</span></div></div>
  <div class="pro-panel" style="margin-top:12px"><div class="pro-section-title"><div><h3>👥 Оқушылар</h3><p>Оқушыны бассаңыз, жеке статистикасы ашылады.</p></div><select id="classFilter" style="border:1px solid #cfe5da;border-radius:12px;padding:9px"><option value="">Барлық сынып</option>${classNames.map(c=>`<option>${safe(c)}</option>`).join('')}</select></div><div class="pro-table-wrap"><table class="pro-table"><thead><tr><th>Оқушы</th><th>Сынып</th><th>Орташа</th><th>Үздік</th><th>Тест</th><th>80%+ тақырып</th><th>Соңғы белсенділік</th><th></th></tr></thead><tbody id="studentsBody"></tbody></table></div></div>
  <div class="pro-panel" style="margin-top:12px"><div class="pro-section-title"><div><h3>🧭 Жалпы әлсіз тақырыптар</h3><p>Көбірек қате жиналған тақырыптар</p></div></div><div class="pro-chips" id="classWeak"></div></div></div>`;
  const grouped={};students.forEach(s=>grouped[s.id]=[]);results.forEach(r=>(grouped[r.user_id]||(grouped[r.user_id]=[])).push(r));
  const draw=()=>{const f=q('#classFilter').value;q('#studentsBody').innerHTML=students.filter(s=>!f||s.class_name===f).map(s=>{const a=aggregate(grouped[s.id]||[]),last=(grouped[s.id]||[])[0]?.created_at;return `<tr><td><b>${safe(s.full_name)}</b><br><span style="color:#6b817a">@${safe(s.username)}</span></td><td>${safe(s.class_name||'')}</td><td><b>${a.avg}%</b></td><td>${a.best}%</td><td>${a.attempts}</td><td>${a.mastered}</td><td>${fmtDate(last)}</td><td><button class="btn btnS" style="padding:7px 9px;min-height:36px" onclick="BioOlympPro.openStudent('${s.id}')">Ашу</button></td></tr>`}).join('')||'<tr><td colspan="8">Оқушылар жоқ.</td></tr>'};q('#classFilter').onchange=draw;draw();
  const topicStats={};results.filter(r=>r.topic_id!=null).forEach(r=>{const x=topicStats[r.topic_id]||(topicStats[r.topic_id]={n:0,sum:0});x.n++;x.sum+=Number(r.score)||0});const weak=Object.entries(topicStats).map(([id,x])=>[id,Math.round(x.sum/x.n),x.n]).sort((a,b)=>a[1]-b[1]).slice(0,15);q('#classWeak').innerHTML=weak.length?weak.map(([id,av,n])=>`<span class="pro-chip weak">§${id} • орташа ${av}% • ${n} нәтиже</span>`).join(''):'<span class="pro-chip">Әзірге дерек жеткіліксіз.</span>';
  window.__teacherStudents=students;window.__teacherGrouped=grouped;
}
async function openStudent(id){
  const s=(window.__teacherStudents||[]).find(x=>x.id===id);const rows=(window.__teacherGrouped||{})[id]||[];const d=q('#studentDrawer');d.innerHTML=`<div class="pro-row"><div><span class="pro-pill">🎓 Жеке статистика</span><h2 style="margin:8px 0 2px">${safe(s?.full_name||'Оқушы')}</h2><div style="color:#6b817a">${safe(s?.class_name||'')} • @${safe(s?.username||'')}</div></div><button class="btn btnS" style="flex:0 0 auto" onclick="document.getElementById('studentOverlay').classList.remove('open')">Жабу</button></div><div id="drawerStats" style="margin-top:14px"></div>`;renderStatsBlock(q('#drawerStats'),rows,true);q('#studentOverlay').classList.add('open')
}

async function saveOnlineResult(info){
  if(!sb||!session)return;try{const row={user_id:session.user.id,test_type:info.type||'quiz',topic_id:info.topicId??null,title:info.title||'',score:info.score,correct:info.correct,total:info.total,duration_seconds:info.duration};const {error}=await sb.from('results').insert(row);if(error)throw error;toast('☁️ Нәтиже мұғалім кабинетіне сақталды')}catch(e){console.warn('save result',e);toast('Нәтиже жергілікті сақталды. Онлайн синхрондау болмады.',true)}
}
function toast(text,bad=false){let t=q('#proToast');if(!t){t=el('div',{id:'proToast'});Object.assign(t.style,{position:'fixed',left:'50%',bottom:'22px',transform:'translateX(-50%)',zIndex:'260',padding:'10px 14px',borderRadius:'999px',background:'#17352d',color:'#fff',fontSize:'12px',fontWeight:'800',boxShadow:'0 12px 35px rgba(0,0,0,.2)',maxWidth:'calc(100vw - 24px)',textAlign:'center'});document.body.appendChild(t)}t.style.background=bad?'#8b2d2d':'#17352d';t.textContent=text;t.style.display='block';clearTimeout(t._tm);t._tm=setTimeout(()=>t.style.display='none',3200)}

function patchQuiz(){
  if(typeof renderQuiz==='function'&&!renderQuiz.__pro){const oldRender=renderQuiz;window.renderQuiz=function(){quizStartedAt=Date.now();return oldRender.apply(this,arguments)};window.renderQuiz.__pro=true}
  if(typeof checkQuiz==='function'&&!checkQuiz.__pro){const oldCheck=checkQuiz;window.checkQuiz=function(){
    let beforeMode='quiz',topicId=null,title=q('#mTitle')?.textContent||'BioOlymp 7 тесті',total=0;
    try{beforeMode=typeof mode!=='undefined'?mode:'quiz';topicId=(beforeMode==='topic'&&typeof currentTopic!=='undefined')?currentTopic?.id:null;total=typeof currentQuestions!=='undefined'&&currentQuestions?currentQuestions.length:0}catch(e){}
    const ret=oldCheck.apply(this,arguments);setTimeout(()=>{const score=parseInt(q('#result b')?.textContent)||0;const txt=q('#result strong')?.textContent||'';const m=txt.match(/(\d+)\/(\d+)/);const correct=m?Number(m[1]):0;const t=m?Number(m[2]):total;coach(score);saveOnlineResult({type:beforeMode,topicId,title,score,correct,total:t,duration:Math.max(1,Math.round((Date.now()-quizStartedAt)/1000))})},60);return ret
  };window.checkQuiz.__pro=true}
}

function addHomeWow(){
  const hero=q('#home .hero');if(hero&&!q('#wowStrip')){const strip=el('div',{id:'wowStrip',style:'margin-top:12px;display:flex;gap:8px;flex-wrap:wrap'},'<span class="pro-pill">🧬 63 тақырып</span><span class="pro-pill">🏆 Дарын</span><span class="pro-pill">📈 Жеке статистика</span><span class="pro-pill">👩‍🏫 Мұғалім бақылауы</span>');hero.querySelector('div')?.appendChild(strip)}
}

window.BioOlympPro={openStudent,renderTeacher,renderAccount};

document.addEventListener('DOMContentLoaded',async()=>{splash();floaters();addCoach();addViews();addHomeWow();patchQuiz();await initSupabase();syncRoleUI();});
// Existing script may have already fired before this file is injected at </body>.
if(document.readyState!=='loading'){setTimeout(async()=>{floaters();addCoach();addViews();addHomeWow();patchQuiz();await initSupabase();syncRoleUI()},0)}
})();

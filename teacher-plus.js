(function(){
'use strict';

function n(sel,root=document){return root.querySelector(sel)}
function all(sel,root=document){return [...root.querySelectorAll(sel)]}
function num(text){const m=String(text||'').match(/-?\d+/);return m?Number(m[0]):0}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function addStyle(){
  if(n('#teacherPlusStyle'))return;
  const s=document.createElement('style');s.id='teacherPlusStyle';s.textContent=`
  #teacherPlus{margin-top:12px}
  .tp-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-bottom:12px;flex-wrap:wrap}
  .tp-head h3{margin:0;font-size:22px}.tp-head p{margin:4px 0 0;color:#6b817a;font-size:13px}
  .tp-mini{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:12px 0}
  .tp-mini>div{border:1px solid #dceee5;background:#f8fffb;border-radius:15px;padding:12px}
  .tp-mini b{display:block;font-size:24px;color:#0b7450}.tp-mini span{font-size:11px;color:#6b817a;font-weight:800}
  .tp-rank{display:grid;grid-template-columns:repeat(5,1fr);gap:9px}
  .tp-card{border:1px solid #dceee5;border-radius:17px;padding:13px;background:linear-gradient(145deg,#fff,#f4fff8);min-width:0}
  .tp-card:first-child{background:linear-gradient(145deg,#fff7ce,#f2ffe5);border-color:#e9d889}
  .tp-place{font-size:20px}.tp-name{font-weight:900;margin:6px 0 3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tp-class{font-size:11px;color:#6b817a}
  .tp-score{font-size:25px;font-weight:950;color:#0b7450;margin-top:8px}.tp-sub{font-size:10px;color:#6b817a}
  .tp-badge{display:inline-block;margin-top:8px;padding:5px 7px;border-radius:999px;font-size:10px;font-weight:900;background:#e8f6ef;color:#0b7450}
  .tp-badge.warn{background:#fff2e5;color:#9b552b}.tp-badge.mid{background:#fff8da;color:#806814}
  @media(max-width:900px){.tp-rank{grid-template-columns:repeat(2,1fr)}.tp-mini{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:520px){.tp-rank{grid-template-columns:1fr}.tp-mini{grid-template-columns:repeat(2,1fr)}}
  `;document.head.appendChild(s)
}

function parseRows(){
  return all('#studentsBody tr').map(tr=>{
    const td=all('td',tr);if(td.length<7)return null;
    const name=n('b',td[0])?.textContent?.trim()||td[0].textContent.trim();
    return {name,className:td[1].textContent.trim(),avg:num(td[2].textContent),best:num(td[3].textContent),attempts:num(td[4].textContent),mastered:num(td[5].textContent)}
  }).filter(Boolean)
}
function medal(i){return ['🥇','🥈','🥉','4️⃣','5️⃣'][i]||`${i+1}`}
function level(x){
  if(x.attempts===0)return ['Нәтиже жоқ','warn'];
  if(x.avg>=90)return ['Олимпиадалық деңгей',''];
  if(x.avg>=75)return ['Жақсы деңгей',''];
  if(x.avg>=60)return ['Назар аудару','mid'];
  return ['Қайталау керек','warn'];
}
function render(){
  const data=n('#teacherData'),body=n('#studentsBody');if(!data||!body)return;
  addStyle();
  let box=n('#teacherPlus');
  if(!box){
    box=document.createElement('div');box.id='teacherPlus';box.className='pro-panel';
    const grid=n('#teacherData > .pro-grid'); if(grid) grid.insertAdjacentElement('afterend',box); else data.prepend(box);
  }
  const rows=parseRows();
  const ranked=rows.filter(x=>x.attempts>0).sort((a,b)=>b.avg-a.avg||b.best-a.best||b.attempts-a.attempts||a.name.localeCompare(b.name,'kk')).slice(0,5);
  const olymp=rows.filter(x=>x.attempts>0&&x.avg>=90).length;
  const strong=rows.filter(x=>x.attempts>0&&x.avg>=80).length;
  const weak=rows.filter(x=>x.attempts>0&&x.avg<60).length;
  const inactive=rows.filter(x=>x.attempts===0).length;
  const filter=n('#classFilter')?.value||'';
  box.innerHTML=`<div class="tp-head"><div><h3>🏆 ${filter?esc(filter)+' — ':''}Оқушылар рейтингі</h3><p>Орташа нәтиже бойынша TOP-5. Тең болғанда үздік нәтиже және тест саны есептеледі.</p></div><span class="pro-pill">${rows.length} оқушы</span></div>
  <div class="tp-mini"><div><b>${olymp}</b><span>90%+ олимпиадалық деңгей</span></div><div><b>${strong}</b><span>80%+ тұрақты нәтиже</span></div><div><b>${weak}</b><span>60%-дан төмен</span></div><div><b>${inactive}</b><span>әлі тест тапсырмаған</span></div></div>
  <div class="tp-rank">${ranked.length?ranked.map((x,i)=>{const lv=level(x);return `<div class="tp-card"><div class="tp-place">${medal(i)}</div><div class="tp-name" title="${esc(x.name)}">${esc(x.name)}</div><div class="tp-class">${esc(x.className||'')}</div><div class="tp-score">${x.avg}%</div><div class="tp-sub">Үздік: ${x.best}% • ${x.attempts} тест • ${x.mastered} тақырып 80%+</div><span class="tp-badge ${lv[1]}">${lv[0]}</span></div>`}).join(''):'<div style="color:#6b817a">Рейтинг үшін оқушылар тест тапсыруы керек.</div>'}</div>`
}

let timer=0;function schedule(){clearTimeout(timer);timer=setTimeout(render,80)}
function bind(){
  render();
  const root=n('#teacherRoot')||document.body;
  const obs=new MutationObserver(schedule);obs.observe(root,{childList:true,subtree:true});
  document.addEventListener('change',e=>{if(e.target&&e.target.id==='classFilter')setTimeout(render,20)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();

(function(){
'use strict';
function q(s,r=document){return r.querySelector(s)}
function qa(s,r=document){return [...r.querySelectorAll(s)]}
function val(t){const m=String(t||'').match(/-?\d+/);return m?Number(m[0]):0}
function clean(s){return String(s||'').trim()}

function addToolbar(){
  const teacher=q('#teacherData'); const table=q('#studentsBody');
  if(!teacher||!table||q('#tpTools'))return;
  const panel=table.closest('.pro-panel'); if(!panel)return;
  const tools=document.createElement('div'); tools.id='tpTools';
  tools.style.cssText='display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0 2px';
  tools.innerHTML=`<input id="tpSearch" placeholder="🔎 Оқушыны іздеу" style="flex:1;min-width:190px;border:1px solid #cfe5da;border-radius:12px;padding:10px 12px;background:#fff"><select id="tpSort" style="border:1px solid #cfe5da;border-radius:12px;padding:10px;background:#fff"><option value="default">Сұрыптау</option><option value="avg-desc">Орташа ↓</option><option value="avg-asc">Орташа ↑</option><option value="tests-desc">Тест саны ↓</option><option value="name">Аты-жөні A–Я</option></select><button id="tpExport" class="btn btnG" style="min-height:40px">⬇️ Excel/CSV</button>`;
  const head=q('.pro-section-title',panel); if(head) head.insertAdjacentElement('afterend',tools); else panel.prepend(tools);
  q('#tpSearch').addEventListener('input',apply);
  q('#tpSort').addEventListener('change',apply);
  q('#tpExport').addEventListener('click',exportCSV);
  apply();
}

function rows(){
  return qa('#studentsBody tr').filter(tr=>qa('td',tr).length>=7);
}
function apply(){
  const body=q('#studentsBody'); if(!body)return;
  const term=clean(q('#tpSearch')?.value).toLocaleLowerCase('kk');
  const mode=q('#tpSort')?.value||'default';
  let rs=rows();
  rs.forEach(tr=>{tr.style.display=clean(tr.textContent).toLocaleLowerCase('kk').includes(term)?'':'none'});
  rs=[...rs].sort((a,b)=>{
    const A=qa('td',a),B=qa('td',b);
    if(mode==='avg-desc')return val(B[2].textContent)-val(A[2].textContent);
    if(mode==='avg-asc')return val(A[2].textContent)-val(B[2].textContent);
    if(mode==='tests-desc')return val(B[4].textContent)-val(A[4].textContent);
    if(mode==='name')return clean(A[0].textContent).localeCompare(clean(B[0].textContent),'kk');
    return 0;
  });
  rs.forEach(tr=>body.appendChild(tr));
}

function csvCell(s){return '"'+String(s??'').replace(/"/g,'""').replace(/\s+/g,' ').trim()+'"'}
function exportCSV(){
  const visible=rows().filter(tr=>tr.style.display!=='none');
  const data=[['Оқушы','Сынып','Орташа %','Үздік %','Тест саны','80%+ тақырып','Соңғы белсенділік']];
  visible.forEach(tr=>{const td=qa('td',tr);data.push([clean(td[0].innerText).replace(/@\S+/,'').trim(),clean(td[1].innerText),val(td[2].innerText),val(td[3].innerText),val(td[4].innerText),val(td[5].innerText),clean(td[6].innerText)])});
  const csv='\ufeff'+data.map(r=>r.map(csvCell).join(';')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download='BioOlymp7_оқушылар_нәтижесі.csv'; document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1200);
}

let tm=0;function tick(){clearTimeout(tm);tm=setTimeout(()=>{addToolbar();apply()},120)}
const obs=new MutationObserver(tick); obs.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick);else tick();
})();

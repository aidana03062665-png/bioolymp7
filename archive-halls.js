(function(){
'use strict';
function q(s,r=document){return r.querySelector(s)}
function qa(s,r=document){return Array.from(r.querySelectorAll(s))}

const rooms=[
  {
    title:'Оқулық қоры', sub:'Тақырыптарды ретімен оқып, конспект пен материалдарға өт.', target:'Оқулық', art:`<svg viewBox="0 0 220 92" fill="none"><path d="M48 21h52c13 0 22 7 22 19v33c-5-8-12-11-22-11H48V21Z" stroke="#416f60" stroke-width="2"/><path d="M172 21h-50v52c5-8 12-11 22-11h28V21Z" stroke="#416f60" stroke-width="2"/><path d="M63 35h26M63 45h30M148 35h12M148 45h16" stroke="#b79c61" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  {
    title:'Дарын мұрағаты', sub:'Олимпиадалық деңгейдегі тапсырмалар мен жаттығулар.', target:'Дарын тесттері', art:`<svg viewBox="0 0 220 92" fill="none"><path d="M110 18l8 17 19 3-14 13 3 19-16-9-16 9 3-19-14-13 19-3 8-17Z" stroke="#416f60" stroke-width="2"/><path d="M68 68h84" stroke="#b79c61" stroke-width="2"/><path d="M82 58h56" stroke="#b79c61" stroke-width="2"/></svg>`
  },
  {
    title:'Тест зертханасы', sub:'Ұқсас тесттер арқылы жылдамдық пен дәлдікті шыңда.', target:'Ұқсас тесттер', art:`<svg viewBox="0 0 220 92" fill="none"><rect x="66" y="18" width="88" height="58" rx="12" stroke="#416f60" stroke-width="2"/><path d="M88 35h44M88 47h29M88 59h36" stroke="#b79c61" stroke-width="2" stroke-linecap="round"/><circle cx="77" cy="35" r="3" fill="#416f60"/><circle cx="77" cy="47" r="3" fill="#416f60"/><circle cx="77" cy="59" r="3" fill="#416f60"/></svg>`
  },
  {
    title:'Бейне залы', sub:'Қиын тақырыптарды визуалды сабақтармен бекіт.', target:'Видео', art:`<svg viewBox="0 0 220 92" fill="none"><rect x="55" y="18" width="110" height="58" rx="14" stroke="#416f60" stroke-width="2"/><path d="M101 35l24 12-24 12V35Z" stroke="#b79c61" stroke-width="2" stroke-linejoin="round"/></svg>`
  },
  {
    title:'Прогресс картасы', sub:'Өз нәтижеңді, әлсіз және күшті тақырыптарыңды бақыла.', target:'Прогресс', art:`<svg viewBox="0 0 220 92" fill="none"><path d="M57 67h108M69 67V49M94 67V39M119 67V31M144 67V23" stroke="#416f60" stroke-width="2"/><path d="M67 49l27-10 25-8 25-8" stroke="#b79c61" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  }
];

function clickNav(label){
  const btn=qa('.nav button,nav button').find(b=>String(b.textContent||'').trim().includes(label));
  if(btn){btn.click();window.scrollTo({top:0,behavior:'smooth'});return true}
  return false
}

function addHalls(){
  const home=q('#home');if(!home||q('#archiveHalls'))return;
  const stats=q('.stats',home);const hero=q('.hero',home);
  const section=document.createElement('section');
  section.id='archiveHalls';section.className='archive-halls';
  section.innerHTML=`<div class="archive-halls-head"><div><small>ARCHIVUM SCIENTIAE</small><h2>Білім архивінің залдары</h2><p>Архивке кірген соң әр бөлім жеке зал сияқты ашылады. Қай бағытта жұмыс істейтініңді таңда.</p></div><span class="archive-halls-badge">BIOLOGY VII</span></div><div class="archive-room-grid">${rooms.map((r,i)=>`<article class="archive-room" data-target="${r.target}" tabindex="0" role="button"><div class="archive-room-art">${r.art}</div><h3>${r.title}</h3><p>${r.sub}</p><span class="open-room">Залды ашу</span></article>`).join('')}</div>`;
  (stats||hero)?.insertAdjacentElement('afterend',section);
  qa('.archive-room',section).forEach(card=>{
    const open=()=>clickNav(card.dataset.target);
    card.addEventListener('click',open);
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
  });
}

function hookArchiveEntry(){
  document.addEventListener('click',e=>{
    const btn=e.target.closest&&e.target.closest('#archiveEnterBtn');if(!btn)return;
    setTimeout(()=>{
      const halls=q('#archiveHalls');if(halls)halls.scrollIntoView({behavior:'smooth',block:'start'});
      let toast=q('#archiveArrival');
      if(!toast){toast=document.createElement('div');toast.id='archiveArrival';toast.className='archive-arrival';toast.textContent='Білім архиві ашылды. Қай залдан бастайсың?';document.body.appendChild(toast)}
      toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3200);
    },1250);
  },true);
}

function init(){addHalls();hookArchiveEntry()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.addEventListener('pageshow',addHalls);
})();

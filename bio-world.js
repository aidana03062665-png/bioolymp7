(function(){
'use strict';
function q(s,r=document){return r.querySelector(s)}
function qa(s,r=document){return Array.from(r.querySelectorAll(s))}

const scene=`
<div class="bio-world-scene" aria-label="Мультяшный биология әлемі">
<svg viewBox="0 0 520 360" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="260" cy="321" rx="190" ry="22" fill="#0A4F3D" opacity=".16"/>
  <g class="page-l">
    <path d="M252 286C213 261 167 259 102 274L126 321C177 308 216 311 258 333L252 286Z" fill="#FFF8DD"/>
    <path d="M251 286C205 270 164 272 113 283" stroke="#E6C56C" stroke-width="4" stroke-linecap="round"/>
    <path d="M139 293C170 287 198 289 223 296" stroke="#D5E2D6" stroke-width="4" stroke-linecap="round"/>
    <path d="M148 306C177 301 201 303 221 309" stroke="#D5E2D6" stroke-width="4" stroke-linecap="round"/>
  </g>
  <g class="page-r">
    <path d="M258 286C300 261 351 260 417 276L391 321C342 309 303 311 256 333L258 286Z" fill="#FFF5D1"/>
    <path d="M259 286C307 270 351 273 407 284" stroke="#E6C56C" stroke-width="4" stroke-linecap="round"/>
    <path d="M292 296C323 288 353 290 380 298" stroke="#D5E2D6" stroke-width="4" stroke-linecap="round"/>
    <path d="M295 309C326 302 351 304 374 311" stroke="#D5E2D6" stroke-width="4" stroke-linecap="round"/>
  </g>
  <path d="M255 285V333" stroke="#D7B455" stroke-width="8" stroke-linecap="round"/>

  <g class="float-a">
    <path d="M167 246C160 212 169 177 195 151" stroke="#86C8A5" stroke-width="7" stroke-linecap="round"/>
    <path d="M194 160C170 153 154 139 149 117C176 116 193 130 199 151" fill="#AEE0C2"/>
    <path d="M181 189C154 185 135 170 130 146C160 144 179 159 185 181" fill="#83C5A4"/>
    <path d="M197 151C203 125 222 109 249 108C245 136 227 151 203 158" fill="#BFE8CF"/>
  </g>

  <g class="float-b">
    <path d="M343 247C350 214 341 180 317 157" stroke="#8EC9AE" stroke-width="7" stroke-linecap="round"/>
    <path d="M318 164C343 158 359 144 364 122C337 121 320 134 314 155" fill="#B8E2C9"/>
    <path d="M330 193C357 188 376 173 380 150C350 147 332 162 326 184" fill="#90CCAE"/>
  </g>

  <g class="float-a">
    <path d="M94 99C94 68 119 43 150 43C181 43 206 68 206 99C206 130 181 155 150 155C119 155 94 130 94 99Z" fill="#FFF1D0"/>
    <path d="M111 99C111 77 128 60 150 60C172 60 189 77 189 99C189 121 172 138 150 138C128 138 111 121 111 99Z" fill="#E0F1E7" stroke="#78B99A" stroke-width="4"/>
    <circle cx="150" cy="99" r="18" fill="#FFCDBF"/>
    <circle cx="132" cy="83" r="6" fill="#C7BDF4"/>
    <circle cx="171" cy="113" r="7" fill="#F3C85C"/>
    <path d="M125 116C134 123 166 124 176 91" stroke="#8FC5A9" stroke-width="4" stroke-linecap="round"/>
  </g>

  <g class="float-b">
    <path d="M306 79C327 58 359 57 381 77C397 92 401 114 393 132C384 153 360 163 337 157C316 151 300 132 301 109C301 97 302 88 306 79Z" fill="#DDEAFF"/>
    <path d="M330 90C342 76 363 76 376 89C389 102 386 121 373 130C362 138 348 136 338 126" stroke="#8EAED0" stroke-width="5" stroke-linecap="round"/>
    <path d="M327 111C316 115 309 123 307 133" stroke="#8EAED0" stroke-width="5" stroke-linecap="round"/>
    <circle cx="376" cy="107" r="5" fill="#F2BE75"/>
  </g>

  <g class="float-a">
    <path d="M247 86C239 69 221 62 207 70C194 77 191 95 201 108C211 121 235 125 253 117" fill="#E9E0FF"/>
    <path d="M264 86C272 69 290 62 304 70C317 77 320 95 310 108C300 121 276 125 258 117" fill="#D4EBFF"/>
    <ellipse cx="255" cy="103" rx="13" ry="22" fill="#FFDFAF"/>
    <path d="M251 83L242 67M260 83L269 67" stroke="#F2C46E" stroke-width="4" stroke-linecap="round"/>
  </g>

  <g class="spark" fill="#FFF4C7">
    <circle cx="63" cy="58" r="6"/><circle cx="440" cy="67" r="7"/><circle cx="239" cy="45" r="5"/><circle cx="438" cy="204" r="5"/><circle cx="76" cy="203" r="5"/>
  </g>
  <path d="M60 147C77 147 89 159 89 176" stroke="#DDF4E7" stroke-width="5" stroke-linecap="round" opacity=".8"/>
  <path d="M443 154C426 154 414 166 414 183" stroke="#DDF4E7" stroke-width="5" stroke-linecap="round" opacity=".8"/>
</svg>
</div>`;

function cleanLegacy(){
  qa('.archive-entry,.archive-halls,.archive-hero,.archive-atlas,.archive-scene').forEach(el=>el.remove());
}
function patchHero(){
  const hero=q('#home .hero'); if(!hero)return;
  const art=q('.heroArt',hero); if(!art)return;
  if(!q('.bio-world-scene',art)) art.innerHTML=scene;
}
function patchText(){
  const hero=q('#home .hero'); if(!hero)return;
  const p=q('p',hero);
  if(p) p.textContent='Бұл жерде жай тест жаттамаймыз: оқулықты түсініп оқимыз, толық конспект жасаймыз, видеомен бекітеміз, тақырыптық және «Дарын» форматындағы тапсырмалармен білімді дамытамыз.';
}
function patchPhoto(){
  const card=q('#home .teacherPhotoCard'); const img=q('#teacherHomePhoto');
  if(card){card.style.width=window.innerWidth<=700?'100%':(window.innerWidth<=900?'270px':'310px');card.style.height=window.innerWidth<=700?'320px':(window.innerWidth<=900?'315px':'335px');card.style.minHeight='0';}
  if(img){img.style.width='100%';img.style.height='100%';img.style.maxWidth='none';img.style.minWidth='0';img.style.objectFit='cover';img.style.objectPosition='center 18%';img.style.borderRadius='0';}
}
function run(){cleanLegacy();patchHero();patchText();patchPhoto();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
window.addEventListener('resize',patchPhoto);
window.addEventListener('pageshow',run);
new MutationObserver(()=>{cleanLegacy();patchHero();patchPhoto();}).observe(document.documentElement,{childList:true,subtree:true});
})();

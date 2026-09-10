const CACHE='bioolym7-v20-real-selectors';
const CORE=[
  './','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
  './mobile-wow.css','./bio-world.css','./teacher-reaction.css',
  './config.js','./app-pro.js','./photo-fix.js','./teacher-plus.js','./bio-world.js','./teacher-reaction.js',
  './teacher-original.jpg','./teacher-original-2.jpg','./teacher-success.jpg','./teacher-strict.jpg'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>Promise.resolve())));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
function inject(html){
  ['./mobile-wow.css','./bio-world.css','./teacher-reaction.css'].forEach(h=>{if(!html.includes(h))html=html.replace('</head>',`<link rel="stylesheet" href="${h}?v=20"></head>`)});
  if(!html.includes('./config.js'))html=html.replace('</body>','<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><script src="./config.js"></script><script src="./app-pro.js"></script></body>');
  ['./photo-fix.js','./teacher-plus.js','./bio-world.js','./teacher-reaction.js'].forEach(s=>{if(!html.includes(s))html=html.replace('</body>',`<script src="${s}?v=20"></script></body>`)});
  return html;
}
async function navigationResponse(req){
  try{const r=await fetch(req,{cache:'no-store'});const text=await r.text();return new Response(inject(text),{status:r.status,statusText:r.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, no-cache, must-revalidate'}})}
  catch(err){const cached=await caches.match('./index.html');if(cached){const text=await cached.text();return new Response(inject(text),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})}throw err}
}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){e.respondWith(navigationResponse(e.request));return;}
  e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));
});

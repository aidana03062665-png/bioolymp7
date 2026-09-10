const CACHE='bioolym7-v9-wow-design';
const CORE=[
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './mobile-wow.css',
  './wow-theme.css',
  './config.js',
  './app-pro.js',
  './photo-fix.js',
  './teacher-plus.js',
  './wow-design.js',
  './teacher-original.jpg',
  './teacher-original-2.jpg',
  './teacher-success.jpg',
  './teacher-strict.jpg'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>Promise.resolve())));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
function inject(html){
  if(!html.includes('mobile-wow.css')) html=html.replace('</head>','<link rel="stylesheet" href="./mobile-wow.css"></head>');
  if(!html.includes('wow-theme.css')) html=html.replace('</head>','<link rel="stylesheet" href="./wow-theme.css"></head>');
  if(!html.includes('app-pro.js')) html=html.replace('</body>','<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><script src="./config.js"></script><script src="./app-pro.js"></script></body>');
  if(!html.includes('photo-fix.js')) html=html.replace('</body>','<script src="./photo-fix.js"></script></body>');
  if(!html.includes('teacher-plus.js')) html=html.replace('</body>','<script src="./teacher-plus.js"></script></body>');
  if(!html.includes('wow-design.js')) html=html.replace('</body>','<script src="./wow-design.js"></script></body>');
  return html;
}
async function navigationResponse(req){
  try{
    const r=await fetch(req,{cache:'no-store'});
    const text=await r.text();
    return new Response(inject(text),{status:r.status,statusText:r.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
  }catch(err){
    const cached=await caches.match('./index.html');
    if(cached){
      const text=await cached.text();
      return new Response(inject(text),{headers:{'Content-Type':'text/html; charset=utf-8'}});
    }
    throw err;
  }
}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  if(e.request.mode==='navigate'){
    e.respondWith(navigationResponse(e.request));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    if(resp.ok && new URL(e.request.url).origin===self.location.origin){
      const copy=resp.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
    }
    return resp;
  })));
});

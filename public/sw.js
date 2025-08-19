// public/sw.js - basic offline caching
const STATIC_CACHE = 'skillup-static-v1';
const RUNTIME_CACHE = 'skillup-runtime-v1';
const PRECACHE = ['/', '/index.html', '/manifest.webmanifest'];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(STATIC_CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>![STATIC_CACHE,RUNTIME_CACHE].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', e=>{
  const req = e.request; const url = new URL(req.url);
  if(url.pathname.startsWith('/api') || url.href.includes('/api/')){
    e.respondWith(fetch(req).then(res=>{ const copy=res.clone(); caches.open(RUNTIME_CACHE).then(c=>c.put(req,copy)); return res; }).catch(()=>caches.match(req)));
    return;
  }
  e.respondWith(caches.match(req).then(cached=>cached || fetch(req).then(res=>{ const copy=res.clone(); caches.open(STATIC_CACHE).then(c=>c.put(req,copy)); return res; })));
});

// public/sw.js - basic offline caching
const STATIC_CACHE = 'skillup-static-v1';
const RUNTIME_CACHE = 'skillup-runtime-v1';
const PRECACHE = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('install', e=>{ e.waitUntil(caches.open(STATIC_CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>![STATIC_CACHE,RUNTIME_CACHE].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });

self.addEventListener('fetch', e=>{
  const req = e.request; 
  const url = new URL(req.url);
  
  // Проверяем, что схема поддерживается (только http/https)
  if (req.scheme !== 'http' && req.scheme !== 'https') {
    return; // Не обрабатываем неподдерживаемые схемы
  }
  
  // Безопасная функция кэширования
  const safeCachePut = async (cacheName, request, response) => {
    try {
      const cache = await caches.open(cacheName);
      await cache.put(request, response);
    } catch (err) {
      console.warn('Cache put failed:', err);
    }
  };
  
  if(url.pathname.startsWith('/api') || url.href.includes('/api/')){
    e.respondWith(
      fetch(req)
        .then(res => { 
          const copy = res.clone(); 
          safeCachePut(RUNTIME_CACHE, req, copy);
          return res; 
        })
        .catch(() => caches.match(req))
    );
    return;
  }
  
  e.respondWith(
    caches.match(req)
      .then(cached => {
        if (cached) return cached;
        
        return fetch(req)
          .then(res => { 
            const copy = res.clone(); 
            safeCachePut(STATIC_CACHE, req, copy);
            return res; 
          });
      })
  );
});

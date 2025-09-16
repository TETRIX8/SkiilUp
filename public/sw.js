// public/sw.js - enhanced offline caching
const STATIC_CACHE = 'skillup-static-v2';
const RUNTIME_CACHE = 'skillup-runtime-v2';
const API_CACHE = 'skillup-api-v2';
const PRECACHE = [
  '/', 
  '/index.html', 
  '/manifest.webmanifest',
  '/assets/index.css',
  '/assets/index.js'
];

self.addEventListener('install', e=>{ e.waitUntil(caches.open(STATIC_CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', e=>{ 
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(
        keys.filter(k=>![STATIC_CACHE,RUNTIME_CACHE,API_CACHE].includes(k))
          .map(k=>caches.delete(k))
      )
    ).then(()=>self.clients.claim())
  ); 
});

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
  
  // API запросы - кэшируем с приоритетом сети
  if(url.pathname.startsWith('/api') || url.href.includes('/api/')){
    e.respondWith(
      fetch(req)
        .then(res => { 
          if (res.ok) {
            const copy = res.clone(); 
            safeCachePut(API_CACHE, req, copy);
          }
          return res; 
        })
        .catch(() => {
          // В офлайн режиме возвращаем кэшированные данные
          return caches.match(req).then(cached => {
            if (cached) {
              return cached;
            }
            // Если нет кэша, возвращаем базовый ответ
            return new Response(
              JSON.stringify({ 
                error: 'Offline', 
                message: 'No internet connection and no cached data available' 
              }),
              { 
                status: 503, 
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
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

const CACHE_NAME = 'academia-v1';
const urlsToCache = [
  './index.html',
  ./bateria-vip.html',
  './painel-admin.html',
  './manifest.json'
];

// Instala o service worker e guarda os arquivos básicos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepta as requisições para carregar o app offline/corretamente
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

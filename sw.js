// sw.js
const CACHE_NAME = 'referee-tools-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/volleyball.html',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/fullscreen.css',
  '/css/responsive.css',
  '/volleyball.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
// sw.js
const CACHE_NAME = 'aarons-tools-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/volleyball.html',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/fullscreen.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/volleyball.js',
  '/js/modules/fullscreen.js',
  '/js/modules/storage.js',
  '/js/modules/timer.js'
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
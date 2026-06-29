// Minimal service worker: network-first with a runtime cache fallback so the app
// stays installable and usable when the connection drops.
const CACHE = 'brainerd-runtime-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches
            .open(CACHE)
            .then(cache => cache.put(request, copy))
            .catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

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

  // Only handle same-origin requests. Cross-origin calls (e.g. the brainerd-api
  // backend on :5002) must pass straight through to the network — intercepting
  // them here can fail the fetch outright and breaks CORS.
  if (new URL(request.url).origin !== self.location.origin) return;

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
      .catch(async () => {
        // Never resolve respondWith with undefined — that throws "Failed to
        // convert value to 'Response'". Fall back to cache, then a synthetic
        // offline response when there's no cache hit.
        const cached = await caches.match(request);
        return cached || new Response('', { status: 504, statusText: 'Gateway Timeout' });
      })
  );
});

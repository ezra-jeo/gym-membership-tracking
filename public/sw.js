const CACHE_VERSION = 'v1';
const STATIC_CACHE = `stren-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `stren-runtime-${CACHE_VERSION}`;
const NAVIGATION_CACHE = `stren-pages-${CACHE_VERSION}`;

const APP_SHELL_URLS = ['/landing', '/login', '/manifest.webmanifest', '/stren-logo.png'];

const STATIC_DESTINATIONS = new Set(['style', 'script', 'font', 'image']);

function isCacheableResponse(response) {
  return response && response.ok;
}

function cacheResponse(cacheName, request, response) {
  return caches.open(cacheName).then((cache) => {
    cache.put(request, response.clone());
  });
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Network timeout')), timeoutMs);
    }),
  ]);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .catch(() => undefined)
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const expectedCaches = [STATIC_CACHE, RUNTIME_CACHE, NAVIGATION_CACHE];
      const existingCaches = await caches.keys();

      await Promise.all(
        existingCaches
          .filter((cacheName) => !expectedCaches.includes(cacheName))
          .map((cacheName) => caches.delete(cacheName))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  if (!isSameOrigin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(NAVIGATION_CACHE);

        try {
          const networkResponse = await withTimeout(fetch(request), 4000);

          if (isCacheableResponse(networkResponse)) {
            cache.put(request, networkResponse.clone());
          }

          return networkResponse;
        } catch {
          const cachedPage = await cache.match(request);
          if (cachedPage) {
            return cachedPage;
          }

          const shellFallback = await caches.match('/landing');
          if (shellFallback) {
            return shellFallback;
          }

          return Response.error();
        }
      })()
    );
    return;
  }

  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);

        try {
          const networkResponse = await fetch(request);

          if (isCacheableResponse(networkResponse)) {
            cache.put(request, networkResponse.clone());
          }

          return networkResponse;
        } catch {
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          return new Response(
            JSON.stringify({
              error: 'offline',
              message: 'No cached response available while offline.',
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      })()
    );
    return;
  }

  if (STATIC_DESTINATIONS.has(request.destination)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);

        const networkPromise = fetch(request)
          .then((networkResponse) => {
            if (isCacheableResponse(networkResponse)) {
              cache.put(request, networkResponse.clone());
            }

            return networkResponse;
          })
          .catch(() => undefined);

        if (cachedResponse) {
          event.waitUntil(networkPromise);
          return cachedResponse;
        }

        const networkResponse = await networkPromise;
        if (networkResponse) {
          return networkResponse;
        }

        return Response.error();
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(request);

        if (isCacheableResponse(networkResponse)) {
          event.waitUntil(cacheResponse(RUNTIME_CACHE, request, networkResponse));
        }

        return networkResponse;
      } catch {
        return Response.error();
      }
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

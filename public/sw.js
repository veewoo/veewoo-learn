// Service worker kept for installability, but with no runtime caching.

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Limit interception to same-origin requests.
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // Network-only behavior for all same-origin requests, including /api.
  event.respondWith(fetch(event.request));
});

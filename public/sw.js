// Minimal service worker: required for PWA installability. Network-first,
// no offline app shell (this app is server-rendered and needs a live
// connection anyway), so this mainly exists to satisfy the install prompt.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

const CACHE_NAME = "skillfeed-v1";
const urlsToCache = [
  "/",
  "/home.html",
  "/ideas.html",
  "/people.html",
  "/profile.html",
  "/messages.html",
  "/style.css",
  "/home.js",
  "/ideas.js",
  "/people.js",
  "/profile.js",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

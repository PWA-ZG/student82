const filesToCache = [
  "/",
  "manifest.json",
  "index.html",
  "gallery.html",
  "offline.html",
  "404.html",
  "/assets/img/favicon.png",
  "/assets/style.css",
  "/assets/gallery.css",
];

const staticCacheName = "static-cache";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [staticCacheName];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          console.log("Found " + event.request.url + " in cache!");
          return response;
        }

        if (!event.request.url.startsWith("http")) {
          return fetch(event.request);
        }

        return fetch(event.request).then((response) => {
          if (response.status === 404) {
            return caches.match("404.html");
          }
          return caches.open(staticCacheName).then((cache) => {
            cache.put(event.request.url, response.clone());
            return response;
          });
        });
      })
      .catch(() => caches.match("offline.html"))
  );
});

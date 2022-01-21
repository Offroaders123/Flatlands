self.Flatlands = {
  version: 0.49,
  cache: true
}
self.addEventListener("activate",event => {
  event.waitUntil(caches.keys().then(versions => Promise.all(versions.map(cache => {
    if (cache !== Flatlands.version) return caches.delete(cache);
  }))));
  event.waitUntil(clients.claim());
});
self.addEventListener("fetch",event => {
  event.respondWith(caches.match(event.request).then(response => {
    return response || fetch(event.request).then(async response => {
      if (Flatlands.cache) caches.open(Flatlands.version).then(cache => cache.put(event.request,response));
      return response.clone();
    });
  }));
});
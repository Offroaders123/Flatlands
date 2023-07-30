/// <reference no-default-lib="true"/>
/// <reference types="better-typescript/worker.d.ts"/>

var self = /** @type { ServiceWorkerGlobalScope } */ (/** @type { unknown } */ (globalThis));

const Flatlands = {
  version: "Flatlands v0.14.1",
  cache: true
};

self.addEventListener("activate",event => {
  event.waitUntil(caches.keys().then(async keys => {
    const results = keys.map(async key => {
      if (key.startsWith("Flatlands") && key !== Flatlands.version){
        return caches.delete(key);
      }
    });
    await Promise.all(results);
    await self.clients.claim();
  }));
});

self.addEventListener("fetch",async event => {
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached !== undefined) return cached;

    const fetched = await fetch(event.request);

    if (Flatlands.cache){
      const cache = await caches.open(Flatlands.version);
      await cache.put(event.request,fetched.clone());
    }

    return fetched;
  })());
});
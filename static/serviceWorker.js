const assets = [
    "/chartplugin.js",
    "/global.js",
    "/graph.js",
    "/styles.css",
];

self.addEventListener('install', installEvent => {
    installEvent.waitUntil(
        caches.open('lod-calc-v3').then(cache => {
            cache.addAll(assets);
        })
    );
});

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request);
        })
    );
});
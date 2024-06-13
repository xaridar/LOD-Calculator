const assets = [
    "/static/chartplugin.js",
    "/static/global.js",
    "/static/graph.js",
    "/static/styles.css",
];

self.addEventListener('install', installEvent => {
    installEvent.waitUntil(
        caches.open('lod-calc-v1').then(cache => {
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
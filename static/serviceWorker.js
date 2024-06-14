/**
 * serviceWorker.js defines a JavaScript Service Worker,
 * which runs independently oof the application and allows for
 * Progressive Web App (PWA) installation.
 * 
 * Created by Elliot Topper, 06/24
 */

// defines assets to be cached
const assets = [
    "/chartplugin.js",
    "/global.js",
    "/graph.js",
    "/styles.css",
];

// caches assets on sw install
self.addEventListener('install', installEvent => {
    installEvent.waitUntil(
        caches.open('lod-calc-v3').then(cache => {
            cache.addAll(assets);
        })
    );
});

// retrieves cached assets on load
self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request);
        })
    );
});
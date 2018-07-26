self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(
                [
                    '/mstile-150x150.png'
                ]
            );
        })
    );
});
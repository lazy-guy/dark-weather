self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open('dark-weather').then(function (cache) {
      return cache.addAll([
        '/dark-weather',
        '/dark-weather/index.html',
        '/dark-weather/index.js',
        '/dark-weather/css/index.css',
        '/dark-weather/css/weather-icons-wind.min.css',
        '/dark-weather/css/weather-icons.min.css',
        '/dark-weather/font/weathericons-regular-webfont.woff2',
		'/dark-weather/city.list.min.json'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
    .then(response => {
      if (response.ok)
        addToCache(pagesCacheName, request, response.clone());
      return response;
    })
    .catch(() => {
      return caches.match(event.request).then(response => {
        return response;
      })
    })
  );
});

self.addEventListener("onupdatefound", function () {
  registration.update();
})
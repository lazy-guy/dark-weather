var cacheurl = [
  '/dark-weather',
  '/dark-weather/index.html',
  '/dark-weather/index.js',
  '/dark-weather/css/index.css',
  '/dark-weather/css/weather-icons-wind.min.css',
  '/dark-weather/css/weather-icons.min.css',
  '/dark-weather/font/weathericons-regular-webfont.woff2',
'/dark-weather/city.list.min.json'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open('dark-weather')
    .then(cache => {cache.addAll(cacheurl);})
    .then(self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return caches.open('dark-weather').then(cache => {
          return fetch(event.request).then(response => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});



self.addEventListener("onupdatefound", function () {
  registration.update();
})
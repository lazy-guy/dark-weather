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
  if(event.request.url.indexOf("2aca00e2d1ef80c8d993467bb7c58e83") !== -1){
    return;
  }else
  event.respondWith(async function() {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) return cachedResponse;
    return fetch(event.request);
  }());
});



self.addEventListener("onupdatefound", function () {
  registration.update();
})
self.addEventListener('install', function(e) {
    e.waitUntil(
      caches.open('dark-weather').then(function(cache) {
        return cache.addAll([
          '/dark-weather',
          '/dark-weather/index.html',
          '/dark-weather/index.js',
          '/dark-weather/css/index.css',
          '/dark-weather/css/weather-icons-wind.min.css',
          '/dark-weather/css/weather-icons.min.css',
          '/dark-weather/font/weathericons-regular-webfont.woff2'
        ]);
      })
    );
   });
   
   self.addEventListener('fetch', function(e) {
     console.log(e.request.url);
     e.respondWith(
       caches.match(e.request).then(function(response) {
         return response || fetch(e.request);
       })
     );
   });
/* 
      ___                                              ___           ___                       ___     
     /  /\        ___                                 /  /\         /  /\          ___        /  /\    
    /  /:/_      /  /\                               /  /:/_       /  /::\        /  /\      /  /:/_   
   /  /:/ /\    /  /:/      ___     ___             /  /:/ /\     /  /:/\:\      /  /:/     /  /:/ /\  
  /  /:/_/::\  /__/::\     /__/\   /  /\           /  /:/ /:/_   /  /:/~/::\    /  /:/     /  /:/ /::\ 
 /__/:/__\/\:\ \__\/\:\__  \  \:\ /  /:/          /__/:/ /:/ /\ /__/:/ /:/\:\  /  /::\    /__/:/ /:/\:\
 \  \:\ /~~/:/    \  \:\/\  \  \:\  /:/           \  \:\/:/ /:/ \  \:\/:/__\/ /__/:/\:\   \  \:\/:/~/:/
  \  \:\  /:/      \__\::/   \  \:\/:/             \  \::/ /:/   \  \::/      \__\/  \:\   \  \::/ /:/ 
   \  \:\/:/       /__/:/     \  \::/               \  \:\/:/     \  \:\           \  \:\   \__\/ /:/  
    \  \::/        \__\/       \__\/                 \  \::/       \  \:\           \__\/     /__/:/   
     \__\/                                            \__\/         \__\/                     \__\/    

Service Worker!

*/

var FILES_CACHE = 'gil-eats-cache';
var DATA_CACHE = 'gil-eats-data';
var urlsToCache = [
  'index.html',
  'css/style.css',
  'js/eats.js',
  'js/gmaps.js'
];


// Save main files to cache on install
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(FILES_CACHE)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// And fetch them if we return to page
self.addEventListener('fetch', function(event) {
  console.log('[ServiceWorker] Fetch', event.request.url);  
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (response) { /* Cache hit - return response */
            return response;
          }
          // Not in cache, return the result
          return fetch(event.request);
        }
      )
  );
});

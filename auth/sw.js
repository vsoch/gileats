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

/* Try saving data with the service worker, via message
self.addEventListener('message', function(event) {

  console.log('Handling message event:', event);
  var p = caches.open(DATA_CACHE).then(function(cache) {

    // What command was issued by the user?
    switch (event.data.command) {

      case 'keys':
        return cache.keys().then(function(requests) {
          var urls = requests.map(function(request) {
            return request.url;
          });

          return urls.sort();
        }).then(function(urls) {
          // event.ports[0] corresponds to the MessagePort that was transferred as part of the controlled page's
          // call to controller.postMessage(). Therefore, event.ports[0].postMessage() will trigger the onmessage
          // handler from the controlled page.
          // It's up to you how to structure the messages that you send back; this is just one example.
          event.ports[0].postMessage({
            error: null,
            urls: urls
          });
        });

      // This command adds a new data object to the service worker, for later
      case 'add':
          //TODO: how do I save a string (for later) to worker?
          console.log(event);
          return cache.put(event.data.url);

      // This command removes a request/response pair from the cache (assuming it exists).
      case 'delete':
        return cache.delete(event.data.url).then(function(success) {
          event.ports[0].postMessage({
            error: success ? null : 'Item was not found in the cache.'
          });
        });

      default:
        // This will be handled by the outer .catch().
        throw Error('Unknown command: ' + event.data.command);
    }
  }).catch(function(error) {
    // If the promise rejects, handle it by returning a standardized error message to the controlled page.
    console.error('Message handling failed:', error);

    event.ports[0].postMessage({
      error: error.toString()
    });
  });

  // Beginning in Chrome 51, event is an ExtendableMessageEvent, which supports
  // the waitUntil() method for extending the lifetime of the event handler
  // until the promise is resolved.
  if ('waitUntil' in event) {
    event.waitUntil(p);
  }
});*/

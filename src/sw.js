
/* This acts has the cache name as well  */
const appName = 'my-currency-converter-05';

/* List of resources to add to cache */
const resources = {
    libs: [
        '/',
        'libs/bootstrap.min.css',
        'libs/bootstrap-select.min.css',
        'libs/bootstrap-select.min.js',
        'libs/bootstrap.min.js',
        'libs/jquery.slim.min.js',
        'libs/polyfill.min.js',
        'libs/popper.min.js',
        'libs/idb.js'
    ],
    app: [
        'css/app.css',
        'js/app.js'
    ],
    api: [
        'https://free.currencyconverterapi.com/api/v5/countries'
    ]
};

/**
 * On Installation
 * 
 * add all resources to the cache
 */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(appName)
        .then(cache => cache.addAll(resources.libs.concat(resources.api)) )
        .catch(err => handleError(err))
        .then( () => self.skipWaiting() )
    )
});

/**
 * On Activation, Perform Clean up on the Caches Storage by Comparing the current CacheName
 * againt the one in the database
 */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
              cacheNames.filter(cacheName => {
                return cacheName.startsWith('my-currency-converter-') &&
                       cacheName != appName;
              }).map(cacheName => caches.delete(cacheName) )
            );
          }).then( () => self.clients.claim() ).catch(err => handleError(err))
    );
});

/**
 * On Fetch Event. 
 * 
 * Check the cache storage for match. 
 * 
 * if found return cached item else make a request to the network
 */
self.addEventListener('fetch', event => {
    const request = event.request;

    if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
        return;
    }

    event.respondWith(
        caches.match(request)
        .then(res => {
            if (res) {
                return res;
            }
            return fetch(request)
        })
    );
});
 
/**
 * Handle Errors
 * 
 * @param {Any} err 
 */
const handleError = err => {
    console.error('[sw err] ', err);
} 
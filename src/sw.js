
/* This acts has the cache name as well  */
const app = 'the-currency-converter-app-';
const version = '02'
const appName = `${app + version}`;

 const path = (location.hostname === 'triple0t.github.io') ? '/alc-currency-converter/' : '/';

/* List of resources to add to cache */
const resources = {
    libs: [
        `${path}`,
        `${path}index.html`,
        `${path}libs/bootstrap.min.css`,
        `${path}libs/bootstrap-select.min.css`,
        `${path}libs/bootstrap-select.min.js`,
        `${path}libs/bootstrap.min.js`,
        `${path}libs/jquery.slim.min.js`,
        `${path}libs/polyfill.min.js`,
        `${path}libs/popper.min.js`,
        `${path}libs/idb.js`
    ],
    app: [
        `${path}css/app.css`,
        `${path}js/app.js`
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
        .then(cache => cache.addAll(resources.libs.concat(resources.api, resources.app)) )
        //.then(cache => cache.addAll(resources.libs.concat(resources.api)) )
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
                return cacheName.startsWith(app) &&
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
    // const request = event.request;
    // const requestUrl = new URL(event.request.url);

    /* if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
        return;
    } */

    event.respondWith(
        caches.match(event.request)
        .then(res => {
            return res || fetch(event.request)
        })
    );
});
 
/**
 * Handle Errors
 * 
 * @param {Any} err 
 */
const handleError = err => {
    console.log('[sw err] ', err);
} 
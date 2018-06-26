'use strict';

/* This acts has the cache name as well  */
var appName = 'my-currency-converter-03';

/* List of resources to add to cache */
var resources = {
    libs: ['/', 'libs/bootstrap.min.css', 'libs/bootstrap-select.min.css', 'libs/bootstrap-select.min.js', 'libs/bootstrap.min.js', 'libs/jquery.slim.min.js', 'libs/polyfill.min.js', 'libs/popper.min.js'],
    app: ['css/app.css', 'js/app.js'],
    api: ['https://free.currencyconverterapi.com/api/v5/countries']
};

/**
 * On Installation
 * 
 * add all resources to the cache
 */
self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(appName).then(function (cache) {
        return cache.addAll(resources.libs.concat(resources.api));
    }).catch(function (err) {
        return handleError(err);
    }).then(function () {
        return self.skipWaiting();
    }));
});

/**
 * On Activation, Perform Clean up on the Caches Storage by Comparing the current CacheName
 * againt the one in the database
 */
self.addEventListener('activate', function (event) {
    event.waitUntil(caches.keys().then(function (cacheNames) {
        return Promise.all(cacheNames.filter(function (cacheName) {
            return cacheName.startsWith('my-currency-converter-') && cacheName != appName;
        }).map(function (cacheName) {
            return caches.delete(cacheName);
        }));
    }).then(function () {
        return self.clients.claim();
    }).catch(function (err) {
        return handleError(err);
    }));
});

/**
 * On Fetch Event. 
 * 
 * Check the cache storage for match. 
 * 
 * if found return cached item else make a request to the network
 */
self.addEventListener('fetch', function (event) {
    event.respondWith(caches.match(event.request).then(function (res) {
        if (res) {
            return res;
        }
        return fetch(event.request);
    }));
});

/**
 * Handle Errors
 * 
 * @param {Any} err 
 */
var handleError = function handleError(err) {
    console.error('[sw err] ', err);
};
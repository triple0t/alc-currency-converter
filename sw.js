'use strict';

/* This acts has the cache name as well  */
var app = 'the-currency-converter-app-';
var version = '04';
var appName = '' + (app + version);

var path = location.hostname === 'triple0t.github.io' ? '/alc-currency-converter/' : '/';

/* List of resources to add to cache */
var resources = {
    libs: ['' + path, path + 'index.html', path + 'libs/bootstrap.min.css', path + 'libs/bootstrap-select.min.css', path + 'libs/bootstrap-select.min.js', path + 'libs/bootstrap.min.js', path + 'libs/jquery.slim.min.js', path + 'libs/polyfill.min.js', path + 'libs/popper.min.js', path + 'libs/idb.js', path + 'icon.png', path + 'manifest.json', path + 'images/icons/icon-72x72.png', path + 'images/icons/icon-96x96.png', path + 'images/icons/icon-128x128.png', path + 'images/icons/icon-144x144.png', path + 'images/icons/icon-152x152.png', path + 'images/icons/icon-192x192.png', path + 'images/icons/icon-384x384.png', path + 'images/icons/icon-512x512.png'],
    app: [path + 'css/app.css', path + 'js/app.js'],
    api: ['https://free.currencyconverterapi.com/api/v5/countries']
};

/**
 * On Installation
 * 
 * add all resources to the cache
 */
self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(appName).then(function (cache) {
        return cache.addAll(resources.libs.concat(resources.api, resources.app));
    })
    //.then(cache => cache.addAll(resources.libs.concat(resources.api)) )
    .catch(function (err) {
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
            return cacheName.startsWith(app) && cacheName != appName;
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
    // const request = event.request;
    // const requestUrl = new URL(event.request.url);

    /* if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
        return;
    } */

    event.respondWith(caches.match(event.request).then(function (res) {
        return res || fetch(event.request);
    }));
});

/**
 * Handle Errors
 * 
 * @param {Any} err 
 */
var handleError = function handleError(err) {
    console.log('[sw err] ', err);
};
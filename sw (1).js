// Service Worker pour Carnet de Sport PWA
// Version: 2.0 - 2026-02-18

const CACHE_NAME = 'carnet-sport-v2-2026';
const urlsToCache = [
    './',
    './index.html',
    'https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js',
    'https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js',
    'https://cdn.jsdelivr.net/npm/@babel/standalone@7.23.9/babel.min.js'
];

// Installation
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Cache opened');
                return cache.addAll(urlsToCache).catch(err => {
                    console.warn('⚠️ Some resources failed to cache:', err);
                    // Ne pas bloquer l'installation si un cache échoue
                    return Promise.resolve();
                });
            })
    );
    self.skipWaiting();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    console.log('📦 Cache hit:', event.request.url);
                    return response;
                }
                
                // Fetch from network
                return fetch(event.request).then(fetchResponse => {
                    // Cache successful GET requests
                    if (event.request.method === 'GET' && fetchResponse.ok) {
                        const responseClone = fetchResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return fetchResponse;
                }).catch(() => {
                    // Offline fallback
                    console.log('❌ Offline:', event.request.url);
                    return new Response('Offline - Service non disponible', { 
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

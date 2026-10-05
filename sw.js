/**
 * Sukhakarta Bishi - Progressive Web App Service Worker
 * Provides offline capabilities, instant loading, and asset caching for Website and Mobile App
 */

const CACHE_NAME = 'sukhakarta-bishi-v1.2.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './app.html',
  './manifest.json',
  './manifest-app.json',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
  './assets/icons/icon-maskable-192x192.png',
  './assets/icons/icon-maskable-512x512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-32x32.png',
  './assets/logo-emblem.png',
  './assets/logo.png',
  './assets/favicon.png',
  './js/xlsx.full.min.js',
  './js/firebase.js',
  './js/marathi_translit.js',
  './js/i18n.js',
  './js/store.js',
  './js/auth.js',
  './js/receipt.js',
  './js/export.js',
  './js/ui.js',
  './js/pwa.js',
  './js/app.js'
];

// 1. Install Event - Precache static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching core offline assets for web & app...');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Some precache assets could not be cached immediately:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event - Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event - Network-First for HTML navigations, Stale-While-Revalidate for assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and external API/Firebase endpoints
  if (request.method !== 'GET') return;
  if (url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  // Navigation requests (HTML): Network first, falling back to cached HTML
  if (request.mode === 'navigate' || request.destination === 'document') {
    const isAppRequest = url.pathname.endsWith('/app') || url.pathname.endsWith('/app.html');
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            if (isAppRequest) {
              return caches.match('./app.html');
            }
            return caches.match('./index.html') || caches.match('./');
          });
        })
    );
    return;
  }

  // Static Assets (CSS, JS, Fonts, Images): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// This is the service worker for the Veewoo Learn PWA

// Cache name - update this version when you want to refresh the cache
const CACHE_NAME = 'veewoo-learn-v3';

// Assets to cache - only include files and routes that actually exist
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html',
  // App routes
  '/reading',
  '/speaking', 
  '/flashcards',
  '/sentence-scramble',
  // Static assets that exist
  '/globe.svg',
  '/file.svg',
  '/window.svg',
  '/next.svg',
  '/vercel.svg',
  '/icons/placeholder.svg'
];

// Install service worker and cache the static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service worker caching static assets...');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Error during service worker install:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service worker deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', event => {
  // Skip caching for API routes - always fetch fresh data
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from the cache
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Make network request and cache new resources
        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache the fetched response (only for non-API routes)
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          // Return the original response
          return response;
        });
      })
      .catch(() => {
        // Fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html')
            .then(response => {
              return response || new Response('You are offline. Please check your connection.');
            });
        }
        
        // For image requests, return a placeholder
        if (event.request.destination === 'image') {
          return caches.match('/icons/placeholder.svg');
        }
        
        // Default fallback
        return new Response('You are offline. Please check your connection.');
      })
  );
});

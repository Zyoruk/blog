// Bumping this purges every older cache in the activate handler below. Bump it
// whenever a bad response may have been cached — v1 held stale HTML pointing at
// a retired CloudFront distribution.
// ponytail: manual bump. Automate off the build hash if deploys ever get frequent.
const CACHE_NAME = 'zyoruk-blog-v2';
const STATIC_CACHE = [
  '/',
  '/blog',
  '/manifest.json',
  '/favicon.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(handleFetch(event.request));
});

async function handleFetch(request) {
  try {
    const response = await fetch(request);
    
    // Don't cache non-successful responses
    if (!response || response.status !== 200 || response.type !== 'basic') {
      return response;
    }

    // Clone the response for caching
    const responseToCache = response.clone();
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, responseToCache);

    return response;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const shell = await caches.match('/');
      if (shell) {
        return shell;
      }
    }

    // Nothing cached. Let the request fail exactly as it would without a service
    // worker. Synthesising a 408 here hid a total DNS outage behind a page that
    // rendered its HTML from cache while every stylesheet came back as
    // "408 text/plain" — it looked like a CSS bug, not a dead domain.
    throw error;
  }
}

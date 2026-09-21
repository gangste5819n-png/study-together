// Study Together PWA Service Worker
const CACHE_NAME = 'study-together-v1';
const STATIC_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Offline HTML fallback banner/template
const OFFLINE_FALLBACK_PAGE = `
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Study Together — Offline</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #07080d;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .card {
      max-width: 400px;
      margin: 20px;
      padding: 32px 24px;
      background: rgba(15, 18, 28, 0.9);
      border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 800; margin-bottom: 8px; color: #fff; }
    p { font-size: 14px; color: #cbd5e1; line-height: 1.5; margin-bottom: 24px; }
    button {
      background: linear-gradient(135deg, #7c3aed, #db2777);
      color: #fff;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">📡</div>
    <h1>Study Together</h1>
    <p>You're offline. Some features will be unavailable.</p>
    <button onclick="window.location.reload()">Retry Connection</button>
  </div>
</body>
</html>
`;

// Install event: cache static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_SHELL_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-caching warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Strict security policy
// NEVER cache: /api/*, /socket.io/*, WebRTC, auth headers, private responses
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Exclude all sensitive endpoints
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/socket.io') ||
    event.request.headers.has('Authorization') ||
    event.request.method !== 'GET'
  ) {
    // Pass straight through to network, never touch cache
    return;
  }

  // 2. Navigation requests: Network-first with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html').then((cached) => {
            return (
              cached ||
              new Response(OFFLINE_FALLBACK_PAGE, {
                headers: { 'Content-Type': 'text/html' },
              })
            );
          });
        })
    );
    return;
  }

  // 3. Safe static assets (CSS, JS, images, fonts): Stale-while-revalidate or cache-first
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});

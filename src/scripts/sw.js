import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

const BASE_URL = 'https://story-api.dicoding.dev';


precacheAndRoute(self.__WB_MANIFEST);

// Cache FontAwesome and CDNs
registerRoute(
  ({ url }) => url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome'),
  new CacheFirst({
    cacheName: 'fontawesome',
  }),
);

// Cache scripts and styles (excluding login-view.js)
registerRoute(
  ({ request, url }) =>
    (request.destination === 'script' || request.destination === 'style') &&
    !url.pathname.endsWith('login-view.js'),
  new CacheFirst({
    cacheName: 'assets-cache',
  }),
);

// Cache image requests from your API
registerRoute(
  ({ request, url }) =>
    url.origin === BASE_URL && request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'StoryApp-API-images-cache',
  }),
);

// Cache other API responses
registerRoute(
  ({ request, url }) =>
    url.origin === BASE_URL && request.destination !== 'image',
  new NetworkFirst({
    cacheName: 'StoryApp-API-cache',
    networkTimeoutSeconds: 3,
  }),
);

// Cache map tiles from OpenStreetMap (Leaflet)
registerRoute(
  ({ url }) => url.origin.includes('tile.openstreetmap.org'),
  new StaleWhileRevalidate({
    cacheName: 'osm-tiles',
  }),
);

// Cache images from other sources
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
  }),
);

// Offline fallback for navigation requests (pages)
registerRoute(
  ({ request, url }) =>
    request.mode === 'navigate' && !url.pathname.includes('/login'),
  new NetworkFirst({
    cacheName: 'pages-cache',
  })
);

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'No payload' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body || 'Push message received',
      icon: '/icons/icon-512x512.png',
    })
  );
});

// Lifecycle events
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

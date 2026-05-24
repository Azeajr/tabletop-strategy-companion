import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

let sessionActive = false

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SESSION_ACTIVE') {
    sessionActive = true
  } else if (event.data?.type === 'SESSION_ENDED') {
    sessionActive = false
  } else if (event.data?.type === 'SKIP_WAITING') {
    // Called by useRegisterSW when user accepts update.
    // Block if a game session is still active.
    if (!sessionActive) {
      void self.skipWaiting()
    }
  }
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

registerRoute(
  ({ url }) => url.pathname.endsWith('.wasm'),
  new CacheFirst({
    cacheName: 'wasm-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  }),
)

registerRoute(
  ({ url }) => /\/data\/seeds\/.*\.json$/.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: 'seed-data-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  }),
)

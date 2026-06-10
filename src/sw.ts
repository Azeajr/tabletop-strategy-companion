import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Session lock — must be persisted, not held in memory:
// 1. SESSION_ACTIVE/ENDED arrive at the *active* SW, but workbox-window sends
//    SKIP_WAITING to the *waiting* SW. They are separate instances and share
//    no globals; Cache Storage is the state they both can see.
// 2. The browser kills an idle SW within minutes. A board game session has
//    near-zero fetch traffic, so an in-memory flag would not survive a game.
const SESSION_CACHE = 'session-lock'
const SESSION_KEY = '/__session-active'
// A crash mid-game never sends SESSION_ENDED. Expire stale locks so updates
// are not blocked forever; no tabletop session runs longer than this.
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000

async function setSessionActive(active: boolean): Promise<void> {
  const cache = await caches.open(SESSION_CACHE)
  if (active) await cache.put(SESSION_KEY, new Response(String(Date.now())))
  else await cache.delete(SESSION_KEY)
}

async function isSessionActive(): Promise<boolean> {
  const cache = await caches.open(SESSION_CACHE)
  const res = await cache.match(SESSION_KEY)
  if (!res) return false
  const startedAt = Number(await res.text())
  return Date.now() - startedAt < SESSION_MAX_AGE_MS
}

self.addEventListener('message', (event) => {
  const type = (event.data as { type?: string } | null)?.type
  if (type === 'SESSION_ACTIVE') {
    event.waitUntil(setSessionActive(true))
  } else if (type === 'SESSION_ENDED') {
    event.waitUntil(setSessionActive(false))
  } else if (type === 'SKIP_WAITING') {
    // Sent by useRegisterSW when the user accepts an update.
    // Reject while a game session is active — activating mid-game reloads
    // every claimed client and wipes the live phase/filter state.
    event.waitUntil(
      isSessionActive().then((active) => {
        if (!active) return self.skipWaiting()
      }),
    )
  }
})

self.addEventListener('activate', (event) => {
  // A new SW only activates when no session blocked it; drop any stale lock.
  event.waitUntil(setSessionActive(false).then(() => self.clients.claim()))
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

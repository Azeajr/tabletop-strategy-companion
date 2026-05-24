import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    alias: [
      // Swap Worker-backed SQLite client for in-process client under vitest
      { find: /\/sqlite-client$/, replacement: '/sqlite-test-client' },
    ],
    coverage: {
      provider: 'v8' as const,
      reporter: ['text', 'html', 'lcov'],
      include: ['src/lib/**/*.ts', 'src/views/**/*.tsx', 'src/store/**/*.ts'],
      exclude: ['**/*.test.*'],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
  preview: {
    port: 5175,
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  },
  plugins: [
    tailwindcss(),
    solid(),
    VitePWA({
      // 'prompt' = show update prompt rather than auto-activating.
      // Aligns with session lock: new SW won't claim clients until user
      // is on the landing page and explicitly accepts the update.
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,ico,png,svg,wasm}'],
        cleanupOutdatedCaches: true,
        clientsClaim: false,
        skipWaiting: false,
        runtimeCaching: [
          {
            urlPattern: /\.wasm$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wasm-cache',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/data\/seeds\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'seed-data-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: {
        name: 'Tabletop Strategy Companion',
        short_name: 'Strategy',
        theme_color: '#0D0B08',
        background_color: '#0D0B08',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})

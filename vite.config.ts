import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { webHarness } from '@azeajr/web-harness/vite'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
    alias: [
      // Swap Worker-backed SQLite client for in-process client under vitest
      { find: /\/sqlite-client$/, replacement: '/sqlite-test-client' },
    ],
    coverage: {
      provider: 'v8' as const,
      reporter: ['text', 'html', 'lcov'],
      // Everything under src/, with named exclusions — not four hand-picked
      // directories, which left components and the service worker unmeasured.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.*',
        'src/test-setup.ts',
        'src/vite-env.d.ts',
        'src/types/**',
        // The vitest alias swaps this in for the worker client; it is the harness, not the app.
        'src/db/sqlite-test-client.ts',
        // Run only in a real browser (Worker / ServiceWorker globals); proven by E2E and the smoke.
        'src/db/sqlite.worker.ts',
        'src/db/sqlite-client.ts',
        'src/sw.ts',
        'src/index.tsx',
      ],
      // A ratchet at the measured floor (2026-09-27), now enforced in CI. The
      // old 80% gate measured a narrower scope and was failing unseen — at
      // 67.5/57.7/71.6/69.8 — because coverage never ran in any workflow.
      // Raise these as tests land; never lower them.
      thresholds: { statements: 80, branches: 69, functions: 79, lines: 83 },
    },
  },
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
  plugins: [
    tailwindcss(),
    solid(),
    // Dev-server identity for the agent harness; serve-only, never in a build.
    webHarness(),
    VitePWA({
      registerType: 'prompt',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        // html: the navigation route in src/sw.ts serves the precached shell.
        globPatterns: ['**/*.{html,js,css,ico,png,svg,wasm}'],
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

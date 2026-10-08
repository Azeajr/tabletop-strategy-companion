import { defineConfig, devices } from '@playwright/test'
import { productionServer } from '@azeajr/web-harness/playwright'

export default defineConfig({
  testDir: './tests/e2e',
  // Sequential: each test gets its own BrowserContext with isolated SQLite and
  // localStorage — no cross-test state to worry about.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    // 127.0.0.1, not localhost: the server binds IPv4 only, and the fault
    // policy judges "external" against exactly this origin.
    baseURL: 'http://127.0.0.1:5176',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  expect: {
    // SQLite WASM init + seed load can take a few seconds on first page visit.
    timeout: 12_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  // The production build served the way Cloudflare Pages serves it (public/
  // _headers as real headers, SPA fallback), never `pnpm dev`: the dev
  // server registers no service worker and sends none of the production
  // headers. Never reuses a listening server, so a stale build is never tested.
  webServer: productionServer({ port: 5176, build: 'pnpm build' }),
})

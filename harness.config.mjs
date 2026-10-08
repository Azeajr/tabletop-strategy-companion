// Agent harness adapter (https://github.com/Azeajr/web-harness). What the shared controller,
// Playwright fixture, production smoke and CI need to know about THIS app. Functions marked
// SERIALIZED are shipped as source text into the browser tooling: they may not close over
// anything in this file.
import { defineHarness } from '@azeajr/web-harness/config'

// SERIALIZED. Seed data is bundled and written to OPFS SQLite on first boot; the library's game
// links appear once that has finished, on any route that lists games.
const ready = async (page) => {
  await page.waitForFunction(() => Boolean(document.getElementById('root')?.firstElementChild), null, {
    timeout: 30_000,
  })
}

export default defineHarness({
  name: 'tabletop',
  // E2E owns 5176; sessions default elsewhere so both can run at once.
  port: 5186,
  defaults: { browser: 'webkit', device: 'iPhone 13 Mini' },
  dev: {
    command: (port) => ['pnpm', 'exec', 'vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    marker: '/src/index.tsx',
  },
  production: {
    build: (outDir) => ['pnpm', 'exec', 'vite', 'build', '--outDir', outDir, '--emptyOutDir'],
  },
  ready,
  fixtures: {
    library: {
      description: 'Game library with every bundled seed loaded',
      // SERIALIZED
      apply: async (page) => {
        await page.getByRole('link', { name: 'Catan' }).waitFor({ timeout: 15_000 })
        return { games: await page.getByRole('link').count() }
      },
    },
    'catan-live': {
      description: 'Catan live companion, Setup phase, study mode',
      // SERIALIZED
      apply: async (page) => {
        await page.getByRole('link', { name: 'Catan' }).click({ timeout: 15_000 })
        await page.getByRole('button', { name: 'Start Game →' }).click()
        await page.locator('[data-condition-toggle]').first().waitFor({ timeout: 15_000 })
        return { url: page.url() }
      },
    },
  },
  defaultFixture: 'library',
  state: {
    sections: ['mode', 'seed', 'counts'],
    defaults: ['mode', 'seed', 'counts'],
    // SERIALIZED, runs in the page. src/dev/harness.ts installs it in dev builds only.
    read: async (sections) => {
      for (let i = 0; i < 50 && !window.__harness; i++) await new Promise((r) => setTimeout(r, 100))
      if (!window.__harness) throw new Error('Development state accessor unavailable.')
      return window.__harness.snapshot(sections)
    },
  },
  smoke: {
    requiredHeaders: ['content-security-policy', 'x-content-type-options', 'x-frame-options', 'referrer-policy'],
    ready: async (page) => {
      await page.getByRole('link', { name: 'Catan' }).waitFor({ timeout: 20_000 })
    },
    // The one thing a user sets and expects back: the display mode. The game list must also come
    // back offline, which only happens if the SQLite seed survived in OPFS.
    persist: async (page) => {
      await page.getByRole('button', { name: /Stealth/ }).click()
      return 'stealth'
    },
    verify: async (page, mode) => {
      await page.getByRole('link', { name: 'Catan' }).waitFor({ timeout: 20_000 })
      const actual = await page.evaluate(() => document.body.getAttribute('data-mode'))
      if (actual !== mode) throw new Error(`Display mode did not persist: ${actual}`)
    },
  },
  e2e: { config: 'playwright.config.ts', snapshots: ['tests/e2e'] },
  scenarios: [
    {
      id: 'browse-library',
      title: 'Every bundled game is listed and searchable',
      covers: [
        { file: 'tests/e2e/game-library.spec.ts', test: 'shows multiple seeded games on load @smoke' },
        { file: 'tests/e2e/game-library.spec.ts', test: 'search filters games by name' },
      ],
    },
    {
      id: 'pre-game-dashboard',
      title: 'A game dashboard shows its phases and starts the companion',
      covers: [
        { file: 'tests/e2e/pre-game-dashboard.spec.ts', test: 'all four phase tabs are present' },
        { file: 'tests/e2e/pre-game-dashboard.spec.ts', test: 'Start Game button navigates to live companion' },
      ],
    },
    {
      id: 'live-companion',
      title: 'Live companion steps through phases and filters strategies',
      covers: [
        { file: 'tests/e2e/live-companion.spec.ts', test: 'switching phase updates the active tab and loads new strategies' },
        { file: 'tests/e2e/live-companion.spec.ts', test: '"Yes" filter hides trailing-only strategies' },
      ],
    },
    {
      id: 'stealth-mode',
      title: 'Stealth mode condenses strategies and persists across phases',
      covers: [
        { file: 'tests/e2e/live-companion.spec.ts', test: 'stealth mode shows bullet points in expanded accordion' },
        { file: 'tests/e2e/live-companion.spec.ts', test: 'mode persists when switching phases' },
      ],
    },
    {
      id: 'offline-install',
      title: 'The shipped build installs, keeps the mode, and works offline',
      covers: [{ lane: 'smoke' }],
    },
  ],
})

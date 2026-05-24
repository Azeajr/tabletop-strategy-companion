import { test, expect } from '@playwright/test'

const SEED_READY = { timeout: 12_000 }

// Catan has filter_1_label "Do you have the most victory points?"
// Early Game strategies: 3 null-context + 1 leading + 1 trailing = 5 total
const CATAN_PLAY_URL = '/game/catan/play'

test.describe('Live Companion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CATAN_PLAY_URL)
    // Wait for strategies to load (first accordion toggle appears).
    await expect(page.locator('[data-condition-toggle]').first()).toBeVisible(SEED_READY)
  })

  // ── Phase stepper ───────────────────────────────────────────────────────

  test('phase stepper shows all four phases @smoke', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Game phases' })
    for (const phase of ['Setup', 'Early Game', 'Mid-Game', 'End-Game']) {
      await expect(nav.getByRole('button', { name: phase })).toBeVisible()
    }
  })

  test('Setup is the active phase on load', async ({ page }) => {
    await expect(
      page.getByRole('navigation', { name: 'Game phases' }).getByRole('button', { name: 'Setup' }),
    ).toHaveAttribute('aria-current', 'step')
  })

  test('switching phase updates the active tab and loads new strategies', async ({ page }) => {
    await page.getByRole('navigation', { name: 'Game phases' }).getByRole('button', { name: 'Early Game' }).click()
    await expect(
      page.getByRole('navigation', { name: 'Game phases' }).getByRole('button', { name: 'Early Game' }),
    ).toHaveAttribute('aria-current', 'step')
    // Early Game has strategies — at least one toggle should appear.
    await expect(page.locator('[data-condition-toggle]').first()).toBeVisible()
  })

  // ── Accordion (golden path 1: expand condition) ─────────────────────────

  test('condition toggle is collapsed by default', async ({ page }) => {
    await expect(page.locator('[data-condition-toggle]').first()).toHaveAttribute('aria-expanded', 'false')
  })

  test('clicking a condition toggle expands it', async ({ page }) => {
    const toggle = page.locator('[data-condition-toggle]').first()
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  test('opening a second toggle collapses the first', async ({ page }) => {
    const toggles = page.locator('[data-condition-toggle]')
    await toggles.first().click()
    await expect(toggles.first()).toHaveAttribute('aria-expanded', 'true')
    await toggles.nth(1).click()
    await expect(toggles.first()).toHaveAttribute('aria-expanded', 'false')
    await expect(toggles.nth(1)).toHaveAttribute('aria-expanded', 'true')
  })

  test('clicking an open toggle collapses it', async ({ page }) => {
    const toggle = page.locator('[data-condition-toggle]').first()
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  // ── Study ↔ Stealth mode toggle (golden path 2) ─────────────────────────

  test('defaults to study mode', async ({ page }) => {
    await expect(page.locator('body')).toHaveAttribute('data-mode', 'study')
    await expect(page.getByRole('button', { name: /study/i })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: /stealth/i })).toHaveAttribute('aria-pressed', 'false')
  })

  test('study mode shows detailed strategy text in expanded accordion', async ({ page }) => {
    await expect(page.locator('body')).toHaveAttribute('data-mode', 'study')
    const toggle = page.locator('[data-condition-toggle]').first()
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    // study mode renders a <p> with strategy_detailed inside the accordion panel.
    const parent = toggle.locator('..')
    await expect(parent.locator('p.leading-relaxed')).toBeVisible()
  })

  test('stealth mode shows bullet points in expanded accordion', async ({ page }) => {
    // Toggle to stealth
    await page.getByRole('button', { name: /stealth/i }).click()
    await expect(page.locator('body')).toHaveAttribute('data-mode', 'stealth')
    await expect(page.getByRole('button', { name: /stealth/i })).toHaveAttribute('aria-pressed', 'true')

    const toggle = page.locator('[data-condition-toggle]').first()
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    // Stealth renders <ul><li> bullets, each starting with the "›" character.
    const parent = toggle.locator('..')
    await expect(parent.locator('li')).not.toHaveCount(0)
    await expect(parent.getByText('›').first()).toBeVisible()
  })

  test('mode persists when switching phases', async ({ page }) => {
    // Switch to stealth
    await page.getByRole('button', { name: /stealth/i }).click()
    await expect(page.locator('body')).toHaveAttribute('data-mode', 'stealth')
    // Switch phase
    await page.getByRole('navigation', { name: 'Game phases' }).getByRole('button', { name: 'Mid-Game' }).click()
    // Mode should still be stealth
    await expect(page.locator('body')).toHaveAttribute('data-mode', 'stealth')
    await expect(page.getByRole('button', { name: /stealth/i })).toHaveAttribute('aria-pressed', 'true')
  })

  // ── Search filter (golden path 1 continuation) ──────────────────────────

  test('search bar filters condition text within the current phase', async ({ page }) => {
    // Catan Setup has a strategy: condition = "Choosing 1st settlement spot"
    const search = page.getByPlaceholder('Filter strategies…')
    await search.fill('settlement')
    // The matching condition is visible; others are filtered out.
    await expect(page.getByRole('button', { name: /1st settlement spot/i })).toBeVisible()
    // A condition that doesn't contain "settlement" should not be visible.
    await expect(page.getByRole('button', { name: /port available/i })).not.toBeVisible()
  })

  test('clearing search restores all phase strategies', async ({ page }) => {
    const search = page.getByPlaceholder('Filter strategies…')
    await search.fill('settlement')
    await expect(page.getByRole('button', { name: /port available/i })).not.toBeVisible()
    await search.clear()
    await expect(page.getByRole('button', { name: /port available/i })).toBeVisible()
  })

  // ── Context filter (golden path 3) ──────────────────────────────────────

  test.describe('context filter — Catan "leading/trailing"', () => {
    test.beforeEach(async ({ page }) => {
      // Switch to Early Game which has context-filtered strategies.
      await page.getByRole('navigation', { name: 'Game phases' }).getByRole('button', { name: 'Early Game' }).click()
      await expect(page.locator('[data-condition-toggle]').first()).toBeVisible()
    })

    test('unfiltered shows all context-matching strategies', async ({ page }) => {
      // Early Game: 3 null + 1 leading + 1 trailing = 5 total
      await expect(page.locator('[data-condition-toggle]')).toHaveCount(5)
    })

    test('"Yes" filter hides trailing-only strategies', async ({ page }) => {
      await page.getByRole('button', { name: 'Yes' }).click()
      await expect(page.getByRole('button', { name: 'Yes' })).toHaveAttribute('aria-pressed', 'true')
      // null(3) + leading(1) = 4 strategies visible
      await expect(page.locator('[data-condition-toggle]')).toHaveCount(4)
    })

    test('"No" filter hides leading-only strategies', async ({ page }) => {
      await page.getByRole('button', { name: 'No' }).click()
      await expect(page.getByRole('button', { name: 'No' })).toHaveAttribute('aria-pressed', 'true')
      // null(3) + trailing(1) = 4 strategies visible
      await expect(page.locator('[data-condition-toggle]')).toHaveCount(4)
    })

    test('toggling an active filter button back to null restores full list', async ({ page }) => {
      await page.getByRole('button', { name: 'Yes' }).click()
      await expect(page.locator('[data-condition-toggle]')).toHaveCount(4)
      // Clicking the active "Yes" again clears the filter
      await page.getByRole('button', { name: 'Yes' }).click()
      await expect(page.getByRole('button', { name: 'Yes' })).toHaveAttribute('aria-pressed', 'false')
      await expect(page.locator('[data-condition-toggle]')).toHaveCount(5)
    })
  })

  // ── Navigation ───────────────────────────────────────────────────────────

  test('back button navigates to pre-game dashboard', async ({ page }) => {
    await page.getByLabel('Back to pre-game dashboard').click()
    await expect(page).toHaveURL('/game/catan')
  })
})

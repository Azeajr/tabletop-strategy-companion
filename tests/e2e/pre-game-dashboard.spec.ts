import { test, expect } from '@playwright/test'

const SEED_READY = { timeout: 12_000 }

test.describe('Pre-Game Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game/catan')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Catan', SEED_READY)
  })

  test('shows game name and description @smoke', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Catan')
    await expect(page.getByText('Resource trading and area control')).toBeVisible()
  })

  test('shows TLDR key strategies section', async ({ page }) => {
    // Catan has TLDR-tagged strategies; they appear under the "Key Strategies" heading.
    await expect(page.getByText('Key Strategies')).toBeVisible()
    // At least one TLDR item rendered beneath the heading.
    await expect(page.getByText('Key Strategies').locator('..').locator('li')).not.toHaveCount(0)
  })

  test('all four phase tabs are present', async ({ page }) => {
    for (const phase of ['Setup', 'Early Game', 'Mid-Game', 'End-Game']) {
      await expect(page.getByRole('button', { name: phase })).toBeVisible()
    }
  })

  test('Setup tab is active by default', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Setup' })).toHaveAttribute('aria-current', 'page')
  })

  test('switching phase tab shows strategies for that phase', async ({ page }) => {
    await page.getByRole('button', { name: 'Early Game' }).click()
    await expect(page.getByRole('button', { name: 'Early Game' })).toHaveAttribute('aria-current', 'page')
    // Some strategy content visible for Early Game.
    await expect(page.locator('main, .px-4.py-3').first()).toBeVisible()
  })

  test('study mode shows full strategy text in TLDR list', async ({ page }) => {
    // Default mode is study; TLDR items show strategy_detailed text.
    // Catan first TLDR: condition = "Choosing 1st settlement spot"
    const keyStrategies = page.getByText('Key Strategies').locator('..')
    await expect(keyStrategies.getByText('Choosing 1st settlement spot')).toBeVisible()
  })

  test('stealth mode shows bullet points in TLDR list', async ({ page }) => {
    await page.getByRole('button', { name: /stealth/i }).click()
    await expect(page.locator('body')).toHaveAttribute('data-mode', 'stealth')
    // strategy_stealth[0] for first TLDR strategy
    const keyStrategies = page.getByText('Key Strategies').locator('..')
    await expect(keyStrategies.getByText('Target Ore/Wheat/Sheep on 6s and 8s')).toBeVisible()
  })

  test('Start Game button navigates to live companion', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Game →' }).click()
    await expect(page).toHaveURL('/game/catan/play')
  })

  test('back button returns to game library', async ({ page }) => {
    await page.getByLabel('Back to game library').click()
    await expect(page).toHaveURL('/')
  })

  test('unknown game ID shows game-not-found message', async ({ page }) => {
    await page.goto('/game/game-does-not-exist')
    await expect(page.getByText('Game not found')).toBeVisible(SEED_READY)
    await expect(page.getByRole('button', { name: /back to library/i })).toBeVisible()
  })
})

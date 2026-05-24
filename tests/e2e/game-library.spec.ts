import { test, expect } from '@playwright/test'

// Generous timeout for first SQLite WASM init + seed load
const SEED_READY = { timeout: 12_000 }

test.describe('Game Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Block until seed data is visible — implies WASM init + DB seed complete.
    await expect(page.getByRole('link', { name: 'Catan' })).toBeVisible(SEED_READY)
  })

  test('shows multiple seeded games on load @smoke', async ({ page }) => {
    // Spot-check three games from different seed files to confirm all seeds loaded.
    await expect(page.getByRole('link', { name: 'Catan' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Risk' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pandemic' })).toBeVisible()
  })

  test('search filters games by name', async ({ page }) => {
    await page.getByPlaceholder('Search games…').fill('Catan')
    await expect(page.getByRole('link', { name: 'Catan' })).toBeVisible()
    // A game whose name doesn't contain "Catan" should disappear.
    await expect(page.getByRole('link', { name: 'Risk' })).not.toBeVisible()
  })

  test('search filters games by description text', async ({ page }) => {
    // Catan description: "Resource trading and area control, 3-4 players."
    await page.getByPlaceholder('Search games…').fill('trading')
    await expect(page.getByRole('link', { name: 'Catan' })).toBeVisible()
    // Risk description doesn't mention "trading" — should be hidden.
    await expect(page.getByRole('link', { name: 'Risk' })).not.toBeVisible()
  })

  test('shows no-match message for unrecognized query', async ({ page }) => {
    await page.getByPlaceholder('Search games…').fill('xyzzy_no_match_zzz')
    await expect(page.getByText('No games match your search')).toBeVisible()
    // All game cards should be gone.
    await expect(page.getByRole('link', { name: 'Catan' })).not.toBeVisible()
  })

  test('clearing search restores the full game list', async ({ page }) => {
    const search = page.getByPlaceholder('Search games…')
    await search.fill('Catan')
    await expect(page.getByRole('link', { name: 'Risk' })).not.toBeVisible()
    await search.clear()
    await expect(page.getByRole('link', { name: 'Risk' })).toBeVisible()
  })

  test('clicking a game card navigates to its pre-game dashboard', async ({ page }) => {
    await page.getByRole('link', { name: 'Catan' }).click()
    await expect(page).toHaveURL('/game/catan')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Catan')
  })
})

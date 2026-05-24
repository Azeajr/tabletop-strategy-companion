/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { seedsReady, runSeedInit } from './seed'
import { db } from './index'
import { __resetForTest } from './sqlite-test-client'

beforeEach(async () => {
  // Drain the module-level seedsReady before wiping — prevents a race where
  // the background seed and the explicit runSeedInit in the test body both
  // try to INSERT into strategies concurrently.
  await seedsReady
  await __resetForTest()
})

// ── basic seeding ──────────────────────────────────────────────────────────

describe('runSeedInit()', () => {
  it('populates games from all seed files', async () => {
    await runSeedInit(db)
    const games = await db.getAllGames()
    expect(games.length).toBeGreaterThan(0)
  })

  it('every loaded game has at least one strategy', async () => {
    await runSeedInit(db)
    const games = await db.getAllGames()
    for (const game of games) {
      const strats = await db.getStrategies(game.game_id)
      expect(strats.length, `${game.game_name} has no strategies after seed`).toBeGreaterThan(0)
    }
  })

  it('writes correct seed_version to meta', async () => {
    await runSeedInit(db)
    const meta = await db.meta.where('key').equals('seed_version').first()
    expect(meta?.value).toBeTruthy()
    expect(typeof meta?.value).toBe('string')
  })

  // ── idempotency ───────────────────────────────────────────────────────────

  it('is a no-op on second call when version is unchanged', async () => {
    await runSeedInit(db)
    const games = await db.getAllGames()
    const firstGame = games[0]

    // Inject a canary strategy outside the normal seed data
    await db.strategies.add({
      game_id: firstGame.game_id,
      phase: 'Setup',
      category: '_Canary',
      condition: 'Canary row confirming no re-seed happened in idempotency test',
      strategy_detailed: 'This row must survive the second runSeedInit if caching works.',
      strategy_stealth: [],
      tags: [],
      context: null,
    })

    await runSeedInit(db) // same version — should return early

    const canary = await db.strategies
      .where('condition')
      .equals('Canary row confirming no re-seed happened in idempotency test')
      .first()
    expect(canary, 'canary was deleted — runSeedInit re-seeded when it should not have').toBeDefined()
  })

  // ── stale version re-seed ─────────────────────────────────────────────────

  it('deletes stale strategies and re-inserts on version change', async () => {
    await runSeedInit(db)
    const games = await db.getAllGames()
    const firstGame = games[0]
    const initialCount = (await db.getStrategies(firstGame.game_id)).length

    // Force a version mismatch so the next call re-seeds
    await db.meta.put({ key: 'seed_version', value: 'stale-version-xyz' })

    // Inject a canary that re-seeding should wipe
    await db.strategies.add({
      game_id: firstGame.game_id,
      phase: 'Setup',
      category: '_Stale',
      condition: 'Stale canary row that re-seed must delete in the version change test',
      strategy_detailed: 'This row should not survive the re-seed triggered by version mismatch.',
      strategy_stealth: [],
      tags: [],
      context: null,
    })

    await runSeedInit(db) // version mismatch → full re-seed

    const canary = await db.strategies
      .where('condition')
      .equals('Stale canary row that re-seed must delete in the version change test')
      .first()
    expect(canary).toBeUndefined()

    // Strategy count is restored to exactly what the seed file defines
    const restoredCount = (await db.getStrategies(firstGame.game_id)).length
    expect(restoredCount).toBe(initialCount)
  })
})

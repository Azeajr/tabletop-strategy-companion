/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './index'
import { __resetForTest } from './sqlite-test-client'
import type { Game, Strategy } from '../types/domain'

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    game_id: 'test-game',
    game_name: 'Test Game',
    game_description: 'A game used in the TabletopDB test suite here',
    filter_1_label: null,
    filter_1_yes_context: null,
    filter_1_no_context: null,
    filter_2_label: null,
    filter_2_yes_context: null,
    filter_2_no_context: null,
    ...overrides,
  }
}

function makeStrategy(overrides: Partial<Omit<Strategy, 'id'>> = {}): Omit<Strategy, 'id'> {
  return {
    game_id: 'test-game',
    phase: 'Setup',
    category: 'Opening',
    condition: 'When you start and resources are adjacent to each other',
    strategy_detailed: 'Place settlements adjacent to multiple resource types for flex.',
    strategy_stealth: ['Adjacent resources', 'Diverse output'],
    tags: ['TLDR'],
    context: null,
    ...overrides,
  }
}

beforeEach(async () => {
  await __resetForTest()
})

// ── getGame() ──────────────────────────────────────────────────────────────

describe('getGame()', () => {
  it('returns null for a missing game_id', async () => {
    expect(await db.getGame('nonexistent-id')).toBeNull()
  })

  it('returns the correct game when present', async () => {
    await db.upsertGame(makeGame({ game_id: 'chess', game_name: 'Chess' }))
    const result = await db.getGame('chess')
    expect(result?.game_name).toBe('Chess')
  })

  it('scopes to exact game_id — does not return partial matches', async () => {
    await db.upsertGame(makeGame({ game_id: 'catan', game_name: 'Catan' }))
    expect(await db.getGame('cat')).toBeNull()
    expect(await db.getGame('catan-plus')).toBeNull()
  })
})

// ── getAllGames() ───────────────────────────────────────────────────────────

describe('getAllGames()', () => {
  it('returns empty array when no games exist', async () => {
    expect(await db.getAllGames()).toEqual([])
  })

  it('returns games sorted alphabetically by game_name', async () => {
    await db.upsertGame(makeGame({ game_id: 'z', game_name: 'Zebra' }))
    await db.upsertGame(makeGame({ game_id: 'a', game_name: 'Alpha' }))
    await db.upsertGame(makeGame({ game_id: 'm', game_name: 'Mango' }))
    const names = (await db.getAllGames()).map((g) => g.game_name)
    expect(names).toEqual(['Alpha', 'Mango', 'Zebra'])
  })

  it('returns all inserted games', async () => {
    await db.upsertGame(makeGame({ game_id: 'g1', game_name: 'A' }))
    await db.upsertGame(makeGame({ game_id: 'g2', game_name: 'B' }))
    expect(await db.getAllGames()).toHaveLength(2)
  })
})

// ── getStrategies() ────────────────────────────────────────────────────────

describe('getStrategies()', () => {
  it('returns empty array for an unknown game', async () => {
    expect(await db.getStrategies('ghost-game')).toEqual([])
  })

  it('returns only strategies for the requested game', async () => {
    await db.upsertGame(makeGame({ game_id: 'game-a', game_name: 'Game A' }))
    await db.upsertGame(makeGame({ game_id: 'game-b', game_name: 'Game B' }))
    await db.upsertStrategies([
      makeStrategy({ game_id: 'game-a', condition: 'Condition exclusive to game A here' }),
      makeStrategy({ game_id: 'game-b', condition: 'Condition exclusive to game B here' }),
    ])
    const forA = await db.getStrategies('game-a')
    expect(forA).toHaveLength(1)
    expect(forA[0].condition).toBe('Condition exclusive to game A here')
    expect(forA[0].game_id).toBe('game-a')
  })

  it('round-trips JSON fields (strategy_stealth, tags) through the DB', async () => {
    await db.upsertGame(makeGame())
    await db.upsertStrategies([makeStrategy({
      strategy_stealth: ['Stealth alpha', 'Stealth beta'],
      tags: ['Offense', 'Economy'],
    })])
    const [row] = await db.getStrategies('test-game')
    expect(row.strategy_stealth).toEqual(['Stealth alpha', 'Stealth beta'])
    expect(row.tags).toEqual(['Offense', 'Economy'])
  })

  it('preserves null context field', async () => {
    await db.upsertGame(makeGame())
    await db.upsertStrategies([makeStrategy({ context: null })])
    const [row] = await db.getStrategies('test-game')
    expect(row.context).toBeNull()
  })

  it('preserves non-null context field', async () => {
    await db.upsertGame(makeGame())
    await db.upsertStrategies([makeStrategy({ context: 'leading' })])
    const [row] = await db.getStrategies('test-game')
    expect(row.context).toBe('leading')
  })
})

// ── upsertGame() ───────────────────────────────────────────────────────────

describe('upsertGame()', () => {
  it('creates a game on first call', async () => {
    await db.upsertGame(makeGame({ game_id: 'new-game', game_name: 'New Game' }))
    expect(await db.getGame('new-game')).not.toBeNull()
  })

  it('updates the game on second call with the same game_id', async () => {
    const g = makeGame({ game_id: 'upd', game_name: 'Original Name' })
    await db.upsertGame(g)
    await db.upsertGame({ ...g, game_name: 'Updated Name' })
    expect(await db.getAllGames()).toHaveLength(1)
    expect((await db.getGame('upd'))?.game_name).toBe('Updated Name')
  })

  it('stores filter labels and context strings', async () => {
    await db.upsertGame(makeGame({
      filter_1_label: 'Are you winning?',
      filter_1_yes_context: 'winning',
      filter_1_no_context: 'losing',
    }))
    const row = await db.getGame('test-game')
    expect(row?.filter_1_label).toBe('Are you winning?')
    expect(row?.filter_1_yes_context).toBe('winning')
    expect(row?.filter_1_no_context).toBe('losing')
  })
})

// ── upsertStrategies() ─────────────────────────────────────────────────────

describe('upsertStrategies()', () => {
  it('inserts multiple strategies in one call', async () => {
    await db.upsertGame(makeGame())
    await db.upsertStrategies([
      makeStrategy({ condition: 'First strategy condition here' }),
      makeStrategy({ condition: 'Second strategy condition here' }),
    ])
    expect(await db.getStrategies('test-game')).toHaveLength(2)
  })

  it('no-ops cleanly on empty input', async () => {
    await db.upsertGame(makeGame())
    await expect(db.upsertStrategies([])).resolves.toBeUndefined()
    expect(await db.getStrategies('test-game')).toHaveLength(0)
  })
})

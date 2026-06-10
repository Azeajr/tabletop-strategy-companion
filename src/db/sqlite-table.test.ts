/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { SQLiteTable } from './sqlite-table'
import { __resetForTest } from './sqlite-test-client'
import type { Game, Strategy } from '../types/domain'

const games = new SQLiteTable<Game>('games')
const strategies = new SQLiteTable<Strategy>('strategies', {
  jsonFields: ['strategy_stealth', 'tags'],
})

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    game_id: 'test-game',
    game_name: 'Test Game',
    game_description: 'A game used to exercise the ORM layer in tests',
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
    condition: 'Default condition text for the ORM test suite',
    strategy_detailed: 'Default detailed strategy text to satisfy the ORM test layer here.',
    strategy_stealth: ['Tip one here', 'Tip two here'],
    tags: ['TLDR'],
    context: null,
    ...overrides,
  }
}

beforeEach(async () => {
  await __resetForTest()
})

// ── add() ──────────────────────────────────────────────────────────────────

describe('add()', () => {
  it('inserts row and returns a positive rowid', async () => {
    await games.put(makeGame())
    const id = await strategies.add(makeStrategy())
    expect(id).toBeGreaterThan(0)
  })

  it('sequential inserts produce distinct ids', async () => {
    await games.put(makeGame())
    const id1 = await strategies.add(makeStrategy({ condition: 'Condition alpha here' }))
    const id2 = await strategies.add(makeStrategy({ condition: 'Condition beta here' }))
    expect(id1).not.toBe(id2)
  })
})

// ── get() ──────────────────────────────────────────────────────────────────

describe('get()', () => {
  it('retrieves inserted row by id', async () => {
    await games.put(makeGame())
    const id = await strategies.add(makeStrategy({ condition: 'Retrieve me please' }))
    const row = await strategies.get(id)
    expect(row?.condition).toBe('Retrieve me please')
  })

  it('returns undefined for nonexistent id', async () => {
    expect(await strategies.get(99999)).toBeUndefined()
  })
})

// ── put() — upsert ─────────────────────────────────────────────────────────

describe('put()', () => {
  it('inserts a new row', async () => {
    await games.put(makeGame({ game_id: 'fresh', game_name: 'Fresh Game' }))
    const row = await games.where('game_id').equals('fresh').first()
    expect(row?.game_name).toBe('Fresh Game')
  })

  it('replaces on primary key conflict', async () => {
    const g = makeGame({ game_id: 'upsert', game_name: 'Original' })
    await games.put(g)
    await games.put({ ...g, game_name: 'Replaced' })
    expect(await games.count()).toBe(1)
    const row = await games.where('game_id').equals('upsert').first()
    expect(row?.game_name).toBe('Replaced')
  })
})

// ── delete(id) ─────────────────────────────────────────────────────────────

describe('delete(id)', () => {
  it('removes the row', async () => {
    await games.put(makeGame())
    const id = await strategies.add(makeStrategy())
    await strategies.delete(id)
    expect(await strategies.get(id)).toBeUndefined()
  })

  it('no-op on nonexistent id', async () => {
    await expect(strategies.delete(99999)).resolves.toBeUndefined()
  })
})

// ── count() ────────────────────────────────────────────────────────────────

describe('count()', () => {
  it('returns 0 for empty table', async () => {
    expect(await strategies.count()).toBe(0)
  })

  it('reflects inserted rows', async () => {
    await games.put(makeGame())
    await strategies.add(makeStrategy({ condition: 'Row one here' }))
    await strategies.add(makeStrategy({ condition: 'Row two here' }))
    expect(await strategies.count()).toBe(2)
  })
})

// ── clear() ────────────────────────────────────────────────────────────────

describe('clear()', () => {
  it('empties the table', async () => {
    await games.put(makeGame())
    await strategies.add(makeStrategy())
    await strategies.clear()
    expect(await strategies.count()).toBe(0)
  })
})

// ── toArray() ──────────────────────────────────────────────────────────────

describe('toArray()', () => {
  it('returns all rows', async () => {
    await games.put(makeGame({ game_id: 'g1', game_name: 'Game One' }))
    await games.put(makeGame({ game_id: 'g2', game_name: 'Game Two' }))
    expect(await games.toArray()).toHaveLength(2)
  })

  it('returns empty array for empty table', async () => {
    expect(await strategies.toArray()).toEqual([])
  })
})

// ── where().equals() ───────────────────────────────────────────────────────

describe('where().equals()', () => {
  it('returns only matching rows', async () => {
    await games.put(makeGame({ game_id: 'g1', game_name: 'Alpha' }))
    await games.put(makeGame({ game_id: 'g2', game_name: 'Beta' }))
    const result = await games.where('game_id').equals('g1').toArray()
    expect(result).toHaveLength(1)
    expect(result[0].game_name).toBe('Alpha')
  })

  it('returns empty when no match', async () => {
    expect(await games.where('game_id').equals('ghost').toArray()).toEqual([])
  })
})

// ── orderBy() ──────────────────────────────────────────────────────────────

describe('orderBy()', () => {
  it('sorts ascending by default', async () => {
    await games.put(makeGame({ game_id: 'g1', game_name: 'Zebra' }))
    await games.put(makeGame({ game_id: 'g2', game_name: 'Alpha' }))
    const names = (await games.orderBy('game_name').toArray()).map((g) => g.game_name)
    expect(names).toEqual(['Alpha', 'Zebra'])
  })

  it('sorts descending when desc=true', async () => {
    await games.put(makeGame({ game_id: 'g1', game_name: 'Alpha' }))
    await games.put(makeGame({ game_id: 'g2', game_name: 'Zebra' }))
    const names = (await games.orderBy('game_name', true).toArray()).map((g) => g.game_name)
    expect(names).toEqual(['Zebra', 'Alpha'])
  })
})

// ── first() ────────────────────────────────────────────────────────────────

describe('Query.first()', () => {
  it('returns first matching row', async () => {
    await games.put(makeGame({ game_id: 'g1', game_name: 'Alpha' }))
    await games.put(makeGame({ game_id: 'g2', game_name: 'Beta' }))
    const row = await games.where('game_id').equals('g2').first()
    expect(row?.game_name).toBe('Beta')
  })

  it('returns undefined when no match', async () => {
    expect(await games.where('game_id').equals('ghost').first()).toBeUndefined()
  })
})

// ── JSON field round-trip ──────────────────────────────────────────────────

describe('JSON field round-trip', () => {
  it('serializes and deserializes arrays', async () => {
    await games.put(makeGame())
    const id = await strategies.add(makeStrategy({
      strategy_stealth: ['Tip alpha', 'Tip beta', 'Tip gamma'],
      tags: ['TLDR', 'Offense'],
    }))
    const row = await strategies.get(id)
    expect(row?.strategy_stealth).toEqual(['Tip alpha', 'Tip beta', 'Tip gamma'])
    expect(row?.tags).toEqual(['TLDR', 'Offense'])
  })

  it('round-trips empty arrays', async () => {
    await games.put(makeGame())
    const id = await strategies.add(makeStrategy({ strategy_stealth: [], tags: [] }))
    const row = await strategies.get(id)
    expect(row?.strategy_stealth).toEqual([])
    expect(row?.tags).toEqual([])
  })
})

// ── bulkAdd() ──────────────────────────────────────────────────────────────

describe('bulkAdd()', () => {
  it('inserts all items', async () => {
    await games.put(makeGame())
    await strategies.bulkAdd([
      makeStrategy({ condition: 'Bulk item one here' }),
      makeStrategy({ condition: 'Bulk item two here' }),
      makeStrategy({ condition: 'Bulk item three here' }),
    ])
    expect(await strategies.count()).toBe(3)
  })

  it('rolls back entire batch on unique constraint failure', async () => {
    await games.put(makeGame())
    const dup = makeStrategy({ condition: 'Duplicate entry causes rollback' })
    await expect(strategies.bulkAdd([dup, dup])).rejects.toThrow()
    expect(await strategies.count()).toBe(0)
  })
})

// ── transaction() rollback ─────────────────────────────────────────────────

describe('transaction()', () => {
  it('rolls back all changes on error', async () => {
    await games.put(makeGame())
    await expect(
      strategies.transaction(async () => {
        await strategies.add(makeStrategy({ condition: 'This will be rolled back' }))
        throw new Error('Simulated failure mid-transaction')
      }),
    ).rejects.toThrow('Simulated failure mid-transaction')
    expect(await strategies.count()).toBe(0)
  })
})

// ── SQL identifier injection guard ─────────────────────────────────────────

describe('SQL identifier injection guard', () => {
  it('rejects identifiers with spaces', () => {
    expect(() => games.where('game name')).toThrow('Invalid SQL identifier')
  })

  it('rejects semicolons and comment sequences', () => {
    expect(() => games.where('1; DROP TABLE games--')).toThrow('Invalid SQL identifier')
  })

  it('rejects identifiers starting with a digit', () => {
    expect(() => games.where('1col')).toThrow('Invalid SQL identifier')
  })

  it('accepts valid snake_case identifiers', () => {
    expect(() => games.where('game_id')).not.toThrow()
    expect(() => games.where('game_name')).not.toThrow()
    expect(() => games.orderBy('game_name')).not.toThrow()
  })
})

// ── Query.where().delete() ─────────────────────────────────────────────────

describe('Query.where().delete()', () => {
  it('deletes only rows matching the where clause', async () => {
    await games.put(makeGame({ game_id: 'del', game_name: 'Delete Me' }))
    await games.put(makeGame({ game_id: 'keep', game_name: 'Keep Me' }))
    await games.where('game_id').equals('del').delete()
    expect(await games.count()).toBe(1)
    expect(await games.where('game_id').equals('keep').first()).toBeDefined()
  })

  it('no-op when where clause matches nothing', async () => {
    await games.put(makeGame())
    await games.where('game_id').equals('ghost').delete()
    expect(await games.count()).toBe(1)
  })
})

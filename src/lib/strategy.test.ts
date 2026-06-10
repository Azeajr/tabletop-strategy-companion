import { describe, it, expect } from 'vitest'
import {
  filterByContext,
  groupByCategory,
  hoistTLDR,
  prepareStrategies,
  resolveFilterContexts,
} from './strategy'
import type { Strategy } from '../types/domain'

function makeStrategy(overrides: Partial<Strategy> = {}): Strategy {
  return {
    id: 1,
    game_id: 'test',
    phase: 'Setup',
    category: 'Cat A',
    condition: 'Some condition',
    strategy_detailed: 'Detailed advice here with enough characters.',
    strategy_stealth: ['Do this'],
    tags: [],
    context: null,
    ...overrides,
  }
}

describe('resolveFilterContexts', () => {
  it('returns nothing when the game has no such filter', () => {
    expect(resolveFilterContexts(null, 'leading', 'trailing', 'yes')).toEqual([])
  })

  it('unset filter includes both sides so nothing is hidden', () => {
    expect(resolveFilterContexts('Leading?', 'leading', 'trailing', null)).toEqual([
      'leading',
      'trailing',
    ])
  })

  it('set filter includes only the matching side, dropping a null context', () => {
    expect(resolveFilterContexts('Leading?', 'leading', 'trailing', 'yes')).toEqual(['leading'])
    expect(resolveFilterContexts('Leading?', 'leading', 'trailing', 'no')).toEqual(['trailing'])
    expect(resolveFilterContexts('Leading?', null, 'trailing', 'yes')).toEqual([])
  })
})

describe('filterByContext', () => {
  it('always includes context=null strategies', () => {
    const s = makeStrategy({ context: null })
    expect(filterByContext([s], [])).toHaveLength(1)
    expect(filterByContext([s], ['leading'])).toHaveLength(1)
  })

  it('includes context strategies when context is active', () => {
    const s = makeStrategy({ context: 'leading' })
    expect(filterByContext([s], ['leading'])).toHaveLength(1)
    expect(filterByContext([s], ['trailing'])).toHaveLength(0)
    expect(filterByContext([s], [])).toHaveLength(0)
  })
})

describe('groupByCategory', () => {
  it('groups by category preserving order', () => {
    const s1 = makeStrategy({ category: 'Alpha' })
    const s2 = makeStrategy({ category: 'Beta' })
    const s3 = makeStrategy({ category: 'Alpha', condition: 'Another' })
    const result = groupByCategory([s1, s2, s3])
    expect([...result.keys()]).toEqual(['Alpha', 'Beta'])
    expect(result.get('Alpha')).toHaveLength(2)
  })
})

describe('hoistTLDR', () => {
  it('TLDR strategies come first', () => {
    const normal = makeStrategy({ condition: 'Normal', tags: [] })
    const tldr = makeStrategy({ condition: 'TLDR one', tags: ['TLDR'] })
    const result = hoistTLDR([normal, tldr])
    expect(result[0].tags).toContain('TLDR')
    expect(result[1].tags).not.toContain('TLDR')
  })
})

describe('prepareStrategies', () => {
  it('categories are alphabetically sorted', () => {
    const strats = [
      makeStrategy({ category: 'Zebra', condition: 'Z cond' }),
      makeStrategy({ category: 'Apple', condition: 'A cond' }),
      makeStrategy({ category: 'Mango', condition: 'M cond' }),
    ]
    const result = prepareStrategies(strats)
    expect([...result.keys()]).toEqual(['Apple', 'Mango', 'Zebra'])
  })

  it('displays only what it receives — context filtering is caller responsibility', () => {
    const leading = makeStrategy({ context: 'leading', category: 'X' })
    const always = makeStrategy({ context: null, category: 'X' })
    // Caller pre-filters via filterByContext; only the null-context strategy is passed
    const preFiltered = filterByContext([leading, always], ['trailing'])
    const result = prepareStrategies(preFiltered)
    expect(result.get('X')).toHaveLength(1)
    expect(result.get('X')![0].context).toBeNull()
  })

  it('TLDR hoisted within category', () => {
    const normal = makeStrategy({ category: 'X', condition: 'B', tags: [] })
    const tldr = makeStrategy({ category: 'X', condition: 'A', tags: ['TLDR'] })
    const result = prepareStrategies([normal, tldr])
    const items = result.get('X')!
    expect(items[0].tags).toContain('TLDR')
  })
})

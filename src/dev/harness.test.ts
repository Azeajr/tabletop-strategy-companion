/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { seedsReady, runSeedInit } from '../db/seed'
import { db } from '../db/index'
import { __resetForTest } from '../db/sqlite-test-client'
import { harnessSnapshot, installHarnessAccessor, readOnlyQuery } from './harness'
import { toggleAppMode } from '../store/appState'

beforeEach(async () => {
  await seedsReady
  await __resetForTest()
})

describe('harnessSnapshot', () => {
  it('rejects unknown sections before reading anything', async () => {
    const query = vi.fn()
    await expect(harnessSnapshot(['mode', 'apiKey'], query)).rejects.toThrow(/apiKey/)
    expect(query).not.toHaveBeenCalled()
  })

  it('reports an empty database before seeding and the seed after it', async () => {
    expect(await harnessSnapshot(['seed', 'counts'])).toEqual({
      seed: { version: null },
      counts: { games: 0, strategies: 0 },
    })
    await runSeedInit(db)
    const seeded = await harnessSnapshot(['seed', 'counts'])
    expect((seeded.seed as { version: string }).version).toMatch(/^[0-9a-f]+$/)
    expect((seeded.counts as { games: number }).games).toBeGreaterThan(0)
  })

  it('follows the display mode', async () => {
    const before = (await harnessSnapshot(['mode'])).mode
    toggleAppMode()
    expect((await harnessSnapshot(['mode'])).mode).not.toBe(before)
    toggleAppMode()
  })

  it('only reads', () => {
    expect(() => readOnlyQuery('DELETE FROM games')).toThrow(/only reads/)
  })

  it('installs a snapshot-only accessor', () => {
    const target = {} as Window & { __harness?: object }
    installHarnessAccessor(target)
    expect(Object.keys(target.__harness ?? {})).toEqual(['snapshot'])
  })
})

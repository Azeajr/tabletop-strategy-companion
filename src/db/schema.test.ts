/**
 * @vitest-environment node
 */
import { test, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { GameSeedSchema } from './schema'

test('all seed files pass Zod schema validation', () => {
  const seedDir = join(process.cwd(), 'data/seeds')
  if (!existsSync(seedDir)) return

  const files = readdirSync(seedDir).filter((f) => f.endsWith('.json'))
  expect(files.length, 'no seed files found').toBeGreaterThan(0)

  for (const file of files) {
    const raw = JSON.parse(readFileSync(join(seedDir, file), 'utf8'))
    const result = GameSeedSchema.safeParse(raw)
    expect(result.success, `${file}: ${JSON.stringify(!result.success && result.error.flatten())}`).toBe(true)
    if (result.success) {
      expect(result.data.strategies.length, `${file} has no strategies`).toBeGreaterThan(0)
    }
  }
})

// Cross-field integrity the Zod schema cannot express. Violations are silent
// at runtime: a strategy in an undeclared phase has no tab to appear under,
// and a context not declared by any filter can never enter activeContexts —
// both render the strategy permanently invisible.
test('every strategy references a declared phase and filter context', () => {
  const seedDir = join(process.cwd(), 'data/seeds')
  if (!existsSync(seedDir)) return

  for (const file of readdirSync(seedDir).filter((f) => f.endsWith('.json'))) {
    const seed = GameSeedSchema.parse(JSON.parse(readFileSync(join(seedDir, file), 'utf8')))
    const phases = new Set(seed.phases)
    const contexts = new Set(
      [
        seed.filter_1_yes_context,
        seed.filter_1_no_context,
        seed.filter_2_yes_context,
        seed.filter_2_no_context,
      ].filter((c): c is string => c !== null),
    )
    for (const s of seed.strategies) {
      expect(phases.has(s.phase), `${file}: "${s.condition}" uses undeclared phase "${s.phase}"`).toBe(true)
      if (s.context !== null) {
        expect(contexts.has(s.context), `${file}: "${s.condition}" uses undeclared context "${s.context}"`).toBe(true)
      }
    }
  }
})

// The strategies table has a UNIQUE index on (game_id, phase, category,
// condition). A duplicate in a seed file passes Zod but makes runSeedInit
// throw at boot — which breaks EVERY game, not just the bad seed.
test('no seed contains duplicate (phase, category, condition) strategies', () => {
  const seedDir = join(process.cwd(), 'data/seeds')
  if (!existsSync(seedDir)) return

  for (const file of readdirSync(seedDir).filter((f) => f.endsWith('.json'))) {
    const seed = GameSeedSchema.parse(JSON.parse(readFileSync(join(seedDir, file), 'utf8')))
    const seen = new Set<string>()
    for (const s of seed.strategies) {
      const key = `${s.phase}|${s.category}|${s.condition}`
      expect(seen.has(key), `${file}: duplicate strategy "${key}"`).toBe(false)
      seen.add(key)
    }
  }
})

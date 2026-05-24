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

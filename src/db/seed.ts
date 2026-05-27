import { GameSeedSchema } from './schema'
import { db, dbReady } from './index'
import type { TabletopDBType } from './index'

// Vite bundles all seed files at build time — fully offline-capable.
// Each value is the parsed JSON default export.
const seedModules = import.meta.glob('/data/seeds/*.json', {
  eager: true,
  import: 'default',
})

// djb2 hash — deterministic version string from seed content
function computeVersion(seeds: unknown[]): string {
  const sorted = [...seeds as { game_id: string }[]].sort((a, b) =>
    a.game_id.localeCompare(b.game_id),
  )
  const str = JSON.stringify(sorted)
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (((hash << 5) + hash) ^ str.charCodeAt(i)) >>> 0
  }
  return hash.toString(16)
}

export async function runSeedInit(database: TabletopDBType): Promise<void> {
  const rawSeeds = Object.values(seedModules)
  if (rawSeeds.length === 0) return

  // Validate all seeds before touching the DB — fail loud, not silent
  const seeds = rawSeeds.map((raw) => GameSeedSchema.parse(raw))
  const version = computeVersion(seeds)

  const stored = await database.meta.where('key').equals('seed_version').first()
  if (stored?.value === version) return

  await database.transaction(async () => {
    for (const seed of seeds) {
      await database.upsertGame({
        game_id: seed.game_id,
        game_name: seed.game_name,
        game_description: seed.game_description,
        phases: seed.phases,
        filter_1_label: seed.filter_1_label,
        filter_1_yes_context: seed.filter_1_yes_context,
        filter_1_no_context: seed.filter_1_no_context,
        filter_2_label: seed.filter_2_label,
        filter_2_yes_context: seed.filter_2_yes_context,
        filter_2_no_context: seed.filter_2_no_context,
      })
      // Delete stale strategies then insert fresh ones
      await database.strategies.where('game_id').equals(seed.game_id).delete()
      await database.upsertStrategies(
        seed.strategies.map((s) => ({
          game_id: seed.game_id,
          phase: s.phase,
          category: s.category,
          condition: s.condition,
          strategy_detailed: s.strategy_detailed,
          strategy_stealth: s.strategy_stealth,
          tags: s.tags,
          context: s.context,
        })),
      )
    }
    await database.meta.put({ key: 'seed_version', value: version })
  })
}

// seedsReady resolves when DB is initialized AND seeds are loaded.
// Views await this before querying.
export const seedsReady: Promise<void> = dbReady.then(() => runSeedInit(db))

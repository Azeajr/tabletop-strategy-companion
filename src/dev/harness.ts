import { useAppMode } from '../store/appState'
import { sqliteClient } from '../db/sqlite-client'

/**
 * Read-only development accessor for the agent harness (`harness.config.mjs`
 * → `state.read`): the display mode, the seed the database holds, and row
 * counts, as a bounded summary instead of pixels.
 *
 * DEV builds only (index.tsx imports it behind `import.meta.env.DEV`), and the
 * production smoke fails if `__harness` reaches a bundle. SELECT only.
 */
export const HARNESS_SECTIONS = ['mode', 'seed', 'counts'] as const

type Row = Record<string, unknown>
export type Query = (sql: string) => Promise<Row[]>

export const readOnlyQuery: Query = (sql) => {
  if (!/^\s*select\b/i.test(sql)) throw new Error('The harness accessor only reads.')
  return sqliteClient.query<Row>(sql)
}

export async function harnessSnapshot(
  sections: readonly string[],
  query: Query = readOnlyQuery,
): Promise<Record<string, unknown>> {
  const unknown = sections.filter((section) => !(HARNESS_SECTIONS as readonly string[]).includes(section))
  if (unknown.length) throw new Error(`Unknown harness section(s): ${unknown.join(', ')}`)
  const out: Record<string, unknown> = {}
  if (sections.includes('mode')) out.mode = useAppMode()()
  if (sections.includes('seed')) {
    const [row] = await query(`SELECT value FROM meta WHERE key = 'seed_version'`)
    out.seed = { version: row?.value ?? null }
  }
  if (sections.includes('counts')) {
    const [row] = await query(
      'SELECT (SELECT COUNT(*) FROM games) AS games, (SELECT COUNT(*) FROM strategies) AS strategies',
    )
    out.counts = row ?? null
  }
  return out
}

export function installHarnessAccessor(target: Window = window): void {
  ;(target as Window & { __harness?: unknown }).__harness = { snapshot: harnessSnapshot }
}

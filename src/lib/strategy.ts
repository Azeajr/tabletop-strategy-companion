import type { Phase, Strategy, Tag } from '../types/domain'

// Phase display order per spec — never alphabetical.
export const PHASE_ORDER: Record<Phase, number> = {
  'Setup': 0,
  'Early Game': 1,
  'Mid-Game': 2,
  'End-Game': 3,
}

export const PHASES: Phase[] = ['Setup', 'Early Game', 'Mid-Game', 'End-Game']

export function comparePhase(a: Phase, b: Phase): number {
  return PHASE_ORDER[a] - PHASE_ORDER[b]
}

// A strategy with context=null is always visible.
// A strategy with a context value is visible only if that value is in activeContexts.
export function filterByContext(
  strategies: Strategy[],
  activeContexts: (string | null)[],
): Strategy[] {
  return strategies.filter(
    (s) => s.context === null || activeContexts.includes(s.context),
  )
}

// Group strategies by category, preserving insertion order of first encounter.
export function groupByCategory(strategies: Strategy[]): Map<string, Strategy[]> {
  const map = new Map<string, Strategy[]>()
  for (const s of strategies) {
    if (!map.has(s.category)) map.set(s.category, [])
    map.get(s.category)!.push(s)
  }
  return map
}

// Hoist TLDR-tagged entries to the top; preserve relative order within each tier.
export function hoistTLDR(strategies: Strategy[]): Strategy[] {
  const tldr = strategies.filter((s) => (s.tags as Tag[]).includes('TLDR'))
  const rest = strategies.filter((s) => !(s.tags as Tag[]).includes('TLDR'))
  return [...tldr, ...rest]
}

// Full pipeline: filter by context → group by category (alphabetical) →
// within each group: sort alphabetically by condition → hoist TLDR.
export function prepareStrategies(
  strategies: Strategy[],
  activeContexts: (string | null)[],
): Map<string, Strategy[]> {
  const filtered = filterByContext(strategies, activeContexts)

  // Sort by condition alphabetically so groups maintain deterministic order
  const byCond = [...filtered].sort((a, b) =>
    a.condition.localeCompare(b.condition),
  )

  // Group by category
  const grouped = groupByCategory(byCond)

  // Sort category keys alphabetically and hoist TLDR within each
  const sorted = new Map<string, Strategy[]>()
  for (const key of [...grouped.keys()].sort((a, b) => a.localeCompare(b))) {
    sorted.set(key, hoistTLDR(grouped.get(key)!))
  }

  return sorted
}

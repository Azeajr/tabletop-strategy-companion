import type { Strategy, Tag } from '../types/domain'

// Returns the context values a filter contributes to activeContexts.
// Filter unset (value=null) → both sides included, so nothing is hidden.
// Filter set → only the matching side's context.
export function resolveFilterContexts(
  label: string | null,
  yesContext: string | null,
  noContext: string | null,
  value: 'yes' | 'no' | null,
): string[] {
  if (!label) return []
  const sides = value === null ? [yesContext, noContext] : [value === 'yes' ? yesContext : noContext]
  return sides.filter((c): c is string => c !== null)
}

// A strategy with context=null is always visible.
// A strategy with a context value is visible only if that value is in activeContexts.
export function filterByContext(
  strategies: Strategy[],
  activeContexts: readonly string[],
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

// Group and sort already-filtered strategies: by category (alphabetical) →
// within each group: sort alphabetically by condition → hoist TLDR.
// Callers are responsible for context filtering before calling this.
export function prepareStrategies(strategies: Strategy[]): Map<string, Strategy[]> {
  const byCond = [...strategies].sort((a, b) => a.condition.localeCompare(b.condition))
  const grouped = groupByCategory(byCond)
  const result = new Map<string, Strategy[]>()
  for (const key of [...grouped.keys()].sort((a, b) => a.localeCompare(b))) {
    result.set(key, hoistTLDR(grouped.get(key)!))
  }
  return result
}

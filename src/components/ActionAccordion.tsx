import { createMemo, createSignal, For, Show } from 'solid-js'
import { useAppMode } from '../store/appState'
import { prepareStrategies } from '../lib/strategy'
import ConditionToggle from './ConditionToggle'
import type { Strategy } from '../types/domain'

interface Props {
  strategies: Strategy[]
  // Stealth-only. When false (default), a phase that has TLDR strategies
  // collapses to just those so the glance fits one screen (LiveCompanion is
  // overflow-hidden when collapsed); the show-all toggle reveals the rest with
  // scroll. A phase with no TLDRs falls back to showing all (it's within the
  // stealth row budget — see schema.test). No effect in study mode.
  showAll?: boolean
  onToggleShowAll?: () => void
}

export default function ActionAccordion(props: Props) {
  const [openId, setOpenId] = createSignal<string | null>(null)
  const mode = useAppMode()

  const tldrOnly = () => props.strategies.filter((s) => s.tags.includes('TLDR'))
  const collapsed = () =>
    mode() === 'stealth' && !props.showAll && tldrOnly().length > 0
  const visible = () => (collapsed() ? tldrOnly() : props.strategies)
  const hiddenCount = () => props.strategies.length - tldrOnly().length
  const canToggle = () =>
    mode() === 'stealth' && tldrOnly().length > 0 && hiddenCount() > 0

  const groups = createMemo(() => [...prepareStrategies(visible()).entries()])

  const toggle = (id: string) =>
    setOpenId((prev) => (prev === id ? null : id))

  return (
    <div>
      <Show
        when={groups().length > 0}
        fallback={
          <p class="px-4 py-8 text-sm text-[var(--muted)] text-center">
            No strategies for this phase and filter.
          </p>
        }
      >
        <For each={groups()}>
          {([category, strategies]) => (
            <section class="mb-2">
              <div class="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                {category}
              </div>
              <For each={strategies}>
                {(strategy) => {
                  // Unique per the DB index (game_id, phase, category, condition).
                  // Phase is included so an item opened in one phase does not
                  // render pre-expanded when the same category/condition pair
                  // exists in the phase the user switches to.
                  const id = `${strategy.phase}::${category}::${strategy.condition}`
                  return (
                    <ConditionToggle
                      condition={strategy.condition}
                      tags={strategy.tags}
                      isOpen={openId() === id}
                      onToggle={() => toggle(id)}
                    >
                      <Show
                        when={mode() === 'study'}
                        fallback={
                          <ul class="space-y-1 list-none m-0 p-0">
                            <For each={strategy.strategy_stealth}>
                              {(bullet) => (
                                <li class="flex gap-2">
                                  <span class="text-[var(--accent)] shrink-0">›</span>
                                  <span>{bullet}</span>
                                </li>
                              )}
                            </For>
                          </ul>
                        }
                      >
                        <p class="leading-relaxed m-0">{strategy.strategy_detailed}</p>
                      </Show>
                    </ConditionToggle>
                  )
                }}
              </For>
            </section>
          )}
        </For>
      </Show>

      <Show when={canToggle()}>
        <button
          onClick={() => props.onToggleShowAll?.()}
          class="w-full min-h-[44px] py-2 text-xs font-semibold text-[var(--accent)]"
        >
          {props.showAll ? 'Show key only' : `Show all (${hiddenCount()} more)`}
        </button>
      </Show>
    </div>
  )
}

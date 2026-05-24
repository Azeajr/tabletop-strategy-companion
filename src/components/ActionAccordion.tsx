import { createSignal, For, Show } from 'solid-js'
import { useAppMode } from '../store/appState'
import { prepareStrategies } from '../lib/strategy'
import ConditionToggle from './ConditionToggle'
import type { Strategy } from '../types/domain'

interface Props {
  strategies: Strategy[]
  activeContexts: (string | null)[]
}

export default function ActionAccordion(props: Props) {
  const [openId, setOpenId] = createSignal<string | null>(null)
  const mode = useAppMode()

  const grouped = () => prepareStrategies(props.strategies, props.activeContexts)

  const toggle = (id: string) =>
    setOpenId((prev) => (prev === id ? null : id))

  return (
    <div>
      <Show
        when={[...grouped().entries()].length > 0}
        fallback={
          <p class="px-4 py-8 text-sm text-[var(--muted)] text-center">
            No strategies for this phase and filter.
          </p>
        }
      >
        <For each={[...grouped().entries()]}>
          {([category, strategies]) => (
            <section class="mb-2">
              <div class="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                {category}
              </div>
              <For each={strategies}>
                {(strategy) => {
                  const id = `${category}::${strategy.condition}`
                  return (
                    <ConditionToggle
                      condition={strategy.condition}
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
    </div>
  )
}

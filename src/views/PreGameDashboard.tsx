import { createEffect, createResource, createSignal, For, Show, Suspense } from 'solid-js'
import { useNavigate, useParams } from '@solidjs/router'
import { db } from '../db'
import { seedsReady } from '../db/seed'
import { prepareStrategies } from '../lib/strategy'
import { useAppMode } from '../store/appState'
import StickyTopBar from '../components/StickyTopBar'
import ModeToggle from '../components/ModeToggle'

export default function PreGameDashboard() {
  const params = useParams()
  const navigate = useNavigate()
  const mode = useAppMode()
  const [activeTab, setActiveTab] = createSignal<string>('')

  const [game] = createResource(
    () => params.id,
    async (id) => {
      await seedsReady
      return db.getGame(id)
    },
  )

  const [strategies] = createResource(
    () => params.id,
    async (id) => {
      await seedsReady
      return db.getStrategies(id)
    },
  )

  createEffect(() => {
    const g = game()
    if (g && !activeTab()) setActiveTab(g.phases[0] ?? '')
  })

  const tldr = () =>
    (strategies() ?? []).filter((s) => s.tags.includes('TLDR'))

  // Same ordering pipeline as the live accordion: category alphabetical,
  // condition alphabetical, TLDR hoisted to the top of its category.
  const forTab = () => {
    const inPhase = (strategies() ?? []).filter((s) => s.phase === activeTab())
    return [...prepareStrategies(inPhase).values()].flat()
  }

  return (
    <div class="flex flex-col min-h-svh pt-[56px]">
      <StickyTopBar
        left={
          <button
            onClick={() => navigate('/')}
            class="flex items-center justify-center w-[44px] h-[44px] text-[var(--text)] text-xl"
            aria-label="Back to game library"
          >
            ←
          </button>
        }
        right={<ModeToggle />}
      />

      <Suspense
        fallback={
          <p class="text-[var(--muted)] text-sm py-12 text-center">Loading…</p>
        }
      >
        <Show
          when={game()}
          fallback={
            <Show when={!game.loading}>
              <div class="px-4 py-16 text-center flex flex-col items-center gap-4">
                <p class="text-[var(--text)] font-semibold">Game not found</p>
                <button
                  onClick={() => navigate('/')}
                  class="text-[var(--accent)] text-sm"
                >
                  ← Back to library
                </button>
              </div>
            </Show>
          }
        >
          {(g) => (
            <>
              {/* Game header + Start Game FAB */}
              <div class="px-4 pt-6 pb-4 flex items-start justify-between gap-4">
                <div>
                  <h1 class="text-xl font-bold text-[var(--text)] leading-tight">
                    {g().game_name}
                  </h1>
                  <p class="text-sm text-[var(--muted)] mt-1">
                    {g().game_description}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/game/${params.id}/play`)}
                  class="shrink-0 h-[44px] px-5 rounded-full bg-[var(--accent)] text-white font-semibold text-sm whitespace-nowrap"
                >
                  Start Game →
                </button>
              </div>

              {/* TLDR list */}
              <Show when={tldr().length > 0}>
                <section class="px-4 pb-5">
                  <h2 class="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">
                    Key Strategies
                  </h2>
                  <ul class="space-y-2 list-none m-0 p-0">
                    <For each={tldr()}>
                      {(s) => (
                        <li class="flex gap-2 text-sm text-[var(--text)]">
                          <span class="text-[var(--accent)] shrink-0 mt-0.5">•</span>
                          <span>
                            <span class="font-medium">{s.condition}</span>
                            {' — '}
                            <Show
                              when={mode() === 'study'}
                              fallback={
                                <span class="text-[var(--text)]/80">
                                  {s.strategy_stealth[0]}
                                </span>
                              }
                            >
                              {s.strategy_detailed}
                            </Show>
                          </span>
                        </li>
                      )}
                    </For>
                  </ul>
                </section>
              </Show>

              {/* Deep Dive phase tabs */}
              <section class="flex-1 border-t border-[var(--muted)]/20">
                <div class="flex">
                  <For each={g().phases}>
                    {(phase) => (
                      <button
                        onClick={() => setActiveTab(phase)}
                        class={`flex-1 min-h-[44px] text-xs font-medium border-b-2 transition-colors leading-tight px-1 ${
                          activeTab() === phase
                            ? 'text-[var(--accent)] border-[var(--accent)]'
                            : 'text-[var(--muted)] border-transparent'
                        }`}
                        aria-current={activeTab() === phase ? 'page' : undefined}
                      >
                        {phase}
                      </button>
                    )}
                  </For>
                </div>

                <div class="px-4 py-3 space-y-4">
                  <Show
                    when={forTab().length > 0}
                    fallback={
                      <p class="text-[var(--muted)] text-sm py-4">
                        No strategies for this phase.
                      </p>
                    }
                  >
                    <For each={forTab()}>
                      {(s) => (
                        <div class="text-sm">
                          <div class="text-xs text-[var(--muted)] uppercase tracking-wide mb-0.5">
                            {s.category}
                          </div>
                          <div class="font-medium text-[var(--text)]">
                            {s.condition}
                          </div>
                          <Show
                            when={mode() === 'study'}
                            fallback={
                              <ul class="space-y-1 list-none m-0 p-0 mt-1">
                                <For each={s.strategy_stealth}>
                                  {(bullet) => (
                                    <li class="flex gap-2 text-[var(--text)]/80">
                                      <span class="text-[var(--accent)] shrink-0">›</span>
                                      <span>{bullet}</span>
                                    </li>
                                  )}
                                </For>
                              </ul>
                            }
                          >
                            <div class="text-[var(--text)]/80 mt-1 leading-relaxed">
                              {s.strategy_detailed}
                            </div>
                          </Show>
                        </div>
                      )}
                    </For>
                  </Show>
                </div>
              </section>
            </>
          )}
        </Show>
      </Suspense>
    </div>
  )
}

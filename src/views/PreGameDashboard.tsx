import { createResource, createSignal, For, Show, Suspense } from 'solid-js'
import { useNavigate, useParams } from '@solidjs/router'
import { db } from '../db'
import { seedsReady } from '../db/seed'
import { PHASES } from '../lib/strategy'
import StickyTopBar from '../components/StickyTopBar'
import ModeToggle from '../components/ModeToggle'
import type { Phase } from '../types/domain'

export default function PreGameDashboard() {
  const params = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = createSignal<Phase>('Setup')

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

  const tldr = () =>
    (strategies() ?? []).filter((s) => s.tags.includes('TLDR'))

  const forTab = () =>
    (strategies() ?? [])
      .filter((s) => s.phase === activeTab())
      .sort(
        (a, b) =>
          a.category.localeCompare(b.category) ||
          a.condition.localeCompare(b.condition),
      )

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
        <Show when={game()}>
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
                            {s.strategy_detailed}
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
                  <For each={PHASES}>
                    {(phase) => (
                      <button
                        onClick={() => setActiveTab(phase)}
                        class={`flex-1 h-[44px] text-xs font-medium border-b-2 transition-colors truncate px-1 ${
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
                          <div class="text-[var(--text)]/80 mt-1 leading-relaxed">
                            {s.strategy_detailed}
                          </div>
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

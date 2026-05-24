import { createResource, createSignal, For, Show, Suspense } from 'solid-js'
import { useRegisterSW } from 'virtual:pwa-register/solid'
import { db } from '../db'
import { seedsReady } from '../db/seed'
import StickyTopBar from '../components/StickyTopBar'
import ModeToggle from '../components/ModeToggle'
import GameCard from '../components/GameCard'
import NetworkIndicator from '../components/NetworkIndicator'

export default function GameLibrary() {
  const [query, setQuery] = createSignal('')
  const { needRefresh: needRefreshSignal, updateServiceWorker } = useRegisterSW()
  const [needRefresh] = needRefreshSignal

  const [games] = createResource(async () => {
    await seedsReady
    return db.getAllGames()
  })

  const filtered = () => {
    const q = query().toLowerCase().trim()
    const all = games() ?? []
    if (!q) return all
    return all.filter(
      (g) =>
        g.game_name.toLowerCase().includes(q) ||
        g.game_description.toLowerCase().includes(q),
    )
  }

  return (
    <div class="flex flex-col min-h-svh pt-[56px]">
      <StickyTopBar
        left={
          <span class="font-bold text-base text-[var(--text)]">Strategy</span>
        }
        right={<ModeToggle />}
      />

      {/* PWA update banner — only shown on library page, never mid-game */}
      <Show when={needRefresh()}>
        <div class="sticky top-[56px] z-50 flex items-center justify-between gap-4 px-4 py-2 bg-[var(--accent)] text-white text-sm">
          <span>Update available</span>
          <button
            onClick={() => updateServiceWorker(true)}
            class="font-semibold underline shrink-0"
          >
            Reload
          </button>
        </div>
      </Show>

      {/* Search bar — sticky below top bar */}
      <div class="sticky top-[56px] z-40 px-4 py-3 bg-[var(--bg)]">
        <input
          type="search"
          placeholder="Search games…"
          value={query()}
          onInput={(e) => setQuery(e.currentTarget.value)}
          class="w-full h-[44px] px-4 rounded-[8px] bg-[var(--surface)] text-[var(--text)] border border-[var(--muted)]/30 outline-none focus:border-[var(--accent)] placeholder:text-[var(--muted)] text-sm"
        />
      </div>

      <main class="flex-1 px-4 pb-4">
        <Suspense
          fallback={
            <p class="text-[var(--muted)] text-sm py-12 text-center">
              Loading games…
            </p>
          }
        >
          <Show
            when={(games()?.length ?? 0) > 0}
            fallback={
              <p class="text-[var(--muted)] text-sm py-12 text-center">
                No games loaded yet.
              </p>
            }
          >
            <Show
              when={filtered().length > 0}
              fallback={
                <p class="text-[var(--muted)] text-sm py-12 text-center">
                  No games match your search.
                </p>
              }
            >
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <For each={filtered()}>
                  {(game) => <GameCard game={game} />}
                </For>
              </div>
            </Show>
          </Show>
        </Suspense>
      </main>

      <footer class="px-4 pb-4 flex justify-center">
        <NetworkIndicator />
      </footer>
    </div>
  )
}

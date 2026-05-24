import {
  createMemo,
  createResource,
  createSignal,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from 'solid-js'
import { useNavigate, useParams } from '@solidjs/router'
import { db } from '../db'
import { seedsReady } from '../db/seed'
import { filterByContext } from '../lib/strategy'
import { useAppMode } from '../store/appState'
import StickyTopBar from '../components/StickyTopBar'
import ModeToggle from '../components/ModeToggle'
import PhaseStepper from '../components/PhaseStepper'
import InlineYesNoFilter from '../components/InlineYesNoFilter'
import ActionAccordion from '../components/ActionAccordion'
import type { Phase } from '../types/domain'

export default function LiveCompanion() {
  const params = useParams()
  const navigate = useNavigate()
  const mode = useAppMode()

  const [currentPhase, setCurrentPhase] = createSignal<Phase>('Setup')
  const [filter1, setFilter1] = createSignal<'yes' | 'no' | null>(null)
  const [filter2, setFilter2] = createSignal<'yes' | 'no' | null>(null)
  const [searchQuery, setSearchQuery] = createSignal('')

  let wakeLock: WakeLockSentinel | null = null

  onMount(async () => {
    try {
      wakeLock = (await navigator.wakeLock?.request('screen')) ?? null
    } catch { /* unsupported or page hidden — non-fatal */ }

    navigator.serviceWorker?.controller?.postMessage({ type: 'SESSION_ACTIVE' })
  })

  onCleanup(() => {
    wakeLock?.release().catch(() => {})
    wakeLock = null
    navigator.serviceWorker?.controller?.postMessage({ type: 'SESSION_ENDED' })
  })

  const [game] = createResource(
    () => params.id,
    async (id) => {
      await seedsReady
      return db.getGame(id)
    },
  )

  const [allStrategies] = createResource(
    () => params.id,
    async (id) => {
      await seedsReady
      return db.getStrategies(id)
    },
  )

  const activeContexts = createMemo((): (string | null)[] => {
    const g = game()
    if (!g) return []
    const contexts: (string | null)[] = []
    if (g.filter_1_label) {
      const f1 = filter1()
      if (f1 === null) {
        // Unset: include both context values so no filtering occurs
        if (g.filter_1_yes_context) contexts.push(g.filter_1_yes_context)
        if (g.filter_1_no_context) contexts.push(g.filter_1_no_context)
      } else {
        contexts.push(f1 === 'yes' ? g.filter_1_yes_context : g.filter_1_no_context)
      }
    }
    if (g.filter_2_label) {
      const f2 = filter2()
      if (f2 === null) {
        if (g.filter_2_yes_context) contexts.push(g.filter_2_yes_context)
        if (g.filter_2_no_context) contexts.push(g.filter_2_no_context)
      } else {
        contexts.push(f2 === 'yes' ? g.filter_2_yes_context : g.filter_2_no_context)
      }
    }
    return contexts
  })

  const phaseStrategies = createMemo(() => {
    const q = searchQuery().toLowerCase().trim()
    const byPhase = (allStrategies() ?? []).filter((s) => s.phase === currentPhase())
    const byContext = filterByContext(byPhase, activeContexts())
    if (!q) return byContext
    return byContext.filter((s) => s.condition.toLowerCase().includes(q))
  })

  return (
    <div
      class={`flex flex-col pt-[56px] ${
        mode() === 'stealth' ? 'h-svh overflow-hidden' : 'min-h-svh'
      }`}
    >
      <StickyTopBar
        left={
          <button
            onClick={() => navigate(`/game/${params.id}`)}
            class="flex items-center justify-center w-[44px] h-[44px] text-[var(--text)] text-xl"
            aria-label="Back to pre-game dashboard"
          >
            ←
          </button>
        }
        right={<ModeToggle />}
      />

      <Suspense
        fallback={
          <p class="text-[var(--muted)] text-sm py-12 text-center">
            Loading…
          </p>
        }
      >
        <Show when={game()}>
          {(g) => (
            <>
              <PhaseStepper
                currentPhase={currentPhase()}
                onPhaseChange={setCurrentPhase}
              />

              <Show when={g().filter_1_label}>
                <InlineYesNoFilter
                  filter1Label={g().filter_1_label!}
                  filter1Value={filter1()}
                  onFilter1Change={setFilter1}
                  filter2Label={g().filter_2_label ?? undefined}
                  filter2Value={filter2()}
                  onFilter2Change={setFilter2}
                />
              </Show>

              <div class="px-4 pt-2 pb-1">
                <input
                  type="search"
                  placeholder="Filter strategies…"
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.currentTarget.value)}
                  class="w-full h-[40px] px-3 rounded-[8px] bg-[var(--surface)] text-[var(--text)] border border-[var(--muted)]/30 outline-none focus:border-[var(--accent)] placeholder:text-[var(--muted)] text-sm"
                />
              </div>

              <main
                class={`flex-1 ${
                  mode() === 'stealth' ? 'overflow-hidden' : 'overflow-y-auto'
                } pb-4`}
              >
                <ActionAccordion strategies={phaseStrategies()} />
              </main>
            </>
          )}
        </Show>
      </Suspense>
    </div>
  )
}

import {
  createEffect,
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
import { filterByContext, resolveFilterContexts } from '../lib/strategy'
import { useAppMode } from '../store/appState'
import StickyTopBar from '../components/StickyTopBar'
import ModeToggle from '../components/ModeToggle'
import PhaseStepper from '../components/PhaseStepper'
import InlineYesNoFilter from '../components/InlineYesNoFilter'
import ActionAccordion from '../components/ActionAccordion'

// Post to the registration's active worker, not serviceWorker.controller —
// after a hard reload the page is uncontrolled and controller is null even
// though an active SW (and possibly a waiting update) exists.
function postToServiceWorker(type: 'SESSION_ACTIVE' | 'SESSION_ENDED') {
  void navigator.serviceWorker
    ?.getRegistration()
    .then((reg) => reg?.active?.postMessage({ type }))
}

export default function LiveCompanion() {
  const params = useParams()
  const navigate = useNavigate()
  const mode = useAppMode()

  const [currentPhase, setCurrentPhase] = createSignal<string>('')
  const [filter1, setFilter1] = createSignal<'yes' | 'no' | null>(null)
  const [filter2, setFilter2] = createSignal<'yes' | 'no' | null>(null)
  const [searchQuery, setSearchQuery] = createSignal('')

  let wakeLock: WakeLockSentinel | null = null

  const acquireWakeLock = async () => {
    try {
      wakeLock = (await navigator.wakeLock?.request('screen')) ?? null
    } catch { /* unsupported or page hidden — non-fatal */ }
  }

  // The platform auto-releases the wake lock whenever the page is hidden
  // (app switch, notification shade); reacquire on return so the screen
  // keeps staying awake for the rest of the game.
  const reacquireOnVisible = () => {
    if (document.visibilityState === 'visible') void acquireWakeLock()
  }

  onMount(() => {
    void acquireWakeLock()
    document.addEventListener('visibilitychange', reacquireOnVisible)
    postToServiceWorker('SESSION_ACTIVE')
  })

  onCleanup(() => {
    document.removeEventListener('visibilitychange', reacquireOnVisible)
    wakeLock?.release().catch(() => {})
    wakeLock = null
    postToServiceWorker('SESSION_ENDED')
  })

  const [game] = createResource(
    () => params.id,
    async (id) => {
      await seedsReady
      return db.getGame(id)
    },
  )

  createEffect(() => {
    const g = game()
    if (g && !currentPhase()) setCurrentPhase(g.phases[0] ?? '')
  })

  const [allStrategies] = createResource(
    () => params.id,
    async (id) => {
      await seedsReady
      return db.getStrategies(id)
    },
  )

  // The game's declared filters (those with a label), each paired with its
  // local yes/no signal. Drives both the filter UI and activeContexts.
  const filters = createMemo(() => {
    const g = game()
    if (!g) return []
    return [
      {
        label: g.filter_1_label,
        yesContext: g.filter_1_yes_context,
        noContext: g.filter_1_no_context,
        value: filter1,
        onChange: setFilter1,
      },
      {
        label: g.filter_2_label,
        yesContext: g.filter_2_yes_context,
        noContext: g.filter_2_no_context,
        value: filter2,
        onChange: setFilter2,
      },
    ].filter((f): f is typeof f & { label: string } => f.label !== null)
  })

  const activeContexts = createMemo((): string[] =>
    filters().flatMap((f) =>
      resolveFilterContexts(f.label, f.yesContext, f.noContext, f.value()),
    ),
  )

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
              <PhaseStepper
                phases={g().phases}
                currentPhase={currentPhase()}
                onPhaseChange={setCurrentPhase}
                navStyle={g().nav_style}
              />

              <Show when={filters().length > 0}>
                <InlineYesNoFilter filters={filters()} />
              </Show>

              <div class="px-4 pt-2 pb-1">
                <input
                  type="search"
                  placeholder="Filter strategies…"
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.currentTarget.value)}
                  class="w-full h-[44px] px-3 rounded-[8px] bg-[var(--surface)] text-[var(--text)] border border-[var(--muted)]/30 outline-none focus:border-[var(--accent)] placeholder:text-[var(--muted)] text-sm"
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

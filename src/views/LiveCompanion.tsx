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
  const [filter1, setFilter1] = createSignal<'yes' | 'no'>('no')
  const [filter2, setFilter2] = createSignal<'yes' | 'no'>('no')

  let wakeLock: WakeLockSentinel | null = null

  onMount(async () => {
    // Prevent screen sleep during active gameplay
    try {
      wakeLock = (await navigator.wakeLock?.request('screen')) ?? null
    } catch { /* unsupported or page hidden — non-fatal */ }

    // Tell SW not to activate waiting updates mid-session
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
      contexts.push(
        filter1() === 'yes' ? g.filter_1_yes_context : g.filter_1_no_context,
      )
    }
    if (g.filter_2_label) {
      contexts.push(
        filter2() === 'yes' ? g.filter_2_yes_context : g.filter_2_no_context,
      )
    }
    return contexts
  })

  const phaseStrategies = createMemo(() =>
    (allStrategies() ?? []).filter((s) => s.phase === currentPhase()),
  )

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

              <main
                class={`flex-1 ${
                  mode() === 'stealth' ? 'overflow-hidden' : 'overflow-y-auto'
                } pb-4`}
              >
                <ActionAccordion
                  strategies={phaseStrategies()}
                  activeContexts={activeContexts()}
                />
              </main>
            </>
          )}
        </Show>
      </Suspense>
    </div>
  )
}

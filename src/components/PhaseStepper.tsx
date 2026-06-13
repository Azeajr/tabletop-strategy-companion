import { For } from 'solid-js'
import { useAppMode } from '../store/appState'

interface Props {
  phases: string[]
  currentPhase: string
  onPhaseChange: (phase: string) => void
  // 'arc' (default): phases are a linear progression — rendered as a stepper
  // (bottom-border tabs, aria-current="step"). 'modes': phases are non-linear
  // states the player freely switches between (a loop game) — rendered as
  // free-select pills with no progression affordance.
  navStyle?: 'arc' | 'modes'
}

export default function PhaseStepper(props: Props) {
  const mode = useAppMode()
  const isModes = () => props.navStyle === 'modes'
  let touchStartX = 0

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX = e.touches[0].clientX
  }

  const handleTouchEnd = (e: TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(dx) < 50) return
    const i = props.phases.indexOf(props.currentPhase)
    if (dx < 0 && i < props.phases.length - 1) props.onPhaseChange(props.phases[i + 1])
    if (dx > 0 && i > 0) props.onPhaseChange(props.phases[i - 1])
  }

  return (
    <nav
      class={`flex w-full bg-[var(--bg)] ${isModes() ? 'gap-1 px-2 py-2' : ''} ${
        mode() === 'stealth' ? 'sticky top-[56px] z-40' : ''
      }`}
      aria-label={isModes() ? 'Game modes' : 'Game phases'}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <For each={props.phases}>
        {(phase) => {
          const active = () => props.currentPhase === phase
          return (
            <button
              onClick={() => props.onPhaseChange(phase)}
              class={
                isModes()
                  ? `flex-1 min-h-[44px] rounded-full px-2 text-xs font-medium leading-tight transition-colors ${
                      active()
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--surface)] text-[var(--muted)]'
                    }`
                  : `flex-1 min-h-[44px] text-xs font-medium border-b-2 transition-colors leading-tight px-1 ${
                      active()
                        ? 'text-[var(--accent)] border-[var(--accent)]'
                        : 'text-[var(--muted)] border-transparent'
                    }`
              }
              aria-current={active() ? (isModes() ? 'true' : 'step') : undefined}
            >
              {phase}
            </button>
          )
        }}
      </For>
    </nav>
  )
}

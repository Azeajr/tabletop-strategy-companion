import { For } from 'solid-js'
import { useAppMode } from '../store/appState'

interface Props {
  phases: string[]
  currentPhase: string
  onPhaseChange: (phase: string) => void
}

export default function PhaseStepper(props: Props) {
  const mode = useAppMode()
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
      class={`flex w-full bg-[var(--bg)] ${
        mode() === 'stealth' ? 'sticky top-[56px] z-40' : ''
      }`}
      aria-label="Game phases"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <For each={props.phases}>
        {(phase) => (
          <button
            onClick={() => props.onPhaseChange(phase)}
            class={`flex-1 min-h-[44px] text-xs font-medium border-b-2 transition-colors leading-tight px-1 ${
              props.currentPhase === phase
                ? 'text-[var(--accent)] border-[var(--accent)]'
                : 'text-[var(--muted)] border-transparent'
            }`}
            aria-current={props.currentPhase === phase ? 'step' : undefined}
          >
            {phase}
          </button>
        )}
      </For>
    </nav>
  )
}

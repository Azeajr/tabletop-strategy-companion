import { For } from 'solid-js'
import { useAppMode } from '../store/appState'
import { PHASES } from '../lib/strategy'
import type { Phase } from '../types/domain'

interface Props {
  currentPhase: Phase
  onPhaseChange: (phase: Phase) => void
}

export default function PhaseStepper(props: Props) {
  const mode = useAppMode()
  return (
    <nav
      class={`flex w-full bg-[var(--bg)] ${
        mode() === 'stealth' ? 'sticky top-[56px] z-40' : ''
      }`}
      aria-label="Game phases"
    >
      <For each={PHASES}>
        {(phase) => (
          <button
            onClick={() => props.onPhaseChange(phase)}
            class={`flex-1 h-[44px] text-xs font-medium border-b-2 transition-colors truncate px-1 ${
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

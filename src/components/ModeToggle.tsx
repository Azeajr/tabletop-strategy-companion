import { useAppMode, toggleAppMode } from '../store/appState'

export default function ModeToggle() {
  const mode = useAppMode()
  return (
    <div
      class="flex rounded-full overflow-hidden border border-[var(--muted)]/30 text-xs h-[36px]"
      role="group"
      aria-label="Display mode"
    >
      <button
        onClick={() => { if (mode() !== 'study') toggleAppMode() }}
        class={`px-3 h-full min-w-[44px] transition-colors ${
          mode() === 'study'
            ? 'bg-[var(--accent)] text-white font-semibold'
            : 'text-[var(--muted)]'
        }`}
        aria-pressed={mode() === 'study'}
      >
        📖 Study
      </button>
      <button
        onClick={() => { if (mode() !== 'stealth') toggleAppMode() }}
        class={`px-3 h-full min-w-[44px] transition-colors ${
          mode() === 'stealth'
            ? 'bg-[var(--accent)] text-[var(--bg)] font-semibold'
            : 'text-[var(--muted)]'
        }`}
        aria-pressed={mode() === 'stealth'}
      >
        🥷 Stealth
      </button>
    </div>
  )
}

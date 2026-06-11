import { For } from 'solid-js'

// `value` is an accessor (not a snapshot) so the parent's filters array stays
// referentially stable across toggles — <For> then patches the row in place
// instead of recreating it, which would drop focus from the tapped button.
export interface FilterControl {
  label: string
  value: () => 'yes' | 'no' | null
  onChange: (v: 'yes' | 'no' | null) => void
}

interface Props {
  filters: FilterControl[]
}

function FilterRow(props: FilterControl) {
  return (
    <div class="flex items-center justify-between gap-4 min-h-[44px]">
      <span class="text-sm text-[var(--text)] flex-1 leading-snug">{props.label}</span>
      <div
        class="flex rounded overflow-hidden border border-[var(--muted)]/30 shrink-0"
        role="group"
      >
        <button
          onClick={() => props.onChange(props.value() === 'yes' ? null : 'yes')}
          class={`px-4 h-[44px] min-w-[44px] text-sm transition-colors ${
            props.value() === 'yes'
              ? 'bg-[var(--accent)] text-white font-semibold'
              : 'text-[var(--muted)]'
          }`}
          aria-pressed={props.value() === 'yes'}
        >
          Yes
        </button>
        <button
          onClick={() => props.onChange(props.value() === 'no' ? null : 'no')}
          class={`px-4 h-[44px] min-w-[44px] text-sm transition-colors ${
            props.value() === 'no'
              ? 'bg-[var(--accent)] text-white font-semibold'
              : 'text-[var(--muted)]'
          }`}
          aria-pressed={props.value() === 'no'}
        >
          No
        </button>
      </div>
    </div>
  )
}

export default function InlineYesNoFilter(props: Props) {
  return (
    <div class="px-4 py-2 space-y-1 border-b border-[var(--muted)]/20">
      <For each={props.filters}>
        {(f) => <FilterRow label={f.label} value={f.value} onChange={f.onChange} />}
      </For>
    </div>
  )
}

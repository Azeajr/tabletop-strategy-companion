import { Show } from 'solid-js'

interface Props {
  filter1Label: string
  filter1Value: 'yes' | 'no'
  onFilter1Change: (v: 'yes' | 'no') => void
  filter2Label?: string
  filter2Value: 'yes' | 'no'
  onFilter2Change: (v: 'yes' | 'no') => void
}

function FilterRow(props: {
  label: string
  value: 'yes' | 'no'
  onChange: (v: 'yes' | 'no') => void
}) {
  return (
    <div class="flex items-center justify-between gap-4 min-h-[44px]">
      <span class="text-sm text-[var(--text)] flex-1 leading-snug">{props.label}</span>
      <div
        class="flex rounded overflow-hidden border border-[var(--muted)]/30 shrink-0"
        role="group"
      >
        <button
          onClick={() => props.onChange('yes')}
          class={`px-4 h-[36px] min-w-[44px] text-sm transition-colors ${
            props.value === 'yes'
              ? 'bg-[var(--accent)] text-white font-semibold'
              : 'text-[var(--muted)]'
          }`}
          aria-pressed={props.value === 'yes'}
        >
          Yes
        </button>
        <button
          onClick={() => props.onChange('no')}
          class={`px-4 h-[36px] min-w-[44px] text-sm transition-colors ${
            props.value === 'no'
              ? 'bg-[var(--accent)] text-white font-semibold'
              : 'text-[var(--muted)]'
          }`}
          aria-pressed={props.value === 'no'}
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
      <FilterRow
        label={props.filter1Label}
        value={props.filter1Value}
        onChange={props.onFilter1Change}
      />
      <Show when={props.filter2Label}>
        <FilterRow
          label={props.filter2Label!}
          value={props.filter2Value}
          onChange={props.onFilter2Change}
        />
      </Show>
    </div>
  )
}

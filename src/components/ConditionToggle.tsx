import type { JSX } from 'solid-js'

interface Props {
  condition: string
  isOpen: boolean
  onToggle: () => void
  children: JSX.Element
}

export default function ConditionToggle(props: Props) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const all = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-condition-toggle]'),
    )
    const i = all.indexOf(e.currentTarget as HTMLButtonElement)
    const next = e.key === 'ArrowDown'
      ? Math.min(i + 1, all.length - 1)
      : Math.max(i - 1, 0)
    all[next]?.focus()
  }

  return (
    <div class="border-b border-[var(--muted)]/10 last:border-0">
      <button
        data-condition-toggle
        onClick={props.onToggle}
        onKeyDown={handleKeyDown}
        class="w-full text-left min-h-[44px] py-3 px-4 text-[var(--text)] flex justify-between items-start gap-3"
        aria-expanded={props.isOpen}
      >
        <span class="flex-1 text-sm leading-snug">{props.condition}</span>
        <span
          class={`mt-0.5 shrink-0 text-[var(--muted)] text-xs transition-transform duration-150 ${
            props.isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>
      {/* Grid trick: animate grid-template-rows 0fr → 1fr for smooth height */}
      <div
        class={`grid transition-[grid-template-rows] duration-150 ease-linear ${
          props.isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div class="overflow-hidden">
          <div class="px-4 pb-4 text-sm text-[var(--text)]/90">{props.children}</div>
        </div>
      </div>
    </div>
  )
}

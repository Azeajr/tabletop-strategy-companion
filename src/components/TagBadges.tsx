import { For, Show } from 'solid-js'
import type { Tag } from '../types/domain'

interface Props {
  tags: Tag[]
}

// TLDR is communicated by hoisting + the dashboard "Key Strategies" list, not a
// chip — so it's filtered out here. The remaining tags (Offense / Defense /
// Economy / …) are the at-a-glance "what kind of move is this?" signal that was
// authored into every seed but previously rendered nowhere.
export default function TagBadges(props: Props) {
  const visible = () => props.tags.filter((t) => t !== 'TLDR')
  return (
    <Show when={visible().length > 0}>
      <span class="ml-1.5 inline-flex flex-wrap gap-1 align-middle">
        <For each={visible()}>
          {(tag) => (
            <span class="inline-block rounded-full bg-[var(--muted)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-[var(--muted)]">
              {tag}
            </span>
          )}
        </For>
      </span>
    </Show>
  )
}

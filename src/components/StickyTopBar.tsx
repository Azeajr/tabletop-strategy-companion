import type { JSX } from 'solid-js'
import { useAppMode } from '../store/appState'

interface Props {
  left?: JSX.Element
  right?: JSX.Element
}

export default function StickyTopBar(props: Props) {
  const mode = useAppMode()
  return (
    <header
      class={`fixed top-0 left-0 right-0 z-50 h-[56px] flex items-center justify-between px-4 bg-[var(--surface)] ${
        mode() === 'study' ? 'border-b border-[var(--muted)]/20 shadow-sm' : ''
      }`}
    >
      <div class="flex items-center min-w-[44px] min-h-[44px]">{props.left}</div>
      <div class="flex items-center min-h-[44px] justify-end">{props.right}</div>
    </header>
  )
}

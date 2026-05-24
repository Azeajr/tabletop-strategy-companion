import { A } from '@solidjs/router'
import { useAppMode } from '../store/appState'
import type { Game } from '../types/domain'

interface Props {
  game: Game
}

export default function GameCard(props: Props) {
  const mode = useAppMode()
  return (
    <A
      href={`/game/${props.game.game_id}`}
      class={`block p-4 min-h-[88px] no-underline text-[var(--text)] transition-opacity active:opacity-70 ${
        mode() === 'study'
          ? 'bg-[var(--surface)] rounded-[12px] shadow-[var(--shadow-card)]'
          : 'bg-transparent border-b border-[var(--muted)]/20'
      }`}
    >
      <div class="font-semibold text-base leading-tight">{props.game.game_name}</div>
      <div class="text-sm text-[var(--muted)] mt-1 leading-snug">
        {props.game.game_description}
      </div>
    </A>
  )
}

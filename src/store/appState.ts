import { createSignal } from 'solid-js'

export type AppMode = 'study' | 'stealth'

const [appMode, setAppMode] = createSignal<AppMode>(
  (localStorage.getItem('appMode') as AppMode) ?? 'study'
)

export function useAppMode() {
  return appMode
}

export function toggleAppMode() {
  const next: AppMode = appMode() === 'study' ? 'stealth' : 'study'
  localStorage.setItem('appMode', next)
  setAppMode(next)
}

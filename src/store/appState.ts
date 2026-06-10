import { createSignal } from 'solid-js'

export type AppMode = 'study' | 'stealth'

// Theming is data-mode on <body> + CSS variable aliases (index.css).
// This store owns the attribute: applied once at load and on every toggle.
function syncBodyMode(mode: AppMode) {
  document.body.setAttribute('data-mode', mode)
}

// localStorage may hold anything (old format, corruption); an unrecognized
// value would put an unknown data-mode on <body> and break every CSS token.
const stored = localStorage.getItem('appMode')
const initialMode: AppMode = stored === 'stealth' ? 'stealth' : 'study'

const [appMode, setAppMode] = createSignal<AppMode>(initialMode)
syncBodyMode(initialMode)

export function useAppMode() {
  return appMode
}

export function toggleAppMode() {
  const next: AppMode = appMode() === 'study' ? 'stealth' : 'study'
  localStorage.setItem('appMode', next)
  setAppMode(next)
  syncBodyMode(next)
}

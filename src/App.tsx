import { createEffect, ErrorBoundary } from 'solid-js'
import { Router, Route } from '@solidjs/router'
import { useAppMode } from './store/appState'
import GameLibrary from './views/GameLibrary'
import PreGameDashboard from './views/PreGameDashboard'
import LiveCompanion from './views/LiveCompanion'

export default function App() {
  const mode = useAppMode()
  createEffect(() => document.body.setAttribute('data-mode', mode()))

  return (
    <ErrorBoundary
      fallback={(err, reset) => (
        <div class="flex flex-col items-center justify-center min-h-svh px-6 text-center gap-4">
          <p class="text-[var(--text)] font-semibold text-lg">Failed to initialize database</p>
          <p class="text-[var(--muted)] text-sm">{err?.message ?? 'Unknown error'}</p>
          <button
            onClick={reset}
            class="h-[44px] px-5 rounded-full bg-[var(--accent)] text-white text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      )}
    >
      <Router>
        <Route path="/" component={GameLibrary} />
        <Route path="/game/:id" component={PreGameDashboard} />
        <Route path="/game/:id/play" component={LiveCompanion} />
      </Router>
    </ErrorBoundary>
  )
}

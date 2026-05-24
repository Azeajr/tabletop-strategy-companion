import { createSignal, onCleanup, onMount, Show } from 'solid-js'

export default function NetworkIndicator() {
  const [offline, setOffline] = createSignal(!navigator.onLine)

  const handleOnline = () => setOffline(false)
  const handleOffline = () => setOffline(true)

  onMount(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onCleanup(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return (
    <Show when={offline()}>
      <div class="flex items-center gap-1.5 text-xs py-2 opacity-60" style={{ color: '#5C4A1E' }}>
        {/* Cloud with slash — offline indicator */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
        <span>Offline</span>
      </div>
    </Show>
  )
}

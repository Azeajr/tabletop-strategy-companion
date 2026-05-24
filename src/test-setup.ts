import '@testing-library/jest-dom'
import { afterEach } from 'vitest'

// jsdom has no Worker — provide a minimal stub so components that construct
// Workers don't throw. The sqlite-client module is replaced entirely by the
// Vite alias, so this stub never receives SQLite messages.
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null

  constructor() {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  postMessage(_data: unknown) {}
  terminate() {}
}

Object.defineProperty(globalThis, 'Worker', { value: MockWorker, writable: true, configurable: true })

// Drain pending microtasks between tests. Components start async DB chains
// on mount; without this, a pending await can hit the torn-down DB in the
// next test's beforeEach.
afterEach(async () => {
  await new Promise(r => setTimeout(r, 0))
})

// Vitest's jsdom doesn't always expose a functional localStorage.
const makeLocalStorage = () => {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value) },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { Object.keys(store).forEach(k => delete store[k]) },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: makeLocalStorage(),
  writable: true,
})

// Guard DOM stubs — test-setup runs for all environments including node
if (typeof window !== 'undefined') {
  // jsdom doesn't implement scrollIntoView
  window.HTMLElement.prototype.scrollIntoView = () => {}

  // ResizeObserver used by virtual list components
  window.ResizeObserver = class ResizeObserver {
    private cb: ResizeObserverCallback
    constructor(cb: ResizeObserverCallback) { this.cb = cb }
    observe(target: Element) {
      this.cb([{
        target,
        contentRect: { height: 600, width: 400, top: 0, left: 0, right: 400, bottom: 600, x: 0, y: 0, toJSON: () => ({}) } as DOMRectReadOnly,
        borderBoxSize: [{ inlineSize: 400, blockSize: 600 }],
        contentBoxSize: [{ inlineSize: 400, blockSize: 600 }],
        devicePixelContentBoxSize: [{ inlineSize: 400, blockSize: 600 }],
      } as ResizeObserverEntry], this as unknown as ResizeObserver)
    }
    unobserve() {}
    disconnect() {}
  }
}

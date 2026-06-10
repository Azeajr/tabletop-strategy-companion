import { describe, it, expect, beforeEach, vi } from 'vitest'

// appState reads localStorage and sets body data-mode at module load,
// so each test re-imports a fresh module instance.
beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
  document.body.removeAttribute('data-mode')
})

describe('appState', () => {
  it('falls back to study for a missing or unrecognized stored mode', async () => {
    localStorage.setItem('appMode', 'garbage')
    const { useAppMode } = await import('./appState')
    expect(useAppMode()()).toBe('study')
    expect(document.body.getAttribute('data-mode')).toBe('study')
  })

  it('restores stealth from localStorage and syncs body data-mode', async () => {
    localStorage.setItem('appMode', 'stealth')
    const { useAppMode } = await import('./appState')
    expect(useAppMode()()).toBe('stealth')
    expect(document.body.getAttribute('data-mode')).toBe('stealth')
  })

  it('toggle flips the mode, persists it, and syncs body data-mode', async () => {
    const { useAppMode, toggleAppMode } = await import('./appState')
    toggleAppMode()
    expect(useAppMode()()).toBe('stealth')
    expect(localStorage.getItem('appMode')).toBe('stealth')
    expect(document.body.getAttribute('data-mode')).toBe('stealth')
    toggleAppMode()
    expect(useAppMode()()).toBe('study')
    expect(document.body.getAttribute('data-mode')).toBe('study')
  })
})

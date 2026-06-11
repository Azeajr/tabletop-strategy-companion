import { render, screen, fireEvent } from '@solidjs/testing-library'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, createMemoryHistory } from '@solidjs/router'
import LiveCompanion from './LiveCompanion'
import type { Game, Strategy } from '../types/domain'

const { getGame, getStrategies } = vi.hoisted(() => ({
  getGame: vi.fn(),
  getStrategies: vi.fn(),
}))

vi.mock('../db', () => ({ db: { getGame, getStrategies } }))
vi.mock('../db/seed', () => ({ seedsReady: Promise.resolve() }))

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    game_id: 'test-game',
    game_name: 'Test Game',
    game_description: 'A game for the live companion view tests',
    phases: ['Setup'],
    filter_1_label: null,
    filter_1_yes_context: null,
    filter_1_no_context: null,
    filter_2_label: null,
    filter_2_yes_context: null,
    filter_2_no_context: null,
    ...overrides,
  }
}

function makeStrategy(overrides: Partial<Strategy> = {}): Strategy {
  return {
    id: 1,
    game_id: 'test-game',
    phase: 'Setup',
    category: 'Tactics',
    condition: 'Some condition text',
    strategy_detailed: 'Detailed strategy advice with enough characters here.',
    strategy_stealth: ['Short tip'],
    tags: [],
    context: null,
    ...overrides,
  }
}

function renderView() {
  const history = createMemoryHistory()
  history.set({ value: '/game/test-game/play' })
  return render(() => (
    <MemoryRouter history={history}>
      <Route path="/game/:id/play" component={LiveCompanion} />
    </MemoryRouter>
  ))
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LiveCompanion', () => {
  it('setting a filter hides the opposite context but keeps universal strategies', async () => {
    getGame.mockResolvedValue(
      makeGame({
        filter_1_label: 'Are you leading?',
        filter_1_yes_context: 'leading',
        filter_1_no_context: 'trailing',
      }),
    )
    getStrategies.mockResolvedValue([
      makeStrategy({ id: 1, condition: 'Universal condition here', context: null }),
      makeStrategy({ id: 2, condition: 'Leading condition here', context: 'leading' }),
      makeStrategy({ id: 3, condition: 'Trailing condition here', context: 'trailing' }),
    ])
    renderView()

    // Filter unset — both contexts active, everything visible
    await screen.findByText('Universal condition here')
    expect(screen.getByText('Leading condition here')).toBeInTheDocument()
    expect(screen.getByText('Trailing condition here')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Yes' }))

    expect(screen.getByText('Universal condition here')).toBeInTheDocument()
    expect(screen.getByText('Leading condition here')).toBeInTheDocument()
    expect(screen.queryByText('Trailing condition here')).not.toBeInTheDocument()
  })

  it('renders filter 2 even when the game declares no filter 1', async () => {
    getGame.mockResolvedValue(
      makeGame({
        filter_2_label: 'Down to your last ships?',
        filter_2_yes_context: 'endangered',
        filter_2_no_context: 'safe',
      }),
    )
    getStrategies.mockResolvedValue([])
    renderView()
    expect(await screen.findByText('Down to your last ships?')).toBeInTheDocument()
  })

  it('shows Game not found for an unknown game id', async () => {
    getGame.mockResolvedValue(null)
    getStrategies.mockResolvedValue([])
    renderView()
    expect(await screen.findByText('Game not found')).toBeInTheDocument()
  })

  it('reacquires the wake lock when the page becomes visible again', async () => {
    // The platform auto-releases the lock on hide; LiveCompanion must
    // re-request it on visibilitychange so the screen stays awake mid-game.
    const request = vi.fn().mockResolvedValue({ release: vi.fn().mockResolvedValue(undefined) })
    Object.defineProperty(navigator, 'wakeLock', { value: { request }, configurable: true })
    try {
      getGame.mockResolvedValue(makeGame())
      getStrategies.mockResolvedValue([])
      renderView()
      expect(request).toHaveBeenCalledTimes(1)

      // jsdom's visibilityState is always 'visible', so the handler reacquires
      document.dispatchEvent(new Event('visibilitychange'))
      expect(request).toHaveBeenCalledTimes(2)
    } finally {
      delete (navigator as { wakeLock?: unknown }).wakeLock
    }
  })
})

import { render, screen } from '@solidjs/testing-library'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, createMemoryHistory } from '@solidjs/router'
import PreGameDashboard from './PreGameDashboard'
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
    game_description: 'A game for the dashboard view tests',
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
  history.set({ value: '/game/test-game' })
  return render(() => (
    <MemoryRouter history={history}>
      <Route path="/game/:id" component={PreGameDashboard} />
    </MemoryRouter>
  ))
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PreGameDashboard', () => {
  it('deep dive hoists TLDR strategies to the top of their category', async () => {
    getGame.mockResolvedValue(makeGame())
    getStrategies.mockResolvedValue([
      makeStrategy({ id: 1, condition: 'Aaa plain condition', tags: [] }),
      makeStrategy({ id: 2, condition: 'Zzz hoisted condition', tags: ['TLDR'] }),
    ])
    renderView()
    await screen.findByText('Aaa plain condition')

    // Deep-dive conditions render as <div>; the TLDR summary list uses <span>.
    const conditions = screen
      .getAllByText(/condition$/)
      .filter((el) => el.tagName === 'DIV')
      .map((el) => el.textContent)
    expect(conditions).toEqual(['Zzz hoisted condition', 'Aaa plain condition'])
  })

  it('shows Game not found for an unknown game id', async () => {
    getGame.mockResolvedValue(null)
    getStrategies.mockResolvedValue([])
    renderView()
    expect(await screen.findByText('Game not found')).toBeInTheDocument()
  })
})

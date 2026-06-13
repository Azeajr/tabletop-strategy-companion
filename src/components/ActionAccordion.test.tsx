import { render, screen, fireEvent } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, it, expect, afterEach } from 'vitest'
import ActionAccordion from './ActionAccordion'
import { useAppMode, toggleAppMode } from '../store/appState'
import type { Strategy } from '../types/domain'

// appMode is a module singleton — any test that flips to stealth must leave it
// back on study so the study-default tests above/below stay correct.
afterEach(() => {
  if (useAppMode()() === 'stealth') toggleAppMode()
})

const makeStrategy = (overrides: Partial<Strategy> = {}): Strategy => ({
  id: 1,
  game_id: 'test',
  phase: 'Setup',
  category: 'Alpha',
  condition: 'When this condition occurs',
  strategy_detailed: 'Do this detailed approach when the condition applies.',
  strategy_stealth: ['Do this', 'Not that'],
  tags: [],
  context: null,
  ...overrides,
})

describe('ActionAccordion', () => {
  it('renders nothing when strategies are empty', () => {
    render(() => <ActionAccordion strategies={[]} />)
    expect(screen.getByText(/no strategies/i)).toBeInTheDocument()
  })

  it('renders strategy conditions', () => {
    const strategies = [makeStrategy({ condition: 'When alpha fires' })]
    render(() => <ActionAccordion strategies={strategies} />)
    expect(screen.getByText('When alpha fires')).toBeInTheDocument()
  })

  it('groups strategies by category', () => {
    const strategies = [
      makeStrategy({ category: 'Alpha', condition: 'Condition Alpha 1' }),
      makeStrategy({ category: 'Beta', condition: 'Condition Beta one' }),
      makeStrategy({ category: 'Alpha', condition: 'Condition Alpha 2' }),
    ]
    render(() => <ActionAccordion strategies={strategies} />)
    const headings = screen.getAllByText(/Alpha|Beta/)
    expect(headings.some((el) => el.textContent === 'Alpha')).toBe(true)
    expect(headings.some((el) => el.textContent === 'Beta')).toBe(true)
  })

  it('renders only pre-filtered strategies', () => {
    // Context filtering happens upstream (LiveCompanion); ActionAccordion displays what it receives.
    const all = [
      makeStrategy({ condition: 'Visible condition here', context: null }),
      makeStrategy({ condition: 'Hidden context condition', context: 'hidden' }),
    ]
    const filtered = all.filter((s) => s.context === null || ['visible'].includes(s.context))
    render(() => <ActionAccordion strategies={filtered} />)
    expect(screen.getByText('Visible condition here')).toBeInTheDocument()
    expect(screen.queryByText('Hidden context condition')).not.toBeInTheDocument()
  })

  it('expands a condition on click and shows strategy detail', async () => {
    const strategies = [
      makeStrategy({ condition: 'Clickable condition text' }),
    ]
    render(() => <ActionAccordion strategies={strategies} />)
    const btn = screen.getByRole('button', { name: /clickable condition text/i })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  it('collapses on second click', async () => {
    const strategies = [makeStrategy({ condition: 'Toggle condition here' })]
    render(() => <ActionAccordion strategies={strategies} />)
    const btn = screen.getByRole('button', { name: /toggle condition here/i })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('an open item does not carry over to the same category/condition in another phase', () => {
    const [strategies, setStrategies] = createSignal([
      makeStrategy({ phase: 'Setup', category: 'Alpha', condition: 'Shared condition text' }),
    ])
    render(() => <ActionAccordion strategies={strategies()} />)
    fireEvent.click(screen.getByRole('button', { name: /shared condition text/i }))
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    // Same category + condition, different phase — must render collapsed
    setStrategies([
      makeStrategy({ phase: 'Mid-Game', category: 'Alpha', condition: 'Shared condition text' }),
    ])
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('stealth collapses a phase to its TLDR strategies by default', () => {
    toggleAppMode() // study → stealth
    const strategies = [
      makeStrategy({ category: 'Alpha', condition: 'Key move right now', tags: ['TLDR'] }),
      makeStrategy({ category: 'Beta', condition: 'Minor detail here ok', tags: [] }),
    ]
    render(() => (
      <ActionAccordion strategies={strategies} showAll={false} onToggleShowAll={() => {}} />
    ))
    expect(screen.getByText('Key move right now')).toBeInTheDocument()
    expect(screen.queryByText('Minor detail here ok')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show all \(1 more\)/i })).toBeInTheDocument()
  })

  it('stealth show-all reveals the non-TLDR strategies', () => {
    toggleAppMode() // study → stealth
    const strategies = [
      makeStrategy({ category: 'Alpha', condition: 'Key move right now', tags: ['TLDR'] }),
      makeStrategy({ category: 'Beta', condition: 'Minor detail here ok', tags: [] }),
    ]
    render(() => (
      <ActionAccordion strategies={strategies} showAll={true} onToggleShowAll={() => {}} />
    ))
    expect(screen.getByText('Minor detail here ok')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show key only/i })).toBeInTheDocument()
  })

  it('renders non-TLDR tags as badges and never the TLDR tag', () => {
    const strategies = [
      makeStrategy({ condition: 'Tagged condition row here', tags: ['Offense', 'TLDR'] }),
    ]
    render(() => <ActionAccordion strategies={strategies} />)
    expect(screen.getByText('Offense')).toBeInTheDocument()
    expect(screen.queryByText('TLDR')).not.toBeInTheDocument()
  })

  it('only one condition open at a time', async () => {
    const strategies = [
      makeStrategy({ condition: 'First condition here ok' }),
      makeStrategy({ condition: 'Second condition here ok' }),
    ]
    render(() => <ActionAccordion strategies={strategies} />)
    const [btn1, btn2] = screen.getAllByRole('button')
    fireEvent.click(btn1)
    expect(btn1).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(btn2)
    expect(btn1).toHaveAttribute('aria-expanded', 'false')
    expect(btn2).toHaveAttribute('aria-expanded', 'true')
  })
})

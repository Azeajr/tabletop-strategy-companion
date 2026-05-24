import { render, screen, fireEvent } from '@solidjs/testing-library'
import { describe, it, expect } from 'vitest'
import ActionAccordion from './ActionAccordion'
import type { Strategy } from '../types/domain'

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
    render(() => <ActionAccordion strategies={[]} activeContexts={[]} />)
    expect(screen.getByText(/no strategies/i)).toBeInTheDocument()
  })

  it('renders strategy conditions', () => {
    const strategies = [makeStrategy({ condition: 'When alpha fires' })]
    render(() => <ActionAccordion strategies={strategies} activeContexts={[]} />)
    expect(screen.getByText('When alpha fires')).toBeInTheDocument()
  })

  it('groups strategies by category', () => {
    const strategies = [
      makeStrategy({ category: 'Alpha', condition: 'Condition Alpha 1' }),
      makeStrategy({ category: 'Beta', condition: 'Condition Beta one' }),
      makeStrategy({ category: 'Alpha', condition: 'Condition Alpha 2' }),
    ]
    render(() => <ActionAccordion strategies={strategies} activeContexts={[]} />)
    const headings = screen.getAllByText(/Alpha|Beta/)
    expect(headings.some((el) => el.textContent === 'Alpha')).toBe(true)
    expect(headings.some((el) => el.textContent === 'Beta')).toBe(true)
  })

  it('filters strategies by active context', () => {
    const strategies = [
      makeStrategy({ condition: 'Visible condition here', context: null }),
      makeStrategy({ condition: 'Hidden context condition', context: 'hidden' }),
    ]
    render(() => (
      <ActionAccordion strategies={strategies} activeContexts={['visible']} />
    ))
    expect(screen.getByText('Visible condition here')).toBeInTheDocument()
    expect(screen.queryByText('Hidden context condition')).not.toBeInTheDocument()
  })

  it('expands a condition on click and shows strategy detail', async () => {
    const strategies = [
      makeStrategy({ condition: 'Clickable condition text' }),
    ]
    render(() => <ActionAccordion strategies={strategies} activeContexts={[]} />)
    const btn = screen.getByRole('button', { name: /clickable condition text/i })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  it('collapses on second click', async () => {
    const strategies = [makeStrategy({ condition: 'Toggle condition here' })]
    render(() => <ActionAccordion strategies={strategies} activeContexts={[]} />)
    const btn = screen.getByRole('button', { name: /toggle condition here/i })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('only one condition open at a time', async () => {
    const strategies = [
      makeStrategy({ condition: 'First condition here ok' }),
      makeStrategy({ condition: 'Second condition here ok' }),
    ]
    render(() => <ActionAccordion strategies={strategies} activeContexts={[]} />)
    const [btn1, btn2] = screen.getAllByRole('button')
    fireEvent.click(btn1)
    expect(btn1).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(btn2)
    expect(btn1).toHaveAttribute('aria-expanded', 'false')
    expect(btn2).toHaveAttribute('aria-expanded', 'true')
  })
})

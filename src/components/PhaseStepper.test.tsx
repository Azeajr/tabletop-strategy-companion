import { render, screen, fireEvent } from '@solidjs/testing-library'
import { describe, it, expect, vi } from 'vitest'
import PhaseStepper from './PhaseStepper'

describe('PhaseStepper', () => {
  it('arc (default) marks the current phase as a sequential step', () => {
    render(() => (
      <PhaseStepper phases={['Setup', 'End-Game']} currentPhase="Setup" onPhaseChange={() => {}} />
    ))
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Game phases')
    expect(screen.getByRole('button', { name: 'Setup' })).toHaveAttribute('aria-current', 'step')
  })

  it('modes renders free-select mode tabs, not a stepper', () => {
    render(() => (
      <PhaseStepper
        navStyle="modes"
        phases={['Searching', 'Targeting']}
        currentPhase="Targeting"
        onPhaseChange={() => {}}
      />
    ))
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Game modes')
    // Non-linear: current mode is "true", not the sequential "step".
    expect(screen.getByRole('button', { name: 'Targeting' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: 'Searching' })).not.toHaveAttribute('aria-current')
  })

  it('calls onPhaseChange when a phase is tapped', () => {
    const onChange = vi.fn()
    render(() => (
      <PhaseStepper phases={['A phase', 'B phase']} currentPhase="A phase" onPhaseChange={onChange} />
    ))
    fireEvent.click(screen.getByRole('button', { name: 'B phase' }))
    expect(onChange).toHaveBeenCalledWith('B phase')
  })
})

import { render, screen, fireEvent } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, it, expect } from 'vitest'
import InlineYesNoFilter, { type FilterControl } from './InlineYesNoFilter'

function makeFilter(overrides: Partial<FilterControl> = {}): FilterControl {
  return {
    label: 'Test filter',
    value: () => null,
    onChange: () => {},
    ...overrides,
  }
}

describe('InlineYesNoFilter', () => {
  it('renders filter label', () => {
    render(() => (
      <InlineYesNoFilter filters={[makeFilter({ label: 'Are you leading?' })]} />
    ))
    expect(screen.getByText('Are you leading?')).toBeInTheDocument()
  })

  it('no button active when value is null', () => {
    render(() => <InlineYesNoFilter filters={[makeFilter()]} />)
    const [yes, no] = screen.getAllByRole('button')
    expect(yes).toHaveAttribute('aria-pressed', 'false')
    expect(no).toHaveAttribute('aria-pressed', 'false')
  })

  it('yes button active when value is yes', () => {
    render(() => <InlineYesNoFilter filters={[makeFilter({ value: () => 'yes' })]} />)
    const [yes] = screen.getAllByRole('button')
    expect(yes).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onChange with yes on yes click', () => {
    const [val, setVal] = createSignal<'yes' | 'no' | null>(null)
    render(() => (
      <InlineYesNoFilter filters={[makeFilter({ value: val, onChange: setVal })]} />
    ))
    fireEvent.click(screen.getByText('Yes'))
    expect(val()).toBe('yes')
  })

  it('toggles back to null on second click of same button', () => {
    const [val, setVal] = createSignal<'yes' | 'no' | null>('yes')
    render(() => (
      <InlineYesNoFilter filters={[makeFilter({ value: val, onChange: setVal })]} />
    ))
    fireEvent.click(screen.getByText('Yes'))
    expect(val()).toBe(null)
  })

  it('renders one row per filter', () => {
    render(() => (
      <InlineYesNoFilter
        filters={[
          makeFilter({ label: 'Filter one here' }),
          makeFilter({ label: 'Filter two here' }),
        ]}
      />
    ))
    expect(screen.getByText('Filter one here')).toBeInTheDocument()
    expect(screen.getByText('Filter two here')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })
})

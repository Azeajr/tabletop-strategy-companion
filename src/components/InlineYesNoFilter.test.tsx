import { render, screen, fireEvent } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, it, expect } from 'vitest'
import InlineYesNoFilter from './InlineYesNoFilter'

describe('InlineYesNoFilter', () => {
  it('renders filter label', () => {
    render(() => (
      <InlineYesNoFilter
        filter1Label="Are you leading?"
        filter1Value={null}
        onFilter1Change={() => {}}
        filter2Value={null}
        onFilter2Change={() => {}}
      />
    ))
    expect(screen.getByText('Are you leading?')).toBeInTheDocument()
  })

  it('no button active when value is null', () => {
    render(() => (
      <InlineYesNoFilter
        filter1Label="Test filter"
        filter1Value={null}
        onFilter1Change={() => {}}
        filter2Value={null}
        onFilter2Change={() => {}}
      />
    ))
    const [yes, no] = screen.getAllByRole('button')
    expect(yes).toHaveAttribute('aria-pressed', 'false')
    expect(no).toHaveAttribute('aria-pressed', 'false')
  })

  it('yes button active when value is yes', () => {
    render(() => (
      <InlineYesNoFilter
        filter1Label="Test filter"
        filter1Value="yes"
        onFilter1Change={() => {}}
        filter2Value={null}
        onFilter2Change={() => {}}
      />
    ))
    const [yes] = screen.getAllByRole('button')
    expect(yes).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onChange with yes on yes click', () => {
    const [val, setVal] = createSignal<'yes' | 'no' | null>(null)
    render(() => (
      <InlineYesNoFilter
        filter1Label="Test filter"
        filter1Value={val()}
        onFilter1Change={setVal}
        filter2Value={null}
        onFilter2Change={() => {}}
      />
    ))
    fireEvent.click(screen.getByText('Yes'))
    expect(val()).toBe('yes')
  })

  it('toggles back to null on second click of same button', () => {
    const [val, setVal] = createSignal<'yes' | 'no' | null>('yes')
    render(() => (
      <InlineYesNoFilter
        filter1Label="Test filter"
        filter1Value={val()}
        onFilter1Change={setVal}
        filter2Value={null}
        onFilter2Change={() => {}}
      />
    ))
    fireEvent.click(screen.getByText('Yes'))
    expect(val()).toBe(null)
  })

  it('shows optional second filter when label provided', () => {
    render(() => (
      <InlineYesNoFilter
        filter1Label="Filter one here"
        filter1Value={null}
        onFilter1Change={() => {}}
        filter2Label="Filter two here"
        filter2Value={null}
        onFilter2Change={() => {}}
      />
    ))
    expect(screen.getByText('Filter two here')).toBeInTheDocument()
  })

  it('hides second filter when no label', () => {
    render(() => (
      <InlineYesNoFilter
        filter1Label="Filter one here"
        filter1Value={null}
        onFilter1Change={() => {}}
        filter2Value={null}
        onFilter2Change={() => {}}
      />
    ))
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })
})

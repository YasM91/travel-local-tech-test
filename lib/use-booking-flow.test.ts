import { renderHook, act } from '@testing-library/react'
import { useBookingFlow } from './use-booking-flow'

const MOCK_DATA = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  phone: '+44 7700 900000',
}

describe('useBookingFlow', () => {
  it('initialises at step 2 with no submitted data', () => {
    const { result } = renderHook(() => useBookingFlow())
    expect(result.current.currentStep).toBe(2)
    expect(result.current.submittedData).toBeNull()
  })

  it('accepts a custom initialStep', () => {
    const { result } = renderHook(() => useBookingFlow(1))
    expect(result.current.currentStep).toBe(1)
  })

  it('advances to step 3 when onFormSuccess is called', () => {
    const { result } = renderHook(() => useBookingFlow())
    act(() => result.current.onFormSuccess(MOCK_DATA))
    expect(result.current.currentStep).toBe(3)
  })

  it('stores the submitted data when onFormSuccess is called', () => {
    const { result } = renderHook(() => useBookingFlow())
    act(() => result.current.onFormSuccess(MOCK_DATA))
    expect(result.current.submittedData).toEqual(MOCK_DATA)
  })

  it('is idempotent — calling onFormSuccess again overwrites the previous data', () => {
    const { result } = renderHook(() => useBookingFlow())
    const first = { ...MOCK_DATA, firstName: 'Alice' }
    const second = { ...MOCK_DATA, firstName: 'Bob' }
    act(() => result.current.onFormSuccess(first))
    act(() => result.current.onFormSuccess(second))
    expect(result.current.submittedData?.firstName).toBe('Bob')
    expect(result.current.currentStep).toBe(3)
  })
})

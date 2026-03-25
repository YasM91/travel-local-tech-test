import { renderHook, act } from '@testing-library/react'
import { useBookingFlow } from './use-booking-flow'

const MOCK_DATA = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  phone: '+44 7700 900000',
  numberOfTravellers: 2,
}

describe('useBookingFlow', () => {
  it('initialises at step 2 with no submitted data and isPaid false', () => {
    const { result } = renderHook(() => useBookingFlow())
    expect(result.current.currentStep).toBe(2)
    expect(result.current.submittedData).toBeNull()
    expect(result.current.isPaid).toBe(false)
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

  it('sets isPaid to true and advances to step 4 when onPaymentSuccess is called', () => {
    const { result } = renderHook(() => useBookingFlow())
    act(() => result.current.onFormSuccess(MOCK_DATA))
    act(() => result.current.onPaymentSuccess())
    expect(result.current.isPaid).toBe(true)
    // Step 4 means all 3 step circles resolve to 'complete' in StepIndicator.
    expect(result.current.currentStep).toBe(4)
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

  describe('goBack', () => {
    it('decrements currentStep by 1', () => {
      const { result } = renderHook(() => useBookingFlow())
      act(() => result.current.onFormSuccess(MOCK_DATA)) // step 3
      act(() => result.current.goBack())
      expect(result.current.currentStep).toBe(2)
    })

    it('preserves submittedData when going back (used to pre-fill the form)', () => {
      const { result } = renderHook(() => useBookingFlow())
      act(() => result.current.onFormSuccess(MOCK_DATA))
      act(() => result.current.goBack())
      expect(result.current.submittedData).toEqual(MOCK_DATA)
    })

    it('does nothing when already at step 1', () => {
      const { result } = renderHook(() => useBookingFlow(1))
      act(() => result.current.goBack())
      expect(result.current.currentStep).toBe(1)
    })

    it('does nothing once payment is confirmed', () => {
      const { result } = renderHook(() => useBookingFlow())
      act(() => result.current.onFormSuccess(MOCK_DATA))
      act(() => result.current.onPaymentSuccess())
      act(() => result.current.goBack())
      expect(result.current.currentStep).toBe(4)
      expect(result.current.isPaid).toBe(true)
    })
  })

  describe('goForward', () => {
    it('advances from step 1 to step 2', () => {
      const { result } = renderHook(() => useBookingFlow(1))
      act(() => result.current.goForward())
      expect(result.current.currentStep).toBe(2)
    })

    it('does nothing when currentStep is not 1', () => {
      const { result } = renderHook(() => useBookingFlow())
      // starts at step 2
      act(() => result.current.goForward())
      expect(result.current.currentStep).toBe(2)
    })
  })

  describe('navigateToStep', () => {
    it('jumps directly to a previously completed step', () => {
      const { result } = renderHook(() => useBookingFlow())
      act(() => result.current.onFormSuccess(MOCK_DATA)) // step 3
      act(() => result.current.navigateToStep(1))
      expect(result.current.currentStep).toBe(1)
    })

    it('cannot navigate to the current step', () => {
      const { result } = renderHook(() => useBookingFlow())
      act(() => result.current.onFormSuccess(MOCK_DATA)) // step 3
      act(() => result.current.navigateToStep(3))
      expect(result.current.currentStep).toBe(3)
    })

    it('cannot skip ahead to a future step', () => {
      const { result } = renderHook(() => useBookingFlow())
      // starts at step 2
      act(() => result.current.navigateToStep(3))
      expect(result.current.currentStep).toBe(2)
    })

    it('does nothing once payment is confirmed', () => {
      const { result } = renderHook(() => useBookingFlow())
      act(() => result.current.onFormSuccess(MOCK_DATA))
      act(() => result.current.onPaymentSuccess())
      act(() => result.current.navigateToStep(1))
      expect(result.current.currentStep).toBe(4)
    })
  })
})

import { useState } from 'react'
import type { TravellerDetailsFormData } from './schemas/traveller'

export type BookingFlowState = {
  currentStep: number
  submittedData: TravellerDetailsFormData | null
  onFormSuccess: (data: TravellerDetailsFormData) => void
}

/**
 * Owns the booking flow state: which step is active and what data was submitted.
 * Components receive slices of this state as props — they know nothing about
 * the overall flow.
 */
export function useBookingFlow(initialStep = 2): BookingFlowState {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [submittedData, setSubmittedData] = useState<TravellerDetailsFormData | null>(null)

  const onFormSuccess = (data: TravellerDetailsFormData) => {
    setSubmittedData(data)
    setCurrentStep(3)
  }

  return { currentStep, submittedData, onFormSuccess }
}

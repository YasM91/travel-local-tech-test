import { useState } from 'react'
import type { TravellerDetailsFormData } from '../lib/schemas/traveller'

export type BookingFlowState = {
  currentStep: number
  submittedData: TravellerDetailsFormData | null
  isPaid: boolean
  onFormSuccess: (data: TravellerDetailsFormData) => void
  onPaymentSuccess: () => void
  /**
   * Decrements currentStep by 1 (minimum 1). Does NOT clear submittedData —
   * it persists so TravellerForm re-mounts pre-filled when navigating back.
   */
  goBack: () => void
  /**
   * Advances from Step 1 → Step 2. Only valid when currentStep === 1.
   * Required because navigateToStep only allows backward jumps; this is the
   * one forward-navigation case that bypasses the form submission path.
   */
  goForward: () => void
  /**
   * Jumps directly to any step the user has previously visited (step <
   * currentStep). Forward skipping is intentionally blocked — the user must
   * complete each step in order.
   */
  navigateToStep: (step: number) => void
}

/**
 * Owns the booking flow state: which step is active, what data was submitted,
 * and whether payment has been confirmed.
 *
 * Step progression:
 *   1 → trip overview (reached by pressing Back from step 2)
 *   2 → traveller details form
 *   3 → confirm & pay
 *   4 → all steps complete (payment confirmed)
 */
export function useBookingFlow(initialStep = 2): BookingFlowState {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [submittedData, setSubmittedData] = useState<TravellerDetailsFormData | null>(null)
  const [isPaid, setIsPaid] = useState(false)

  const onFormSuccess = (data: TravellerDetailsFormData) => {
    setSubmittedData(data)
    setCurrentStep(3)
  }

  // Advancing to step 4 means every step index (0,1,2) satisfies index+1 < 4,
  // so StepIndicator's getStatus returns 'complete' for all three steps.
  const onPaymentSuccess = () => {
    setIsPaid(true)
    setCurrentStep(4)
  }

  const goBack = () => {
    if (!isPaid && currentStep > 1) setCurrentStep((s) => s - 1)
  }

  const goForward = () => {
    if (!isPaid && currentStep === 1) setCurrentStep(2)
  }

  const navigateToStep = (step: number) => {
    if (!isPaid && step >= 1 && step < currentStep) setCurrentStep(step)
  }

  return {
    currentStep,
    submittedData,
    isPaid,
    onFormSuccess,
    onPaymentSuccess,
    goBack,
    goForward,
    navigateToStep,
  }
}

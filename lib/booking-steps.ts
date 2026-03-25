export type Step = {
  label: string
  description: string
}

export const BOOKING_STEPS: Step[] = [
  { label: 'Your Trip', description: 'Choose your experience' },
  { label: 'Traveller Details', description: 'Tell us about you' },
  { label: 'Confirm & Pay', description: 'Review and complete' },
]

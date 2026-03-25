import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { z } from 'zod'
import StepIndicator, { type Step } from '../components/StepIndicator'

// ---------------------------------------------------------------------------
// Zod schema — parse (not just validate) so only schema-valid data reaches
// the render layer. Structurally prevents XSS from SSR props.
// ---------------------------------------------------------------------------
const BookingPagePropsSchema = z.object({
  trip: z.object({
    title: z.string(),
    destination: z.string(),
    durationDays: z.number().int().positive(),
    pricePerPersonGbp: z.number().positive(),
  }),
  defaults: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string(),
  }),
  promoMessage: z.string(),
})

export type BookingPageProps = z.infer<typeof BookingPagePropsSchema>

// ---------------------------------------------------------------------------
// getServerSideProps
// ---------------------------------------------------------------------------
export const getServerSideProps: GetServerSideProps<BookingPageProps> = async () => {
  const raw = {
    trip: {
      title: 'Hidden Gems of Kyoto',
      destination: 'Kyoto, Japan',
      durationDays: 10,
      pricePerPersonGbp: 2499,
    },
    defaults: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
    promoMessage: 'Book before 30 April 2026 and save 10%.',
  }

  const props = BookingPagePropsSchema.parse(raw)
  return { props }
}

// ---------------------------------------------------------------------------
// Static constants — hoisted at module level (rendering-hoist-jsx rule).
// ---------------------------------------------------------------------------
const BOOKING_STEPS: Step[] = [
  { label: 'Your Trip', description: 'Choose your experience' },
  { label: 'Traveller Details', description: 'Tell us about you' },
  { label: 'Confirm & Pay', description: 'Review and complete' },
]

const CURRENT_STEP = 2

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function BookingPage({
  trip,
  promoMessage,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <main className="min-h-screen py-10 px-4">
      <div className="card animate-fade-in">
        {/* Step indicator */}
        <StepIndicator steps={BOOKING_STEPS} currentStep={CURRENT_STEP} />

        {/* Trip summary */}
        <section aria-labelledby="trip-summary-heading" className="mt-8">
          <h1 id="trip-summary-heading" className="text-2xl font-bold text-gray-900 tracking-tight">
            {trip.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{trip.destination}</p>

          <p
            role="status"
            className="mt-4 inline-block rounded-lg bg-brand-faint text-brand px-3 py-1.5 text-sm font-medium"
          >
            {promoMessage}
          </p>
        </section>

        {/* Phase 3 placeholder */}
        <p className="mt-8 text-sm text-gray-400">
          Step 2: Traveller Details form — coming in Phase 3.
        </p>
      </div>
    </main>
  )
}

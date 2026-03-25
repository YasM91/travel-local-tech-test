import Head from 'next/head'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { z } from 'zod'
import { BOOKING_STEPS } from '../lib/booking-steps'
import { useBookingFlow } from '../hooks/use-booking-flow'
import StepIndicator from '../components/StepIndicator'
import TravellerForm from '../components/TravellerForm'
import ConfirmPayStep from '../components/ConfirmPayStep'
import SuccessMessage from '../components/SuccessMessage'

// ---------------------------------------------------------------------------
// SSR schema — parse before rendering to prevent XSS from SSR props.
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
    numberOfTravellers: z.number().int().min(1),
  }),
  promoMessage: z.string(),
})

export type BookingPageProps = z.infer<typeof BookingPagePropsSchema>

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
      numberOfTravellers: 1,
    },
    promoMessage: 'Book before 30 April 2026 and save 10%.',
  }

  const props = BookingPagePropsSchema.parse(raw)
  return { props }
}

// ---------------------------------------------------------------------------
// BookingPage — thin orchestration layer. All state lives in useBookingFlow.
//
// Step rendering is driven by currentStep (not submittedData) so that going
// Back from Step 3 re-renders the TravellerForm at Step 2 with the previously
// entered data pre-filled (submittedData persists as a draft on back-nav).
//
// Flow: Step 1 (trip overview) ← back / forward → Step 2 (Traveller Details)
//       → Step 3 (Confirm & Pay) → Confirmed.
// ---------------------------------------------------------------------------
export default function BookingPage({
  trip,
  defaults,
  promoMessage,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const {
    currentStep,
    submittedData,
    isPaid,
    onFormSuccess,
    onPaymentSuccess,
    goBack,
    goForward,
    navigateToStep,
  } = useBookingFlow()

  const pageTitle = isPaid
    ? 'Booking Confirmed — TravelLocal'
    : currentStep === 3
      ? 'Confirm & Pay — TravelLocal'
      : currentStep === 2
        ? 'Traveller Details — TravelLocal'
        : 'Your Trip — TravelLocal'

  const pageDescription = `Book your ${trip.title} trip with TravelLocal — ${trip.durationDays} days in ${trip.destination} from £${trip.pricePerPersonGbp.toLocaleString('en-GB')}.`

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Head>

      <main className="min-h-screen py-10 px-4">
        <div className="card animate-fade-in">
          {/* allComplete advances StepIndicator to currentStep 4 so all circles
              show 'complete', and triggers the celebration animation on step 3.
              onStepClick wires up header back-navigation to completed steps.   */}
          <StepIndicator
            steps={BOOKING_STEPS}
            currentStep={currentStep}
            allComplete={isPaid}
            onStepClick={isPaid ? undefined : navigateToStep}
          />

          {/* aria-live="polite" announces step changes to screen readers without
              interrupting ongoing speech. aria-atomic="false" lets AT announce
              only the new content rather than re-reading the entire region. */}
          <div aria-live="polite" aria-atomic="false">
            {isPaid ? (
              <SuccessMessage data={submittedData!} tripTitle={trip.title} />
            ) : currentStep === 3 ? (
              // ConfirmPayStep shifts focus to itself on mount via useRef +
              // useEffect, ensuring keyboard users follow the step transition.
              <ConfirmPayStep
                data={submittedData!}
                trip={trip}
                onPaymentSuccess={onPaymentSuccess}
                onBack={goBack}
              />
            ) : currentStep === 2 ? (
              <>
                <section aria-labelledby="trip-summary-heading" className="mt-8">
                  <h1
                    id="trip-summary-heading"
                    className="text-2xl font-bold text-gray-900 tracking-tight"
                  >
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

                {/* Pass submittedData as defaults when coming back from Step 3
                    so the form re-mounts with the user's previously entered
                    values pre-filled. Falls back to SSR defaults on first visit. */}
                <TravellerForm
                  defaults={submittedData ?? defaults}
                  onSuccess={onFormSuccess}
                  onBack={goBack}
                />
              </>
            ) : (
              /* Step 1 — Your Trip overview. Reached by pressing Back from
                 Step 2. "Continue" calls goForward() (Step 1 → Step 2 only). */
              <section aria-labelledby="trip-overview-heading" className="mt-8 animate-fade-in">
                <h2 id="trip-overview-heading" className="text-lg font-bold text-gray-900 mb-4">
                  Your Trip
                </h2>

                <dl className="rounded-xl bg-gray-50 border border-gray-200 p-5 mb-6 space-y-2">
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm text-gray-500">Trip</dt>
                    <dd className="text-sm font-medium text-gray-900">{trip.title}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm text-gray-500">Destination</dt>
                    <dd className="text-sm font-medium text-gray-900">{trip.destination}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm text-gray-500">Duration</dt>
                    <dd className="text-sm font-medium text-gray-900">{trip.durationDays} days</dd>
                  </div>
                  <div className="flex justify-between gap-4 pt-3 border-t border-gray-200">
                    <dt className="text-sm font-semibold text-gray-700">Price per person</dt>
                    <dd className="text-base font-bold text-brand">
                      £{trip.pricePerPersonGbp.toLocaleString('en-GB')}
                    </dd>
                  </div>
                </dl>

                <p
                  role="status"
                  className="inline-block rounded-lg bg-brand-faint text-brand px-3 py-1.5 text-sm font-medium mb-6"
                >
                  {promoMessage}
                </p>

                <div className="flex justify-end">
                  <button type="button" className="btn-primary" onClick={goForward}>
                    Continue to Traveller Details
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

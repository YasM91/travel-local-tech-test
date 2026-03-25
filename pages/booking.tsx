import Head from 'next/head'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { z } from 'zod'
import { BOOKING_STEPS } from '../lib/booking-steps'
import { useBookingFlow } from '../lib/use-booking-flow'
import StepIndicator from '../components/StepIndicator'
import TravellerForm from '../components/TravellerForm'
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
    },
    promoMessage: 'Book before 30 April 2026 and save 10%.',
  }

  const props = BookingPagePropsSchema.parse(raw)
  return { props }
}

// ---------------------------------------------------------------------------
// BookingPage — thin orchestration layer. All state lives in useBookingFlow.
// Components receive only the slices of data they need.
// ---------------------------------------------------------------------------
export default function BookingPage({
  trip,
  defaults,
  promoMessage,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { currentStep, submittedData, onFormSuccess } = useBookingFlow()

  const pageTitle = submittedData
    ? 'Booking Confirmed — TravelLocal'
    : 'Traveller Details — TravelLocal'

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Complete your TravelLocal booking." />
      </Head>

      <main className="min-h-screen py-10 px-4">
        <div className="card animate-fade-in">
          <StepIndicator steps={BOOKING_STEPS} currentStep={currentStep} />

          {submittedData ? (
            <SuccessMessage data={submittedData} tripTitle={trip.title} />
          ) : (
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

              <TravellerForm defaults={defaults} onSuccess={onFormSuccess} />
            </>
          )}
        </div>
      </main>
    </>
  )
}

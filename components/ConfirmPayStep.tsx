import { useEffect, useRef, useState } from 'react'
import type { TravellerDetailsFormData } from '../lib/schemas/traveller'

type Trip = {
  title: string
  destination: string
  durationDays: number
  pricePerPersonGbp: number
}

type Props = {
  data: TravellerDetailsFormData
  trip: Trip
  onPaymentSuccess: () => void
  onBack: () => void
  /** Simulated network delay in ms. Override in tests to keep suites fast. */
  payDelay?: number
}

export default function ConfirmPayStep({
  data,
  trip,
  onPaymentSuccess,
  onBack,
  payDelay = 1500,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null)

  // Shift focus here on mount so keyboard / screen-reader users are not left
  // behind when the form transitions to this step. (WCAG 2.4.3)
  useEffect(() => {
    sectionRef.current?.focus()
  }, [])

  const [isPaying, setIsPaying] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')

  // Derived validation — never stored in state to avoid stale reads.
  // Card: strip spaces/dashes, require 13–19 digits (Visa/Mastercard/Amex/Maestro).
  // Expiry: strip spaces, enforce MM/YY.
  // CVC: 3–4 digits.
  const isCardValid =
    /^\d{13,19}$/.test(cardNumber.replace(/[\s-]/g, '')) &&
    /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.replace(/\s/g, '')) &&
    /^\d{3,4}$/.test(cvc)

  const totalTripPrice = trip.pricePerPersonGbp * data.numberOfTravellers
  const price = `£${totalTripPrice.toLocaleString('en-GB')}`

  const handlePay = async () => {
    if (!isCardValid) return
    setIsPaying(true)
    await new Promise<void>((resolve) => setTimeout(resolve, payDelay))
    setIsPaying(false)
    onPaymentSuccess()
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="confirm-pay-heading"
      className="mt-8 animate-fade-in"
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      <h2 id="confirm-pay-heading" className="text-lg font-bold text-gray-900 mb-1">
        Review &amp; Pay
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Please review your booking details and enter your card information to complete the
        reservation.
      </p>

      {/* Booking summary */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Booking Summary</h3>
        <dl className="space-y-2">
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
          <div className="flex justify-between gap-4">
            <dt className="text-sm text-gray-500">Traveller</dt>
            <dd className="text-sm font-medium text-gray-900">
              {data.firstName} {data.lastName}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-sm text-gray-500">Travellers</dt>
            <dd className="text-sm font-medium text-gray-900">{data.numberOfTravellers}</dd>
          </div>
          <div className="flex justify-between gap-4 pt-3 border-t border-gray-200">
            <dt className="text-sm font-semibold text-gray-700">Total due</dt>
            <dd className="text-base font-bold text-brand">{price}</dd>
          </div>
        </dl>
      </div>

      {/* Fake card form — demo only, no real payment is processed */}
      <fieldset className="border-0 p-0 m-0 mb-4">
        <div className="form-group">
          <label htmlFor="card-number" className="label">
            Card number
          </label>
          <input
            id="card-number"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            className="input"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            disabled={isPaying}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="card-expiry" className="label">
              Expiry
            </label>
            <input
              id="card-expiry"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              className="input"
              placeholder="MM / YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              disabled={isPaying}
            />
          </div>
          <div className="form-group">
            <label htmlFor="card-cvc" className="label">
              CVC
            </label>
            <input
              id="card-cvc"
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              className="input"
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              disabled={isPaying}
            />
          </div>
        </div>
      </fieldset>

      <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-6">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          width={14}
          height={14}
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Demo only — no real payment will be taken.
      </p>

      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-gray-900">{price}</span>
        <div className="flex items-center gap-3">
          <button type="button" className="btn-secondary" onClick={onBack} disabled={isPaying}>
            Back
          </button>
          <button
            type="button"
            /**
             * Show teal btn-primary when card is valid (and loading state).
             * Show greyed-out style when card fields are incomplete — using a full
             * alternate class string rather than overriding btn-primary, because
             * Tailwind v4 generates static classes and cascade overrides are unreliable.
             */
            className={
              isCardValid
                ? 'btn-primary'
                : 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-6 py-3 text-base bg-gray-200 text-gray-400 cursor-not-allowed'
            }
            onClick={handlePay}
            aria-busy={isPaying || undefined}
            disabled={!isCardValid || isPaying}
            aria-disabled={!isCardValid || undefined}
          >
            {isPaying ? 'Processing…' : `Pay ${price}`}
          </button>
        </div>
      </div>
    </section>
  )
}

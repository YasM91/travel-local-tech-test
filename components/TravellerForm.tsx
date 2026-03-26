import { useState } from 'react'
import { Resolver, useForm, type SubmitErrorHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TravellerDetailsSchema, type TravellerDetailsFormData } from '../lib/schemas/traveller'

export type { TravellerDetailsFormData }

type Props = {
  defaults: TravellerDetailsFormData
  onSuccess: (data: TravellerDetailsFormData) => void
  /** Called when the user clicks the Back button. Omit to hide the button. */
  onBack?: () => void
  /** Simulated network delay in ms. Override in tests to keep suites fast. */
  submitDelay?: number
  /**
   * Probability (0–1) of a simulated network failure on submit. Default: 0.05
   * (5%). Set to 0 in tests that exercise the happy path to eliminate flakiness.
   */
  failureRate?: number
}

type FieldProps = {
  id: string
  label: string
  type?: string
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  error?: string
  disabled?: boolean
  registration: ReturnType<ReturnType<typeof useForm<TravellerDetailsFormData>>['register']>
}

function Field({
  id,
  label,
  type = 'text',
  autoComplete,
  inputMode,
  error,
  disabled,
  registration,
}: FieldProps) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="label">
        {label}{' '}
        <span aria-hidden="true" className="text-error">
          *
        </span>
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-required="true"
        disabled={disabled}
        {...registration}
      />
      {error ? (
        <p id={`${id}-error`} className="error-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

// The order in which focus is moved when the user submits an invalid form.
// The first field in this list that has an error receives programmatic focus.
// (WCAG 2.4.3 — Focus Order; WCAG 3.3.1 — Error Identification)
const FIELD_ORDER: (keyof TravellerDetailsFormData)[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'numberOfTravellers',
]

export default function TravellerForm({
  defaults,
  onSuccess,
  onBack,
  submitDelay = 1500,
  failureRate = 0.05,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setFocus,
    watch,
    formState: { errors },
  } = useForm<TravellerDetailsFormData>({
    resolver: zodResolver(TravellerDetailsSchema) as Resolver<TravellerDetailsFormData>,
    defaultValues: defaults,
  })

  // Presence check — mirrors ConfirmPayStep's isCardValid pattern.
  // The button is disabled and grey until every required field has content.
  // Format validation (e.g. invalid email) still runs on submit via Zod.
  const watched = watch()
  const isFormFilled =
    (watched.firstName ?? '').trim() !== '' &&
    (watched.lastName ?? '').trim() !== '' &&
    (watched.email ?? '').trim() !== '' &&
    (watched.phone ?? '').trim() !== '' &&
    Number(watched.numberOfTravellers) >= 1

  const onSubmit = async (data: TravellerDetailsFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    await new Promise<void>((resolve) => setTimeout(resolve, submitDelay))
    // Simulate a random network failure to demonstrate unhappy-path handling.
    if (Math.random() < failureRate) {
      setIsSubmitting(false)
      setSubmitError('Something went wrong. Please try again.')
      return
    }
    console.log('Booking payload:', data)
    setIsSubmitting(false)
    onSuccess(data)
  }

  // Move focus to the first invalid field so keyboard / screen-reader users
  // land on the error immediately without needing to tab through the form.
  const onError: SubmitErrorHandler<TravellerDetailsFormData> = (fieldErrors) => {
    const firstField = FIELD_ORDER.find((f) => fieldErrors[f])
    if (firstField) setFocus(firstField)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      noValidate
      aria-label="Traveller details"
      className="mt-8"
    >
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-lg font-bold text-gray-900 mb-1">Your Details</legend>
        <p className="text-sm text-gray-500 mb-6">
          Fields marked <span aria-hidden="true">*</span> are required.
        </p>

        {/* Submission error banner — role="alert" triggers an assertive live
            region so screen readers announce the failure immediately. */}
        {submitError ? (
          <div
            role="alert"
            className="mb-6 flex items-center gap-2 rounded-xl border border-error bg-red-50 px-4 py-3 text-sm font-medium text-error"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              width={16}
              height={16}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {submitError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Field
            id="firstName"
            label="First name"
            autoComplete="given-name"
            error={errors.firstName?.message}
            disabled={isSubmitting}
            registration={register('firstName')}
          />
          <Field
            id="lastName"
            label="Last name"
            autoComplete="family-name"
            error={errors.lastName?.message}
            disabled={isSubmitting}
            registration={register('lastName')}
          />
        </div>

        <Field
          id="email"
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          error={errors.email?.message}
          disabled={isSubmitting}
          registration={register('email')}
        />

        <Field
          id="phone"
          label="Phone number"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          disabled={isSubmitting}
          registration={register('phone')}
        />

        <Field
          id="numberOfTravellers"
          label="Number of travellers"
          type="number"
          inputMode="numeric"
          error={errors.numberOfTravellers?.message}
          disabled={isSubmitting}
          registration={register('numberOfTravellers')}
        />
      </fieldset>

      <div className="flex items-center justify-between mt-6">
        {onBack ? (
          <button type="button" className="btn-secondary" onClick={onBack} disabled={isSubmitting}>
            Back
          </button>
        ) : (
          // Empty span keeps the primary button right-aligned when there is no Back.
          <span />
        )}
        <button
          type="submit"
          /**
           * Show teal btn-primary when the form has content (and loading state).
           * Show greyed-out style when any required field is empty — using a full
           * alternate class string rather than overriding btn-primary, because
           * Tailwind v4 generates static classes and cascade overrides are unreliable.
           */
          className={
            isFormFilled
              ? 'btn-primary'
              : 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-6 py-3 text-base bg-gray-200 text-gray-400 cursor-not-allowed'
          }
          aria-busy={isSubmitting || undefined}
          disabled={!isFormFilled || isSubmitting}
          aria-disabled={!isFormFilled || undefined}
        >
          {isSubmitting ? 'Confirming…' : 'Continue to Payment'}
        </button>
      </div>
    </form>
  )
}

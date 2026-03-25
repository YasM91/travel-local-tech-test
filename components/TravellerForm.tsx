import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Zod schema — single source of truth for validation and the TypeScript type.
// ---------------------------------------------------------------------------
export const TravellerDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email address is required').email('Enter a valid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s\-(). ]{6,}$/, 'Enter a valid phone number'),
})

export type TravellerDetailsFormData = z.infer<typeof TravellerDetailsSchema>

type Props = {
  defaults: TravellerDetailsFormData
  onSuccess: (data: TravellerDetailsFormData) => void
  /** Simulated network delay in ms. Override in tests to keep suites fast. */
  submitDelay?: number
}

// ---------------------------------------------------------------------------
// Field helper — keeps the JSX DRY without premature abstraction.
// ---------------------------------------------------------------------------
type FieldProps = {
  id: string
  label: string
  type?: string
  autoComplete?: string
  error?: string
  registration: ReturnType<ReturnType<typeof useForm<TravellerDetailsFormData>>['register']>
}

function Field({ id, label, type = 'text', autoComplete, error, registration }: FieldProps) {
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
        className="input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-required="true"
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

// ---------------------------------------------------------------------------
// TravellerForm
// ---------------------------------------------------------------------------
export default function TravellerForm({ defaults, onSuccess, submitDelay = 1000 }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TravellerDetailsFormData>({
    resolver: zodResolver(TravellerDetailsSchema),
    defaultValues: defaults,
  })

  const onSubmit = async (data: TravellerDetailsFormData) => {
    setIsSubmitting(true)
    await new Promise<void>((resolve) => setTimeout(resolve, submitDelay))
    console.log('Booking payload:', data)
    setIsSubmitting(false)
    onSuccess(data)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Traveller details"
      className="mt-8"
    >
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-lg font-bold text-gray-900 mb-1">Your Details</legend>
        {/* WCAG 3.3.2 — explicit explanation of the required-field indicator */}
        <p className="text-sm text-gray-500 mb-6">
          Fields marked <span aria-hidden="true">*</span> are required.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Field
            id="firstName"
            label="First name"
            autoComplete="given-name"
            error={errors.firstName?.message}
            registration={register('firstName')}
          />
          <Field
            id="lastName"
            label="Last name"
            autoComplete="family-name"
            error={errors.lastName?.message}
            registration={register('lastName')}
          />
        </div>

        <Field
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          registration={register('email')}
        />

        <Field
          id="phone"
          label="Phone number"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          registration={register('phone')}
        />
      </fieldset>

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="btn-primary"
          aria-busy={isSubmitting || undefined}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Confirming…' : 'Continue to Payment'}
        </button>
      </div>
    </form>
  )
}

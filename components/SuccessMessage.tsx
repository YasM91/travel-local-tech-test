import { useEffect, useRef } from 'react'
import type { TravellerDetailsFormData } from '../lib/schemas/traveller'

type Props = {
  data: TravellerDetailsFormData
  tripTitle: string
}

export default function SuccessMessage({ data, tripTitle }: Props) {
  const sectionRef = useRef<HTMLElement>(null)

  // Move focus to the success section on mount so keyboard and screen-reader
  // users immediately know the form has been replaced. (WCAG 2.4.3)
  useEffect(() => {
    sectionRef.current?.focus()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="success-heading"
      className="py-8 text-center animate-fade-in"
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-faint text-brand mb-6"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          width={32}
          height={32}
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>

      <h2 id="success-heading" className="text-2xl font-bold text-gray-900 mb-2">
        You&apos;re all set, {data.firstName}!
      </h2>
      <p className="text-gray-500 mb-8">
        Your details have been saved for{' '}
        <span className="font-semibold text-gray-700">{tripTitle}</span>.
      </p>

      <dl className="text-left max-w-xs mx-auto space-y-3 rounded-xl bg-gray-50 border border-gray-200 p-5">
        <div className="flex justify-between gap-4">
          <dt className="text-sm font-semibold text-gray-500">Name</dt>
          <dd className="text-sm text-gray-900 font-medium">
            {data.firstName} {data.lastName}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-sm font-semibold text-gray-500">Email</dt>
          <dd className="text-sm text-gray-900 font-medium break-all">{data.email}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-sm font-semibold text-gray-500">Phone</dt>
          <dd className="text-sm text-gray-900 font-medium">{data.phone}</dd>
        </div>
      </dl>
    </section>
  )
}

import { useEffect, useRef } from 'react'
import type { TravellerDetailsFormData } from '../lib/schemas/traveller'

type Props = {
  data: TravellerDetailsFormData
  tripTitle: string
}

// Predetermined confetti particles — module-level const so SSR and CSR produce
// identical output (no Math.random() at render time).
// Two animation variants alternate for clockwise / counter-clockwise rotation.
const CONFETTI_PIECES = [
  { left: '5%', bg: '#0f766e', delay: '0s', dur: '2.0s', size: 8 },
  { left: '12%', bg: '#f59e0b', delay: '0.15s', dur: '2.3s', size: 6 },
  { left: '20%', bg: '#3b82f6', delay: '0.05s', dur: '1.8s', size: 10 },
  { left: '28%', bg: '#f43f5e', delay: '0.25s', dur: '2.1s', size: 7 },
  { left: '38%', bg: '#8b5cf6', delay: '0.1s', dur: '2.4s', size: 8 },
  { left: '48%', bg: '#f97316', delay: '0.35s', dur: '1.9s', size: 6 },
  { left: '55%', bg: '#84cc16', delay: '0.2s', dur: '2.2s', size: 9 },
  { left: '63%', bg: '#14b8a6', delay: '0s', dur: '2.0s', size: 7 },
  { left: '72%', bg: '#f59e0b', delay: '0.1s', dur: '2.3s', size: 8 },
  { left: '80%', bg: '#f43f5e', delay: '0.3s', dur: '1.7s', size: 6 },
  { left: '88%', bg: '#0f766e', delay: '0.15s', dur: '2.1s', size: 10 },
  { left: '95%', bg: '#3b82f6', delay: '0.4s', dur: '2.0s', size: 7 },
  { left: '15%', bg: '#8b5cf6', delay: '0.45s', dur: '2.4s', size: 8 },
  { left: '33%', bg: '#f97316', delay: '0.05s', dur: '1.8s', size: 6 },
  { left: '50%', bg: '#84cc16', delay: '0.3s', dur: '2.2s', size: 9 },
  { left: '68%', bg: '#f43f5e', delay: '0.2s', dur: '1.9s', size: 7 },
  { left: '83%', bg: '#14b8a6', delay: '0.1s', dur: '2.1s', size: 8 },
  { left: '43%', bg: '#0f766e', delay: '0.35s', dur: '2.0s', size: 6 },
  { left: '58%', bg: '#f59e0b', delay: '0.15s', dur: '2.3s', size: 9 },
  { left: '75%', bg: '#3b82f6', delay: '0.25s', dur: '1.8s', size: 7 },
] as const

export default function SuccessMessage({ data, tripTitle }: Props) {
  const sectionRef = useRef<HTMLElement>(null)

  // Move focus to the success section on mount so keyboard and screen-reader
  // users immediately know the payment step has been replaced. (WCAG 2.4.3)
  useEffect(() => {
    sectionRef.current?.focus()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="success-heading"
      className="py-8 text-center animate-fade-in relative overflow-hidden"
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      {/* Confetti rain — aria-hidden so screen readers skip the decoration */}
      <div
        aria-hidden="true"
        data-confetti
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {CONFETTI_PIECES.map((p, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: p.left,
              top: '-16px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.bg,
              borderRadius: i % 3 === 0 ? '50%' : '2px',
              animationName: i % 2 === 0 ? 'confetti-fall' : 'confetti-fall-ccw',
              animationDuration: p.dur,
              animationDelay: p.delay,
              animationTimingFunction: 'ease-in',
              animationFillMode: 'forwards',
            }}
          />
        ))}
      </div>

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
        Booking confirmed, {data.firstName}!
      </h2>
      <p className="text-gray-500 mb-8">
        Payment received. Your place on{' '}
        <span className="font-semibold text-gray-700">{tripTitle}</span> is secured.
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
        <div className="flex justify-between gap-4">
          <dt className="text-sm font-semibold text-gray-500">Travellers</dt>
          <dd className="text-sm text-gray-900 font-medium">{data.numberOfTravellers}</dd>
        </div>
      </dl>
    </section>
  )
}

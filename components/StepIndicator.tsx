import type { Step } from '../lib/booking-steps'

type StepStatus = 'complete' | 'current' | 'upcoming'

type Props = {
  steps: Step[]
  currentStep: number // 1-based
  /**
   * When true, applies a pop + ring-pulse celebration animation to the final
   * step circle (used when all steps are complete after payment confirmation).
   */
  allComplete?: boolean
  /**
   * When provided, completed steps are rendered as interactive <button>
   * elements so the user can navigate back via the progress header.
   * Called with the 1-based step number of the step that was clicked.
   */
  onStepClick?: (stepNumber: number) => void
}

// Hoisted at module level — never recreated on re-render.
function getStatus(index: number, currentStep: number): StepStatus {
  if (index + 1 < currentStep) return 'complete'
  if (index + 1 === currentStep) return 'current'
  return 'upcoming'
}

const circleClass: Record<StepStatus, string> = {
  complete: 'bg-brand border-brand text-white',
  current: 'bg-white border-brand text-brand',
  upcoming: 'bg-white border-gray-300 text-gray-400',
}

const labelClass: Record<StepStatus, string> = {
  complete: 'text-gray-900',
  current: 'text-brand font-bold',
  upcoming: 'text-gray-400',
}

export default function StepIndicator({
  steps,
  currentStep,
  allComplete = false,
  onStepClick,
}: Props) {
  return (
    <nav aria-label="Booking progress">
      <ol className="flex items-start" role="list">
        {steps.map((step, index) => {
          const status = getStatus(index, currentStep)
          const stepNumber = index + 1
          const isLast = index === steps.length - 1
          const isClickable = status === 'complete' && !!onStepClick

          // The circle and label are shared between the clickable and
          // non-clickable renders — extracted to avoid duplication.
          const stepContent = (
            <>
              <span
                aria-hidden="true"
                className={[
                  'relative z-10 flex items-center justify-center w-9 h-9 rounded-full border-2 text-sm font-semibold transition-colors',
                  circleClass[status],
                  allComplete && isLast ? 'step-celebrate' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {status === 'complete' ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width={14}
                    height={14}
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </span>

              <span className="flex flex-col mt-2 gap-0.5">
                <span className={['text-[0.8125rem] font-semibold', labelClass[status]].join(' ')}>
                  {step.label}
                </span>
                <span className="text-xs text-gray-400">{step.description}</span>
              </span>
            </>
          )

          return (
            <li
              key={step.label}
              className="flex flex-1 flex-col items-center relative text-center"
              data-status={status}
              aria-current={status === 'current' ? 'step' : undefined}
            >
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={[
                    'absolute top-4.5 left-1/2 w-full h-0.5 z-0 transition-colors',
                    status === 'complete' ? 'bg-brand' : 'bg-gray-200',
                  ].join(' ')}
                />
              ) : null}

              {isClickable ? (
                // Completed step — interactive so the user can jump back.
                // The button's accessible name comes from the visible label
                // text inside it (e.g. "Your Trip Choose your experience").
                <button
                  type="button"
                  onClick={() => onStepClick!(stepNumber)}
                  className="flex flex-col items-center w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-md cursor-pointer"
                >
                  {stepContent}
                </button>
              ) : (
                <div className="flex flex-col items-center w-full">{stepContent}</div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

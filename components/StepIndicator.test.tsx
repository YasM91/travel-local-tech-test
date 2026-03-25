import { render, screen } from '@testing-library/react'
import StepIndicator, { type Step } from './StepIndicator'

const STEPS: Step[] = [
  { label: 'Your Trip', description: 'Choose your experience' },
  { label: 'Traveller Details', description: 'Tell us about you' },
  { label: 'Confirm & Pay', description: 'Review and complete' },
]

describe('StepIndicator', () => {
  describe('Semantic structure', () => {
    it('renders a <nav> with an accessible label', () => {
      render(<StepIndicator steps={STEPS} currentStep={1} />)
      expect(screen.getByRole('navigation', { name: 'Booking progress' })).not.toBeNull()
    })

    it('renders the correct number of steps', () => {
      render(<StepIndicator steps={STEPS} currentStep={1} />)
      expect(screen.getAllByRole('listitem')).toHaveLength(STEPS.length)
    })

    it('renders each step label', () => {
      render(<StepIndicator steps={STEPS} currentStep={1} />)
      STEPS.forEach(({ label }) => {
        expect(screen.getByText(label)).not.toBeNull()
      })
    })

    it('renders each step description', () => {
      render(<StepIndicator steps={STEPS} currentStep={1} />)
      STEPS.forEach(({ description }) => {
        expect(screen.getByText(description)).not.toBeNull()
      })
    })
  })

  describe('aria-current state', () => {
    it("sets aria-current='step' on the active step only", () => {
      render(<StepIndicator steps={STEPS} currentStep={2} />)
      const items = screen.getAllByRole('listitem')

      expect(items[0].getAttribute('aria-current')).toBeNull()
      expect(items[1].getAttribute('aria-current')).toBe('step')
      expect(items[2].getAttribute('aria-current')).toBeNull()
    })

    it("sets aria-current='step' on step 1 when currentStep=1", () => {
      render(<StepIndicator steps={STEPS} currentStep={1} />)
      const items = screen.getAllByRole('listitem')

      expect(items[0].getAttribute('aria-current')).toBe('step')
      expect(items[1].getAttribute('aria-current')).toBeNull()
      expect(items[2].getAttribute('aria-current')).toBeNull()
    })

    it("sets aria-current='step' on the last step when currentStep=3", () => {
      render(<StepIndicator steps={STEPS} currentStep={3} />)
      const items = screen.getAllByRole('listitem')

      expect(items[0].getAttribute('aria-current')).toBeNull()
      expect(items[1].getAttribute('aria-current')).toBeNull()
      expect(items[2].getAttribute('aria-current')).toBe('step')
    })
  })

  describe('data-status attribute', () => {
    it('marks steps before currentStep as complete', () => {
      render(<StepIndicator steps={STEPS} currentStep={3} />)
      const items = screen.getAllByRole('listitem')

      expect(items[0].getAttribute('data-status')).toBe('complete')
      expect(items[1].getAttribute('data-status')).toBe('complete')
    })

    it('marks the active step as current', () => {
      render(<StepIndicator steps={STEPS} currentStep={2} />)
      const items = screen.getAllByRole('listitem')

      expect(items[1].getAttribute('data-status')).toBe('current')
    })

    it('marks steps after currentStep as upcoming', () => {
      render(<StepIndicator steps={STEPS} currentStep={1} />)
      const items = screen.getAllByRole('listitem')

      expect(items[1].getAttribute('data-status')).toBe('upcoming')
      expect(items[2].getAttribute('data-status')).toBe('upcoming')
    })
  })

  describe('Checkmark for completed steps', () => {
    it('renders an SVG checkmark for each completed step', () => {
      const { container } = render(<StepIndicator steps={STEPS} currentStep={3} />)
      // Steps 1 and 2 are complete — each has one SVG
      const svgs = container.querySelectorAll('svg')
      expect(svgs).toHaveLength(2)
    })

    it('does not render an SVG for current or upcoming steps', () => {
      const { container } = render(<StepIndicator steps={STEPS} currentStep={1} />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs).toHaveLength(0)
    })
  })
})

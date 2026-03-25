import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookingPage, { getServerSideProps, type BookingPageProps } from '../pages/booking'
import type { GetServerSidePropsContext } from 'next'

const BASE_PROPS: BookingPageProps = {
  trip: {
    title: 'Hidden Gems of Kyoto',
    destination: 'Kyoto, Japan',
    durationDays: 10,
    pricePerPersonGbp: 2499,
  },
  defaults: { firstName: '', lastName: '', email: '', phone: '' },
  promoMessage: 'Book before 30 April 2026 and save 10%.',
}

// ---------------------------------------------------------------------------
// getServerSideProps — covers the previously uncovered lines 34-51
// ---------------------------------------------------------------------------
// Helper: resolves the props shape from getServerSideProps, bypassing the
// `T | Promise<T>` union that Next.js uses for async props support.
async function resolveGSP() {
  const result = await getServerSideProps({} as GetServerSidePropsContext)
  const { props } = result as { props: BookingPageProps }
  return props
}

describe('getServerSideProps', () => {
  it('returns the correct trip details', async () => {
    const props = await resolveGSP()
    expect(props.trip.title).toBe('Hidden Gems of Kyoto')
    expect(props.trip.destination).toBe('Kyoto, Japan')
    expect(props.trip.durationDays).toBe(10)
    expect(props.trip.pricePerPersonGbp).toBe(2499)
  })

  it('returns empty string defaults for all form fields', async () => {
    const props = await resolveGSP()
    expect(props.defaults).toEqual({ firstName: '', lastName: '', email: '', phone: '' })
  })

  it('returns the promo message', async () => {
    const props = await resolveGSP()
    expect(props.promoMessage).toBe('Book before 30 April 2026 and save 10%.')
  })
})

// ---------------------------------------------------------------------------
// BookingPage — static render
// ---------------------------------------------------------------------------
describe('BookingPage', () => {
  describe('Initial render', () => {
    it('renders a <main> landmark', () => {
      render(<BookingPage {...BASE_PROPS} />)
      expect(screen.getByRole('main')).not.toBeNull()
    })

    it('renders the trip title in an h1', () => {
      render(<BookingPage {...BASE_PROPS} />)
      expect(screen.getByRole('heading', { level: 1, name: 'Hidden Gems of Kyoto' })).not.toBeNull()
    })

    it('renders the destination', () => {
      render(<BookingPage {...BASE_PROPS} />)
      expect(screen.getByText('Kyoto, Japan')).not.toBeNull()
    })

    it('renders the promo message in a live region', () => {
      render(<BookingPage {...BASE_PROPS} />)
      const status = screen.getByRole('status')
      expect(status.textContent).toBe('Book before 30 April 2026 and save 10%.')
    })

    it('renders the booking progress nav', () => {
      render(<BookingPage {...BASE_PROPS} />)
      expect(screen.getByRole('navigation', { name: 'Booking progress' })).not.toBeNull()
    })

    it("marks step 2 as aria-current='step' on initial load", () => {
      render(<BookingPage {...BASE_PROPS} />)
      const items = screen.getAllByRole('listitem')
      expect(items[0].getAttribute('aria-current')).toBeNull()
      expect(items[1].getAttribute('aria-current')).toBe('step')
      expect(items[2].getAttribute('aria-current')).toBeNull()
    })

    it('renders all three step labels', () => {
      render(<BookingPage {...BASE_PROPS} />)
      expect(screen.getByText('Your Trip')).not.toBeNull()
      expect(screen.getByText('Traveller Details')).not.toBeNull()
      expect(screen.getByText('Confirm & Pay')).not.toBeNull()
    })
  })

  describe('Prop variations', () => {
    it('renders a different trip title when props change', () => {
      render(
        <BookingPage {...BASE_PROPS} trip={{ ...BASE_PROPS.trip, title: 'Coastal Portugal' }} />
      )
      expect(screen.getByRole('heading', { level: 1, name: 'Coastal Portugal' })).not.toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // Full flow integration — fill form → submit → assert success + step advance
  // Uses submitDelay via TravellerForm's default (bypassed via fast userEvent)
  // ---------------------------------------------------------------------------
  describe('Full booking flow integration', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    afterAll(() => consoleSpy.mockRestore())

    async function completeForm() {
      const user = userEvent.setup()
      // Render with submitDelay=0 passed through to TravellerForm via booking page
      // We test the component tree; the 1s delay is a UX concern not a logic concern.
      render(<BookingPage {...BASE_PROPS} />)

      await user.type(screen.getByLabelText(/first name/i), 'Jane')
      await user.type(screen.getByLabelText(/last name/i), 'Smith')
      await user.type(screen.getByLabelText(/email address/i), 'jane@example.com')
      await user.type(screen.getByLabelText(/phone number/i), '+44 7700 900000')
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))
    }

    it('shows the SuccessMessage after valid submission', async () => {
      await completeForm()
      await waitFor(
        () =>
          expect(screen.getByRole('heading', { level: 2, name: /you're all set/i })).not.toBeNull(),
        { timeout: 3000 }
      )
    })

    it('advances the step indicator to step 3 after submission', async () => {
      await completeForm()
      await waitFor(
        () => {
          const items = screen.getAllByRole('listitem')
          expect(items[2].getAttribute('aria-current')).toBe('step')
        },
        { timeout: 3000 }
      )
    })

    it('marks steps 1 and 2 as complete after submission', async () => {
      await completeForm()
      await waitFor(
        () => {
          const items = screen.getAllByRole('listitem')
          expect(items[0].getAttribute('data-status')).toBe('complete')
          expect(items[1].getAttribute('data-status')).toBe('complete')
          expect(items[2].getAttribute('data-status')).toBe('current')
        },
        { timeout: 3000 }
      )
    })

    it('displays the submitted name in the success summary', async () => {
      await completeForm()
      await waitFor(() => expect(screen.getByText('Jane Smith')).not.toBeNull(), {
        timeout: 3000,
      })
    })

    it('hides the form after submission', async () => {
      await completeForm()
      await waitFor(
        () => expect(screen.queryByRole('form', { name: 'Traveller details' })).toBeNull(),
        { timeout: 3000 }
      )
    })
  })
})

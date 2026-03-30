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
  defaults: { firstName: '', lastName: '', email: '', phone: '', numberOfTravellers: 1 },
  promoMessage: 'Book before 30 April 2026 and save 10%.',
}

// ---------------------------------------------------------------------------
// getServerSideProps
// ---------------------------------------------------------------------------
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

  it('returns empty string defaults for text fields and 1 for numberOfTravellers', async () => {
    const props = await resolveGSP()
    expect(props.defaults).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      numberOfTravellers: 1,
    })
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
  // Full flow integration
  // Step 2 (TravellerForm) → Step 3 (ConfirmPayStep) → Booking confirmed
  // ---------------------------------------------------------------------------
  describe('Full booking flow integration', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    afterAll(() => consoleSpy.mockRestore())

    // Pin Math.random above the 5% failure threshold so the simulated network
    // error never fires during integration tests that exercise the happy path.
    beforeEach(() => vi.spyOn(Math, 'random').mockReturnValue(0.99))
    afterEach(() => vi.restoreAllMocks())

    /** Fills the traveller form and clicks "Continue to Payment". Returns the user instance. */
    async function fillAndSubmitForm() {
      const user = userEvent.setup()
      render(<BookingPage {...BASE_PROPS} />)

      await user.type(screen.getByLabelText(/first name/i), 'Jane')
      await user.type(screen.getByLabelText(/last name/i), 'Smith')
      await user.type(screen.getByLabelText(/email address/i), 'jane@example.com')
      await user.type(screen.getByLabelText(/phone number/i), '+44 7700 900000')
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))
      return user
    }

    /**
     * Fills the card fields in ConfirmPayStep and clicks Pay.
     * The Pay button is disabled until all three fields pass validation,
     * so this helper waits for ConfirmPayStep to mount before typing.
     */
    async function fillCardAndPay(user: ReturnType<typeof userEvent.setup>) {
      await waitFor(() => screen.getByLabelText(/card number/i), { timeout: 3000 })
      await user.type(screen.getByLabelText(/card number/i), '4111111111111111')
      await user.type(screen.getByLabelText(/expiry/i), '12/28')
      await user.type(screen.getByLabelText(/cvc/i), '123')
      await user.click(screen.getByRole('button', { name: /^pay/i }))
    }

    it('shows the Confirm & Pay step after form submission', async () => {
      await fillAndSubmitForm()
      await waitFor(
        () =>
          expect(screen.getByRole('heading', { level: 2, name: /review & pay/i })).not.toBeNull(),
        { timeout: 3000 }
      )
    })

    it('advances the step indicator to step 3 after form submission', async () => {
      await fillAndSubmitForm()
      await waitFor(
        () => {
          const items = screen.getAllByRole('listitem')
          expect(items[2].getAttribute('aria-current')).toBe('step')
        },
        { timeout: 3000 }
      )
    })

    it('marks steps 1 and 2 as complete after form submission', async () => {
      await fillAndSubmitForm()
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

    it('hides the traveller form after submission', async () => {
      await fillAndSubmitForm()
      await waitFor(
        () => expect(screen.queryByRole('form', { name: 'Traveller details' })).toBeNull(),
        { timeout: 3000 }
      )
    })

    it('shows booking confirmation after filling card details and clicking Pay', async () => {
      const user = await fillAndSubmitForm()
      await fillCardAndPay(user)
      await waitFor(
        () =>
          expect(
            screen.getByRole('heading', { level: 2, name: /booking confirmed/i })
          ).not.toBeNull(),
        { timeout: 4000 }
      )
    })

    it('displays the submitted name in the booking confirmation', async () => {
      const user = await fillAndSubmitForm()
      await fillCardAndPay(user)
      await waitFor(() => expect(screen.getByText('Jane Smith')).not.toBeNull(), {
        timeout: 4000,
      })
    })

    it('preserves form data when navigating back from Step 3 to Step 2', async () => {
      const user = await fillAndSubmitForm()
      // Wait for ConfirmPayStep
      await waitFor(
        () =>
          expect(screen.getByRole('heading', { level: 2, name: /review & pay/i })).not.toBeNull(),
        { timeout: 3000 }
      )
      // Click Back
      await user.click(screen.getByRole('button', { name: /^back$/i }))
      // TravellerForm should re-appear pre-filled
      await waitFor(
        () => {
          expect((screen.getByLabelText(/first name/i) as HTMLInputElement).value).toBe('Jane')
          expect((screen.getByLabelText(/email address/i) as HTMLInputElement).value).toBe(
            'jane@example.com'
          )
        },
        { timeout: 3000 }
      )
    })

    it('marks all three steps as complete after payment', async () => {
      const user = await fillAndSubmitForm()
      await fillCardAndPay(user)
      await waitFor(
        () => {
          const items = screen.getAllByRole('listitem')
          expect(items[0].getAttribute('data-status')).toBe('complete')
          expect(items[1].getAttribute('data-status')).toBe('complete')
          expect(items[2].getAttribute('data-status')).toBe('complete')
        },
        { timeout: 4000 }
      )
    })

    it('shows the correct total price for 2 travellers (2 × £2,499 = £4,998) in ConfirmPayStep', async () => {
      const user = userEvent.setup()
      render(<BookingPage {...BASE_PROPS} />)
      await user.type(screen.getByLabelText(/first name/i), 'Jane')
      await user.type(screen.getByLabelText(/last name/i), 'Smith')
      await user.type(screen.getByLabelText(/email address/i), 'jane@example.com')
      await user.type(screen.getByLabelText(/phone number/i), '+44 7700 900000')
      await user.clear(screen.getByLabelText(/number of travellers/i))
      await user.type(screen.getByLabelText(/number of travellers/i), '2')
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))
      await waitFor(
        () => expect(screen.getByRole('button', { name: /pay £4,998/i })).not.toBeNull(),
        { timeout: 3000 }
      )
    })
  })
})

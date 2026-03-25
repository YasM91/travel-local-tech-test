import { render, screen } from '@testing-library/react'
import BookingPage, { type BookingPageProps } from './booking'

// Base props matching the shape returned by getServerSideProps.
const BASE_PROPS: BookingPageProps = {
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

describe('BookingPage', () => {
  describe('Trip summary rendering', () => {
    it('renders the trip title in an h1', () => {
      render(<BookingPage {...BASE_PROPS} />)
      const heading = screen.getByRole('heading', { level: 1, name: 'Hidden Gems of Kyoto' })
      expect(heading).not.toBeNull()
    })

    it('renders the destination', () => {
      render(<BookingPage {...BASE_PROPS} />)
      expect(screen.getByText('Kyoto, Japan')).not.toBeNull()
    })

    it('renders the promo message', () => {
      render(<BookingPage {...BASE_PROPS} />)
      expect(screen.getByText('Book before 30 April 2026 and save 10%.')).not.toBeNull()
    })

    it('renders the promo message in a live region (role=status)', () => {
      render(<BookingPage {...BASE_PROPS} />)
      const status = screen.getByRole('status')
      expect(status.textContent).toBe('Book before 30 April 2026 and save 10%.')
    })
  })

  describe('Step indicator integration', () => {
    it('renders the booking progress nav', () => {
      render(<BookingPage {...BASE_PROPS} />)
      expect(screen.getByRole('navigation', { name: 'Booking progress' })).not.toBeNull()
    })

    it("marks step 2 (Traveller Details) as aria-current='step'", () => {
      render(<BookingPage {...BASE_PROPS} />)
      const items = screen.getAllByRole('listitem')
      // Step 1 — complete
      expect(items[0].getAttribute('aria-current')).toBeNull()
      // Step 2 — active
      expect(items[1].getAttribute('aria-current')).toBe('step')
      // Step 3 — upcoming
      expect(items[2].getAttribute('aria-current')).toBeNull()
    })

    it('renders all three step labels', () => {
      render(<BookingPage {...BASE_PROPS} />)
      expect(screen.getByText('Your Trip')).not.toBeNull()
      expect(screen.getByText('Traveller Details')).not.toBeNull()
      expect(screen.getByText('Confirm & Pay')).not.toBeNull()
    })
  })

  describe('Main landmark', () => {
    it('renders a <main> landmark', () => {
      render(<BookingPage {...BASE_PROPS} />)
      expect(screen.getByRole('main')).not.toBeNull()
    })
  })

  describe('Prop variations', () => {
    it('renders a different trip title when props change', () => {
      render(
        <BookingPage {...BASE_PROPS} trip={{ ...BASE_PROPS.trip, title: 'Coastal Portugal' }} />
      )
      expect(screen.getByRole('heading', { level: 1, name: 'Coastal Portugal' })).not.toBeNull()
    })

    it('renders a different promo message when props change', () => {
      render(<BookingPage {...BASE_PROPS} promoMessage="Limited spaces available." />)
      expect(screen.getByText('Limited spaces available.')).not.toBeNull()
    })
  })
})

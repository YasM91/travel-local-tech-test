import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmPayStep from './ConfirmPayStep'
import type { TravellerDetailsFormData } from '../lib/schemas/traveller'

const MOCK_DATA: TravellerDetailsFormData = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  phone: '+44 7700 900000',
  numberOfTravellers: 2,
}

const MOCK_TRIP = {
  title: 'Hidden Gems of Kyoto',
  destination: 'Kyoto, Japan',
  durationDays: 10,
  pricePerPersonGbp: 2499,
}

describe('ConfirmPayStep', () => {
  describe('Pay button gating', () => {
    it('disables the Pay button when all card fields are empty', () => {
      render(
        <ConfirmPayStep data={MOCK_DATA} trip={MOCK_TRIP} onPaymentSuccess={vi.fn()} payDelay={0} />
      )
      expect(screen.getByRole('button', { name: /^pay/i }).hasAttribute('disabled')).toBe(true)
    })

    it('keeps Pay disabled when only the card number is filled', async () => {
      const user = userEvent.setup()
      render(
        <ConfirmPayStep data={MOCK_DATA} trip={MOCK_TRIP} onPaymentSuccess={vi.fn()} payDelay={0} />
      )
      await user.type(screen.getByLabelText(/card number/i), '4111111111111111')
      expect(screen.getByRole('button', { name: /^pay/i }).hasAttribute('disabled')).toBe(true)
    })

    it('keeps Pay disabled with a card number shorter than 13 digits', async () => {
      const user = userEvent.setup()
      render(
        <ConfirmPayStep data={MOCK_DATA} trip={MOCK_TRIP} onPaymentSuccess={vi.fn()} payDelay={0} />
      )
      await user.type(screen.getByLabelText(/card number/i), '411111111111') // 12 digits
      await user.type(screen.getByLabelText(/expiry/i), '12/28')
      await user.type(screen.getByLabelText(/cvc/i), '123')
      expect(screen.getByRole('button', { name: /^pay/i }).hasAttribute('disabled')).toBe(true)
    })

    it('enables the Pay button when all card fields are validly filled', async () => {
      const user = userEvent.setup()
      render(
        <ConfirmPayStep data={MOCK_DATA} trip={MOCK_TRIP} onPaymentSuccess={vi.fn()} payDelay={0} />
      )
      await user.type(screen.getByLabelText(/card number/i), '4111111111111111')
      await user.type(screen.getByLabelText(/expiry/i), '12/28')
      await user.type(screen.getByLabelText(/cvc/i), '123')
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^pay/i }).hasAttribute('disabled')).toBe(false)
      })
    })

    it('calls onPaymentSuccess after a valid Pay click', async () => {
      const onPaymentSuccess = vi.fn()
      const user = userEvent.setup()
      render(
        <ConfirmPayStep
          data={MOCK_DATA}
          trip={MOCK_TRIP}
          onPaymentSuccess={onPaymentSuccess}
          payDelay={0}
        />
      )
      await user.type(screen.getByLabelText(/card number/i), '4111111111111111')
      await user.type(screen.getByLabelText(/expiry/i), '12/28')
      await user.type(screen.getByLabelText(/cvc/i), '123')
      await user.click(screen.getByRole('button', { name: /^pay/i }))
      await waitFor(() => expect(onPaymentSuccess).toHaveBeenCalledTimes(1))
    })
  })

  describe('Booking summary', () => {
    it('renders the trip title in the summary', () => {
      render(
        <ConfirmPayStep data={MOCK_DATA} trip={MOCK_TRIP} onPaymentSuccess={vi.fn()} payDelay={0} />
      )
      expect(screen.getByText('Hidden Gems of Kyoto')).not.toBeNull()
    })

    it('renders the traveller full name in the summary', () => {
      render(
        <ConfirmPayStep data={MOCK_DATA} trip={MOCK_TRIP} onPaymentSuccess={vi.fn()} payDelay={0} />
      )
      expect(screen.getByText('Jane Smith')).not.toBeNull()
    })
  })

  describe('Back button', () => {
    it('renders a Back button', () => {
      render(
        <ConfirmPayStep
          data={MOCK_DATA}
          trip={MOCK_TRIP}
          onPaymentSuccess={vi.fn()}
          onBack={vi.fn()}
          payDelay={0}
        />
      )
      expect(screen.getByRole('button', { name: /back/i })).not.toBeNull()
    })

    it('calls onBack when clicked', async () => {
      const onBack = vi.fn()
      const user = userEvent.setup()
      render(
        <ConfirmPayStep
          data={MOCK_DATA}
          trip={MOCK_TRIP}
          onPaymentSuccess={vi.fn()}
          onBack={onBack}
          payDelay={0}
        />
      )
      await user.click(screen.getByRole('button', { name: /back/i }))
      expect(onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Focus management (WCAG 2.4.3)', () => {
    it('moves focus to the section on mount', () => {
      render(
        <ConfirmPayStep data={MOCK_DATA} trip={MOCK_TRIP} onPaymentSuccess={vi.fn()} payDelay={0} />
      )
      const section = screen.getByRole('region', { name: /review & pay/i })
      expect(document.activeElement).toBe(section)
    })
  })
})

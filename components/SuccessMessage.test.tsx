import { render, screen } from '@testing-library/react'
import SuccessMessage from './SuccessMessage'
import type { TravellerDetailsFormData } from '../lib/schemas/traveller'

const DATA: TravellerDetailsFormData = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  phone: '+44 7700 900000',
  numberOfTravellers: 2,
}

describe('SuccessMessage', () => {
  describe('Semantic structure', () => {
    it('renders a section with an accessible heading', () => {
      render(<SuccessMessage data={DATA} tripTitle="Hidden Gems of Kyoto" />)
      expect(screen.getByRole('region', { name: /booking confirmed/i })).not.toBeNull()
    })

    it('renders an h2 with the traveller first name', () => {
      render(<SuccessMessage data={DATA} tripTitle="Hidden Gems of Kyoto" />)
      expect(
        screen.getByRole('heading', { level: 2, name: /booking confirmed, jane/i })
      ).not.toBeNull()
    })
  })

  describe('Content', () => {
    it('displays the trip title', () => {
      render(<SuccessMessage data={DATA} tripTitle="Hidden Gems of Kyoto" />)
      expect(screen.getByText(/hidden gems of kyoto/i)).not.toBeNull()
    })

    it('displays the full name in the summary', () => {
      render(<SuccessMessage data={DATA} tripTitle="Hidden Gems of Kyoto" />)
      expect(screen.getByText('Jane Smith')).not.toBeNull()
    })

    it('displays the email in the summary', () => {
      render(<SuccessMessage data={DATA} tripTitle="Hidden Gems of Kyoto" />)
      expect(screen.getByText('jane@example.com')).not.toBeNull()
    })

    it('displays the phone in the summary', () => {
      render(<SuccessMessage data={DATA} tripTitle="Hidden Gems of Kyoto" />)
      expect(screen.getByText('+44 7700 900000')).not.toBeNull()
    })
  })

  describe('Summary list semantics', () => {
    it('renders Name, Email, Phone, Travellers as definition list terms', () => {
      render(<SuccessMessage data={DATA} tripTitle="Hidden Gems of Kyoto" />)
      expect(screen.getByText('Name')).not.toBeNull()
      expect(screen.getByText('Email')).not.toBeNull()
      expect(screen.getByText('Phone')).not.toBeNull()
      expect(screen.getByText('Travellers')).not.toBeNull()
    })

    it('displays the number of travellers in the summary', () => {
      render(<SuccessMessage data={DATA} tripTitle="Hidden Gems of Kyoto" />)
      expect(screen.getByText('2')).not.toBeNull()
    })
  })

  describe('Focus management (WCAG 2.4.3)', () => {
    it('moves focus to the success section on mount', () => {
      render(<SuccessMessage data={DATA} tripTitle="Hidden Gems of Kyoto" />)
      const region = screen.getByRole('region', { name: /booking confirmed/i })
      expect(document.activeElement).toBe(region)
    })
  })
})

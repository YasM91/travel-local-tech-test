import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TravellerForm from './TravellerForm'
import type { TravellerDetailsFormData } from '../lib/schemas/traveller'

const EMPTY_DEFAULTS: TravellerDetailsFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
}

const VALID_DATA: TravellerDetailsFormData = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  phone: '+44 7700 900000',
}

const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
afterAll(() => consoleSpy.mockRestore())

describe('TravellerForm', () => {
  describe('Accessibility structure', () => {
    it('renders a form with an accessible name', () => {
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      expect(screen.getByRole('form', { name: 'Traveller details' })).not.toBeNull()
    })

    it('renders a fieldset with a legend', () => {
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      expect(screen.getByRole('group', { name: 'Your Details' })).not.toBeNull()
    })

    it('has a label explicitly associated with each input', () => {
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      expect(screen.getByLabelText(/first name/i)).not.toBeNull()
      expect(screen.getByLabelText(/last name/i)).not.toBeNull()
      expect(screen.getByLabelText(/email address/i)).not.toBeNull()
      expect(screen.getByLabelText(/phone number/i)).not.toBeNull()
    })

    it('marks all inputs as aria-required', () => {
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      screen.getAllByRole('textbox').forEach((input) => {
        expect(input.getAttribute('aria-required')).toBe('true')
      })
    })

    it('renders the submit button', () => {
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      expect(screen.getByRole('button', { name: /continue to payment/i })).not.toBeNull()
    })

    it('explains the required field indicator (WCAG 3.3.2)', () => {
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      expect(screen.getByText(/fields marked/i)).not.toBeNull()
      expect(screen.getByText(/are required/i)).not.toBeNull()
    })
  })

  describe('Validation errors — empty submit', () => {
    async function submitEmpty() {
      const user = userEvent.setup()
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))
    }

    it('shows a required error for first name', async () => {
      await submitEmpty()
      await waitFor(() => expect(screen.getByText('First name is required')).not.toBeNull())
    })

    it('shows a required error for last name', async () => {
      await submitEmpty()
      await waitFor(() => expect(screen.getByText('Last name is required')).not.toBeNull())
    })

    it('shows a required error for email', async () => {
      await submitEmpty()
      await waitFor(() => expect(screen.getByText('Email address is required')).not.toBeNull())
    })

    it('shows a required error for phone', async () => {
      await submitEmpty()
      await waitFor(() => expect(screen.getByText('Phone number is required')).not.toBeNull())
    })

    it('sets aria-invalid="true" on firstName when invalid', async () => {
      await submitEmpty()
      await waitFor(() => {
        expect(screen.getByLabelText(/first name/i).getAttribute('aria-invalid')).toBe('true')
      })
    })

    it('sets aria-invalid="true" on email when invalid', async () => {
      await submitEmpty()
      await waitFor(() => {
        expect(screen.getByLabelText(/email address/i).getAttribute('aria-invalid')).toBe('true')
      })
    })

    it('links error message to input via aria-describedby', async () => {
      await submitEmpty()
      await waitFor(() => {
        const input = screen.getByLabelText(/first name/i)
        const errorId = input.getAttribute('aria-describedby')
        expect(errorId).toBe('firstName-error')
        expect(document.getElementById(errorId!)).not.toBeNull()
      })
    })
  })

  describe('Validation errors — invalid values', () => {
    it('shows an email format error for a non-email string', async () => {
      const user = userEvent.setup()
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      await user.type(screen.getByLabelText(/email address/i), 'not-an-email')
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))
      await waitFor(() => expect(screen.getByText('Enter a valid email address')).not.toBeNull())
    })

    it('shows a phone format error for a non-numeric string', async () => {
      const user = userEvent.setup()
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      await user.type(screen.getByLabelText(/phone number/i), 'abc')
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))
      await waitFor(() => expect(screen.getByText('Enter a valid phone number')).not.toBeNull())
    })
  })

  describe('Successful submission', () => {
    async function fillAndSubmit(onSuccess = vi.fn()) {
      const user = userEvent.setup()
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={onSuccess} submitDelay={0} />)
      await user.type(screen.getByLabelText(/first name/i), VALID_DATA.firstName)
      await user.type(screen.getByLabelText(/last name/i), VALID_DATA.lastName)
      await user.type(screen.getByLabelText(/email address/i), VALID_DATA.email)
      await user.type(screen.getByLabelText(/phone number/i), VALID_DATA.phone)
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))
      return { onSuccess }
    }

    it('calls onSuccess with the validated payload', async () => {
      const { onSuccess } = await fillAndSubmit()
      await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(VALID_DATA))
    })

    it('logs the payload to console', async () => {
      await fillAndSubmit()
      await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Booking payload:', VALID_DATA))
    })

    it('shows the loading state then resolves', async () => {
      const user = userEvent.setup()
      const onSuccess = vi.fn()
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={onSuccess} submitDelay={50} />)
      await user.type(screen.getByLabelText(/first name/i), VALID_DATA.firstName)
      await user.type(screen.getByLabelText(/last name/i), VALID_DATA.lastName)
      await user.type(screen.getByLabelText(/email address/i), VALID_DATA.email)
      await user.type(screen.getByLabelText(/phone number/i), VALID_DATA.phone)
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))

      await waitFor(() => {
        const btn = screen.getByRole('button', { name: /confirming/i })
        expect(btn.getAttribute('aria-busy')).toBe('true')
        expect(btn.hasAttribute('disabled')).toBe(true)
      })

      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })
  })

  describe('Pre-filled defaults', () => {
    it('pre-fills inputs with values from SSR defaults', () => {
      render(<TravellerForm defaults={VALID_DATA} onSuccess={vi.fn()} />)
      expect((screen.getByLabelText(/first name/i) as HTMLInputElement).value).toBe('Jane')
      expect((screen.getByLabelText(/email address/i) as HTMLInputElement).value).toBe(
        'jane@example.com'
      )
    })
  })
})

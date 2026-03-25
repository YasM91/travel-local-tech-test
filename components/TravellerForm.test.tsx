import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TravellerForm from './TravellerForm'
import type { TravellerDetailsFormData } from '../lib/schemas/traveller'

const EMPTY_DEFAULTS: TravellerDetailsFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  // 0 fails min(1) so submitting without change triggers a validation error.
  numberOfTravellers: 0,
}

const VALID_DATA: TravellerDetailsFormData = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  phone: '+44 7700 900000',
  numberOfTravellers: 2,
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
      expect(screen.getByLabelText(/number of travellers/i)).not.toBeNull()
    })

    it('marks all inputs as aria-required', () => {
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      screen.getAllByRole('spinbutton').forEach((input) => {
        expect(input.getAttribute('aria-required')).toBe('true')
      })
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

  describe('Mobile keyboard optimisation', () => {
    it('email input has inputMode="email" for mobile keyboard optimisation', () => {
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      expect(screen.getByLabelText(/email address/i).getAttribute('inputmode')).toBe('email')
    })

    it('phone input has type="tel" for numeric keyboard on mobile', () => {
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      expect(screen.getByLabelText(/phone number/i).getAttribute('type')).toBe('tel')
    })

    it('numberOfTravellers input has type="number" and inputMode="numeric"', () => {
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      const input = screen.getByLabelText(/number of travellers/i)
      expect(input.getAttribute('type')).toBe('number')
      expect(input.getAttribute('inputmode')).toBe('numeric')
    })
  })

  describe('Button gating — disabled state mirrors ConfirmPayStep', () => {
    it('disables the button when all fields are empty', () => {
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      expect(
        screen.getByRole('button', { name: /continue to payment/i }).hasAttribute('disabled')
      ).toBe(true)
    })

    it('keeps the button disabled when only first name is filled', async () => {
      const user = userEvent.setup()
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      await user.type(screen.getByLabelText(/first name/i), 'Jane')
      expect(
        screen.getByRole('button', { name: /continue to payment/i }).hasAttribute('disabled')
      ).toBe(true)
    })

    it('enables the button once all required fields have content', async () => {
      const user = userEvent.setup()
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      await user.type(screen.getByLabelText(/first name/i), VALID_DATA.firstName)
      await user.type(screen.getByLabelText(/last name/i), VALID_DATA.lastName)
      await user.type(screen.getByLabelText(/email address/i), VALID_DATA.email)
      await user.type(screen.getByLabelText(/phone number/i), VALID_DATA.phone)
      await user.clear(screen.getByLabelText(/number of travellers/i))
      await user.type(
        screen.getByLabelText(/number of travellers/i),
        String(VALID_DATA.numberOfTravellers)
      )
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /continue to payment/i }).hasAttribute('disabled')
        ).toBe(false)
      })
    })
  })

  describe('Validation errors — invalid values (button enabled, Zod fires on submit)', () => {
    /** Fill all fields so the button is active, then override one to an invalid value. */
    async function fillAllThenSubmitWith(overrides: Partial<typeof VALID_DATA>) {
      const user = userEvent.setup()
      const data = { ...VALID_DATA, ...overrides }
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      await user.type(screen.getByLabelText(/first name/i), data.firstName)
      await user.type(screen.getByLabelText(/last name/i), data.lastName)
      await user.type(screen.getByLabelText(/email address/i), data.email)
      await user.type(screen.getByLabelText(/phone number/i), data.phone)
      await user.clear(screen.getByLabelText(/number of travellers/i))
      await user.type(
        screen.getByLabelText(/number of travellers/i),
        String(data.numberOfTravellers)
      )
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))
    }

    it('shows an email format error for a non-email string', async () => {
      await fillAllThenSubmitWith({ email: 'not-an-email' })
      await waitFor(() => expect(screen.getByText('Enter a valid email address')).not.toBeNull())
    })

    it('shows a phone format error for a too-short number string', async () => {
      await fillAllThenSubmitWith({ phone: 'abc' })
      await waitFor(() => expect(screen.getByText('Enter a valid phone number')).not.toBeNull())
    })

    it('sets aria-invalid="true" on the email input when format is wrong', async () => {
      await fillAllThenSubmitWith({ email: 'not-an-email' })
      await waitFor(() => {
        expect(screen.getByLabelText(/email address/i).getAttribute('aria-invalid')).toBe('true')
      })
    })

    it('links the email error message to the input via aria-describedby', async () => {
      await fillAllThenSubmitWith({ email: 'not-an-email' })
      await waitFor(() => {
        const input = screen.getByLabelText(/email address/i)
        const errorId = input.getAttribute('aria-describedby')
        expect(errorId).toBe('email-error')
        expect(document.getElementById(errorId!)).not.toBeNull()
      })
    })
  })

  describe('Focus management on validation failure (WCAG 2.4.3)', () => {
    // The button is only enabled once all fields have content, so focus
    // management is tested with all fields filled but one value invalid.

    it('focuses the email field when email format is invalid', async () => {
      const user = userEvent.setup()
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      await user.type(screen.getByLabelText(/first name/i), 'Jane')
      await user.type(screen.getByLabelText(/last name/i), 'Smith')
      await user.type(screen.getByLabelText(/email address/i), 'not-an-email')
      await user.type(screen.getByLabelText(/phone number/i), VALID_DATA.phone)
      await user.clear(screen.getByLabelText(/number of travellers/i))
      await user.type(
        screen.getByLabelText(/number of travellers/i),
        String(VALID_DATA.numberOfTravellers)
      )
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByLabelText(/email address/i))
      })
    })

    it('focuses the phone field when phone format is invalid', async () => {
      const user = userEvent.setup()
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      await user.type(screen.getByLabelText(/first name/i), 'Jane')
      await user.type(screen.getByLabelText(/last name/i), 'Smith')
      await user.type(screen.getByLabelText(/email address/i), VALID_DATA.email)
      await user.type(screen.getByLabelText(/phone number/i), 'abc')
      await user.clear(screen.getByLabelText(/number of travellers/i))
      await user.type(
        screen.getByLabelText(/number of travellers/i),
        String(VALID_DATA.numberOfTravellers)
      )
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByLabelText(/phone number/i))
      })
    })
  })

  describe('Submission failure (unhappy path)', () => {
    it('shows an error banner when submission fails', async () => {
      const user = userEvent.setup()
      render(
        <TravellerForm
          defaults={EMPTY_DEFAULTS}
          onSuccess={vi.fn()}
          submitDelay={0}
          failureRate={1}
        />
      )
      await user.type(screen.getByLabelText(/first name/i), VALID_DATA.firstName)
      await user.type(screen.getByLabelText(/last name/i), VALID_DATA.lastName)
      await user.type(screen.getByLabelText(/email address/i), VALID_DATA.email)
      await user.type(screen.getByLabelText(/phone number/i), VALID_DATA.phone)
      await user.clear(screen.getByLabelText(/number of travellers/i))
      await user.type(
        screen.getByLabelText(/number of travellers/i),
        String(VALID_DATA.numberOfTravellers)
      )
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))
      await waitFor(() => expect(screen.getByText(/something went wrong/i)).not.toBeNull())
    })

    it('error banner has role="alert" so screen readers announce it immediately', async () => {
      const user = userEvent.setup()
      render(
        <TravellerForm
          defaults={EMPTY_DEFAULTS}
          onSuccess={vi.fn()}
          submitDelay={0}
          failureRate={1}
        />
      )
      await user.type(screen.getByLabelText(/first name/i), VALID_DATA.firstName)
      await user.type(screen.getByLabelText(/last name/i), VALID_DATA.lastName)
      await user.type(screen.getByLabelText(/email address/i), VALID_DATA.email)
      await user.type(screen.getByLabelText(/phone number/i), VALID_DATA.phone)
      await user.clear(screen.getByLabelText(/number of travellers/i))
      await user.type(
        screen.getByLabelText(/number of travellers/i),
        String(VALID_DATA.numberOfTravellers)
      )
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))
      await waitFor(() => {
        const banner = screen.getByText(/something went wrong/i).closest('[role="alert"]')
        expect(banner).not.toBeNull()
      })
    })

    it('does not call onSuccess when submission fails', async () => {
      const onSuccess = vi.fn()
      const user = userEvent.setup()
      render(
        <TravellerForm
          defaults={EMPTY_DEFAULTS}
          onSuccess={onSuccess}
          submitDelay={0}
          failureRate={1}
        />
      )
      await user.type(screen.getByLabelText(/first name/i), VALID_DATA.firstName)
      await user.type(screen.getByLabelText(/last name/i), VALID_DATA.lastName)
      await user.type(screen.getByLabelText(/email address/i), VALID_DATA.email)
      await user.type(screen.getByLabelText(/phone number/i), VALID_DATA.phone)
      await user.clear(screen.getByLabelText(/number of travellers/i))
      await user.type(
        screen.getByLabelText(/number of travellers/i),
        String(VALID_DATA.numberOfTravellers)
      )
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))
      await waitFor(() => expect(screen.getByText(/something went wrong/i)).not.toBeNull())
      expect(onSuccess).not.toHaveBeenCalled()
    })
  })

  describe('Successful submission', () => {
    async function fillAndSubmit(onSuccess = vi.fn()) {
      const user = userEvent.setup()
      // failureRate={0} prevents flaky test failures from the 5% simulation.
      render(
        <TravellerForm
          defaults={EMPTY_DEFAULTS}
          onSuccess={onSuccess}
          submitDelay={0}
          failureRate={0}
        />
      )
      await user.type(screen.getByLabelText(/first name/i), VALID_DATA.firstName)
      await user.type(screen.getByLabelText(/last name/i), VALID_DATA.lastName)
      await user.type(screen.getByLabelText(/email address/i), VALID_DATA.email)
      await user.type(screen.getByLabelText(/phone number/i), VALID_DATA.phone)
      await user.clear(screen.getByLabelText(/number of travellers/i))
      await user.type(
        screen.getByLabelText(/number of travellers/i),
        String(VALID_DATA.numberOfTravellers)
      )
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
      render(
        <TravellerForm
          defaults={EMPTY_DEFAULTS}
          onSuccess={onSuccess}
          submitDelay={50}
          failureRate={0}
        />
      )
      await user.type(screen.getByLabelText(/first name/i), VALID_DATA.firstName)
      await user.type(screen.getByLabelText(/last name/i), VALID_DATA.lastName)
      await user.type(screen.getByLabelText(/email address/i), VALID_DATA.email)
      await user.type(screen.getByLabelText(/phone number/i), VALID_DATA.phone)
      await user.clear(screen.getByLabelText(/number of travellers/i))
      await user.type(
        screen.getByLabelText(/number of travellers/i),
        String(VALID_DATA.numberOfTravellers)
      )
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))

      await waitFor(() => {
        const btn = screen.getByRole('button', { name: /confirming/i })
        expect(btn.getAttribute('aria-busy')).toBe('true')
        expect(btn.hasAttribute('disabled')).toBe(true)
      })

      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })

    it('disables all inputs while the form is submitting', async () => {
      const user = userEvent.setup()
      render(
        <TravellerForm
          defaults={EMPTY_DEFAULTS}
          onSuccess={vi.fn()}
          submitDelay={200}
          failureRate={0}
        />
      )
      await user.type(screen.getByLabelText(/first name/i), VALID_DATA.firstName)
      await user.type(screen.getByLabelText(/last name/i), VALID_DATA.lastName)
      await user.type(screen.getByLabelText(/email address/i), VALID_DATA.email)
      await user.type(screen.getByLabelText(/phone number/i), VALID_DATA.phone)
      await user.clear(screen.getByLabelText(/number of travellers/i))
      await user.type(
        screen.getByLabelText(/number of travellers/i),
        String(VALID_DATA.numberOfTravellers)
      )
      await user.click(screen.getByRole('button', { name: /continue to payment/i }))

      await waitFor(() => {
        expect((screen.getByLabelText(/first name/i) as HTMLInputElement).disabled).toBe(true)
        expect((screen.getByLabelText(/last name/i) as HTMLInputElement).disabled).toBe(true)
        expect((screen.getByLabelText(/email address/i) as HTMLInputElement).disabled).toBe(true)
        expect((screen.getByLabelText(/phone number/i) as HTMLInputElement).disabled).toBe(true)
        expect((screen.getByLabelText(/number of travellers/i) as HTMLInputElement).disabled).toBe(
          true
        )
      })
    })
  })

  describe('Back button', () => {
    it('is not rendered when onBack is not provided', () => {
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} />)
      expect(screen.queryByRole('button', { name: /back/i })).toBeNull()
    })

    it('is rendered when onBack is provided', () => {
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} onBack={vi.fn()} />)
      expect(screen.getByRole('button', { name: /back/i })).not.toBeNull()
    })

    it('calls onBack when clicked', async () => {
      const onBack = vi.fn()
      const user = userEvent.setup()
      render(<TravellerForm defaults={EMPTY_DEFAULTS} onSuccess={vi.fn()} onBack={onBack} />)
      await user.click(screen.getByRole('button', { name: /back/i }))
      expect(onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Pre-filled defaults', () => {
    it('pre-fills inputs with values from SSR defaults', () => {
      render(<TravellerForm defaults={VALID_DATA} onSuccess={vi.fn()} />)
      expect((screen.getByLabelText(/first name/i) as HTMLInputElement).value).toBe('Jane')
      expect((screen.getByLabelText(/email address/i) as HTMLInputElement).value).toBe(
        'jane@example.com'
      )
      expect((screen.getByLabelText(/number of travellers/i) as HTMLInputElement).value).toBe('2')
    })
  })
})

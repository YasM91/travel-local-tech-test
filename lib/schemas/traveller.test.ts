import { TravellerDetailsSchema } from './traveller'

const VALID = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  phone: '+44 7700 900000',
}

describe('TravellerDetailsSchema', () => {
  describe('valid data', () => {
    it('accepts a complete valid payload', () => {
      expect(() => TravellerDetailsSchema.parse(VALID)).not.toThrow()
    })

    it('accepts a phone with no country code', () => {
      expect(() => TravellerDetailsSchema.parse({ ...VALID, phone: '07700 900000' })).not.toThrow()
    })

    it('accepts a phone with dashes and parentheses', () => {
      expect(() =>
        TravellerDetailsSchema.parse({ ...VALID, phone: '+1 (555) 000-1234' })
      ).not.toThrow()
    })
  })

  describe('firstName', () => {
    it('rejects an empty string', () => {
      const result = TravellerDetailsSchema.safeParse({ ...VALID, firstName: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('First name is required')
      }
    })
  })

  describe('lastName', () => {
    it('rejects an empty string', () => {
      const result = TravellerDetailsSchema.safeParse({ ...VALID, lastName: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Last name is required')
      }
    })
  })

  describe('email', () => {
    it('rejects an empty string', () => {
      const result = TravellerDetailsSchema.safeParse({ ...VALID, email: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email address is required')
      }
    })

    it('rejects a string without an @ symbol', () => {
      const result = TravellerDetailsSchema.safeParse({ ...VALID, email: 'not-an-email' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Enter a valid email address')
      }
    })

    it('rejects a string with @ but no domain', () => {
      const result = TravellerDetailsSchema.safeParse({ ...VALID, email: 'user@' })
      expect(result.success).toBe(false)
    })
  })

  describe('phone', () => {
    it('rejects an empty string', () => {
      const result = TravellerDetailsSchema.safeParse({ ...VALID, phone: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Phone number is required')
      }
    })

    it('rejects a string with only letters', () => {
      const result = TravellerDetailsSchema.safeParse({ ...VALID, phone: 'abcdef' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Enter a valid phone number')
      }
    })
  })
})

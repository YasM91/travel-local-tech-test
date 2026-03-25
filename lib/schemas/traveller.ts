import { z } from 'zod'

export const TravellerDetailsSchema = z.object({
  // .trim() strips leading/trailing whitespace (handles copy-paste artefacts)
  // before any length or format check — the trimmed value is what gets stored.
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),

  // Zod's .email() accepts plus-addressing (test+label@example.com). ✓
  email: z.string().trim().min(1, 'Email address is required').email('Enter a valid email address'),

  // Phone is required. After the empty check, the value must match the
  // permissive E.164 / national-number regex so that international formats
  // (+44 …), national formats (07700 …) and common separators all pass.
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .refine((val) => /^\+?[\d\s\-(). ]{6,}$/.test(val), 'Enter a valid phone number'),

  numberOfTravellers: z.coerce
    .number({ error: 'Number of travellers must be a number' })
    .int('Must be a whole number')
    .min(1, 'At least 1 traveller is required'),
})

export type TravellerDetailsFormData = z.infer<typeof TravellerDetailsSchema>

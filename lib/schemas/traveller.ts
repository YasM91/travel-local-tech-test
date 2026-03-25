import { z } from 'zod'

export const TravellerDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email address is required').email('Enter a valid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s\-(). ]{6,}$/, 'Enter a valid phone number'),
})

export type TravellerDetailsFormData = z.infer<typeof TravellerDetailsSchema>

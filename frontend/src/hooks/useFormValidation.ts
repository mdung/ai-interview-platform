import { useForm, UseFormReturn, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Re-export for convenience
export { useForm } from 'react-hook-form'
export type { UseFormReturn, FieldValues, Path } from 'react-hook-form'

// Hook with Zod validation
export function useFormWithValidation<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  defaultValues?: Partial<T>
): UseFormReturn<T> {
  return useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as T,
    mode: 'onChange',
  })
}

// Common validation schemas
export const validationSchemas = {
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  requiredString: z.string().min(1, 'This field is required'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number'),
  url: z.string().url('Invalid URL'),
}

// Login form schema
export const loginSchema = z.object({
  email: validationSchemas.email,
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register form schema
export const registerSchema = z.object({
  email: validationSchemas.email,
  password: validationSchemas.password,
  confirmPassword: z.string(),
  firstName: validationSchemas.requiredString,
  lastName: validationSchemas.requiredString,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

// Candidate form schema
export const candidateSchema = z.object({
  email: validationSchemas.email,
  firstName: validationSchemas.requiredString,
  lastName: validationSchemas.requiredString,
  phoneNumber: validationSchemas.phone.optional(),
  linkedInUrl: validationSchemas.url.optional(),
})

export type CandidateFormData = z.infer<typeof candidateSchema>


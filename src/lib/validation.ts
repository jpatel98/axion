/**
 * Validation schemas and utilities for Axion ERP
 * 
 * NOTE: This requires 'zod' to be installed:
 * npm install zod
 * 
 * Until then, fallback validation functions are provided.
 */

// Zod imports (now available)
import { z } from 'zod'

// Fallback validation types and functions
export type ValidationResult = {
  success: boolean
  errors: Record<string, string[]>
  data?: any
}

export type ValidatorFunction<T = any> = (value: T) => string | null

// Common validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/
const CURRENCY_REGEX = /^\d+(\.\d{1,2})?$/
const QUOTE_NUMBER_REGEX = /^[A-Z]{2,3}-\d{4}-\d{3,6}$/

// Fallback validators
export const validators = {
  required: (message = 'This field is required'): ValidatorFunction => 
    (value) => {
      if (value === null || value === undefined || value === '') {
        return message
      }
      return null
    },

  email: (message = 'Please enter a valid email address'): ValidatorFunction =>
    (value) => {
      if (!value) return null
      if (!EMAIL_REGEX.test(value)) {
        return message
      }
      return null
    },

  phone: (message = 'Please enter a valid phone number'): ValidatorFunction =>
    (value) => {
      if (!value) return null
      const cleanPhone = value.replace(/\D/g, '')
      if (!PHONE_REGEX.test(cleanPhone)) {
        return message
      }
      return null
    },

  minLength: (min: number, message?: string): ValidatorFunction =>
    (value) => {
      if (!value) return null
      if (value.length < min) {
        return message || `Must be at least ${min} characters`
      }
      return null
    },

  maxLength: (max: number, message?: string): ValidatorFunction =>
    (value) => {
      if (!value) return null
      if (value.length > max) {
        return message || `Must be no more than ${max} characters`
      }
      return null
    },

  currency: (message = 'Please enter a valid amount'): ValidatorFunction =>
    (value) => {
      if (!value) return null
      if (!CURRENCY_REGEX.test(value.toString())) {
        return message
      }
      return null
    },

  positive: (message = 'Must be a positive number'): ValidatorFunction =>
    (value) => {
      if (!value) return null
      const num = parseFloat(value)
      if (isNaN(num) || num <= 0) {
        return message
      }
      return null
    },

  integer: (message = 'Must be a whole number'): ValidatorFunction =>
    (value) => {
      if (!value) return null
      const num = parseFloat(value)
      if (isNaN(num) || !Number.isInteger(num)) {
        return message
      }
      return null
    },

  dateRange: (min?: Date, max?: Date) => (value: string | Date) => {
    if (!value) return null
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date'
    }
    if (min && date < min) {
      return `Date must be after ${min.toLocaleDateString()}`
    }
    if (max && date > max) {
      return `Date must be before ${max.toLocaleDateString()}`
    }
    return null
  },

  quoteNumber: (message = 'Please enter a valid quote number format'): ValidatorFunction =>
    (value) => {
      if (!value) return null
      if (!QUOTE_NUMBER_REGEX.test(value)) {
        return message
      }
      return null
    },

  // Unicode-safe name validation
  name: (message = 'Please enter a valid name'): ValidatorFunction =>
    (value) => {
      if (!value) return null
      // Allow letters, spaces, hyphens, apostrophes, and common international characters
      const nameRegex = /^[\p{L}\p{M}\s\-'\.]+$/u
      if (!nameRegex.test(value)) {
        return message
      }
      if (value.length > 100) {
        return 'Name must be less than 100 characters'
      }
      return null
    },

  // Address validation
  address: (message = 'Please enter a valid address'): ValidatorFunction =>
    (value) => {
      if (!value) return null
      // Allow letters, numbers, spaces, and common punctuation
      const addressRegex = /^[\p{L}\p{N}\s\-#.,/]+$/u
      if (!addressRegex.test(value)) {
        return message
      }
      if (value.length > 255) {
        return 'Address must be less than 255 characters'
      }
      return null
    },

  // Postal code validation (supports Canadian and US formats)
  postalCode: (message = 'Please enter a valid postal code'): ValidatorFunction =>
    (value) => {
      if (!value) return null
      // Canadian postal code pattern (K1A 0A6 or K1A0A6)
      const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/
      // US ZIP code pattern (12345 or 12345-6789)
      const usZipRegex = /^\d{5}(-\d{4})?$/
      // General international pattern
      const internationalRegex = /^[\p{L}\p{N}\s\-]{3,12}$/u
      
      if (canadianPostalRegex.test(value) || usZipRegex.test(value) || internationalRegex.test(value)) {
        return null
      }
      return message
    },
}

// Validation schema definitions
export interface CustomerValidationSchema extends Record<string, ValidatorFunction[] | undefined> {
  name: ValidatorFunction[]
  email?: ValidatorFunction[]
  phone?: ValidatorFunction[]
  address_line1?: ValidatorFunction[]
  city?: ValidatorFunction[]
  state?: ValidatorFunction[]
  postal_code?: ValidatorFunction[]
  contact_person?: ValidatorFunction[]
  notes?: ValidatorFunction[]
}

export interface LineItemValidationSchema extends Record<string, ValidatorFunction[] | undefined> {
  description: ValidatorFunction[]
  quantity: ValidatorFunction[]
  unit_price: ValidatorFunction[]
}

export interface QuoteValidationSchema {
  customer_id: ValidatorFunction[]
  title: ValidatorFunction[]
  description?: ValidatorFunction[]
  part_number?: ValidatorFunction[]
  due_date?: ValidatorFunction[]
  valid_until: ValidatorFunction[]
  line_items: {
    validator: (items: any[]) => string | null
    itemSchema: LineItemValidationSchema
  }
}

// Predefined validation schemas
export const customerSchema: CustomerValidationSchema = {
  name: [validators.required(), validators.name(), validators.maxLength(100)],
  email: [validators.email()],
  phone: [validators.phone()],
  address_line1: [validators.address(), validators.maxLength(255)],
  city: [validators.name(), validators.maxLength(100)],
  state: [validators.maxLength(50)],
  postal_code: [validators.postalCode()],
  contact_person: [validators.name(), validators.maxLength(100)],
  notes: [validators.maxLength(1000)],
}

export const lineItemSchema: LineItemValidationSchema = {
  description: [validators.required('Description is required'), validators.maxLength(500)],
  quantity: [validators.required('Quantity is required'), validators.positive(), validators.currency()],
  unit_price: [validators.required('Unit price is required'), validators.positive(), validators.currency()],
}

export const quoteSchema: QuoteValidationSchema = {
  customer_id: [validators.required('Please select a customer')],
  title: [validators.required('Quote title is required'), validators.maxLength(255)],
  description: [validators.maxLength(1000)],
  part_number: [validators.maxLength(100)],
  due_date: [],
  valid_until: [
    validators.required('Valid until date is required'),
    validators.dateRange(new Date()),
  ],
  line_items: {
    validator: (items: any[]) => {
      if (!items || items.length === 0) {
        return 'At least one line item is required'
      }
      const validItems = items.filter(item => 
        item.description?.trim() && 
        item.quantity > 0 && 
        item.unit_price > 0
      )
      if (validItems.length === 0) {
        return 'At least one valid line item is required'
      }
      return null
    },
    itemSchema: lineItemSchema,
  },
}

// Validation runner function
export function validateField(value: any, validators: ValidatorFunction[]): string[] {
  const errors: string[] = []
  for (const validator of validators) {
    const error = validator(value)
    if (error) {
      errors.push(error)
    }
  }
  return errors
}

export function validateObject<T>(data: T, schema: Record<string, ValidatorFunction[] | undefined>): ValidationResult {
  const errors: Record<string, string[]> = {}
  let hasErrors = false

  for (const [field, validators] of Object.entries(schema)) {
    if (!validators) continue
    const fieldErrors = validateField((data as any)[field], validators)
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors
      hasErrors = true
    }
  }

  return {
    success: !hasErrors,
    errors,
    data: hasErrors ? undefined : data,
  }
}

// Specific validation functions
export function validateCustomer(data: any): ValidationResult {
  return validateObject(data, customerSchema)
}

export function validateLineItem(data: any): ValidationResult {
  return validateObject(data, lineItemSchema)
}

export function validateQuote(data: any): ValidationResult {
  // First validate the quote fields
  const quoteFieldValidation = validateObject(data, {
    customer_id: quoteSchema.customer_id,
    title: quoteSchema.title,
    description: quoteSchema.description || [],
    valid_until: quoteSchema.valid_until,
  })

  // Then validate line items
  const lineItemsError = quoteSchema.line_items.validator(data.line_items)
  if (lineItemsError) {
    quoteFieldValidation.errors.line_items = [lineItemsError]
    quoteFieldValidation.success = false
  }

  // Validate individual line items
  if (data.line_items && Array.isArray(data.line_items)) {
    data.line_items.forEach((item: any, index: number) => {
      const itemValidation = validateLineItem(item)
      if (!itemValidation.success) {
        Object.entries(itemValidation.errors).forEach(([field, errors]) => {
          const fieldKey = `line_items.${index}.${field}`
          quoteFieldValidation.errors[fieldKey] = errors
        })
        quoteFieldValidation.success = false
      }
    })
  }

  return quoteFieldValidation
}

// Cross-field validation utilities
export function createCrossFieldValidator(
  fields: string[],
  validator: (values: Record<string, any>) => string | null
) {
  return (data: Record<string, any>) => {
    const fieldValues = fields.reduce((acc, field) => {
      acc[field] = data[field]
      return acc
    }, {} as Record<string, any>)
    
    return validator(fieldValues)
  }
}

// Async validation for server-side checks
export type AsyncValidator = (value: any) => Promise<string | null>

export function createUniqueValidator(
  checkFunction: (value: any) => Promise<boolean>,
  message = 'This value already exists'
): AsyncValidator {
  return async (value: any) => {
    if (!value) return null
    try {
      const isUnique = await checkFunction(value)
      return isUnique ? null : message
    } catch (error) {
      return 'Unable to validate uniqueness'
    }
  }
}

// Debounced validation helper
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | null = null
  
  return ((...args: any[]) => {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }) as T
}

// Sanitization utilities
export const sanitizers = {
  phone: (value: string) => value.replace(/\D/g, ''),
  currency: (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2)
    }
    return cleaned
  },
  text: (value: string) => value.trim(),
  name: (value: string) => value.trim().replace(/\s+/g, ' '),
}

// Error message helpers
export const errorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  currency: 'Please enter a valid amount',
  date: 'Please enter a valid date',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  network: 'Network error. Please check your connection and try again.',
  server: 'Server error. Please try again later.',
}

// Zod schemas (now available)
export const zodCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address_line1: z.string().max(255).optional(),
  address_line2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  postal_code: z.string().max(20).optional(),
  contact_person: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
})

export const zodLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().positive('Price must be positive'),
})

export const zodQuoteSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).optional(),
  part_number: z.string().max(100).optional(),
  due_date: z.string().optional(),
  valid_until: z.string().min(1, 'Valid until date is required'),
  line_items: z.array(zodLineItemSchema).min(1, 'At least one line item is required'),
})

// TypeScript types derived from Zod schemas
export type CustomerFormData = z.infer<typeof zodCustomerSchema>
export type LineItemFormData = z.infer<typeof zodLineItemSchema>
export type QuoteFormData = z.infer<typeof zodQuoteSchema>
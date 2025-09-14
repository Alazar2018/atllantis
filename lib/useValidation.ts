import { useState, useCallback } from 'react'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

export interface ValidationErrors {
  [key: string]: string
}

export function useValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validate = useCallback((data: Record<string, any>): boolean => {
    const newErrors: ValidationErrors = {}

    for (const [field, value] of Object.entries(data)) {
      const rule = rules[field]
      if (!rule) continue

      // Required validation
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newErrors[field] = `${field} is required`
        continue
      }

      // Skip other validations if value is empty and not required
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        continue
      }

      // String length validation
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          newErrors[field] = `${field} must be at least ${rule.minLength} characters`
          continue
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          newErrors[field] = `${field} must be no more than ${rule.maxLength} characters`
          continue
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        newErrors[field] = `${field} format is invalid`
        continue
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value)
        if (customError) {
          newErrors[field] = customError
          continue
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [rules])

  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = rules[field]
    if (!rule) return null

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field} is required`
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null
    }

    // String length validation
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${field} must be at least ${rule.minLength} characters`
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${field} must be no more than ${rule.maxLength} characters`
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return `${field} format is invalid`
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value)
    }

    return null
  }, [rules])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
  }
}

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value.length > 254) return 'Email is too long'
      return null
    }
  },
  phone: {
    required: true,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    custom: (value: string) => {
      const cleaned = value.replace(/[\s\-\(\)]/g, '')
      if (cleaned.length < 7) return 'Phone number is too short'
      if (cleaned.length > 15) return 'Phone number is too long'
      return null
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-'\.]+$/,
    custom: (value: string) => {
      if (value.trim().length < 2) return 'Name must be at least 2 characters'
      return null
    }
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    custom: (value: string) => {
      if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter'
      if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter'
      if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number'
      if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character'
      return null
    }
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  price: {
    required: true,
    custom: (value: number) => {
      if (typeof value !== 'number' || value < 0) return 'Price must be a positive number'
      if (value > 999999) return 'Price is too high'
      return null
    }
  },
  quantity: {
    required: true,
    custom: (value: number) => {
      if (!Number.isInteger(value) || value < 1) return 'Quantity must be a positive integer'
      if (value > 100) return 'Quantity is too high'
      return null
    }
  },
  description: {
    maxLength: 1000,
    custom: (value: string) => {
      if (value && value.length > 1000) return 'Description is too long'
      return null
    }
  }
}

// Sanitization utilities
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 1000)
}

export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return ''
  
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

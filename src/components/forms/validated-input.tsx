/**
 * Validated input components for Axion ERP
 * These components integrate with the form validation system
 */

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'

// Simple spinner component using Lucide icon
const Spinner = ({ className }: { className?: string }) => (
  <Loader2 className={cn("animate-spin", className)} />
)

export interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string | null
  touched?: boolean
  validating?: boolean
  dirty?: boolean
  required?: boolean
  helperText?: string
  showError?: boolean
  onChange?: (value: string) => void
  onBlur?: () => void
  containerClassName?: string
  labelClassName?: string
  errorClassName?: string
  helperClassName?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({
    label,
    error,
    touched,
    validating,
    required,
    helperText,
    showError = true,
    onChange,
    onBlur,
    className,
    containerClassName,
    labelClassName,
    errorClassName,
    helperClassName,
    leftIcon,
    rightIcon,
    id,
    dirty,
    ...props
  }, ref) => {
    const inputId = id || `input-${React.useId()}`
    const hasError = showError && touched && error
    const showValidating = validating && touched

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <Label 
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium',
              required && 'after:content-["*"] after:ml-0.5 after:text-red-500',
              hasError && 'text-red-600 dark:text-red-400',
              labelClassName
            )}
          >
            {label}
          </Label>
        )}
        
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              {leftIcon}
            </div>
          )}
          
          <Input
            ref={ref}
            id={inputId}
            onChange={handleChange}
            onBlur={onBlur}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              hasError ? `${inputId}-error` : 
              helperText ? `${inputId}-helper` : 
              undefined
            }
            className={cn(
              hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              leftIcon ? 'pl-10' : '',
              (rightIcon || !className?.includes('pr-')) ? 'pr-8' : '',
              className
            )}
            {...props}
          />
          
          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10">
              {rightIcon}
            </div>
          )}
          
          {/* Validation indicator */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            {showValidating && (
              <Spinner className="h-4 w-4 text-gray-900" />
            )}
            {hasError && !showValidating && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>

        {/* Helper text */}
        {helperText && !hasError && (
          <p 
            id={`${inputId}-helper`}
            className={cn('text-xs text-gray-900', helperClassName)}
          >
            {helperText}
          </p>
        )}

        {/* Error message */}
        {hasError && (
          <p 
            id={`${inputId}-error`}
            role="alert"
            className={cn('text-xs text-red-600 dark:text-red-400', errorClassName)}
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

ValidatedInput.displayName = 'ValidatedInput'

// Password input with toggle visibility
export interface ValidatedPasswordInputProps extends ValidatedInputProps {
  showPasswordToggle?: boolean
}

export const ValidatedPasswordInput = React.forwardRef<HTMLInputElement, ValidatedPasswordInputProps>(
  ({ showPasswordToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative">
        <ValidatedInput
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className="pr-16"
          {...props}
        />
        
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-gray-900 hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    )
  }
)

ValidatedPasswordInput.displayName = 'ValidatedPasswordInput'

// Textarea component
export interface ValidatedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string
  error?: string | null
  touched?: boolean
  validating?: boolean
  dirty?: boolean
  required?: boolean
  helperText?: string
  showError?: boolean
  onChange?: (value: string) => void
  onBlur?: () => void
  containerClassName?: string
  labelClassName?: string
  errorClassName?: string
  helperClassName?: string
  maxLength?: number
  showCharCount?: boolean
}

export const ValidatedTextarea = React.forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(
  ({
    label,
    error,
    touched,
    validating,
    dirty,
    required,
    helperText,
    showError = true,
    onChange,
    onBlur,
    className,
    containerClassName,
    labelClassName,
    errorClassName,
    helperClassName,
    id,
    maxLength,
    showCharCount = false,
    value = '',
    ...props
  }, ref) => {
    const inputId = id || `textarea-${React.useId()}`
    const hasError = showError && touched && error
    const showValidating = validating && touched
    const charCount = String(value).length

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <Label 
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium',
              required && 'after:content-["*"] after:ml-0.5 after:text-red-500',
              hasError && 'text-red-600 dark:text-red-400',
              labelClassName
            )}
          >
            {label}
          </Label>
        )}
        
        <div className="relative">
          <textarea
            ref={ref}
            id={inputId}
            value={value}
            maxLength={maxLength}
            onChange={handleChange}
            onBlur={onBlur}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              hasError ? `${inputId}-error` : 
              helperText ? `${inputId}-helper` : 
              undefined
            }
            className={cn(
              'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          
          {/* Validation indicator */}
          {(showValidating || hasError) && (
            <div className="absolute right-2 top-2 flex items-center">
              {showValidating && (
                <Spinner className="h-4 w-4 text-gray-900" />
              )}
              {hasError && !showValidating && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>

        {/* Character count and helper text */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {helperText && !hasError && (
              <p 
                id={`${inputId}-helper`}
                className={cn('text-xs text-gray-900', helperClassName)}
              >
                {helperText}
              </p>
            )}

            {hasError && (
              <p 
                id={`${inputId}-error`}
                role="alert"
                className={cn('text-xs text-red-600 dark:text-red-400', errorClassName)}
              >
                {error}
              </p>
            )}
          </div>

          {/* Character count */}
          {showCharCount && maxLength && (
            <p className={cn(
              'text-xs ml-2 shrink-0',
              charCount > maxLength * 0.9 ? 'text-yellow-600' : 'text-gray-900',
              charCount >= maxLength && 'text-red-600'
            )}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

ValidatedTextarea.displayName = 'ValidatedTextarea'

// Select component
export interface ValidatedSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string | null
  touched?: boolean
  validating?: boolean
  dirty?: boolean
  required?: boolean
  helperText?: string
  showError?: boolean
  onChange?: (value: string) => void
  onBlur?: () => void
  containerClassName?: string
  labelClassName?: string
  errorClassName?: string
  helperClassName?: string
  placeholder?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export const ValidatedSelect = React.forwardRef<HTMLSelectElement, ValidatedSelectProps>(
  ({
    label,
    error,
    touched,
    validating,
    dirty,
    required,
    helperText,
    showError = true,
    onChange,
    onBlur,
    className,
    containerClassName,
    labelClassName,
    errorClassName,
    helperClassName,
    id,
    placeholder,
    options,
    ...props
  }, ref) => {
    const inputId = id || `select-${React.useId()}`
    const hasError = showError && touched && error
    const showValidating = validating && touched

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <Label 
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium',
              required && 'after:content-["*"] after:ml-0.5 after:text-red-500',
              hasError && 'text-red-600 dark:text-red-400',
              labelClassName
            )}
          >
            {label}
          </Label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            onChange={handleChange}
            onBlur={onBlur}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              hasError ? `${inputId}-error` : 
              helperText ? `${inputId}-helper` : 
              undefined
            }
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              'pr-8',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Validation indicator */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            {showValidating && (
              <Spinner className="h-4 w-4 text-gray-900" />
            )}
            {hasError && !showValidating && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>

        {/* Helper text */}
        {helperText && !hasError && (
          <p 
            id={`${inputId}-helper`}
            className={cn('text-xs text-gray-900', helperClassName)}
          >
            {helperText}
          </p>
        )}

        {/* Error message */}
        {hasError && (
          <p 
            id={`${inputId}-error`}
            role="alert"
            className={cn('text-xs text-red-600 dark:text-red-400', errorClassName)}
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

ValidatedSelect.displayName = 'ValidatedSelect'

// Number input with formatting
export interface ValidatedNumberInputProps extends Omit<ValidatedInputProps, 'type' | 'onChange'> {
  onChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  precision?: number
  allowNegative?: boolean
  formatType?: 'currency' | 'percentage' | 'decimal'
  currency?: string
}

export const ValidatedNumberInput = React.forwardRef<HTMLInputElement, ValidatedNumberInputProps>(
  ({
    onChange,
    min,
    max,
    step = 1,
    precision = 2,
    allowNegative = true,
    formatType = 'decimal',
    currency = 'USD',
    value = '',
    ...props
  }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(String(value))
    const [focused, setFocused] = React.useState(false)

    const formatNumber = (num: number): string => {
      switch (formatType) {
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
          }).format(num)
        case 'percentage':
          return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
          }).format(num / 100)
        default:
          return num.toFixed(precision)
      }
    }

    const parseNumber = (str: string): number | null => {
      const cleaned = str.replace(/[^\d.-]/g, '')
      const num = parseFloat(cleaned)
      return isNaN(num) ? null : num
    }

    const handleChange = (newValue: string) => {
      setDisplayValue(newValue)
      const numValue = parseNumber(newValue)
      onChange?.(numValue)
    }

    const handleBlur = () => {
      setFocused(false)
      const numValue = parseNumber(displayValue)
      if (numValue !== null) {
        setDisplayValue(formatNumber(numValue))
      }
      props.onBlur?.()
    }

    const handleFocus = () => {
      setFocused(true)
      // Show raw number when focused
      const numValue = parseNumber(displayValue)
      if (numValue !== null) {
        setDisplayValue(String(numValue))
      }
    }

    React.useEffect(() => {
      if (!focused && value !== undefined) {
        const numValue = typeof value === 'number' ? value : parseNumber(String(value))
        setDisplayValue(numValue !== null ? formatNumber(numValue) : String(value))
      }
    }, [value, focused, formatNumber])

    return (
      <ValidatedInput
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        {...props}
      />
    )
  }
)

ValidatedNumberInput.displayName = 'ValidatedNumberInput'
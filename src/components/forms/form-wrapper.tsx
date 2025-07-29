/**
 * Form wrapper component with error handling and accessibility
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { ErrorBoundary, MinimalErrorFallback } from '@/components/ui/error-boundary'
import { FormErrorBoundary } from '@/components/ui/error-boundaries'
import { cn } from '@/lib/utils'
import { AlertCircle, Save, X } from 'lucide-react'

export interface FormWrapperProps {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void | Promise<void>
  onReset?: () => void
  isSubmitting?: boolean
  isValid?: boolean
  isDirty?: boolean
  submitText?: string
  resetText?: string
  showSubmitButton?: boolean
  showResetButton?: boolean
  submitButtonProps?: React.ComponentProps<typeof Button>
  resetButtonProps?: React.ComponentProps<typeof Button>
  errorBoundary?: boolean
  className?: string
  actionsClassName?: string
  title?: string
  description?: string
  errors?: Record<string, string>
  submitOnEnter?: boolean
}

export const FormWrapper = React.forwardRef<HTMLFormElement, FormWrapperProps>(
  ({
    children,
    onSubmit,
    onReset,
    isSubmitting = false,
    isValid = true,
    isDirty = false,
    submitText = 'Submit',
    resetText = 'Reset',
    showSubmitButton = true,
    showResetButton = false,
    submitButtonProps,
    resetButtonProps,
    errorBoundary = true,
    className,
    actionsClassName,
    title,
    description,
    errors,
    submitOnEnter = true,
    ...props
  }, ref) => {
    const hasErrors = errors && Object.keys(errors).length > 0

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (onSubmit) {
        await onSubmit(e)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (submitOnEnter && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        if (isValid && !isSubmitting && onSubmit) {
          handleSubmit(e as any)
        }
      }
    }

    const formContent = (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        noValidate
        className={cn('space-y-6', className)}
        {...props}
      >
        {/* Header */}
        {(title || description) && (
          <div className="space-y-2">
            {title && (
              <h2 className="text-lg font-semibold text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-gray-900">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Global form errors */}
        {hasErrors && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4 dark:bg-red-950/50 dark:border-red-800">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Please fix the following errors:
                </h3>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>
                      <span className="font-medium">{field}:</span> {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-4">
          {children}
        </div>

        {/* Form actions */}
        {(showSubmitButton || showResetButton) && (
          <div className={cn(
            'flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200',
            actionsClassName
          )}>
            <div className="flex gap-3">
              {showSubmitButton && (
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="flex items-center gap-2"
                  {...submitButtonProps}
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Submitting...' : submitText}
                </Button>
              )}
              
              {showResetButton && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onReset}
                  disabled={isSubmitting || !isDirty}
                  className="flex items-center gap-2"
                  {...resetButtonProps}
                >
                  <X className="h-4 w-4" />
                  {resetText}
                </Button>
              )}
            </div>

          </div>
        )}
      </form>
    )

    if (errorBoundary) {
      return (
        <FormErrorBoundary onReset={onReset}>
          {formContent}
        </FormErrorBoundary>
      )
    }

    return formContent
  }
)

FormWrapper.displayName = 'FormWrapper'

// Fieldset component for grouping related fields
export interface FieldsetProps {
  children: React.ReactNode
  legend?: string
  description?: string
  className?: string
  legendClassName?: string
  contentClassName?: string
  disabled?: boolean
}

export const Fieldset: React.FC<FieldsetProps> = ({
  children,
  legend,
  description,
  className,
  legendClassName,
  contentClassName,
  disabled = false,
}) => {
  return (
    <fieldset 
      disabled={disabled}
      className={cn(
        'space-y-4',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {legend && (
        <legend className={cn(
          'text-base font-semibold text-foreground mb-4',
          legendClassName
        )}>
          {legend}
          {description && (
            <p className="text-sm font-normal text-gray-900 mt-1">
              {description}
            </p>
          )}
        </legend>
      )}
      <div className={cn('space-y-4', contentClassName)}>
        {children}
      </div>
    </fieldset>
  )
}

// Form section component for organizing large forms
export interface FormSectionProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  titleClassName?: string
  contentClassName?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  description,
  className,
  titleClassName,
  contentClassName,
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className={cn(
              'text-lg font-medium text-foreground',
              titleClassName
            )}>
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-900 mt-1">
                {description}
              </p>
            )}
          </div>
          
          {collapsible && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? 'Expand' : 'Collapse'}
            </Button>
          )}
        </div>
      )}
      
      {(!collapsible || !collapsed) && (
        <div className={cn('space-y-4', contentClassName)}>
          {children}
        </div>
      )}
    </div>
  )
}

// Form grid component for responsive layouts
export interface FormGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export const FormGrid: React.FC<FormGridProps> = ({
  children,
  columns = 2,
  gap = 'md',
  className,
}) => {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns]

  const gapClass = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }[gap]

  return (
    <div className={cn('grid', gridClass, gapClass, className)}>
      {children}
    </div>
  )
}

// Form actions component for consistent button layouts
export interface FormActionsProps {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right' | 'between'
  className?: string
  sticky?: boolean
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'right',
  className,
  sticky = false,
}) => {
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  }[align]

  return (
    <div className={cn(
      'flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200',
      alignClass,
      sticky && 'sticky bottom-0 bg-background/95 backdrop-blur-sm z-10 -mx-6 px-6 py-4',
      className
    )}>
      {children}
    </div>
  )
}

// Form help text component
export interface FormHelpProps {
  children: React.ReactNode
  className?: string
}

export const FormHelp: React.FC<FormHelpProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn(
      'rounded-md bg-blue-50 border border-blue-200 p-4 dark:bg-blue-950/50 dark:border-blue-800',
      className
    )}>
      <div className="text-sm text-blue-800 dark:text-blue-200">
        {children}
      </div>
    </div>
  )
}

export { FormWrapper as Form }
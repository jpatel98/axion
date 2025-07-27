/**
 * Type-safe form hook with validation and error handling
 * for Axion ERP system
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  ValidatorFunction, 
  AsyncValidator, 
  ValidationResult, 
  validateField as validateFieldSync, 
  debounce 
} from '@/lib/validation'
import { useToast } from '@/lib/toast'

export interface FieldConfig {
  validators?: ValidatorFunction[]
  asyncValidators?: AsyncValidator[]
  required?: boolean
  debounceMs?: number
  sanitizer?: (value: any) => any
  initialValue?: any
}

export interface FormConfig<T> {
  fields: {
    [K in keyof T]: FieldConfig
  }
  onSubmit?: (data: T) => Promise<void> | void
  validateOnChange?: boolean
  validateOnBlur?: boolean
  submitOnEnter?: boolean
}

export interface FieldState {
  value: any
  error: string | null
  touched: boolean
  validating: boolean
  dirty: boolean
}

export interface FormState<T> {
  fields: {
    [K in keyof T]: FieldState
  }
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
  submitCount: number
  errors: Record<string, string>
}

export interface FormActions<T> {
  setValue: (field: keyof T, value: any) => void
  setError: (field: keyof T, error: string | null) => void
  clearError: (field: keyof T) => void
  clearAllErrors: () => void
  touchField: (field: keyof T) => void
  validateField: (field: keyof T) => Promise<boolean>
  validateAll: () => Promise<boolean>
  submit: () => Promise<void>
  reset: () => void
  setFieldConfig: (field: keyof T, config: Partial<FieldConfig>) => void
  getFieldProps: (field: keyof T) => FieldProps
  getFormData: () => T
  setFormData: (data: Partial<T>) => void
}

export interface FieldProps {
  value: any
  onChange: (value: any) => void
  onBlur: () => void
  error: string | null
  touched: boolean
  validating: boolean
  dirty: boolean
  required: boolean
}

export function useForm<T extends Record<string, any>>(
  config: FormConfig<T>
): [FormState<T>, FormActions<T>] {
  const { addToast } = useToast()
  const configRef = useRef(config)
  const asyncValidationRef = useRef<Map<keyof T, AbortController>>(new Map())
  
  // Update config ref when config changes
  useEffect(() => {
    configRef.current = config
  }, [config])

  // Initialize form state
  const [state, setState] = useState<FormState<T>>(() => {
    const fields = {} as FormState<T>['fields']
    
    Object.keys(config.fields).forEach((key) => {
      const fieldKey = key as keyof T
      const fieldConfig = config.fields[fieldKey]
      fields[fieldKey] = {
        value: fieldConfig.initialValue ?? '',
        error: null,
        touched: false,
        validating: false,
        dirty: false,
      }
    })

    return {
      fields,
      isValid: false,
      isSubmitting: false,
      isDirty: false,
      submitCount: 0,
      errors: {},
    }
  })


  // Set field value with optional validation
  const setValue = useCallback((field: keyof T, value: any) => {
    const fieldConfig = configRef.current.fields[field]
    
    // Apply sanitizer if provided
    const sanitizedValue = fieldConfig.sanitizer ? fieldConfig.sanitizer(value) : value
    
    setState(prev => {
      const newFields = {
        ...prev.fields,
        [field]: {
          ...prev.fields[field],
          value: sanitizedValue,
          dirty: true,
        },
      }
      
      // Calculate validation state inline
      const errors: Record<string, string> = {}
      let isValid = true
      let isDirty = false

      Object.keys(newFields).forEach(key => {
        const fieldKey = key as keyof T
        const fieldState = newFields[fieldKey]
        
        if (fieldState.error) {
          errors[key] = fieldState.error
          isValid = false
        }
        
        if (fieldState.dirty) {
          isDirty = true
        }
      })

      return {
        ...prev,
        fields: newFields,
        errors,
        isValid,
        isDirty,
      }
    })
  }, [])

  // Set field error
  const setError = useCallback((field: keyof T, error: string | null) => {
    setState(prev => {
      const newFields = {
        ...prev.fields,
        [field]: {
          ...prev.fields[field],
          error,
        },
      }
      
      // Calculate validation state inline
      const errors: Record<string, string> = {}
      let isValid = true
      let isDirty = false

      Object.keys(newFields).forEach(key => {
        const fieldKey = key as keyof T
        const fieldState = newFields[fieldKey]
        
        if (fieldState.error) {
          errors[key] = fieldState.error
          isValid = false
        }
        
        if (fieldState.dirty) {
          isDirty = true
        }
      })

      return {
        ...prev,
        fields: newFields,
        errors,
        isValid,
        isDirty,
      }
    })
  }, [])

  // Clear field error
  const clearError = useCallback((field: keyof T) => {
    setError(field, null)
  }, [setError])

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setState(prev => {
      const fields = { ...prev.fields }
      Object.keys(fields).forEach(key => {
        const fieldKey = key as keyof T
        fields[fieldKey] = {
          ...fields[fieldKey],
          error: null,
        }
      })
      return {
        ...prev,
        fields,
        errors: {},
        isValid: true,
      }
    })
  }, [])

  // Touch field
  const touchField = useCallback((field: keyof T) => {
    setState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [field]: {
          ...prev.fields[field],
          touched: true,
        },
      },
    }))
  }, [])

  // Validate single field
  const validateField = useCallback(async (field: keyof T): Promise<boolean> => {
    const fieldConfig = configRef.current.fields[field]
    const fieldValue = state.fields[field].value

    // Cancel any pending async validation
    const existingController = asyncValidationRef.current.get(field)
    if (existingController) {
      existingController.abort()
    }

    // Set validating state
    setState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [field]: {
          ...prev.fields[field],
          validating: true,
          error: null,
        },
      },
    }))

    try {
      // Run synchronous validators
      const syncErrors = validateFieldSync(fieldValue, fieldConfig.validators || [])
      if (syncErrors.length > 0) {
        setError(field, syncErrors[0])
        setState(prev => ({
          ...prev,
          fields: {
            ...prev.fields,
            [field]: {
              ...prev.fields[field],
              validating: false,
            },
          },
        }))
        return false
      }

      // Run async validators
      if (fieldConfig.asyncValidators && fieldConfig.asyncValidators.length > 0) {
        const controller = new AbortController()
        asyncValidationRef.current.set(field, controller)

        for (const asyncValidator of fieldConfig.asyncValidators) {
          if (controller.signal.aborted) break
          
          try {
            const asyncError = await asyncValidator(fieldValue)
            if (asyncError) {
              setError(field, asyncError)
              setState(prev => ({
                ...prev,
                fields: {
                  ...prev.fields,
                  [field]: {
                    ...prev.fields[field],
                    validating: false,
                  },
                },
              }))
              return false
            }
          } catch (error) {
            if (!controller.signal.aborted) {
              setError(field, 'Validation error occurred')
              setState(prev => ({
                ...prev,
                fields: {
                  ...prev.fields,
                  [field]: {
                    ...prev.fields[field],
                    validating: false,
                  },
                },
              }))
              return false
            }
          }
        }

        asyncValidationRef.current.delete(field)
      }

      // Field is valid
      setState(prev => ({
        ...prev,
        fields: {
          ...prev.fields,
          [field]: {
            ...prev.fields[field],
            validating: false,
            error: null,
          },
        },
      }))
      
      return true
    } catch (error) {
      setError(field, 'Validation error occurred')
      setState(prev => ({
        ...prev,
        fields: {
          ...prev.fields,
          [field]: {
            ...prev.fields[field],
            validating: false,
          },
        },
      }))
      return false
    }
  }, [setError, state.fields])

  // Debounced field validation
  const debouncedValidateField = useCallback(
    debounce((field: keyof T) => {
      validateField(field)
    }, 300),
    [validateField]
  )

  // Validate all fields
  const validateAll = useCallback(async (): Promise<boolean> => {
    const fieldKeys = Object.keys(configRef.current.fields) as (keyof T)[]
    const validationResults = await Promise.all(
      fieldKeys.map(field => validateField(field))
    )
    
    return validationResults.every(Boolean)
  }, [validateField])

  // Submit form
  const submit = useCallback(async () => {
    if (!configRef.current.onSubmit) return

    setState(prev => ({ ...prev, isSubmitting: true, submitCount: prev.submitCount + 1 }))

    try {
      // Touch all fields
      Object.keys(configRef.current.fields).forEach(key => {
        touchField(key as keyof T)
      })

      // Validate all fields
      const isValid = await validateAll()
      
      if (!isValid) {
        addToast({
          title: 'Validation Error',
          description: 'Please fix the errors below and try again.',
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Get form data
      const formData = getFormData()
      
      // Call submit handler
      await configRef.current.onSubmit!(formData)
      
      addToast({
        title: 'Success',
        description: 'Form submitted successfully.',
        variant: 'success',
        duration: 3000,
      })
      
    } catch (error) {
      console.error('Form submission error:', error)
      addToast({
        title: 'Submission Error',
        description: error instanceof Error ? error.message : 'An error occurred while submitting the form.',
        variant: 'error',
        duration: 7000,
      })
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }, [validateAll, touchField, addToast])

  // Reset form
  const reset = useCallback(() => {
    const fields = {} as FormState<T>['fields']
    
    Object.keys(configRef.current.fields).forEach((key) => {
      const fieldKey = key as keyof T
      const fieldConfig = configRef.current.fields[fieldKey]
      fields[fieldKey] = {
        value: fieldConfig.initialValue ?? '',
        error: null,
        touched: false,
        validating: false,
        dirty: false,
      }
    })

    setState({
      fields,
      isValid: false,
      isSubmitting: false,
      isDirty: false,
      submitCount: 0,
      errors: {},
    })

    // Cancel all async validations
    asyncValidationRef.current.forEach(controller => controller.abort())
    asyncValidationRef.current.clear()
  }, [])

  // Set field config
  const setFieldConfig = useCallback((field: keyof T, newConfig: Partial<FieldConfig>) => {
    configRef.current = {
      ...configRef.current,
      fields: {
        ...configRef.current.fields,
        [field]: {
          ...configRef.current.fields[field],
          ...newConfig,
        },
      },
    }
  }, [])

  // Get field props for easy binding
  const getFieldProps = useCallback((field: keyof T): FieldProps => {
    const fieldState = state.fields[field]
    const fieldConfig = configRef.current.fields[field]
    
    return {
      value: fieldState.value,
      onChange: (value: any) => setValue(field, value),
      onBlur: () => {
        touchField(field)
        if (configRef.current.validateOnBlur) {
          if (fieldConfig.debounceMs && fieldConfig.debounceMs > 0) {
            debouncedValidateField(field)
          } else {
            validateField(field)
          }
        }
      },
      error: fieldState.error,
      touched: fieldState.touched,
      validating: fieldState.validating,
      dirty: fieldState.dirty,
      required: fieldConfig.required || false,
    }
  }, [state.fields])

  // Get form data
  const getFormData = useCallback((): T => {
    const data = {} as T
    Object.keys(state.fields).forEach(key => {
      const fieldKey = key as keyof T
      data[fieldKey] = state.fields[fieldKey].value
    })
    return data
  }, [state.fields])

  // Set form data
  const setFormData = useCallback((data: Partial<T>) => {
    setState(prev => {
      const fields = { ...prev.fields }
      Object.keys(data).forEach(key => {
        const fieldKey = key as keyof T
        if (fields[fieldKey]) {
          fields[fieldKey] = {
            ...fields[fieldKey],
            value: data[fieldKey],
            dirty: true,
          }
        }
      })
      return { ...prev, fields }
    })
  }, [])


  // Cleanup async validations on unmount
  useEffect(() => {
    return () => {
      asyncValidationRef.current.forEach(controller => controller.abort())
      asyncValidationRef.current.clear()
    }
  }, [])

  const actions: FormActions<T> = {
    setValue,
    setError,
    clearError,
    clearAllErrors,
    touchField,
    validateField,
    validateAll,
    submit,
    reset,
    setFieldConfig,
    getFieldProps,
    getFormData,
    setFormData,
  }

  return [state, actions]
}

// Hook for simple field validation without full form management
export function useFieldValidation(
  initialValue: any = '',
  validators: ValidatorFunction[] = [],
  asyncValidators: AsyncValidator[] = []
) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)
  const [touched, setTouched] = useState(false)
  
  const validate = useCallback(async (val: any = value): Promise<boolean> => {
    setValidating(true)
    setError(null)
    
    try {
      // Run sync validators
      const syncErrors = validateFieldSync(val, validators)
      if (syncErrors.length > 0) {
        setError(syncErrors[0])
        setValidating(false)
        return false
      }
      
      // Run async validators
      for (const asyncValidator of asyncValidators) {
        const asyncError = await asyncValidator(val)
        if (asyncError) {
          setError(asyncError)
          setValidating(false)
          return false
        }
      }
      
      setValidating(false)
      return true
    } catch (err) {
      setError('Validation error occurred')
      setValidating(false)
      return false
    }
  }, [value, validators, asyncValidators])
  
  const debouncedValidate = useCallback(
    debounce(() => validate(), 300),
    [validate]
  )
  
  const handleChange = useCallback((newValue: any) => {
    setValue(newValue)
    debouncedValidate()
  }, [debouncedValidate])
  
  const handleBlur = useCallback(() => {
    setTouched(true)
    validate()
  }, [validate])
  
  return {
    value,
    setValue: handleChange,
    error,
    validating,
    touched,
    onBlur: handleBlur,
    validate,
    reset: () => {
      setValue(initialValue)
      setError(null)
      setValidating(false)
      setTouched(false)
    },
  }
}
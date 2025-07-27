// Form validation and components exports

// Validated inputs
export {
  ValidatedInput,
  ValidatedPasswordInput,
  ValidatedTextarea,
  ValidatedSelect,
  ValidatedNumberInput,
} from './validated-input'

export type {
  ValidatedInputProps,
  ValidatedPasswordInputProps,
  ValidatedTextareaProps,
  ValidatedSelectProps,
  ValidatedNumberInputProps,
} from './validated-input'

// Form wrapper and layout components
export {
  FormWrapper,
  Form,
  Fieldset,
  FormSection,
  FormGrid,
  FormActions,
  FormHelp,
} from './form-wrapper'

export type {
  FormWrapperProps,
  FieldsetProps,
  FormSectionProps,
  FormGridProps,
  FormActionsProps,
  FormHelpProps,
} from './form-wrapper'

// Specialized field components
export {
  EmailField,
  PhoneField,
  CurrencyField,
  DateField,
  NameField,
  AddressField,
  CountryStateField,
  QuoteStatusField,
  QuantityField,
  FileUploadField,
  SearchField,
  URLField,
} from './form-fields'

export type {
  EmailFieldProps,
  PhoneFieldProps,
  CurrencyFieldProps,
  DateFieldProps,
  NameFieldProps,
  AddressFieldProps,
  CountryStateFieldProps,
  QuoteStatusFieldProps,
  QuantityFieldProps,
  FileUploadFieldProps,
  SearchFieldProps,
  URLFieldProps,
} from './form-fields'

// Form hooks
export { useForm, useFieldValidation } from '@/hooks/use-form'
export type { 
  FormConfig,
  FieldConfig,
  FormState,
  FormActions as FormHookActions,
  FieldProps,
  FieldState,
} from '@/hooks/use-form'

// Validation utilities
export {
  validators,
  sanitizers,
  validateField,
  validateObject,
  validateCustomer,
  validateLineItem,
  validateQuote,
  createCrossFieldValidator,
  createUniqueValidator,
  debounce,
  errorMessages,
} from '@/lib/validation'

export type {
  ValidationResult,
  ValidatorFunction,
  AsyncValidator,
  CustomerFormData,
  LineItemFormData,
  QuoteFormData,
  CustomerValidationSchema,
  LineItemValidationSchema,
  QuoteValidationSchema,
} from '@/lib/validation'
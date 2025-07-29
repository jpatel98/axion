/**
 * Specialized form field components for common ERP data types
 */

import React from 'react'
import { ValidatedInput, ValidatedSelect, ValidatedNumberInput, ValidatedInputProps, ValidatedSelectProps } from './validated-input'
import { sanitizers, validators } from '@/lib/validation'
import { cn } from '@/lib/utils'
import { CalendarIcon, DollarSign, Phone, Mail, MapPin, User, Building } from 'lucide-react'

// Email field
export interface EmailFieldProps extends Omit<ValidatedInputProps, 'type'> {
  allowEmpty?: boolean
}

export const EmailField: React.FC<EmailFieldProps> = ({
  allowEmpty = true,
  ...props
}) => {
  const emailValidators = allowEmpty 
    ? [validators.email()] 
    : [validators.required('Email is required'), validators.email()]

  return (
    <ValidatedInput
      type="email"
      autoComplete="email"
      placeholder="user@example.com"
      {...props}
    />
  )
}

// Phone field
export interface PhoneFieldProps extends Omit<ValidatedInputProps, 'type'> {
  allowEmpty?: boolean
  format?: 'us' | 'international'
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  allowEmpty = true,
  format = 'us',
  onChange,
  ...props
}) => {
  const phoneValidators = allowEmpty 
    ? [validators.phone()] 
    : [validators.required('Phone number is required'), validators.phone()]

  const handleChange = (value: string) => {
    // Auto-format US phone numbers
    if (format === 'us') {
      const cleaned = value.replace(/\D/g, '')
      let formatted = cleaned
      
      if (cleaned.length >= 6) {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
      } else if (cleaned.length >= 3) {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
      } else if (cleaned.length > 0) {
        formatted = `(${cleaned}`
      }
      
      onChange?.(formatted)
    } else {
      onChange?.(value)
    }
  }

  return (
    <ValidatedInput
      type="tel"
      autoComplete="tel"
      placeholder={format === 'us' ? '(555) 123-4567' : '+1 555 123 4567'}
      onChange={handleChange}
      {...props}
    />
  )
}

// Currency field
export interface CurrencyFieldProps extends Omit<ValidatedInputProps, 'type' | 'onChange'> {
  currency?: string
  allowNegative?: boolean
  onChange?: (value: number | null) => void
}

export const CurrencyField: React.FC<CurrencyFieldProps> = ({
  currency = 'USD',
  allowNegative = false,
  onChange,
  min,
  max,
  step,
  ...props
}) => {
  const currencyValidators = [
    validators.required('Amount is required'),
    validators.currency(),
    !allowNegative ? validators.positive() : null,
  ].filter(Boolean) as any[]

  return (
    <ValidatedNumberInput
      formatType="currency"
      currency={currency}
      placeholder="0.00"
      onChange={onChange}
      min={typeof min === 'string' ? parseFloat(min) : min}
      max={typeof max === 'string' ? parseFloat(max) : max}
      step={typeof step === 'string' ? parseFloat(step) : step}
      {...props}
    />
  )
}

// Date field
export interface DateFieldProps extends Omit<ValidatedInputProps, 'type'> {
  minDate?: string
  maxDate?: string
  allowPast?: boolean
  allowFuture?: boolean
}

export const DateField: React.FC<DateFieldProps> = ({
  minDate,
  maxDate,
  allowPast = true,
  allowFuture = true,
  ...props
}) => {
  const today = new Date().toISOString().split('T')[0]
  
  const dateValidators = [
    validators.required('Date is required'),
    !allowPast ? validators.dateRange(new Date()) : null,
    !allowFuture ? validators.dateRange(undefined, new Date()) : null,
    minDate ? validators.dateRange(new Date(minDate)) : null,
    maxDate ? validators.dateRange(undefined, new Date(maxDate)) : null,
  ].filter(Boolean) as any[]

  return (
    <ValidatedInput
      type="date"
      min={minDate || (!allowPast ? today : undefined)}
      max={maxDate || (!allowFuture ? today : undefined)}
      {...props}
    />
  )
}

// Name field (person name)
export interface NameFieldProps extends ValidatedInputProps {
  allowEmpty?: boolean
  nameType?: 'person' | 'company'
}

export const NameField: React.FC<NameFieldProps> = ({
  allowEmpty = false,
  nameType = 'person',
  onChange,
  ...props
}) => {
  const handleChange = (value: string) => {
    // Auto-capitalize first letter of each word for person names
    if (nameType === 'person') {
      const capitalized = value.replace(/\b\w/g, l => l.toUpperCase())
      onChange?.(capitalized)
    } else {
      onChange?.(value)
    }
  }

  const icon = nameType === 'person' ? <User className="h-4 w-4" /> : <Building className="h-4 w-4" />
  const placeholder = nameType === 'person' ? 'John Doe' : 'Acme Corporation'

  return (
    <ValidatedInput
      type="text"
      autoComplete={nameType === 'person' ? 'name' : 'organization'}
      placeholder={placeholder}
      onChange={handleChange}
      leftIcon={icon}
      {...props}
    />
  )
}

// Address field
export interface AddressFieldProps extends ValidatedInputProps {
  addressType?: 'street' | 'city' | 'state' | 'postal'
}

export const AddressField: React.FC<AddressFieldProps> = ({
  addressType = 'street',
  ...props
}) => {
  const getPlaceholder = () => {
    switch (addressType) {
      case 'street': return '123 Main Street'
      case 'city': return 'New York'
      case 'state': return 'NY'
      case 'postal': return '10001'
      default: return ''
    }
  }

  const getAutoComplete = () => {
    switch (addressType) {
      case 'street': return 'address-line1'
      case 'city': return 'address-level2'
      case 'state': return 'address-level1'
      case 'postal': return 'postal-code'
      default: return undefined
    }
  }

  const addressValidators = addressType === 'street' 
    ? [validators.required('Address is required'), validators.address()]
    : [validators.address()]

  return (
    <ValidatedInput
      type="text"
      autoComplete={getAutoComplete()}
      placeholder={getPlaceholder()}
      {...props}
    />
  )
}

// Country/State select
export interface CountryStateFieldProps extends Omit<ValidatedSelectProps, 'options'> {
  type: 'country' | 'state'
  country?: string // For state selection
}

export const CountryStateField: React.FC<CountryStateFieldProps> = ({
  type,
  country,
  ...props
}) => {
  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'MX', label: 'Mexico' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'FR', label: 'France' },
    { value: 'DE', label: 'Germany' },
    { value: 'JP', label: 'Japan' },
    { value: 'AU', label: 'Australia' },
  ]

  const usStates = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
  ]

  const canadianProvinces = [
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'New Brunswick' },
    { value: 'NL', label: 'Newfoundland and Labrador' },
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NS', label: 'Nova Scotia' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Prince Edward Island' },
    { value: 'QC', label: 'Quebec' },
    { value: 'SK', label: 'Saskatchewan' },
    { value: 'YT', label: 'Yukon' },
  ]

  const getOptions = () => {
    if (type === 'country') {
      return countries
    } else {
      // Provide appropriate states/provinces based on country
      if (country === 'CA') {
        return canadianProvinces
      } else if (country === 'US') {
        return usStates
      } else {
        return [{ value: '', label: 'Select state/province' }]
      }
    }
  }

  return (
    <ValidatedSelect
      options={getOptions()}
      placeholder={type === 'country' ? 'Select country' : 'Select state'}
      autoComplete={type === 'country' ? 'country' : 'address-level1'}
      {...props}
    />
  )
}

// Quote status field
export interface QuoteStatusFieldProps extends Omit<ValidatedSelectProps, 'options'> {}

export const QuoteStatusField: React.FC<QuoteStatusFieldProps> = (props) => {
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
  ]

  return (
    <ValidatedSelect
      options={statusOptions}
      placeholder="Select status"
      {...props}
    />
  )
}

// Quantity field with unit support
export interface QuantityFieldProps extends Omit<ValidatedInputProps, 'type' | 'onChange'> {
  unit?: string
  allowDecimals?: boolean
  onChange?: (value: number | null) => void
}

export const QuantityField: React.FC<QuantityFieldProps> = ({
  unit,
  allowDecimals = true,
  onChange,
  className,
  min,
  max,
  step,
  ...props
}) => {
  const quantityValidators = [
    validators.required('Quantity is required'),
    validators.positive(),
    !allowDecimals ? validators.integer() : null,
  ].filter(Boolean) as any[]

  return (
    <div className="relative">
      <ValidatedNumberInput
        formatType="decimal"
        precision={allowDecimals ? 2 : 0}
        step={step ? (typeof step === 'string' ? parseFloat(step) : step) : (allowDecimals ? 0.01 : 1)}
        className={cn(unit && 'pr-12', className)}
        placeholder="0"
        onChange={onChange}
        min={typeof min === 'string' ? parseFloat(min) : min}
        max={typeof max === 'string' ? parseFloat(max) : max}
        {...props}
      />
      {unit && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-900 pointer-events-none">
          {unit}
        </div>
      )}
    </div>
  )
}

// File upload field
export interface FileUploadFieldProps extends Omit<ValidatedInputProps, 'type'> {
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  onFileChange?: (files: FileList | null) => void
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  accept,
  multiple = false,
  maxSize = 10,
  onFileChange,
  onChange,
  ...props
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    
    if (files) {
      // Validate file sizes
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.size > maxSize * 1024 * 1024) {
          onChange?.(`File "${file.name}" exceeds ${maxSize}MB limit`)
          return
        }
      }
    }
    
    onFileChange?.(files)
    onChange?.('')
  }

  return (
    <ValidatedInput
      type="file"
      ref={fileInputRef}
      accept={accept}
      multiple={multiple}
      {...props}
      onChange={handleFileChange as any}
    />
  )
}

// Search field with debounced onChange
export interface SearchFieldProps extends ValidatedInputProps {
  onSearch?: (value: string) => void
  debounceMs?: number
}

export const SearchField: React.FC<SearchFieldProps> = ({
  onSearch,
  debounceMs = 300,
  onChange,
  ...props
}) => {
  const debounceRef = React.useRef<NodeJS.Timeout>()

  const handleChange = (value: string) => {
    onChange?.(value)
    
    if (onSearch) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      
      debounceRef.current = setTimeout(() => {
        onSearch(value)
      }, debounceMs)
    }
  }

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <ValidatedInput
      type="search"
      placeholder="Search..."
      onChange={handleChange}
      {...props}
    />
  )
}

// URL field
export interface URLFieldProps extends Omit<ValidatedInputProps, 'type'> {
  allowEmpty?: boolean
}

export const URLField: React.FC<URLFieldProps> = ({
  allowEmpty = true,
  ...props
}) => {
  const urlValidators = allowEmpty 
    ? [(value: string) => value && !/^https?:\/\/.+/.test(value) ? 'Please enter a valid URL' : null] 
    : [
        validators.required('URL is required'),
        (value: string) => !/^https?:\/\/.+/.test(value) ? 'Please enter a valid URL' : null
      ]

  return (
    <ValidatedInput
      type="url"
      autoComplete="url"
      placeholder="https://example.com"
      {...props}
    />
  )
}
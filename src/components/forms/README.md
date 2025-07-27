# Axion Form Validation System

A comprehensive, type-safe form validation framework for the Axion ERP system. Built with React, TypeScript, and designed for robust error handling, accessibility, and excellent user experience.

## Features

- 🔧 **Type-safe validation** with TypeScript support
- ⚡ **Real-time validation** with debounced async checks
- 🎯 **Specialized field components** for common ERP data types
- 🔒 **Cross-field validation** for complex business rules
- 🌐 **Internationalization** with Unicode-safe validation
- ♿ **Accessibility** with ARIA labels and screen reader support
- 🎨 **Consistent styling** with Tailwind CSS integration
- 🚀 **Performance optimized** with memoization and debouncing

## Quick Start

### Installation

**Note**: This system requires `zod` for advanced validation features:
```bash
npm install zod
```

### Basic Usage

```tsx
import { useForm, FormWrapper, ValidatedInput } from '@/components/forms'

function MyForm() {
  const [formState, formActions] = useForm({
    fields: {
      name: {
        validators: [validators.required(), validators.name()],
        required: true,
        initialValue: '',
      },
      email: {
        validators: [validators.email()],
        required: false,
        initialValue: '',
      },
    },
    onSubmit: async (data) => {
      console.log('Form submitted:', data)
    },
  })

  return (
    <FormWrapper
      title="Contact Information"
      isSubmitting={formState.isSubmitting}
      isValid={formState.isValid}
      onSubmit={formActions.submit}
    >
      <ValidatedInput
        label="Name"
        {...formActions.getFieldProps('name')}
      />
      <ValidatedInput
        label="Email"
        type="email"
        {...formActions.getFieldProps('email')}
      />
    </FormWrapper>
  )
}
```

## Core Components

### Form Hook (`useForm`)

Type-safe form state management with validation.

```tsx
const [formState, formActions] = useForm<FormData>({
  fields: {
    fieldName: {
      validators: [validators.required(), validators.email()],
      asyncValidators: [checkUniqueEmail],
      required: true,
      initialValue: '',
      debounceMs: 300,
      sanitizer: (value) => value.trim(),
    },
  },
  onSubmit: async (data) => {
    // Handle form submission
  },
  validateOnChange: true,
  validateOnBlur: true,
})
```

**Form State:**
- `fields` - Individual field states with value, error, touched, validating, dirty
- `isValid` - Overall form validity
- `isSubmitting` - Submission state
- `isDirty` - Whether form has been modified
- `errors` - Consolidated error messages

**Form Actions:**
- `setValue(field, value)` - Update field value
- `setError(field, error)` - Set field error
- `validateField(field)` - Validate single field
- `validateAll()` - Validate entire form
- `submit()` - Submit form
- `reset()` - Reset to initial state
- `getFieldProps(field)` - Get props for field binding

### FormWrapper

Complete form container with error handling and actions.

```tsx
<FormWrapper
  title="Form Title"
  description="Form description"
  isSubmitting={isSubmitting}
  isValid={isValid}
  isDirty={isDirty}
  errors={errors}
  onSubmit={handleSubmit}
  onReset={handleReset}
  showSubmitButton={true}
  showResetButton={true}
  submitText="Save"
  resetText="Cancel"
  errorBoundary={true}
  submitOnEnter={true}
>
  {/* Form fields */}
</FormWrapper>
```

### Validated Input Components

Pre-built components with validation integration:

#### ValidatedInput
```tsx
<ValidatedInput
  label="Field Label"
  error={error}
  touched={touched}
  validating={validating}
  required={required}
  helperText="Additional help text"
  onChange={handleChange}
  onBlur={handleBlur}
/>
```

#### ValidatedTextarea
```tsx
<ValidatedTextarea
  label="Description"
  maxLength={1000}
  showCharCount={true}
  rows={4}
  {...fieldProps}
/>
```

#### ValidatedSelect
```tsx
<ValidatedSelect
  label="Status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]}
  placeholder="Select status"
  {...fieldProps}
/>
```

#### ValidatedNumberInput
```tsx
<ValidatedNumberInput
  label="Amount"
  formatType="currency"
  currency="USD"
  precision={2}
  {...fieldProps}
/>
```

## Specialized Field Components

### EmailField
```tsx
<EmailField
  label="Email Address"
  allowEmpty={true}
  {...fieldProps}
/>
```

### PhoneField
```tsx
<PhoneField
  label="Phone Number"
  format="us" // or "international"
  {...fieldProps}
/>
```

### CurrencyField
```tsx
<CurrencyField
  label="Price"
  currency="USD"
  allowNegative={false}
  onChange={(value) => setPrice(value)}
/>
```

### DateField
```tsx
<DateField
  label="Valid Until"
  allowPast={false}
  allowFuture={true}
  minDate="2024-01-01"
  {...fieldProps}
/>
```

### NameField
```tsx
<NameField
  label="Company Name"
  nameType="company" // or "person"
  {...fieldProps}
/>
```

### AddressField
```tsx
<AddressField
  label="Street Address"
  addressType="street" // "city", "state", "postal"
  {...fieldProps}
/>
```

### CountryStateField
```tsx
<CountryStateField
  label="State"
  type="state" // or "country"
  country="US"
  {...fieldProps}
/>
```

### QuantityField
```tsx
<QuantityField
  label="Quantity"
  unit="pcs"
  allowDecimals={true}
  onChange={(value) => setQuantity(value)}
/>
```

## Form Layout Components

### FormSection
Organize forms into logical sections:

```tsx
<FormSection 
  title="Personal Information"
  description="Basic contact details"
  collapsible={true}
  defaultCollapsed={false}
>
  {/* Fields */}
</FormSection>
```

### FormGrid
Responsive grid layout for fields:

```tsx
<FormGrid columns={2} gap="md">
  <ValidatedInput label="First Name" />
  <ValidatedInput label="Last Name" />
</FormGrid>
```

### Fieldset
Group related fields with accessibility:

```tsx
<Fieldset 
  legend="Address Information"
  description="Your mailing address"
  disabled={isLoading}
>
  {/* Address fields */}
</Fieldset>
```

### FormActions
Consistent button layouts:

```tsx
<FormActions align="right" sticky={true}>
  <Button variant="outline">Cancel</Button>
  <Button type="submit">Save</Button>
</FormActions>
```

## Validation System

### Built-in Validators

```tsx
import { validators } from '@/components/forms'

// Basic validators
validators.required('This field is required')
validators.email('Invalid email format')
validators.phone('Invalid phone number')
validators.minLength(5, 'Too short')
validators.maxLength(100, 'Too long')

// Number validators
validators.currency('Invalid amount')
validators.positive('Must be positive')
validators.integer('Must be whole number')

// Text validators
validators.name('Invalid name format')
validators.address('Invalid address format')

// Date validators
validators.dateRange(minDate, maxDate)

// Custom validator
const customValidator = (value) => {
  if (value === 'invalid') {
    return 'This value is not allowed'
  }
  return null
}
```

### Async Validators

For server-side validation (uniqueness checks, etc.):

```tsx
const checkUniqueEmail = async (email) => {
  const response = await fetch(`/api/check-email?email=${email}`)
  const { isUnique } = await response.json()
  return isUnique ? null : 'Email already exists'
}

// Use in form configuration
fields: {
  email: {
    validators: [validators.email()],
    asyncValidators: [checkUniqueEmail],
    debounceMs: 500,
  },
}
```

### Cross-field Validation

Validate fields that depend on each other:

```tsx
const passwordMatchValidator = createCrossFieldValidator(
  ['password', 'confirmPassword'],
  ({ password, confirmPassword }) => {
    if (password !== confirmPassword) {
      return 'Passwords do not match'
    }
    return null
  }
)
```

### Predefined Schemas

Use pre-built validation schemas for common entities:

```tsx
import { validateCustomer, validateQuote, validateLineItem } from '@/components/forms'

// Validate customer data
const customerValidation = validateCustomer(customerData)
if (!customerValidation.success) {
  // Handle errors
  console.log(customerValidation.errors)
}

// Validate quote data
const quoteValidation = validateQuote(quoteData)
```

## Error Handling

### Form-level Errors
```tsx
<FormWrapper
  errors={{
    'general': 'Form submission failed',
    'field1': 'Field-specific error',
  }}
>
  {/* Form content */}
</FormWrapper>
```

### Field-level Errors
```tsx
<ValidatedInput
  error="This field is required"
  touched={true}
  showError={true}
/>
```

### Error Boundaries
Forms are automatically wrapped in error boundaries:

```tsx
<FormWrapper errorBoundary={true}>
  {/* Form content - any errors are caught and displayed gracefully */}
</FormWrapper>
```

## Accessibility

All components follow accessibility best practices:

- **ARIA Labels**: Proper labeling for screen readers
- **Error Announcements**: Live regions for error updates
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Logical tab order
- **Required Field Indicators**: Visual and programmatic indication
- **Help Text Association**: Proper `aria-describedby` relationships

### Example Accessible Form

```tsx
<ValidatedInput
  label="Email Address"
  required={true}
  helperText="We'll never share your email"
  error="Please enter a valid email"
  touched={true}
  aria-describedby="email-help email-error"
/>
```

## Advanced Usage

### Dynamic Forms

Build forms dynamically based on configuration:

```tsx
const formConfig = {
  customer: { type: 'select', options: customers, required: true },
  title: { type: 'text', required: true },
  amount: { type: 'currency', required: true },
}

function DynamicForm({ config }) {
  const fields = Object.entries(config).reduce((acc, [key, field]) => {
    acc[key] = {
      validators: field.required ? [validators.required()] : [],
      required: field.required,
      initialValue: field.defaultValue || '',
    }
    return acc
  }, {})

  const [formState, formActions] = useForm({ fields })
  
  return (
    <FormWrapper {...formState} onSubmit={formActions.submit}>
      {Object.entries(config).map(([key, field]) => 
        renderField(key, field, formActions.getFieldProps(key))
      )}
    </FormWrapper>
  )
}
```

### Multi-step Forms

Handle complex multi-step workflows:

```tsx
function MultiStepForm() {
  const [step, setStep] = useState(1)
  const [stepData, setStepData] = useState({})
  
  const handleStepSubmit = (data) => {
    setStepData(prev => ({ ...prev, ...data }))
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Final submission
      submitForm({ ...stepData, ...data })
    }
  }
  
  return (
    <div>
      {step === 1 && <CustomerInfoStep onSubmit={handleStepSubmit} />}
      {step === 2 && <ProjectDetailsStep onSubmit={handleStepSubmit} />}
      {step === 3 && <ReviewStep data={stepData} onSubmit={handleStepSubmit} />}
    </div>
  )
}
```

### Form State Persistence

Save form state to localStorage:

```tsx
function PersistentForm() {
  const [formState, formActions] = useForm({
    fields: { /* ... */ },
    onSubmit: async (data) => {
      // Clear saved data on successful submit
      localStorage.removeItem('form-draft')
      await submitData(data)
    },
  })
  
  // Save draft on every change
  useEffect(() => {
    if (formState.isDirty) {
      localStorage.setItem('form-draft', JSON.stringify(formActions.getFormData()))
    }
  }, [formState.fields])
  
  // Restore draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('form-draft')
    if (draft) {
      formActions.setFormData(JSON.parse(draft))
    }
  }, [])
}
```

## Performance Tips

1. **Debounce Validation**: Use `debounceMs` for expensive validations
2. **Memoize Validators**: Create validators outside of render functions
3. **Lazy Validation**: Only validate dirty fields
4. **Async Validation**: Use AbortController for cancellation
5. **Field-level Updates**: Update only changed fields

## Examples

See `/src/app/forms-example/page.tsx` for comprehensive examples including:
- Customer registration form
- Quote creation with line items
- Real-time validation
- Error handling
- Accessibility features

## Migration Guide

### From Basic HTML Forms

```tsx
// Before
<form onSubmit={handleSubmit}>
  <input 
    type="email" 
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required 
  />
  {emailError && <span>{emailError}</span>}
  <button type="submit">Submit</button>
</form>

// After
const [formState, formActions] = useForm({
  fields: {
    email: {
      validators: [validators.required(), validators.email()],
      required: true,
      initialValue: '',
    },
  },
  onSubmit: async (data) => { /* ... */ },
})

<FormWrapper {...formState} onSubmit={formActions.submit}>
  <EmailField 
    label="Email Address"
    {...formActions.getFieldProps('email')}
  />
</FormWrapper>
```

### Adding Validation to Existing Forms

1. Wrap form with `FormWrapper`
2. Replace input components with validated versions
3. Add `useForm` hook for state management
4. Configure validators for each field
5. Handle submission through form actions

## Troubleshooting

### Common Issues

1. **Validation not running**: Check `validateOnChange` and `validateOnBlur` settings
2. **Async validation errors**: Ensure proper error handling in async validators
3. **Performance issues**: Add debouncing to expensive validations
4. **TypeScript errors**: Ensure form data interface matches field configuration
5. **Accessibility warnings**: Check that labels and ARIA attributes are properly set

### Debug Mode

Enable form debugging:

```tsx
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Form state:', formState)
    console.log('Form errors:', formState.errors)
  }
}, [formState])
```
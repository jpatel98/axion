"use client"

import React from 'react'
import { ToastManagerProvider } from '@/lib/toast'
import { 
  FormWrapper,
  FormSection, 
  FormGrid,
  ValidatedInput,
  ValidatedTextarea,
  ValidatedSelect,
  EmailField,
  PhoneField,
  CurrencyField,
  DateField,
  NameField,
  AddressField,
  CountryStateField,
  QuoteStatusField,
  QuantityField,
  useForm,
  validateCustomer,
  validateQuote,
  CustomerFormData,
  QuoteFormData,
  LineItemFormData,
} from '@/components/forms'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

// Customer form example
const CustomerFormExample: React.FC = () => {
  const [formState, formActions] = useForm<CustomerFormData>({
    fields: {
      name: {
        validators: [],
        required: true,
        initialValue: '',
      },
      email: {
        validators: [],
        required: false,
        initialValue: '',
      },
      phone: {
        validators: [],
        required: false,
        initialValue: '',
      },
      address_line1: {
        validators: [],
        required: false,
        initialValue: '',
      },
      address_line2: {
        validators: [],
        required: false,
        initialValue: '',
      },
      city: {
        validators: [],
        required: false,
        initialValue: '',
      },
      state: {
        validators: [],
        required: false,
        initialValue: '',
      },
      postal_code: {
        validators: [],
        required: false,
        initialValue: '',
      },
      contact_person: {
        validators: [],
        required: false,
        initialValue: '',
      },
      notes: {
        validators: [],
        required: false,
        initialValue: '',
      },
    },
    onSubmit: async (data) => {
      // Validate with our validation system
      const validation = validateCustomer(data)
      if (!validation.success) {
        Object.entries(validation.errors).forEach(([field, errors]) => {
          formActions.setError(field as keyof CustomerFormData, errors[0])
        })
        throw new Error('Validation failed')
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Customer submitted:', data)
      
      // Reset form on success
      formActions.reset()
    },
    validateOnChange: true,
    validateOnBlur: true,
  })

  return (
    <FormWrapper
      title="Create Customer"
      description="Add a new customer to your system"
      isSubmitting={formState.isSubmitting}
      isValid={formState.isValid}
      isDirty={formState.isDirty}
      errors={formState.errors}
      onSubmit={formActions.submit}
      onReset={formActions.reset}
      showResetButton={true}
      submitText="Create Customer"
    >
      <FormSection title="Basic Information">
        <FormGrid columns={2}>
          <NameField
            label="Company Name"
            nameType="company"
            {...formActions.getFieldProps('name')}
          />
          <NameField
            label="Contact Person"
            nameType="person"
            {...formActions.getFieldProps('contact_person')}
          />
          <EmailField
            label="Email Address"
            {...formActions.getFieldProps('email')}
          />
          <PhoneField
            label="Phone Number"
            format="us"
            {...formActions.getFieldProps('phone')}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Address Information">
        <FormGrid columns={1}>
          <AddressField
            label="Address Line 1"
            addressType="street"
            {...formActions.getFieldProps('address_line1')}
          />
          <AddressField
            label="Address Line 2"
            {...formActions.getFieldProps('address_line2')}
          />
        </FormGrid>
        
        <FormGrid columns={3}>
          <AddressField
            label="City"
            addressType="city"
            {...formActions.getFieldProps('city')}
          />
          <CountryStateField
            label="State"
            type="state"
            country="US"
            {...formActions.getFieldProps('state')}
          />
          <AddressField
            label="Postal Code"
            addressType="postal"
            {...formActions.getFieldProps('postal_code')}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Additional Information">
        <ValidatedTextarea
          label="Notes"
          placeholder="Any additional information about this customer..."
          rows={4}
          maxLength={1000}
          showCharCount={true}
          {...formActions.getFieldProps('notes')}
        />
      </FormSection>
    </FormWrapper>
  )
}

// Quote form example with line items
const QuoteFormExample: React.FC = () => {
  const [customers] = React.useState([
    { value: '1', label: 'Acme Corporation' },
    { value: '2', label: 'TechStart Inc' },
    { value: '3', label: 'Global Industries' },
  ])

  const [lineItems, setLineItems] = React.useState<LineItemFormData[]>([
    { description: '', quantity: 1, unit_price: 0 }
  ])

  const [formState, formActions] = useForm<Omit<QuoteFormData, 'line_items'>>({
    fields: {
      customer_id: {
        validators: [],
        required: true,
        initialValue: '',
      },
      title: {
        validators: [],
        required: true,
        initialValue: '',
      },
      description: {
        validators: [],
        required: false,
        initialValue: '',
      },
      valid_until: {
        validators: [],
        required: true,
        initialValue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      },
    },
    onSubmit: async (data) => {
      const fullData = { ...data, line_items: lineItems }
      
      // Validate with our validation system
      const validation = validateQuote(fullData)
      if (!validation.success) {
        Object.entries(validation.errors).forEach(([field, errors]) => {
          if (field.startsWith('line_items.')) {
            // Handle line item errors
            console.error('Line item error:', field, errors)
          } else {
            formActions.setError(field as keyof typeof data, errors[0])
          }
        })
        throw new Error('Validation failed')
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Quote submitted:', fullData)
      
      // Reset form on success
      formActions.reset()
      setLineItems([{ description: '', quantity: 1, unit_price: 0 }])
    },
    validateOnChange: true,
    validateOnBlur: true,
  })

  const addLineItem = () => {
    setLineItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateLineItem = (index: number, field: keyof LineItemFormData, value: any) => {
    setLineItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  }

  return (
    <FormWrapper
      title="Create Quote"
      description="Generate a new quote for your customer"
      isSubmitting={formState.isSubmitting}
      isValid={formState.isValid}
      isDirty={formState.isDirty}
      errors={formState.errors}
      onSubmit={formActions.submit}
      onReset={() => {
        formActions.reset()
        setLineItems([{ description: '', quantity: 1, unit_price: 0 }])
      }}
      showResetButton={true}
      submitText="Create Quote"
    >
      <FormSection title="Quote Details">
        <FormGrid columns={2}>
          <ValidatedSelect
            label="Customer"
            options={customers}
            placeholder="Select a customer"
            {...formActions.getFieldProps('customer_id')}
          />
          <ValidatedInput
            label="Quote Title"
            placeholder="Enter quote title"
            {...formActions.getFieldProps('title')}
          />
        </FormGrid>
        
        <ValidatedTextarea
          label="Description"
          placeholder="Enter quote description"
          rows={3}
          {...formActions.getFieldProps('description')}
        />
        
        <DateField
          label="Valid Until"
          allowPast={false}
          {...formActions.getFieldProps('valid_until')}
        />
      </FormSection>

      <FormSection 
        title="Line Items"
        description="Add items to your quote"
      >
        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Item #{index + 1}</h4>
                {lineItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <FormGrid columns={1}>
                <ValidatedInput
                  label="Description"
                  placeholder="Item description"
                  value={item.description}
                  onChange={(value) => updateLineItem(index, 'description', value)}
                  required
                />
              </FormGrid>
              
              <FormGrid columns={3}>
                <QuantityField
                  label="Quantity"
                  value={item.quantity}
                  onChange={(value) => updateLineItem(index, 'quantity', value || 0)}
                  required
                />
                <CurrencyField
                  label="Unit Price"
                  value={item.unit_price}
                  onChange={(value) => updateLineItem(index, 'unit_price', value || 0)}
                  required
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Line Total</label>
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-sm">
                    ${(item.quantity * item.unit_price).toFixed(2)}
                  </div>
                </div>
              </FormGrid>
            </div>
          ))}
          
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={addLineItem}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Line Item
            </Button>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Quote Total</div>
              <div className="text-lg font-bold">${calculateTotal().toFixed(2)}</div>
            </div>
          </div>
        </div>
      </FormSection>
    </FormWrapper>
  )
}

// Main demo page
export default function FormsExamplePage() {
  const [activeTab, setActiveTab] = React.useState<'customer' | 'quote'>('customer')

  return (
    <ToastManagerProvider>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Form Validation Examples</h1>
          <p className="text-muted-foreground">
            Comprehensive form validation system with real-time feedback and error handling.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex space-x-1 mb-8 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('customer')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'customer'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Customer Form
          </button>
          <button
            onClick={() => setActiveTab('quote')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'quote'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Quote Form
          </button>
        </div>

        {/* Form content */}
        <div className="bg-card rounded-lg border p-6">
          {activeTab === 'customer' && <CustomerFormExample />}
          {activeTab === 'quote' && <QuoteFormExample />}
        </div>

        {/* Features list */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Validation Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Real-time validation with debouncing</li>
              <li>• Type-safe form state management</li>
              <li>• Comprehensive error handling</li>
              <li>• Cross-field validation support</li>
              <li>• Async validation for uniqueness checks</li>
              <li>• Accessibility with ARIA labels</li>
              <li>• Unicode-safe text validation</li>
              <li>• Currency and number formatting</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Form Components</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Specialized field components (email, phone, currency)</li>
              <li>• Automatic formatting and sanitization</li>
              <li>• Loading states and validation indicators</li>
              <li>• Responsive form layouts</li>
              <li>• Character counting for text areas</li>
              <li>• File upload with size validation</li>
              <li>• Date range validation</li>
              <li>• Address field autocomplete support</li>
            </ul>
          </div>
        </div>
      </div>
    </ToastManagerProvider>
  )
}
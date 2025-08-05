'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { 
  FormWrapper,
  FormSection, 
  FormGrid,
  ValidatedInput,
  ValidatedTextarea,
  ValidatedSelect,
  DateField,
  QuantityField,
  CurrencyField,
  useForm,
  validators,
  QuoteFormData as BaseQuoteFormData,
  LineItemFormData
} from '@/components/forms'
import { Button } from '@/components/ui/button'
import { FormSkeleton } from '@/components/ui/skeleton'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address_line1?: string
  city?: string
  state?: string
}

// Extend the base form data to remove line_items from the main form
interface QuoteFormFields extends Omit<BaseQuoteFormData, 'line_items'> {}

export default function NewQuotePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customersLoading, setCustomersLoading] = useState(true)
  const [quoteNumber, setQuoteNumber] = useState<string>('')
  const [lineItems, setLineItems] = useState<LineItemFormData[]>([
    { description: '', quantity: 1, unit_price: 0 }
  ])

  // Get default valid_until date (30 days from now)
  const getDefaultValidDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  }

  const [formState, formActions] = useForm<QuoteFormFields>({
    fields: {
      customer_id: {
        validators: [validators.required('Customer is required')],
        required: true,
        initialValue: '',
      },
      title: {
        validators: [validators.required('Quote title is required'), validators.maxLength(255)],
        required: true,
        initialValue: '',
      },
      description: {
        validators: [validators.maxLength(1000)],
        required: false,
        initialValue: '',
      },
      part_number: {
        validators: [validators.maxLength(100)],
        required: false,
        initialValue: '',
      },
      due_date: {
        validators: [],
        required: false,
        initialValue: '',
      },
      valid_until: {
        validators: [validators.required('Valid until date is required'), validators.dateRange(new Date())],
        required: true,
        initialValue: getDefaultValidDate(),
      },
    },
    onSubmit: async (data) => {
      // Validate quote number
      if (!quoteNumber) {
        throw new Error('Quote number is required')
      }

      // Validate line items
      const validItems = lineItems.filter(item => 
        item.description.trim() && item.quantity > 0 && item.unit_price > 0
      )
      
      if (validItems.length === 0) {
        throw new Error('At least one valid line item is required')
      }

      const response = await fetch('/api/v1/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          part_number: data.part_number || null,
          due_date: data.due_date || null,
          quote_number: quoteNumber,
          line_items: validItems
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create quote')
      }

      const result = await response.json()
      console.log('Quote creation result:', result)
      console.log('Redirecting to:', `/dashboard/quotes/${result.quote.id}`)
      router.push(`/dashboard/quotes/${result.quote.id}`)
    },
    validateOnChange: false,
    validateOnBlur: true,
  })

  useEffect(() => {
    fetchCustomers()
    fetchQuoteNumber()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/v1/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setCustomersLoading(false)
    }
  }

  const fetchQuoteNumber = async () => {
    try {
      const response = await fetch('/api/v1/quotes/next-number')
      if (response.ok) {
        const data = await response.json()
        setQuoteNumber(data.next_quote_number || '')
      }
    } catch (error) {
      console.error('Error fetching quote number:', error)
    }
  }

  const updateLineItem = (index: number, field: keyof LineItemFormData, value: string | number) => {
    setLineItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const addLineItem = () => {
    setLineItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter((_, i) => i !== index))
    }
  }

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  }

  const selectedCustomer = customers.find(c => c.id === formState.fields.customer_id.value)
  
  const customerOptions = customers.map(customer => ({
    value: customer.id,
    label: `${customer.name}${customer.email ? ` (${customer.email})` : ''}`
  }))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/quotes" className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quotes
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Create New Quote</h1>
          <p className="text-slate-800">
            Create a new quote for your customer
            {quoteNumber && <span className="ml-2 text-sm font-mono bg-gray-100 px-2 py-1 rounded">#{quoteNumber}</span>}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quote Details */}
        <div className="lg:col-span-2">
          <FormWrapper
            isSubmitting={formState.isSubmitting}
            isValid={formState.isValid && !!quoteNumber && lineItems.some(item => item.description.trim())}
            isDirty={formState.isDirty}
            errors={{}}
            onSubmit={formActions.submit}
            onReset={() => {
              formActions.reset()
              setLineItems([{ description: '', quantity: 1, unit_price: 0 }])
            }}
            showResetButton={formState.isDirty}
            submitText="Create Quote"
            showSubmitButton={false}
          >
            <FormSection title="Quote Details">
              <FormGrid columns={2}>
                {customersLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                ) : (
                  <ValidatedSelect
                    label="Customer"
                    options={customerOptions}
                    placeholder="Select a customer"
                    value={formState.fields?.customer_id?.value || ''}
                    onChange={(value) => formActions.setValue('customer_id', value)}
                    onBlur={() => formActions.touchField('customer_id')}
                    error={formState.fields?.customer_id?.error}
                    touched={formState.fields?.customer_id?.touched}
                    validating={formState.fields?.customer_id?.validating}
                    dirty={formState.fields?.customer_id?.dirty}
                    required={true}
                  />
                )}
                
                <ValidatedInput
                  label="Quote Title"
                  placeholder="Enter quote title"
                  value={formState.fields?.title?.value || ''}
                  onChange={(value) => formActions.setValue('title', value)}
                  error={formState.fields?.title?.error}
                  touched={formState.fields?.title?.touched}
                />
              </FormGrid>
              
              <ValidatedTextarea
                label="Description"
                placeholder="Enter quote description"
                rows={3}
                maxLength={1000}
                showCharCount={true}
                value={formState.fields?.description?.value || ''}
                onChange={(value) => formActions.setValue('description', value)}
                error={formState.fields?.description?.error}
                touched={formState.fields?.description?.touched}
              />
              
              <FormGrid columns={2}>
                <ValidatedInput
                  label="Part Number"
                  placeholder="Enter part number (optional)"
                  value={formState.fields?.part_number?.value || ''}
                  onChange={(value) => formActions.setValue('part_number', value)}
                  error={formState.fields?.part_number?.error}
                  touched={formState.fields?.part_number?.touched}
                />
                
                <DateField
                  label="Due Date"
                  allowPast={false}
                  allowFuture={true}
                  value={formState.fields?.due_date?.value || ''}
                  onChange={(value) => formActions.setValue('due_date', value)}
                  error={formState.fields?.due_date?.error}
                  touched={formState.fields?.due_date?.touched}
                />
              </FormGrid>
              
              <DateField
                label="Valid Until"
                allowPast={false}
                value={formState.fields?.valid_until?.value || ''}
                onChange={(value) => formActions.setValue('valid_until', value)}
                error={formState.fields?.valid_until?.error}
                touched={formState.fields?.valid_until?.touched}
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
                      <h4 className="font-medium text-slate-800">Item #{index + 1}</h4>
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
                        value={item.description || ''}
                        onChange={(value) => updateLineItem(index, 'description', value)}
                        required
                      />
                    </FormGrid>
                    
                    <FormGrid columns={3}>
                      <QuantityField
                        label="Quantity"
                        value={item.quantity || 0}
                        onChange={(value) => updateLineItem(index, 'quantity', value || 0)}
                        required
                      />
                      <CurrencyField
                        label="Unit Price"
                        currency="CAD"
                        value={item.unit_price || 0}
                        onChange={(value) => updateLineItem(index, 'unit_price', value || 0)}
                        required
                      />
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-800">Line Total</label>
                        <div className="h-10 px-3 py-2 bg-gray-100 rounded-md flex items-center text-sm">
                          {formatCurrency(item.quantity * item.unit_price)}
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
                    <div className="text-sm text-slate-800">Quote Total</div>
                    <div className="text-lg font-bold">{formatCurrency(calculateTotal())}</div>
                  </div>
                </div>
              </div>
            </FormSection>
          </FormWrapper>
          
          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6">
            <Link href="/dashboard/quotes">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button 
              onClick={formActions.submit}
              disabled={formState.isSubmitting || !formState.isValid || !quoteNumber || !lineItems.some(item => item.description.trim())}
              className="flex items-center gap-2"
            >
              {formState.isSubmitting ? 'Creating...' : 'Create Quote'}
            </Button>
          </div>
        </div>

        {/* Customer Info Sidebar */}
        <div>
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-slate-800">Customer Information</h3>
            </div>
            <div className="p-6">
              {selectedCustomer ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-800">Name</label>
                    <p className="text-sm text-slate-800">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800">Email</label>
                    <p className="text-sm text-slate-800">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800">Phone</label>
                    <p className="text-sm text-slate-800">{selectedCustomer.phone}</p>
                  </div>
                  {selectedCustomer.address_line1 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-800">Address</label>
                      <p className="text-sm text-slate-800">
                        {selectedCustomer.address_line1}<br />
                        {selectedCustomer.city}, {selectedCustomer.state}
                      </p>
                    </div>
                  )}
                  <div className="pt-2">
                    <Link 
                      href={`/dashboard/customers/${selectedCustomer.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Customer Details →
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-800">
                  Select a customer to view their information
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
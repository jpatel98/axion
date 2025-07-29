'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { 
  FormWrapper,
  FormSection, 
  FormGrid,
  NameField,
  EmailField,
  PhoneField,
  AddressField,
  CountryStateField,
  ValidatedTextarea,
  useForm,
  validators,
  CustomerFormData
} from '@/components/forms'

export default function NewCustomerPage() {
  const router = useRouter()
  // Fixed form validation issue

  const [formState, formActions] = useForm<CustomerFormData>({
    fields: {
      name: {
        validators: [validators.required('Company name is required'), validators.name()],
        required: true,
        initialValue: '',
      },
      email: {
        validators: [validators.email()],
        required: false,
        initialValue: '',
      },
      phone: {
        validators: [validators.phone()],
        required: false,
        initialValue: '',
      },
      address_line1: {
        validators: [validators.address()],
        required: false,
        initialValue: '',
      },
      address_line2: {
        validators: [validators.address()],
        required: false,
        initialValue: '',
      },
      city: {
        validators: [validators.name()],
        required: false,
        initialValue: '',
      },
      state: {
        validators: [],
        required: false,
        initialValue: '',
      },
      postal_code: {
        validators: [validators.postalCode()],
        required: false,
        initialValue: '',
      },
      contact_person: {
        validators: [validators.name()],
        required: false,
        initialValue: '',
      },
      notes: {
        validators: [validators.maxLength(1000)],
        required: false,
        initialValue: '',
      },
    },
    onSubmit: async (data) => {
      const response = await fetch('/api/v1/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create customer')
      }

      router.push('/dashboard/customers')
    },
    validateOnChange: false,
    validateOnBlur: true,
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-x-2 text-sm text-slate-800 hover:text-slate-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Add New Customer</h1>
        <p className="mt-2 text-sm text-slate-800">
          Create a new customer record for your manufacturing business
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <FormWrapper
          isSubmitting={formState.isSubmitting}
          isValid={formState.isValid}
          isDirty={formState.isDirty}
          errors={formState.errors}
          onSubmit={formActions.submit}
          onReset={formActions.reset}
          showResetButton={formState.isDirty}
          submitText="Create Customer"
          resetText="Clear Form"
        >
          <FormSection title="Basic Information">
            <FormGrid columns={2}>
              <NameField
                label="Company Name"
                nameType="company"
                placeholder="e.g., Acme Manufacturing Corp"
                value={formState.fields?.name?.value || ''}
                onChange={(value) => formActions.setValue('name', value)}
                error={formState.fields?.name?.error}
                touched={formState.fields?.name?.touched}
              />
              <NameField
                label="Primary Contact Person"
                nameType="person"
                placeholder="John Smith"
                value={formState.fields?.contact_person?.value || ''}
                onChange={(value) => formActions.setValue('contact_person', value)}
                error={formState.fields?.contact_person?.error}
                touched={formState.fields?.contact_person?.touched}
              />
              <EmailField
                label="Email Address"
                placeholder="contact@company.com"
                value={formState.fields?.email?.value || ''}
                onChange={(value) => formActions.setValue('email', value)}
                error={formState.fields?.email?.error}
                touched={formState.fields?.email?.touched}
              />
              <PhoneField
                label="Phone Number"
                format="us"
                placeholder="(555) 123-4567"
                value={formState.fields?.phone?.value || ''}
                onChange={(value) => formActions.setValue('phone', value)}
                error={formState.fields?.phone?.error}
                touched={formState.fields?.phone?.touched}
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Address Information">
            <FormGrid columns={1}>
              <AddressField
                label="Address Line 1"
                addressType="street"
                placeholder="123 Main Street"
                value={formState.fields?.address_line1?.value || ''}
                onChange={(value) => formActions.setValue('address_line1', value)}
                error={formState.fields?.address_line1?.error}
                touched={formState.fields?.address_line1?.touched}
              />
              <AddressField
                label="Address Line 2"
                placeholder="Suite 100"
                value={formState.fields?.address_line2?.value || ''}
                onChange={(value) => formActions.setValue('address_line2', value)}
                error={formState.fields?.address_line2?.error}
                touched={formState.fields?.address_line2?.touched}
              />
            </FormGrid>
            
            <FormGrid columns={3}>
              <AddressField
                label="City"
                addressType="city"
                placeholder="Toronto"
                value={formState.fields?.city?.value || ''}
                onChange={(value) => formActions.setValue('city', value)}
                error={formState.fields?.city?.error}
                touched={formState.fields?.city?.touched}
              />
              <AddressField
                label="Province / State"
                placeholder="ON"
                value={formState.fields?.state?.value || ''}
                onChange={(value) => formActions.setValue('state', value)}
                error={formState.fields?.state?.error}
                touched={formState.fields?.state?.touched}
              />
              <AddressField
                label="Postal Code"
                addressType="postal"
                placeholder="M5V 3A8"
                value={formState.fields?.postal_code?.value || ''}
                onChange={(value) => formActions.setValue('postal_code', value)}
                error={formState.fields?.postal_code?.error}
                touched={formState.fields?.postal_code?.touched}
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
              value={formState.fields?.notes?.value || ''}
              onChange={(value) => formActions.setValue('notes', value)}
              error={formState.fields?.notes?.error}
              touched={formState.fields?.notes?.touched}
            />
          </FormSection>
        </FormWrapper>
      </div>
    </div>
  )
}
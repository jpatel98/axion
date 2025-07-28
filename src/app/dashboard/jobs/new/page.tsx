'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { 
  FormWrapper,
  FormSection, 
  FormGrid,
  ValidatedInput,
  ValidatedTextarea,
  QuantityField,
  CurrencyField,
  DateField,
  useForm,
  validators
} from '@/components/forms'

interface JobFormData {
  job_number: string
  customer_name: string
  part_number: string
  description: string
  quantity: number
  estimated_cost: number
  due_date: string
}

export default function NewJobPage() {
  const router = useRouter()
  const [nextJobNumber, setNextJobNumber] = useState('')
  const [loadingJobNumber, setLoadingJobNumber] = useState(true)

  useEffect(() => {
    // Fetch the next job number on component mount
    const fetchNextJobNumber = async () => {
      try {
        const response = await fetch('/api/v1/jobs/next-number')
        if (response.ok) {
          const data = await response.json()
          setNextJobNumber(data.next_job_number)
        }
      } catch (error) {
        console.error('Error fetching next job number:', error)
        setNextJobNumber('JOB-001') // Fallback
      } finally {
        setLoadingJobNumber(false)
      }
    }

    fetchNextJobNumber()
  }, [])

  const [formState, formActions] = useForm<JobFormData>({
    fields: {
      job_number: {
        validators: [],
        required: false,
        initialValue: nextJobNumber || '',
      },
      customer_name: {
        validators: [validators.name()],
        required: false,
        initialValue: '',
      },
      part_number: {
        validators: [],
        required: false,
        initialValue: '',
      },
      description: {
        validators: [validators.maxLength(1000)],
        required: false,
        initialValue: '',
      },
      quantity: {
        validators: [validators.positive(), validators.integer()],
        required: false,
        initialValue: 1,
      },
      estimated_cost: {
        validators: [validators.currency(), validators.positive()],
        required: false,
        initialValue: 0,
      },
      due_date: {
        validators: [validators.dateRange(new Date())],
        required: false,
        initialValue: '',
      },
    },
    onSubmit: async (data) => {
      const response = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          job_number: nextJobNumber || data.job_number,
          due_date: data.due_date || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create job')
      }

      router.push('/dashboard/jobs')
    },
    validateOnChange: false,
    validateOnBlur: true,
  })


  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
        <p className="mt-2 text-sm text-gray-700">
          Add a new manufacturing job to track from start to finish
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
          submitText="Create Job"
          resetText="Clear Form"
        >
          <FormSection title="Job Details">
            <FormGrid columns={2}>
              <ValidatedInput
                label="Job Number"
                placeholder="Auto-generating..."
                helperText="Auto-generated based on sequence"
                value={nextJobNumber || 'Loading...'}
                readOnly
                disabled={loadingJobNumber}
              />
              
              <ValidatedInput
                label="Customer Name"
                placeholder="Acme Manufacturing"
                value={formState.fields?.customer_name?.value || ''}
                onChange={(value) => formActions.setValue('customer_name', value)}
                error={formState.fields?.customer_name?.error}
                touched={formState.fields?.customer_name?.touched}
              />
              
              <ValidatedInput
                label="Part Number"
                placeholder="PART-123"
                value={formState.fields?.part_number?.value || ''}
                onChange={(value) => formActions.setValue('part_number', value)}
                error={formState.fields?.part_number?.error}
                touched={formState.fields?.part_number?.touched}
              />
              
              <QuantityField
                label="Quantity"
                value={formState.fields?.quantity?.value || 0}
                onChange={(value) => formActions.setValue('quantity', value)}
                error={formState.fields?.quantity?.error}
                touched={formState.fields?.quantity?.touched}
              />
              
              <CurrencyField
                label="Estimated Cost"
                currency="CAD"
                value={formState.fields?.estimated_cost?.value || 0}
                onChange={(value) => formActions.setValue('estimated_cost', value)}
                error={formState.fields?.estimated_cost?.error}
                touched={formState.fields?.estimated_cost?.touched}
              />
              
              <DateField
                label="Due Date"
                allowPast={false}
                value={formState.fields?.due_date?.value || ''}
                onChange={(value) => formActions.setValue('due_date', value)}
                error={formState.fields?.due_date?.error}
                touched={formState.fields?.due_date?.touched}
              />
            </FormGrid>
          </FormSection>

          <FormSection title="Description">
            <ValidatedTextarea
              label="Work Description"
              placeholder="Describe the work to be done..."
              rows={4}
              maxLength={1000}
              showCharCount={true}
              value={formState.fields?.description?.value || ''}
              onChange={(value) => formActions.setValue('description', value)}
              error={formState.fields?.description?.error}
              touched={formState.fields?.description?.touched}
            />
          </FormSection>
        </FormWrapper>
      </div>
    </div>
  )
}
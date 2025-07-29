'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
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
import { useToast } from '@/lib/toast'

interface Job {
  id: string
  job_number: string
  customer_name: string | null
  part_number: string | null
  description: string | null
  quantity: number
  estimated_cost: number | null
  actual_cost: number
  status: string
  due_date: string | null
  created_at: string
  updated_at: string
}

interface JobFormData {
  job_number: string
  customer_name: string
  part_number: string
  description: string
  quantity: number
  estimated_cost: number
  actual_cost: number
  status: string
  due_date: string
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'shipped', label: 'Shipped' }
]

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { addToast } = useToast()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await Promise.resolve(params)
      setJobId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (jobId) {
      fetchJob()
    }
  }, [jobId])

  const fetchJob = async () => {
    if (!jobId) return
    
    try {
      const response = await fetch(`/api/v1/jobs/${jobId}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Job not found')
        }
        throw new Error('Failed to fetch job')
      }
      const data = await response.json()
      setJob(data.job)
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to fetch job'
      })
      router.push('/dashboard/jobs')
    } finally {
      setLoading(false)
    }
  }

  const { 
    formData, 
    errors, 
    isSubmitting, 
    handleInputChange, 
    handleSubmit, 
    setFormData 
  } = useForm<JobFormData>({
    initialData: {
      job_number: '',
      customer_name: '',
      part_number: '',
      description: '',
      quantity: 1,
      estimated_cost: 0,
      actual_cost: 0,
      status: 'pending',
      due_date: ''
    },
    validationRules: {
      job_number: [validators.required()],
      customer_name: [validators.required()],
      part_number: [validators.required()],
      description: [validators.required()],
      quantity: [validators.required(), validators.min(1)],
      estimated_cost: [validators.min(0)],
      actual_cost: [validators.min(0)],
      status: [validators.required()],
      due_date: []
    },
    onSubmit: async (data) => {
      if (!jobId) return

      try {
        const response = await fetch(`/api/v1/jobs/${jobId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update job')
        }

        addToast({
          type: 'success',
          title: 'Success',
          message: 'Job updated successfully!'
        })

        router.push(`/dashboard/jobs/${jobId}`)
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to update job'
        })
      }
    }
  })

  // Set form data when job is loaded
  useEffect(() => {
    if (job) {
      setFormData({
        job_number: job.job_number,
        customer_name: job.customer_name || '',
        part_number: job.part_number || '',
        description: job.description || '',
        quantity: job.quantity,
        estimated_cost: job.estimated_cost || 0,
        actual_cost: job.actual_cost,
        status: job.status,
        due_date: job.due_date ? job.due_date.split('T')[0] : ''
      })
    }
  }, [job, setFormData])

  const handleDelete = async () => {
    if (!jobId || !confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/v1/jobs/${jobId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete job')
      }

      addToast({
        type: 'success',
        title: 'Success',
        message: 'Job deleted successfully!'
      })

      router.push('/dashboard/jobs')
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete job'
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div className="text-gray-500">Loading job...</div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div>
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="text-sm text-red-700">
            Job not found
          </div>
        </div>
      </div>
    )
  }

  return (
    <FormWrapper>
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/jobs/${jobId}`}
          className="inline-flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Job Details
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
            <p className="mt-2 text-sm text-gray-700">
              Update job details and track progress
            </p>
          </div>
          
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {deleting ? 'Deleting...' : 'Delete Job'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <FormSection 
          title="Basic Information" 
          description="Core details about the manufacturing job"
        >
          <FormGrid>
            <ValidatedInput
              label="Job Number"
              name="job_number"
              value={formData.job_number}
              onChange={handleInputChange}
              error={errors.job_number}
              placeholder="e.g., JOB-001"
              required
            />

            <ValidatedInput
              label="Customer Name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              error={errors.customer_name}
              placeholder="Enter customer name"
              required
            />

            <ValidatedInput
              label="Part Number"
              name="part_number"
              value={formData.part_number}
              onChange={handleInputChange}
              error={errors.part_number}
              placeholder="Enter part number"
              required
            />

            <div className="col-span-2">
              <ValidatedTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={errors.description}
                placeholder="Describe the job requirements and specifications"
                rows={3}
                required
              />
            </div>
          </FormGrid>
        </FormSection>

        {/* Job Details */}
        <FormSection 
          title="Job Details" 
          description="Quantities, costs, and scheduling information"
        >
          <FormGrid>
            <QuantityField
              label="Quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              error={errors.quantity}
              required
            />

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            <CurrencyField
              label="Estimated Cost"
              name="estimated_cost"
              value={formData.estimated_cost}
              onChange={handleInputChange}
              error={errors.estimated_cost}
            />

            <CurrencyField
              label="Actual Cost"
              name="actual_cost"
              value={formData.actual_cost}
              onChange={handleInputChange}
              error={errors.actual_cost}
            />

            <DateField
              label="Due Date"
              name="due_date"
              value={formData.due_date}
              onChange={handleInputChange}
              error={errors.due_date}
            />
          </FormGrid>
        </FormSection>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Link
            href={`/dashboard/jobs/${jobId}`}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Job
              </>
            )}
          </button>
        </div>
      </form>
    </FormWrapper>
  )
}
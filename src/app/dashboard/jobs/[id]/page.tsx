'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, DollarSign, Package, User, FileText, Clock } from 'lucide-react'

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

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
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
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateJobStatus = async (newStatus: string) => {
    if (!job || !jobId) return
    
    setUpdating(true)
    try {
      const response = await fetch(`/api/v1/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...job,
          status: newStatus
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update job status')
      }

      const data = await response.json()
      setJob(data.job)
    } catch (err) {
      console.error('Error updating job:', err)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div className="text-gray-500">Loading job details...</div>
        </div>
      </div>
    )
  }

  if (error || !job) {
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
            {error || 'Job not found'}
          </div>
        </div>
      </div>
    )
  }

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
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.job_number}</h1>
            <p className="mt-2 text-sm text-gray-700">
              Created {formatDate(job.created_at)}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ${getStatusColor(
              job.status
            )}`}
          >
            {job.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Job Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {job.customer_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Customer</label>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{job.customer_name}</span>
                  </div>
                </div>
              )}

              {job.part_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Part Number</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{job.part_number}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500">Quantity</label>
                <div className="mt-1 text-sm text-gray-900">{job.quantity}</div>
              </div>

              {job.due_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Due Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{formatDate(job.due_date)}</span>
                  </div>
                </div>
              )}
            </div>

            {job.description && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <div className="mt-1 flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-900">{job.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Status Management */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status Management</h3>
            
            <div className="flex flex-wrap gap-2">
              {['pending', 'in_progress', 'completed', 'shipped'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateJobStatus(status)}
                  disabled={updating || job.status === status}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    job.status === status
                      ? getStatusColor(status)
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Tracking */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Tracking</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Estimated Cost</label>
                <div className="mt-1 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(job.estimated_cost)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Actual Cost</label>
                <div className="mt-1 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(job.actual_cost)}
                  </span>
                </div>
              </div>

              {job.estimated_cost && job.estimated_cost > 0 && (
                <div className="pt-2 border-t">
                  <label className="block text-sm font-medium text-gray-500">Variance</label>
                  <div className="mt-1">
                    {(() => {
                      const variance = job.actual_cost - job.estimated_cost
                      const isOver = variance > 0
                      return (
                        <span className={`text-lg font-semibold ${
                          isOver ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {isOver ? '+' : ''}{formatCurrency(variance)}
                        </span>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900">{formatDate(job.created_at)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Last Updated:</span>
                <span className="text-gray-900">{formatDate(job.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
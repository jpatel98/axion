'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Calendar, DollarSign, Package, Eye, Edit } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ServerDataTable, ServerColumn } from '@/components/ui/data-table-server'
import { Button } from '@/components/ui/button'
import { ContentSkeleton } from '@/components/ui/skeleton'

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
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [totalJobs, setTotalJobs] = useState(0)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchDebounce, setSearchDebounce] = useState('')
  const router = useRouter()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm)
      setCurrentPage(1) // Reset to first page on search
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchJobs()
  }, [currentPage, pageSize, sortBy, sortOrder, statusFilter, searchDebounce])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchDebounce && { search: searchDebounce })
      })
      
      const response = await fetch(`/api/v1/jobs?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      const data = await response.json()
      setJobs(data.jobs)
      setTotalJobs(data.pagination.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
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

  const formatCurrency = useCallback((amount: number | null) => {
    if (amount === null) return 'N/A'
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount)
  }, [])

  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString()
  }, [])

  const jobColumns: ServerColumn<Job>[] = useMemo(() => [
    {
      key: 'job_number',
      title: 'Job Number',
      sortable: true,
      render: (value, record) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'customer_name',
      title: 'Customer',
      sortable: true,
      render: (value) => value || 'N/A'
    },
    {
      key: 'part_number',
      title: 'Part Number',
      sortable: true,
      render: (value) => value || 'N/A'
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value || 'N/A'}
        </div>
      )
    },
    {
      key: 'quantity',
      title: 'Quantity',
      sortable: true,
      align: 'center' as const
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(value)}`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'estimated_cost',
      title: 'Estimated Cost',
      sortable: true,
      align: 'right' as const,
      render: (value) => formatCurrency(value)
    },
    {
      key: 'due_date',
      title: 'Due Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(value)}
        </div>
      )
    }
  ], [formatCurrency, formatDate, getStatusColor])

  if (loading) {
    return <ContentSkeleton type={viewMode === 'table' ? 'table' : 'list'} />
  }

  if (error) {
    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your manufacturing jobs from start to finish
            </p>
          </div>
        </div>
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Unable to load jobs</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>There was a problem loading your jobs. This might be because:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Your user account hasn't been properly set up yet</li>
                  <li>There's a database connection issue</li>
                </ul>
                <button 
                  onClick={fetchJobs}
                  className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your manufacturing jobs from start to finish
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="shipped">Shipped</option>
          </select>
          <div className="flex rounded-md shadow-sm">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-r-none"
            >
              Table
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-l-none"
            >
              Grid
            </Button>
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="h-4 w-4" />
            New Job
          </Link>
        </div>
      </div>

      {/* Jobs Display */}
      {viewMode === 'table' ? (
        <ServerDataTable
          data={jobs}
          columns={jobColumns}
          loading={loading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalJobs}
          onPageChange={setCurrentPage}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(column, order) => {
            setSortBy(column)
            setSortOrder(order)
          }}
          searchValue={searchTerm}
          onSearch={setSearchTerm}
          searchPlaceholder="Search jobs..."
          onRowClick={(job) => router.push(`/dashboard/jobs/${job.id}`)}
          onView={(job) => router.push(`/dashboard/jobs/${job.id}`)}
          onEdit={(job) => router.push(`/dashboard/jobs/${job.id}/edit`)}
          showActions
          emptyMessage={
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No jobs yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first job.</p>
            </div>
          }
        />
      ) : (
        jobs.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No jobs yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first job.</p>
            <div className="mt-6">
              <Link
                href="/dashboard/jobs/new"
                className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" />
                New Job
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="relative rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {job.job_number}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {job.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-3">
                  {job.customer_name && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Customer</p>
                      <p className="text-sm text-gray-900">{job.customer_name}</p>
                    </div>
                  )}

                  {job.part_number && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Part Number</p>
                      <p className="text-sm text-gray-900">{job.part_number}</p>
                    </div>
                  )}

                  {job.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-sm text-gray-900 line-clamp-2">{job.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Quantity</p>
                      <p className="text-sm text-gray-900">{job.quantity}</p>
                    </div>

                    {job.due_date && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Due Date</p>
                        <p className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(job.due_date)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Estimated</p>
                        <p className="text-sm text-gray-900 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(job.estimated_cost)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Actual</p>
                        <p className="text-sm text-gray-900 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(job.actual_cost)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
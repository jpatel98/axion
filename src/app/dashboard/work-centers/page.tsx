'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Settings, Activity, Edit, Trash2, Factory } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ServerDataTable, ServerColumn } from '@/components/ui/data-table-server'
import { Button } from '@/components/ui/button'
import { ContentSkeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/toast'

interface WorkCenter {
  id: string
  name: string
  description: string | null
  machine_type: string | null
  capacity_hours_per_day: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function WorkCentersPage() {
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [totalWorkCenters, setTotalWorkCenters] = useState(0)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchDebounce, setSearchDebounce] = useState('')
  const router = useRouter()
  const { addToast } = useToast()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm)
      setCurrentPage(1) // Reset to first page on search
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchWorkCenters()
  }, [currentPage, sortBy, sortOrder, searchDebounce])

  const fetchWorkCenters = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder,
        ...(searchDebounce && { search: searchDebounce })
      })
      
      const response = await fetch(`/api/v1/work-centers?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch work centers')
      }
      
      const data = await response.json()
      setWorkCenters(data.workCenters || [])
      setTotalWorkCenters(data.pagination?.total || 0)
    } catch (error) {
      console.error('Error fetching work centers:', error)
      setError(error instanceof Error ? error.message : 'Failed to load work centers')
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load work centers'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (workCenter: WorkCenter) => {
    if (!confirm(`Are you sure you want to delete "${workCenter.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/v1/work-centers/${workCenter.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete work center')
      }

      addToast({
        type: 'success',
        title: 'Success',
        message: `Work center "${workCenter.name}" deleted successfully`
      })

      // Refresh the list
      fetchWorkCenters()
    } catch (error) {
      console.error('Error deleting work center:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete work center'
      })
    }
  }

  const columns: ServerColumn<WorkCenter>[] = useMemo(() => [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Factory className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-slate-800">{value}</div>
            {record.machine_type && (
              <div className="text-sm text-slate-600">{record.machine_type}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => (
        <div className="text-slate-800 max-w-xs truncate">
          {value || '—'}
        </div>
      ),
    },
    {
      key: 'capacity_hours_per_day',
      title: 'Daily Capacity',
      sortable: true,
      align: 'center',
      render: (value) => (
        <div className="text-slate-800">
          {value} hours/day
        </div>
      ),
    },
    {
      key: 'is_active',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? 'success' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Link href={`/dashboard/work-centers/${record.id}/edit`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleDelete(record)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  if (loading && workCenters.length === 0) {
    return <ContentSkeleton type="table" />
  }

  if (error && workCenters.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading work centers</div>
          <div className="text-slate-800 text-sm mb-4">{error}</div>
          <Button onClick={fetchWorkCenters}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Work Centers</h1>
          <p className="mt-2 text-sm text-slate-800">
            Manage your machines, stations, and production capabilities
          </p>
        </div>
        <Link href="/dashboard/work-centers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Work Center
          </Button>
        </Link>
      </div>

      {/* Work Centers Table */}
      <div className="bg-white shadow rounded-lg">
        <ServerDataTable
          data={workCenters}
          columns={columns}
          searchValue={searchTerm}
          onSearch={setSearchTerm}
          searchPlaceholder="Search work centers..."
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalWorkCenters}
          onPageChange={handlePageChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(column, order) => {
            setSortBy(column)
            setSortOrder(order)
            setCurrentPage(1)
          }}
          loading={loading}
          emptyMessage={
            <div className="text-center py-12">
              <Factory className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-2">No work centers found</h3>
              <p className="text-slate-600 mb-4">Get started by adding your first work center.</p>
              <Link href="/dashboard/work-centers/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Work Center
                </Button>
              </Link>
            </div>
          }
        />
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Factory className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-slate-800">{totalWorkCenters}</div>
              <div className="text-sm text-slate-600">Total Work Centers</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-slate-800">
                {workCenters.filter(wc => wc.is_active).length}
              </div>
              <div className="text-sm text-slate-600">Active Centers</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-slate-800">
                {workCenters.reduce((sum, wc) => sum + wc.capacity_hours_per_day, 0)}
              </div>
              <div className="text-sm text-slate-600">Total Daily Hours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Briefcase, Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Mock data for demonstration
const mockJobs = [
  {
    id: '1',
    job_number: 'JOB-00001',
    customer_name: 'Acme Corp',
    description: 'Custom machined parts',
    due_date: '2024-02-15',
    estimated_hours: 24,
    status: 'in_progress',
    assigned_to: 'John Smith'
  },
  {
    id: '2', 
    job_number: 'JOB-00002',
    customer_name: 'Tech Industries',
    description: 'Precision components',
    due_date: '2024-02-20',
    estimated_hours: 16,
    status: 'pending',
    assigned_to: 'Sarah Wilson'
  }
]

export default function SchedulerPage() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Initialize date on client side to avoid hydration mismatch
  useEffect(() => {
    setSelectedDate(new Date())
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div suppressHydrationWarning>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Scheduler</h1>
            <p className="mt-2 text-sm text-gray-700">
              Plan and track manufacturing jobs across your production floor
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-md shadow-sm">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="rounded-r-none"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <Filter className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Job
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Jobs This Week
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">12</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Available Workers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">8</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Briefcase className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Overdue Jobs
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">3</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Capacity Utilization
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">85%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {viewMode === 'calendar' ? (
            <div>
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Production Calendar</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Advanced calendar scheduling will be implemented here
                </p>
                <div className="mt-6 text-xs text-gray-400">
                  Integration planned with FullCalendar for drag-and-drop scheduling
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Scheduled Jobs
              </h3>
              <div className="space-y-4">
                {mockJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {job.job_number}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{job.customer_name}</p>
                        <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Due: {new Date(job.due_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {job.estimated_hours}h • {job.assigned_to}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
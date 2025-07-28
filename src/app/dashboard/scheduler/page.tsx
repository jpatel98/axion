'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Briefcase, Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Note: This will be replaced with actual job data from your database

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

      {/* Scheduler Coming Soon */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-16">
            <Calendar className="mx-auto h-20 w-20 text-gray-400" />
            <h3 className="mt-4 text-xl font-medium text-gray-900">Production Scheduler Coming Soon</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              Schedule and track manufacturing jobs, manage worker assignments, and optimize your production capacity.
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Job Scheduling</p>
                <p className="text-xs text-gray-400">Timeline management</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Worker Assignment</p>
                <p className="text-xs text-gray-400">Resource allocation</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Priority Management</p>
                <p className="text-xs text-gray-400">Deadline tracking</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Capacity Planning</p>
                <p className="text-xs text-gray-400">Utilization optimization</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Planned Features */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Scheduler Features in Development</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Calendar View
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Drag-and-drop job scheduling</li>
                <li>• Visual timeline management</li>
                <li>• Resource conflict detection</li>
                <li>• Multi-day job tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-500" />
                Resource Management
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Worker skill matching</li>
                <li>• Machine availability tracking</li>
                <li>• Workload balancing</li>
                <li>• Overtime optimization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                Time Management
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Estimated vs actual time tracking</li>
                <li>• Deadline monitoring</li>
                <li>• Rush job prioritization</li>
                <li>• Delivery date optimization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-purple-500" />
                Job Management
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Job status tracking</li>
                <li>• Progress monitoring</li>
                <li>• Dependency management</li>
                <li>• Quality checkpoint integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
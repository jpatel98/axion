'use client'

import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// Suppress FullCalendar font warnings by hiding the console error
if (typeof window !== 'undefined') {
  const originalError = console.error
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Glyph bbox was incorrect')) {
      return
    }
    originalError.apply(console, args)
  }
}
import { Calendar, Clock, Users, Briefcase, Plus, Filter, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContentSkeleton } from '@/components/ui/skeleton'
import { ScheduleJobModal } from '@/components/scheduler/ScheduleJobModal'

interface ScheduledOperation {
  id: string
  job_operation_id: string
  scheduled_start: string
  scheduled_end: string
  actual_start?: string
  actual_end?: string
  notes?: string
  job_operations: {
    id: string
    name: string
    estimated_hours: number
    status: string
    jobs: {
      job_number: string
      customer_name: string
      description: string
      part_number?: string
    }
  }
  work_centers: {
    name: string
    machine_type?: string
  }
  workers?: {
    name: string
  }
}

export default function SchedulerPage() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [scheduledOperations, setScheduledOperations] = useState<ScheduledOperation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchScheduledOperations()
  }, [])

  const fetchScheduledOperations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/scheduled-operations')
      
      if (!response.ok) {
        throw new Error('Failed to fetch scheduled operations')
      }
      
      const data = await response.json()
      setScheduledOperations(data.scheduledOperations || [])
    } catch (error) {
      console.error('Error fetching scheduled operations:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Convert scheduled operations to FullCalendar events
  const calendarEvents = scheduledOperations.map(operation => ({
    id: operation.id,
    title: `${operation.job_operations.jobs.job_number} - ${operation.job_operations.name}`,
    start: operation.scheduled_start,
    end: operation.scheduled_end,
    backgroundColor: getStatusColor(operation.job_operations.status).bg,
    borderColor: getStatusColor(operation.job_operations.status).border,
    textColor: getStatusColor(operation.job_operations.status).text,
    extendedProps: {
      operation,
      customer: operation.job_operations.jobs.customer_name,
      workCenter: operation.work_centers.name,
      worker: operation.workers?.name,
      status: operation.job_operations.status
    }
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': 
        return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' }
      case 'scheduled':
        return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }
      case 'in_progress': 
        return { bg: '#dcfce7', border: '#10b981', text: '#065f46' }
      case 'completed': 
        return { bg: '#f3e8ff', border: '#8b5cf6', text: '#5b21b6' }
      default: 
        return { bg: '#f3f4f6', border: '#6b7280', text: '#374151' }
    }
  }

  const handleEventClick = (info: any) => {
    const operation = info.event.extendedProps.operation
    alert(`Job: ${operation.job_operations.jobs.job_number}\nOperation: ${operation.job_operations.name}\nWork Center: ${operation.work_centers.name}\nWorker: ${operation.workers?.name || 'Unassigned'}`)
  }

  const handleDateSelect = (info: any) => {
    setSelectedDate(info.start)
    setShowScheduleModal(true)
    info.view.calendar.unselect()
  }

  const handleScheduleJob = () => {
    setSelectedDate(new Date())
    setShowScheduleModal(true)
  }

  const handleJobScheduled = () => {
    fetchScheduledOperations()
  }

  if (loading) {
    return <ContentSkeleton type="dashboard" />
  }

  return (
    <div suppressHydrationWarning>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Scheduler</h1>
            <p className="mt-2 text-sm text-gray-900">
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
            <Button onClick={handleScheduleJob}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Job
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Setup
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchScheduledOperations}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {viewMode === 'calendar' ? (
        <div className="bg-white shadow rounded-lg p-6">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            selectable={true}
            select={handleDateSelect}
            height="600px"
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
              startTime: '08:00',
              endTime: '17:00'
            }}
            weekends={false}
            eventContent={(eventInfo) => (
              <div className="p-1 text-xs">
                <div className="font-medium truncate">{eventInfo.event.title}</div>
                <div className="text-xs opacity-75 truncate">
                  {eventInfo.event.extendedProps.customer}
                </div>
                <div className="text-xs opacity-75 truncate">
                  {eventInfo.event.extendedProps.workCenter}
                </div>
              </div>
            )}
          />
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {scheduledOperations.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="mx-auto h-20 w-20 text-gray-900" />
                <h3 className="mt-4 text-xl font-medium text-gray-900">No Scheduled Operations</h3>
                <p className="mt-2 text-sm text-gray-900">
                  Start scheduling jobs to see them appear here.
                </p>
                <Button className="mt-4" onClick={handleScheduleJob}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule First Job
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledOperations.map((operation) => (
                  <div key={operation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {operation.job_operations.jobs.job_number}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            operation.job_operations.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            operation.job_operations.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            operation.job_operations.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {operation.job_operations.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mb-1">
                          {operation.job_operations.name}
                        </p>
                        <p className="text-sm text-gray-900">
                          Customer: {operation.job_operations.jobs.customer_name}
                        </p>
                        <p className="text-sm text-gray-900">
                          Work Center: {operation.work_centers.name}
                        </p>
                        {operation.workers && (
                          <p className="text-sm text-gray-900">
                            Worker: {operation.workers.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-900">
                        <div>{new Date(operation.scheduled_start).toLocaleDateString()}</div>
                        <div>
                          {new Date(operation.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(operation.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Job Modal */}
      <ScheduleJobModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onScheduled={handleJobScheduled}
        selectedDate={selectedDate || undefined}
      />
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import '@/styles/fullcalendar-custom.css'

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
import { Calendar, Clock, Users, Briefcase, Plus, Filter, Settings, Factory, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContentSkeleton } from '@/components/ui/skeleton'
import { ScheduleJobModal } from '@/components/scheduler/ScheduleJobModal'
import { EventDetailsModal } from '@/components/scheduler/EventDetailsModal'

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
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState<ScheduledOperation | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    fetchScheduledOperations()
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const fetchScheduledOperations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/scheduled-operations')
      
      if (!response.ok) {
        throw new Error('Failed to fetch scheduled operations')
      }
      
      const data = await response.json()
      console.log('Scheduled operations data:', data)
      setScheduledOperations(data.scheduledOperations || [])
    } catch (error) {
      console.error('Error fetching scheduled operations:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

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

  // Convert scheduled operations to FullCalendar events
  const calendarEvents = scheduledOperations
    .filter(operation => 
      operation && 
      operation.job_operations && 
      operation.job_operations.jobs && 
      operation.work_centers
    )
    .map(operation => {
      const startTime = new Date(operation.scheduled_start)
      const endTime = new Date(operation.scheduled_end)
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      
      // Use shorter titles for events shorter than 1 hour
      const jobNumber = operation.job_operations.jobs.job_number || 'Unknown'
      const operationName = operation.job_operations.name || 'Unknown Operation'
      
      let title
      if (durationHours < 1) {
        // Very short format for events under 1 hour: "J001-Setup"
        title = `${jobNumber}-${operationName.substring(0, 8)}`
      } else if (durationHours < 2) {
        // Short format for events under 2 hours: "J001 - Setup"  
        title = `${jobNumber} - ${operationName.substring(0, 10)}`
      } else {
        // Full format for longer events
        title = `${jobNumber} - ${operationName}`
      }
      
      return {
        id: operation.id,
        title,
        start: operation.scheduled_start,
        end: operation.scheduled_end,
        backgroundColor: getStatusColor(operation.job_operations.status).bg,
        borderColor: getStatusColor(operation.job_operations.status).border,
        textColor: getStatusColor(operation.job_operations.status).text,
        extendedProps: {
          operation,
          customer: operation.job_operations.jobs.customer_name || 'Unknown Customer',
          workCenter: operation.work_centers.name || 'Unknown Work Center',
          worker: operation.workers?.name || 'Unassigned',
          status: operation.job_operations.status || 'unknown',
          duration: `${durationHours}h`
        }
      }
    })

  const handleEventClick = (info: any) => {
    const operation = info.event.extendedProps.operation
    setSelectedOperation(operation)
    setShowEventModal(true)
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
      <div className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Production Scheduler</h1>
            <p className="mt-2 text-sm text-slate-800">
              Plan and track manufacturing jobs across your production floor
            </p>
          </div>
          
          {/* Desktop Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:gap-3">
            {/* Hide calendar/list toggle on mobile since we show cards automatically */}
            <div className="hidden sm:flex rounded-md shadow-sm">
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
            
            <div className="flex gap-2">
              <Button 
                onClick={handleScheduleJob}
                className="flex-1 sm:flex-none min-h-[40px] sm:min-h-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Schedule Job</span>
                <span className="sm:hidden">Schedule</span>
              </Button>
              
              <Button 
                variant="outline"
                className="flex-1 sm:flex-none min-h-[40px] sm:min-h-0"
              >
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Setup</span>
              </Button>
            </div>
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
        <>
          {/* Mobile Card View - Show cards instead of calendar */}
          <div className="block md:hidden">
            {scheduledOperations.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-20 w-20 text-slate-400" />
                <h3 className="mt-4 text-xl font-medium text-slate-800">No Scheduled Operations</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Start scheduling jobs to see them appear here.
                </p>
                <Button className="mt-4" onClick={handleScheduleJob}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule First Job
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Group operations by date */}
                {Object.entries(
                  scheduledOperations.reduce((groups, operation) => {
                    const date = new Date(operation.scheduled_start).toDateString()
                    if (!groups[date]) groups[date] = []
                    groups[date].push(operation)
                    return groups
                  }, {} as Record<string, typeof scheduledOperations>)
                ).map(([date, operations]) => (
                  <div key={date} className="space-y-3">
                    <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200 z-10">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        <span className="text-sm text-slate-500 font-normal">
                          ({operations.length} operation{operations.length !== 1 ? 's' : ''})
                        </span>
                      </h3>
                    </div>
                    
                    {operations
                      .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime())
                      .map((operation) => (
                      <div
                        key={operation.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 active:bg-gray-50 cursor-pointer mx-4"
                        onClick={() => {
                          setSelectedOperation(operation)
                          setShowEventModal(true)
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-base text-slate-800">
                                {operation.job_operations.jobs.job_number}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                operation.job_operations.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                operation.job_operations.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                operation.job_operations.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {operation.job_operations.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-slate-800 font-medium mb-2">
                              {operation.job_operations.name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{operation.job_operations.jobs.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Factory className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{operation.work_centers.name}</span>
                          </div>
                          {operation.workers && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{operation.workers.name}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="border-t pt-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-slate-600">
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(operation.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                {new Date(operation.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              {((new Date(operation.scheduled_end).getTime() - new Date(operation.scheduled_start).getTime()) / (1000 * 60 * 60)).toFixed(1)}h
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Calendar View */}
          <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next',
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
                  <div className="p-1 text-xs overflow-hidden">
                    <div className="font-medium truncate">
                      {eventInfo.event.title}
                    </div>
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
          </div>
        </>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {scheduledOperations.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="mx-auto h-20 w-20 text-slate-800" />
                <h3 className="mt-4 text-xl font-medium text-slate-800">No Scheduled Operations</h3>
                <p className="mt-2 text-sm text-slate-800">
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
                  <div 
                    key={operation.id} 
                    className="border rounded-lg p-4 hover:bg-slate-50 active:bg-slate-100 cursor-pointer"
                    onClick={() => {
                      setSelectedOperation(operation)
                      setShowEventModal(true)
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-base">
                            {operation.job_operations.jobs.job_number}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            operation.job_operations.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            operation.job_operations.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            operation.job_operations.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {operation.job_operations.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 font-medium mb-2">
                          {operation.job_operations.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{operation.job_operations.jobs.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Factory className="h-4 w-4" />
                        <span>{operation.work_centers.name}</span>
                      </div>
                      {operation.workers && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{operation.workers.name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(operation.scheduled_start).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(operation.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(operation.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
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

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        operation={selectedOperation}
      />
    </div>
  )
}
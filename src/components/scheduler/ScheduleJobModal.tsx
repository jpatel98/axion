'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, User, Settings } from 'lucide-react'

interface Job {
  id: string
  job_number: string
  customer_name: string
  description: string
}

interface WorkCenter {
  id: string
  name: string
  machine_type: string
}

interface Worker {
  id: string
  name: string
}

interface ScheduleJobModalProps {
  isOpen: boolean
  onClose: () => void
  onScheduled: () => void
  selectedDate?: Date
}

export function ScheduleJobModal({ isOpen, onClose, onScheduled, selectedDate }: ScheduleJobModalProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    jobId: '',
    operationName: '',
    workCenterId: '',
    workerId: '',
    estimatedHours: '',
    scheduledDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    startTime: '08:00',
    notes: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchData()
      if (selectedDate) {
        setFormData(prev => ({ 
          ...prev, 
          scheduledDate: selectedDate.toISOString().split('T')[0] 
        }))
      }
    }
  }, [isOpen, selectedDate])

  const fetchData = async () => {
    try {
      const [jobsRes, workCentersRes, workersRes] = await Promise.all([
        fetch('/api/v1/jobs'),
        fetch('/api/v1/work-centers'),
        fetch('/api/v1/workers')
      ])

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        setJobs(jobsData.jobs || [])
      }

      if (workCentersRes.ok) {
        const workCentersData = await workCentersRes.json()
        setWorkCenters(workCentersData.workCenters || [])
      }

      if (workersRes.ok) {
        const workersData = await workersRes.json()
        setWorkers(workersData.workers || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Form data:', formData)
      
      // Validation
      if (!formData.jobId) {
        throw new Error('Please select a job')
      }
      if (!formData.workCenterId) {
        throw new Error('Please select a work center')
      }
      if (!formData.operationName.trim()) {
        throw new Error('Please enter an operation name')
      }
      if (!formData.estimatedHours || parseFloat(formData.estimatedHours) <= 0) {
        throw new Error('Please enter valid estimated hours')
      }

      // First, get the next operation number for this job
      const existingOpsResponse = await fetch(`/api/v1/job-operations?job_id=${formData.jobId}`)
      const existingOps = existingOpsResponse.ok ? await existingOpsResponse.json() : { jobOperations: [] }
      const nextOperationNumber = (existingOps.jobOperations?.length || 0) + 1

      // Create a job operation
      const jobOperationPayload = {
        job_id: formData.jobId,
        operation_number: nextOperationNumber,
        name: formData.operationName,
        estimated_hours: parseFloat(formData.estimatedHours),
        work_center_id: formData.workCenterId
      }
      
      console.log('Creating job operation:', jobOperationPayload)

      const jobOperationResponse = await fetch('/api/v1/job-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobOperationPayload)
      })

      if (!jobOperationResponse.ok) {
        const errorData = await jobOperationResponse.json()
        console.error('Job operation error:', errorData)
        throw new Error(errorData.error || 'Failed to create job operation')
      }

      const { jobOperation } = await jobOperationResponse.json()

      // Then, schedule the operation
      const scheduledStart = new Date(`${formData.scheduledDate}T${formData.startTime}:00`)
      const scheduledEnd = new Date(scheduledStart.getTime() + (parseFloat(formData.estimatedHours) * 60 * 60 * 1000))

      const scheduleResponse = await fetch('/api/v1/scheduled-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_operation_id: jobOperation.id,
          work_center_id: formData.workCenterId,
          worker_id: formData.workerId || null,
          scheduled_start: scheduledStart.toISOString(),
          scheduled_end: scheduledEnd.toISOString(),
          notes: formData.notes
        })
      })

      if (!scheduleResponse.ok) {
        const errorData = await scheduleResponse.json()
        throw new Error(errorData.error || 'Failed to schedule operation')
      }

      onScheduled()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error scheduling job:', error)
      alert(error instanceof Error ? error.message : 'Failed to schedule job')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      jobId: '',
      operationName: '',
      workCenterId: '',
      workerId: '',
      estimatedHours: '',
      scheduledDate: '',
      startTime: '08:00',
      notes: ''
    })
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Schedule Job Operation" size="lg">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job and Work Center Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="jobId" className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <Calendar className="h-4 w-4 text-slate-800" />
                Job
              </Label>
              <select
                id="jobId"
                value={formData.jobId}
                onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-300 bg-white shadow-sm text-slate-800 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none"
                required
              >
                <option value="">Select a job...</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.job_number} - {job.customer_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workCenterId" className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <Settings className="h-4 w-4 text-slate-800" />
                Work Center
              </Label>
              <select
                id="workCenterId"
                value={formData.workCenterId}
                onChange={(e) => setFormData({ ...formData, workCenterId: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-300 bg-white shadow-sm text-slate-800 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none"
                required
              >
                <option value="">Select work center...</option>
                {workCenters.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name} ({center.machine_type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Operation Name */}
          <div className="space-y-2">
            <Label htmlFor="operationName" className="text-sm font-medium text-slate-800">
              Operation Name
            </Label>
            <Input
              id="operationName"
              value={formData.operationName}
              onChange={(e) => setFormData({ ...formData, operationName: e.target.value })}
              placeholder="e.g., Rough machining, Setup, Finishing"
              className="h-10 border border-slate-300 bg-white shadow-sm"
              required
            />
          </div>

          {/* Timing Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="mb-2">
                <Label htmlFor="estimatedHours" className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Clock className="h-4 w-4 text-slate-800" />
                  Estimated Hours
                </Label>
              </div>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                min="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="4.0"
                className="h-9 leading-none flex items-center text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [appearance:textfield]"
                required
              />
            </div>

            <div>
              <div className="mb-2">
                <Label htmlFor="scheduledDate" className="text-sm font-medium text-slate-800 block">
                  Scheduled Date
                </Label>
              </div>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="h-9 leading-none flex items-center text-sm"
                required
              />
            </div>

            <div>
              <div className="mb-2">
                <Label htmlFor="startTime" className="text-sm font-medium text-slate-800 block">
                  Start Time
                </Label>
              </div>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="h-9 leading-none flex items-center text-sm"
                required
              />
            </div>
          </div>

          {/* Worker Assignment */}
          <div className="space-y-2">
            <Label htmlFor="workerId" className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <User className="h-4 w-4 text-slate-800" />
              Worker Assignment (Optional)
            </Label>
            <select
              id="workerId"
              value={formData.workerId}
              onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
              className="w-full h-10 rounded-md border border-slate-300 bg-white shadow-sm text-slate-800 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none"
            >
              <option value="">Assign later...</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-slate-800">
              Notes & Instructions
            </Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-slate-300 bg-white shadow-sm text-slate-800 px-3 py-2 text-sm placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none resize-none"
              placeholder="Any special instructions, setup requirements, or notes for this operation..."
            />
          </div>

          {/* Warning for missing work centers */}
          {workCenters.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Settings className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Work Centers Required
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    No work centers found. You need to set up work centers first to schedule operations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleClose} className="px-4 py-2">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || workCenters.length === 0}
              className="px-6 py-2"
            >
              {loading ? 'Scheduling...' : 'Schedule Operation'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
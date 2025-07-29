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
      // First, create a job operation
      const jobOperationResponse = await fetch('/api/v1/job-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: formData.jobId,
          operation_number: 1, // For now, just use 1
          name: formData.operationName,
          estimated_hours: parseFloat(formData.estimatedHours),
          work_center_id: formData.workCenterId
        })
      })

      if (!jobOperationResponse.ok) {
        throw new Error('Failed to create job operation')
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Job Selection */}
          <div>
            <Label htmlFor="jobId" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Job
            </Label>
            <select
              id="jobId"
              value={formData.jobId}
              onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

          {/* Work Center Selection */}
          <div>
            <Label htmlFor="workCenterId" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Work Center
            </Label>
            <select
              id="workCenterId"
              value={formData.workCenterId}
              onChange={(e) => setFormData({ ...formData, workCenterId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
        <div>
          <Label htmlFor="operationName">Operation Name</Label>
          <Input
            id="operationName"
            value={formData.operationName}
            onChange={(e) => setFormData({ ...formData, operationName: e.target.value })}
            placeholder="e.g., Rough machining, Setup, Finishing"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Estimated Hours */}
          <div>
            <Label htmlFor="estimatedHours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Est. Hours
            </Label>
            <Input
              id="estimatedHours"
              type="number"
              step="0.5"
              min="0.5"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
              placeholder="4.0"
              required
            />
          </div>

          {/* Scheduled Date */}
          <div>
            <Label htmlFor="scheduledDate">Date</Label>
            <Input
              id="scheduledDate"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
            />
          </div>

          {/* Start Time */}
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Worker Selection */}
        <div>
          <Label htmlFor="workerId" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Worker (Optional)
          </Label>
          <select
            id="workerId"
            value={formData.workerId}
            onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
        <div>
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Any special instructions or notes..."
          />
        </div>

        {/* Warning for missing work centers */}
        {workCenters.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800 text-sm">
              No work centers found. You need to set up work centers first to schedule operations.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || workCenters.length === 0}
          >
            {loading ? 'Scheduling...' : 'Schedule Operation'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
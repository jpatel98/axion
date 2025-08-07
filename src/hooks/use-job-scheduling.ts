import { useState } from 'react'
import { useFeatureFlag } from '@/lib/feature-flags'

interface ScheduledOperation {
  id: string
  job_id: string
  operation_id: string
  work_center_id: string
  scheduled_start: string
  scheduled_end: string
  estimated_duration: number
  status: string
  notes?: string
  job_operations: {
    name: string
    operation_number: number
  }
  work_centers: {
    name: string
    max_capacity: number
  }
}

interface SchedulingSuggestion {
  confidenceScore: number
  conflictWarnings: Array<{
    type: string
    severity: string
    message: string
    affectedOperations: string[]
    suggestedResolution?: string
  }>
  optimizationNotes: string[]
}

interface UseJobSchedulingReturn {
  schedule: ScheduledOperation[]
  suggestion: SchedulingSuggestion | null
  isLoading: boolean
  error: string | null
  hasSchedule: boolean
  isSchedulingEnabled: boolean
  createSchedule: (jobId: string, options?: SchedulingOptions) => Promise<void>
  getSchedule: (jobId: string) => Promise<void>
  removeSchedule: (jobId: string) => Promise<void>
}

interface SchedulingOptions {
  forceReschedule?: boolean
  priorityLevel?: number
  preferredStartDate?: string
}

export function useJobScheduling(): UseJobSchedulingReturn {
  const [schedule, setSchedule] = useState<ScheduledOperation[]>([])
  const [suggestion, setSuggestion] = useState<SchedulingSuggestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSchedule, setHasSchedule] = useState(false)

  const { isEnabled: isSchedulingEnabled } = useFeatureFlag('SMART_SCHEDULING_SUGGESTIONS')

  const createSchedule = async (jobId: string, options: SchedulingOptions = {}) => {
    if (!isSchedulingEnabled) {
      setError('Smart scheduling feature is not enabled')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/jobs/${jobId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create schedule')
      }

      const data = await response.json()
      setSchedule(data.schedule || [])
      setSuggestion(data.suggestion || null)
      setHasSchedule(data.schedule && data.schedule.length > 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error creating schedule:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getSchedule = async (jobId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/jobs/${jobId}/schedule`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch schedule')
      }

      const data = await response.json()
      setSchedule(data.schedule || [])
      setHasSchedule(data.hasSchedule || false)
      setSuggestion(null) // Clear previous suggestions when just fetching
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching schedule:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const removeSchedule = async (jobId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/jobs/${jobId}/schedule`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove schedule')
      }

      setSchedule([])
      setSuggestion(null)
      setHasSchedule(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error removing schedule:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    schedule,
    suggestion,
    isLoading,
    error,
    hasSchedule,
    isSchedulingEnabled,
    createSchedule,
    getSchedule,
    removeSchedule,
  }
}
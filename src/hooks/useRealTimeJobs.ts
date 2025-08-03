'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useUserRole } from './useUserRole'
import { createClient } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

interface Job {
  id: string
  job_number: string
  customer_name: string
  part_number: string
  description: string
  quantity: number
  status: string
  due_date: string
  tenant_id: string
  created_at: string
  updated_at: string
}

export function useRealTimeJobs() {
  const { user } = useUserRole()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  const fetchJobs = useCallback(async () => {
    if (!user?.tenant_id) return

    try {
      const response = await fetch('/api/v1/jobs')
      if (response.ok) {
        const data = await response.json()
        const allJobs = data.jobs || []
        setJobs(allJobs)
      }
    } catch (error) {
      logger.error('Error fetching jobs', {
        userId: user?.id,
        tenantId: user?.tenant_id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'real-time-jobs-hook'
      })
    } finally {
      setLoading(false)
    }
  }, [user?.tenant_id])

  const handleJobInsert = useCallback((payload: any) => {
    const newJob = payload.new as Job
    
    // Only update jobs in the same tenant
    if (user?.tenant_id === newJob.tenant_id) {
      setJobs(prevJobs => [newJob, ...prevJobs])
    }
  }, [user?.tenant_id])

  const handleJobUpdate = useCallback((payload: any) => {
    const updatedJob = payload.new as Job
    
    // Only update jobs in the same tenant
    if (user?.tenant_id === updatedJob.tenant_id) {
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === updatedJob.id ? updatedJob : job
        )
      )
    }
  }, [user?.tenant_id])

  const handleJobDelete = useCallback((payload: any) => {
    const deletedJob = payload.old as Job
    
    // Only remove jobs from the same tenant
    if (user?.tenant_id === deletedJob.tenant_id) {
      setJobs(prevJobs => 
        prevJobs.filter(job => job.id !== deletedJob.id)
      )
    }
  }, [user?.tenant_id])

  useEffect(() => {
    if (user?.tenant_id) {
      // Fetch initial data
      fetchJobs()
      
      // Set up real-time subscription
      const channel = supabase
        .channel('realtime-jobs')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'jobs',
            filter: `tenant_id=eq.${user.tenant_id}`
          },
          handleJobInsert
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'jobs',
            filter: `tenant_id=eq.${user.tenant_id}`
          },
          handleJobUpdate
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'jobs',
            filter: `tenant_id=eq.${user.tenant_id}`
          },
          handleJobDelete
        )
        .subscribe()

      channelRef.current = channel

      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current)
          channelRef.current = null
        }
      }
    }
  }, [user?.tenant_id, fetchJobs, handleJobInsert, handleJobUpdate, handleJobDelete])

  return {
    jobs,
    loading,
    refetch: fetchJobs
  }
}
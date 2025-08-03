'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useUserRole } from './useUserRole'
import { UserRole } from '@/lib/types/roles'
import { createClient } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Job {
  id: string
  job_number: string
  customer_name: string
  description: string
  created_at: string
  status: string
  tenant_id: string
}

export function useJobNotifications() {
  const { user } = useUserRole()
  const [newJobs, setNewJobs] = useState<Job[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  const clearNewJobs = useCallback(() => {
    setNewJobs([])
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  const handleNewJob = useCallback((payload: any) => {
    const newJob = payload.new as Job
    
    // Only notify operators about jobs in their tenant
    if (user?.tenant_id !== newJob.tenant_id) return
    
    // Only show notifications for pending/in_progress jobs
    if (newJob.status === 'pending' || newJob.status === 'in_progress') {
      setNewJobs(prev => [newJob, ...prev])
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('New Production Job Assigned!', {
          body: `Job ${newJob.job_number} - ${newJob.description || 'No description'}`,
          icon: '/favicon.svg'
        })
      }
    }
  }, [user?.tenant_id])

  useEffect(() => {
    if (user?.role === UserRole.OPERATOR && user?.tenant_id) {
      // Request notification permission
      requestNotificationPermission()
      
      // Set up real-time subscription to jobs table
      const channel = supabase
        .channel('jobs-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'jobs',
            filter: `tenant_id=eq.${user.tenant_id}`
          },
          handleNewJob
        )
        .subscribe()

      channelRef.current = channel
      setIsInitialized(true)

      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current)
          channelRef.current = null
        }
      }
    }
  }, [user, handleNewJob, requestNotificationPermission])

  return {
    newJobs,
    clearNewJobs,
    hasNewJobs: newJobs.length > 0
  }
}
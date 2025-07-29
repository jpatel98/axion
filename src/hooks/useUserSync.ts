'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export function useUserSync() {
  const { user, isLoaded } = useUser()
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle')

  useEffect(() => {
    if (isLoaded && user && syncStatus === 'idle') {
      setSyncStatus('syncing')
      
      // Sync user with our database
      fetch('/api/auth/sync-user', {
        method: 'POST',
      })
      .then(response => response.json())
      .then(data => {
        console.log('User sync result:', data)
        setSyncStatus('synced')
      })
      .catch(error => {
        console.error('User sync failed:', error)
        setSyncStatus('error')
        // Retry once after 2 seconds
        setTimeout(() => {
          setSyncStatus('idle')
        }, 2000)
      })
    }
  }, [isLoaded, user, syncStatus])

  return { user, isLoaded, syncStatus }
}
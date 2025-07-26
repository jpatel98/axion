'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

export function useUserSync() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && user) {
      // Sync user with our database
      fetch('/api/auth/sync-user', {
        method: 'POST',
      }).catch(console.error)
    }
  }, [isLoaded, user])

  return { user, isLoaded }
}
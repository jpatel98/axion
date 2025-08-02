'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole, hasPermission, hasAnyPermission, RolePermissions } from '@/lib/types/roles'

interface UserWithRole {
  id: string
  email: string
  name?: string
  role: UserRole
}

export function useUserRole() {
  const { user: clerkUser, isLoaded } = useUser()
  const [userData, setUserData] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchUserRole() {
      if (!isLoaded) return
      
      if (!clerkUser) {
        setUserData(null)
        setLoading(false)
        return
      }

      try {
        // Fetch user role from your API
        const response = await fetch('/api/auth/user-role')
        
        if (response.status === 404) {
          // User needs sync - trigger sync and check if they need onboarding
          const syncResponse = await fetch('/api/auth/sync-user', {
            method: 'POST',
          })
          
          if (syncResponse.ok) {
            const syncData = await syncResponse.json()
            
            if (syncData.status === 'needs_onboarding') {
              // User needs to complete onboarding flow
              setNeedsOnboarding(true)
              setLoading(false)
              router.push('/onboarding')
              return
            }
            
            // User was created/synced, retry fetching role
            const retryResponse = await fetch('/api/auth/user-role')
            if (retryResponse.ok) {
              const retryData = await retryResponse.json()
              
              // Validate that we got a valid role
              if (retryData.role && Object.values(UserRole).includes(retryData.role as UserRole)) {
                setUserData({
                  id: clerkUser.id,
                  email: clerkUser.emailAddresses[0]?.emailAddress || '',
                  name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                  role: retryData.role as UserRole
                })
                setError(null)
                return
              } else {
                console.error('Invalid role received after sync:', retryData)
                throw new Error('Invalid role received after sync')
              }
            }
          }
          
          throw new Error('Failed to sync user')
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch user role')
        }
        
        const data = await response.json()
        
        // Validate that we got a valid role
        if (data.role && Object.values(UserRole).includes(data.role as UserRole)) {
          setUserData({
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            role: data.role as UserRole
          })
          setError(null)
        } else {
          console.error('Invalid role received:', data)
          throw new Error('Invalid role received from server')
        }
      } catch (err) {
        console.error('Error fetching user role:', err)
        setError('Failed to load user role')
        setUserData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [clerkUser, isLoaded])

  return {
    user: userData,
    loading,
    error,
    needsOnboarding,
    isAuthenticated: !!clerkUser && !!userData,
  }
}
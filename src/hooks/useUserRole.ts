'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
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
        if (!response.ok) {
          throw new Error('Failed to fetch user role')
        }
        
        const data = await response.json()
        setUserData({
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          role: data.role as UserRole
        })
        setError(null)
      } catch (err) {
        console.error('Error fetching user role:', err)
        setError('Failed to load user role')
        // Default to operator role on error
        setUserData({
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          role: UserRole.OPERATOR
        })
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
    isAuthenticated: !!clerkUser && !!userData,
  }
}
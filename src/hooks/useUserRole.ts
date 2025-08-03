'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole, hasPermission, hasAnyPermission, RolePermissions } from '@/lib/types/roles'
import { logger } from '@/lib/logger'

// In-memory cache for user roles
const userRoleCache = new Map<string, {
  data: UserWithRole
  timestamp: number
  expires: number
}>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const STORAGE_KEY = 'axion_user_role_cache'

// Helper functions for caching
const getCachedUserRole = (userId: string): UserWithRole | null => {
  // Check in-memory cache first
  const cached = userRoleCache.get(userId)
  if (cached && Date.now() < cached.expires) {
    return cached.data
  }

  // Check localStorage cache
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Date.now() < parsed.expires) {
        // Refresh in-memory cache
        userRoleCache.set(userId, parsed)
        return parsed.data
      }
    }
  } catch (error) {
    // Ignore localStorage errors
  }

  return null
}

const setCachedUserRole = (userId: string, userData: UserWithRole): void => {
  const cacheEntry = {
    data: userData,
    timestamp: Date.now(),
    expires: Date.now() + CACHE_DURATION
  }

  // Set in-memory cache
  userRoleCache.set(userId, cacheEntry)

  // Set localStorage cache
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(cacheEntry))
  } catch (error) {
    // Ignore localStorage errors (e.g., quota exceeded)
  }
}

const clearCachedUserRole = (userId: string): void => {
  userRoleCache.delete(userId)
  try {
    localStorage.removeItem(`${STORAGE_KEY}_${userId}`)
  } catch (error) {
    // Ignore localStorage errors
  }
}

export interface UserWithRole {
  id: string
  email: string
  name?: string
  role: UserRole
  tenant_id: string
}

export function useUserRole() {
  const { user: clerkUser, isLoaded } = useUser()
  const [userData, setUserData] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const router = useRouter()
  const isInitialLoad = useRef(true)

  // Try to load from cache immediately when Clerk user is available
  useEffect(() => {
    if (clerkUser && isInitialLoad.current) {
      const cachedData = getCachedUserRole(clerkUser.id)
      if (cachedData) {
        setUserData(cachedData)
        setLoading(false)
        setError(null)
        isInitialLoad.current = false
        return
      }
    }
  }, [clerkUser])

  useEffect(() => {
    async function fetchUserRole() {
      if (!isLoaded) return
      
      if (!clerkUser) {
        setUserData(null)
        setLoading(false)
        return
      }

      // If we already have cached data and this isn't a refresh, skip API call
      if (userData && !isInitialLoad.current) {
        setLoading(false)
        return
      }

      // Check cache again before making API call
      const cachedData = getCachedUserRole(clerkUser.id)
      if (cachedData && !isInitialLoad.current) {
        setUserData(cachedData)
        setLoading(false)
        setError(null)
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
                const userWithRole: UserWithRole = {
                  id: clerkUser.id,
                  email: clerkUser.emailAddresses[0]?.emailAddress || '',
                  name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                  role: retryData.role as UserRole,
                  tenant_id: retryData.tenant_id
                }
                
                // Cache the user role data
                setCachedUserRole(clerkUser.id, userWithRole)
                setUserData(userWithRole)
                setError(null)
                return
              } else {
                logger.error('Invalid role received after sync', { 
                  userId: clerkUser.id,
                  receivedData: retryData,
                  context: 'user-role-hook'
                })
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
          const userWithRole: UserWithRole = {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            role: data.role as UserRole,
            tenant_id: data.tenant_id
          }
          
          // Cache the user role data
          setCachedUserRole(clerkUser.id, userWithRole)
          setUserData(userWithRole)
          setError(null)
        } else {
          logger.error('Invalid role received', { 
            userId: clerkUser.id,
            receivedData: data,
            context: 'user-role-hook'
          })
          throw new Error('Invalid role received from server')
        }
      } catch (err) {
        logger.error('Error fetching user role', { 
          userId: clerkUser?.id,
          error: err instanceof Error ? err.message : 'Unknown error',
          context: 'user-role-hook'
        })
        
        // Clear cache on error
        if (clerkUser) {
          clearCachedUserRole(clerkUser.id)
        }
        
        setError('Failed to load user role')
        setUserData(null)
      } finally {
        setLoading(false)
        isInitialLoad.current = false
      }
    }

    fetchUserRole()
  }, [clerkUser, isLoaded, router, userData])

  // Refresh function to invalidate cache and refetch
  const refresh = useCallback(() => {
    if (clerkUser) {
      clearCachedUserRole(clerkUser.id)
      setUserData(null)
      setLoading(true)
      setError(null)
      isInitialLoad.current = true
    }
  }, [clerkUser])

  return {
    user: userData,
    loading,
    error,
    needsOnboarding,
    isAuthenticated: !!clerkUser && !!userData,
    refresh,
  }
}
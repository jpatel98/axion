import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { UserRole, hasPermission, RolePermissions } from '@/lib/types/roles'

interface UserWithRole {
  id: string
  clerk_user_id: string
  email: string
  role: UserRole
  tenant_id: string
}

export async function getCurrentUser(): Promise<UserWithRole | null> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return null
    }

    // Get user role from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (error || !user) {
      console.error('Error fetching user:', error)
      return null
    }

    return user as UserWithRole
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}

export async function requireAuth(): Promise<UserWithRole> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

export async function requirePermission(permission: keyof RolePermissions): Promise<UserWithRole> {
  const user = await requireAuth()
  
  if (!hasPermission(user.role, permission)) {
    throw new Error('Insufficient permissions')
  }
  
  return user
}

export async function requireRole(requiredRole: UserRole): Promise<UserWithRole> {
  const user = await requireAuth()
  
  if (user.role !== requiredRole) {
    throw new Error('Insufficient role')
  }
  
  return user
}

export async function requireManagerRole(): Promise<UserWithRole> {
  return requireRole(UserRole.MANAGER)
}

export function withAuth<T extends any[]>(
  handler: (user: UserWithRole, ...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const user = await requireAuth()
      return await handler(user, ...args)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      return NextResponse.json(
        { error: message }, 
        { status: message === 'Unauthorized' ? 401 : 403 }
      )
    }
  }
}

export function withPermission<T extends any[]>(
  permission: keyof RolePermissions,
  handler: (user: UserWithRole, ...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const user = await requirePermission(permission)
      return await handler(user, ...args)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Permission denied'
      return NextResponse.json(
        { error: message }, 
        { status: message === 'Unauthorized' ? 401 : 403 }
      )
    }
  }
}

export function withManagerRole<T extends any[]>(
  handler: (user: UserWithRole, ...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const user = await requireManagerRole()
      return await handler(user, ...args)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Manager access required'
      return NextResponse.json(
        { error: message }, 
        { status: message === 'Unauthorized' ? 401 : 403 }
      )
    }
  }
}
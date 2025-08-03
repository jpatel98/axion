import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { UserRole } from '@/lib/types/roles'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      logger.warn('No userId found in auth', { method: 'GET', url: '/api/auth/user-role' })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.debug('Fetching user role for userId', { userId, method: 'GET', url: '/api/auth/user-role' })

    // Get user role from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('role, email, tenant_id')
      .eq('clerk_user_id', userId)
      .single()

    if (error) {
      logger.error('Error fetching user role', { 
        userId,
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        method: 'GET',
        url: '/api/auth/user-role'
      })
      
      // If user not found, trigger sync and return error to force re-sync
      return NextResponse.json({ 
        error: 'User not synced', 
        needsSync: true,
        details: error.message 
      }, { status: 404 })
    }

    logger.debug('Found user', { userId, userEmail: user.email, tenantId: user.tenant_id })

    // Validate role and default to operator if invalid
    const role = Object.values(UserRole).includes(user.role as UserRole) 
      ? user.role 
      : UserRole.OPERATOR

    logger.debug('Returning role', { userId, role, tenantId: user.tenant_id })
    return NextResponse.json({ role, tenant_id: user.tenant_id })
  } catch (error) {
    logger.error('User role API error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'GET',
      url: '/api/auth/user-role'
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
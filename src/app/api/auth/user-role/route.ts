import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { UserRole } from '@/lib/types/roles'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      console.log('No userId found in auth')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Fetching user role for userId:', userId)

    // Get user role from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('role, email')
      .eq('clerk_user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
      console.log('Error details:', { code: error.code, message: error.message, details: error.details })
      
      // If user not found, trigger sync and return error to force re-sync
      return NextResponse.json({ 
        error: 'User not synced', 
        needsSync: true,
        details: error.message 
      }, { status: 404 })
    }

    console.log('Found user:', user)

    // Validate role and default to operator if invalid
    const role = Object.values(UserRole).includes(user.role as UserRole) 
      ? user.role 
      : UserRole.OPERATOR

    console.log('Returning role:', role)
    return NextResponse.json({ role })
  } catch (error) {
    console.error('User role API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
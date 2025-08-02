import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/lib/types/roles'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role from database
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
      // Default to operator role if user not found
      return NextResponse.json({ role: UserRole.OPERATOR })
    }

    // Validate role and default to operator if invalid
    const role = Object.values(UserRole).includes(user.role as UserRole) 
      ? user.role 
      : UserRole.OPERATOR

    return NextResponse.json({ role })
  } catch (error) {
    console.error('User role API error:', error)
    return NextResponse.json({ role: UserRole.OPERATOR })
  }
}
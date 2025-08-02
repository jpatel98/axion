import { NextRequest, NextResponse } from 'next/server'
import { withManagerRole } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase'

export const GET = withManagerRole(async (user) => {
  try {
    // Get all users in the manager's tenant
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .eq('tenant_id', user.tenant_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
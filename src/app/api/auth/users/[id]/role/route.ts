import { NextRequest, NextResponse } from 'next/server'
import { withManagerRole } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { UserRole } from '@/lib/types/roles'

export const PATCH = withManagerRole(async (manager, request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { role } = await request.json()
    const { id: userId } = await params

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Ensure the user belongs to the same tenant as the manager
    const { data: targetUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, tenant_id, email')
      .eq('id', userId)
      .eq('tenant_id', manager.tenant_id)
      .single()

    if (fetchError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update the user's role
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .eq('tenant_id', manager.tenant_id)

    if (updateError) {
      console.error('Error updating user role:', updateError)
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
    }

    console.log(`Manager ${manager.email} updated user ${targetUser.email} role to ${role}`)

    return NextResponse.json({ 
      success: true, 
      message: `User role updated to ${role}` 
    })
  } catch (error) {
    console.error('Update role API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
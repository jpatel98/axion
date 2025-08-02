import { NextRequest, NextResponse } from 'next/server'
import { withManagerRole } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { UserRole } from '@/lib/types/roles'

export const POST = withManagerRole(async (manager, request: NextRequest) => {
  try {
    const { email, role } = await request.json()

    // Validate input
    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if user already exists in this tenant
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .eq('tenant_id', manager.tenant_id)
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists in your company' 
      }, { status: 409 })
    }

    // Get tenant info for the invitation
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('name, slug')
      .eq('id', manager.tenant_id)
      .single()

    // For now, we'll create a pending invitation record
    // In a full implementation, you'd integrate with an email service
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('invitations')
      .insert({
        tenant_id: manager.tenant_id,
        invited_by: manager.id,
        email: email,
        role: role,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // In a real implementation, send email here
    console.log(`Invitation sent: ${email} invited to ${tenant?.name} as ${role}`)

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
      invitation: {
        email,
        role,
        company: tenant?.name,
        expires_at: invitation.expires_at
      }
    })

  } catch (error) {
    console.error('Invite user API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
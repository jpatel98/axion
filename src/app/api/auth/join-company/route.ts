import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { UserRole } from '@/lib/types/roles'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyCode } = await request.json()

    if (!companyCode) {
      return NextResponse.json({ error: 'Company code is required' }, { status: 400 })
    }

    // Get full user details from Clerk
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already exists in our database
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'User already registered' }, { status: 409 })
    }

    // Find the tenant by company code (slug)
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('slug', companyCode.toLowerCase())
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Invalid company code' }, { status: 404 })
    }

    // Check if there's a pending invitation for this email
    const email = clerkUser.emailAddresses[0]?.emailAddress
    const { data: invitation } = await supabaseAdmin
      .from('invitations')
      .select('role, status, expires_at')
      .eq('email', email)
      .eq('tenant_id', tenant.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Determine role: if there's a valid invitation, use that role; otherwise default to operator
    let userRole = UserRole.OPERATOR
    if (invitation && new Date(invitation.expires_at) > new Date()) {
      userRole = invitation.role as UserRole
      
      // Mark invitation as accepted
      await supabaseAdmin
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('email', email)
        .eq('tenant_id', tenant.id)
        .eq('status', 'pending')
    }

    // Create the user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_user_id: userId,
        tenant_id: tenant.id,
        email: email,
        first_name: clerkUser.firstName || '',
        last_name: clerkUser.lastName || '',
        role: userRole
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user:', userError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    return NextResponse.json({ 
      user, 
      tenant, 
      status: 'joined',
      hadInvitation: !!invitation 
    })

  } catch (error) {
    console.error('Join company error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}
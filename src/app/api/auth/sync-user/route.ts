import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get full user details from Clerk
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already exists in our database
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (existingUser) {
      // User already exists, just return
      return NextResponse.json({ user: existingUser, status: 'existing' })
    }

    // Create new user and tenant
    const email = clerkUser.emailAddresses[0]?.emailAddress
    const firstName = clerkUser.firstName || ''
    const lastName = clerkUser.lastName || ''

    // First create a tenant for this user
    const companyName = email ? email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') : 'newcompany'
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: email ? email.split('@')[0] : 'New Company',
        slug: companyName.toLowerCase()
      })
      .select()
      .single()

    if (tenantError) {
      console.error('Error creating tenant:', tenantError)
      return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 })
    }

    // Then create the user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        clerk_user_id: userId,
        tenant_id: tenant.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        role: 'admin' // First user of a tenant should be admin
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user:', userError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    return NextResponse.json({ user, tenant, status: 'created' })

  } catch (error) {
    console.error('User sync error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}
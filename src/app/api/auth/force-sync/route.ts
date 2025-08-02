import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/lib/types/roles'

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

    // First, delete any existing user record to start fresh
    await supabase
      .from('users')
      .delete()
      .eq('clerk_user_id', userId)

    const email = clerkUser.emailAddresses[0]?.emailAddress
    const firstName = clerkUser.firstName || ''
    const lastName = clerkUser.lastName || ''

    // Get or create tenant
    const companyName = email ? email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') : 'newcompany'
    const baseSlug = companyName.toLowerCase()
    
    // Find existing tenant or create a new one
    let { data: tenant } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', baseSlug)
      .single()

    if (!tenant) {
      // Create new tenant with unique slug
      const uniqueSlug = `${baseSlug}-${Date.now()}`
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: email ? email.split('@')[0] : 'New Company',
          slug: uniqueSlug
        })
        .select()
        .single()

      if (tenantError) {
        console.error('Error creating tenant:', tenantError)
        return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 })
      }
      
      tenant = newTenant
    }

    // Create the user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        clerk_user_id: userId,
        tenant_id: tenant.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        role: UserRole.MANAGER // Default to manager for now
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
      status: 'force-created',
      message: 'User successfully synced'
    })

  } catch (error) {
    console.error('Force sync error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}
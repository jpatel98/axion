import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    const user = await currentUser()
    
    if (!user) {
      console.log('No user from Clerk')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Syncing user:', { id: user.id, email: user.emailAddresses[0]?.emailAddress })

    // Check if user already exists in our database
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError)
      throw checkError
    }

    if (existingUser) {
      console.log('User already exists in database')
      return NextResponse.json({ message: 'User already synced' })
    }

    console.log('Creating new user and tenant...')

    // Get organization info if user belongs to one
    // Note: organizationMemberships is not available on the User type in this version
    // We'll create a personal tenant for now
    const organizationId = null
    const organizationName = null
    const organizationSlug = null

    let tenantId: string

    if (organizationId) {
      console.log('User has organization:', organizationId)
      // Check if tenant exists for this organization
      const { data: existingTenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('clerk_org_id', organizationId)
        .single()

      if (existingTenant) {
        console.log('Found existing tenant for organization')
        tenantId = existingTenant.id
      } else {
        console.log('Creating new tenant for organization')
        // Create new tenant for organization
        const { data: newTenant, error: tenantError } = await supabase
          .from('tenants')
          .insert({
            name: organizationName || 'Default Organization',
            slug: organizationSlug || 'default-org',
            clerk_org_id: organizationId
          })
          .select('id')
          .single()

        if (tenantError) {
          console.error('Error creating organization tenant:', tenantError)
          throw tenantError
        }

        console.log('Created tenant:', newTenant.id)
        tenantId = newTenant.id
      }
    } else {
      console.log('Creating personal tenant for user')
      // Create personal tenant for individual user
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: `${user.firstName || 'User'}'s Organization`,
          slug: `user-${user.id}`,
          clerk_org_id: null
        })
        .select('id')
        .single()

      if (tenantError) {
        console.error('Error creating personal tenant:', tenantError)
        throw tenantError
      }

      console.log('Created personal tenant:', newTenant.id)
      tenantId = newTenant.id
    }

    // Create user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        tenant_id: tenantId,
        clerk_user_id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        first_name: user.firstName,
        last_name: user.lastName,
        role: 'admin' // First user in a tenant is admin
      })

    if (userError) {
      throw userError
    }

    return NextResponse.json({ message: 'User synced successfully' })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
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

    const { companyName } = await request.json()

    if (!companyName || companyName.trim().length < 2) {
      return NextResponse.json({ error: 'Company name must be at least 2 characters' }, { status: 400 })
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

    // Create a unique slug for the company
    const baseSlug = companyName.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()

    let slug = baseSlug
    let counter = 1

    // Ensure slug is unique
    while (true) {
      const { data: existingTenant } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!existingTenant) break
      
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create new tenant
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        name: companyName.trim(),
        slug: slug
      })
      .select()
      .single()

    if (tenantError) {
      console.error('Error creating tenant:', tenantError)
      return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
    }

    // Create the user as manager (first user in company)
    const email = clerkUser.emailAddresses[0]?.emailAddress
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_user_id: userId,
        tenant_id: tenant.id,
        email: email,
        first_name: clerkUser.firstName || '',
        last_name: clerkUser.lastName || '',
        role: UserRole.MANAGER
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
      status: 'created',
      companyCode: slug.toUpperCase()
    })

  } catch (error) {
    console.error('Create company error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withPermission } from '@/lib/api-auth'
import { supabase } from '@/lib/supabase'

export const GET = withAuth(async (user, request: NextRequest) => {

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = supabase
      .from('customers')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .order('name', { ascending: true })

    // Apply search filter if provided
    if (search) {
      // Validate search string
      if (search.length > 100) {
        return NextResponse.json({ error: 'Search term too long' }, { status: 400 })
      }
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,contact_person.ilike.%${search}%`)
    }

    const { data: customers, error } = await query

    if (error) {
      console.error('Error fetching customers:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch customers: ' + error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ customers: customers || [] })
})

export const POST = withPermission('canManageCustomers', async (user, request: NextRequest) => {

    const body = await request.json()
    const {
      name,
      email,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      contact_person,
      notes
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 })
    }

    // Validate name format
    if (typeof name !== 'string' || name.length > 255) {
      return NextResponse.json({ error: 'Invalid customer name format' }, { status: 400 })
    }

    // Validate email format if provided
    if (email !== undefined && email !== null) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (typeof email !== 'string' || !emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }
    }

    // Validate phone format if provided
    if (phone !== undefined && phone !== null) {
      if (typeof phone !== 'string' || phone.length > 50) {
        return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 })
      }
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        tenant_id: user.tenant_id,
        name,
        email,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country: country || 'United States',
        contact_person,
        notes
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating customer:', error)
      return NextResponse.json({ 
        error: 'Failed to create customer: ' + (error.message || 'Unknown database error') 
      }, { status: 500 })
    }

    return NextResponse.json({ customer }, { status: 201 })
})
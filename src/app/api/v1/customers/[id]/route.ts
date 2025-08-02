import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { validate as isUUID } from 'uuid'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Validate UUID format
    if (!isUUID(id)) {
      return NextResponse.json({ error: 'Invalid customer ID format' }, { status: 400 })
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)
      .single()

    if (error) {
      console.error('Database error fetching customer:', error)
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 })
    }
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Validate UUID format
    if (!isUUID(id)) {
      return NextResponse.json({ error: 'Invalid customer ID format' }, { status: 400 })
    }

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
      .update({
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
      })
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)
      .select()
      .single()

    if (error) {
      console.error('Database error updating customer:', error)
      return NextResponse.json({ 
        error: 'Failed to update customer: ' + (error.message || 'Unknown database error') 
      }, { status: 500 })
    }
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('API Error:', error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Validate UUID format
    if (!isUUID(id)) {
      return NextResponse.json({ error: 'Invalid customer ID format' }, { status: 400 })
    }

    // Check if customer exists first
    const { data: existingCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)
      .single()

    if (fetchError) {
      console.error('Database error fetching customer:', fetchError)
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 })
    }

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)

    if (error) {
      console.error('Error deleting customer:', error)
      return NextResponse.json({ 
        error: 'Failed to delete customer: ' + (error.message || 'Unknown database error') 
      }, { status: 500 })
    }

    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}
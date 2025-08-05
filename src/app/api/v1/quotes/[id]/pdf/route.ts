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
      return NextResponse.json({ error: 'Invalid quote ID format' }, { status: 400 })
    }

    // Get quote with customer and line items
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country,
          contact_person
        )
      `)
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)
      .single()

    if (quoteError) {
      console.error('Database error fetching quote:', quoteError)
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 })
    }
    
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Get line items
    const { data: lineItems, error: lineItemsError } = await supabase
      .from('quote_line_items')
      .select('*')
      .eq('quote_id', id)
      .order('item_number', { ascending: true })

    if (lineItemsError) {
      console.error('Error fetching line items:', lineItemsError)
      return NextResponse.json({ 
        error: 'Failed to fetch quote details: ' + (lineItemsError.message || 'Unknown database error')
      }, { status: 500 })
    }

    // Get company settings for branding
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('company_name, contact_email, phone, address')
      .eq('tenant_id', user.tenant_id)
      .single()

    if (settingsError) {
      console.error('Error fetching company settings:', settingsError)
    }

    // Get tenant info as fallback
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('name')
      .eq('id', user.tenant_id)
      .single()

    if (tenantError) {
      console.error('Error fetching tenant info:', tenantError)
    }

    const companyName = settings?.company_name || tenant?.name || 'Manufacturing Company'

    return NextResponse.json({
      quote: {
        ...quote,
        quote_line_items: lineItems || []
      },
      company: {
        name: companyName,
        email: settings?.contact_email,
        phone: settings?.phone,
        address: settings?.address
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}
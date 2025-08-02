import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { validate as isUUID } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Validate page and pageSize
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 })
    }

    // Calculate offset
    const offset = (page - 1) * pageSize

    // Build query
    let query = supabase
      .from('quotes')
      .select(`
        id,
        quote_number,
        title,
        description,
        status,
        subtotal,
        tax_amount,
        total,
        valid_until,
        created_at,
        customers!inner (
          id,
          name,
          email
        )
      `, { count: 'exact' })
      .eq('tenant_id', user.tenant_id)

    // Apply filters
    if (status && status !== 'all') {
      // Validate status value
      const validStatuses = ['draft', 'sent', 'approved', 'rejected', 'converted']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 })
      }
      query = query.eq('status', status)
    }

    if (search) {
      // Validate search string
      if (search.length > 100) {
        return NextResponse.json({ error: 'Search term too long' }, { status: 400 })
      }
      query = query.or(`quote_number.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%,customers.name.ilike.%${search}%`)
    }

    // Apply sorting (validate sort field)
    const validSortFields = ['id', 'quote_number', 'title', 'description', 'status', 'subtotal', 'tax_amount', 'total', 'valid_until', 'created_at']
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json({ error: 'Invalid sort field' }, { status: 400 })
    }
    
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1)

    const { data: quotes, error, count } = await query

    if (error) {
      console.error('Error fetching quotes:', error)
      return NextResponse.json({ error: 'Failed to fetch quotes: ' + error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      quotes: quotes || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      customer_id,
      quote_number,
      title,
      description,
      tax_rate,
      valid_until,
      notes,
      internal_notes,
      line_items = []
    } = body

    // Validate required fields
    if (!customer_id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }
    
    if (!quote_number) {
      return NextResponse.json({ error: 'Quote number is required' }, { status: 400 })
    }

    // Validate UUID format for customer_id
    if (!isUUID(customer_id)) {
      return NextResponse.json({ error: 'Invalid customer ID format' }, { status: 400 })
    }

    // Validate quote_number format (alphanumeric with dashes/underscores)
    if (typeof quote_number !== 'string' || quote_number.length > 100) {
      return NextResponse.json({ error: 'Invalid quote number format' }, { status: 400 })
    }

    // Check for duplicate quote number within tenant
    const { data: existingQuote } = await supabase
      .from('quotes')
      .select('id')
      .eq('tenant_id', user.tenant_id)
      .eq('quote_number', quote_number)
      .single()

    if (existingQuote) {
      return NextResponse.json({ error: 'A quote with this quote number already exists' }, { status: 409 })
    }

    // Validate tax_rate if provided
    if (tax_rate !== undefined && (typeof tax_rate !== 'number' || tax_rate < 0)) {
      return NextResponse.json({ error: 'Tax rate must be a positive number' }, { status: 400 })
    }

    // Validate line items if provided
    if (Array.isArray(line_items)) {
      for (let i = 0; i < line_items.length; i++) {
        const item = line_items[i]
        if (typeof item !== 'object' || item === null) {
          return NextResponse.json({ error: `Line item ${i + 1} is invalid` }, { status: 400 })
        }
        
        if (item.description !== undefined && typeof item.description !== 'string') {
          return NextResponse.json({ error: `Line item ${i + 1} description must be a string` }, { status: 400 })
        }
        
        if (item.quantity !== undefined && (typeof item.quantity !== 'number' || item.quantity < 0)) {
          return NextResponse.json({ error: `Line item ${i + 1} quantity must be a positive number` }, { status: 400 })
        }
        
        if (item.unit_price !== undefined && (typeof item.unit_price !== 'number' || item.unit_price < 0)) {
          return NextResponse.json({ error: `Line item ${i + 1} unit price must be a positive number` }, { status: 400 })
        }
      }
    }

    // Create the quote first
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        tenant_id: user.tenant_id,
        customer_id,
        quote_number,
        title,
        description,
        tax_rate: tax_rate || 0,
        valid_until,
        notes,
        internal_notes,
        status: 'draft'
      })
      .select()
      .single()

    if (quoteError) {
      console.error('Error creating quote:', quoteError)
      return NextResponse.json({ 
        error: 'Failed to create quote: ' + (quoteError.message || 'Unknown database error') 
      }, { status: 500 })
    }

    // Add line items if provided
    if (Array.isArray(line_items) && line_items.length > 0) {
      const lineItemsToInsert = line_items.map((item: any, index: number) => ({
        quote_id: quote.id,
        item_number: index + 1,
        description: item?.description || '',
        quantity: parseFloat(item?.quantity) || 1,
        unit_price: parseFloat(item?.unit_price) || 0,
        notes: item?.notes || null
      }))

      const { error: lineItemsError } = await supabase
        .from('quote_line_items')
        .insert(lineItemsToInsert)

      if (lineItemsError) {
        console.error('Error creating line items:', lineItemsError)
        // Clean up the quote if line items failed
        await supabase.from('quotes').delete().eq('id', quote.id)
        return NextResponse.json({ 
          error: 'Failed to create quote line items: ' + (lineItemsError.message || 'Unknown database error')
        }, { status: 500 })
      }

      // Manually calculate and update totals after successful line item insertion
      try {
        const subtotal = lineItemsToInsert.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
        const taxAmount = subtotal * (tax_rate || 0)
        const total = subtotal + taxAmount

        const { error: updateError } = await supabase
          .from('quotes')
          .update({
            subtotal,
            tax_amount: taxAmount,
            total
          })
          .eq('id', quote.id)

        if (updateError) {
          console.error('Error updating quote totals:', updateError)
        }
      } catch (calcError) {
        console.error('Error calculating totals:', calcError)
      }
    }

    // Get complete quote with customer data and line items for response
    const { data: completeQuote, error: fetchError } = await supabase
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
      .eq('id', quote.id)
      .eq('tenant_id', user.tenant_id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete quote:', fetchError)
      return NextResponse.json({ quote }, { status: 201 })
    }

    // Get line items
    const { data: lineItems, error: lineItemsFetchError } = await supabase
      .from('quote_line_items')
      .select('*')
      .eq('quote_id', quote.id)
      .order('item_number', { ascending: true })

    if (lineItemsFetchError) {
      console.error('Error fetching line items:', lineItemsFetchError)
    }

    const responseData = { 
      quote: {
        ...completeQuote,
        quote_line_items: lineItems || []
      }
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('API Error in quote creation:', error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}
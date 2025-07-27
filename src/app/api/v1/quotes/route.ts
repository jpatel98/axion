import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: quotes, error } = await supabase
      .from('quotes')
      .select(`
        *,
        customers (
          id,
          name,
          email
        )
      `)
      .eq('tenant_id', user.tenant_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching quotes:', error)
      return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
    }

    return NextResponse.json({ quotes: quotes || [] })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received quote data:', JSON.stringify(body, null, 2))
    
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

    console.log('Parsed line_items:', line_items)

    if (!customer_id || !quote_number) {
      return NextResponse.json({ error: 'Customer and quote number are required' }, { status: 400 })
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
      return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
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

      console.log('Line items to insert:', lineItemsToInsert)

      const { error: lineItemsError } = await supabase
        .from('quote_line_items')
        .insert(lineItemsToInsert)

      if (lineItemsError) {
        console.error('Error creating line items:', lineItemsError)
        // Clean up the quote if line items failed
        await supabase.from('quotes').delete().eq('id', quote.id)
        return NextResponse.json({ error: 'Failed to create quote line items' }, { status: 500 })
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

    console.log('Sending response:', JSON.stringify(responseData, null, 2))
    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('API Error in quote creation:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
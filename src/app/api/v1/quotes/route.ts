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
    if (line_items.length > 0) {
      const lineItemsToInsert = line_items.map((item: any, index: number) => ({
        quote_id: quote.id,
        item_number: index + 1,
        description: item.description,
        quantity: item.quantity || 1,
        unit_price: item.unit_price,
        notes: item.notes
      }))

      const { error: lineItemsError } = await supabase
        .from('quote_line_items')
        .insert(lineItemsToInsert)

      if (lineItemsError) {
        console.error('Error creating line items:', lineItemsError)
        // Clean up the quote if line items failed
        await supabase.from('quotes').delete().eq('id', quote.id)
        return NextResponse.json({ error: 'Failed to create quote line items' }, { status: 500 })
      }
    }

    return NextResponse.json({ quote }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
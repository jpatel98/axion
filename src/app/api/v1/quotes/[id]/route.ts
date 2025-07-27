import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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

    if (quoteError || !quote) {
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
      return NextResponse.json({ error: 'Failed to fetch quote details' }, { status: 500 })
    }

    return NextResponse.json({
      quote: {
        ...quote,
        quote_line_items: lineItems || []
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      title,
      description,
      tax_rate,
      valid_until,
      notes,
      internal_notes,
      status,
      line_items
    } = body

    // Update the quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .update({
        title,
        description,
        tax_rate,
        valid_until,
        notes,
        internal_notes,
        status
      })
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)
      .select()
      .single()

    if (quoteError || !quote) {
      return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
    }

    // Update line items if provided
    if (line_items && Array.isArray(line_items)) {
      // Delete existing line items
      await supabase
        .from('quote_line_items')
        .delete()
        .eq('quote_id', id)

      // Insert new line items
      if (line_items.length > 0) {
        const lineItemsToInsert = line_items.map((item: any, index: number) => ({
          quote_id: id,
          item_number: index + 1,
          description: item.description,
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          notes: item.notes
        }))

        const { error: lineItemsError } = await supabase
          .from('quote_line_items')
          .insert(lineItemsToInsert)

        if (lineItemsError) {
          console.error('Error updating line items:', lineItemsError)
          return NextResponse.json({ error: 'Failed to update quote line items' }, { status: 500 })
        }
      }
    }

    // Manually calculate and update totals if line items were updated
    if (line_items && Array.isArray(line_items)) {
      const subtotal = line_items.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.unit_price)), 0)
      const taxAmount = subtotal * (tax_rate || 0)
      const total = subtotal + taxAmount

      await supabase
        .from('quotes')
        .update({
          subtotal,
          tax_amount: taxAmount,
          total
        })
        .eq('id', id)
    }

    // Get updated quote with line items for response
    const { data: updatedQuote, error: fetchError } = await supabase
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

    if (fetchError) {
      return NextResponse.json({ quote })
    }

    // Get updated line items
    const { data: updatedLineItems } = await supabase
      .from('quote_line_items')
      .select('*')
      .eq('quote_id', id)
      .order('item_number', { ascending: true })

    return NextResponse.json({
      quote: {
        ...updatedQuote,
        quote_line_items: updatedLineItems || []
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    // Delete line items first (due to foreign key constraint)
    await supabase
      .from('quote_line_items')
      .delete()
      .eq('quote_id', id)

    // Delete the quote
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)

    if (error) {
      console.error('Error deleting quote:', error)
      return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Quote deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
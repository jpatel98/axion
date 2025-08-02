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

    return NextResponse.json({
      quote: {
        ...quote,
        quote_line_items: lineItems || []
      }
    })
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
      return NextResponse.json({ error: 'Invalid quote ID format' }, { status: 400 })
    }

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

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['draft', 'sent', 'approved', 'rejected', 'converted']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
      }
    }

    // Validate tax_rate if provided
    if (tax_rate !== undefined && (typeof tax_rate !== 'number' || tax_rate < 0)) {
      return NextResponse.json({ error: 'Tax rate must be a positive number' }, { status: 400 })
    }

    // Validate line items if provided
    if (line_items !== undefined && !Array.isArray(line_items)) {
      return NextResponse.json({ error: 'Line items must be an array' }, { status: 400 })
    }

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

    if (quoteError) {
      console.error('Database error updating quote:', quoteError)
      return NextResponse.json({ 
        error: 'Failed to update quote: ' + (quoteError.message || 'Unknown database error') 
      }, { status: 500 })
    }
    
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Update line items if provided
    if (line_items && Array.isArray(line_items)) {
      // Delete existing line items
      const { error: deleteError } = await supabase
        .from('quote_line_items')
        .delete()
        .eq('quote_id', id)

      if (deleteError) {
        console.error('Error deleting existing line items:', deleteError)
        return NextResponse.json({ 
          error: 'Failed to update quote line items: ' + (deleteError.message || 'Unknown database error') 
        }, { status: 500 })
      }

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
          return NextResponse.json({ 
            error: 'Failed to update quote line items: ' + (lineItemsError.message || 'Unknown database error') 
          }, { status: 500 })
        }
      }
    }

    // Manually calculate and update totals if line items were updated
    if (line_items && Array.isArray(line_items)) {
      const subtotal = line_items.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.unit_price)), 0)
      const taxAmount = subtotal * (tax_rate || 0)
      const total = subtotal + taxAmount

      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          subtotal,
          tax_amount: taxAmount,
          total
        })
        .eq('id', id)
        
      if (updateError) {
        console.error('Error updating quote totals:', updateError)
      }
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
      console.error('Error fetching updated quote:', fetchError)
      return NextResponse.json({ quote })
    }

    // Get updated line items
    const { data: updatedLineItems, error: lineItemsError } = await supabase
      .from('quote_line_items')
      .select('*')
      .eq('quote_id', id)
      .order('item_number', { ascending: true })

    if (lineItemsError) {
      console.error('Error fetching updated line items:', lineItemsError)
      return NextResponse.json({
        quote: {
          ...updatedQuote,
          quote_line_items: []
        }
      })
    }

    return NextResponse.json({
      quote: {
        ...updatedQuote,
        quote_line_items: updatedLineItems || []
      }
    })
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
      return NextResponse.json({ error: 'Invalid quote ID format' }, { status: 400 })
    }

    // Check if quote exists first
    const { data: existingQuote, error: fetchError } = await supabase
      .from('quotes')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)
      .single()

    if (fetchError) {
      console.error('Database error fetching quote:', fetchError)
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 })
    }

    if (!existingQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Delete line items first (due to foreign key constraint)
    const { error: lineItemsError } = await supabase
      .from('quote_line_items')
      .delete()
      .eq('quote_id', id)

    if (lineItemsError) {
      console.error('Error deleting quote line items:', lineItemsError)
      return NextResponse.json({ 
        error: 'Failed to delete quote line items: ' + (lineItemsError.message || 'Unknown database error') 
      }, { status: 500 })
    }

    // Delete the quote
    const { error: quoteError } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)

    if (quoteError) {
      console.error('Error deleting quote:', quoteError)
      return NextResponse.json({ 
        error: 'Failed to delete quote: ' + (quoteError.message || 'Unknown database error') 
      }, { status: 500 })
    }

    return NextResponse.json({ message: 'Quote deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}
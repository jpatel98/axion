import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { validate as isUUID } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { quote_id } = body

    // Validate required fields
    if (!quote_id) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 })
    }

    // Validate UUID format
    if (!isUUID(quote_id)) {
      return NextResponse.json({ error: 'Invalid quote ID format' }, { status: 400 })
    }

    // Get the quote with customer and line items
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        customers (
          id,
          name
        )
      `)
      .eq('id', quote_id)
      .eq('tenant_id', user.tenant_id)
      .single()

    if (quoteError) {
      console.error('Database error fetching quote:', quoteError)
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 })
    }
    
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Check if quote is approved
    if (quote.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Only approved quotes can be converted to jobs' 
      }, { status: 400 })
    }

    // Check if quote has already been converted
    if (quote.status === 'converted') {
      return NextResponse.json({ 
        error: 'This quote has already been converted to a job' 
      }, { status: 400 })
    }

    // Get line items for description
    const { data: lineItems, error: lineItemsError } = await supabase
      .from('quote_line_items')
      .select('*')
      .eq('quote_id', quote_id)
      .order('item_number', { ascending: true })

    if (lineItemsError) {
      console.error('Database error fetching line items:', lineItemsError)
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 })
    }

    // Generate job number (you might want to implement a more sophisticated numbering system)
    const jobNumber = `JOB-${Date.now()}`

    // Calculate total quantity from line items
    const totalQuantity = lineItems?.reduce((sum, item) => sum + item.quantity, 0) || 1

    // Create description from line items
    const description = lineItems && lineItems.length > 0 
      ? `Quote ${quote.quote_number} - ${lineItems.map(item => `${item.quantity}x ${item.description}`).join(', ')}`
      : quote.description || `Job from Quote ${quote.quote_number}`

    // Create the job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        tenant_id: user.tenant_id,
        job_number: jobNumber,
        customer_name: quote.customers?.name || 'Unknown Customer',
        part_number: null, // Could be derived from line items if needed
        description,
        quantity: totalQuantity,
        estimated_cost: quote.total,
        actual_cost: 0,
        status: 'pending',
        due_date: null // Could be calculated based on quote validity or customer requirements
      })
      .select()
      .single()

    if (jobError) {
      console.error('Error creating job:', jobError)
      return NextResponse.json({ 
        error: 'Failed to create job from quote: ' + (jobError.message || 'Unknown database error')
      }, { status: 500 })
    }

    // Update quote status to indicate it's been converted
    const { error: updateError } = await supabase
      .from('quotes')
      .update({ 
        status: 'converted',
        internal_notes: quote.internal_notes 
          ? `${quote.internal_notes}\n\nConverted to Job ${jobNumber} on ${new Date().toISOString()}`
          : `Converted to Job ${jobNumber} on ${new Date().toISOString()}`
      })
      .eq('id', quote_id)

    if (updateError) {
      console.error('Error updating quote status:', updateError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ 
      job,
      message: `Successfully created job ${jobNumber} from quote ${quote.quote_number}`
    }, { status: 201 })

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
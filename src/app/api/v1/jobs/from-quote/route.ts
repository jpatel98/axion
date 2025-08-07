import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { validate as isUUID } from 'uuid'
import { generateOperationsFromQuoteLineItems, schedulingEngine } from '@/lib/scheduling-engine'
import { isFeatureEnabled } from '@/lib/feature-flags'

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
        part_number: quote.part_number || null, // Use part number from quote
        description,
        quantity: totalQuantity,
        estimated_cost: quote.total,
        actual_cost: 0,
        status: 'pending',
        due_date: quote.due_date || null // Use due date from quote
      })
      .select()
      .single()

    if (jobError) {
      console.error('Error creating job:', jobError)
      return NextResponse.json({ 
        error: 'Failed to create job from quote: ' + (jobError.message || 'Unknown database error')
      }, { status: 500 })
    }

    // Enhanced Quote-to-Job Conversion: Auto-generate operations and scheduling
    if (isFeatureEnabled('ENHANCED_QUOTE_CONVERSION', user.id, user.tenant_id)) {
      try {
        // Generate operations from quote line items
        const operations = generateOperationsFromQuoteLineItems(lineItems || [])
        
        if (operations.length > 0) {
          // Insert job operations
          const jobOperationsData = operations.map(op => ({
            tenant_id: user.tenant_id,
            job_id: job.id,
            operation_name: op.name,
            sequence_order: op.sequenceOrder,
            estimated_duration: op.estimatedDuration,
            work_center_id: op.workCenterId || null,
            skill_requirements: op.skillRequirements || null,
            status: 'pending'
          }))

          const { data: jobOperations, error: operationsError } = await supabase
            .from('job_operations')
            .insert(jobOperationsData)
            .select()

          if (operationsError) {
            console.error('Error creating job operations:', operationsError)
          } else {
            // Generate scheduling suggestions if smart scheduling is enabled
            if (isFeatureEnabled('SMART_SCHEDULING_SUGGESTIONS', user.id, user.tenant_id)) {
              try {
                const schedulingSuggestion = await schedulingEngine.generateSchedulingSuggestions({
                  id: job.id,
                  jobNumber: job.job_number,
                  customerId: job.customer_id || undefined,
                  dueDate: job.due_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 14 days if no due date
                  estimatedDuration: Math.ceil(operations.reduce((sum, op) => sum + op.estimatedDuration, 0) / 60), // Convert to hours
                  operations,
                  priorityLevel: 3, // Default priority
                  quantity: totalQuantity
                })

                // Create scheduled operations for calendar integration
                const scheduledOperationsData = schedulingSuggestion.workCenterAssignments.map(assignment => ({
                  tenant_id: user.tenant_id,
                  job_id: job.id,
                  operation_id: jobOperations.find(op => op.operation_name === assignment.operationName)?.id,
                  work_center_id: assignment.workCenterId,
                  scheduled_start: assignment.scheduledStart.toISOString(),
                  scheduled_end: assignment.scheduledEnd.toISOString(),
                  estimated_duration: assignment.estimatedDuration,
                  status: 'scheduled'
                }))

                const { error: schedulingError } = await supabase
                  .from('scheduled_operations')
                  .insert(scheduledOperationsData.filter(data => data.operation_id)) // Only insert if operation_id exists

                if (schedulingError) {
                  console.error('Error creating scheduled operations:', schedulingError)
                }

                // Log integration event
                await supabase
                  .from('system_events')
                  .insert({
                    tenant_id: user.tenant_id,
                    event_type: 'job_auto_scheduled',
                    event_data: {
                      job_id: job.id,
                      job_number: job.job_number,
                      quote_id: quote_id,
                      operations_count: operations.length,
                      confidence_score: schedulingSuggestion.confidenceScore,
                      conflicts: schedulingSuggestion.conflictWarnings.length
                    },
                    user_id: user.id
                  })

                console.log(`Auto-scheduled job ${job.job_number} with ${operations.length} operations`)
              } catch (schedulingError) {
                console.error('Error generating scheduling suggestions:', schedulingError)
              }
            }
          }
        }
      } catch (enhancementError) {
        console.error('Error in enhanced quote conversion:', enhancementError)
        // Continue with basic conversion even if enhancement fails
      }
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
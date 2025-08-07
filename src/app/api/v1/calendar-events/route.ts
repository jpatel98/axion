import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    const events = []

    // 1. Get scheduled operations (existing calendar system)
    let scheduledOpsQuery = supabase
      .from('scheduled_operations')
      .select(`
        *,
        job_operations (
          operation_name,
          sequence_order,
          jobs (
            job_number,
            customer_name,
            description,
            part_number
          )
        ),
        work_centers (
          name,
          machine_type
        ),
        workers (
          name
        )
      `)
      .eq('tenant_id', user.tenant_id)

    if (startDate) {
      scheduledOpsQuery = scheduledOpsQuery.gte('scheduled_start', startDate)
    }
    if (endDate) {
      scheduledOpsQuery = scheduledOpsQuery.lte('scheduled_end', endDate)
    }

    const { data: scheduledOps } = await scheduledOpsQuery.order('scheduled_start')

    // Add scheduled operations to events
    if (scheduledOps) {
      for (const op of scheduledOps) {
        let title = op.title
        let description = op.description

        // If linked to job operation, create better title/description
        if (op.job_operations && op.job_operations.jobs) {
          const job = op.job_operations.jobs
          title = `${job.job_number} - ${op.job_operations.operation_name}`
          description = `${op.job_operations.operation_name} for ${job.customer_name}\n${job.description || ''}`
        }

        events.push({
          id: op.id,
          title,
          description,
          start: op.scheduled_start,
          end: op.scheduled_end,
          extendedProps: {
            type: 'scheduled_operation',
            status: op.status,
            workCenter: op.work_centers?.name,
            worker: op.workers?.name,
            jobNumber: op.job_operations?.jobs?.job_number,
            operationName: op.job_operations?.operation_name,
            sequenceOrder: op.job_operations?.sequence_order
          }
        })
      }
    }

    // 2. Get jobs without scheduled operations (show due dates)
    let jobsQuery = supabase
      .from('jobs')
      .select(`
        id,
        job_number,
        customer_name,
        description,
        due_date,
        status,
        quantity
      `)
      .eq('tenant_id', user.tenant_id)
      .not('status', 'eq', 'completed')
      .not('status', 'eq', 'shipped')
      .not('due_date', 'is', null)

    // Filter by date range if provided
    if (startDate && endDate) {
      jobsQuery = jobsQuery.gte('due_date', startDate.split('T')[0])
        .lte('due_date', endDate.split('T')[0])
    }

    const { data: jobs } = await jobsQuery

    // Add jobs without scheduled operations as due date events
    if (jobs) {
      for (const job of jobs) {
        // Check if this job already has scheduled operations
        const hasScheduledOps = scheduledOps?.some(op => 
          op.job_operations?.jobs?.job_number === job.job_number
        )

        if (!hasScheduledOps && job.due_date) {
          events.push({
            id: `job-${job.id}`,
            title: `Due: ${job.job_number}`,
            description: `${job.description || 'No description'}\nCustomer: ${job.customer_name}\nQuantity: ${job.quantity}`,
            start: job.due_date,
            end: job.due_date,
            allDay: true,
            extendedProps: {
              type: 'job_due_date',
              status: job.status,
              jobId: job.id,
              jobNumber: job.job_number,
              customerName: job.customer_name,
              needsScheduling: true
            }
          })
        }
      }
    }

    return NextResponse.json({ 
      events,
      summary: {
        scheduledOperations: scheduledOps?.length || 0,
        jobsDue: jobs?.filter(job => !scheduledOps?.some(op => 
          op.job_operations?.jobs?.job_number === job.job_number
        )).length || 0,
        total: events.length
      }
    })

  } catch (error) {
    console.error('Calendar events API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}
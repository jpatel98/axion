import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await rateLimit(request, { interval: 60000, maxRequests: 100 })
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    let query = supabase
      .from('scheduled_operations')
      .select(`
        *,
        job_operations!inner(
          *,
          jobs!inner(
            job_number,
            customer_name,
            description,
            part_number
          )
        ),
        work_centers!inner(
          name,
          machine_type
        ),
        workers(
          name
        )
      `)
      .eq('tenant_id', user.tenant_id)

    // Filter by date range if provided
    if (startDate) {
      query = query.gte('scheduled_start', startDate)
    }
    if (endDate) {
      query = query.lte('scheduled_end', endDate)
    }

    const { data: scheduledOperations, error } = await query.order('scheduled_start')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch scheduled operations' }, { status: 500 })
    }

    return NextResponse.json({ scheduledOperations })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting  
    const { success } = await rateLimit(request, { interval: 60000, maxRequests: 30 })
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { 
      job_operation_id, 
      work_center_id, 
      worker_id, 
      scheduled_start, 
      scheduled_end,
      notes 
    } = body

    // Validation
    if (!job_operation_id || !work_center_id || !scheduled_start || !scheduled_end) {
      return NextResponse.json({ 
        error: 'Missing required fields: job_operation_id, work_center_id, scheduled_start, scheduled_end' 
      }, { status: 400 })
    }

    // Check for scheduling conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from('scheduled_operations')
      .select('id')
      .eq('work_center_id', work_center_id)
      .eq('tenant_id', user.tenant_id)
      .or(`scheduled_start.lte.${scheduled_end},scheduled_end.gte.${scheduled_start}`)

    if (conflictError) {
      console.error('Conflict check error:', conflictError)
      return NextResponse.json({ error: 'Failed to check scheduling conflicts' }, { status: 500 })
    }

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ 
        error: 'Scheduling conflict detected. The work center is already scheduled during this time.' 
      }, { status: 409 })
    }

    // Create scheduled operation
    const { data: scheduledOperation, error } = await supabase
      .from('scheduled_operations')
      .insert({
        tenant_id: user.tenant_id,
        job_operation_id,
        work_center_id,
        worker_id: worker_id || null,
        scheduled_start,
        scheduled_end,
        notes: notes?.trim() || null
      })
      .select(`
        *,
        job_operations!inner(
          *,
          jobs!inner(
            job_number,
            customer_name,
            description
          )
        ),
        work_centers!inner(
          name,
          machine_type
        ),
        workers(
          name
        )
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create scheduled operation' }, { status: 500 })
    }

    return NextResponse.json({ scheduledOperation }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
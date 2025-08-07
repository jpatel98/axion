import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { validate as isUUID } from 'uuid'
import { schedulingEngine } from '@/lib/scheduling-engine'
import { isFeatureEnabled } from '@/lib/feature-flags'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobId = params.id

    // Validate UUID format
    if (!isUUID(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID format' }, { status: 400 })
    }

    // Check if smart scheduling is enabled
    if (!isFeatureEnabled('SMART_SCHEDULING_SUGGESTIONS', user.id, user.tenant_id)) {
      return NextResponse.json({ 
        error: 'Smart scheduling feature is not enabled' 
      }, { status: 403 })
    }

    // Get the job with operations
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        job_operations (
          id,
          operation_name,
          sequence_order,
          estimated_duration,
          work_center_id,
          skill_requirements,
          status
        )
      `)
      .eq('id', jobId)
      .eq('tenant_id', user.tenant_id)
      .single()

    if (jobError) {
      console.error('Database error fetching job:', jobError)
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 })
    }
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check if job already has scheduled operations
    const { data: existingSchedule, error: scheduleCheckError } = await supabase
      .from('scheduled_operations')
      .select('id')
      .eq('job_id', jobId)
      .eq('tenant_id', user.tenant_id)

    if (scheduleCheckError) {
      console.error('Error checking existing schedule:', scheduleCheckError)
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 })
    }

    // Parse request body for scheduling preferences
    const body = await request.json()
    const { 
      forceReschedule = false, 
      priorityLevel = 3,
      preferredStartDate 
    } = body

    // If job already has schedule and not forcing reschedule, return existing
    if (existingSchedule && existingSchedule.length > 0 && !forceReschedule) {
      const { data: currentSchedule } = await supabase
        .from('scheduled_operations')
        .select(`
          *,
          job_operations (operation_name),
          work_centers (name)
        `)
        .eq('job_id', jobId)
        .eq('tenant_id', user.tenant_id)
        .order('scheduled_start', { ascending: true })

      return NextResponse.json({ 
        message: 'Job already has schedule (use forceReschedule=true to override)',
        schedule: currentSchedule,
        isExisting: true
      })
    }

    // Validate job operations exist
    if (!job.job_operations || job.job_operations.length === 0) {
      return NextResponse.json({ 
        error: 'Job has no operations defined. Cannot create schedule.' 
      }, { status: 400 })
    }

    // Convert job operations to scheduling engine format
    const operations = job.job_operations.map((op: any) => ({
      id: op.id,
      name: op.operation_name,
      sequenceOrder: op.sequence_order,
      estimatedDuration: op.estimated_duration,
      workCenterId: op.work_center_id,
      skillRequirements: op.skill_requirements
    }))

    // Prepare job data for scheduling engine
    const jobData = {
      id: job.id,
      jobNumber: job.job_number,
      customerId: job.customer_id,
      dueDate: job.due_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedDuration: Math.ceil(operations.reduce((sum: number, op: any) => sum + op.estimatedDuration, 0) / 60),
      operations,
      priorityLevel: priorityLevel,
      quantity: job.quantity || 1
    }

    // Generate scheduling suggestions
    const schedulingSuggestion = await schedulingEngine.generateSchedulingSuggestions(jobData)

    // Clear existing schedule if force rescheduling
    if (forceReschedule && existingSchedule && existingSchedule.length > 0) {
      await supabase
        .from('scheduled_operations')
        .delete()
        .eq('job_id', jobId)
        .eq('tenant_id', user.tenant_id)
    }

    // Create new scheduled operations
    const scheduledOperationsData = schedulingSuggestion.workCenterAssignments.map(assignment => ({
      tenant_id: user.tenant_id,
      job_id: job.id,
      operation_id: job.job_operations.find((op: any) => op.operation_name === assignment.operationName)?.id,
      work_center_id: assignment.workCenterId,
      scheduled_start: assignment.scheduledStart.toISOString(),
      scheduled_end: assignment.scheduledEnd.toISOString(),
      estimated_duration: assignment.estimatedDuration,
      status: 'scheduled',
      notes: assignment.estimatedDuration > 0 ? `Auto-scheduled with confidence: ${schedulingSuggestion.confidenceScore}%` : null
    }))

    const { data: newSchedule, error: insertError } = await supabase
      .from('scheduled_operations')
      .insert(scheduledOperationsData.filter(data => data.operation_id))
      .select(`
        *,
        job_operations (operation_name),
        work_centers (name)
      `)

    if (insertError) {
      console.error('Error creating scheduled operations:', insertError)
      return NextResponse.json({ 
        error: 'Failed to create schedule: ' + insertError.message 
      }, { status: 500 })
    }

    // Update job status if it's still pending
    if (job.status === 'pending') {
      await supabase
        .from('jobs')
        .update({ status: 'scheduled' })
        .eq('id', jobId)
    }

    // Log scheduling event
    await supabase
      .from('system_events')
      .insert({
        tenant_id: user.tenant_id,
        event_type: forceReschedule ? 'job_rescheduled' : 'job_scheduled',
        event_data: {
          job_id: job.id,
          job_number: job.job_number,
          operations_count: operations.length,
          confidence_score: schedulingSuggestion.confidenceScore,
          conflicts: schedulingSuggestion.conflictWarnings.length,
          force_reschedule: forceReschedule
        },
        user_id: user.id
      })

    return NextResponse.json({
      message: `Successfully ${forceReschedule ? 'rescheduled' : 'scheduled'} job ${job.job_number}`,
      schedule: newSchedule,
      suggestion: {
        confidenceScore: schedulingSuggestion.confidenceScore,
        conflictWarnings: schedulingSuggestion.conflictWarnings,
        optimizationNotes: schedulingSuggestion.optimizationNotes
      },
      isExisting: false
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobId = params.id

    // Validate UUID format
    if (!isUUID(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID format' }, { status: 400 })
    }

    // Get current schedule for the job
    const { data: schedule, error: scheduleError } = await supabase
      .from('scheduled_operations')
      .select(`
        *,
        job_operations (
          operation_name,
          sequence_order
        ),
        work_centers (
          name,
          max_capacity
        )
      `)
      .eq('job_id', jobId)
      .eq('tenant_id', user.tenant_id)
      .order('scheduled_start', { ascending: true })

    if (scheduleError) {
      console.error('Database error fetching schedule:', scheduleError)
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 })
    }

    return NextResponse.json({
      schedule: schedule || [],
      hasSchedule: schedule && schedule.length > 0
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobId = params.id

    // Validate UUID format
    if (!isUUID(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID format' }, { status: 400 })
    }

    // Delete all scheduled operations for this job
    const { error: deleteError } = await supabase
      .from('scheduled_operations')
      .delete()
      .eq('job_id', jobId)
      .eq('tenant_id', user.tenant_id)

    if (deleteError) {
      console.error('Error deleting schedule:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to delete schedule: ' + deleteError.message 
      }, { status: 500 })
    }

    // Update job status back to pending if it was scheduled
    const { data: job } = await supabase
      .from('jobs')
      .select('status, job_number')
      .eq('id', jobId)
      .eq('tenant_id', user.tenant_id)
      .single()

    if (job && job.status === 'scheduled') {
      await supabase
        .from('jobs')
        .update({ status: 'pending' })
        .eq('id', jobId)
    }

    // Log unscheduling event
    await supabase
      .from('system_events')
      .insert({
        tenant_id: user.tenant_id,
        event_type: 'job_unscheduled',
        event_data: {
          job_id: jobId,
          job_number: job?.job_number || 'Unknown'
        },
        user_id: user.id
      })

    return NextResponse.json({
      message: 'Successfully removed schedule for job'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}
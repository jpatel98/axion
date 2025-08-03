import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { validate as isUUID } from 'uuid'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Validate UUID format
    if (!isUUID(id)) {
      return NextResponse.json({ error: 'Invalid job ID format' }, { status: 400 })
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)
      .single()

    if (error) {
      logger.error('Database error fetching job', {
        userId: user.id,
        tenantId: user.tenant_id,
        jobId: id,
        error: error.message
      })
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 })
    }
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    logger.error('API Error in job GET', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'GET'
    })
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
      return NextResponse.json({ error: 'Invalid job ID format' }, { status: 400 })
    }

    const body = await request.json()
    const {
      job_number,
      customer_name,
      part_number,
      description,
      quantity,
      estimated_cost,
      status,
      due_date
    } = body

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['pending', 'in_progress', 'completed', 'shipped']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
      }
    }

    // Validate data types
    if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
      return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 })
    }

    if (estimated_cost !== undefined && (typeof estimated_cost !== 'number' || estimated_cost < 0)) {
      return NextResponse.json({ error: 'Estimated cost must be a positive number' }, { status: 400 })
    }

    // Validate job_number format if provided
    if (job_number !== undefined && (typeof job_number !== 'string' || job_number.length > 100)) {
      return NextResponse.json({ error: 'Invalid job number format' }, { status: 400 })
    }

    // If job_number is being changed, check for duplicates
    if (job_number !== undefined) {
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('id')
        .eq('tenant_id', user.tenant_id)
        .eq('job_number', job_number)
        .neq('id', id)
        .single()

      if (existingJob) {
        return NextResponse.json({ error: 'A job with this job number already exists' }, { status: 409 })
      }
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .update({
        job_number,
        customer_name,
        part_number,
        description,
        quantity,
        estimated_cost,
        status,
        due_date
      })
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)
      .select()
      .single()

    if (error) {
      logger.error('Database error updating job', {
        userId: user.id,
        tenantId: user.tenant_id,
        jobId: id,
        error: error.message,
        updateData: { job_number, customer_name, part_number, status }
      })
      return NextResponse.json({ 
        error: 'Failed to update job: ' + (error.message || 'Unknown database error') 
      }, { status: 500 })
    }
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    logger.error('API Error in job PUT', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'PUT'
    })
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
      return NextResponse.json({ error: 'Invalid job ID format' }, { status: 400 })
    }

    // Check if job exists first
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)
      .single()

    if (fetchError) {
      logger.error('Database error fetching job for delete', {
        userId: user.id,
        tenantId: user.tenant_id,
        jobId: id,
        error: fetchError.message
      })
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 })
    }

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)

    if (error) {
      logger.error('Error deleting job', {
        userId: user.id,
        tenantId: user.tenant_id,
        jobId: id,
        error: error.message
      })
      return NextResponse.json({ 
        error: 'Failed to delete job: ' + (error.message || 'Unknown database error') 
      }, { status: 500 })
    }

    return NextResponse.json({ message: 'Job deleted successfully' })
  } catch (error) {
    logger.error('API Error in job DELETE', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'DELETE'
    })
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}
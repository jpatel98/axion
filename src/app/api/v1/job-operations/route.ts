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
    const jobId = searchParams.get('job_id')

    let query = supabase
      .from('job_operations')
      .select(`
        *,
        jobs!inner(
          job_number,
          customer_name,
          description
        ),
        work_centers(
          name,
          machine_type
        )
      `)
      .eq('tenant_id', user.tenant_id)

    // Filter by job if provided
    if (jobId) {
      query = query.eq('job_id', jobId)
    }

    const { data: jobOperations, error } = await query.order('operation_number')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch job operations' }, { status: 500 })
    }

    return NextResponse.json({ jobOperations })
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
      job_id, 
      operation_number, 
      name, 
      description, 
      estimated_hours, 
      work_center_id,
      required_skills,
      priority
    } = body

    // Validation
    if (!job_id || !operation_number || !name || !estimated_hours) {
      return NextResponse.json({ 
        error: 'Missing required fields: job_id, operation_number, name, estimated_hours' 
      }, { status: 400 })
    }

    // Create job operation
    const { data: jobOperation, error } = await supabase
      .from('job_operations')
      .insert({
        tenant_id: user.tenant_id,
        job_id,
        operation_number,
        name: name.trim(),
        description: description?.trim() || null,
        estimated_hours: parseFloat(estimated_hours),
        work_center_id: work_center_id || null,
        required_skills: required_skills || [],
        priority: priority || 1
      })
      .select(`
        *,
        jobs!inner(
          job_number,
          customer_name,
          description
        ),
        work_centers(
          name,
          machine_type
        )
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        error: 'Failed to create job operation', 
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    return NextResponse.json({ jobOperation }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
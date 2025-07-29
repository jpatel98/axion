import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      console.log('No user found - user might not be synced yet')
      return NextResponse.json({ error: 'User not found. Please refresh the page.' }, { status: 404 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Calculate offset
    const offset = (page - 1) * pageSize

    // Build query
    let query = supabase
      .from('jobs')
      .select('id, job_number, customer_name, part_number, description, quantity, estimated_cost, actual_cost, status, due_date, created_at, updated_at', { count: 'exact' })
      .eq('tenant_id', user.tenant_id)

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`job_number.ilike.%${search}%,customer_name.ilike.%${search}%,part_number.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1)

    const { data: jobs, error: jobsError, count } = await query

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError)
      return NextResponse.json({ error: 'Failed to fetch jobs: ' + jobsError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      jobs: jobs || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
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
      job_number, 
      customer_name, 
      part_number, 
      description, 
      quantity, 
      estimated_cost, 
      due_date 
    } = body

    // Validate required fields
    if (!job_number) {
      return NextResponse.json({ error: 'Job number is required' }, { status: 400 })
    }

    // Create the job with explicit tenant_id
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        tenant_id: user.tenant_id,
        job_number,
        customer_name,
        part_number,
        description,
        quantity: quantity || 1,
        estimated_cost,
        due_date,
        status: 'pending'
      })
      .select()
      .single()

    if (jobError) {
      console.error('Error creating job:', jobError)
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
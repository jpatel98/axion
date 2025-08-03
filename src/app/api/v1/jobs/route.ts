import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withPermission } from '@/lib/api-auth'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export const GET = withAuth(async (user, request: NextRequest) => {

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Validate page and pageSize
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 })
    }

    // Calculate offset
    const offset = (page - 1) * pageSize

    // Build query
    let query = supabase
      .from('jobs')
      .select('id, job_number, customer_name, part_number, description, quantity, estimated_cost, actual_cost, status, due_date, created_at, updated_at', { count: 'exact' })
      .eq('tenant_id', user.tenant_id)

    // Apply filters
    if (status && status !== 'all') {
      // Validate status value
      const validStatuses = ['pending', 'in_progress', 'completed', 'shipped']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 })
      }
      query = query.eq('status', status)
    }

    if (search) {
      // Validate search string
      if (search.length > 100) {
        return NextResponse.json({ error: 'Search term too long' }, { status: 400 })
      }
      // Use full-text search if available, otherwise fallback to ilike
      // First check if the search_vector column exists
      const { data: vectorCheck } = await supabase
        .from('jobs')
        .select('search_vector')
        .limit(1)
      
      if (vectorCheck && vectorCheck.length > 0 && 'search_vector' in vectorCheck[0]) {
        // Use full-text search
        query = query.textSearch('search_vector', search, {
          type: 'websearch'
        })
      } else {
        // Fallback to ilike search - escape special characters to prevent SQL injection
        const escapedSearch = search.replace(/[%_\\]/g, '\\$&')
        query = query.or(`job_number.ilike.%${escapedSearch}%,customer_name.ilike.%${escapedSearch}%,part_number.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%`)
      }
    }

    // Apply sorting (validate sort field)
    const validSortFields = ['id', 'job_number', 'customer_name', 'part_number', 'description', 'quantity', 'estimated_cost', 'actual_cost', 'status', 'due_date', 'created_at', 'updated_at']
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json({ error: 'Invalid sort field' }, { status: 400 })
    }
    
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1)

    const { data: jobs, error: jobsError, count } = await query

    if (jobsError) {
      logger.error('Error fetching jobs', { 
        userId: user.id, 
        tenantId: user.tenant_id,
        error: jobsError.message,
        method: 'GET',
        url: '/api/v1/jobs'
      })
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
})

export const POST = withPermission('canCreateJobs', async (user, request: NextRequest) => {

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

    // Validate data types
    if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
      return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 })
    }

    if (estimated_cost !== undefined && (typeof estimated_cost !== 'number' || estimated_cost < 0)) {
      return NextResponse.json({ error: 'Estimated cost must be a positive number' }, { status: 400 })
    }

    // Validate job_number format (alphanumeric with dashes/underscores)
    if (typeof job_number !== 'string' || job_number.length > 100) {
      return NextResponse.json({ error: 'Invalid job number format' }, { status: 400 })
    }

    // Check for duplicate job number within tenant
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('id')
      .eq('tenant_id', user.tenant_id)
      .eq('job_number', job_number)
      .single()

    if (existingJob) {
      return NextResponse.json({ error: 'A job with this job number already exists' }, { status: 409 })
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
      logger.error('Error creating job', { 
        userId: user.id, 
        tenantId: user.tenant_id,
        error: jobError.message,
        jobNumber: job_number,
        method: 'POST',
        url: '/api/v1/jobs'
      })
      return NextResponse.json({ 
        error: 'Failed to create job: ' + (jobError.message || 'Unknown database error') 
      }, { status: 500 })
    }

    return NextResponse.json({ job }, { status: 201 })
})
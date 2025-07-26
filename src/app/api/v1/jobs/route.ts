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

    console.log('User found:', { id: user.id, tenant_id: user.tenant_id })

    // Get jobs for the user's tenant
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .order('created_at', { ascending: false })

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError)
      return NextResponse.json({ error: 'Failed to fetch jobs: ' + jobsError.message }, { status: 500 })
    }

    console.log('Jobs fetched successfully:', jobs?.length || 0)
    return NextResponse.json({ jobs: jobs || [] })
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
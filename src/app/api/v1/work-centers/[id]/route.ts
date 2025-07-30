import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Await params
    const { id } = await params

    // Get work center
    const { data: workCenter, error } = await supabase
      .from('work_centers')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Work center not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch work center' }, { status: 500 })
    }

    return NextResponse.json({ workCenter })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Await params
    const { id } = await params

    // Parse request body
    const body = await request.json()
    const { name, description, machine_type, capacity_hours_per_day, is_active } = body

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Update work center
    const { data: workCenter, error } = await supabase
      .from('work_centers')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        machine_type: machine_type?.trim() || null,
        capacity_hours_per_day: capacity_hours_per_day || 8.0,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Work center not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update work center' }, { status: 500 })
    }

    return NextResponse.json({ workCenter })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const { success } = await rateLimit(request, { interval: 60000, maxRequests: 10 })
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params
    const { id } = await params

    // Check if work center is referenced by any job operations
    const { data: referencedOperations, error: checkError } = await supabase
      .from('job_operations')
      .select('id')
      .eq('work_center_id', id)
      .eq('tenant_id', user.tenant_id)
      .limit(1)

    if (checkError) {
      console.error('Database error checking references:', checkError)
      return NextResponse.json({ error: 'Failed to check work center references' }, { status: 500 })
    }

    if (referencedOperations && referencedOperations.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete work center that is referenced by job operations. Please reassign or remove the operations first.' 
      }, { status: 400 })
    }

    // Check if work center is referenced by any scheduled operations
    const { data: referencedScheduled, error: checkScheduledError } = await supabase
      .from('scheduled_operations')
      .select('id')
      .eq('work_center_id', id)
      .eq('tenant_id', user.tenant_id)
      .limit(1)

    if (checkScheduledError) {
      console.error('Database error checking scheduled references:', checkScheduledError)
      return NextResponse.json({ error: 'Failed to check work center references' }, { status: 500 })
    }

    if (referencedScheduled && referencedScheduled.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete work center that has scheduled operations. Please reschedule or remove the operations first.' 
      }, { status: 400 })
    }

    // Delete work center
    const { error: deleteError } = await supabase
      .from('work_centers')
      .delete()
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete work center' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Work center deleted successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
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

    // Get work centers
    const { data: workCenters, error } = await supabase
      .from('work_centers')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch work centers' }, { status: 500 })
    }

    return NextResponse.json({ workCenters })
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
    const { name, description, machine_type, capacity_hours_per_day } = body

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Create work center
    const { data: workCenter, error } = await supabase
      .from('work_centers')
      .insert({
        tenant_id: user.tenant_id,
        name: name.trim(),
        description: description?.trim() || null,
        machine_type: machine_type?.trim() || null,
        capacity_hours_per_day: capacity_hours_per_day || 8.0
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create work center' }, { status: 500 })
    }

    return NextResponse.json({ workCenter }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
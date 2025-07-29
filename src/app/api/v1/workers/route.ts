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

    // Get workers
    const { data: workers, error } = await supabase
      .from('workers')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 })
    }

    return NextResponse.json({ workers })
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
    const { name, email, skills, hourly_rate } = body

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Create worker
    const { data: worker, error } = await supabase
      .from('workers')
      .insert({
        tenant_id: user.tenant_id,
        name: name.trim(),
        email: email?.trim() || null,
        skills: skills || [],
        hourly_rate: hourly_rate || null
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create worker' }, { status: 500 })
    }

    return NextResponse.json({ worker }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
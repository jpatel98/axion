import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase'

export const GET = withAuth(async (user) => {
  try {
    // Get tenant information
    const { data: tenant, error } = await supabaseAdmin
      .from('tenants')
      .select('id, name, slug')
      .eq('id', user.tenant_id)
      .single()

    if (error || !tenant) {
      console.error('Error fetching tenant:', error)
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({
      name: tenant.name,
      code: tenant.slug.toUpperCase(),
      id: tenant.id
    })
  } catch (error) {
    console.error('Company info API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
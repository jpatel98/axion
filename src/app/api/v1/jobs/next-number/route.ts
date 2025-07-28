import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the latest job number for this tenant
    const { data: latestJob, error: jobError } = await supabase
      .from('jobs')
      .select('job_number')
      .eq('tenant_id', user.tenant_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let nextNumber = 1

    if (latestJob && !jobError) {
      // Extract number from job_number (assuming format like JOB-001, J001, etc.)
      const match = latestJob.job_number.match(/(\d+)/)
      if (match) {
        const currentNumber = parseInt(match[1], 10)
        nextNumber = currentNumber + 1
      }
    }

    // Format with leading zeros (3 digits)
    const formattedNumber = `JOB-${nextNumber.toString().padStart(3, '0')}`

    return NextResponse.json({ next_job_number: formattedNumber })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
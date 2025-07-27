import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the latest quote number for this tenant
    const { data: latestQuote, error: quoteError } = await supabase
      .from('quotes')
      .select('quote_number')
      .eq('tenant_id', user.tenant_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let nextNumber = 1

    if (latestQuote && !quoteError) {
      // Extract number from quote_number (assuming format like QUO-001, Q001, etc.)
      const match = latestQuote.quote_number.match(/(\d+)/)
      if (match) {
        const currentNumber = parseInt(match[1], 10)
        nextNumber = currentNumber + 1
      }
    }

    // Format with leading zeros (3 digits)
    const formattedNumber = `QUO-${nextNumber.toString().padStart(3, '0')}`

    return NextResponse.json({ next_quote_number: formattedNumber })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
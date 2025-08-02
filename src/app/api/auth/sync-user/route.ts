import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { UserRole } from '@/lib/types/roles'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get full user details from Clerk
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already exists in our database
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (existingUser) {
      // User already exists, just return
      return NextResponse.json({ user: existingUser, status: 'existing' })
    }

    // New user - return that they need onboarding
    return NextResponse.json({ 
      user: null, 
      status: 'needs_onboarding',
      clerk_user: {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        first_name: clerkUser.firstName || '',
        last_name: clerkUser.lastName || ''
      }
    })

  } catch (error) {
    console.error('User sync error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}
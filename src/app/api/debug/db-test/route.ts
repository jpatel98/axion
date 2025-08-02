import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { UserRole } from '@/lib/types/roles'

export async function GET() {
  try {
    const results: any = {
      success: true,
      tests: {},
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      }
    }

    // Test 1: Basic connection
    console.log('Testing database connection...')
    try {
      const { data: connectionTest, error: connectionError } = await supabase
        .from('tenants')
        .select('count(*)')
        .limit(1)

      results.tests.connection = {
        success: !connectionError,
        result: connectionTest,
        error: connectionError?.message || null
      }

      if (connectionError) {
        return NextResponse.json({
          success: false,
          test: 'connection',
          error: connectionError.message,
          details: connectionError
        })
      }
    } catch (err) {
      results.tests.connection = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }

    // Test 2: Check users table
    try {
      const { data: usersTest, error: usersError } = await supabase
        .from('users')
        .select('role')
        .limit(1)

      results.tests.usersTable = {
        success: !usersError,
        result: usersTest,
        error: usersError?.message || null
      }
    } catch (err) {
      results.tests.usersTable = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }

    // Test 3: Current user
    try {
      const { userId } = await auth()
      let userTest = null
      let userError = null

      if (userId) {
        const { data: userData, error: userFetchError } = await supabase
          .from('users')
          .select('id, email, role, tenant_id')
          .eq('clerk_user_id', userId)
          .single()

        userTest = userData
        userError = userFetchError
      }

      results.tests.currentUser = {
        clerkUserId: userId,
        dbUser: userTest,
        error: userError?.message || null,
        validRoles: Object.values(UserRole)
      }
    } catch (err) {
      results.tests.currentUser = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
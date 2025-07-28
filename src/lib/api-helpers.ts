import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

export interface ApiError {
  message: string
  code?: string
  statusCode: number
}

export class ApiErrorClass extends Error {
  statusCode: number
  code?: string

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'ApiError'
  }
}

export function withErrorHandling(
  handler: (request: NextRequest, params?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: { params: any }) => {
    try {
      // Rate limiting
      const { success } = await rateLimit(request)
      if (!success) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        )
      }

      return await handler(request, context?.params)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof ApiErrorClass) {
        return NextResponse.json(
          { 
            error: error.message,
            code: error.code 
          },
          { status: error.statusCode }
        )
      }

      // Handle Supabase errors
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as any
        if (supabaseError.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Resource not found' },
            { status: 404 }
          )
        }
        if (supabaseError.code === '23505') {
          return NextResponse.json(
            { error: 'Duplicate entry' },
            { status: 409 }
          )
        }
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

export async function withAuth(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    throw new ApiErrorClass('Unauthorized', 401)
  }
  return user
}

export function validateRequired(data: any, fields: string[]) {
  const missing = fields.filter(field => !data[field])
  if (missing.length > 0) {
    throw new ApiErrorClass(
      `Missing required fields: ${missing.join(', ')}`,
      400,
      'VALIDATION_ERROR'
    )
  }
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}
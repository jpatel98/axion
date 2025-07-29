import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/operator(.*)',
  '/admin(.*)',
  '/api/v1(.*)',
])

const isApiRoute = createRouteMatcher(['/api/(.*)'])

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Add security headers
  const response = NextResponse.next()
  
  // Security headers for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://clerk.axiontechnologies.ca https://accounts.axiontechnologies.ca; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.clerk.accounts.dev https://clerk.axiontechnologies.ca https://accounts.axiontechnologies.ca https://*.supabase.co wss://*.supabase.co; frame-src https://challenges.cloudflare.com https://*.clerk.accounts.dev https://clerk.axiontechnologies.ca https://accounts.axiontechnologies.ca;"
    )
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()'
    )
  }

  // Rate limiting for API routes
  if (isApiRoute(request)) {
    const { success, remaining } = await rateLimit(request, {
      interval: 60000, // 1 minute
      maxRequests: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '60')
    })

    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    
    if (!success) {
      return new NextResponse('Rate limit exceeded', { 
        status: 429,
        headers: response.headers 
      })
    }
  }

  // Protect routes
  if (isProtectedRoute(request)) {
    await auth.protect()
  }

  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
import { NextRequest } from 'next/server'

interface RateLimitConfig {
  interval: number // in milliseconds
  maxRequests: number
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = { interval: 60000, maxRequests: 60 }
): Promise<{ success: boolean; remaining: number }> {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const key = `${ip}:${request.nextUrl.pathname}`
  const now = Date.now()
  
  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.interval
    })
    return { success: true, remaining: config.maxRequests - 1 }
  }
  
  if (record.count >= config.maxRequests) {
    return { success: false, remaining: 0 }
  }
  
  record.count++
  return { success: true, remaining: config.maxRequests - record.count }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60000) // Clean up every minute
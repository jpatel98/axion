import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { UserRole, hasAnyPermission } from '@/lib/types/roles'

export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/user-role`, {
      headers: {
        'Authorization': `Bearer ${userId}`,
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.role || UserRole.OPERATOR
    }
  } catch (error) {
    console.error('Error fetching user role:', error)
  }
  
  return UserRole.OPERATOR // Default to operator
}

export function createRoleBasedMiddleware(routeConfig: Record<string, { roles?: UserRole[], permissions?: string[] }>) {
  return async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for public routes
    const publicRoutes = ['/', '/sign-in', '/sign-up', '/api/webhook']
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    try {
      const { userId } = await auth()

      if (!userId) {
        // Redirect to sign-in if not authenticated
        return NextResponse.redirect(new URL('/sign-in', request.url))
      }

      // Check route-specific access
      const matchedRoute = Object.keys(routeConfig).find(route => 
        pathname.startsWith(route)
      )

      if (matchedRoute) {
        const config = routeConfig[matchedRoute]
        const userRole = await getUserRole(userId)

        // Check role-based access
        if (config.roles && !config.roles.includes(userRole)) {
          // Redirect to appropriate dashboard based on role
          const redirectPath = userRole === UserRole.OPERATOR ? '/dashboard/operator' : '/dashboard'
          return NextResponse.redirect(new URL(redirectPath, request.url))
        }
      }

      return NextResponse.next()
    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }
}
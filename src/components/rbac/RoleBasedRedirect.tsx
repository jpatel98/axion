'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/hooks/useUserRole'
import { UserRole } from '@/lib/types/roles'
import { Loader2 } from 'lucide-react'

export function RoleBasedRedirect() {
  const { user, loading } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === UserRole.OPERATOR) {
        router.push('/dashboard/operator')
      }
      // Managers stay on main dashboard
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return null // Will redirect automatically
}
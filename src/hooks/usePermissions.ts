'use client'

import { useUserRole } from './useUserRole'
import { UserRole, hasPermission, hasAnyPermission, RolePermissions } from '@/lib/types/roles'

export function usePermission(permission: keyof RolePermissions) {
  const { user } = useUserRole()
  
  if (!user) return false
  
  return hasPermission(user.role, permission)
}

export function useAnyPermission(permissions: (keyof RolePermissions)[]) {
  const { user } = useUserRole()
  
  if (!user) return false
  
  return hasAnyPermission(user.role, permissions)
}

export function useIsManager() {
  const { user } = useUserRole()
  return user?.role === UserRole.MANAGER
}

export function useIsOperator() {
  const { user } = useUserRole()
  return user?.role === UserRole.OPERATOR
}
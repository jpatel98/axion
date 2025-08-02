'use client'

import React from 'react'
import { usePermission, useAnyPermission, useIsManager, useIsOperator } from '@/hooks/useUserRole'
import { UserRole, RolePermissions } from '@/lib/types/roles'

interface PermissionGateProps {
  permission?: keyof RolePermissions
  anyPermissions?: (keyof RolePermissions)[]
  role?: UserRole
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({
  permission,
  anyPermissions,
  role,
  fallback = null,
  children,
}: PermissionGateProps) {
  const hasSinglePermission = usePermission(permission!)
  const hasAnyPermissions = useAnyPermission(anyPermissions || [])
  const isManager = useIsManager()
  const isOperator = useIsOperator()

  let hasAccess = true

  // Check role-based access
  if (role === UserRole.MANAGER && !isManager) {
    hasAccess = false
  }
  if (role === UserRole.OPERATOR && !isOperator) {
    hasAccess = false
  }

  // Check permission-based access
  if (permission && !hasSinglePermission) {
    hasAccess = false
  }

  if (anyPermissions && anyPermissions.length > 0 && !hasAnyPermissions) {
    hasAccess = false
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Convenience components
export function ManagerOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate role={UserRole.MANAGER} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function OperatorOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate role={UserRole.OPERATOR} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}
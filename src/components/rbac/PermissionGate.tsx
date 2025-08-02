'use client'

import React from 'react'
import { useUserRole } from '@/hooks/useUserRole'
import { UserRole, RolePermissions, hasPermission, hasAnyPermission } from '@/lib/types/roles'

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
  const { user, loading } = useUserRole()

  // Show fallback while loading
  if (loading) {
    return <>{fallback}</>
  }

  // Show fallback if no user
  if (!user) {
    return <>{fallback}</>
  }

  let hasAccess = true

  // Check role-based access
  if (role && user.role !== role) {
    hasAccess = false
  }

  // Check permission-based access
  if (permission && !hasPermission(user.role, permission)) {
    hasAccess = false
  }

  if (anyPermissions && anyPermissions.length > 0 && !hasAnyPermission(user.role, anyPermissions)) {
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
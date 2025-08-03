'use client'

import React, { useState, useEffect } from 'react'
import { useUserRole } from '@/hooks/useUserRole'
import { UserRole, RolePermissions, hasPermission, hasAnyPermission } from '@/lib/types/roles'
import { ContentSkeleton } from '@/components/ui/skeleton'

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
  const { user, loading } = useUserRole()
  const [showFallback, setShowFallback] = useState(false)

  // If user doesn't have access, wait a moment before showing fallback to prevent flash
  useEffect(() => {
    if (!loading && (!user || user.role !== UserRole.MANAGER)) {
      const timer = setTimeout(() => setShowFallback(true), 50) // Reduced from 100ms to 50ms
      return () => clearTimeout(timer)
    } else if (user && user.role === UserRole.MANAGER) {
      setShowFallback(false)
    }
  }, [loading, user])

  // Show loading skeleton while authentication is being checked
  if (loading) {
    return <ContentSkeleton type="dashboard" />
  }

  // If user doesn't have access and we haven't waited long enough, show loading
  if (!loading && (!user || user.role !== UserRole.MANAGER) && !showFallback) {
    return <ContentSkeleton type="dashboard" />
  }

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
  const { user, loading } = useUserRole()
  const [showFallback, setShowFallback] = useState(false)

  // If user doesn't have access, wait a moment before showing fallback to prevent flash
  useEffect(() => {
    if (!loading && (!user || user.role !== UserRole.OPERATOR)) {
      const timer = setTimeout(() => setShowFallback(true), 50) // Reduced from 100ms to 50ms
      return () => clearTimeout(timer)
    } else if (user && user.role === UserRole.OPERATOR) {
      setShowFallback(false)
    }
  }, [loading, user])

  // Show loading skeleton while authentication is being checked
  if (loading) {
    return <ContentSkeleton type="dashboard" />
  }

  // If user doesn't have access and we haven't waited long enough, show loading
  if (!loading && (!user || user.role !== UserRole.OPERATOR) && !showFallback) {
    return <ContentSkeleton type="dashboard" />
  }

  return (
    <PermissionGate role={UserRole.OPERATOR} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}
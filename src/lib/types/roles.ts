/**
 * Role-based access control (RBAC) types and utilities
 */

export enum UserRole {
  MANAGER = 'manager',
  OPERATOR = 'operator'
}

export interface RolePermissions {
  // Dashboard access
  canViewDashboard: boolean
  canViewAnalytics: boolean
  
  // User management
  canManageUsers: boolean
  canViewUsers: boolean
  
  // Production management
  canManageProduction: boolean
  canViewProduction: boolean
  canCreateJobs: boolean
  canUpdateJobs: boolean
  
  // Quality control
  canManageQuality: boolean
  canViewQuality: boolean
  
  // Inventory management
  canManageInventory: boolean
  canViewInventory: boolean
  
  // Reporting
  canViewReports: boolean
  canExportReports: boolean
  
  // System settings
  canManageSettings: boolean
  canViewSettings: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.MANAGER]: {
    canViewDashboard: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canViewUsers: true,
    canManageProduction: true,
    canViewProduction: true,
    canCreateJobs: true,
    canUpdateJobs: true,
    canManageQuality: true,
    canViewQuality: true,
    canManageInventory: true,
    canViewInventory: true,
    canViewReports: true,
    canExportReports: true,
    canManageSettings: true,
    canViewSettings: true,
  },
  [UserRole.OPERATOR]: {
    canViewDashboard: true,
    canViewAnalytics: false,
    canManageUsers: false,
    canViewUsers: false,
    canManageProduction: false,
    canViewProduction: true,
    canCreateJobs: false,
    canUpdateJobs: true, // Can update status
    canManageQuality: false,
    canViewQuality: true,
    canManageInventory: false,
    canViewInventory: true,
    canViewReports: true, // Limited reports
    canExportReports: false,
    canManageSettings: false,
    canViewSettings: false,
  },
}

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role][permission]
}

export function hasAnyPermission(role: UserRole, permissions: (keyof RolePermissions)[]): boolean {
  return permissions.some(permission => hasPermission(role, permission))
}
/**
 * Skeleton loading components for consistent loading states
 */

import React from 'react'
import { cn } from '@/lib/utils'

// Base skeleton component
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded-md',
        className
      )}
      {...props}
    />
  )
}

// Card skeleton for grid layouts
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-white rounded-lg p-6 shadow-sm ring-1 ring-gray-900/5', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      
      <div className="space-y-3">
        <div>
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-4 w-full" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between">
            <div>
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div>
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Table skeleton for data tables
export const TableSkeleton: React.FC<{ 
  rows?: number
  columns?: number
  showSearch?: boolean
  className?: string 
}> = ({ 
  rows = 5, 
  columns = 6, 
  showSearch = true,
  className 
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {showSearch && (
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-4 w-24" />
        </div>
      )}
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <Skeleton className={cn(
                        'h-4',
                        colIndex === 0 ? 'w-24' : 
                        colIndex === columns - 1 ? 'w-16' : 
                        'w-20'
                      )} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}

// Form skeleton for forms
export const FormSkeleton: React.FC<{ 
  fields?: number
  columns?: 1 | 2
  showButtons?: boolean
  className?: string 
}> = ({ 
  fields = 6, 
  columns = 2,
  showButtons = true,
  className 
}) => {
  const fieldsPerRow = columns
  const rows = Math.ceil(fields / fieldsPerRow)
  
  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className={cn(
              'grid gap-4',
              columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            )}
          >
            {Array.from({ length: Math.min(fieldsPerRow, fields - rowIndex * fieldsPerRow) }).map((_, colIndex) => (
              <div key={colIndex} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ))}
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      
      {showButtons && (
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      )}
    </div>
  )
}

// Page header skeleton
export const PageHeaderSkeleton: React.FC<{ 
  showButton?: boolean
  showDescription?: boolean
  className?: string 
}> = ({ 
  showButton = true, 
  showDescription = true,
  className 
}) => {
  return (
    <div className={cn('mb-8 flex items-center justify-between', className)}>
      <div>
        <Skeleton className="h-8 w-40 mb-2" />
        {showDescription && <Skeleton className="h-4 w-80" />}
      </div>
      {showButton && (
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-10 w-24" />
        </div>
      )}
    </div>
  )
}

// Dashboard stats skeleton
export const StatsSkeleton: React.FC<{ 
  count?: number
  className?: string 
}> = ({ 
  count = 4,
  className 
}) => {
  return (
    <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Skeleton className="w-8 h-8 rounded-md" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// List item skeleton
export const ListItemSkeleton: React.FC<{ 
  showAvatar?: boolean
  showMeta?: boolean
  className?: string 
}> = ({ 
  showAvatar = false, 
  showMeta = true,
  className 
}) => {
  return (
    <div className={cn('flex items-center space-x-4 p-4', className)}>
      {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        {showMeta && <Skeleton className="h-3 w-32" />}
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

// Content skeleton for full page loading
export const ContentSkeleton: React.FC<{ 
  type?: 'dashboard' | 'list' | 'form' | 'table'
  className?: string 
}> = ({ 
  type = 'list',
  className 
}) => {
  switch (type) {
    case 'dashboard':
      return (
        <div className={cn('space-y-6', className)}>
          <PageHeaderSkeleton showButton={false} />
          <StatsSkeleton />
          <div className="bg-white shadow rounded-lg p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      )
    
    case 'table':
      return (
        <div className={cn('space-y-6', className)}>
          <PageHeaderSkeleton />
          <TableSkeleton />
        </div>
      )
    
    case 'form':
      return (
        <div className={cn('space-y-6', className)}>
          <PageHeaderSkeleton showButton={false} />
          <div className="max-w-2xl">
            <FormSkeleton />
          </div>
        </div>
      )
    
    case 'list':
    default:
      return (
        <div className={cn('space-y-6', className)}>
          <PageHeaderSkeleton />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      )
  }
}
/**
 * Server-side DataTable component optimized for performance
 * Handles pagination, sorting, and filtering on the server
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TableSkeleton } from './skeleton'
import { TableErrorBoundary } from './error-boundaries'
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

export interface ServerColumn<T> {
  key: keyof T | string
  title: string
  sortable?: boolean
  render?: (value: any, record: T, index: number) => React.ReactNode
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

export interface ServerDataTableProps<T> {
  data: T[]
  columns: ServerColumn<T>[]
  loading?: boolean
  
  // Pagination props
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  
  // Sorting props
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string, order: 'asc' | 'desc') => void
  
  // Search props
  searchValue?: string
  onSearch?: (value: string) => void
  searchPlaceholder?: string
  
  // Action props
  onRowClick?: (record: T, index: number) => void
  onEdit?: (record: T, index: number) => void
  onDelete?: (record: T, index: number) => void
  onView?: (record: T, index: number) => void
  showActions?: boolean
  
  className?: string
  emptyMessage?: React.ReactNode
}

export function ServerDataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortOrder = 'asc',
  onSort,
  searchValue = '',
  onSearch,
  searchPlaceholder = "Search...",
  onRowClick,
  onEdit,
  onDelete,
  onView,
  showActions = false,
  className,
  emptyMessage = "No data available",
}: ServerDataTableProps<T>) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const startRecord = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRecord = Math.min(currentPage * pageSize, totalItems)

  // Add actions column if needed
  const finalColumns = React.useMemo(() => {
    const cols = [...columns]
    if (showActions && (onEdit || onDelete || onView)) {
      cols.push({
        key: 'actions',
        title: 'Actions',
        align: 'center' as const,
        width: 140,
        render: (_, record: T, index: number) => (
          <div className="flex items-center justify-center gap-2">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onView(record, index)
                }}
                className="h-9 w-9 p-0"
              >
                <Eye className="h-5 w-5" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(record, index)
                }}
                className="h-9 w-9 p-0"
              >
                <Edit className="h-5 w-5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(record, index)
                }}
                className="h-9 w-9 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        )
      })
    }
    return cols
  }, [columns, showActions, onEdit, onDelete, onView])

  const handleSort = (columnKey: string) => {
    const column = finalColumns.find(col => col.key === columnKey)
    if (!column?.sortable || !onSort) return

    const newOrder = sortBy === columnKey && sortOrder === 'asc' ? 'desc' : 'asc'
    onSort(columnKey, newOrder)
  }

  const getSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) return null
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />
  }

  const getValue = (record: T, key: string | keyof T) => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], record)
    }
    return record[key]
  }

  if (loading) {
    return (
      <TableSkeleton 
        rows={pageSize} 
        columns={finalColumns.length}
        showSearch={!!onSearch}
        className={className}
      />
    )
  }

  return (
    <TableErrorBoundary>
      <div className={cn("space-y-4", className)}>
        {/* Search bar */}
        {onSearch && (
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500">
              {totalItems} {totalItems === 1 ? 'record' : 'records'}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {finalColumns.map((column) => (
                    <th
                      key={String(column.key)}
                      className={cn(
                        "px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider",
                        column.sortable && "cursor-pointer hover:bg-gray-100",
                        column.align === 'center' && "text-center",
                        column.align === 'right' && "text-right"
                      )}
                      style={{ width: column.width }}
                      onClick={() => column.sortable && handleSort(String(column.key))}
                    >
                      <div className="flex items-center gap-1">
                        {column.title}
                        {column.sortable && getSortIcon(String(column.key))}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={finalColumns.length} 
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  data.map((record, index) => (
                    <tr
                      key={index}
                      className={cn(
                        "hover:bg-gray-50 transition-colors",
                        onRowClick && "cursor-pointer"
                      )}
                      onClick={() => onRowClick?.(record, index)}
                    >
                      {finalColumns.map((column) => (
                        <td
                          key={String(column.key)}
                          className={cn(
                            "px-6 py-4 whitespace-nowrap text-sm",
                            column.align === 'center' && "text-center",
                            column.align === 'right' && "text-right"
                          )}
                        >
                          {column.render
                            ? column.render(getValue(record, column.key), record, index)
                            : String(getValue(record, column.key) || '')
                          }
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startRecord} to {endRecord} of {totalItems} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </TableErrorBoundary>
  )
}
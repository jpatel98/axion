'use client'

import { useState } from 'react'
import { X, Clock, User, Factory, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EventDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  operation: any // We'll type this properly later
}

export function EventDetailsModal({ isOpen, onClose, operation }: EventDetailsModalProps) {
  if (!isOpen || !operation) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'in_progress': return 'default' 
      case 'completed': return 'success'
      default: return 'secondary'
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const calculateDuration = () => {
    const start = new Date(operation.scheduled_start)
    const end = new Date(operation.scheduled_end)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return hours < 1 ? `${Math.round(hours * 60)}min` : `${hours}h`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-slate-800">Operation Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Job Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-800">
                {operation.job_operations.jobs.job_number}
              </h3>
              <Badge variant={getStatusColor(operation.job_operations.status)}>
                {operation.job_operations.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">
              {operation.job_operations.jobs.customer_name}
            </p>
            {operation.job_operations.jobs.description && (
              <p className="text-xs text-slate-500 mt-1">
                {operation.job_operations.jobs.description}
              </p>
            )}
          </div>

          {/* Operation Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Operation {operation.job_operations.operation_number}: {operation.job_operations.name}
                </p>
                <p className="text-xs text-slate-500">
                  Estimated: {operation.job_operations.estimated_hours}h
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Factory className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-800">{operation.work_centers.name}</p>
                {operation.work_centers.machine_type && (
                  <p className="text-xs text-slate-500">{operation.work_centers.machine_type}</p>
                )}
              </div>
            </div>

            {operation.workers && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-slate-500" />
                <p className="text-sm text-slate-800">{operation.workers.name}</p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-800">
                  {formatTime(operation.scheduled_start)} - {formatTime(operation.scheduled_end)}
                </p>
                <p className="text-xs text-slate-500">Duration: {calculateDuration()}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {operation.notes && (
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-slate-800 mb-1">Notes</h4>
              <p className="text-sm text-slate-600">{operation.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onClose}>
            View Job Details
          </Button>
        </div>
      </div>
    </div>
  )
}
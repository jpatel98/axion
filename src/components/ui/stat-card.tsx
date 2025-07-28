import React from 'react'
import { cn } from '@/lib/utils'
import { WidgetErrorBoundary } from './error-boundaries'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  iconBgColor: string
  className?: string
}

export const StatCard = React.memo(function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor,
  className
}: StatCardProps) {
  return (
    <WidgetErrorBoundary widgetName={title}>
      <div className={cn("bg-white overflow-hidden shadow rounded-lg", className)}>
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", iconBgColor)}>
                {icon}
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {title}
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {value}
                </dd>
                {subtitle && (
                  <dd className="text-xs text-gray-500">
                    {subtitle}
                  </dd>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </WidgetErrorBoundary>
  )
})
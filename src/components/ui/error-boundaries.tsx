/**
 * Specialized error boundaries for different parts of the application
 */

'use client'

import React from 'react'
import { ErrorBoundary, MinimalErrorFallback } from './error-boundary'
import { Button } from './button'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Page-level error boundary
export const PageErrorBoundary: React.FC<{ 
  children: React.ReactNode
  pageTitle?: string
}> = ({ children, pageTitle = "this page" }) => {
  const router = useRouter()

  const handleGoHome = () => {
    router.push('/dashboard')
  }

  const handleGoBack = () => {
    router.back()
  }

  const fallback = (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Unable to load {pageTitle}
        </h1>
        <p className="text-gray-900 mb-6">
          We encountered an error while loading this page. This might be due to a 
          temporary issue or a problem with your internet connection.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button 
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

// Form error boundary
export const FormErrorBoundary: React.FC<{ 
  children: React.ReactNode
  onReset?: () => void
}> = ({ children, onReset }) => {
  const fallback = (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Form Error
        </h3>
        <p className="text-sm text-red-600 mb-4">
          There was an error with this form. Please refresh the page and try again.
        </p>
        <div className="flex gap-2 justify-center">
          {onReset && (
            <Button onClick={onReset} size="sm" variant="outline">
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset Form
            </Button>
          )}
          <Button 
            onClick={() => window.location.reload()} 
            size="sm"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

// Data table error boundary
export const TableErrorBoundary: React.FC<{ 
  children: React.ReactNode
  onRetry?: () => void
}> = ({ children, onRetry }) => {
  const fallback = (
    <div className="border border-red-200 rounded-lg p-8 bg-red-50">
      <div className="text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Unable to load data
        </h3>
        <p className="text-sm text-red-600 mb-4">
          There was an error loading the table data. This might be due to a 
          network issue or server problem.
        </p>
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="outline">
            <RefreshCw className="h-3 w-3 mr-1" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

// Dashboard widget error boundary
export const WidgetErrorBoundary: React.FC<{ 
  children: React.ReactNode
  widgetName?: string
}> = ({ children, widgetName = "widget" }) => {
  const fallback = (
    <div className="bg-white border border-red-200 rounded-lg p-4">
      <div className="text-center">
        <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
        <p className="text-xs text-red-600">
          Error loading {widgetName}
        </p>
      </div>
    </div>
  )

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

// Navigation error boundary
export const NavigationErrorBoundary: React.FC<{ 
  children: React.ReactNode 
}> = ({ children }) => {
  const fallback = (
    <div className="bg-red-50 border-l-4 border-red-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            Navigation error - please refresh the page
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

// API operation error boundary
export const ApiErrorBoundary: React.FC<{ 
  children: React.ReactNode
  operation?: string
  onRetry?: () => void
}> = ({ children, operation = "operation", onRetry }) => {
  const fallback = (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            {operation} failed
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              The {operation} could not be completed. Please check your connection and try again.
            </p>
          </div>
          {onRetry && (
            <div className="mt-3">
              <Button onClick={onRetry} size="sm" variant="outline">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry {operation}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}
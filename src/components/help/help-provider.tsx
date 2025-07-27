"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import ErrorBoundary from '@/components/ui/error-boundary'
import { 
  HelpContent, 
  WorkflowGuide,
  getRouteHelp, 
  getComponentHelp, 
  searchHelp,
  getWorkflowGuide,
  getPopularHelp,
  getRelatedHelp
} from '@/data/help-content'

interface HelpContextType {
  // Content management
  currentRouteHelp: HelpContent[]
  getComponentHelp: (componentName: string) => HelpContent[]
  searchHelp: (query: string) => HelpContent[]
  getRelatedHelp: (helpId: string) => HelpContent[]
  getPopularHelp: () => HelpContent[]
  
  // UI state
  isHelpVisible: boolean
  setHelpVisible: (visible: boolean) => void
  helpSidebarOpen: boolean
  setHelpSidebarOpen: (open: boolean) => void
  activeHelpId: string | null
  setActiveHelpId: (id: string | null) => void
  
  // Workflow/tour management
  activeTour: WorkflowGuide | null
  currentTourStep: number
  startTour: (tourId: string) => void
  nextTourStep: () => void
  previousTourStep: () => void
  completeTour: () => void
  cancelTour: () => void
  
  // User preferences
  helpEnabled: boolean
  setHelpEnabled: (enabled: boolean) => void
  tourCompleted: (tourId: string) => boolean
  markTourCompleted: (tourId: string) => void
  
  // Analytics
  trackHelpUsage: (helpId: string, action: 'view' | 'click' | 'dismiss') => void
}

const HelpContext = createContext<HelpContextType | undefined>(undefined)

const STORAGE_KEYS = {
  helpEnabled: 'axion-help-enabled',
  completedTours: 'axion-completed-tours',
  helpPreferences: 'axion-help-preferences',
}

interface HelpProviderProps {
  children: React.ReactNode
  enableAnalytics?: boolean
  defaultHelpEnabled?: boolean
}

export const HelpProvider: React.FC<HelpProviderProps> = ({
  children,
  enableAnalytics = false,
  defaultHelpEnabled = true,
}) => {
  const pathname = usePathname()
  
  // Content state
  const [currentRouteHelp, setCurrentRouteHelp] = useState<HelpContent[]>([])
  
  // UI state
  const [isHelpVisible, setHelpVisible] = useState(false)
  const [helpSidebarOpen, setHelpSidebarOpen] = useState(false)
  const [activeHelpId, setActiveHelpId] = useState<string | null>(null)
  
  // Tour state
  const [activeTour, setActiveTour] = useState<WorkflowGuide | null>(null)
  const [currentTourStep, setCurrentTourStep] = useState(0)
  
  // User preferences
  const [helpEnabled, setHelpEnabledState] = useState(defaultHelpEnabled)
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set())

  // Load user preferences on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedHelpEnabled = localStorage.getItem(STORAGE_KEYS.helpEnabled)
        if (savedHelpEnabled !== null) {
          setHelpEnabledState(JSON.parse(savedHelpEnabled))
        }
        
        const savedCompletedTours = localStorage.getItem(STORAGE_KEYS.completedTours)
        if (savedCompletedTours) {
          setCompletedTours(new Set(JSON.parse(savedCompletedTours)))
        }
      } catch (error) {
        console.warn('Failed to load help preferences:', error)
        // Reset to defaults on error
        setHelpEnabledState(defaultHelpEnabled)
        setCompletedTours(new Set())
      }
    }
  }, [])

  // Update route help when pathname changes
  useEffect(() => {
    const routeHelp = getRouteHelp(pathname)
    setCurrentRouteHelp(routeHelp)
  }, [pathname])

  // Save help enabled preference
  const setHelpEnabled = (enabled: boolean) => {
    setHelpEnabledState(enabled)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.helpEnabled, JSON.stringify(enabled))
      } catch (error) {
        console.warn('Failed to save help preference:', error)
      }
    }
    if (!enabled) {
      setHelpVisible(false)
      setHelpSidebarOpen(false)
      cancelTour()
    }
  }

  // Tour management
  const startTour = (tourId: string) => {
    if (!helpEnabled) return
    
    const tour = getWorkflowGuide(tourId)
    if (tour) {
      setActiveTour(tour)
      setCurrentTourStep(0)
      setHelpVisible(true)
      trackHelpUsage(tourId, 'view')
    }
  }

  const nextTourStep = () => {
    if (activeTour && currentTourStep < activeTour.steps.length - 1) {
      setCurrentTourStep(prev => prev + 1)
    } else if (activeTour) {
      completeTour()
    }
  }

  const previousTourStep = () => {
    if (currentTourStep > 0) {
      setCurrentTourStep(prev => prev - 1)
    }
  }

  const completeTour = () => {
    if (activeTour) {
      markTourCompleted(activeTour.id)
      trackHelpUsage(activeTour.id, 'click')
    }
    setActiveTour(null)
    setCurrentTourStep(0)
    setHelpVisible(false)
  }

  const cancelTour = () => {
    if (activeTour) {
      trackHelpUsage(activeTour.id, 'dismiss')
    }
    setActiveTour(null)
    setCurrentTourStep(0)
    setHelpVisible(false)
  }

  // Tour completion tracking
  const tourCompleted = (tourId: string): boolean => {
    return completedTours.has(tourId)
  }

  const markTourCompleted = (tourId: string) => {
    const newCompleted = new Set(completedTours)
    newCompleted.add(tourId)
    setCompletedTours(newCompleted)
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEYS.completedTours, 
          JSON.stringify(Array.from(newCompleted))
        )
      } catch (error) {
        console.warn('Failed to save completed tours:', error)
      }
    }
  }

  // Analytics tracking
  const trackHelpUsage = (helpId: string, action: 'view' | 'click' | 'dismiss') => {
    if (!enableAnalytics) return
    
    // In a real implementation, this would send data to your analytics service
    console.log('Help Analytics:', { helpId, action, pathname, timestamp: new Date() })
    
    // You could integrate with services like:
    // - Google Analytics
    // - Mixpanel
    // - Segment
    // - Custom analytics endpoint
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!helpEnabled) return

    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to open help search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        setHelpSidebarOpen(true)
        setHelpVisible(true)
      }
      
      // F1 to toggle help
      if (event.key === 'F1') {
        event.preventDefault()
        setHelpVisible(!isHelpVisible)
      }
      
      // Escape to close help
      if (event.key === 'Escape' && (isHelpVisible || helpSidebarOpen)) {
        event.preventDefault()
        setHelpVisible(false)
        setHelpSidebarOpen(false)
        cancelTour()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [helpEnabled, isHelpVisible, helpSidebarOpen, setHelpSidebarOpen, setHelpVisible, cancelTour])

  // Auto-show help for new users
  useEffect(() => {
    if (!helpEnabled || typeof window === 'undefined') return
    
    // Show onboarding tour for first-time users
    try {
      const hasSeenOnboarding = localStorage.getItem('axion-onboarding-seen')
      if (!hasSeenOnboarding && pathname === '/dashboard') {
        const timeoutId = setTimeout(() => {
          startTour('complete-quote-workflow')
          localStorage.setItem('axion-onboarding-seen', 'true')
        }, 2000) // Delay to let page load
        
        return () => clearTimeout(timeoutId)
      }
    } catch (error) {
      console.warn('Failed to check onboarding status:', error)
    }
  }, [pathname, helpEnabled, startTour])

  const contextValue: HelpContextType = {
    // Content management
    currentRouteHelp,
    getComponentHelp,
    searchHelp,
    getRelatedHelp,
    getPopularHelp,
    
    // UI state
    isHelpVisible,
    setHelpVisible,
    helpSidebarOpen,
    setHelpSidebarOpen,
    activeHelpId,
    setActiveHelpId,
    
    // Tour management
    activeTour,
    currentTourStep,
    startTour,
    nextTourStep,
    previousTourStep,
    completeTour,
    cancelTour,
    
    // User preferences
    helpEnabled,
    setHelpEnabled,
    tourCompleted,
    markTourCompleted,
    
    // Analytics
    trackHelpUsage,
  }

  return (
    <ErrorBoundary fallback={
      <div className="p-4 text-center text-sm text-red-600">
        Help system encountered an error. Some features may be unavailable.
      </div>
    }>
      <HelpContext.Provider value={contextValue}>
        {children}
      </HelpContext.Provider>
    </ErrorBoundary>
  )
}

// Hook to use help context
export const useHelp = () => {
  const context = useContext(HelpContext)
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider')
  }
  return context
}

// Hook for component-specific help
export const useComponentHelp = (componentName: string) => {
  const { getComponentHelp, trackHelpUsage } = useHelp()
  const helpContent = getComponentHelp(componentName)
  
  const showHelp = (helpId: string) => {
    trackHelpUsage(helpId, 'view')
  }
  
  return { helpContent, showHelp }
}

// Hook for tour management
export const useTour = (tourId?: string) => {
  const { 
    activeTour, 
    currentTourStep, 
    startTour, 
    nextTourStep, 
    previousTourStep, 
    completeTour, 
    cancelTour,
    tourCompleted 
  } = useHelp()
  
  const isActive = activeTour?.id === tourId
  const isCompleted = tourId ? tourCompleted(tourId) : false
  
  const start = () => {
    if (tourId) {
      startTour(tourId)
    }
  }
  
  return {
    isActive,
    isCompleted,
    currentStep: isActive ? currentTourStep : 0,
    totalSteps: activeTour?.steps.length || 0,
    currentStepData: isActive ? activeTour?.steps[currentTourStep] : null,
    start,
    next: nextTourStep,
    previous: previousTourStep,
    complete: completeTour,
    cancel: cancelTour,
  }
}

// Higher-order component to automatically add help to components
export function withHelp<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  const WrappedComponent = (props: P) => {
    const { helpContent } = useComponentHelp(componentName)
    
    return (
      <div data-help-component={componentName}>
        <Component {...props} />
      </div>
    )
  }
  
  WrappedComponent.displayName = `withHelp(${Component.displayName || Component.name})`
  return WrappedComponent
}

export type { HelpContextType }
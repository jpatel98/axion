"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HelpTooltip, ClickTooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useHelp, useTour } from './help-provider'
import { HelpContent, WorkflowStep } from '@/data/help-content'
import { 
  HelpCircle, 
  X, 
  Search, 
  Book, 
  Play, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Lightbulb,
  Keyboard,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Zap
} from 'lucide-react'

// Simple help button that shows tooltip
export interface HelpButtonProps {
  helpContent: HelpContent
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'text' | 'inline'
  className?: string
  children?: React.ReactNode
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  helpContent,
  size = 'md',
  variant = 'icon',
  className,
  children,
}) => {
  const { trackHelpUsage } = useHelp()
  
  const handleClick = () => {
    trackHelpUsage(helpContent.id, 'click')
  }

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5',
  }[size]

  const buttonContent = variant === 'icon' ? (
    <HelpCircle className={iconSize} />
  ) : variant === 'text' ? (
    <span className="flex items-center gap-1">
      <HelpCircle className={iconSize} />
      Help
    </span>
  ) : (
    children || <HelpCircle className={iconSize} />
  )

  return (
    <HelpTooltip
      title={helpContent.title}
      description={helpContent.description}
      helpType={helpContent.type === 'tooltip' ? 'info' : 'tip'}
    >
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-slate-800 hover:text-foreground transition-colors',
          variant === 'icon' && 'p-1',
          variant !== 'icon' && 'px-2 py-1 text-xs',
          className
        )}
        aria-label={`Help: ${helpContent.title}`}
      >
        {buttonContent}
      </button>
    </HelpTooltip>
  )
}

// Expandable help popover with rich content
export interface HelpPopoverProps {
  helpContent: HelpContent
  trigger?: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export const HelpPopover: React.FC<HelpPopoverProps> = ({
  helpContent,
  trigger,
  side = 'right',
  className,
}) => {
  const { getRelatedHelp, trackHelpUsage } = useHelp()
  const [isOpen, setIsOpen] = useState(false)
  const relatedHelp = getRelatedHelp(helpContent.id)

  const handleOpen = () => {
    setIsOpen(true)
    trackHelpUsage(helpContent.id, 'view')
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const popoverContent = (
    <div className="w-80 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{helpContent.title}</h3>
          <p className="text-xs text-slate-800 mt-1">
            {helpContent.description}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="shrink-0 h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Content */}
      {helpContent.content && (
        <div className="text-xs text-foreground leading-relaxed">
          {helpContent.content}
        </div>
      )}

      {/* Keyboard shortcut */}
      {helpContent.shortcut && (
        <div className="flex items-center gap-2 text-xs text-slate-800">
          <Keyboard className="h-3 w-3" />
          <span>Shortcut:</span>
          <div className="flex items-center gap-1">
            {Array.isArray(helpContent.shortcut) ? 
              helpContent.shortcut.map((key, index) => (
                <React.Fragment key={key}>
                  {index > 0 && <span>+</span>}
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                    {key}
                  </kbd>
                </React.Fragment>
              )) :
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                {helpContent.shortcut}
              </kbd>
            }
          </div>
        </div>
      )}

      {/* External links */}
      {(helpContent.videoUrl || helpContent.docsUrl) && (
        <div className="flex items-center gap-2">
          {helpContent.videoUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => window.open(helpContent.videoUrl, '_blank')}
            >
              <Play className="h-3 w-3 mr-1" />
              Video
            </Button>
          )}
          {helpContent.docsUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => window.open(helpContent.docsUrl, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Docs
            </Button>
          )}
        </div>
      )}

      {/* Related topics */}
      {relatedHelp.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-800">Related:</div>
          <div className="space-y-1">
            {relatedHelp.slice(0, 3).map((related) => (
              <button
                key={related.id}
                className="block text-left text-xs text-blue-600 hover:text-blue-800 hover:underline"
                onClick={() => trackHelpUsage(related.id, 'click')}
              >
                {related.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <ClickTooltip
      content={popoverContent}
      side={side}
      className={className}
      triggerMode="click"
    >
      {trigger || (
        <Button variant="ghost" size="sm" onClick={handleOpen}>
          <HelpCircle className="h-4 w-4" />
        </Button>
      )}
    </ClickTooltip>
  )
}

// Help sidebar for comprehensive help
interface HelpSidebarProps {
  className?: string
}

export const HelpSidebar: React.FC<HelpSidebarProps> = ({ className }) => {
  const { 
    helpSidebarOpen, 
    setHelpSidebarOpen, 
    currentRouteHelp, 
    searchHelp,
    getPopularHelp,
    trackHelpUsage 
  } = useHelp()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<HelpContent[]>([])
  const [activeTab, setActiveTab] = useState<'contextual' | 'search' | 'popular'>('contextual')
  const [isClient, setIsClient] = useState(false)
  
  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchHelp(searchQuery)
      setSearchResults(results)
      setActiveTab('search')
    } else {
      setSearchResults([])
    }
  }, [searchQuery, searchHelp])

  const popularHelp = getPopularHelp()

  if (!helpSidebarOpen || !isClient) return null

  return (
    <div 
      className={cn(
        'fixed right-0 top-0 h-full w-80 bg-background border-l border-gray-200 z-50 flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          <h2 className="font-semibold">Help Center</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHelpSidebarOpen(false)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-800" />
          <Input
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'contextual', label: 'This Page', count: currentRouteHelp.length },
          { id: 'search', label: 'Search', count: searchResults.length },
          { id: 'popular', label: 'Popular', count: popularHelp.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-slate-800 hover:text-foreground'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1 bg-gray-100 text-slate-800 rounded-full px-1.5 py-0.5 text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'contextual' && (
          <HelpContentList 
            helpItems={currentRouteHelp}
            emptyMessage="No help available for this page"
          />
        )}
        
        {activeTab === 'search' && (
          <HelpContentList 
            helpItems={searchResults}
            emptyMessage={searchQuery ? "No results found" : "Start typing to search"}
          />
        )}
        
        {activeTab === 'popular' && (
          <HelpContentList 
            helpItems={popularHelp}
            emptyMessage="No popular topics available"
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-slate-800 space-y-1">
          <div className="flex items-center gap-2">
            <Keyboard className="h-3 w-3" />
            <span>Press Ctrl+K to open help</span>
          </div>
          <div className="flex items-center gap-2">
            <span>F1 to toggle</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Help content list component
interface HelpContentListProps {
  helpItems: HelpContent[]
  emptyMessage: string
}

const HelpContentList: React.FC<HelpContentListProps> = ({ helpItems, emptyMessage }) => {
  const { trackHelpUsage } = useHelp()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
      trackHelpUsage(id, 'view')
    }
    setExpandedItems(newExpanded)
  }

  if (helpItems.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-slate-800">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="p-2">
      {helpItems.map((item) => {
        const isExpanded = expandedItems.has(item.id)
        
        return (
          <div key={item.id} className="mb-2">
            <button
              onClick={() => toggleExpanded(item.id)}
              className="w-full text-left p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-800 mt-1 line-clamp-2">
                    {item.description}
                  </div>
                </div>
                <div className="ml-2 shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>
            </button>
            
            {isExpanded && item.content && (
              <div className="ml-4 mr-2 mb-2 p-3 bg-gray-100/50 rounded-md">
                <div className="text-xs text-foreground leading-relaxed">
                  {item.content}
                </div>
                
                {item.shortcut && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-800">
                    <Keyboard className="h-3 w-3" />
                    <span>Shortcut:</span>
                    <kbd className="px-1 py-0.5 bg-background rounded text-xs">
                      {Array.isArray(item.shortcut) ? item.shortcut.join('+') : item.shortcut}
                    </kbd>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Quick help component for inline tips
export interface QuickHelpProps {
  tip: string
  type?: 'info' | 'warning' | 'tip'
  dismissible?: boolean
  className?: string
  children?: React.ReactNode
}

export const QuickHelp: React.FC<QuickHelpProps> = ({
  tip,
  type = 'info',
  dismissible = true,
  className,
  children,
}) => {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const icon = {
    info: <HelpCircle className="h-4 w-4" />,
    warning: <Zap className="h-4 w-4" />,
    tip: <Lightbulb className="h-4 w-4" />,
  }[type]

  const bgColor = {
    info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100',
    tip: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100',
  }[type]

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-md border text-sm',
      bgColor,
      className
    )}>
      <div className="shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="leading-relaxed">
          {tip}
        </div>
        {children && (
          <div className="mt-2">
            {children}
          </div>
        )}
      </div>
      {dismissible && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="shrink-0 h-6 w-6 p-0 hover:bg-transparent"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

// Tour overlay component
export const TourOverlay: React.FC = () => {
  const { activeTour, currentTourStep } = useHelp()
  const { currentStepData, next, previous, complete, cancel, totalSteps } = useTour(activeTour?.id)
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!activeTour || !currentStepData || !isClient) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      {/* Highlight element if specified */}
      {currentStepData.element && (
        <div 
          className="absolute bg-white rounded-lg shadow-lg"
          style={{
            // In a real implementation, you'd calculate position based on element
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '400px',
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {currentTourStep + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{currentStepData.title}</h3>
                  <p className="text-xs text-slate-800">
                    Step {currentTourStep + 1} of {totalSteps}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={cancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-foreground">
                {currentStepData.description}
              </p>

              {currentStepData.tips && currentStepData.tips.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-800">Tips:</div>
                  <ul className="space-y-1">
                    {currentStepData.tips.map((tip, index) => (
                      <li key={index} className="text-xs text-slate-800 flex items-start gap-1">
                        <span className="text-primary">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previous}
                  disabled={currentTourStep === 0}
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={cancel}>
                    Skip Tour
                  </Button>
                  
                  {currentTourStep === totalSteps - 1 ? (
                    <Button onClick={complete} size="sm">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Button>
                  ) : (
                    <Button onClick={next} size="sm">
                      Next
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Keyboard shortcuts help
export const KeyboardShortcuts: React.FC = () => {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Open help search' },
    { keys: ['F1'], description: 'Toggle help' },
    { keys: ['Esc'], description: 'Close help/Cancel' },
    { keys: ['Ctrl', 'Enter'], description: 'Submit forms' },
    { keys: ['Ctrl', 'S'], description: 'Save forms' },
    { keys: ['Tab'], description: 'Navigate fields' },
    { keys: ['Shift', 'Tab'], description: 'Navigate backwards' },
  ]

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <span className="text-slate-800">{shortcut.description}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, keyIndex) => (
                <React.Fragment key={key}>
                  {keyIndex > 0 && <span className="text-slate-800">+</span>}
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                    {key}
                  </kbd>
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
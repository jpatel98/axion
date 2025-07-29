"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Simple tooltip implementation without external dependencies
type TooltipVariant = "default" | "dark" | "light" | "info" | "warning" | "error" | "success"
type TooltipSize = "sm" | "default" | "lg"

interface TooltipContentProps {
  children: React.ReactNode
  className?: string
  variant?: TooltipVariant
  size?: TooltipSize
}

const getTooltipStyles = (variant: TooltipVariant = "default", size: TooltipSize = "default") => {
  const baseStyles = "absolute z-50 rounded-md border shadow-md whitespace-nowrap"
  
  const variantStyles: Record<TooltipVariant, string> = {
    default: "bg-white text-slate-800 border-gray-200",
    dark: "bg-gray-900 text-white border-gray-800",
    light: "bg-white text-slate-800 border-gray-200",
    info: "bg-blue-50 text-blue-900 border-blue-200",
    warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
    error: "bg-red-50 text-red-900 border-red-200",
    success: "bg-green-50 text-green-900 border-green-200",
  }
  
  const sizeStyles: Record<TooltipSize, string> = {
    sm: "px-2 py-1 text-xs",
    default: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  }
  
  return cn(baseStyles, variantStyles[variant], sizeStyles[size])
}

const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

const TooltipRoot: React.FC<{ children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }> = ({ children }) => {
  return <>{children}</>
}

const TooltipTrigger: React.FC<{ children: React.ReactNode; asChild?: boolean; className?: string; onClick?: () => void; onFocus?: () => void; onBlur?: () => void }> = ({ children, className }) => {
  return <div className={className}>{children}</div>
}

const TooltipContent: React.FC<TooltipContentProps> = ({ children, className, variant = "default", size = "default" }) => {
  return (
    <div className={cn(getTooltipStyles(variant, size), className)}>
      {children}
    </div>
  )
}

// Simple tooltip wrapper component
interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  delayDuration?: number
  skipDelayDuration?: number
  disableHoverableContent?: boolean
  showArrow?: boolean
  asChild?: boolean
  className?: string
  contentClassName?: string
  disabled?: boolean
  variant?: TooltipVariant
  size?: TooltipSize
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  className,
  contentClassName,
  disabled = false,
  variant,
  size,
}) => {
  const [isVisible, setIsVisible] = React.useState(false)

  if (disabled) {
    return <>{children}</>
  }

  return (
    <div 
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <TooltipContent
          variant={variant}
          size={size}
          className={cn("top-full left-1/2 transform -translate-x-1/2 mt-1", contentClassName)}
        >
          {content}
        </TooltipContent>
      )}
    </div>
  )
}

// Rich tooltip with title and description
interface RichTooltipProps extends Omit<TooltipProps, 'content'> {
  title?: string
  description: React.ReactNode
  icon?: React.ReactNode
  actions?: React.ReactNode
}

const RichTooltip: React.FC<RichTooltipProps> = ({
  title,
  description,
  icon,
  actions,
  size = "lg",
  ...props
}) => {
  const content = (
    <div className="space-y-2 max-w-xs">
      {(title || icon) && (
        <div className="flex items-center gap-2">
          {icon && <div className="shrink-0">{icon}</div>}
          {title && <div className="font-medium text-sm">{title}</div>}
        </div>
      )}
      <div className="text-xs text-slate-800 leading-relaxed">
        {description}
      </div>
      {actions && (
        <div className="flex items-center gap-2 pt-1">
          {actions}
        </div>
      )}
    </div>
  )

  return (
    <Tooltip
      content={content}
      size={size}
      {...props}
    />
  )
}

// Keyboard shortcut tooltip
interface KeyboardTooltipProps extends Omit<TooltipProps, 'content'> {
  shortcut: string | string[]
  description?: string
}

const KeyboardTooltip: React.FC<KeyboardTooltipProps> = ({
  shortcut,
  description,
  ...props
}) => {
  const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut]
  
  const content = (
    <div className="flex items-center gap-2">
      {description && (
        <span className="text-xs">{description}</span>
      )}
      <div className="flex items-center gap-1">
        {shortcuts.map((key, index) => (
          <React.Fragment key={key}>
            {index > 0 && <span className="text-xs text-slate-800">+</span>}
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-slate-800 opacity-100">
              {key}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  )

  return (
    <Tooltip
      content={content}
      variant="dark"
      {...props}
    />
  )
}

// Click tooltip (stays open until clicked outside)
interface ClickTooltipProps extends TooltipProps {
  triggerMode?: "hover" | "click" | "focus"
}

const ClickTooltip: React.FC<ClickTooltipProps> = ({
  triggerMode = "click",
  children,
  content,
  ...props
}) => {
  const [open, setOpen] = React.useState(false)

  return (
    <TooltipProvider>
      <TooltipRoot 
        open={open} 
        onOpenChange={setOpen}
      >
        <TooltipTrigger
          asChild
          onClick={triggerMode === "click" ? () => setOpen(!open) : undefined}
          onFocus={triggerMode === "focus" ? () => setOpen(true) : undefined}
          onBlur={triggerMode === "focus" ? () => setOpen(false) : undefined}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent {...props}>
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}

// Help tooltip specifically for form fields and UI elements
interface HelpTooltipProps extends Omit<RichTooltipProps, 'variant'> {
  helpType?: "info" | "warning" | "tip" | "shortcut"
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  helpType = "info",
  icon,
  ...props
}) => {
  const getVariantAndIcon = () => {
    switch (helpType) {
      case "warning":
        return {
          variant: "warning" as const,
          defaultIcon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        }
      case "tip":
        return {
          variant: "success" as const,
          defaultIcon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )
        }
      case "shortcut":
        return {
          variant: "dark" as const,
          defaultIcon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )
        }
      default:
        return {
          variant: "info" as const,
          defaultIcon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
    }
  }

  const { variant, defaultIcon } = getVariantAndIcon()

  return (
    <RichTooltip
      variant={variant}
      icon={icon || defaultIcon}
      {...props}
    />
  )
}

export {
  Tooltip,
  RichTooltip,
  KeyboardTooltip,
  ClickTooltip,
  HelpTooltip,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
}

export type { TooltipProps, RichTooltipProps, KeyboardTooltipProps, HelpTooltipProps }
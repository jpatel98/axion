// Help system exports

// Core help provider and hooks
export { HelpProvider, useHelp, useComponentHelp, useTour, withHelp } from './help-provider'
export type { HelpContextType } from './help-provider'

// Help components
export {
  HelpButton,
  HelpPopover,
  HelpSidebar,
  QuickHelp,
  TourOverlay,
  KeyboardShortcuts,
} from './help-components'

export type {
  HelpButtonProps,
  HelpPopoverProps,
  QuickHelpProps,
} from './help-components'

// Help content utilities
export {
  searchHelp,
  getRouteHelp,
  getComponentHelp,
  getWorkflowGuide,
  getWorkflowsByCategory,
  getPopularHelp,
  getRelatedHelp,
  generalHelp,
  quotesHelp,
  customersHelp,
  formsHelp,
  workflowGuides,
} from '@/data/help-content'

export type {
  HelpContent,
  WorkflowStep,
  WorkflowGuide,
} from '@/data/help-content'

// Enhanced tooltip components for help
export {
  Tooltip,
  RichTooltip,
  KeyboardTooltip,
  ClickTooltip,
  HelpTooltip,
  TooltipProvider,
} from '@/components/ui/tooltip'

export type {
  TooltipProps,
  RichTooltipProps,
  KeyboardTooltipProps,
  HelpTooltipProps,
} from '@/components/ui/tooltip'
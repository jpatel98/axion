"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToastManagerProvider } from '@/lib/toast'
import {
  HelpProvider,
  useHelp,
  useTour,
  HelpButton,
  HelpPopover,
  HelpSidebar,
  QuickHelp,
  TourOverlay,
  KeyboardShortcuts,
  HelpTooltip,
  KeyboardTooltip,
  getPopularHelp,
} from '@/components/help'
import { 
  ValidatedInput,
  EmailField,
  CurrencyField,
  FormWrapper,
  FormGrid,
  useForm,
  CustomerFormData,
} from '@/components/forms'
import { 
  Play, 
  Settings, 
  Save, 
  Search, 
  Plus,
  HelpCircle,
  Lightbulb,
  Zap,
  Book,
  Star,
  Users,
  FileText,
  DollarSign
} from 'lucide-react'

// Demo form with help integration
const HelpDemoForm: React.FC = () => {
  const { startTour, setHelpSidebarOpen } = useHelp()
  const { start: startQuoteTour, isActive: isQuoteTourActive } = useTour('complete-quote-workflow')
  
  const [formState, formActions] = useForm<Partial<CustomerFormData>>({
    fields: {
      name: {
        validators: [],
        required: true,
        initialValue: '',
      },
      email: {
        validators: [],
        required: false,
        initialValue: '',
      },
    },
    onSubmit: async (data) => {
      console.log('Form submitted:', data)
    },
  })

  const popularHelp = getPopularHelp()

  return (
    <div className="space-y-8">
      {/* Header with help controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Help System Demo</h2>
          <p className="text-muted-foreground">
            Explore the comprehensive help system with tooltips, guides, and tours
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setHelpSidebarOpen(true)}
            className="flex items-center gap-2"
          >
            <Book className="h-4 w-4" />
            Help Center
          </Button>
          <Button
            onClick={startQuoteTour}
            disabled={isQuoteTourActive}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Start Tour
          </Button>
        </div>
      </div>

      {/* Help component showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tooltip Examples */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Tooltip Examples</h3>
          
          <div className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <span>Basic Help Button:</span>
              <HelpButton 
                helpContent={popularHelp[0]}
                size="md"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <span>Keyboard Shortcut:</span>
              <KeyboardTooltip
                shortcut={['Ctrl', 'S']}
                description="Save form"
              >
                <Button variant="outline" size="sm">
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </KeyboardTooltip>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Help Tooltip:</span>
              <HelpTooltip
                title="Search Functionality"
                description="Use the search bar to find records quickly"
                helpType="tip"
              >
                <Button variant="outline" size="sm">
                  <Search className="h-3 w-3 mr-1" />
                  Search
                </Button>
              </HelpTooltip>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Warning Tooltip:</span>
              <HelpTooltip
                title="Delete Action"
                description="This action cannot be undone. Make sure you want to proceed."
                helpType="warning"
              >
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  Delete
                </Button>
              </HelpTooltip>
            </div>
          </div>
        </section>

        {/* Popover Examples */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Help Popovers</h3>
          
          <div className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <span>Rich Help Popover:</span>
              <HelpPopover
                helpContent={popularHelp[1]}
                trigger={
                  <Button variant="outline" size="sm">
                    <HelpCircle className="h-3 w-3 mr-1" />
                    Advanced Help
                  </Button>
                }
                side="right"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <span>Feature Explanation:</span>
              <HelpPopover
                helpContent={{
                  id: 'feature-demo',
                  title: 'Advanced Features',
                  description: 'Discover powerful features to boost your productivity',
                  content: 'This feature allows you to perform complex operations with ease. Click on the various buttons to explore different functionalities and workflows.',
                  type: 'popover',
                  category: 'general',
                  keywords: ['features', 'advanced'],
                  priority: 'medium',
                  shortcut: ['Alt', 'F'],
                  relatedTopics: ['navigation-basics', 'keyboard-shortcuts'],
                }}
                trigger={
                  <Button variant="outline" size="sm">
                    <Star className="h-3 w-3 mr-1" />
                    Features
                  </Button>
                }
              />
            </div>
          </div>
        </section>
      </div>

      {/* Quick Help Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Help & Tips</h3>
        
        <div className="space-y-3">
          <QuickHelp
            type="info"
            tip="Use Ctrl+K to quickly open the help search. This is the fastest way to find answers to your questions."
          />
          
          <QuickHelp
            type="warning"
            tip="Make sure to save your work frequently. While we auto-save drafts, manual saves ensure your data is secure."
            dismissible={false}
          />
          
          <QuickHelp
            type="tip"
            tip="Pro tip: You can navigate between form fields using Tab and Shift+Tab for a faster workflow."
          >
            <div className="mt-2">
              <Button size="sm" variant="outline">
                Learn More Shortcuts
              </Button>
            </div>
          </QuickHelp>
        </div>
      </section>

      {/* Form with Contextual Help */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Form with Contextual Help</h3>
        
        <FormWrapper
          title="Customer Information"
          description="Create a new customer record with built-in help"
          isSubmitting={formState.isSubmitting}
          isValid={formState.isValid}
          onSubmit={formActions.submit}
          className="border rounded-lg p-6"
        >
          <FormGrid columns={2}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Company Name *</label>
                <HelpButton
                  helpContent={{
                    id: 'company-name-help',
                    title: 'Company Name',
                    description: 'Enter the full legal name of the company',
                    content: 'Use the complete legal business name as it appears on official documents. This helps with invoicing and legal compliance.',
                    type: 'tooltip',
                    category: 'forms',
                    keywords: ['company', 'name', 'legal'],
                    priority: 'medium',
                  }}
                  size="sm"
                />
              </div>
              <ValidatedInput
                placeholder="Acme Corporation"
                {...formActions.getFieldProps('name')}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Email Address</label>
                <HelpPopover
                  helpContent={{
                    id: 'email-help',
                    title: 'Email Address',
                    description: 'Primary contact email for this customer',
                    content: 'This email will be used for automated notifications, quote delivery, and general communication. Make sure it\'s actively monitored.',
                    type: 'popover',
                    category: 'forms',
                    keywords: ['email', 'contact', 'notifications'],
                    priority: 'high',
                    relatedTopics: ['form-validation'],
                  }}
                  trigger={<HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer" />}
                />
              </div>
              <EmailField
                placeholder="contact@company.com"
                {...formActions.getFieldProps('email')}
              />
            </div>
          </FormGrid>
          
          <QuickHelp
            type="tip"
            tip="All fields marked with * are required. The form will validate in real-time as you type."
            className="mt-4"
          />
        </FormWrapper>
      </section>

      {/* Dashboard Cards with Help */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Dashboard Cards with Help</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Total Customers',
              value: '156',
              icon: Users,
              helpContent: {
                id: 'customers-metric',
                title: 'Customer Count',
                description: 'Total number of active customers in your system',
                content: 'This shows all customers with at least one quote or job in the last 12 months. Inactive customers are not included in this count.',
                type: 'tooltip' as const,
                category: 'general' as const,
                keywords: ['customers', 'metrics'],
                priority: 'low' as const,
              }
            },
            {
              title: 'Active Quotes',
              value: '23',
              icon: FileText,
              helpContent: {
                id: 'quotes-metric',
                title: 'Active Quotes',
                description: 'Quotes that are currently sent or in draft status',
                content: 'These are quotes waiting for customer response or still being prepared. Accepted and rejected quotes are not included.',
                type: 'tooltip' as const,
                category: 'quotes' as const,
                keywords: ['quotes', 'active', 'metrics'],
                priority: 'medium' as const,
              }
            },
            {
              title: 'Revenue This Month',
              value: '$45,230',
              icon: DollarSign,
              helpContent: {
                id: 'revenue-metric',
                title: 'Monthly Revenue',
                description: 'Total revenue from accepted quotes this month',
                content: 'Calculated from all quotes marked as accepted in the current month. Does not include pending or draft quotes.',
                type: 'tooltip' as const,
                category: 'general' as const,
                keywords: ['revenue', 'money', 'metrics'],
                priority: 'high' as const,
              }
            },
          ].map((card, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{card.title}</span>
                </div>
                <HelpButton
                  helpContent={card.helpContent}
                  size="sm"
                />
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
        <div className="border rounded-lg p-4 max-w-md">
          <KeyboardShortcuts />
        </div>
      </section>
    </div>
  )
}

// Settings panel for help preferences
const HelpSettings: React.FC = () => {
  const { helpEnabled, setHelpEnabled } = useHelp()
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Help Settings</h3>
      
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Enable Help System</div>
            <div className="text-sm text-muted-foreground">
              Show tooltips, tours, and contextual help throughout the application
            </div>
          </div>
          <Button
            variant={helpEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setHelpEnabled(!helpEnabled)}
          >
            {helpEnabled ? "Enabled" : "Disabled"}
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Auto-start Tours</div>
            <div className="text-sm text-muted-foreground">
              Automatically show guided tours for new features
            </div>
          </div>
          <Button variant="outline" size="sm">
            Configure
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Help Analytics</div>
            <div className="text-sm text-muted-foreground">
              Help us improve by tracking which help topics are most useful
            </div>
          </div>
          <Button variant="outline" size="sm">
            Settings
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main demo page component
export default function HelpExamplePage() {
  const [activeTab, setActiveTab] = useState<'demo' | 'settings'>('demo')

  return (
    <ToastManagerProvider>
      <HelpProvider enableAnalytics={true} defaultHelpEnabled={true}>
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Contextual Help System</h1>
            <p className="text-muted-foreground">
              A comprehensive help system that provides guidance exactly when and where users need it.
            </p>
          </div>

          {/* Tab navigation */}
          <div className="flex space-x-1 mb-8 bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'demo'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Help Components Demo
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Help Settings
            </button>
          </div>

          {/* Content */}
          <div className="bg-card rounded-lg border p-6">
            {activeTab === 'demo' && <HelpDemoForm />}
            {activeTab === 'settings' && <HelpSettings />}
          </div>

          {/* Features list */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Smart Tooltips
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Context-aware help content</li>
                <li>• Rich formatting with icons and actions</li>
                <li>• Keyboard shortcut hints</li>
                <li>• Multiple trigger modes (hover, click, focus)</li>
                <li>• Smart positioning to avoid viewport edges</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Book className="h-5 w-5" />
                Help Center
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Searchable help content</li>
                <li>• Route-specific guidance</li>
                <li>• Popular topics and FAQs</li>
                <li>• Related topic suggestions</li>
                <li>• Keyboard navigation (Ctrl+K)</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Play className="h-5 w-5" />
                Guided Tours
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Step-by-step workflow guidance</li>
                <li>• Element highlighting and overlays</li>
                <li>• Progress tracking and completion</li>
                <li>• Skip and resume functionality</li>
                <li>• Difficulty levels and prerequisites</li>
              </ul>
            </div>
          </div>

          {/* Usage stats */}
          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Implementation Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">Design Principles</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Non-intrusive and contextual</li>
                  <li>• Progressive disclosure of information</li>
                  <li>• Consistent visual language</li>
                  <li>• Accessible keyboard navigation</li>
                  <li>• Mobile-responsive design</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Technical Features</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• React Context for state management</li>
                  <li>• TypeScript for type safety</li>
                  <li>• Local storage for user preferences</li>
                  <li>• Analytics integration ready</li>
                  <li>• Component-level help integration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Global help components */}
        <HelpSidebar />
        <TourOverlay />
      </HelpProvider>
    </ToastManagerProvider>
  )
}
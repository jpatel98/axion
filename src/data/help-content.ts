/**
 * Centralized help content for Axion ERP
 * Organized by routes and components for contextual help
 */

export interface HelpContent {
  id: string
  title: string
  description: string
  content?: string
  type: 'tooltip' | 'popover' | 'guide' | 'tour'
  category: 'general' | 'quotes' | 'customers' | 'forms' | 'navigation'
  keywords: string[]
  relatedTopics?: string[]
  shortcut?: string | string[]
  videoUrl?: string
  docsUrl?: string
  priority: 'low' | 'medium' | 'high'
}

export interface WorkflowStep {
  id: string
  title: string
  description: string
  element?: string // CSS selector for highlighting
  action?: 'click' | 'type' | 'select' | 'scroll'
  validation?: string
  tips?: string[]
}

export interface WorkflowGuide {
  id: string
  title: string
  description: string
  category: string
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites?: string[]
  steps: WorkflowStep[]
  completionCriteria: string
}

// General help content
const generalHelp: HelpContent[] = [
  {
    id: 'navigation-basics',
    title: 'Navigation Basics',
    description: 'Learn how to navigate through the Axion ERP system',
    content: 'Use the sidebar to access different modules. Click on Quotes to manage sales quotes, Customers to manage your customer database, and Jobs to track manufacturing work.',
    type: 'guide',
    category: 'general',
    keywords: ['navigation', 'sidebar', 'menu', 'basics'],
    priority: 'high',
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Speed up your workflow with keyboard shortcuts',
    content: 'Common shortcuts: Ctrl+S to save forms, Ctrl+Enter to submit, Esc to cancel, Tab to navigate fields.',
    type: 'popover',
    category: 'general',
    keywords: ['shortcuts', 'keyboard', 'hotkeys', 'speed'],
    shortcut: ['Ctrl', 'K'],
    priority: 'medium',
  },
  {
    id: 'search-functionality',
    title: 'Search and Filters',
    description: 'Find what you need quickly using search and filters',
    content: 'Use the search bar to find records by name, number, or content. Apply filters to narrow down results by status, date range, or other criteria.',
    type: 'tooltip',
    category: 'general',
    keywords: ['search', 'filter', 'find', 'lookup'],
    priority: 'high',
  },
]

// Quotes help content
const quotesHelp: HelpContent[] = [
  {
    id: 'create-quote',
    title: 'Creating a New Quote',
    description: 'Step-by-step guide to create a quote for your customer',
    content: 'Select a customer, add line items with descriptions and pricing, set the validity period, and save. The quote number is automatically generated.',
    type: 'guide',
    category: 'quotes',
    keywords: ['quote', 'create', 'new', 'customer', 'pricing'],
    relatedTopics: ['quote-line-items', 'quote-status'],
    priority: 'high',
  },
  {
    id: 'quote-line-items',
    title: 'Managing Line Items',
    description: 'Add, edit, and organize items in your quotes',
    content: 'Click "Add Item" to include new products or services. Enter a clear description, specify quantity, and set unit price. The line total updates automatically.',
    type: 'tooltip',
    category: 'quotes',
    keywords: ['line items', 'products', 'services', 'pricing', 'quantity'],
    relatedTopics: ['create-quote', 'quote-calculations'],
    priority: 'high',
  },
  {
    id: 'quote-status',
    title: 'Quote Status Workflow',
    description: 'Understanding and managing quote statuses',
    content: 'Quotes progress through: Draft → Sent → Accepted/Rejected. Draft quotes can be edited freely. Sent quotes are locked. Accepted quotes can be converted to jobs.',
    type: 'popover',
    category: 'quotes',
    keywords: ['status', 'workflow', 'draft', 'sent', 'accepted', 'rejected'],
    relatedTopics: ['quote-to-job', 'create-quote'],
    priority: 'medium',
  },
  {
    id: 'quote-calculations',
    title: 'Quote Calculations',
    description: 'How totals and pricing are calculated',
    content: 'Line total = Quantity × Unit Price. Quote total = Sum of all line totals. Tax is calculated on the subtotal if applicable.',
    type: 'tooltip',
    category: 'quotes',
    keywords: ['calculations', 'total', 'pricing', 'math', 'tax'],
    priority: 'low',
  },
  {
    id: 'quote-to-job',
    title: 'Converting Quotes to Jobs',
    description: 'Turn accepted quotes into manufacturing jobs',
    content: 'Once a quote is accepted, click "Convert to Job" to create a manufacturing job with the same line items and customer information.',
    type: 'tooltip',
    category: 'quotes',
    keywords: ['convert', 'job', 'manufacturing', 'accepted'],
    relatedTopics: ['quote-status'],
    priority: 'medium',
  },
  {
    id: 'quote-search',
    title: 'Finding Quotes',
    description: 'Search and filter your quotes effectively',
    content: 'Search by quote number, customer name, or title. Filter by status to see only drafts, sent quotes, or accepted quotes. Use date filters for time-based searches.',
    type: 'tooltip',
    category: 'quotes',
    keywords: ['search', 'filter', 'find', 'quote number', 'customer'],
    priority: 'medium',
  },
]

// Customers help content
const customersHelp: HelpContent[] = [
  {
    id: 'create-customer',
    title: 'Adding New Customers',
    description: 'Create customer records for your business contacts',
    content: 'Enter the company name (required), contact person, email, phone, and address. All fields except company name are optional but recommended for complete records.',
    type: 'guide',
    category: 'customers',
    keywords: ['customer', 'create', 'new', 'company', 'contact'],
    relatedTopics: ['customer-information'],
    priority: 'high',
  },
  {
    id: 'customer-information',
    title: 'Customer Information Fields',
    description: 'Understanding customer data fields and requirements',
    content: 'Company Name is required. Email enables automatic notifications. Phone allows direct contact. Address is used for shipping and billing.',
    type: 'popover',
    category: 'customers',
    keywords: ['fields', 'information', 'data', 'required', 'optional'],
    priority: 'medium',
  },
  {
    id: 'customer-notes',
    title: 'Customer Notes',
    description: 'Track important information about your customers',
    content: 'Use the notes field to record special requirements, preferences, payment terms, or any other relevant information about the customer.',
    type: 'tooltip',
    category: 'customers',
    keywords: ['notes', 'information', 'preferences', 'requirements'],
    priority: 'low',
  },
]

// Forms help content
const formsHelp: HelpContent[] = [
  {
    id: 'form-validation',
    title: 'Form Validation',
    description: 'Understanding form errors and validation',
    content: 'Red borders indicate errors. Hover over error icons for details. Required fields are marked with *. Forms validate in real-time as you type.',
    type: 'tooltip',
    category: 'forms',
    keywords: ['validation', 'errors', 'required', 'real-time'],
    priority: 'high',
  },
  {
    id: 'form-shortcuts',
    title: 'Form Keyboard Shortcuts',
    description: 'Navigate and submit forms quickly',
    content: 'Tab to move between fields, Shift+Tab to go back. Ctrl+Enter to submit forms. Esc to cancel editing.',
    type: 'popover',
    category: 'forms',
    keywords: ['shortcuts', 'keyboard', 'navigation', 'submit'],
    shortcut: ['Ctrl', 'Enter'],
    priority: 'medium',
  },
  {
    id: 'required-fields',
    title: 'Required Fields',
    description: 'Identifying and completing mandatory fields',
    content: 'Fields marked with a red asterisk (*) are required. You cannot save the form until all required fields are completed with valid data.',
    type: 'tooltip',
    category: 'forms',
    keywords: ['required', 'mandatory', 'asterisk', 'validation'],
    priority: 'high',
  },
  {
    id: 'autosave',
    title: 'Auto-save and Draft Recovery',
    description: 'Your work is automatically saved as you type',
    content: 'Forms automatically save drafts to prevent data loss. If you navigate away or refresh the page, your progress will be restored.',
    type: 'tooltip',
    category: 'forms',
    keywords: ['autosave', 'draft', 'recovery', 'progress'],
    priority: 'medium',
  },
]

// Workflow guides for complex operations
const workflowGuides: WorkflowGuide[] = [
  {
    id: 'complete-quote-workflow',
    title: 'Complete Quote Creation Workflow',
    description: 'From customer selection to quote approval - the complete process',
    category: 'quotes',
    estimatedTime: '5-10 minutes',
    difficulty: 'beginner',
    prerequisites: ['Customer must exist in system'],
    completionCriteria: 'Quote is created with valid line items and sent to customer',
    steps: [
      {
        id: 'navigate-to-quotes',
        title: 'Navigate to Quotes',
        description: 'Click on "Quotes" in the sidebar menu',
        element: 'nav[aria-label="Main navigation"] a[href="/dashboard/quotes"]',
        action: 'click',
      },
      {
        id: 'click-new-quote',
        title: 'Create New Quote',
        description: 'Click the "New Quote" button to start creating a quote',
        element: 'a[href="/dashboard/quotes/new"]',
        action: 'click',
      },
      {
        id: 'select-customer',
        title: 'Select Customer',
        description: 'Choose an existing customer from the dropdown',
        element: 'select[name="customer_id"]',
        action: 'select',
        validation: 'Customer must be selected',
      },
      {
        id: 'enter-quote-title',
        title: 'Enter Quote Title',
        description: 'Provide a descriptive title for the quote',
        element: 'input[name="title"]',
        action: 'type',
        tips: ['Use descriptive titles like "Manufacturing Services Q1 2024"'],
      },
      {
        id: 'add-line-items',
        title: 'Add Line Items',
        description: 'Add products or services to the quote',
        element: '.line-items-section',
        action: 'click',
        tips: ['Add at least one line item', 'Include detailed descriptions'],
      },
      {
        id: 'set-validity',
        title: 'Set Valid Until Date',
        description: 'Choose when the quote expires',
        element: 'input[name="valid_until"]',
        action: 'select',
        tips: ['Typically 30-60 days from creation'],
      },
      {
        id: 'review-and-save',
        title: 'Review and Save',
        description: 'Check all information and save the quote',
        element: 'button[type="submit"]',
        action: 'click',
        validation: 'All required fields must be completed',
      },
    ],
  },
  {
    id: 'quote-to-job-conversion',
    title: 'Converting Accepted Quote to Job',
    description: 'Transform an accepted quote into a manufacturing job',
    category: 'quotes',
    estimatedTime: '2-3 minutes',
    difficulty: 'intermediate',
    prerequisites: ['Quote must be in "accepted" status'],
    completionCriteria: 'Job is created with quote details',
    steps: [
      {
        id: 'find-accepted-quote',
        title: 'Find Accepted Quote',
        description: 'Locate the quote with "accepted" status',
        element: '.quotes-table',
        action: 'click',
      },
      {
        id: 'open-quote-details',
        title: 'Open Quote Details',
        description: 'Click to view the full quote details',
        element: 'a[href*="/dashboard/quotes/"]',
        action: 'click',
      },
      {
        id: 'convert-to-job',
        title: 'Convert to Job',
        description: 'Click the "Convert to Job" button',
        element: 'button:contains("Convert to Job")',
        action: 'click',
        validation: 'Quote status must be "accepted"',
      },
      {
        id: 'confirm-conversion',
        title: 'Confirm Conversion',
        description: 'Confirm that you want to create a job from this quote',
        action: 'click',
        tips: ['This action cannot be undone'],
      },
    ],
  },
]

// Help content organized by routes
const routeHelp: Record<string, HelpContent[]> = {
  '/dashboard': generalHelp,
  '/dashboard/quotes': quotesHelp,
  '/dashboard/quotes/new': quotesHelp.filter(h => 
    ['create-quote', 'quote-line-items', 'form-validation'].includes(h.id)
  ),
  '/dashboard/quotes/[id]': quotesHelp.filter(h => 
    ['quote-status', 'quote-to-job', 'quote-line-items'].includes(h.id)
  ),
  '/dashboard/customers': customersHelp,
  '/dashboard/customers/new': customersHelp.filter(h => 
    ['create-customer', 'customer-information', 'form-validation'].includes(h.id)
  ),
}

// Component-specific help
const componentHelp: Record<string, HelpContent[]> = {
  'ValidatedInput': formsHelp.filter(h => 
    ['form-validation', 'required-fields'].includes(h.id)
  ),
  'ValidatedTextarea': formsHelp.filter(h => 
    ['form-validation', 'required-fields'].includes(h.id)
  ),
  'ValidatedSelect': formsHelp.filter(h => 
    ['form-validation', 'required-fields'].includes(h.id)
  ),
  'CurrencyField': [
    {
      id: 'currency-formatting',
      title: 'Currency Input',
      description: 'Enter monetary values with automatic formatting',
      content: 'Type numbers and they will be automatically formatted as currency. Use decimal points for cents.',
      type: 'tooltip',
      category: 'forms',
      keywords: ['currency', 'money', 'formatting', 'decimal'],
      priority: 'medium',
    },
  ],
  'EmailField': [
    {
      id: 'email-validation',
      title: 'Email Format',
      description: 'Enter a valid email address',
      content: 'Email must include @ symbol and valid domain. Example: user@company.com',
      type: 'tooltip',
      category: 'forms',
      keywords: ['email', 'format', 'validation', '@'],
      priority: 'high',
    },
  ],
  'PhoneField': [
    {
      id: 'phone-formatting',
      title: 'Phone Number',
      description: 'Enter phone number with automatic formatting',
      content: 'Type digits and they will be formatted as (555) 123-4567. Include area code for US numbers.',
      type: 'tooltip',
      category: 'forms',
      keywords: ['phone', 'formatting', 'area code', 'digits'],
      priority: 'medium',
    },
  ],
}

// Search functionality
export function searchHelp(query: string): HelpContent[] {
  const allHelp = [...generalHelp, ...quotesHelp, ...customersHelp, ...formsHelp]
  const lowercaseQuery = query.toLowerCase()
  
  return allHelp.filter(help => 
    help.title.toLowerCase().includes(lowercaseQuery) ||
    help.description.toLowerCase().includes(lowercaseQuery) ||
    help.content?.toLowerCase().includes(lowercaseQuery) ||
    help.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
  ).sort((a, b) => {
    // Sort by priority and relevance
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

// Get help for specific route
export function getRouteHelp(route: string): HelpContent[] {
  return routeHelp[route] || []
}

// Get help for specific component
export function getComponentHelp(componentName: string): HelpContent[] {
  return componentHelp[componentName] || []
}

// Get workflow guide by ID
export function getWorkflowGuide(id: string): WorkflowGuide | undefined {
  return workflowGuides.find(guide => guide.id === id)
}

// Get all workflow guides for category
export function getWorkflowsByCategory(category: string): WorkflowGuide[] {
  return workflowGuides.filter(guide => guide.category === category)
}

// Get popular help topics
export function getPopularHelp(): HelpContent[] {
  const popularIds = [
    'navigation-basics',
    'create-quote',
    'create-customer', 
    'form-validation',
    'quote-status',
    'keyboard-shortcuts'
  ]
  
  const allHelp = [...generalHelp, ...quotesHelp, ...customersHelp, ...formsHelp]
  return popularIds.map(id => allHelp.find(help => help.id === id)).filter(Boolean) as HelpContent[]
}

// Get related help topics
export function getRelatedHelp(helpId: string): HelpContent[] {
  const allHelp = [...generalHelp, ...quotesHelp, ...customersHelp, ...formsHelp]
  const help = allHelp.find(h => h.id === helpId)
  
  if (!help?.relatedTopics) return []
  
  return help.relatedTopics.map(id => 
    allHelp.find(h => h.id === id)
  ).filter(Boolean) as HelpContent[]
}

export {
  generalHelp,
  quotesHelp, 
  customersHelp,
  formsHelp,
  workflowGuides,
  routeHelp,
  componentHelp,
}
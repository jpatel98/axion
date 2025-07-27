'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Trash2,
  FileText,
  User,
  Calendar,
  DollarSign,
  Briefcase,
  CheckCircle,
  XCircle,
  Send,
  Eye
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address_line1?: string
  city?: string
  state?: string
}

interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  line_total: number
}

interface Quote {
  id: string
  quote_number: string
  customer_id: string
  title: string
  description: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  total: number
  valid_until: string
  created_at: string
  updated_at: string
  customers: Customer
  quote_line_items: LineItem[]
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
}

export default function QuoteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Quote>>({})
  const [quoteId, setQuoteId] = useState<string | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setQuoteId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (quoteId) {
      fetchQuote()
    }
  }, [quoteId])

  const fetchQuote = async () => {
    try {
      console.log('Fetching quote with ID:', quoteId)
      const response = await fetch(`/api/v1/quotes/${quoteId}`)
      console.log('Quote fetch response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Quote data received:', data)
        setQuote(data.quote)
        setEditData(data.quote)
      } else {
        const errorText = await response.text()
        console.error('Quote fetch failed:', response.status, errorText)
        setError('Quote not found')
        setTimeout(() => router.push('/dashboard/quotes'), 2000)
      }
    } catch (error) {
      console.error('Error fetching quote:', error)
      setError('Failed to load quote')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditData(quote || {})
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData(quote || {})
    setError(null)
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      quote_line_items: prev.quote_line_items?.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unit_price') {
            updated.line_total = updated.quantity * updated.unit_price
          }
          return updated
        }
        return item
      }) || []
    }))
  }

  const addLineItem = () => {
    setEditData(prev => ({
      ...prev,
      quote_line_items: [
        ...(prev.quote_line_items || []),
        {
          id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          description: '',
          quantity: 1,
          unit_price: 0,
          line_total: 0
        }
      ]
    }))
  }

  const removeLineItem = (id: string) => {
    if (editData.quote_line_items && editData.quote_line_items.length > 1) {
      setEditData(prev => ({
        ...prev,
        quote_line_items: prev.quote_line_items?.filter(item => item.id !== id) || []
      }))
    }
  }

  const calculateTotal = () => {
    return editData.quote_line_items?.reduce((sum, item) => sum + (item.line_total || 0), 0) || 0
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      // Validate required fields
      if (!editData.title) {
        throw new Error('Title is required')
      }

      // Validate line items
      const validItems = editData.quote_line_items?.filter(item => 
        item.description.trim() && item.quantity > 0 && item.unit_price > 0
      ) || []
      
      if (validItems.length === 0) {
        throw new Error('At least one valid line item is required')
      }

      const response = await fetch(`/api/v1/quotes/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editData,
          total: calculateTotal(),
          line_items: validItems.map(({ id, ...item }) => item)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update quote')
      }

      const result = await response.json()
      setQuote(result.quote)
      setEditData(result.quote)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/quotes/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: quote?.title,
          description: quote?.description,
          tax_rate: quote?.tax_rate || 0,
          valid_until: quote?.valid_until,
          notes: quote?.notes,
          internal_notes: quote?.internal_notes,
          status: newStatus
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setQuote(result.quote)
        setEditData(result.quote)
      } else {
        const errorData = await response.json()
        console.error('Failed to update status:', errorData)
        setError(`Failed to update status: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating quote status:', error)
      setError('Network error while updating status')
    }
  }

  const handleConvertToJob = async () => {
    if (!confirm('Are you sure you want to convert this quote to a job? This action cannot be undone.')) {
      return
    }

    setConverting(true)
    try {
      const response = await fetch(`/api/v1/jobs/from-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quote_id: quoteId
        }),
      })

      if (response.ok) {
        const job = await response.json()
        alert('Quote successfully converted to job!')
        router.push(`/dashboard/jobs/${job.id}`)
      } else {
        const error = await response.json()
        console.error('Error converting quote:', error)
        alert('Error converting quote to job. Please try again.')
      }
    } catch (error) {
      console.error('Error converting quote:', error)
      alert('Error converting quote to job. Please try again.')
    } finally {
      setConverting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !quote) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900">Error</h3>
        <p className="text-gray-500 mt-2">{error}</p>
        <Link href="/dashboard/quotes">
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4 inline" />
            Back to Quotes
          </button>
        </Link>
      </div>
    )
  }

  if (!quote) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/quotes" className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quotes
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              {quote.quote_number}
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[quote.status]}`}>
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </span>
            </h1>
            <p className="text-gray-600">{quote.title}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {quote.status === 'accepted' && (
            <button 
              onClick={handleConvertToJob} 
              disabled={converting}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors inline-flex items-center disabled:opacity-50"
            >
              <Briefcase className="mr-2 h-4 w-4" />
              {converting ? 'Converting...' : 'Convert to Job'}
            </button>
          )}
          
          {!isEditing ? (
            <button 
              onClick={handleEdit}
              className="border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={handleCancelEdit}
                className="border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center disabled:opacity-50"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Details */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Quote Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={editData.title || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                    <input
                      type="date"
                      value={editData.valid_until?.split('T')[0] || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, valid_until: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Title</label>
                    <p className="text-sm text-gray-900">{quote.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Description</label>
                    <p className="text-sm text-gray-900">{quote.description || 'No description provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Valid Until</label>
                      <p className="text-sm text-gray-900">{formatDate(quote.valid_until)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Total Amount</label>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(quote.total)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Line Items
              </h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={addLineItem}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Item
                </button>
              )}
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {(isEditing ? editData.quote_line_items : quote.quote_line_items || [])?.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">Item #{index + 1}</h4>
                          {editData.quote_line_items && editData.quote_line_items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLineItem(item.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-sm text-gray-600">Line Total: </span>
                          <span className="font-semibold text-gray-900">{formatCurrency(item.line_total)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">{item.description}</h4>
                          <span className="font-semibold text-gray-900">{formatCurrency(item.line_total)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} × {formatCurrency(item.unit_price)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-900">
                    Total: {formatCurrency(isEditing ? calculateTotal() : quote.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="mr-2 h-5 w-5" />
                Customer Information
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <p className="text-sm text-gray-900">{quote.customers?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="text-sm text-gray-900">{quote.customers?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone</label>
                <p className="text-sm text-gray-900">{quote.customers?.phone || 'N/A'}</p>
              </div>
              {quote.customers?.address_line1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Address</label>
                  <p className="text-sm text-gray-900">
                    {quote.customers.address_line1}<br />
                    {quote.customers.city}, {quote.customers.state}
                  </p>
                </div>
              )}
              <div className="pt-2">
                <Link 
                  href={`/dashboard/customers/${quote.customer_id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Customer Details →
                </Link>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
            </div>
            <div className="p-6 space-y-3">
              {quote.status === 'draft' && (
                <button 
                  onClick={() => handleStatusChange('sent')} 
                  className="w-full border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium inline-flex items-center justify-center"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Mark as Sent
                </button>
              )}
              
              {quote.status === 'sent' && (
                <>
                  <button 
                    onClick={() => handleStatusChange('accepted')} 
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors inline-flex items-center justify-center"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Accepted
                  </button>
                  <button 
                    onClick={() => handleStatusChange('rejected')} 
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors inline-flex items-center justify-center"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Mark as Rejected
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quote Info */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quote Information</h3>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Created</label>
                <p className="text-sm text-gray-900">{formatDate(quote.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-sm text-gray-900">{formatDate(quote.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
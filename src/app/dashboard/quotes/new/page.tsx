'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'

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

interface QuoteFormData {
  customer_id: string
  title: string
  description: string
  valid_until: string
  line_items: LineItem[]
}

export default function NewQuotePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [customersLoading, setCustomersLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<QuoteFormData>({
    customer_id: '',
    title: '',
    description: '',
    valid_until: '',
    line_items: [
      {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unit_price: 0,
        line_total: 0
      }
    ]
  })

  useEffect(() => {
    fetchCustomers()
    // Set default valid_until to 30 days from now
    const defaultValidUntil = new Date()
    defaultValidUntil.setDate(defaultValidUntil.getDate() + 30)
    setFormData(prev => ({
      ...prev,
      valid_until: defaultValidUntil.toISOString().split('T')[0]
    }))
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/v1/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setCustomersLoading(false)
    }
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unit_price') {
            updated.line_total = updated.quantity * updated.unit_price
          }
          return updated
        }
        return item
      })
    }))
  }

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [
        ...prev.line_items,
        {
          id: crypto.randomUUID(),
          description: '',
          quantity: 1,
          unit_price: 0,
          line_total: 0
        }
      ]
    }))
  }

  const removeLineItem = (id: string) => {
    if (formData.line_items.length > 1) {
      setFormData(prev => ({
        ...prev,
        line_items: prev.line_items.filter(item => item.id !== id)
      }))
    }
  }

  const calculateTotal = () => {
    return formData.line_items.reduce((sum, item) => sum + item.line_total, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.customer_id || !formData.title) {
        throw new Error('Customer and title are required')
      }

      // Validate line items
      const hasValidItems = formData.line_items.some(item => 
        item.description.trim() && item.quantity > 0 && item.unit_price > 0
      )
      
      if (!hasValidItems) {
        throw new Error('At least one valid line item is required')
      }

      const response = await fetch('/api/v1/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: formData.customer_id,
          title: formData.title,
          description: formData.description,
          valid_until: formData.valid_until,
          total: calculateTotal(),
          line_items: formData.line_items.filter(item => 
            item.description.trim() && item.quantity > 0 && item.unit_price > 0
          ).map(({ id, ...item }) => item)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create quote')
      }

      const quote = await response.json()
      router.push(`/dashboard/quotes/${quote.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const selectedCustomer = customers.find(c => c.id === formData.customer_id)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/quotes" className="border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quotes
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Quote</h1>
          <p className="text-gray-600">Create a new quote for your customer</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quote Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quote Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer *
                  </label>
                  {customersLoading ? (
                    <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
                  ) : (
                    <select
                      required
                      value={formData.customer_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} {customer.email ? `(${customer.email})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter quote title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter quote description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid Until *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.valid_until}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Item
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {formData.line_items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">Item #{index + 1}</h4>
                        {formData.line_items.length > 1 && (
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity *
                          </label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Price *
                          </label>
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
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">
                      Quote Total: {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
              </div>
              <div className="p-6">
                {selectedCustomer ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Name</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.phone}</p>
                    </div>
                    {selectedCustomer.address_line1 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Address</label>
                        <p className="text-sm text-gray-900">
                          {selectedCustomer.address_line1}<br />
                          {selectedCustomer.city}, {selectedCustomer.state}
                        </p>
                      </div>
                    )}
                    <div className="pt-2">
                      <Link 
                        href={`/dashboard/customers/${selectedCustomer.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Customer Details →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Select a customer to view their information
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Link href="/dashboard/quotes">
            <button type="button" className="border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium text-gray-700">
              Cancel
            </button>
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Quote'}
          </button>
        </div>
      </form>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, User, FileText, Calendar, Edit } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  contact_person: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export default function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await Promise.resolve(params)
      setCustomerId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (customerId) {
      fetchCustomer()
    }
  }, [customerId])

  const fetchCustomer = async () => {
    if (!customerId) return
    
    try {
      const response = await fetch(`/api/v1/customers/${customerId}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Customer not found')
        }
        throw new Error('Failed to fetch customer')
      }
      const data = await response.json()
      setCustomer(data.customer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
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
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div className="text-gray-500">Loading customer details...</div>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div>
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="text-sm text-red-700">
            {error || 'Customer not found'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="mt-2 text-sm text-gray-700">
              Customer since {formatDate(customer.created_at)}
            </p>
          </div>
          <Link
            href={`/dashboard/customers/${customer.id}/edit`}
            className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <Edit className="h-4 w-4" />
            Edit Customer
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customer.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a 
                      href={`mailto:${customer.email}`}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      {customer.email}
                    </a>
                  </div>
                </div>
              )}

              {customer.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a 
                      href={`tel:${customer.phone}`}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      {customer.phone}
                    </a>
                  </div>
                </div>
              )}

              {customer.contact_person && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Primary Contact</label>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{customer.contact_person}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          {(customer.address_line1 || customer.city || customer.state) && (
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
              
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-900">
                  {customer.address_line1 && <div>{customer.address_line1}</div>}
                  {customer.address_line2 && <div>{customer.address_line2}</div>}
                  {(customer.city || customer.state || customer.postal_code) && (
                    <div>
                      {[customer.city, customer.state, customer.postal_code]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                  {customer.country && customer.country !== 'United States' && (
                    <div>{customer.country}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Link
                href={`/dashboard/quotes/new?customer_id=${customer.id}`}
                className="block w-full text-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Create Quote
              </Link>
              
              <Link
                href={`/dashboard/jobs/new?customer_name=${encodeURIComponent(customer.name)}`}
                className="block w-full text-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
              >
                Create Job
              </Link>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900">{formatDate(customer.created_at)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Updated:</span>
                <span className="text-gray-900">{formatDate(customer.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Related Items */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Related</h3>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div>Quotes: Coming soon</div>
              <div>Jobs: Coming soon</div>
              <div>Orders: Coming soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
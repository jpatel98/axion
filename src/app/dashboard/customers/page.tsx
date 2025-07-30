'use client'

import { useState, useEffect } from 'react'
import { Plus, Users, Mail, Phone, MapPin, Eye, Edit } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DataTable, Column } from '@/components/ui/data-table'
import { PageErrorBoundary } from '@/components/ui/error-boundaries'
import { Badge } from '@/components/ui/badge'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address_line1: string | null
  city: string | null
  state: string | null
  contact_person: string | null
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/v1/customers')
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      setCustomers(data.customers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium text-slate-800">{value}</div>
          {record.contact_person && (
            <div className="text-sm text-slate-800">Contact: {record.contact_person}</div>
          )}
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      render: (value) => value ? (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-slate-800" />
          <span className="text-sm">{value}</span>
        </div>
      ) : (
        <span className="text-slate-800 text-sm">No email</span>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value) => value ? (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-slate-800" />
          <span className="text-sm">{value}</span>
        </div>
      ) : (
        <span className="text-slate-800 text-sm">No phone</span>
      )
    },
    {
      key: 'location',
      title: 'Location',
      render: (_, record) => {
        const location = [record.city, record.state].filter(Boolean).join(', ')
        return location ? (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-800" />
            <span className="text-sm">{location}</span>
          </div>
        ) : (
          <span className="text-slate-800 text-sm">No location</span>
        )
      }
    },
    {
      key: 'created_at',
      title: 'Added',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-slate-800">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    }
  ]

  const handleView = (customer: Customer) => {
    router.push(`/dashboard/customers/${customer.id}`)
  }

  const handleEdit = (customer: Customer) => {
    router.push(`/dashboard/customers/${customer.id}/edit`)
  }

  return (
    <PageErrorBoundary pageTitle="Customers">
      <div>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
            <p className="mt-2 text-sm text-slate-800">
              Manage your customer database and contact information
            </p>
          </div>
          <Link
            href="/dashboard/customers/new"
            className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="h-4 w-4" />
            New Customer
          </Link>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden">
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="mt-2 text-sm font-semibold text-slate-800">No customers yet</h3>
              <p className="mt-1 text-sm text-slate-600">Get started by adding your first customer.</p>
              <div className="mt-6">
                <Link href="/dashboard/customers/new">
                  <button className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                    <Plus className="h-4 w-4" />
                    New Customer
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 active:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">
                        {customer.name}
                      </h3>
                      {customer.contact_person && (
                        <p className="text-sm text-slate-600 mt-1">
                          Contact: {customer.contact_person}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleView(customer)
                        }}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(customer)
                        }}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    
                    {(customer.city || customer.state) && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{[customer.city, customer.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs text-slate-500">
                      Added {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Data Table */}
        <div className="hidden md:block">
          <DataTable
          data={customers}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search customers..."
          onView={handleView}
          onEdit={handleEdit}
          showActions={true}
          emptyMessage="No customers found. Create your first customer to get started."
        />
        </div>
      </div>
    </PageErrorBoundary>
  )
}
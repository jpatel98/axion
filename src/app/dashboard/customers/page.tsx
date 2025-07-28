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
          <div className="font-medium text-gray-900">{value}</div>
          {record.contact_person && (
            <div className="text-sm text-gray-500">Contact: {record.contact_person}</div>
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
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">No email</span>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value) => value ? (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">No phone</span>
      )
    },
    {
      key: 'location',
      title: 'Location',
      render: (_, record) => {
        const location = [record.city, record.state].filter(Boolean).join(', ')
        return location ? (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{location}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">No location</span>
        )
      }
    },
    {
      key: 'created_at',
      title: 'Added',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
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
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="mt-2 text-sm text-gray-700">
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

        {/* Data Table */}
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
    </PageErrorBoundary>
  )
}
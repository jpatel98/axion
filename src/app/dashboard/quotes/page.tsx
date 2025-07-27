'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, FileText, Search, Filter, Eye, Edit } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/data-table'
import { PageErrorBoundary } from '@/components/ui/error-boundaries'
import { Badge } from '@/components/ui/badge'

interface Quote {
  id: string
  quote_number: string
  title: string
  status: string
  total: number
  created_at: string
  customers?: {
    name: string
  }
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/v1/quotes')
      if (response.ok) {
        const data = await response.json()
        setQuotes(data.quotes || [])
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      sent: "default", 
      accepted: "default",
      rejected: "destructive",
      expired: "outline"
    }
    
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      accepted: "bg-green-100 text-green-800", 
      rejected: "bg-red-100 text-red-800",
      expired: "bg-orange-100 text-orange-800"
    }

    return (
      <Badge className={colors[status] || colors.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const columns: Column<Quote>[] = [
    {
      key: 'quote_number',
      title: 'Quote #',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500 truncate max-w-[200px]">{record.title}</div>
        </div>
      )
    },
    {
      key: 'customers.name',
      title: 'Customer',
      sortable: true,
      render: (_, record) => (
        <span className="text-sm text-gray-900">
          {record.customers?.name || 'Unknown Customer'}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'total',
      title: 'Total',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(value || 0)}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'Created',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {formatDate(value)}
        </span>
      )
    }
  ]

  const handleView = (quote: Quote) => {
    router.push(`/dashboard/quotes/${quote.id}`)
  }

  const handleEdit = (quote: Quote) => {
    router.push(`/dashboard/quotes/${quote.id}`)
  }

  const getStatusCounts = () => {
    const counts = {
      all: quotes.length,
      draft: quotes.filter(q => q.status === 'draft').length,
      sent: quotes.filter(q => q.status === 'sent').length,
      accepted: quotes.filter(q => q.status === 'accepted').length,
      rejected: quotes.filter(q => q.status === 'rejected').length,
      expired: quotes.filter(q => q.status === 'expired').length,
    }
    return counts
  }

  const statusCounts = getStatusCounts()

  return (
    <PageErrorBoundary pageTitle="Quotes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
            <p className="text-gray-600">Manage your project quotes and proposals</p>
          </div>
          <Link href="/dashboard/quotes/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{statusCounts.draft}</div>
              <div className="text-sm text-gray-500">Draft</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.sent}</div>
              <div className="text-sm text-gray-500">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.accepted}</div>
              <div className="text-sm text-gray-500">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
              <div className="text-sm text-gray-500">Rejected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{statusCounts.expired}</div>
              <div className="text-sm text-gray-500">Expired</div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={quotes}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search quotes by number, title, or customer..."
          onView={handleView}
          onEdit={handleEdit}
          showActions={true}
          emptyMessage="No quotes found. Create your first quote to get started."
        />
      </div>
    </PageErrorBoundary>
  )
}
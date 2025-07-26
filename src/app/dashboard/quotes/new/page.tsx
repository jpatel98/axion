'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewQuotePage() {
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

      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900">Quote Creation Coming Soon</h3>
          <p className="mt-2 text-gray-600">The quote creation form is being implemented.</p>
          <div className="mt-6">
            <Link href="/dashboard/quotes" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Back to Quotes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
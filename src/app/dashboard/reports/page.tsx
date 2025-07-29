'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Download, 
  Calendar,
  Filter,
  PieChart,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [selectedReport, setSelectedReport] = useState('overview')

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'financial', name: 'Financial', icon: DollarSign },
    { id: 'production', name: 'Production', icon: Activity },
    { id: 'efficiency', name: 'Efficiency', icon: Clock }
  ]

  const periods = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ]

  // Note: This page will show real analytics once you have job data
  // For now, it serves as a placeholder for future reporting features

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
            <p className="mt-2 text-sm text-slate-800">
              Analyze your business performance and identify opportunities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-md border-slate-300 py-2 pl-3 pr-10 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedReport(type.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedReport === type.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-800 hover:text-slate-800'
              }`}
            >
              <type.icon className="h-4 w-4 mr-2" />
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics - Coming Soon */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-16 w-16 text-slate-800" />
            <h3 className="mt-4 text-lg font-medium text-slate-800">Analytics Dashboard Coming Soon</h3>
            <p className="mt-2 text-sm text-slate-800 max-w-md mx-auto">
              Once you start creating jobs and customers, this page will display comprehensive analytics including revenue trends, job completion rates, and performance metrics.
            </p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="border rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-slate-800 mx-auto mb-1" />
                <p className="text-xs text-slate-800">Total Revenue</p>
              </div>
              <div className="border rounded-lg p-3">
                <Activity className="h-6 w-6 text-slate-800 mx-auto mb-1" />
                <p className="text-xs text-slate-800">Completed Jobs</p>
              </div>
              <div className="border rounded-lg p-3">
                <BarChart3 className="h-6 w-6 text-slate-800 mx-auto mb-1" />
                <p className="text-xs text-slate-800">Avg Job Value</p>
              </div>
              <div className="border rounded-lg p-3">
                <Clock className="h-6 w-6 text-slate-800 mx-auto mb-1" />
                <p className="text-xs text-slate-800">On-Time Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-slate-800 mb-4">
              Revenue Trend
            </h3>
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-slate-800" />
              <p className="mt-2 text-sm text-slate-800">
                Interactive revenue chart will be displayed here
              </p>
              <p className="text-xs text-slate-800 mt-2">
                Integration with Recharts or Chart.js planned
              </p>
            </div>
          </div>
        </div>

        {/* Job Status Distribution */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-slate-800 mb-4">
              Job Status Distribution
            </h3>
            <div className="text-center py-12">
              <PieChart className="mx-auto h-12 w-12 text-slate-800" />
              <p className="mt-2 text-sm text-slate-800">
                Job status pie chart will be displayed here
              </p>
              <p className="text-xs text-slate-800 mt-2">
                Shows breakdown of pending, in-progress, and completed jobs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights - Coming Soon */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-slate-800 mb-4">
            Performance Insights
          </h3>
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-slate-800" />
            <p className="mt-2 text-sm text-slate-800">
              Performance insights and recommendations will appear here as you complete jobs
            </p>
            <p className="text-xs text-slate-800 mt-2">
              AI-powered insights to help optimize your business operations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
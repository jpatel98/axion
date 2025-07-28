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

  // Mock data for charts
  const mockStats = {
    totalRevenue: 125450,
    completedJobs: 47,
    avgJobValue: 2667,
    onTimeDelivery: 92,
    revenueGrowth: 12.5,
    jobsGrowth: 8.3,
    valueGrowth: 3.8,
    deliveryGrowth: 2.1
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="mt-2 text-sm text-gray-700">
              Analyze your business performance and identify opportunities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <type.icon className="h-4 w-4 mr-2" />
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(mockStats.totalRevenue)}
                  </dd>
                  <dd className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{mockStats.revenueGrowth}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed Jobs
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockStats.completedJobs}
                  </dd>
                  <dd className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{mockStats.jobsGrowth}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg Job Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(mockStats.avgJobValue)}
                  </dd>
                  <dd className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{mockStats.valueGrowth}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    On-Time Delivery
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockStats.onTimeDelivery}%
                  </dd>
                  <dd className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{mockStats.deliveryGrowth}%
                  </dd>
                </dl>
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
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Revenue Trend
            </h3>
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Interactive revenue chart will be displayed here
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Integration with Recharts or Chart.js planned
              </p>
            </div>
          </div>
        </div>

        {/* Job Status Distribution */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Job Status Distribution
            </h3>
            <div className="text-center py-12">
              <PieChart className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Job status pie chart will be displayed here
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Shows breakdown of pending, in-progress, and completed jobs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Performance Insights
          </h3>
          <div className="space-y-4">
            <div className="border-l-4 border-green-400 bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Great performance!</strong> Your on-time delivery rate improved by 2.1% this month.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Revenue growth:</strong> Monthly revenue increased by 12.5% compared to last month.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Opportunity:</strong> 3 jobs are currently overdue. Consider reviewing your scheduling process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
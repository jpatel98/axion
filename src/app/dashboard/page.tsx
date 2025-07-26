'use client'

import { useState, useEffect } from 'react'

interface DashboardStats {
  activeJobs: number
  pendingQuotes: number
  revenueThisMonth: number
  totalJobs: number
  completedJobs: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    pendingQuotes: 0,
    revenueThisMonth: 0,
    totalJobs: 0,
    completedJobs: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch jobs data
      const jobsResponse = await fetch('/api/v1/jobs')
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json()
        const jobs = jobsData.jobs || []
        
        // Calculate job stats
        const activeJobs = jobs.filter((job: any) => 
          job.status === 'in_progress' || job.status === 'pending'
        ).length
        
        const completedJobs = jobs.filter((job: any) => 
          job.status === 'completed' || job.status === 'shipped'
        ).length

        // Calculate revenue from completed jobs this month
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        
        const revenueThisMonth = jobs
          .filter((job: any) => {
            if (job.status !== 'completed' && job.status !== 'shipped') return false
            const jobDate = new Date(job.updated_at)
            return jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear
          })
          .reduce((sum: number, job: any) => sum + (job.estimated_cost || 0), 0)

        setStats(prev => ({
          ...prev,
          activeJobs,
          totalJobs: jobs.length,
          completedJobs,
          revenueThisMonth
        }))
      }

      // Fetch quotes data (when we have quotes implemented)
      try {
        const quotesResponse = await fetch('/api/v1/quotes')
        if (quotesResponse.ok) {
          const quotesData = await quotesResponse.json()
          const quotes = quotesData.quotes || []
          
          const pendingQuotes = quotes.filter((quote: any) => 
            quote.status === 'draft' || quote.status === 'sent'
          ).length

          setStats(prev => ({
            ...prev,
            pendingQuotes
          }))
        }
      } catch (error) {
        // Quotes not implemented yet, ignore error
        console.log('Quotes not yet implemented')
      }

    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome to Axion - your manufacturing command center
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Jobs */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">J</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Jobs
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.activeJobs}
                  </dd>
                  <dd className="text-xs text-gray-500">
                    pending & in progress
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Jobs */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed Jobs
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.completedJobs}
                  </dd>
                  <dd className="text-xs text-gray-500">
                    completed & shipped
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Quotes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Q</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Quotes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : stats.pendingQuotes}
                  </dd>
                  <dd className="text-xs text-gray-500">
                    draft & sent
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue This Month */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Revenue This Month
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? '...' : formatCurrency(stats.revenueThisMonth)}
                  </dd>
                  <dd className="text-xs text-gray-500">
                    completed jobs
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Getting Started
            </h3>
            <div className="prose text-sm text-gray-600">
              <p>Welcome to Axion! Here's how to get started:</p>
              <ol className="list-decimal list-inside mt-4 space-y-2">
                <li>Go to the <strong>Jobs</strong> section to view and manage your manufacturing jobs</li>
                <li>Add your first <strong>Customer</strong> to start creating quotes</li>
                <li>Create a <strong>Quote</strong> and convert it to a job</li>
                <li>Use the <strong>Scheduler</strong> to plan your production</li>
                <li>Track progress on the shop floor with the operator dashboard</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { ContentSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'

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
      // Parallel fetch for better performance
      const [jobsResponse, quotesResponse] = await Promise.allSettled([
        fetch('/api/v1/jobs?pageSize=1000'), // Get all jobs for stats
        fetch('/api/v1/quotes?pageSize=1000') // Get all quotes for stats
      ])

      // Process jobs data
      if (jobsResponse.status === 'fulfilled' && jobsResponse.value.ok) {
        const jobsData = await jobsResponse.value.json()
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

      // Process quotes data
      if (quotesResponse.status === 'fulfilled' && quotesResponse.value.ok) {
        const quotesData = await quotesResponse.value.json()
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
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount)
  }

  if (loading) {
    return <ContentSkeleton type="dashboard" />
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
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          subtitle="pending & in progress"
          icon={<span className="text-white text-sm font-medium">J</span>}
          iconBgColor="bg-blue-500"
        />
        
        <StatCard
          title="Completed Jobs"
          value={stats.completedJobs}
          subtitle="completed & shipped"
          icon={<span className="text-white text-sm font-medium">✓</span>}
          iconBgColor="bg-green-500"
        />
        
        <StatCard
          title="Pending Quotes"
          value={stats.pendingQuotes}
          subtitle="draft & sent"
          icon={<span className="text-white text-sm font-medium">Q</span>}
          iconBgColor="bg-yellow-500"
        />
        
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(stats.revenueThisMonth)}
          subtitle="completed jobs"
          icon={<span className="text-white text-sm font-medium">$</span>}
          iconBgColor="bg-purple-500"
        />
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
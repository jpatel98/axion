'use client'

import { useState, useEffect } from 'react'
import { ContentSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useUserRole } from '@/hooks/useUserRole'
import { useRealTimeJobs } from '@/hooks/useRealTimeJobs'
import { UserRole } from '@/lib/types/roles'
import { RoleBasedRedirect } from '@/components/rbac/RoleBasedRedirect'
import { ManagerOnly } from '@/components/rbac/PermissionGate'
import { logger } from '@/lib/logger'
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Factory,
  Users,
  Package,
  TrendingUp
} from 'lucide-react'

interface Job {
  id: string
  job_number: string
  customer_name: string
  part_number: string
  description: string
  quantity: number
  status: string
  due_date: string
  created_at: string
  updated_at?: string
  estimated_cost?: number
}

interface DashboardStats {
  activeJobs: number
  pendingQuotes: number
  revenueThisMonth: number
  totalJobs: number
  completedJobs: number
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUserRole()
  const { jobs: allJobs, loading: jobsLoading } = useRealTimeJobs()
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    pendingQuotes: 0,
    revenueThisMonth: 0,
    totalJobs: 0,
    completedJobs: 0
  })
  const [activeJobs, setActiveJobs] = useState<Job[]>([])
  const [quotesLoading, setQuotesLoading] = useState(true)

  useEffect(() => {
    fetchQuotesData()
  }, [])

  // Update stats when jobs data changes
  useEffect(() => {
    if (allJobs.length >= 0) { // Process even when there are 0 jobs
      processJobsData(allJobs)
    }
  }, [allJobs])

  // Redirect operators to their dashboard (after all hooks)
  if (!userLoading && user?.role === UserRole.OPERATOR) {
    return <RoleBasedRedirect />
  }

  const processJobsData = (jobs: Job[]) => {
    // Filter active jobs
    const activeJobsList = jobs.filter((job: Job) => 
      job.status === 'in_progress' || job.status === 'pending'
    )
    
    // Store active jobs for display
    setActiveJobs(activeJobsList)
    
    // Calculate job stats  
    const activeJobsCount = activeJobsList.length
    const completedJobsCount = jobs.filter((job: Job) => 
      job.status === 'completed' || job.status === 'shipped'
    ).length

    // Calculate revenue from completed jobs this month
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const revenueThisMonth = jobs
      .filter((job: Job) => {
        if (job.status !== 'completed' && job.status !== 'shipped') return false
        
        // Try updated_at first, fallback to created_at if updated_at is undefined
        const dateToUse = job.updated_at || job.created_at
        if (!dateToUse) {
          return true // Include jobs without dates for now
        }
        
        const jobDate = new Date(dateToUse)
        return jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear
      })
      .reduce((sum: number, job: Job) => sum + (job.estimated_cost || 0), 0)

    setStats(prev => ({
      ...prev,
      activeJobs: activeJobsCount,
      totalJobs: jobs.length,
      completedJobs: completedJobsCount,
      revenueThisMonth
    }))
  }

  const fetchQuotesData = async () => {
    try {
      const quotesResponse = await fetch('/api/v1/quotes?pageSize=1000')
      
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
      logger.error('Error fetching quotes data', {
        userId: user?.id,
        tenantId: user?.tenant_id,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'manager-dashboard'
      })
    } finally {
      setQuotesLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount)
  }

  const getProgressPercentage = (job: Job) => {
    // Calculate progress based on status and time elapsed
    if (job.status === 'pending') return 0
    if (job.status === 'completed' || job.status === 'shipped') return 100
    
    if (job.status === 'in_progress') {
      const createdDate = new Date(job.created_at)
      const dueDate = new Date(job.due_date)
      const now = new Date()
      
      // Calculate time-based progress
      const totalTime = dueDate.getTime() - createdDate.getTime()
      const elapsedTime = now.getTime() - createdDate.getTime()
      
      if (totalTime <= 0) return 50 // Default progress if due date is in the past or same as created
      
      const timeProgress = Math.min((elapsedTime / totalTime) * 100, 95) // Cap at 95% until completed
      
      // Add some variation based on job complexity (quantity as proxy)
      const complexityFactor = Math.min(job.quantity / 100, 1) // Normalize to 0-1
      const adjustedProgress = timeProgress * (0.8 + complexityFactor * 0.2)
      
      return Math.round(Math.max(5, Math.min(adjustedProgress, 95))) // Keep between 5-95%
    }
    
    return 0
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    return `${diffDays} days`
  }

  if (jobsLoading || userLoading) {
    return <ContentSkeleton type="dashboard" />
  }

  return (
    <ManagerOnly fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Manager Dashboard</h2>
          <p className="text-muted-foreground">
            This page is only accessible to managers.
          </p>
        </div>
      </div>
    }>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Manager Dashboard</h1>
          <p className="mt-2 text-sm text-slate-800">
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

      {/* Active Jobs Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Active Jobs
            </CardTitle>
            <CardDescription>
              Jobs currently in progress or pending start
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Active Jobs</h3>
                  <p className="text-sm text-muted-foreground">
                    All jobs are completed or there are no jobs created yet.
                  </p>
                  <Button className="mt-4" onClick={() => window.location.href = '/dashboard/jobs/new'}>
                    Create New Job
                  </Button>
                </div>
              ) : (
                activeJobs.slice(0, 5).map((job) => { // Show only first 5 jobs
                  const progress = getProgressPercentage(job)
                  const statusVariant = job.status === 'in_progress' ? 'default' : 'outline'
                  const isOverdue = new Date(job.due_date) < new Date() && job.status !== 'completed' && job.status !== 'shipped'
                  
                  return (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{job.job_number}</h4>
                          <Badge variant={statusVariant}>
                            {job.status === 'in_progress' ? 'In Progress' : 'Pending'}
                          </Badge>
                          {isOverdue && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {job.description} - Customer: {job.customer_name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            {Math.round(job.quantity * progress / 100)} / {job.quantity} units
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Due: {formatDueDate(job.due_date)}
                          </span>
                          {job.estimated_cost && (
                            <span className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              {formatCurrency(job.estimated_cost)}
                            </span>
                          )}
                        </div>
                        <Progress value={progress} className="mt-2" />
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button size="sm" onClick={() => window.location.href = `/dashboard/jobs/${job.id}`}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
              
              {activeJobs.length > 5 && (
                <div className="text-center pt-4 border-t">
                  <Button variant="outline" onClick={() => window.location.href = '/dashboard/jobs'}>
                    View All Jobs ({activeJobs.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-slate-800 mb-4">
              Getting Started
            </h3>
            <div className="prose text-sm text-slate-800">
              <p>Welcome to Axion! Here&apos;s how to get started:</p>
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
    </ManagerOnly>
  )
}
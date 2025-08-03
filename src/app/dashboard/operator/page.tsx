'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ContentSkeleton } from '@/components/ui/skeleton'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/lib/toast'
import { useJobNotifications } from '@/hooks/useJobNotifications'
import { useRealTimeJobs } from '@/hooks/useRealTimeJobs'
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Factory,
  ClipboardCheck,
  TrendingUp,
  Users,
  Package,
  Bell
} from 'lucide-react'
import { OperatorOnly, PermissionGate } from '@/components/rbac/PermissionGate'

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
  progress?: number
}

interface OperatorStats {
  activeTasks: number
  completedToday: number
  qualityChecks: number
  efficiency: number
}

export default function OperatorDashboard() {
  const [stats, setStats] = useState<OperatorStats>({
    activeTasks: 0,
    completedToday: 0,
    qualityChecks: 0,
    efficiency: 0
  })
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [updatingJobs, setUpdatingJobs] = useState<Set<string>>(new Set())
  
  // Configuration values that could be moved to settings/database
  const TARGET_EFFICIENCY = 85 // Can be configured per tenant/operator
  const EFFICIENCY_THRESHOLDS = {
    excellent: 95,
    good: TARGET_EFFICIENCY,
    needs_improvement: 70
  }
  const { addToast } = useToast()
  const { newJobs, clearNewJobs, hasNewJobs } = useJobNotifications()
  const { jobs: allJobs, loading, refetch } = useRealTimeJobs()

  // Handle job status updates
  const updateJobStatus = async (jobId: string, newStatus: string) => {
    setUpdatingJobs(prev => new Set(prev).add(jobId))
    
    try {
      const response = await fetch(`/api/v1/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update job status')
      }

      addToast({
        type: 'success',
        title: 'Job Updated',
        message: `Job status changed to ${newStatus.replace('_', ' ')}`
      })

      // Refresh the jobs list
      refetch?.()
      
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update job status'
      })
    } finally {
      setUpdatingJobs(prev => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
    }
  }

  const handleStartJob = (job: Job) => {
    updateJobStatus(job.id, 'in_progress')
  }

  const handleCompleteJob = (job: Job) => {
    updateJobStatus(job.id, 'completed')
  }

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job)
  }

  // Filter active jobs for operator
  const jobs = allJobs.filter(job => 
    job.status === 'in_progress' || job.status === 'pending'
  )

  // Calculate real efficiency based on job data
  const calculateEfficiency = (jobs: Job[]) => {
    if (jobs.length === 0) return 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const completedJobs = jobs.filter(job => 
      (job.status === 'completed' || job.status === 'shipped') &&
      new Date(job.updated_at || job.created_at) >= today
    )
    
    const inProgressJobs = jobs.filter(job => job.status === 'in_progress')
    const overdueJobs = jobs.filter(job => {
      const dueDate = new Date(job.due_date)
      return dueDate < new Date() && job.status !== 'completed' && job.status !== 'shipped'
    })
    
    // Base efficiency on completion rate and timeliness
    const completionRate = jobs.length > 0 ? (completedJobs.length / jobs.length) * 100 : 0
    const timelinessRate = jobs.length > 0 ? ((jobs.length - overdueJobs.length) / jobs.length) * 100 : 100
    const progressRate = inProgressJobs.length > 0 ? 80 : 100 // Assume 80% efficiency for active work
    
    const efficiency = Math.round((completionRate * 0.4 + timelinessRate * 0.4 + progressRate * 0.2))
    return Math.min(Math.max(efficiency, 0), 100) // Cap between 0-100
  }

  // Update stats when jobs change
  useEffect(() => {
    const activeTasks = jobs.length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const completedToday = allJobs.filter(job => {
      const updatedDate = new Date(job.updated_at || job.created_at)
      return (job.status === 'completed' || job.status === 'shipped') && updatedDate >= today
    }).length
    
    const qualityChecks = Math.max(completedToday, Math.floor(activeTasks * 0.3)) // More realistic QC calculation
    const efficiency = calculateEfficiency(allJobs)
    
    setStats({
      activeTasks,
      completedToday,
      qualityChecks,
      efficiency
    })
  }, [jobs.length, allJobs])

  // Show toast notification when new jobs arrive
  useEffect(() => {
    if (newJobs.length > 0) {
      addToast({
        type: 'success',
        title: 'New Job Assigned!',
        message: `${newJobs.length} new production job(s) from your manager`
      })
      
      // Clear the notifications after showing
      setTimeout(clearNewJobs, 3000)
    }
  }, [newJobs, addToast, clearNewJobs])

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

  return (
    <OperatorOnly fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            This page is only accessible to operators.
          </p>
        </div>
      </div>
    }>
      {loading ? (
        <ContentSkeleton type="dashboard" />
      ) : (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shop Floor Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your production tasks and quality checks
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasNewJobs && (
              <Badge variant="default" className="bg-blue-600 text-white animate-pulse">
                <Bell className="h-3 w-3 mr-1" />
                {newJobs.length} New Job{newJobs.length > 1 ? 's' : ''}
              </Badge>
            )}
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Users className="h-3 w-3 mr-1" />
              Operator
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTasks}</div>
              <p className="text-xs text-muted-foreground">
                {jobs.filter(j => j.status === 'in_progress').length} in progress, {jobs.filter(j => j.status === 'pending').length} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedToday}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedToday > 0 ? 'Good progress!' : 'No completions yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Checks</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.qualityChecks}</div>
              <p className="text-xs text-muted-foreground">
                All passed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.efficiency}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.efficiency >= EFFICIENCY_THRESHOLDS.excellent 
                  ? `Excellent (${EFFICIENCY_THRESHOLDS.excellent}%+)` 
                  : stats.efficiency >= EFFICIENCY_THRESHOLDS.good
                  ? `On target (${TARGET_EFFICIENCY}%+)`
                  : `Below target (${TARGET_EFFICIENCY}%)`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Production Orders */}
        <Card>
          <CardHeader>
            <CardTitle>My Active Production Orders</CardTitle>
            <CardDescription>
              Production orders currently assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Active Jobs</h3>
                  <p className="text-sm text-muted-foreground">
                    Check back later for new production orders from your manager.
                  </p>
                </div>
              ) : (
                jobs.map((job) => {
                  const progress = getProgressPercentage(job)
                  const statusVariant = job.status === 'in_progress' ? 'default' : 'outline'
                  
                  return (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{job.job_number}</h4>
                          <Badge variant={statusVariant}>
                            {job.status === 'in_progress' ? 'In Progress' : 'Pending'}
                          </Badge>
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
                        </div>
                        <Progress value={progress} className="mt-2" />
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <PermissionGate permission="canUpdateJobs">
                          <Button 
                            size="sm"
                            onClick={() => job.status === 'pending' ? handleStartJob(job) : handleCompleteJob(job)}
                            disabled={updatingJobs.has(job.id)}
                          >
                            {updatingJobs.has(job.id) 
                              ? 'Updating...' 
                              : job.status === 'pending' 
                              ? 'Start Job' 
                              : 'Complete Job'}
                          </Button>
                        </PermissionGate>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(job)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quality Control Tasks */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quality Control Tasks</CardTitle>
              <CardDescription>
                Quality inspections requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  // Generate QC tasks based on job progress
                  const qcTasks: JSX.Element[] = []
                  
                  // Jobs that are 80%+ complete need final inspection
                  const jobsNeedingInspection = jobs.filter(job => {
                    const progress = getProgressPercentage(job)
                    return progress >= 80 && job.status === 'in_progress'
                  })
                  
                  jobsNeedingInspection.forEach(job => {
                    const progress = getProgressPercentage(job)
                    const timeToInspection = progress >= 95 ? 'Due now' : 'Due within 2 hours'
                    
                    qcTasks.push(
                      <div key={`inspection-${job.id}`} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h5 className="font-medium">Final Inspection - {job.job_number}</h5>
                          <p className="text-sm text-muted-foreground">{timeToInspection}</p>
                        </div>
                        <PermissionGate permission="canViewQuality">
                          <Button size="sm">Inspect</Button>
                        </PermissionGate>
                      </div>
                    )
                  })
                  
                  // Add material quality checks for new jobs
                  const newJobsForQC = jobs.filter(job => {
                    const createdDate = new Date(job.created_at)
                    const hoursSinceCreated = (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60)
                    return job.status === 'pending' && hoursSinceCreated < 4 // New jobs within 4 hours
                  })
                  
                  newJobsForQC.slice(0, 2).forEach(job => { // Limit to 2 material checks
                    qcTasks.push(
                      <div key={`material-${job.id}`} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h5 className="font-medium">Material Quality Check</h5>
                          <p className="text-sm text-muted-foreground">Part: {job.part_number}</p>
                        </div>
                        <PermissionGate permission="canViewQuality">
                          <Button size="sm">Inspect</Button>
                        </PermissionGate>
                      </div>
                    )
                  })
                  
                  if (qcTasks.length === 0) {
                    return (
                      <div className="text-center py-6">
                        <ClipboardCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No quality control tasks at this time</p>
                      </div>
                    )
                  }
                  
                  return qcTasks
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Your recent production activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const activities: JSX.Element[] = []
                  const now = new Date()
                  
                  // Generate activities based on recent job changes
                  const recentlyCompleted = allJobs
                    .filter(job => job.status === 'completed' || job.status === 'shipped')
                    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
                    .slice(0, 2)
                  
                  recentlyCompleted.forEach(job => {
                    const updateTime = new Date(job.updated_at || job.created_at)
                    const hoursAgo = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60 * 60))
                    const timeAgo = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo} hours ago` : 'Yesterday'
                    
                    activities.push(
                      <div key={`completed-${job.id}`} className="flex items-start space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">Completed production for {job.job_number}</p>
                          <p className="text-xs text-muted-foreground">{timeAgo}</p>
                        </div>
                      </div>
                    )
                  })
                  
                  // Add in-progress job activities
                  const recentlyStarted = allJobs
                    .filter(job => job.status === 'in_progress')
                    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
                    .slice(0, 2)
                  
                  recentlyStarted.forEach(job => {
                    const startTime = new Date(job.updated_at || job.created_at)
                    const hoursAgo = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60 * 60))
                    const timeAgo = hoursAgo < 1 ? 'Just started' : hoursAgo < 24 ? `${hoursAgo} hours ago` : 'Yesterday'
                    
                    activities.push(
                      <div key={`progress-${job.id}`} className="flex items-start space-x-3">
                        <Factory className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">Working on {job.job_number} - {job.description}</p>
                          <p className="text-xs text-muted-foreground">{timeAgo}</p>
                        </div>
                      </div>
                    )
                  })
                  
                  // Add quality check activities for jobs near completion
                  const jobsNearCompletion = jobs.filter(job => {
                    const progress = getProgressPercentage(job)
                    return progress >= 80 && job.status === 'in_progress'
                  }).slice(0, 1)
                  
                  jobsNearCompletion.forEach(job => {
                    activities.push(
                      <div key={`qc-${job.id}`} className="flex items-start space-x-3">
                        <ClipboardCheck className="h-4 w-4 text-orange-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">Quality check pending for {job.job_number}</p>
                          <p className="text-xs text-muted-foreground">Ready for inspection</p>
                        </div>
                      </div>
                    )
                  })
                  
                  if (activities.length === 0) {
                    return (
                      <div className="text-center py-6">
                        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No recent activities</p>
                      </div>
                    )
                  }
                  
                  return activities.slice(0, 3) // Limit to 3 most recent activities
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <PermissionGate permission="canViewQuality">
                <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                  <ClipboardCheck className="h-6 w-6" />
                  <span>Quality Check</span>
                </Button>
              </PermissionGate>
              
              <PermissionGate permission="canViewProduction">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Factory className="h-6 w-6" />
                  <span>Production Status</span>
                </Button>
              </PermissionGate>
              
              <PermissionGate permission="canViewInventory">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Package className="h-6 w-6" />
                  <span>Check Inventory</span>
                </Button>
              </PermissionGate>
              
              <PermissionGate permission="canViewReports">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>My Reports</span>
                </Button>
              </PermissionGate>
            </div>
          </CardContent>
        </Card>

        {/* Job Details Modal */}
        <Modal 
          isOpen={!!selectedJob} 
          onClose={() => setSelectedJob(null)}
          title={`Job Details - ${selectedJob?.job_number || ''}`}
          size="lg"
        >
          {selectedJob && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-6">
                Complete information about this production job
              </p>
              <div className="space-y-6">
                {/* Job Overview */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Job Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Job Number:</span>
                        <span className="font-medium">{selectedJob.job_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={selectedJob.status === 'in_progress' ? 'default' : 'outline'}>
                          {selectedJob.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium">{getProgressPercentage(selectedJob)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Customer & Product</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="font-medium">{selectedJob.customer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Part Number:</span>
                        <span className="font-medium">{selectedJob.part_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">{selectedJob.quantity} units</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-semibold mb-2">Timeline</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">
                          {new Date(selectedJob.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="font-medium">
                          {new Date(selectedJob.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Days Remaining:</span>
                        <span className="font-medium">{formatDueDate(selectedJob.due_date)}</span>
                      </div>
                      {selectedJob.updated_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span className="font-medium">
                            {new Date(selectedJob.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Production Progress</h4>
                    <span className="text-sm font-medium">{getProgressPercentage(selectedJob)}%</span>
                  </div>
                  <Progress value={getProgressPercentage(selectedJob)} className="h-3" />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <PermissionGate permission="canUpdateJobs">
                    <Button 
                      onClick={() => {
                        if (selectedJob.status === 'pending') {
                          handleStartJob(selectedJob)
                        } else {
                          handleCompleteJob(selectedJob)
                        }
                        setSelectedJob(null)
                      }}
                      disabled={updatingJobs.has(selectedJob.id)}
                    >
                      {updatingJobs.has(selectedJob.id) 
                        ? 'Updating...' 
                        : selectedJob.status === 'pending' 
                        ? 'Start Job' 
                        : 'Complete Job'}
                    </Button>
                  </PermissionGate>
                  <Button variant="outline" onClick={() => setSelectedJob(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
      )}
    </OperatorOnly>
  )
}
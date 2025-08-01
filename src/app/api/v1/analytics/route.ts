import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

interface Job {
  id: string
  tenant_id: string
  job_number: string
  customer_name: string | null
  part_number: string | null
  description: string | null
  quantity: number
  estimated_cost: number | null
  actual_cost: number
  status: string
  due_date: string | null
  created_at: string
  updated_at: string
}

interface Quote {
  id: string
  tenant_id: string
  customer_id: string
  quote_number: string
  title: string | null
  description: string | null
  status: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  valid_until: string | null
  notes: string | null
  internal_notes: string | null
  created_at: string
  updated_at: string
}

interface WorkCenter {
  id: string
  tenant_id: string
  name: string
  machine_type: string | null
  description: string | null
  hourly_rate: number | null
  created_at: string
  updated_at: string
}

interface ScheduledOperation {
  id: string
  tenant_id: string
  job_operation_id: string
  scheduled_start: string
  scheduled_end: string
  actual_start: string | null
  actual_end: string | null
  notes: string | null
  job_operations: {
    id: string
    name: string
    estimated_hours: number
    status: string
    jobs: {
      job_number: string
      customer_name: string
      estimated_cost: number | null
      actual_cost: number
      status: string
    }
  }
  work_centers: {
    name: string
    machine_type: string | null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '30' // days
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(period))

    // Get user's tenant_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('clerk_user_id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tenantId = userData.tenant_id

    // Parallel queries for better performance
    const [
      jobsResponse,
      quotesResponse,
      operationsResponse,
      workCentersResponse
    ] = await Promise.allSettled([
      // Jobs analytics
      supabase
        .from('jobs')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // Quotes analytics  
      supabase
        .from('quotes')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // Operations analytics
      supabase
        .from('scheduled_operations')
        .select(`
          *,
          job_operations (
            id,
            name,
            estimated_hours,
            status,
            jobs (
              job_number,
              customer_name,
              estimated_cost,
              actual_cost,
              status
            )
          ),
          work_centers (
            name,
            machine_type
          )
        `)
        .eq('tenant_id', tenantId)
        .gte('scheduled_start', startDate.toISOString())
        .lte('scheduled_start', endDate.toISOString()),

      // Work centers utilization
      supabase
        .from('work_centers')
        .select('*')
        .eq('tenant_id', tenantId)
    ])

    const jobs: Job[] = jobsResponse.status === 'fulfilled' ? jobsResponse.value.data || [] : []
    const quotes: Quote[] = quotesResponse.status === 'fulfilled' ? quotesResponse.value.data || [] : []
    const operations: ScheduledOperation[] = operationsResponse.status === 'fulfilled' ? operationsResponse.value.data || [] : []
    const workCenters: WorkCenter[] = workCentersResponse.status === 'fulfilled' ? workCentersResponse.value.data || [] : []

    // Calculate key metrics
    const totalJobs = jobs.length
    const completedJobs = jobs.filter(job => job.status === 'completed' || job.status === 'shipped').length
    const activeJobs = jobs.filter(job => job.status === 'in_progress' || job.status === 'pending').length
    
    const totalRevenue = jobs
      .filter(job => job.status === 'completed' || job.status === 'shipped')
      .reduce((sum, job) => sum + (job.actual_cost || job.estimated_cost || 0), 0)
    
    const averageJobValue = totalJobs > 0 ? totalRevenue / completedJobs || 0 : 0
    
    const totalQuotes = quotes.length
    const pendingQuotes = quotes.filter(quote => quote.status === 'draft' || quote.status === 'sent').length
    const acceptedQuotes = quotes.filter(quote => quote.status === 'accepted').length
    const quoteConversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0

    // Job status distribution
    const jobStatusDistribution = {
      pending: jobs.filter(job => job.status === 'pending').length,
      in_progress: jobs.filter(job => job.status === 'in_progress').length,
      completed: jobs.filter(job => job.status === 'completed').length,
      shipped: jobs.filter(job => job.status === 'shipped').length
    }

    // Revenue trend (weekly breakdown)
    const revenueByWeek = []
    const weeksInPeriod = Math.ceil(parseInt(period) / 7)
    
    for (let i = 0; i < weeksInPeriod; i++) {
      const weekStart = new Date(startDate)
      weekStart.setDate(startDate.getDate() + (i * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      const weekRevenue = jobs
        .filter(job => {
          if (job.status !== 'completed' && job.status !== 'shipped') return false
          const jobDate = new Date(job.updated_at || job.created_at)
          return jobDate >= weekStart && jobDate <= weekEnd
        })
        .reduce((sum, job) => sum + (job.actual_cost || job.estimated_cost || 0), 0)
      
      revenueByWeek.push({
        week: `Week ${i + 1}`,
        date: weekStart.toISOString().split('T')[0],
        revenue: weekRevenue,
        jobs: jobs.filter(job => {
          if (job.status !== 'completed' && job.status !== 'shipped') return false
          const jobDate = new Date(job.updated_at || job.created_at)
          return jobDate >= weekStart && jobDate <= weekEnd
        }).length
      })
    }

    // Work center utilization
    const workCenterUtilization = workCenters.map((center: WorkCenter) => {
      const centerOperations = operations.filter((op: ScheduledOperation) => 
        op.work_centers && op.work_centers.name === center.name
      )
      
      const totalScheduledHours = centerOperations.reduce((sum: number, op: ScheduledOperation) => {
        const start = new Date(op.scheduled_start)
        const end = new Date(op.scheduled_end)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return sum + hours
      }, 0)
      
      // Assuming 8 hours per day for utilization calculation
      const availableHours = parseInt(period) * 8
      const utilizationRate = availableHours > 0 ? (totalScheduledHours / availableHours) * 100 : 0
      
      return {
        name: center.name,
        machineType: center.machine_type,
        scheduledHours: totalScheduledHours,
        utilizationRate: Math.min(100, utilizationRate), // Cap at 100%
        operationsCount: centerOperations.length
      }
    })

    // On-time delivery calculation
    const jobsWithDueDates = jobs.filter(job => job.due_date && (job.status === 'completed' || job.status === 'shipped'))
    const onTimeJobs = jobsWithDueDates.filter(job => {
      if (!job.due_date) return false
      const dueDate = new Date(job.due_date)
      const completedDate = new Date(job.updated_at || job.created_at)
      return completedDate <= dueDate
    })
    const onTimeDeliveryRate = jobsWithDueDates.length > 0 ? (onTimeJobs.length / jobsWithDueDates.length) * 100 : 0

    // Customer analysis
    const customerRevenue = jobs
      .filter(job => job.status === 'completed' || job.status === 'shipped')
      .reduce((acc: Record<string, number>, job: Job) => {
        const customer = job.customer_name || 'Unknown'
        acc[customer] = (acc[customer] || 0) + (job.actual_cost || job.estimated_cost || 0)
        return acc
      }, {} as Record<string, number>)

    const topCustomers = Object.entries(customerRevenue)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue: revenue as number }))

    const analytics = {
      period: parseInt(period),
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      keyMetrics: {
        totalRevenue,
        totalJobs,
        completedJobs,
        activeJobs,
        averageJobValue,
        totalQuotes,
        pendingQuotes,
        quoteConversionRate,
        onTimeDeliveryRate
      },
      charts: {
        jobStatusDistribution,
        revenueByWeek,
        workCenterUtilization,
        topCustomers
      },
      insights: {
        bestPerformingWorkCenter: workCenterUtilization.length > 0 
          ? workCenterUtilization.reduce((prev: typeof workCenterUtilization[0], current: typeof workCenterUtilization[0]) => 
              prev.utilizationRate > current.utilizationRate ? prev : current
            ).name 
          : null,
        averageJobDuration: operations.length > 0 
          ? operations.reduce((sum: number, op: ScheduledOperation) => {
              const start = new Date(op.scheduled_start)
              const end = new Date(op.scheduled_end)
              return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
            }, 0) / operations.length
          : 0,
        mostValuableCustomer: topCustomers[0]?.name || null
      }
    }

    return NextResponse.json({ analytics })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
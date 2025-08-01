'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Download, 
  PieChart,
  Activity,
  Users,
  Target,
  Briefcase,
  Factory,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { ContentSkeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'

interface AnalyticsData {
  period: number
  dateRange: {
    start: string
    end: string
  }
  keyMetrics: {
    totalRevenue: number
    totalJobs: number
    completedJobs: number
    activeJobs: number
    averageJobValue: number
    totalQuotes: number
    pendingQuotes: number
    quoteConversionRate: number
    onTimeDeliveryRate: number
  }
  charts: {
    jobStatusDistribution: {
      pending: number
      in_progress: number
      completed: number
      shipped: number
    }
    revenueByWeek: Array<{
      week: string
      date: string
      revenue: number
      jobs: number
    }>
    workCenterUtilization: Array<{
      name: string
      machineType: string
      scheduledHours: number
      utilizationRate: number
      operationsCount: number
    }>
    topCustomers: Array<{
      name: string
      revenue: number
    }>
  }
  insights: {
    bestPerformingWorkCenter: string | null
    averageJobDuration: number
    mostValuableCustomer: string | null
  }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [selectedReport, setSelectedReport] = useState('overview')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/v1/analytics?period=${selectedPeriod}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const exportToPDF = async () => {
    if (!dashboardRef.current || !analytics) return
    
    try {
      setExporting(true)
      
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Calculate dimensions
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      // Add header
      pdf.setFontSize(20)
      pdf.text('Analytics Report', 20, 20)
      pdf.setFontSize(12)
      pdf.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 30)
      pdf.text(`Period: ${periods.find(p => p.value === selectedPeriod)?.label}`, 20, 40)
      
      position = 50
      
      // Add the screenshot
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      // Add new pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      // Save the PDF
      const fileName = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <ContentSkeleton type="dashboard" />
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="mt-2 text-sm text-slate-800">
            Analyze your business performance and identify opportunities
          </p>
        </div>
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Unable to load analytics</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <button 
                  onClick={fetchAnalytics}
                  className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return <ContentSkeleton type="dashboard" />
  }

  const pieChartData = [
    { name: 'Pending', value: analytics.charts.jobStatusDistribution.pending, color: COLORS[0] },
    { name: 'In Progress', value: analytics.charts.jobStatusDistribution.in_progress, color: COLORS[1] },
    { name: 'Completed', value: analytics.charts.jobStatusDistribution.completed, color: COLORS[2] },
    { name: 'Shipped', value: analytics.charts.jobStatusDistribution.shipped, color: COLORS[3] }
  ].filter(item => item.value > 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            <Button 
              onClick={exportToPDF}
              disabled={exporting}
              className="flex items-center gap-2"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>
        </div>
      </div>

      <div ref={dashboardRef}>
        {/* Mobile Chart Tip */}
        {isMobile && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  💡 Rotate your device to landscape for better chart viewing
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Report Type Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-1 sm:space-x-1 sm:gap-0 bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`flex items-center px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none justify-center sm:justify-start ${
                  selectedReport === type.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-800 hover:text-slate-800'
                }`}
              >
                <type.icon className={`h-4 w-4 ${isMobile ? '' : 'mr-2'}`} />
                {!isMobile && type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(analytics.keyMetrics.totalRevenue)}
            subtitle={`${analytics.keyMetrics.completedJobs} completed jobs`}
            icon={<DollarSign className="h-5 w-5 text-white" />}
            iconBgColor="bg-green-500"
          />
          
          <StatCard
            title="Active Jobs"
            value={analytics.keyMetrics.activeJobs}
            subtitle={`${analytics.keyMetrics.totalJobs} total jobs`}
            icon={<Briefcase className="h-5 w-5 text-white" />}
            iconBgColor="bg-blue-500"
          />
          
          <StatCard
            title="Quote Conversion"
            value={formatPercentage(analytics.keyMetrics.quoteConversionRate)}
            subtitle={`${analytics.keyMetrics.pendingQuotes} pending quotes`}
            icon={<Target className="h-5 w-5 text-white" />}
            iconBgColor="bg-purple-500"
          />
          
          <StatCard
            title="On-Time Delivery"
            value={formatPercentage(analytics.keyMetrics.onTimeDeliveryRate)}
            subtitle="delivery performance"
            icon={<CheckCircle className="h-5 w-5 text-white" />}
            iconBgColor="bg-emerald-500"
          />
        </div>

        {/* Charts Section */}
        {selectedReport === 'overview' && (
          <div className="grid grid-cols-1 gap-6 mb-8"
            style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))' }}>
            {/* Revenue Trend Chart */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-slate-800 mb-4">
                  Revenue Trend
                </h3>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.charts.revenueByWeek}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="week" 
                        stroke="#6b7280"
                        fontSize={isMobile ? 8 : 10}
                        tick={{ fontSize: isMobile ? 8 : 10 }}
                        hide={isMobile}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={isMobile ? 8 : 10}
                        tick={{ fontSize: isMobile ? 8 : 10 }}
                        tickFormatter={(value) => {
                          // Shorter format on mobile
                          if (isMobile) {
                            return `$${(value / 1000).toFixed(0)}k`
                          }
                          return formatCurrency(value)
                        }}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{ 
                          backgroundColor: '#f9fafb', 
                          border: '1px solid #e5e7eb',
                          fontSize: '12px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        fill="#3b82f6"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Job Status Distribution */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-slate-800 mb-4">
                  Job Status Distribution
                </h3>
                <div className="h-64 sm:h-80">
                  {pieChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 40 : 60}
                          outerRadius={isMobile ? 80 : 120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [value, 'Jobs']}
                          contentStyle={{ 
                            backgroundColor: '#f9fafb', 
                            border: '1px solid #e5e7eb',
                            fontSize: isMobile ? '12px' : '14px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={isMobile ? 24 : 36}
                          wrapperStyle={{ 
                            paddingTop: '20px',
                            fontSize: isMobile ? '12px' : '14px'
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      <div className="text-center">
                        <PieChart className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">No job data available</p>
                        {isMobile && (
                          <p className="text-xs mt-1 text-slate-400">
                            Create jobs to see distribution
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Report */}
        {selectedReport === 'financial' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Customers */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-slate-800 mb-4">
                  Top Customers by Revenue
                </h3>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.charts.topCustomers}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6b7280"
                        fontSize={isMobile ? 8 : 10}
                        angle={isMobile ? -90 : -45}
                        textAnchor="end"
                        height={isMobile ? 80 : 100}
                        interval={0}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={isMobile ? 8 : 10}
                        tickFormatter={(value) => {
                          if (isMobile) {
                            return `$${(value / 1000).toFixed(0)}k`
                          }
                          return formatCurrency(value)
                        }}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                        contentStyle={{ 
                          backgroundColor: '#f9fafb', 
                          border: '1px solid #e5e7eb',
                          fontSize: isMobile ? '12px' : '14px'
                        }}
                      />
                      <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Revenue vs Jobs */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-slate-800 mb-4">
                  Revenue vs Jobs Completed
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.charts.revenueByWeek}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                      <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue" />
                      <Bar yAxisId="right" dataKey="jobs" fill="#10b981" name="Jobs" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Production Report */}
        {selectedReport === 'production' && (
          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Work Center Utilization */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-slate-800 mb-4">
                  Work Center Utilization
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.charts.workCenterUtilization}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6b7280"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'utilizationRate') return [`${Number(value).toFixed(1)}%`, 'Utilization']
                          if (name === 'scheduledHours') return [`${Number(value).toFixed(1)}h`, 'Scheduled Hours']
                          return [value, name]
                        }}
                        contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                      />
                      <Legend />
                      <Bar dataKey="utilizationRate" fill="#8b5cf6" name="Utilization %" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Efficiency Report */}
        {selectedReport === 'efficiency' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Factory className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      Best Work Center
                    </dt>
                    <dd className="text-lg font-medium text-slate-900">
                      {analytics.insights.bestPerformingWorkCenter || 'N/A'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      Avg Job Duration
                    </dt>
                    <dd className="text-lg font-medium text-slate-900">
                      {analytics.insights.averageJobDuration.toFixed(1)}h
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      Top Customer
                    </dt>
                    <dd className="text-lg font-medium text-slate-900">
                      {analytics.insights.mostValuableCustomer || 'N/A'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Insights */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-slate-800 mb-4">
              Performance Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h4 className="ml-2 text-sm font-medium text-blue-900">Revenue Growth</h4>
                </div>
                <p className="mt-2 text-xs text-blue-700">
                  {analytics.keyMetrics.totalRevenue > 0 
                    ? `Generated ${formatCurrency(analytics.keyMetrics.totalRevenue)} in the last ${analytics.period} days`
                    : 'Start completing jobs to track revenue growth'
                  }
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="ml-2 text-sm font-medium text-green-900">Completion Rate</h4>
                </div>
                <p className="mt-2 text-xs text-green-700">
                  {analytics.keyMetrics.totalJobs > 0
                    ? `${((analytics.keyMetrics.completedJobs / analytics.keyMetrics.totalJobs) * 100).toFixed(1)}% of jobs completed successfully`
                    : 'No jobs data available yet'
                  }
                </p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h4 className="ml-2 text-sm font-medium text-purple-900">Quote Success</h4>
                </div>
                <p className="mt-2 text-xs text-purple-700">
                  {analytics.keyMetrics.totalQuotes > 0
                    ? `${formatPercentage(analytics.keyMetrics.quoteConversionRate)} of quotes converted to jobs`
                    : 'Start creating quotes to track conversion rates'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
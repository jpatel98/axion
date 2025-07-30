'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Factory } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ContentSkeleton } from '@/components/ui/skeleton'
import { useToast } from '@/lib/toast'

const machineTypes = [
  'CNC Milling',
  'CNC Lathe',
  'VMC',
  'Manual Mill',
  'Manual Lathe',
  'Drill Press',
  'Grinder',
  'Welding Station',
  'Assembly Station',
  'Inspection Station',
  'Other'
]

interface WorkCenter {
  id: string
  name: string
  description: string | null
  machine_type: string | null
  capacity_hours_per_day: number
  is_active: boolean
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditWorkCenterPage({ params }: PageProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    machine_type: '',
    capacity_hours_per_day: 8.0,
    is_active: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [workCenterId, setWorkCenterId] = useState<string | null>(null)
  const router = useRouter()
  const { addToast } = useToast()

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params
      setWorkCenterId(id)
      fetchWorkCenter(id)
    }
    loadParams()
  }, [params])

  const fetchWorkCenter = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/work-centers/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          addToast({
            type: 'error',
            title: 'Not Found',
            message: 'Work center not found'
          })
          router.push('/dashboard/work-centers')
          return
        }
        throw new Error('Failed to fetch work center')
      }

      const data = await response.json()
      const workCenter: WorkCenter = data.workCenter
      
      setFormData({
        name: workCenter.name,
        description: workCenter.description || '',
        machine_type: workCenter.machine_type || '',
        capacity_hours_per_day: workCenter.capacity_hours_per_day,
        is_active: workCenter.is_active
      })
    } catch (error) {
      console.error('Error fetching work center:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load work center'
      })
      router.push('/dashboard/work-centers')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (formData.capacity_hours_per_day <= 0) {
      newErrors.capacity_hours_per_day = 'Capacity must be greater than 0'
    }

    if (formData.capacity_hours_per_day > 24) {
      newErrors.capacity_hours_per_day = 'Capacity cannot exceed 24 hours per day'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      if (!workCenterId) return

      const response = await fetch(`/api/v1/work-centers/${workCenterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update work center')
      }

      addToast({
        type: 'success',
        title: 'Success',
        message: `Work center "${formData.name}" updated successfully!`
      })

      router.push('/dashboard/work-centers')
    } catch (error) {
      console.error('Error updating work center:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update work center'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <ContentSkeleton type="form" />
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link 
            href="/dashboard/work-centers"
            className="text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Factory className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Edit Work Center</h1>
          </div>
        </div>
        <p className="text-sm text-slate-600 ml-9">
          Update work center information and settings
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., CNC Mill #1, Lathe Station A"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Machine Type
                  </label>
                  <select
                    value={formData.machine_type}
                    onChange={(e) => handleInputChange('machine_type', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-base text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Select machine type</option>
                    {machineTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Optional description of this work center"
                    className="mt-1 block w-full rounded-md border border-slate-300 bg-white shadow-sm text-slate-800 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Capacity Settings */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-slate-800 mb-4">
                Capacity Settings
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Daily Capacity (hours) *
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={formData.capacity_hours_per_day}
                    onChange={(e) => handleInputChange('capacity_hours_per_day', parseFloat(e.target.value))}
                    className={errors.capacity_hours_per_day ? 'border-red-500' : ''}
                  />
                  {errors.capacity_hours_per_day && (
                    <p className="mt-1 text-sm text-red-600">{errors.capacity_hours_per_day}</p>
                  )}
                  <p className="mt-1 text-sm text-slate-500">
                    Available working hours per day for this work center
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-slate-700">
                    Active (available for scheduling)
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
              <Link href="/dashboard/work-centers">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
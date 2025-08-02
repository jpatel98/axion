'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  User, 
  Bell, 
  Save,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/lib/toast'
import { useUserRole } from '@/hooks/useUserRole'
import { UserRole } from '@/lib/types/roles'
import Link from 'next/link'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()
  const { user } = useUserRole()
  const [settings, setSettings] = useState({
    // Profile settings
    companyName: '',
    contactEmail: '',
    phone: '',
    address: '',
    
    // Notification settings
    emailNotifications: true,
    jobCompletionNotifications: true,
    inventoryAlerts: true,
    quoteReminders: true,
    
    // System settings
    currency: 'CAD',
    timezone: 'America/Toronto',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-CA'
  })

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/v1/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load settings'
        })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [addToast])

  const tabs = [
    { id: 'profile', name: 'Company Profile', icon: User },
    ...(user?.role === UserRole.MANAGER ? [{ id: 'users', name: 'Team Management', icon: Users }] : []),
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'system', name: 'System', icon: Settings }
  ]

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/v1/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Settings saved successfully!'
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save settings'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div suppressHydrationWarning>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="mt-2 text-sm text-slate-800">
          Manage your account, notifications, and system preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-slate-800 hover:text-slate-800 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-2xl">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {/* Company Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-slate-800">
                      Company Information
                    </h3>
                    <p className="mt-1 text-sm text-slate-800">
                      Update your company details and contact information.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-800">
                        Company Name
                      </label>
                      <Input
                        value={settings.companyName}
                        onChange={(e) => handleSettingChange('companyName', e.target.value)}
                        className="mt-1 border border-slate-300 bg-white shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800">
                        Contact Email
                      </label>
                      <Input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                        className="mt-1 border border-slate-300 bg-white shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800">
                        Phone Number
                      </label>
                      <Input
                        value={settings.phone}
                        onChange={(e) => handleSettingChange('phone', e.target.value)}
                        className="mt-1 border border-slate-300 bg-white shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800">
                        Address
                      </label>
                      <textarea
                        rows={3}
                        value={settings.address}
                        onChange={(e) => handleSettingChange('address', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-slate-300 bg-white shadow-sm text-slate-800 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-slate-800">
                      Notification Preferences
                    </h3>
                    <p className="mt-1 text-sm text-slate-800">
                      Choose what notifications you want to receive.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email updates' },
                      { key: 'jobCompletionNotifications', label: 'Job Completion', description: 'Get notified when jobs are completed' },
                      { key: 'inventoryAlerts', label: 'Inventory Alerts', description: 'Low stock and reorder notifications' },
                      { key: 'quoteReminders', label: 'Quote Reminders', description: 'Reminders for pending quotes' }
                    ].map((notification) => (
                      <div key={notification.key} className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-slate-800">{notification.label}</h4>
                          <p className="text-sm text-slate-800">{notification.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings[notification.key as keyof typeof settings] as boolean}
                            onChange={(e) => handleSettingChange(notification.key, e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${
                            settings[notification.key as keyof typeof settings] 
                              ? 'bg-blue-600' 
                              : 'bg-gray-200'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                              settings[notification.key as keyof typeof settings]
                                ? 'translate-x-5'
                                : 'translate-x-0.5'
                            } mt-0.5`} />
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Tab */}
              {activeTab === 'system' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-slate-800">
                      System Preferences
                    </h3>
                    <p className="mt-1 text-sm text-slate-800">
                      Configure system-wide settings and defaults.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-800">
                        Currency
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-base text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="CAD">Canadian Dollar (CAD)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800">
                        Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-base text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="America/Toronto">Eastern Time</option>
                        <option value="America/Vancouver">Pacific Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-800">
                        Date Format
                      </label>
                      <select
                        value={settings.dateFormat}
                        onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-base text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Management Tab - Managers Only */}
              {activeTab === 'users' && user?.role === UserRole.MANAGER && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-slate-800">
                      Team Management
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Manage your team members and their access levels.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900">Full User Management</h4>
                        <p className="text-sm text-blue-700">
                          Invite team members, assign roles, and manage access levels.
                        </p>
                      </div>
                      <Link href="/dashboard/settings/users">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Users className="h-4 w-4 mr-2" />
                          Manage Users
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
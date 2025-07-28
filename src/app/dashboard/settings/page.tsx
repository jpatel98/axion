'use client'

import { useState } from 'react'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette,
  Mail,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showApiKey, setShowApiKey] = useState(false)
  const [settings, setSettings] = useState({
    // Profile settings
    companyName: 'Acme Manufacturing',
    contactEmail: 'admin@acme.com',
    phone: '+1 (555) 123-4567',
    address: '123 Industrial Ave, Manufacturing City, MC 12345',
    
    // Notification settings
    emailNotifications: true,
    jobCompletionNotifications: true,
    inventoryAlerts: true,
    quoteReminders: true,
    
    // System settings
    currency: 'CAD',
    timezone: 'America/Toronto',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-CA',
    
    // Security settings
    twoFactorEnabled: false,
    sessionTimeout: 60,
    apiKey: 'axn_live_1234567890abcdef'
  })

  const tabs = [
    { id: 'profile', name: 'Company Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'system', name: 'System', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Database }
  ]

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    // Here you would save settings to your backend
    console.log('Saving settings:', settings)
    // Show success toast
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-700">
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
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Company Information
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Update your company details and contact information.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <Input
                        value={settings.companyName}
                        onChange={(e) => handleSettingChange('companyName', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Contact Email
                      </label>
                      <Input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <Input
                        value={settings.phone}
                        onChange={(e) => handleSettingChange('phone', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <textarea
                        rows={3}
                        value={settings.address}
                        onChange={(e) => handleSettingChange('address', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Notification Preferences
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
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
                          <h4 className="text-sm font-medium text-gray-900">{notification.label}</h4>
                          <p className="text-sm text-gray-500">{notification.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings[notification.key as keyof typeof settings] as boolean}
                            onChange={(e) => handleSettingChange(notification.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      System Preferences
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure system-wide settings and defaults.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Currency
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="CAD">Canadian Dollar (CAD)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="America/Toronto">Eastern Time</option>
                        <option value="America/Vancouver">Pacific Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date Format
                      </label>
                      <select
                        value={settings.dateFormat}
                        onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Security Settings
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage your account security and API access.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" size="sm">
                        {settings.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Session Timeout (minutes)
                      </label>
                      <Input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                        className="mt-1 max-w-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        API Key
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <Input
                          type={showApiKey ? 'text' : 'password'}
                          value={settings.apiKey}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm">
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Third-Party Integrations
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Connect with external tools and services.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'QuickBooks', description: 'Sync financial data', status: 'Not Connected' },
                      { name: 'Slack', description: 'Get notifications in Slack', status: 'Connected' },
                      { name: 'Zapier', description: 'Automate workflows', status: 'Not Connected' }
                    ].map((integration) => (
                      <div key={integration.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{integration.name}</h4>
                          <p className="text-sm text-gray-500">{integration.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            integration.status === 'Connected' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {integration.status}
                          </span>
                          <Button variant="outline" size="sm">
                            {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
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
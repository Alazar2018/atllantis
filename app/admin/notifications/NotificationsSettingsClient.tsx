'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, Webhook, TestTube, Save, AlertTriangle } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface NotificationSettings {
  low_stock_threshold: number
  email_notifications_enabled: boolean
  webhook_notifications_enabled: boolean
  webhook_url: string
  admin_email: string
}

export default function NotificationsClient() {
  const [settings, setSettings] = useState<NotificationSettings>({
    low_stock_threshold: 10,
    email_notifications_enabled: true,
    webhook_notifications_enabled: false,
    webhook_url: '',
    admin_email: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testingWebhook, setTestingWebhook] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/notifications/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('Notification settings saved successfully!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to save settings')
      }
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!settings.admin_email) {
      toast.error('Please enter an admin email address first')
      return
    }

    setTestingEmail(true)
    try {
      const response = await fetch('/api/admin/notifications/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ admin_email: settings.admin_email })
      })

      if (response.ok) {
        toast.success('Test email sent successfully!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to send test email')
      }
    } catch (error) {
      toast.error('Failed to send test email')
    } finally {
      setTestingEmail(false)
    }
  }

  const handleTestWebhook = async () => {
    if (!settings.webhook_url) {
      toast.error('Please enter a webhook URL first')
      return
    }

    setTestingWebhook(true)
    try {
      const response = await fetch('/api/admin/notifications/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ webhook_url: settings.webhook_url })
      })

      if (response.ok) {
        toast.success('Test webhook sent successfully!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to send test webhook')
      }
    } catch (error) {
      toast.error('Failed to send test webhook')
    } finally {
      setTestingWebhook(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-green-500 rounded-xl">
          <Bell className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600">Configure low stock alerts and notifications</p>
        </div>
      </div>

      {/* Current Admin Email Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <Mail className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Current Admin Email</h3>
            <p className="text-blue-700 font-mono text-sm">
              {settings.admin_email || 'Not set'}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              This email receives both order notifications and low stock alerts
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Threshold */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">Low Stock Threshold</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Level Threshold
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="0"
                max="1000"
                value={settings.low_stock_threshold}
                onChange={(e) => setSettings({
                  ...settings,
                  low_stock_threshold: parseInt(e.target.value) || 0
                })}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-600">units</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Products with stock at or below this level will trigger notifications
            </p>
          </div>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Mail className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="email-enabled"
              checked={settings.email_notifications_enabled}
              onChange={(e) => setSettings({
                ...settings,
                email_notifications_enabled: e.target.checked
              })}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="email-enabled" className="text-sm font-medium text-gray-700">
              Enable email notifications
            </label>
          </div>

          {settings.email_notifications_enabled && (
            <div className="space-y-4 pl-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email Address
                </label>
                <div className="space-y-2">
                  <input
                    type="email"
                    value={settings.admin_email}
                    onChange={(e) => setSettings({
                      ...settings,
                      admin_email: e.target.value
                    })}
                    placeholder="molaberiandsons123@gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>💡</span>
                      <span>This email will receive low stock alerts (same as order notifications)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({
                        ...settings,
                        admin_email: 'molaberiandsons123@gmail.com'
                      })}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Use Order Admin Email
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleTestEmail}
                disabled={testingEmail || !settings.admin_email}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TestTube className="h-4 w-4" />
                <span>{testingEmail ? 'Sending...' : 'Send Test Email'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Webhook Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Webhook className="h-5 w-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-900">Webhook Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="webhook-enabled"
              checked={settings.webhook_notifications_enabled}
              onChange={(e) => setSettings({
                ...settings,
                webhook_notifications_enabled: e.target.checked
              })}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="webhook-enabled" className="text-sm font-medium text-gray-700">
              Enable webhook notifications
            </label>
          </div>

          {settings.webhook_notifications_enabled && (
            <div className="space-y-4 pl-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={settings.webhook_url}
                  onChange={(e) => setSettings({
                    ...settings,
                    webhook_url: e.target.value
                  })}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  The webhook will receive JSON payloads with low stock information
                </p>
              </div>
              
              <button
                onClick={handleTestWebhook}
                disabled={testingWebhook || !settings.webhook_url}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TestTube className="h-4 w-4" />
                <span>{testingWebhook ? 'Sending...' : 'Send Test Webhook'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-5 w-5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}
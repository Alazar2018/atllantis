'use client'

import { useState, useEffect } from 'react'
import { Webhook, Slack, MessageSquare, Zap, TestTube, Save, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface WebhookSettings {
  webhook_notifications_enabled: boolean
  webhook_url: string
  slack_webhook_url: string
  discord_webhook_url: string
  custom_webhook_url: string
}

export default function WebhooksClient() {
  const [settings, setSettings] = useState<WebhookSettings>({
    webhook_notifications_enabled: false,
    webhook_url: '',
    slack_webhook_url: '',
    discord_webhook_url: '',
    custom_webhook_url: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/webhooks/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Error fetching webhook settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/webhooks/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('Webhook settings saved successfully!')
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

  const handleTest = async (platform: string) => {
    const urlKey = `${platform}_webhook_url`
    const url = settings[urlKey as keyof WebhookSettings] as string

    if (!url) {
      toast.error(`Please enter a ${platform} webhook URL first`)
      return
    }

    setTesting(prev => ({ ...prev, [platform]: true }))
    try {
      const response = await fetch(`/api/admin/webhooks/test/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ [`${platform}_webhook_url`]: url })
      })

      if (response.ok) {
        toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} webhook test successful!`)
      } else {
        const error = await response.json()
        toast.error(error.message || `Failed to test ${platform} webhook`)
      }
    } catch (error) {
      toast.error(`Failed to test ${platform} webhook`)
    } finally {
      setTesting(prev => ({ ...prev, [platform]: false }))
    }
  }

  const handleInputChange = (field: keyof WebhookSettings, value: string | boolean) => {
    setSettings({
      ...settings,
      [field]: value
    })
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
        <div className="p-3 bg-purple-500 rounded-xl">
          <Webhook className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhook Settings</h1>
          <p className="text-gray-600">Configure webhook notifications for orders and low stock alerts</p>
        </div>
      </div>

      {/* Webhook Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="h-5 w-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-900">Webhook Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="webhook-enabled"
              checked={settings.webhook_notifications_enabled}
              onChange={(e) => handleInputChange('webhook_notifications_enabled', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="webhook-enabled" className="text-sm font-medium text-gray-700">
              Enable webhook notifications
            </label>
          </div>

          {settings.webhook_notifications_enabled && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Webhook notifications will be sent for:</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1 ml-6">
                <li>• New orders placed by customers</li>
                <li>• Low stock alerts when inventory is below threshold</li>
                <li>• Order status updates (if configured)</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Slack Webhook */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Slack className="h-5 w-5 text-pink-500" />
          <h2 className="text-lg font-semibold text-gray-900">Slack Integration</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slack Webhook URL
            </label>
            <input
              type="url"
              value={settings.slack_webhook_url}
              onChange={(e) => handleInputChange('slack_webhook_url', e.target.value)}
              placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Get your webhook URL from Slack App settings → Incoming Webhooks
            </p>
          </div>
          
          <button
            onClick={() => handleTest('slack')}
            disabled={testing.slack || !settings.slack_webhook_url}
            className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TestTube className="h-4 w-4" />
            <span>{testing.slack ? 'Testing...' : 'Test Slack Webhook'}</span>
          </button>
        </div>
      </div>

      {/* Discord Webhook */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MessageSquare className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900">Discord Integration</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discord Webhook URL
            </label>
            <input
              type="url"
              value={settings.discord_webhook_url}
              onChange={(e) => handleInputChange('discord_webhook_url', e.target.value)}
              placeholder="https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Get your webhook URL from Discord Server Settings → Integrations → Webhooks
            </p>
          </div>
          
          <button
            onClick={() => handleTest('discord')}
            disabled={testing.discord || !settings.discord_webhook_url}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TestTube className="h-4 w-4" />
            <span>{testing.discord ? 'Testing...' : 'Test Discord Webhook'}</span>
          </button>
        </div>
      </div>

      {/* Custom Webhook */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Webhook className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Custom Webhook</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Webhook URL
            </label>
            <input
              type="url"
              value={settings.custom_webhook_url}
              onChange={(e) => handleInputChange('custom_webhook_url', e.target.value)}
              placeholder="https://your-custom-service.com/webhook"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Send raw JSON payloads to your custom service
            </p>
          </div>
          
          <button
            onClick={() => handleTest('custom')}
            disabled={testing.custom || !settings.custom_webhook_url}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TestTube className="h-4 w-4" />
            <span>{testing.custom ? 'Testing...' : 'Test Custom Webhook'}</span>
          </button>
        </div>
      </div>

      {/* Webhook Payload Examples */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-900">Webhook Payload Examples</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Order Notification Payload:</h3>
            <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
{`{
  "event": "new_order",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "order": {
    "id": 123,
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+251911123456",
    "total_amount": 1500.00,
    "status": "pending",
    "items": [...]
  },
  "admin_url": "https://your-site.com/admin/orders/123"
}`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Low Stock Alert Payload:</h3>
            <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
{`{
  "event": "low_stock_alert",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "threshold": 10,
  "product_count": 3,
  "products": [
    {
      "id": 1,
      "title": "Leather Jacket",
      "stock_quantity": 5,
      "price": 2500.00,
      "category": "Jackets"
    }
  ],
  "admin_url": "https://your-site.com/admin/products"
}`}
            </pre>
          </div>
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
          <span>{saving ? 'Saving...' : 'Save Webhook Settings'}</span>
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

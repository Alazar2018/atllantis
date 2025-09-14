'use client'

import { useState, useEffect } from 'react'
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Users, 
  Phone,
  Calendar,
  Eye,
  Trash2,
  Plus
} from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { fetchWithAuth } from '@/lib/authUtils'

interface CommunicationLog {
  id: number
  type: 'email' | 'sms'
  recipient: string
  subject?: string
  message: string
  status: 'sent' | 'failed' | 'pending'
  createdAt: string
  sentBy: string
}

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  lastOrderDate?: string
}

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([])
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [smsMessage, setSmsMessage] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showSmsForm, setShowSmsForm] = useState(false)

  useEffect(() => {
    fetchCustomers()
    fetchCommunicationLogs()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetchWithAuth('/api/admin/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchCommunicationLogs = async () => {
    try {
      const response = await fetchWithAuth('/api/admin/communication/logs')
      if (response.ok) {
        const data = await response.json()
        setCommunicationLogs(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching communication logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerSelection = (customerId: number) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleSelectAllCustomers = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(customers.map(c => c.id))
    }
  }

  const handleSendEmail = () => {
    // TODO: Implement email sending with backend API
    if (selectedCustomers.length === 0 || !emailSubject || !emailMessage) {
      alert('Please select customers and fill in subject and message')
      return
    }

    const newLogs: CommunicationLog[] = selectedCustomers.map(customerId => {
      const customer = customers.find(c => c.id === customerId)!
      return {
        id: Date.now() + customerId,
        type: 'email',
        recipient: customer.email,
        subject: emailSubject,
        message: emailMessage,
        status: 'sent',
        createdAt: new Date().toISOString(),
        sentBy: 'Admin'
      }
    })

    setCommunicationLogs(prev => [...newLogs, ...prev])
    setSelectedCustomers([])
    setEmailSubject('')
    setEmailMessage('')
    setShowEmailForm(false)
  }

  const handleSendSMS = () => {
    // TODO: Implement SMS sending with backend API
    if (selectedCustomers.length === 0 || !smsMessage) {
      alert('Please select customers and fill in message')
      return
    }

    const newLogs: CommunicationLog[] = selectedCustomers.map(customerId => {
      const customer = customers.find(c => c.id === customerId)!
      return {
        id: Date.now() + customerId,
        type: 'sms',
        recipient: customer.phone,
        message: smsMessage,
        status: 'sent',
        createdAt: new Date().toISOString(),
        sentBy: 'Admin'
      }
    })

    setCommunicationLogs(prev => [...newLogs, ...prev])
    setSelectedCustomers([])
    setSmsMessage('')
    setShowSmsForm(false)
  }

  const getStatusColor = (status: CommunicationLog['status']) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication</h1>
          <p className="text-gray-600 mt-2">Send emails and SMS to your customers</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowEmailForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Mail className="h-5 w-5" />
            <span>Send Email</span>
          </button>
          <button
            onClick={() => setShowSmsForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Send SMS</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('email')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'email'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mail className="inline h-4 w-4 mr-2" />
              Email Communication
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="inline h-4 w-4 mr-2" />
              SMS Communication
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'email' ? (
            <div className="space-y-6">
              {/* Email Form */}
              {showEmailForm && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Send Email</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email subject..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email message..."
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowEmailForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendEmail}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Send Email</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Selection */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Select Customers</h3>
                    <button
                      onClick={handleSelectAllCustomers}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selectedCustomers.length === customers.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {customers.map((customer) => (
                      <label key={customer.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => handleCustomerSelection(customer.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.email}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SMS Form */}
              {showSmsForm && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Send SMS</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        value={smsMessage}
                        onChange={(e) => setSmsMessage(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your SMS message..."
                        maxLength={160}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {smsMessage.length}/160 characters
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowSmsForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendSMS}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Send SMS</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Selection for SMS */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Select Customers</h3>
                    <button
                      onClick={handleSelectAllCustomers}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selectedCustomers.length === customers.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {customers.map((customer) => (
                      <label key={customer.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => handleCustomerSelection(customer.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.phone}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Communication Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Communication History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject/Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {communicationLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {log.type === 'email' ? (
                        <Mail className="h-5 w-5 text-blue-600" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-green-600" />
                      )}
                      <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                        {log.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.recipient}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {log.subject && <div className="font-medium">{log.subject}</div>}
                      <div className="text-gray-500 truncate max-w-xs">
                        {log.message}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {communicationLogs.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No communication history</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start communicating with your customers by sending emails or SMS.
            </p>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
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
        toastStyle={{
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500'
        }}
      />
    </div>
  )
}

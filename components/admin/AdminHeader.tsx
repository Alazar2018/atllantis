'use client'

import { useState, useEffect } from 'react'
import { User, LogOut, Bell, Settings, Search, Menu, X, Check, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface AdminHeaderProps {
  onMobileMenuToggle?: () => void
}

interface Notification {
  id: number
  type: 'order' | 'low_stock' | 'webhook_test'
  title: string
  message: string
  data: any
  is_read: boolean
  created_at: string
}

export default function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const router = useRouter()

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications-api/unread-count', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true)
      const response = await fetch('/api/notifications-api?limit=5', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications-api/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, is_read: true }
              : notification
          )
        )
        fetchUnreadCount()
        toast.success('Notification marked as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications-api/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(notification => notification.id !== id))
        fetchUnreadCount()
        toast.success('Notification deleted')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const handleNotificationClick = () => {
    setShowNotificationDropdown(!showNotificationDropdown)
    if (!showNotificationDropdown && notifications.length === 0) {
      // Only fetch if we don't have notifications and dropdown is opening
      setTimeout(() => {
        fetchNotifications()
      }, 300)
    }
  }

  useEffect(() => {
    // Initial fetch with delay to prevent rate limiting
    const timeout = setTimeout(() => {
      fetchUnreadCount()
    }, 1000)
    
    // Disable auto-refresh for development to prevent rate limiting
    // const interval = setInterval(fetchUnreadCount, 60000)
    // return () => clearInterval(interval)
    
    return () => clearTimeout(timeout)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotificationDropdown) {
        const target = event.target as Element
        if (!target.closest('.notification-dropdown')) {
          setShowNotificationDropdown(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotificationDropdown])

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      router.push('/admin/login')
    }
  }

  const handleUserIconClick = () => {
    const accessToken = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')
    
    if (!accessToken || !user) {
      router.push('/admin/login')
      return
    }
    setShowProfileMenu(!showProfileMenu)
  }

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Atlantic Leather Management</p>
              </div>
            </div>
          </div>
          
          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              />
            </div>
          </div>
          
          {/* Right Side */}
          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                setShowMobileMenu(!showMobileMenu)
                onMobileMenuToggle?.()
              }}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Notifications Dropdown */}
            <div className="relative notification-dropdown">
              <button 
                onClick={handleNotificationClick}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-200 group"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      <Link 
                        href="/admin/notifications-list"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        onClick={() => setShowNotificationDropdown(false)}
                      >
                        See all
                      </Link>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            !notification.is_read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-lg">
                                  {notification.type === 'order' ? '🛒' : 
                                   notification.type === 'low_stock' ? '⚠️' : '🔗'}
                                </span>
                                <h4 className={`text-sm font-medium ${
                                  notification.is_read ? 'text-gray-700' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </h4>
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              <p className={`text-xs ${
                                notification.is_read ? 'text-gray-600' : 'text-gray-800'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.is_read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Settings */}
            <Link 
              href="/admin/settings" 
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-200"
            >
              <Settings className="h-5 w-5" />
            </Link>
            
            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={handleUserIconClick}
                className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-white/50 rounded-xl transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="hidden md:block font-medium">
                  {(() => {
                    try {
                      const user = localStorage.getItem('user')
                      return user ? JSON.parse(user).username : 'Admin'
                    } catch {
                      return 'Admin'
                    }
                  })()}
                </span>
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 py-2 z-50">
                  <div className="px-4 py-2 border-b border-white/20">
                    <p className="text-sm font-medium text-gray-800">
                      {(() => {
                        try {
                          const user = localStorage.getItem('user')
                          return user ? JSON.parse(user).username : 'Admin'
                        } catch {
                          return 'Admin'
                        }
                      })()}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <Link
                    href="/admin/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/50 transition-colors"
                  >
                    <User className="inline h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/50 transition-colors"
                  >
                    <Settings className="inline h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="inline h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {showMobileMenu && (
          <div className="md:hidden mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              />
            </div>
          </div>
        )}
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </header>
  )
}

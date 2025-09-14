'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  FolderOpen,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
  Bell,
  User,
  Webhook
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home, color: 'from-blue-500 to-blue-600' },
  { name: 'Products', href: '/admin/products', icon: Package, color: 'from-green-500 to-green-600' },
  { name: 'Categories', href: '/admin/categories', icon: FolderOpen, color: 'from-purple-500 to-purple-600' },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, color: 'from-orange-500 to-orange-600' },
  { name: 'Customers', href: '/admin/customers', icon: Users, color: 'from-pink-500 to-pink-600' },
  { name: 'Communication', href: '/admin/communication', icon: MessageSquare, color: 'from-indigo-500 to-indigo-600' },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3, color: 'from-teal-500 to-teal-600' },
  { name: 'Profile', href: '/admin/profile', icon: User, color: 'from-cyan-500 to-cyan-600' },
  { name: 'Notification Settings', href: '/admin/settings/notifications', icon: Bell, color: 'from-red-500 to-red-600' },
  // { name: 'Webhooks', href: '/admin/settings/webhooks', icon: Webhook, color: 'from-purple-500 to-purple-600' },
  { name: 'Settings', href: '/admin/settings', icon: Settings, color: 'from-gray-500 to-gray-600' },
]

interface AdminSidebarProps {
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

export default function AdminSidebar({ mobileOpen, setMobileOpen }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`bg-white/80 backdrop-blur-lg shadow-xl border-r border-white/20 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } ${
        mobileOpen ? 'fixed inset-y-0 left-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'
      }`}>
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Admin</h2>
                <p className="text-xs text-gray-500">Atlantic Leather</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-200"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Desktop Toggle Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-200"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                collapsed 
                  ? 'justify-center' 
                  : 'justify-start'
              } ${
                isActive
                  ? 'bg-green-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-900 hover:shadow-md hover:scale-102'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <div className={`p-2 rounded-lg ${
                isActive 
                  ? 'bg-white/20' 
                  : 'bg-gray-100 group-hover:bg-white/70'
              }`}>
                <item.icon className={`h-5 w-5 ${
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
              </div>
              {!collapsed && (
                <span className="ml-3 font-medium transition-opacity duration-200">{item.name}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4">
        {!collapsed ? (
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-3 border border-white/20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 font-medium">System Online</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="System Online"></div>
          </div>
        )}
      </div>
      </div>
    </>
  )
}

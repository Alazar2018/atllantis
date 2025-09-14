'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  DollarSign,
  Eye,
  Plus,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { ReportData } from '@/lib/adminApi'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { fetchWithAuth } from '@/lib/authUtils'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  totalRevenue: number
  currentBalance: number
  totalEarned: number
  totalWithdrawn: number
  pendingOrders: number
  confirmedOrders: number
  soldOrders: number
  recentOrders: any[]
  lowStockProducts: any[]
  recentTransactions: any[]
}

export default function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    currentBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    soldOrders: 0,
    recentOrders: [],
    lowStockProducts: [],
    recentTransactions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetchWithAuth('/api/admin/reports')
      
      if (response.ok) {
        const data = await response.json()
        const reportData = data.data || data
        
        setStats({
          totalProducts: reportData.totalProducts || 0,
          totalOrders: reportData.totalOrders || 0,
          totalCustomers: reportData.totalCustomers || 0,
          totalRevenue: reportData.totalSales || 0,
          currentBalance: reportData.currentBalance || 0,
          totalEarned: reportData.totalEarned || 0,
          totalWithdrawn: reportData.totalWithdrawn || 0,
          pendingOrders: reportData.pendingOrders || 0,
          confirmedOrders: reportData.confirmedOrders || 0,
          soldOrders: reportData.soldOrders || 0,
          recentOrders: reportData.recentOrders || [],
          lowStockProducts: reportData.lowStockProducts || [],
          recentTransactions: reportData.recentTransactions || []
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading Dashboard...</p>
          <p className="mt-2 text-gray-400 text-sm">Fetching your business insights</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Welcome to your Atlantic Leather admin panel</p>
        <div className="flex items-center justify-center mt-4 space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Live Data</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Total Products</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Total Orders</p>
              <p className="text-3xl font-bold text-green-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700">Total Customers</p>
              <p className="text-3xl font-bold text-purple-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl shadow-lg border border-yellow-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-700">Current Balance</p>
              <p className="text-3xl font-bold text-yellow-900">ETB {stats.currentBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl shadow-lg border border-red-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-700">Total Revenue</p>
              <p className="text-3xl font-bold text-red-900">ETB {stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmedOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sold Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.soldOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/products/new" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Product</h3>
              <p className="text-gray-600">Create a new product listing</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/orders" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">View Orders</h3>
              <p className="text-gray-600">Manage customer orders</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/communication" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Communication</h3>
              <p className="text-gray-600">Send emails and SMS</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Balance Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Earned:</span>
              <span className="font-semibold text-green-600">ETB {stats.totalEarned.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Withdrawn:</span>
              <span className="font-semibold text-red-600">ETB {stats.totalWithdrawn.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-gray-900 font-semibold">Current Balance:</span>
              <span className="text-xl font-bold text-blue-600">ETB {stats.currentBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {stats.recentTransactions.length > 0 ? (
              stats.recentTransactions.map((transaction, index) => (
                <div key={index} className="flex justify-between items-center text-sm py-1">
                  <div>
                    <span className="font-medium text-gray-700">{transaction.type}</span>
                    <p className="text-xs text-gray-500">
                      {transaction.description}
                      {transaction.orderId && ` (Order #${transaction.orderId})`}
                    </p>
                  </div>
                  <span className={`font-semibold ${
                    transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ETB {transaction.amount.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent transactions</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="p-6">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{order.customer}</p>
                    <p className="text-sm text-gray-600">Order #{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">ETB {order.amount}</p>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
            <Link href="/admin/orders" className="block text-center text-blue-600 hover:text-blue-800 mt-4">
              View all orders
            </Link>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
          </div>
          <div className="p-6">
            {stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{product.title}</p>
                    <p className="text-sm text-gray-600">Product #{product.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      {product.stock_quantity} left
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No low stock alerts</p>
            )}
            <Link href="/admin/products" className="block text-center text-blue-600 hover:text-blue-800 mt-4">
              Manage products
            </Link>
          </div>
        </div>
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

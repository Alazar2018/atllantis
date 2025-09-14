// Types for admin dashboard
export interface Category {
  id: number
  name: string
  description: string
  slug: string
  image_url: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  title: string
  description: string
  price: number
  original_price: number
  is_on_sale: boolean
  sale_price: number | null
  stock_quantity: number
  active: boolean
  is_featured: boolean
  category_id: number
  category_name: string
  created_at: string
  updated_at: string
  // Additional properties for detailed view
  images?: ProductImage[]
  colors?: ProductColor[]
  sizes?: ProductSize[]
  features?: ProductFeature[]
}

export interface ProductImage {
  id: number
  product_id: number
  image_url: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface ProductColor {
  id: number
  product_id: number
  color_name: string
  color_code: string | null
  active: boolean
  created_at: string
}

export interface ProductSize {
  id: number
  product_id: number
  size_name: string
  active: boolean
  created_at: string
}

export interface ProductFeature {
  id: number
  product_id: number
  feature_name: string
  feature_value: string | null
  active: boolean
  created_at: string
}

export interface Order {
  id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  total_amount: number
  status: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  total_orders: number
  total_spent: number
  last_order_date: string
  created_at: string
}

export interface ReportData {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  currentBalance: number
  totalEarned: number
  totalWithdrawn: number
  pendingOrders: number
  confirmedOrders: number
  soldOrders: number
  monthlySales: { month: string; amount: number }[]
  topProducts: { name: string; sales: number }[]
  recentOrders: { id: number; customer: string; amount: number; date: string; status: string }[]
  lowStockProducts: { id: number; title: string; stock_quantity: number; price: number }[]
  recentTransactions: { type: string; amount: number; description: string; date: string; orderId: number | null }[]
}

// Server-side API functions
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/categories`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories')
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/products`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/orders`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders')
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export async function getReportData(): Promise<ReportData> {
  try {
    const response = await fetchWithAuth(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/reports`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch report data')
    }
    
    const data = await response.json()
    return data.data || {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      currentBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      soldOrders: 0,
      monthlySales: [],
      topProducts: [],
      recentOrders: [],
      lowStockProducts: [],
      recentTransactions: []
    }
  } catch (error) {
    console.error('Error fetching report data:', error)
    throw error
  }
}

import { fetchWithAuth } from './authUtils'

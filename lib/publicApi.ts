import axios, { AxiosInstance } from 'axios'

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/public'
const PRIVATE_API_KEY = process.env.NEXT_PUBLIC_PRIVATE_API_KEY || 'atl_public_key_2024_secure_12345'

// Validate API key
if (!PRIVATE_API_KEY || PRIVATE_API_KEY === 'your_private_api_key_here') {
  console.error('⚠️ Invalid API key configuration. Please set NEXT_PUBLIC_PRIVATE_API_KEY in your environment variables.')
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface Product {
  id: number
  title: string
  description: string
  price: number
  original_price: number
  is_on_sale: boolean
  sale_price: number
  stock_quantity: number
  active: boolean
  is_featured: boolean
  category_name: string
  category_id: number
  images: string[]
  colors: Array<{ color_name: string; color_code: string }>
  sizes: string[]
  features: Array<{ feature_name: string; feature_value: string }>
}

interface Category {
  id: number
  name: string
  description: string
  image_url: string
}

interface OrderItem {
  productId: number
  quantity: number
  price: number
  options?: {
    size?: string
    color?: string
  }
}

interface OrderData {
  customerName: string
  customerEmail: string
  customerPhone: string
  items: OrderItem[]
  totalAmount: number
  notes?: string
}

class PublicApiClient {
  private axiosInstance: AxiosInstance
  private readonly FINAL_BASE_URL = 'http://localhost:3001/api/public'

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.FINAL_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': PRIVATE_API_KEY,
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection
      },
    })

    // Add request interceptor for security
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add CSRF token if available
        if (typeof document !== 'undefined') {
          const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrf-token='))
            ?.split('=')[1]
          
          if (csrfToken) {
            config.headers['x-csrf-token'] = csrfToken
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Don't expose sensitive error information
        if (error.response?.status >= 500) {
          error.message = 'Internal server error'
        }
        return Promise.reject(error)
      }
    )
  }

  // Get all products
  async getProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await this.axiosInstance.get('/products')
      
      // Handle both response formats (admin and public)
      if (response.data.data) {
        // Public route format: { success: true, data: [...] }
        return {
          success: true,
          data: response.data.data.map((product: any) => {
            return {
              ...product,
              price: parseFloat(product.price) || 0,
              original_price: parseFloat(product.original_price) || 0,
              sale_price: product.sale_price ? parseFloat(product.sale_price) : 0,
              stock_quantity: parseInt(product.stock_quantity) || 0,
              is_on_sale: Boolean(product.is_on_sale),
              active: Boolean(product.active),
              is_featured: Boolean(product.is_featured),
              images: (product.images || []).map((img: string) => 
                img.startsWith('http') ? img : `http://localhost:3001${img}`
              ),
              colors: product.colors || [],
              sizes: product.sizes || [],
              features: product.features || []
            };
          })
        }
      } else if (response.data.products) {
        // Admin route format: { error: false, products: [...] }
        return {
          success: true,
          data: response.data.products.map((product: any) => {
            return {
              ...product,
              price: parseFloat(product.price) || 0,
              original_price: parseFloat(product.original_price) || 0,
              sale_price: product.sale_price ? parseFloat(product.sale_price) : 0,
              stock_quantity: parseInt(product.stock_quantity) || 0,
              is_on_sale: Boolean(product.is_on_sale),
              active: Boolean(product.active),
              is_featured: Boolean(product.is_featured),
              images: (product.images || []).map((img: string) => 
                img.startsWith('http') ? img : `http://localhost:3001${img}`
              ),
              colors: product.colors || [],
              sizes: product.sizes || [],
              features: product.features || []
            };
          })
        }
      } else {
        return {
          success: false,
          error: 'Invalid response format'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch products'
      }
    }
  }

  // Get single product by ID
  async getProduct(id: number): Promise<ApiResponse<Product>> {
    try {
      const response = await this.axiosInstance.get(`/products/${id}`)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch product'
      }
    }
  }

  // Get all categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await this.axiosInstance.get('/categories')
      
      // Handle both response formats (admin and public)
      if (response.data.data) {
        // Public route format: { success: true, data: [...] }
        return {
          success: true,
          data: response.data.data
        }
      } else if (response.data.categories) {
        // Admin route format: { error: false, categories: [...] }
        return {
          success: true,
          data: response.data.categories
        }
      } else {
        return {
          success: false,
          error: 'Invalid response format'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch categories'
      }
    }
  }

  // Submit order
  async submitOrder(orderData: OrderData): Promise<ApiResponse<{ orderId: number }>> {
    try {
      const response = await this.axiosInstance.post('/orders', orderData)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit order'
      }
    }
  }
}

export const publicApiClient = new PublicApiClient()
export type { Product, Category, OrderItem, OrderData, ApiResponse }

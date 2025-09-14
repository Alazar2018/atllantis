import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface User {
  id: number
  username: string
  email: string
  role: string
}

class ApiClient {
  private axiosInstance: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (reason?: any) => void
  }> = []

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, add to queue
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            })
              .then(() => {
                return this.axiosInstance(originalRequest)
              })
              .catch((err) => {
                return Promise.reject(err)
              })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const refreshToken = this.getRefreshToken()
            if (!refreshToken) {
              this.logout()
              return Promise.reject(error)
            }

            const response = await this.refreshAccessToken(refreshToken)
            const { accessToken, refreshToken: newRefreshToken } = response.data

            this.setTokens(accessToken, newRefreshToken)

            // Retry queued requests
            this.failedQueue.forEach(({ resolve }) => {
              resolve()
            })
            this.failedQueue = []

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return this.axiosInstance(originalRequest)
          } catch (refreshError) {
            // Refresh failed, logout user
            this.logout()
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private async refreshAccessToken(refreshToken: string): Promise<AxiosResponse<AuthTokens>> {
    return this.axiosInstance.post('/auth/refresh', { refreshToken })
  }

  // Authentication methods
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    try {
      const response = await this.axiosInstance.post('/auth/login', credentials)
      const { data } = response.data

      if (data.accessToken && data.refreshToken) {
        this.setTokens(data.accessToken, data.refreshToken)
        this.setUser(data.user)
      }

      return {
        success: true,
        data: {
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      }
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getAccessToken()
      if (token) {
        await this.axiosInstance.post('/auth/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearTokens()
      this.clearUser()
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.axiosInstance.get('/auth/profile')
      return {
        success: true,
        data: response.data.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get profile'
      }
    }
  }

  // Products methods
  async getProducts(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    status?: string
  }): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.axiosInstance.get('/products', { params })
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch products'
      }
    }
  }

  async getProduct(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.get(`/products/${id}`)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch product'
      }
    }
  }

  async createProduct(productData: FormData): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.post('/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create product'
      }
    }
  }

  async updateProduct(id: number, productData: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.put(`/products/${id}`, productData)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update product'
      }
    }
  }

  async deleteProduct(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.delete(`/products/${id}`)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete product'
      }
    }
  }

  // Categories methods
  async getCategories(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.axiosInstance.get('/categories')
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch categories'
      }
    }
  }

  // Orders methods
  async getOrders(params?: {
    page?: number
    limit?: number
    status?: string
    paymentStatus?: string
    search?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.axiosInstance.get('/orders', { params })
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch orders'
      }
    }
  }

  async getOrder(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.get(`/orders/${id}`)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch order'
      }
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.put(`/orders/${id}/status`, { status })
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update order status'
      }
    }
  }

  // Communication methods
  async sendEmail(data: {
    recipients: string[]
    subject: string
    message: string
    type: 'order-confirmation' | 'order-update' | 'custom'
  }): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.post('/communication/email/order-confirmation', data)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send email'
      }
    }
  }

  async sendSMS(data: {
    recipients: string[]
    message: string
  }): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.post('/communication/sms/send', data)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send SMS'
      }
    }
  }

  // Utility methods
  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken')
    }
    return null
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken')
    }
    return null
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  private setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }

  private clearUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  // Get axios instance for custom requests
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }
}

export const apiClient = new ApiClient()

// Frontend order submission (for customer cart)
export async function submitOrder(orderData: {
  customerName: string
  customerEmail: string
  customerPhone: string
  items: Array<{
    productId: number
    quantity: number
    options?: {
      size?: string
      color?: string
    }
  }>
  totalAmount: number
  notes?: string
}): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.getAxiosInstance().post('/orders', orderData)
    return {
      success: true,
      data: response.data.data || response.data
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to submit order'
    }
  }
}

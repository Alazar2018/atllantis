import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

// Input validation utilities
export class InputValidator {
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return ''
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 1000) // Limit length
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  static validatePrice(price: number): boolean {
    return typeof price === 'number' && price >= 0 && price <= 999999
  }

  static validateQuantity(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity > 0 && quantity <= 100
  }

  static validateId(id: number): boolean {
    return Number.isInteger(id) && id > 0
  }
}

// Rate limiting for client-side
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly maxRequests = 10
  private readonly windowMs = 60000 // 1 minute

  isAllowed(key: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // Remove old requests
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(key, validRequests)
    return true
  }
}

const rateLimiter = new RateLimiter()

// Secure API client
export class SecureApiClient {
  private axiosInstance: AxiosInstance
  private readonly baseURL: string
  private readonly apiKey: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/public'
    this.apiKey = process.env.NEXT_PUBLIC_PRIVATE_API_KEY || ''
    
    if (!this.apiKey || this.apiKey === 'your_private_api_key_here') {
      throw new Error('Invalid API key configuration')
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection
      },
    })

    // Request interceptor for validation
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Rate limiting
        const clientId = this.getClientId()
        if (!rateLimiter.isAllowed(clientId)) {
          throw new Error('Rate limit exceeded. Please try again later.')
        }

        // Validate request data
        if (config.data) {
          config.data = this.sanitizeRequestData(config.data)
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
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

  private getClientId(): string {
    // Use a combination of factors for client identification
    if (typeof window !== 'undefined') {
      return `${window.location.hostname}-${Date.now()}`
    }
    return 'server-side'
  }

  private sanitizeRequestData(data: any): any {
    if (typeof data === 'string') {
      return InputValidator.sanitizeString(data)
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeRequestData(item))
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        const sanitizedKey = InputValidator.sanitizeString(key)
        sanitized[sanitizedKey] = this.sanitizeRequestData(value)
      }
      return sanitized
    }
    
    return data
  }

  // Secure product fetching
  async getProducts(): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/products')
      return this.validateProductResponse(response.data)
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch products')
    }
  }

  // Secure product fetching by ID
  async getProduct(id: number): Promise<any> {
    if (!InputValidator.validateId(id)) {
      throw new Error('Invalid product ID')
    }

    try {
      const response = await this.axiosInstance.get(`/products/${id}`)
      return this.validateProductResponse(response.data)
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch product')
    }
  }

  // Secure categories fetching
  async getCategories(): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/categories')
      return this.validateCategoryResponse(response.data)
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch categories')
    }
  }

  // Secure order submission
  async submitOrder(orderData: any): Promise<any> {
    // Validate order data
    if (!this.validateOrderData(orderData)) {
      throw new Error('Invalid order data')
    }

    try {
      const response = await this.axiosInstance.post('/orders', orderData)
      return response.data
    } catch (error: any) {
      throw new Error(error.message || 'Failed to submit order')
    }
  }

  private validateProductResponse(data: any): any {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid product response format')
    }

    // Validate and sanitize product data
    if (data.data && Array.isArray(data.data)) {
      data.data = data.data.map((product: any) => this.sanitizeProduct(product))
    }

    return data
  }

  private validateCategoryResponse(data: any): any {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid category response format')
    }

    // Validate and sanitize category data
    if (data.data && Array.isArray(data.data)) {
      data.data = data.data.map((category: any) => this.sanitizeCategory(category))
    }

    return data
  }

  private validateOrderData(orderData: any): boolean {
    if (!orderData || typeof orderData !== 'object') {
      return false
    }

    // Validate required fields
    if (!orderData.customerName || !orderData.customerEmail || !orderData.customerPhone) {
      return false
    }

    // Validate email
    if (!InputValidator.validateEmail(orderData.customerEmail)) {
      return false
    }

    // Validate phone
    if (!InputValidator.validatePhone(orderData.customerPhone)) {
      return false
    }

    // Validate items
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return false
    }

    // Validate each item
    for (const item of orderData.items) {
      if (!InputValidator.validateId(item.productId) || 
          !InputValidator.validateQuantity(item.quantity) ||
          !InputValidator.validatePrice(item.price)) {
        return false
      }
    }

    return true
  }

  private sanitizeProduct(product: any): any {
    return {
      ...product,
      title: InputValidator.sanitizeString(product.title || ''),
      description: InputValidator.sanitizeString(product.description || ''),
      price: InputValidator.validatePrice(product.price) ? product.price : 0,
      original_price: InputValidator.validatePrice(product.original_price) ? product.original_price : 0,
      stock_quantity: InputValidator.validateQuantity(product.stock_quantity) ? product.stock_quantity : 0,
      images: Array.isArray(product.images) ? product.images.filter((img: string) => 
        typeof img === 'string' && img.length > 0
      ) : [],
    }
  }

  private sanitizeCategory(category: any): any {
    return {
      ...category,
      name: InputValidator.sanitizeString(category.name || ''),
      description: InputValidator.sanitizeString(category.description || ''),
    }
  }
}

// Export singleton instance
export const secureApiClient = new SecureApiClient()

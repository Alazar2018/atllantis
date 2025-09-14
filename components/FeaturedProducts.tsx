'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'react-toastify'
import { formatPrice } from '@/lib/utils'

interface Product {
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
  category_name: string
  category_id: number
  images: string[]
  colors: Array<{ color_name: string; color_code: string | null }>
  sizes: string[]
  features: Array<{ feature_name: string; feature_value: string | null }>
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()

  const fetchFeaturedProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      }
      const response = await fetch('/api/featured-products')
      const data = await response.json()
      
      if (data.success) {
        // Transform the data to handle string numbers and integer booleans
        const transformedProducts = data.data.map((product: any) => ({
          ...product,
          price: Number(product.price),
          original_price: Number(product.original_price),
          sale_price: product.sale_price ? Number(product.sale_price) : null,
          stock_quantity: Number(product.stock_quantity),
          is_on_sale: Boolean(product.is_on_sale),
          active: Boolean(product.active),
          is_featured: Boolean(product.is_featured),
          images: (product.images || []).map((img: string) => 
            img.startsWith('http') ? img : `http://localhost:3001${img}`
          ),
          colors: Array.isArray(product.colors) ? product.colors : [],
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          features: Array.isArray(product.features) ? product.features : []
        }))
        
        // Filter to ensure only featured products are displayed
        const featuredProducts = transformedProducts.filter((product: Product) => product.is_featured === true)
        
        setProducts(featuredProducts)
      } else {
        setError(data.message || 'Failed to fetch featured products')
      }
    } catch (err) {
      setError('Failed to fetch featured products')
    } finally {
      setLoading(false)
      if (isRefresh) {
        setRefreshing(false)
      }
    }
  }

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  // Refresh featured products when window gains focus (e.g., when returning from admin panel)
  useEffect(() => {
    const handleFocus = () => {
      fetchFeaturedProducts()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const handleAddToCart = (product: Product) => {
    // Check if product has multiple sizes/colors
    if (product.sizes.length > 1 || product.colors.length > 1) {
      toast.info('Please select size and color options on the product page')
      return
    }

    const cartItem = {
      id: product.id,
      name: product.title,
      price: product.price,
      originalPrice: product.original_price,
      image: product.images[0] || '/placeholder-product.jpg',
      category: product.category_name,
      quantity: 1,
      size: product.sizes[0] || 'Standard',
      color: product.colors[0]?.color_name || 'Default',
      material: 'Leather'
    }
    
    try {
      addItem(cartItem)
      toast.success(`${product.title} added to cart!`)
    } catch (error) {
      toast.error('Failed to add item to cart')
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Discover our handpicked leather goods</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Featured Products</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">No Featured Products Yet</h3>
            <p className="text-yellow-600">Check back soon for our featured leather goods!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Products</h2>
          <p className="text-sm text-gray-600">Discover our handpicked leather goods</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <Link href={`/products/${product.id}`} className="block">
                <div className="relative h-32 bg-gray-200">
                  <Image
                    src={product.images[0] || '/placeholder-product.jpg'}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {product.is_on_sale && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      SALE
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    FEATURED
                  </div>
                </div>
              </Link>
              
              <div className="p-4">
                <div className="mb-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">{product.category_name}</span>
                </div>
                
                <Link href={`/products/${product.id}`} className="block">
                  <h3 className="text-base font-semibold text-gray-900 mb-1 hover:text-atlantic-primary transition-colors">
                    {product.title}
                  </h3>
                </Link>
                
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    {product.is_on_sale && product.original_price && (
                      <span className="text-gray-400 line-through text-xs">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 bg-gray-900 text-white py-1 px-3 rounded text-center hover:bg-gray-800 transition-colors text-sm"
                  >
                    View Details
                  </Link>
                  
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-atlantic-primary text-white p-1 rounded hover:bg-atlantic-primary/90 transition-colors"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            View All Products
            <svg className="ml-1 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

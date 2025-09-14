'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { publicApiClient, Product } from '@/lib/publicApi'
import { Heart, ShoppingCart, Star, Check, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Dialog from '@/components/ui/Dialog'

export default function ProductDetailPage() {
  const params = useParams()
  const productId = parseInt(params.id as string)
  const { addItem, isInCart } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [showValidationDialog, setShowValidationDialog] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  
  // Debug Dialog state
  useEffect(() => {
    console.log('Dialog state changed:', { showValidationDialog, validationMessage })
  }, [showValidationDialog, validationMessage])
  const [activeTab, setActiveTab] = useState('description')
  const [orderAdded, setOrderAdded] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('ProductDetailPage - Fetching product:', productId)
        const response = await publicApiClient.getProduct(productId)
        
        if (response.success && response.data) {
          console.log('ProductDetailPage - Product data:', response.data)
          setProduct(response.data)
        } else {
          setError('Failed to fetch product')
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Failed to fetch product')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!product?.images || product.images.length <= 1) return
      
      if (e.key === 'ArrowLeft') {
        setSelectedImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [product?.images])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-atlantic-primary mx-auto mb-4"></div>
          <p className="text-leather-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-leather-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-leather-600 text-6xl">!</span>
          </div>
          <h3 className="text-2xl font-semibold text-leather-900 mb-3">Product Not Found</h3>
          <p className="text-leather-600 mb-6">{error || 'The product you\'re looking for doesn\'t exist.'}</p>
          <Link href="/products" className="atlantic-button">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const sizes = product.sizes || []
  const colors = product.colors || []

  const handleAddToCart = () => {
    if (!selectedSize && sizes.length > 1) {
      setValidationMessage('Please select a size to add to cart.')
      setShowValidationDialog(true)
      return
    }
    if (!selectedColor && colors.length > 1) {
      setValidationMessage('Please select a color to add to cart.')
      setShowValidationDialog(true)
      return
    }

    // Add to cart logic here
    if (product) {
      addItem({
        id: product.id,
        name: product.title,
        price: Number(product.price),
        originalPrice: product.original_price ? Number(product.original_price) : undefined,
        image: product.images[0] || '/placeholder-product.jpg',
        category: product.category_name,
        quantity: quantity,
        size: selectedSize || product.sizes[0],
        color: selectedColor || product.colors[0]?.color_name,
        material: 'Leather'
      })
      
      toast.success(`${product.title} added to cart!`)
      setOrderAdded(true)
      setTimeout(() => setOrderAdded(false), 3000)
    }
  }

  const isProductInCart = isInCart(
    product.id, 
    selectedSize || (sizes.length === 1 ? sizes[0] : undefined),
    selectedColor || (colors.length === 1 ? (typeof colors[0] === 'string' ? colors[0] : colors[0]?.color_name) : undefined)
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-leather-50 border-b border-leather-200">
        <div className="container-custom py-4">
          <nav className="flex items-center space-x-2 text-sm text-leather-600">
            <Link href="/" className="hover:text-atlantic-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-atlantic-primary transition-colors">Products</Link>
            <span>/</span>
            <span className="text-leather-900">{product.title}</span>
          </nav>
        </div>
      </div>

              <div className="container-custom py-8">
          <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images - Enhanced Gallery */}
          <div className="space-y-8 slide-in-left">
            {/* Main Image Container */}
            <div className="relative group">
              {/* Main Image with Enhanced Styling */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-leather-50 to-leather-100 p-2">
                <div className="w-full h-[400px] md:h-[450px] bg-gradient-to-br from-leather-50 to-white rounded-2xl flex items-center justify-center overflow-hidden relative">
                <Image
                    src={product.images[selectedImageIndex] || '/placeholder-product.jpg'}
                  alt={product.title}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover transition-all duration-500 ease-out transform group-hover:scale-105"
                    key={selectedImageIndex}
                    priority
                  />
                  
                  {/* Image Overlay Effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <span className="text-sm font-semibold text-leather-800">
                      {product.category_name}
                    </span>
                  </div>
                  
                  {/* Sale Badge */}
                  {product.is_on_sale && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full px-4 py-2 shadow-lg animate-pulse">
                      <span className="text-sm font-bold">SALE</span>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Navigation Arrows */}
                {product.images && product.images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={() => setSelectedImageIndex(prev => 
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )}
                      className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl backdrop-blur-sm border border-white/20"
                      aria-label="Previous image"
                    >
                      <ArrowLeft className="w-6 h-6 text-leather-700" />
                    </button>
                    
                    {/* Next Button */}
                    <button
                      onClick={() => setSelectedImageIndex(prev => 
                        prev === product.images.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl backdrop-blur-sm border border-white/20"
                      aria-label="Next image"
                    >
                      <ArrowLeft className="w-6 h-6 text-leather-700 rotate-180" />
                    </button>
                    
                    {/* Enhanced Image Counter */}
                    <div className="absolute bottom-6 right-6 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-xl border border-white/20">
                      <span className="mr-2">📸</span>
                      {selectedImageIndex + 1} / {product.images.length}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Enhanced Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-leather-800 text-center">Product Gallery</h3>
                <div className="grid grid-cols-5 gap-3">
                  {product.images.map((image, index) => (
                    <div 
                      key={index} 
                      onClick={() => setSelectedImageIndex(index)}
                      className={`group relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        selectedImageIndex === index 
                          ? 'ring-4 ring-atlantic-primary ring-offset-2 scale-105' 
                          : 'hover:ring-2 hover:ring-atlantic-primary/50'
                      }`}
                    >
                      {/* Thumbnail Container */}
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-leather-50 to-white p-1 shadow-lg">
                        <div className="w-full h-20 bg-gradient-to-br from-leather-100 to-white rounded-lg flex items-center justify-center overflow-hidden">
                      <Image
                        src={image}
                        alt={`${product.title} view ${index + 1}`}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                          />
                        </div>
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                        
                        {/* Selection Indicator */}
                        {selectedImageIndex === index && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-atlantic-primary rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Image Number Badge */}
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-leather-800 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                  </div>
              </div>
            )}
          </div>

          {/* Product Info - Enhanced Design */}
          <div className="space-y-8 slide-in-right">
            {/* Enhanced Header Section */}
            <div className="space-y-6">
              {/* Category and Badges */}
              <div className="flex items-center space-x-3 flex-wrap">
                <span className="text-sm text-leather-600 uppercase tracking-wider bg-gradient-to-r from-leather-50 to-leather-100 px-4 py-2 rounded-full border border-leather-200 font-medium">
                  {product.category_name}
                </span>
                {product.is_on_sale && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm px-4 py-2 rounded-full font-bold shadow-lg animate-pulse">
                    🔥 SALE
                  </span>
                )}
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-4 py-2 rounded-full font-bold shadow-lg">
                  ✨ Premium Quality
                </span>
              </div>
              
              {/* Product Title */}
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-leather-800 via-leather-700 to-leather-600 bg-clip-text text-transparent leading-tight">
                {product.title}
              </h1>
              
              {/* Stock Status */}
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-leather-600 font-medium">
                  In Stock ({product.stock_quantity} available)
                </span>
              </div>
              
              {/* Enhanced Pricing */}
              <div className="space-y-2">
                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-atlantic-primary to-purple-600 bg-clip-text text-transparent">
                    ETB {product.price}
                  </span>
                {product.original_price > product.price && (
                    <span className="text-lg text-leather-400 line-through font-medium">
                      ETB {product.original_price}
                    </span>
                )}
                </div>
                
                {product.is_on_sale && product.original_price > product.price && (
                  <div className="flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                    -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </span>
                    <span className="text-leather-600 text-sm font-medium">
                      Save ETB {product.original_price - product.price}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Enhanced Description */}
              <div className="bg-gradient-to-r from-leather-50 to-white p-4 rounded-xl border border-leather-100">
                <p className="text-leather-700 leading-relaxed text-sm">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Compact Product Options - All in One Row */}
            <div className="bg-gradient-to-r from-leather-50 to-white p-4 rounded-xl border border-leather-100">
              <div className="flex items-center justify-between space-x-4">
              {/* Size Selection */}
              {sizes.length > 0 && (
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-leather-600 mb-2 uppercase tracking-wide">
                      Size
                    </label>
                    <div className="flex space-x-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                          className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                          selectedSize === size
                              ? 'border-atlantic-primary bg-atlantic-primary text-white shadow-md'
                              : 'border-leather-200 text-leather-700 hover:border-atlantic-primary/50 hover:bg-leather-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {colors.length > 0 && (
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-leather-600 mb-2 uppercase tracking-wide">
                      Color
                    </label>
                    <div className="flex space-x-2">
                    {colors.map((color) => (
                      <button
                        key={color.color_name}
                        onClick={() => setSelectedColor(color.color_name)}
                          className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                          selectedColor === color.color_name
                              ? 'border-atlantic-primary bg-atlantic-primary text-white shadow-md'
                              : 'border-leather-200 text-leather-700 hover:border-atlantic-primary/50 hover:bg-leather-50'
                        }`}
                      >
                        {color.color_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-leather-600 mb-2 uppercase tracking-wide">
                    Qty
                  </label>
                  <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 border-2 border-leather-200 rounded-lg flex items-center justify-center hover:bg-leather-100 hover:border-atlantic-primary/50 transition-all duration-200"
                  >
                      <span className="text-lg font-bold text-leather-600">−</span>
                  </button>
                    <span className="w-12 text-center font-bold text-lg text-leather-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 border-2 border-leather-200 rounded-lg flex items-center justify-center hover:bg-leather-100 hover:border-atlantic-primary/50 transition-all duration-200"
                  >
                      <span className="text-lg font-bold text-leather-600">+</span>
                  </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-6">
              {/* Main Action Button */}
              {orderAdded ? (
                <div className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-6 px-6 rounded-2xl font-bold text-center flex items-center justify-center space-x-3 shadow-xl transform scale-105 transition-all duration-300">
                  <Check className="w-8 h-8" />
                  <span className="text-xl">Order Added to Cart! 🎉</span>
                </div>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  disabled={isProductInCart}
                  className={`w-full py-6 px-6 rounded-2xl font-bold text-xl flex items-center justify-center space-x-4 transition-all duration-300 transform hover:scale-105 ${
                    isProductInCart
                      ? 'bg-leather-200 text-leather-500 cursor-not-allowed shadow-lg'
                      : 'bg-gradient-to-r from-atlantic-primary via-purple-600 to-pink-500 text-white shadow-2xl hover:shadow-3xl'
                  }`}
                >
                  <ShoppingCart className="w-8 h-8" />
                  <span>{isProductInCart ? 'Already in Cart' : '🚀 Place Order Now'}</span>
                </button>
              )}
              
              {/* Secondary Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button className="w-full bg-gradient-to-r from-leather-50 to-leather-100 hover:from-leather-100 hover:to-leather-200 text-leather-800 py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 border-2 border-leather-200 hover:border-leather-300 shadow-lg">
                  <Heart className="w-6 h-6" />
                  <span>Add to Wishlist</span>
                </button>
                <Link href="/cart" className="w-full bg-gradient-to-r from-leather-50 to-leather-100 hover:from-leather-100 hover:to-leather-200 text-leather-800 py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 border-2 border-leather-200 hover:border-leather-300 shadow-lg">
                  <ShoppingCart className="w-6 h-6" />
                  <span>View Cart</span>
                </Link>
              </div>
              
              {/* Enhanced Order Information */}
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl font-bold">💳</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-leather-800 mb-2">Order-Only System</h4>
                    <p className="text-leather-700 leading-relaxed">
                      Place your order and we'll contact you to arrange payment and delivery. 
                      <span className="font-semibold text-orange-600"> No upfront payment required!</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Features Section */}
            {product.features && product.features.length > 0 && (
              <div className="bg-gradient-to-br from-leather-50 via-white to-leather-50 rounded-xl p-4 border-2 border-leather-100 shadow-md">
                <h3 className="font-bold text-leather-900 mb-4 text-lg flex items-center">
                  <span className="mr-2">⭐</span>
                  Key Features & Specifications
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-leather-100 hover:border-atlantic-primary/30 transition-all duration-300 hover:shadow-sm">
                      <div className="w-6 h-6 bg-gradient-to-r from-atlantic-primary to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-sm text-leather-800">{feature.feature_name}</span>
                        <span className="text-leather-600 ml-2 text-sm">: {feature.feature_value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Product Details Tabs */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-leather-50 to-white rounded-xl p-2 border border-leather-100 shadow-md">
            <nav className="flex space-x-2">
              {['description', 'care', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-xs capitalize transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-atlantic-primary to-purple-600 text-white shadow-md transform scale-105'
                      : 'text-leather-600 hover:text-leather-800 hover:bg-leather-100'
                  }`}
                >
                  {tab === 'description' && '📝 Description'}
                  {tab === 'care' && '🧴 Care Instructions'}
                  {tab === 'shipping' && '🚚 Shipping & Returns'}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-6">
            {activeTab === 'description' && (
              <div className="bg-gradient-to-br from-leather-50 to-white rounded-xl p-4 border border-leather-100 shadow-md">
                <h3 className="text-lg font-bold text-leather-900 mb-3 flex items-center">
                  <span className="mr-2">📖</span>
                  Product Description
                </h3>
              <div className="prose max-w-none">
                  <p className="text-leather-700 leading-relaxed text-sm">{product.description}</p>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-leather-50 to-white rounded-xl p-4 border border-leather-100 shadow-md hover:shadow-lg transition-all duration-300">
                  <h4 className="font-bold text-leather-900 mb-3 text-base flex items-center">
                    <span className="mr-2">🧴</span>
                    Daily Care
                  </h4>
                  <ul className="space-y-2 text-leather-700 text-sm">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-atlantic-primary rounded-full"></div>
                      <span>Wipe with a soft, dry cloth</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-atlantic-primary rounded-full"></div>
                      <span>Avoid exposure to direct sunlight</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-atlantic-primary rounded-full"></div>
                      <span>Keep away from heat sources</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-atlantic-primary rounded-full"></div>
                      <span>Store in a cool, dry place</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-leather-50 to-white rounded-xl p-4 border border-leather-100 shadow-md hover:shadow-lg transition-all duration-300">
                  <h4 className="font-bold text-leather-900 mb-3 text-base flex items-center">
                    <span className="mr-2">✨</span>
                    Deep Cleaning
                  </h4>
                  <ul className="space-y-2 text-leather-700 text-sm">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-atlantic-primary rounded-full"></div>
                      <span>Use leather conditioner monthly</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-atlantic-primary rounded-full"></div>
                      <span>Apply leather cleaner for stains</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-atlantic-primary rounded-full"></div>
                      <span>Polish with leather polish</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-atlantic-primary rounded-full"></div>
                      <span>Allow to dry completely</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-leather-50 to-white rounded-xl p-4 border border-leather-100 shadow-md hover:shadow-lg transition-all duration-300">
                    <h4 className="font-bold text-leather-900 mb-3 text-base flex items-center">
                      <span className="mr-2">🚚</span>
                      Shipping Information
                    </h4>
                    <div className="space-y-2 text-leather-700 text-sm">
                      <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-leather-100">
                        <span className="font-medium">Standard:</span>
                        <span className="text-atlantic-primary font-bold text-xs">5-7 business days</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-leather-100">
                        <span className="font-medium">Express:</span>
                        <span className="text-atlantic-primary font-bold text-xs">2-3 business days</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-leather-100">
                        <span className="font-medium">International:</span>
                        <span className="text-atlantic-primary font-bold text-xs">10-15 business days</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-green-100 rounded-lg border border-green-200">
                        <span className="font-medium text-green-800 text-xs">Free shipping</span>
                        <span className="text-green-600 font-bold text-xs">Orders over ETB 1000</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-leather-50 to-white rounded-xl p-4 border border-leather-100 shadow-md hover:shadow-lg transition-all duration-300">
                    <h4 className="font-bold text-leather-900 mb-3 text-base flex items-center">
                      <span className="mr-2">🔄</span>
                      Returns & Exchanges
                    </h4>
                    <div className="space-y-2 text-leather-700 text-sm">
                      <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-leather-100">
                        <span className="font-medium">Return window:</span>
                        <span className="text-atlantic-primary font-bold text-xs">30 days</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-leather-100">
                        <span className="font-medium">Condition:</span>
                        <span className="text-atlantic-primary font-bold text-xs">Must be unworn</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-leather-100">
                        <span className="font-medium">Return shipping:</span>
                        <span className="text-atlantic-primary font-bold text-xs">Customer pays</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-leather-100">
                        <span className="font-medium">Refund time:</span>
                        <span className="text-atlantic-primary font-bold text-xs">5-7 business days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Toast Notifications */}
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
          toastStyle={{
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        />

        {/* Validation Dialog */}
        <Dialog
          isOpen={showValidationDialog}
          onClose={() => setShowValidationDialog(false)}
          title="Validation Error"
          message={validationMessage}
          type="error"
          confirmText="OK"
          showCancel={false}
        />
      </div>
    </div>
  )
}

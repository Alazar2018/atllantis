'use client'

import { useState, useEffect } from 'react'
import { Star, Heart, ShoppingCart, Filter, Grid, List, Search, Award, Globe, Users, Check, X } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { publicApiClient, Product, Category } from '@/lib/publicApi'
import Link from 'next/link'
import Image from 'next/image'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Dialog from '@/components/ui/Dialog'

export default function ProductsPage() {
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set())

  // Dialog states for size/color selection
  const [showOptionsDialog, setShowOptionsDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const [productsResponse, categoriesResponse] = await Promise.all([
          publicApiClient.getProducts(),
          publicApiClient.getCategories()
        ])
        
        if (productsResponse.success && categoriesResponse.success) {
          setProducts(productsResponse.data || [])
          setCategories(categoriesResponse.data || [])
        } else {
          setError('Failed to fetch data')
        }
      } catch (err) {
        setError('Failed to fetch data')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Filter and sort products
  useEffect(() => {
    // If no products yet, don't filter
    if (products.length === 0) {
      setFilteredProducts([])
      return
    }
    
    let filtered = products
    
    // Filter by featured status when sortBy is 'featured'
    if (sortBy === 'featured') {
      filtered = filtered.filter(product => product.is_featured === true)
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category_name.toLowerCase() === selectedCategory.toLowerCase()
      )
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered = filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered = filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        // Sort by ID (assuming higher ID = newer)
        filtered = filtered.sort((a: Product, b: Product) => b.id - a.id)
        break
      case 'featured':
        // Keep featured products in original order
        break
      default:
        // Default - keep original order
        break
    }

    setFilteredProducts(filtered)
  }, [selectedCategory, searchQuery, sortBy, products])

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product)
    setSelectedSize('')
    setSelectedColor('')
    setShowOptionsDialog(true)
  }


  const confirmAddToCart = () => {
    if (!selectedProduct) return

    // Validate size and color selection
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }

    if (!selectedColor) {
      toast.error('Please select a color')
      return
    }

    addItem({
      id: selectedProduct.id,
      name: selectedProduct.title,
      price: Number(selectedProduct.price),
      originalPrice: selectedProduct.original_price ? Number(selectedProduct.original_price) : undefined,
      image: selectedProduct.images[0] || '/placeholder-product.jpg',
      category: selectedProduct.category_name,
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
      material: 'Leather' // Default material for leather products
    })
    
    toast.success(`${selectedProduct.title} added to cart!`)
    
    setAddedItems(prev => new Set(prev).add(selectedProduct.id))
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(selectedProduct.id)
        return newSet
      })
    }, 3000)

    // Reset and close dialog
    setShowOptionsDialog(false)
    setSelectedProduct(null)
    setSelectedSize('')
    setSelectedColor('')
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/products/${product.id}`} className="block">
      <div className="bg-white rounded-2xl shadow-lg border border-leather-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group flex flex-col h-full cursor-pointer">
        {/* Product Image with Ethiopian Cultural Elements */}
        <div className="relative overflow-hidden bg-gradient-to-br from-leather-50 to-amber-50 flex-shrink-0">
          <div className="aspect-square relative">
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.title}
              width={400}
              height={400}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Ethiopian Cultural Badge */}
            <div className="absolute top-3 left-3 bg-gradient-to-r from-atlantic-primary to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
              <span>Ethiopian</span>
            </div>
            
            {/* Product Badges */}
            {product.is_on_sale && (
              <div className="absolute top-3 right-3 bg-atlantic-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                Sale
              </div>
            )}
            
            {/* Quick Actions */}
            <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <button className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110">
                <Heart className="w-5 h-5 text-leather-600 hover:text-atlantic-primary transition-colors" />
              </button>
            </div>
            
            {/* Leather Texture Indicator */}
            <div className="absolute bottom-3 left-3 flex space-x-1">
              <div className="w-2 h-2 bg-gradient-to-r from-leather-400 to-leather-500 rounded-full"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-leather-500 to-leather-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-leather-600 to-leather-700 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-4 flex-grow">
            {/* Category */}
            <div className="mb-3">
              <span className="inline-block bg-gradient-to-r from-leather-100 to-amber-100 text-leather-700 text-xs font-medium px-3 py-1 rounded-full border border-leather-200">
                {product.category_name}
              </span>
            </div>
            
            {/* Product Name */}
            <h3 className="text-lg font-semibold text-leather-900 mb-2 line-clamp-2 group-hover:text-atlantic-primary transition-colors">
              {product.title}
            </h3>
            
            {/* Description */}
            <p className="text-leather-600 text-sm mb-4 line-clamp-2">
              {product.description}
            </p>
            
            {/* Stock Status */}
            <div className="mb-4">
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                product.stock_quantity > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-atlantic-primary">
                  ETB {product.price}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-lg text-leather-400 line-through">
                    ETB {product.original_price}
                  </span>
                )}
              </div>
            </div>
            
            {/* Action Buttons - Simplified and Spaced */}
            <div className="space-y-3">
              {addedItems.has(product.id) ? (
                <div className="w-full bg-green-100 text-green-800 py-3 px-4 rounded-lg font-medium text-center flex items-center justify-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span>Added to Cart!</span>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevent navigation when clicking the button
                    e.stopPropagation(); // Stop event bubbling
                    handleAddToCart(product);
                  }}
                  className="w-full bg-gradient-to-r from-atlantic-primary to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 group/btn"
                >
                  <span>Place Order</span>
                  <ShoppingCart className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              )}
              
              <button 
                onClick={(e) => {
                  e.preventDefault(); // Prevent navigation when clicking the button
                }}
                className="w-full bg-gradient-to-r from-leather-100 to-amber-100 text-leather-700 py-3 px-4 rounded-lg font-medium hover:from-leather-200 hover:to-amber-200 transition-all duration-200 flex items-center justify-center space-x-2 border border-leather-200"
              >
                <Heart className="w-5 h-5" />
                <span>Add to Wishlist</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )

  const ProductCardList = ({ product }: { product: Product }) => (
    <Link href={`/products/${product.id}`} className="block">
      <div className="bg-white rounded-2xl shadow-lg border border-leather-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group flex h-full cursor-pointer">
        {/* Product Image */}
        <div className="w-40 h-40 bg-gradient-to-br from-leather-50 to-amber-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <Image
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.title}
            width={160}
            height={160}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="flex-grow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="mb-2">
                  <span className="inline-block bg-gradient-to-r from-leather-100 to-amber-100 text-leather-700 text-xs font-medium px-3 py-1 rounded-full border border-leather-200">
                    {product.category_name}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-leather-900 mb-2 group-hover:text-atlantic-primary transition-colors">
                  {product.title}
                </h3>
                <p className="text-leather-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                {/* Stock Status */}
                <div className="mb-3">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    product.stock_quantity > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
              
              {/* Price */}
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-atlantic-primary mb-1">
                  ETB {product.price}
                </div>
                {product.original_price && product.original_price > product.price && (
                  <div className="text-leather-500 line-through">
                    ETB {product.original_price}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            {addedItems.has(product.id) ? (
              <div className="flex-1 bg-green-100 text-green-800 py-3 px-4 rounded-lg font-medium text-center flex items-center justify-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Added to Cart!</span>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault(); // Prevent navigation when clicking the button
                  handleAddToCart(product);
                }}
                className="flex-1 bg-gradient-to-r from-atlantic-primary to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Place Order</span>
                <ShoppingCart className="w-5 h-5" />
              </button>
            )}
            
            <button 
              onClick={(e) => {
                e.preventDefault(); // Prevent navigation when clicking the button
              }}
              className="bg-gradient-to-r from-leather-100 to-amber-100 text-leather-700 py-3 px-4 rounded-lg font-medium hover:from-leather-200 hover:to-amber-200 transition-all duration-200 border border-leather-200"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-leather-50 via-amber-50 to-purple-50 py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-atlantic-primary/5 to-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-accent-gold/5 to-orange-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="text-center">
            {/* Ethiopian Cultural Badge */}
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-leather-50 to-amber-50 text-leather-700 px-6 py-3 rounded-full text-sm font-medium mb-6 border border-leather-200/50">
              <div className="w-2 h-2 bg-gradient-to-r from-atlantic-primary to-purple-600 rounded-full pulse-glow"></div>
              <span>Ethiopian Heritage</span>
              <div className="w-2 h-2 bg-gradient-to-r from-accent-gold to-orange-500 rounded-full pulse-glow" style={{animationDelay: '1s'}}></div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-leather-900 mb-6">
              Premium <span className="text-atlantic-primary">Leather</span> Collection
            </h1>
            {/* Cultural Stats */}
            <div className="flex items-center justify-center space-x-8 text-sm text-leather-600">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-accent-gold" />
                <span>18+ Years Experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-atlantic-primary" />
                <span>Ethiopian Made</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-atlantic-secondary" />
                <span>Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Order System Notice */}
       
        {/* Search and Filters */}
        <div className="bg-gradient-to-r from-leather-50 to-amber-50 rounded-2xl p-6 mb-8 border border-leather-200/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-leather-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-leather-200 rounded-lg focus:ring-2 focus:ring-atlantic-primary focus:border-transparent bg-white"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-leather-200 rounded-lg focus:ring-2 focus:ring-atlantic-primary focus:border-transparent bg-white"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High (ETB)</option>
              <option value="price-high">Price: High to Low (ETB)</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-leather-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-atlantic-primary text-white'
                    : 'bg-white text-leather-600 hover:bg-leather-50'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-atlantic-primary text-white'
                    : 'bg-white text-leather-600 hover:bg-leather-50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content with Filters on Left */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Category Filter */}
              <div className="bg-white rounded-2xl shadow-lg border border-leather-200 p-6">
                <h3 className="font-semibold text-leather-900 mb-4 flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-atlantic-primary" />
                  <span>Categories ({categories.length})</span>
                </h3>
                <div className="space-y-3">
                  <button
                    key="all"
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-atlantic-primary to-purple-600 text-white shadow-lg'
                        : 'text-leather-700 hover:bg-gradient-to-r hover:from-leather-50 hover:to-amber-50 hover:shadow-md'
                    }`}
                  >
                    <span className="flex justify-between items-center">
                      All Categories
                      <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
                        {products.length}
                      </span>
                    </span>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                        selectedCategory === category.name
                          ? 'bg-gradient-to-r from-atlantic-primary to-purple-600 text-white shadow-lg'
                          : 'text-leather-700 hover:bg-gradient-to-r hover:from-leather-50 hover:to-amber-50 hover:shadow-md'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{category.name}</span>
                        <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
                          {products.filter(p => p.category_name === category.name).length}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>



              {/* Ethiopian Heritage Info */}
              <div className="bg-gradient-to-br from-leather-50 to-amber-50 rounded-2xl border border-leather-200 p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-atlantic-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  </div>
                  <h4 className="text-lg font-semibold text-leather-900">Ethiopian Heritage</h4>
                </div>
                <p className="text-leather-700 text-sm text-center leading-relaxed">
                  Each product carries the spirit of Ethiopian craftsmanship, blending traditional techniques with modern excellence.
                </p>
              </div>

              {/* Quality Assurance */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-leather-200 p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-accent-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-leather-900">Quality Assured</h4>
                </div>
                <div className="space-y-2 text-sm text-leather-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent-gold rounded-full"></div>
                    <span>Premium Materials</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent-gold rounded-full"></div>
                    <span>Handcrafted</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent-gold rounded-full"></div>
                    <span>18+ Years Experience</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Area */}
          <div className="lg:col-span-4">
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-atlantic-primary mx-auto mb-4"></div>
                <p className="text-leather-600">Loading products...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">!</span>
                </div>
                <h3 className="text-lg font-semibold text-leather-900 mb-2">Error Loading Products</h3>
                <p className="text-leather-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-atlantic-primary text-white px-6 py-2 rounded-lg hover:bg-atlantic-secondary transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Results Count */}
            {!isLoading && !error && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-leather-600">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              
                {/* Ethiopian Cultural Stats */}
                <div className="flex items-center space-x-6 text-sm text-leather-600">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-accent-gold" />
                    <span>18+ Years</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-atlantic-primary" />
                    <span>Ethiopian Made</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-atlantic-secondary" />
                    <span>Premium Quality</span>
                  </div>
                </div>
              </div>
            )}

                        {/* Products Grid/List */}
            {!isLoading && !error && (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredProducts.map((product) => (
                      <ProductCardList key={product.id} product={product} />
                    ))}
                  </div>
                )}

                {/* No Results */}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-r from-leather-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-12 h-12 text-leather-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-leather-900 mb-2">No products found</h3>
                    <p className="text-leather-600 mb-6">Try adjusting your search or filter criteria</p>
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCategory('all')
                        setSortBy('featured')
                      }}
                      className="bg-gradient-to-r from-atlantic-primary to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
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

      {/* Size/Color Selection Dialog */}
      {showOptionsDialog && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowOptionsDialog(false)}
          />
          
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-leather-900">
                Select Options for {selectedProduct.title}
              </h3>
              <button
                onClick={() => setShowOptionsDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Size Selection */}
              <div>
                <h4 className="text-lg font-semibold text-leather-900 mb-3">Select Size</h4>
                <div className="space-y-2">
                  {selectedProduct.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-full px-4 py-3 rounded-lg text-left transition-all duration-300 transform hover:scale-105 ${
                        selectedSize === size
                          ? 'bg-gradient-to-r from-atlantic-primary to-purple-600 text-white shadow-lg'
                          : 'text-leather-700 hover:bg-gradient-to-r hover:from-leather-50 hover:to-amber-50 hover:shadow-md'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <h4 className="text-lg font-semibold text-leather-900 mb-3">Select Color</h4>
                <div className="space-y-2">
                  {selectedProduct.colors.map((color) => (
                    <button
                      key={color.color_name}
                      onClick={() => setSelectedColor(color.color_name)}
                      className={`w-full px-4 py-3 rounded-lg text-left transition-all duration-300 transform hover:scale-105 ${
                        selectedColor === color.color_name
                          ? 'bg-gradient-to-r from-atlantic-primary to-purple-600 text-white shadow-lg'
                          : 'text-leather-700 hover:bg-gradient-to-r hover:from-leather-50 hover:to-amber-50 hover:shadow-md'
                      }`}
                    >
                      {color.color_name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowOptionsDialog(false)}
                className="bg-leather-100 text-leather-700 py-3 px-6 rounded-lg font-medium hover:bg-leather-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddToCart}
                disabled={!selectedSize || !selectedColor}
                className="bg-gradient-to-r from-atlantic-primary to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

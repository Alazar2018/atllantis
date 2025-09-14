'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import { Category } from '@/lib/adminApi'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface ProductFormData {
  title: string
  description: string
  price: number
  original_price: number
  is_on_sale: boolean
  sale_price: number
  stock_quantity: number
  category_id: number
  active: boolean
  images: string[]
  colors: string[]
  sizes: string[]
  features: string[]
  is_featured: boolean
}

export default function NewProductClient() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    original_price: 0,
    is_on_sale: false,
    sale_price: 0,
    stock_quantity: 0,
    category_id: 0,
    active: true,
    images: [],
    colors: [],
    sizes: [],
    features: [],
    is_featured: false
  })

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [newColor, setNewColor] = useState('')
  const [newSize, setNewSize] = useState('')
  const [newFeature, setNewFeature] = useState('')
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
        if (data.data && data.data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: data.data[0].id }))
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null) // Clear previous errors

    // Client-side validation
    if (!formData.title.trim()) {
      setError('Product title is required')
      setLoading(false)
      return
    }
    if (!formData.description.trim()) {
      setError('Product description is required')
      setLoading(false)
      return
    }
    if (formData.price <= 0) {
      setError('Product price must be greater than 0')
      setLoading(false)
      return
    }
    if (formData.category_id === 0) {
      setError('Please select a category')
      setLoading(false)
      return
    }
    if (formData.stock_quantity < 0) {
      setError('Stock quantity cannot be negative')
      setLoading(false)
      return
    }
    if (formData.is_on_sale && formData.sale_price > 0 && formData.original_price > 0 && formData.sale_price >= formData.original_price) {
      setError('Sale price must be less than original price')
      setLoading(false)
      return
    }
    if (formData.is_on_sale && formData.sale_price <= 0) {
      setError('Sale price must be greater than 0 when product is on sale')
      setLoading(false)
      return
    }
    if (selectedFiles.length === 0) {
      setError('At least one product image is required')
      setLoading(false)
      return
    }

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      
      // Add product data
      Object.keys(formData).forEach(key => {
        if (key === 'images') return // Skip images, we'll handle files separately
        if (key === 'colors' || key === 'sizes' || key === 'features') {
          formDataToSend.append(key, JSON.stringify(formData[key as keyof ProductFormData]))
        } else {
          formDataToSend.append(key, String(formData[key as keyof ProductFormData]))
        }
      })
      
      // Add primary image index
      formDataToSend.append('primary_image_index', String(primaryImageIndex))
      
      // Add image files
      selectedFiles.forEach((file, index) => {
        formDataToSend.append('images', file)
      })

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formDataToSend
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin/products')
        }, 1500)
      } else {
        const error = await response.json()
        setError(error.message || 'Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      setError('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index)
      // Adjust primary image index if needed
      if (newFiles.length > 0 && primaryImageIndex >= newFiles.length) {
        setPrimaryImageIndex(newFiles.length - 1)
      } else if (newFiles.length === 0) {
        setPrimaryImageIndex(0)
      }
      return newFiles
    })
  }

  const setPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev]
      const [movedFile] = newFiles.splice(fromIndex, 1)
      newFiles.splice(toIndex, 0, movedFile)
      
      // Adjust primary image index
      if (primaryImageIndex === fromIndex) {
        setPrimaryImageIndex(toIndex)
      } else if (primaryImageIndex > fromIndex && primaryImageIndex <= toIndex) {
        setPrimaryImageIndex(primaryImageIndex - 1)
      } else if (primaryImageIndex < fromIndex && primaryImageIndex >= toIndex) {
        setPrimaryImageIndex(primaryImageIndex + 1)
      }
      
      return newFiles
    })
  }

  const addColor = () => {
    if (newColor.trim()) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, newColor.trim()] }))
      setNewColor('')
    }
  }

  const removeColor = (index: number) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }))
  }

  const addSize = () => {
    if (newSize.trim()) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, newSize.trim()] }))
      setNewSize('')
    }
  }

  const removeSize = (index: number) => {
    setFormData(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }))
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }))
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600 mt-1">Create a new product listing</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                <X className="h-6 w-6" />
              </button>
            </span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Product created successfully!</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <button onClick={() => setSuccess(false)} className="text-green-700 hover:text-green-900">
                <X className="h-6 w-6" />
              </button>
            </span>
          </div>
        )}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Price (ETB) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (ETB)</label>
              <input
                type="number"
                step="0.01"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (ETB)</label>
              <input
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={!formData.is_on_sale}
              />
              {!formData.is_on_sale && (
                <p className="text-sm text-gray-500 mt-1">Enable "Product is on sale" to set sale price</p>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_on_sale}
                  onChange={(e) => setFormData({ ...formData, is_on_sale: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Product is on sale</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Product is active</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Featured on home page</span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Variants */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Variants</h2>
          <p className="text-sm text-gray-600 mb-4">Add colors, sizes, and features to help customers find the right product variant.</p>
          
          {/* Colors */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Colors</h3>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                placeholder="Add color (e.g., Red, Blue)"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addColor}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            {formData.colors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.colors.map((color, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sizes */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Sizes</h3>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                placeholder="Add size (e.g., S, M, L, XL)"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addSize}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            {formData.sizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.sizes.map((size, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Features</h3>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                placeholder="Add feature (e.g., Waterproof, Durable)"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Images *</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload product images (JPEG, PNG, WebP). The first image will be the primary/intro image. 
            You can reorder images by dragging them or click "Set as Primary" to make any image the main one.
          </p>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-4">
                {/* Primary Image Display */}
                {selectedFiles.length > 0 && (
                  <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Primary Image (will be shown first)</h4>
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(selectedFiles[primaryImageIndex])}
                        alt="Primary product image"
                        className="w-full h-32 object-cover rounded-lg border border-blue-200"
                      />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Primary
                      </div>
                    </div>
                  </div>
                )}

                {/* All Images Grid */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">All Images ({selectedFiles.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Product image ${index + 1}`}
                          className={`w-full h-24 object-cover rounded-lg border-2 transition-all ${
                            index === primaryImageIndex 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        />
                        
                        {/* Primary indicator */}
                        {index === primaryImageIndex && (
                          <div className="absolute top-1 left-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                            Primary
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {index !== primaryImageIndex && (
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(index)}
                              className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                              title="Set as Primary"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            title="Remove Image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {/* Reorder buttons */}
                        <div className="absolute bottom-1 left-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index - 1)}
                              className="p-1 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                              title="Move Left"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                          {index < selectedFiles.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index + 1)}
                              className="p-1 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                              title="Move Right"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Creating...' : 'Create Product'}</span>
          </button>
        </div>
      </form>
      
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
